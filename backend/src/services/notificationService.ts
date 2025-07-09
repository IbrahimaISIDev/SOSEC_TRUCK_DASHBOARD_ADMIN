import cron from 'node-cron';
import { Op } from 'sequelize';
import Utilisateur from '../models/utilisateur';
import NotificationModel from '../models/notification';
const { db } = require('../config/firebase');
import logger from '../utils/logger';
import { sendMail } from '../utils/mailer';

const NOTIFICATION_THRESHOLDS = [30, 21, 14, 7, 5, 3, 1];

export const getDaysUntilExpiration = (expirationDate: Date): number => {
  const today = new Date();
  const diffTime = expirationDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const sendNotification = async (utilisateur: any, daysRemaining: number) => {
  // Message personnalisé si permis déjà expiré
  const message =
    daysRemaining < 0
      ? `Le permis de conduire de ${utilisateur.nom} a expiré il y a ${-daysRemaining} jour(s).`
      : `Le permis de conduire de ${utilisateur.nom} expire dans ${daysRemaining} jour(s).`;
  try {
    const existingNotification = await NotificationModel.findOne({
      where: {
        utilisateurId: utilisateur.id,
        daysRemaining,
        type: 'permis_expiration',
      },
    });

    if (existingNotification) {
      logger.info(`Notification déjà existante pour ${utilisateur.nom} à ${daysRemaining} jours.`);
      return;
    }

    const notification = await NotificationModel.create({
      utilisateurId: utilisateur.id,
      message,
      type: 'permis_expiration',
      daysRemaining,
    });

    // Synchronisation Firebase
    await db.ref(`notifications/${notification.id}`).set({
      id: notification.id,
      utilisateurId: utilisateur.id,
      message,
      type: 'permis_expiration',
      daysRemaining,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString(),
    });

    // Envoi email
    if (utilisateur.email) {
      await sendMail(
        utilisateur.email,
        'Alerte expiration permis',
        message
      );
      logger.info(`Email envoyé à ${utilisateur.email} : ${message}`);
    } else {
      logger.warn(`Pas d'email pour l'utilisateur ${utilisateur.nom}`);
    }

    logger.info(`Notification envoyée pour ${utilisateur.nom}: ${message}`);
  } catch (error: any) {
    logger.error(`Erreur lors de l'envoi de la notification pour ${utilisateur.nom}: ${error.message}`);
  }
};

export const checkExpirations = async () => {
  try {
    logger.info('Vérification des expirations des permis en cours...');

    const chauffeurs = await Utilisateur.findAll({
      where: {
        role: 'driver',
        permisExpiration: { [Op.not]: null },
      },
    });

    for (const chauffeur of chauffeurs) {
      if (!chauffeur.permisExpiration) continue;

      const daysRemaining = getDaysUntilExpiration(new Date(chauffeur.permisExpiration));

      // Inclure aussi les permis déjà expirés
      if (NOTIFICATION_THRESHOLDS.includes(daysRemaining) || daysRemaining < 0) {
        await sendNotification(chauffeur, daysRemaining);

        const admins = await Utilisateur.findAll({
          where: { role: 'admin' },
        });
        for (const admin of admins) {
          await sendNotification(admin, daysRemaining);
        }
      }
    }

    logger.info('Vérification des expirations terminée.');
  } catch (error: any) {
    logger.error(`Erreur dans la tâche cron de vérification des permis: ${error.message}`);
  }
};

// Planification du cron toutes les 5 minutes
cron.schedule('*/5 * * * *', checkExpirations);