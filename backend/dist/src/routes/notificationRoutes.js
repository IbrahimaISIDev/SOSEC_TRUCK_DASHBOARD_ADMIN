"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Notification = require('../models/notification');
const utilisateur_1 = __importDefault(require("../models/utilisateur"));
const sequelize_1 = require("sequelize");
const { db } = require('../config/firebase');
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
// Route existante pour récupérer les notifications
router.get('/notifications', auth_1.authenticateToken, auth_1.authorizeAdmin, async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            include: [{ model: utilisateur_1.default, as: 'utilisateur' }],
            order: [['createdAt', 'DESC']],
        });
        res.status(200).json(notifications);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération des notifications: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});
// Route temporaire pour déclencher la vérification des expirations
router.post('/notifications/check-expirations', auth_1.authenticateToken, auth_1.authorizeAdmin, async (req, res) => {
    try {
        const NOTIFICATION_THRESHOLDS = [30, 21, 14, 7, 5, 3, 1];
        const getDaysUntilExpiration = (expirationDate) => {
            const today = new Date();
            const diffTime = expirationDate.getTime() - today.getTime();
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        };
        const sendNotification = async (utilisateur, daysRemaining) => {
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
                logger_1.default.info(`Notification envoyée pour ${utilisateur.nom}: ${message}`);
            }
            catch (error) {
                logger_1.default.error(`Erreur lors de l'envoi de la notification pour ${utilisateur.nom}: ${error.message}`);
            }
        };
        logger_1.default.info('Vérification manuelle des expirations des permis...');
        const chauffeurs = await utilisateur_1.default.findAll({
            where: {
                role: 'driver',
                permisExpiration: { [sequelize_1.Op.not]: null },
            },
        });
        for (const chauffeur of chauffeurs) {
            if (!chauffeur.permisExpiration)
                continue;
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
                    const admins = await utilisateur_1.default.findAll({ where: { role: 'admin' } });
                    for (const admin of admins) {
                        await sendNotification(admin, daysRemaining);
                    }
                }
            }
        }
        logger_1.default.info('Vérification manuelle terminée.');
        res.status(200).json({ message: 'Vérification des expirations terminée.' });
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la vérification manuelle: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
