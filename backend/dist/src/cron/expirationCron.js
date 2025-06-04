"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const sequelize_1 = require("sequelize");
const utilisateur_1 = __importDefault(require("../models/utilisateur"));
const { db } = require('../config/firebase');
const logger_1 = __importDefault(require("../utils/logger"));
const Notification = require('../models/notification');
// Seuils pour les notifications (en jours)
const NOTIFICATION_THRESHOLDS = [30, 21, 14, 7, 5, 3, 1];
// Fonction pour calculer les jours restants jusqu'à l'expiration
const getDaysUntilExpiration = (expirationDate) => {
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
// Fonction pour envoyer une notification
const sendNotification = async (utilisateur, daysRemaining) => {
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
            logger_1.default.info(`Notification déjà existante pour ${utilisateur.nom} à ${daysRemaining} jours.`);
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
        logger_1.default.info(`Notification envoyée pour ${utilisateur.nom}: ${message}`);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de l'envoi de la notification pour ${utilisateur.nom}: ${error.message}`);
    }
};
// Tâche cron pour vérifier les expirations toutes les 5 minutes
node_cron_1.default.schedule('*/5 * * * *', async () => {
    try {
        logger_1.default.info('Vérification des expirations des permis en cours...');
        // Récupérer tous les chauffeurs avec un permisExpiration non nul
        const chauffeurs = await utilisateur_1.default.findAll({
            where: {
                role: 'driver',
                permisExpiration: {
                    [sequelize_1.Op.not]: null,
                },
            },
        });
        for (const chauffeur of chauffeurs) {
            if (!chauffeur.permisExpiration)
                continue;
            const daysRemaining = getDaysUntilExpiration(chauffeur.permisExpiration);
            // Vérifier si le nombre de jours restants correspond à un seuil
            if (NOTIFICATION_THRESHOLDS.includes(daysRemaining)) {
                await sendNotification(chauffeur, daysRemaining);
                // Notifier les administrateurs
                const admins = await utilisateur_1.default.findAll({
                    where: { role: 'admin' },
                });
                for (const admin of admins) {
                    await sendNotification(admin, daysRemaining);
                }
            }
        }
        logger_1.default.info('Vérification des expirations terminée.');
    }
    catch (error) {
        logger_1.default.error(`Erreur dans la tâche cron de vérification des permis: ${error.message}`);
    }
});
