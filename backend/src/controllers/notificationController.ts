import { Request, Response } from 'express';
import Utilisateur from '../models/utilisateur';
import NotificationModel from '../models/notification';

// Récupérer toutes les notifications
export const getAllNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await NotificationModel.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: Utilisateur, as: 'utilisateur' }],
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des notifications.' });
  }
};

// Créer une notification
export const createNotification = async (req: Request, res: Response) => {
  try {
    const notification = await NotificationModel.create(req.body);
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la création de la notification.' });
  }
};

// Marquer une notification comme lue
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [updatedRows, [notification]] = await NotificationModel.update(
      { read: true },
      { where: { id }, returning: true }
    );
    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée.' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la notification.' });
  }
};

// Supprimer une notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedRows = await NotificationModel.destroy({ where: { id } });
    if (!deletedRows) {
      return res.status(404).json({ error: 'Notification non trouvée.' });
    }
    res.json({ message: 'Notification supprimée.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de la notification.' });
  }
};