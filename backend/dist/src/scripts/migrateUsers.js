"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const { db } = require('../config/firebase');
const auth_1 = require("firebase-admin/auth");
const utilisateur_1 = __importDefault(require("../models/utilisateur"));
const logger_1 = __importDefault(require("../utils/logger"));
async function migrateUsers() {
    var _a, _b;
    try {
        // Récupérer tous les utilisateurs de Firebase Authentication
        const auth = (0, auth_1.getAuth)();
        const { users } = await auth.listUsers();
        // Récupérer tous les utilisateurs de Sequelize
        const sequelizeUsers = await utilisateur_1.default.findAll();
        for (const sequelizeUser of sequelizeUsers) {
            // Trouver l'utilisateur correspondant dans Firebase Authentication
            const firebaseUser = users.find(u => u.email === sequelizeUser.email);
            if (!firebaseUser) {
                logger_1.default.warn(`Aucun utilisateur Firebase trouvé pour l'email: ${sequelizeUser.email}`);
                continue;
            }
            const firebaseUid = firebaseUser.uid;
            // Mettre à jour l'ID dans Sequelize
            await utilisateur_1.default.update({ id: firebaseUid }, { where: { id: sequelizeUser.id } });
            // Mettre à jour les données dans Realtime Database
            const userData = {
                id: firebaseUid,
                nom: sequelizeUser.nom,
                email: sequelizeUser.email,
                role: sequelizeUser.role,
                permisNumero: sequelizeUser.permisNumero,
                permisDelivrance: ((_a = sequelizeUser.permisDelivrance) === null || _a === void 0 ? void 0 : _a.toISOString()) || null,
                permisExpiration: ((_b = sequelizeUser.permisExpiration) === null || _b === void 0 ? void 0 : _b.toISOString()) || null,
                permisLieu: sequelizeUser.permisLieu,
                permisCategorie: sequelizeUser.permisCategorie,
                camionId: sequelizeUser.camionId,
                createdAt: sequelizeUser.createdAt.toISOString(),
                updatedAt: sequelizeUser.updatedAt.toISOString(),
            };
            await db.ref(`users/${firebaseUid}`).set(userData);
            await db.ref(`users/${sequelizeUser.id}`).remove(); // Supprimer l'ancienne entrée
            logger_1.default.info(`Utilisateur migré: ${sequelizeUser.email} avec UID: ${firebaseUid}`);
        }
        logger_1.default.info('Migration des utilisateurs terminée');
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la migration des utilisateurs: ${error.message}`);
    }
}
migrateUsers();
