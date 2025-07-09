"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkExpirations = exports.sendNotification = exports.getDaysUntilExpiration = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const sequelize_1 = require("sequelize");
const utilisateur_1 = __importDefault(require("../models/utilisateur"));
const notification_1 = __importDefault(require("../models/notification"));
const { db } = require('../config/firebase');
const logger_1 = __importDefault(require("../utils/logger"));
const mailer_1 = require("../utils/mailer");
const NOTIFICATION_THRESHOLDS = [30, 21, 14, 7, 5, 3, 1];
const getDaysUntilExpiration = (expirationDate) => {
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
exports.getDaysUntilExpiration = getDaysUntilExpiration;
const sendNotification = async (utilisateur, daysRemaining) => {
    // Message personnalisé si permis déjà expiré
    const message = daysRemaining < 0
        ? `Le permis de conduire de ${utilisateur.nom} a expiré il y a ${-daysRemaining} jour(s).`
        : `Le permis de conduire de ${utilisateur.nom} expire dans ${daysRemaining} jour(s).`;
    try {
        const existingNotification = await notification_1.default.findOne({
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
        const notification = await notification_1.default.create({
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
            await (0, mailer_1.sendMail)(utilisateur.email, 'Alerte expiration permis', message);
            logger_1.default.info(`Email envoyé à ${utilisateur.email} : ${message}`);
        }
        else {
            logger_1.default.warn(`Pas d'email pour l'utilisateur ${utilisateur.nom}`);
        }
        logger_1.default.info(`Notification envoyée pour ${utilisateur.nom}: ${message}`);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de l'envoi de la notification pour ${utilisateur.nom}: ${error.message}`);
    }
};
exports.sendNotification = sendNotification;
const checkExpirations = async () => {
    try {
        logger_1.default.info('Vérification des expirations des permis en cours...');
        const chauffeurs = await utilisateur_1.default.findAll({
            where: {
                role: 'driver',
                permisExpiration: { [sequelize_1.Op.not]: null },
            },
        });
        for (const chauffeur of chauffeurs) {
            if (!chauffeur.permisExpiration)
                continue;
            const daysRemaining = (0, exports.getDaysUntilExpiration)(new Date(chauffeur.permisExpiration));
            // Inclure aussi les permis déjà expirés
            if (NOTIFICATION_THRESHOLDS.includes(daysRemaining) || daysRemaining < 0) {
                await (0, exports.sendNotification)(chauffeur, daysRemaining);
                const admins = await utilisateur_1.default.findAll({
                    where: { role: 'admin' },
                });
                for (const admin of admins) {
                    await (0, exports.sendNotification)(admin, daysRemaining);
                }
            }
        }
        logger_1.default.info('Vérification des expirations terminée.');
    }
    catch (error) {
        logger_1.default.error(`Erreur dans la tâche cron de vérification des permis: ${error.message}`);
    }
};
exports.checkExpirations = checkExpirations;
// Planification du cron toutes les 5 minutes
node_cron_1.default.schedule('*/5 * * * *', exports.checkExpirations);
