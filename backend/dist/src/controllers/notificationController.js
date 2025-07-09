"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markAsRead = exports.createNotification = exports.getAllNotifications = void 0;
const utilisateur_1 = __importDefault(require("../models/utilisateur"));
const notification_1 = __importDefault(require("../models/notification"));
// Récupérer toutes les notifications
const getAllNotifications = async (req, res) => {
    try {
        const notifications = await notification_1.default.findAll({
            order: [['createdAt', 'DESC']],
            include: [{ model: utilisateur_1.default, as: 'utilisateur' }],
        });
        res.json(notifications);
    }
    catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des notifications.' });
    }
};
exports.getAllNotifications = getAllNotifications;
// Créer une notification
const createNotification = async (req, res) => {
    try {
        const notification = await notification_1.default.create(req.body);
        res.status(201).json(notification);
    }
    catch (error) {
        res.status(400).json({ error: 'Erreur lors de la création de la notification.' });
    }
};
exports.createNotification = createNotification;
// Marquer une notification comme lue
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const [updatedRows, [notification]] = await notification_1.default.update({ read: true }, { where: { id }, returning: true });
        if (!notification) {
            return res.status(404).json({ error: 'Notification non trouvée.' });
        }
        res.json(notification);
    }
    catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la notification.' });
    }
};
exports.markAsRead = markAsRead;
// Supprimer une notification
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRows = await notification_1.default.destroy({ where: { id } });
        if (!deletedRows) {
            return res.status(404).json({ error: 'Notification non trouvée.' });
        }
        res.json({ message: 'Notification supprimée.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression de la notification.' });
    }
};
exports.deleteNotification = deleteNotification;
