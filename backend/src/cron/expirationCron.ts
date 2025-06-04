import cron from 'node-cron';
import { Op } from 'sequelize';
import Utilisateur from '../models/utilisateur';
const { db } = require('../config/firebase');
import logger from '../utils/logger';
const Notification = require('../models/notification');

// Seuils pour les notifications (en jours)
const NOTIFICATION_THRESHOLDS = [30, 21, 14, 7, 5, 3, 1];

// Fonction pour calculer les jours restants jusqu'à l'expiration
const getDaysUntilExpiration = (expirationDate: Date): number => {
  const today = new Date();
  const diffTime = expirationDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Fonction pour envoyer une notification
const sendNotification = async (
  utilisateur: Utilisateur,
  daysRemaining: number
) => {
  const message = `Le permis de conduire de ${utilisateur.nom} expire dans ${daysRemaining} jour(s).`;
  try {
    // Vérifier si une notification existe déjà pour éviter les doublons
    const existingNotification = await Notification.findOne({
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

    // Créer la notification dans la base de données
    const notification = await Notification.create({
      utilisateurId: utilisateur.id,
      message,
      type: 'permis_expiration',
      daysRemaining,
    });

    // Synchroniser avec Firebase
    await db.ref(`notifications/${notification.id}`).set({
      id: notification.id,
      utilisateurId: utilisateur.id,
      message,
      type: 'permis_expiration',
      daysRemaining,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString(),
    });

    logger.info(`Notification envoyée pour ${utilisateur.nom}: ${message}`);
  } catch (error: any) {
    logger.error(
      `Erreur lors de l'envoi de la notification pour ${utilisateur.nom}: ${error.message}`
    );
  }
};

// Tâche cron pour vérifier les expirations toutes les 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    logger.info('Vérification des expirations des permis en cours...');

    // Récupérer tous les chauffeurs avec un permisExpiration non nul
    const chauffeurs = await Utilisateur.findAll({
      where: {
        role: 'driver',
        permisExpiration: {
          [Op.not]: null,
        },
      },
    });

    for (const chauffeur of chauffeurs) {
      if (!chauffeur.permisExpiration) continue;

      const daysRemaining = getDaysUntilExpiration(chauffeur.permisExpiration);

      // Vérifier si le nombre de jours restants correspond à un seuil
      if (NOTIFICATION_THRESHOLDS.includes(daysRemaining)) {
        await sendNotification(chauffeur, daysRemaining);

        // Notifier les administrateurs
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
});