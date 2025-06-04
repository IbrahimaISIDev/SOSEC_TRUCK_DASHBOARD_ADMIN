import { Router } from 'express';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';
const Notification = require('../models/notification');
import Utilisateur from '../models/utilisateur';
import { Op } from 'sequelize';
const { db } = require('../config/firebase');
import logger from '../utils/logger';

const router = Router();

// Route existante pour récupérer les notifications
router.get('/notifications', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      include: [{ model: Utilisateur, as: 'utilisateur' }],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(notifications);
  } catch (error: any) {
    logger.error(`Erreur lors de la récupération des notifications: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Route temporaire pour déclencher la vérification des expirations
router.post('/notifications/check-expirations', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const NOTIFICATION_THRESHOLDS = [30, 21, 14, 7, 5, 3, 1];

    const getDaysUntilExpiration = (expirationDate: Date): number => {
      const today = new Date();
      const diffTime = expirationDate.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const sendNotification = async (utilisateur: Utilisateur, daysRemaining: number) => {
      const message = `Le permis de conduire de ${utilisateur.nom} expire dans ${daysRemaining} jour(s).`;
      try {
        const notification = await Notification.create({
          utilisateurId: utilisateur.id,
          message,
          type: 'permis_expiration',
          daysRemaining,
        });

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

    logger.info('Vérification manuelle des expirations des permis...');
    const chauffeurs = await Utilisateur.findAll({
      where: {
        role: 'driver',
        permisExpiration: { [Op.not]: null },
      },
    });

    for (const chauffeur of chauffeurs) {
      if (!chauffeur.permisExpiration) continue;
      const daysRemaining = getDaysUntilExpiration(chauffeur.permisExpiration);

      if (NOTIFICATION_THRESHOLDS.includes(daysRemaining)) {
        const existingNotification = await Notification.findOne({
          where: {
            utilisateurId: chauffeur.id,
            daysRemaining,
            type: 'permis_expiration',
          },
        });

        if (!existingNotification) {
          await sendNotification(chauffeur, daysRemaining);
          const admins = await Utilisateur.findAll({ where: { role: 'admin' } });
          for (const admin of admins) {
            await sendNotification(admin, daysRemaining);
          }
        }
      }
    }

    logger.info('Vérification manuelle terminée.');
    res.status(200).json({ message: 'Vérification des expirations terminée.' });
  } catch (error: any) {
    logger.error(`Erreur lors de la vérification manuelle: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

export default router;