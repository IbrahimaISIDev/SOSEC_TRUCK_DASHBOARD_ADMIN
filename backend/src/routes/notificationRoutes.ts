// src/routes/notificationRoutes.ts
import { Router, Request } from 'express';
import { authenticateToken, authorizeAdminOrDriver } from '../middleware/auth';
import NotificationModel from '../models/notification';
import Utilisateur from '../models/utilisateur';
import logger from '../utils/logger';
import { Op } from 'sequelize';
import { checkExpirations } from '../services/notificationService';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface User {
      id: number;
      role: string;
      // add other properties if needed
    }
    interface Request {
      user?: User;
    }
  }
}

const router = Router();

// Get all notifications (admins see all, drivers see only theirs)
router.get('/notifications', authenticateToken, authorizeAdminOrDriver, async (req, res) => {
  try {
    const user = req.user; // User attached by authenticateToken middleware
    let notifications;

    if (user && user.role === 'admin') {
      // Admins see all notifications
      notifications = await NotificationModel.findAll({
        include: [{ model: Utilisateur, as: 'utilisateur' }],
        order: [['createdAt', 'DESC']],
      });
    } else if (user) {
      // Drivers see only their own notifications
      notifications = await NotificationModel.findAll({
        where: { utilisateurId: user.id },
        include: [{ model: Utilisateur, as: 'utilisateur' }],
        order: [['createdAt', 'DESC']],
      });
    } else {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }

    res.status(200).json(notifications);
  } catch (error: any) {
    logger.error(`Erreur lors de la récupération des notifications: ${error.message}`);
    res.status(500).json({ error: 'Erreur lors de la récupération des notifications.' });
  }
});

// Create a notification
router.post('/notifications', authenticateToken, authorizeAdminOrDriver, async (req, res) => {
  try {
    const notification = await NotificationModel.create(req.body);
    res.status(201).json(notification);
  } catch (error: any) {
    logger.error(`Erreur lors de la création de la notification: ${error.message}`);
    res.status(400).json({ error: 'Erreur lors de la création de la notification.' });
  }
});

// Mark a notification as read
router.put('/notifications/:id/read', authenticateToken, authorizeAdminOrDriver, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }

    // Drivers can only mark their own notifications as read
    const whereCondition = user.role === 'admin' ? { id } : { id, utilisateurId: user.id };

    const [updatedRows, [notification]] = await NotificationModel.update(
      { read: true },
      {
        where: whereCondition,
        returning: true,
      }
    );

    if (!updatedRows) {
      return res.status(404).json({ error: 'Notification non trouvée ou accès non autorisé.' });
    }

    res.json(notification);
  } catch (error: any) {
    logger.error(`Erreur lors de la mise à jour de la notification: ${error.message}`);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la notification.' });
  }
});

// Delete a notification
router.delete('/notifications/:id', authenticateToken, authorizeAdminOrDriver, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }

    // Drivers can only delete their own notifications
    const whereCondition = user.role === 'admin' ? { id } : { id, utilisateurId: user.id };

    const deletedRows = await NotificationModel.destroy({ where: whereCondition });

    if (!deletedRows) {
      return res.status(404).json({ error: 'Notification non trouvée ou accès non autorisé.' });
    }

    res.json({ message: 'Notification supprimée.' });
  } catch (error: any) {
    logger.error(`Erreur lors de la suppression de la notification: ${error.message}`);
    res.status(500).json({ error: 'Erreur lors de la suppression de la notification.' });
  }
});

// Manual check for license expirations
router.post('/notifications/check-expirations', authenticateToken, authorizeAdminOrDriver, async (req, res) => {
  try {
    await checkExpirations();
    res.status(200).json({ message: 'Vérification des expirations terminée.' });
  } catch (error: any) {
    logger.error(`Erreur lors de la vérification manuelle: ${error.message}`);
    res.status(500).json({ error: 'Erreur lors de la vérification des expirations.' });
  }
});

export default router;