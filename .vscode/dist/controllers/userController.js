"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsersHandler = exports.deleteUserHandler = exports.updateUserHandler = exports.getUserHandler = exports.createUserHandler = void 0;
const utilisateur_1 = __importDefault(require("../models/utilisateur"));
const logger_1 = __importDefault(require("../utils/logger"));
const firebase_1 = require("../config/firebase"); // Import Firebase
const createUserHandler = async (req, res) => {
    try {
        const { nom, email, role, permisNumero, permisDelivrance, permisExpiration, permisLieu, permisCategorie } = req.body;
        const user = await utilisateur_1.default.create({
            nom,
            email,
            role,
            permisNumero,
            permisDelivrance: permisDelivrance ? new Date(permisDelivrance) : null,
            permisExpiration: permisExpiration ? new Date(permisExpiration) : null,
            permisLieu,
            permisCategorie,
        });
        // Synchronisation avec Firebase
        await firebase_1.db.ref(`users/${user.id}`).set({
            id: user.id,
            nom: user.nom,
            email: user.email,
            role: user.role,
            permisNumero: user.permisNumero,
            permisDelivrance: user.permisDelivrance?.toISOString(),
            permisExpiration: user.permisExpiration?.toISOString(),
            permisLieu: user.permisLieu,
            permisCategorie: user.permisCategorie,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        });
        logger_1.default.info(`Utilisateur créé et synchronisé: ${user.id}`);
        res.status(201).json(user);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};
exports.createUserHandler = createUserHandler;
const getUserHandler = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await utilisateur_1.default.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.status(200).json(user);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération de l'utilisateur: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.getUserHandler = getUserHandler;
const updateUserHandler = async (req, res) => {
    try {
        const { userId } = req.params;
        const { nom, email, role, permisNumero, permisDelivrance, permisExpiration, permisLieu, permisCategorie } = req.body;
        const user = await utilisateur_1.default.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        await user.update({
            nom,
            email,
            role,
            permisNumero,
            permisDelivrance: permisDelivrance ? new Date(permisDelivrance) : null,
            permisExpiration: permisExpiration ? new Date(permisExpiration) : null,
            permisLieu,
            permisCategorie,
        });
        // Synchronisation avec Firebase
        await firebase_1.db.ref(`users/${user.id}`).set({
            id: user.id,
            nom: user.nom,
            email: user.email,
            role: user.role,
            permisNumero: user.permisNumero,
            permisDelivrance: user.permisDelivrance?.toISOString(),
            permisExpiration: user.permisExpiration?.toISOString(),
            permisLieu: user.permisLieu,
            permisCategorie: user.permisCategorie,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        });
        logger_1.default.info(`Utilisateur mis à jour et synchronisé: ${user.id}`);
        res.status(200).json(user);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};
exports.updateUserHandler = updateUserHandler;
const deleteUserHandler = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await utilisateur_1.default.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        await firebase_1.db.ref(`users/${user.id}`).remove(); // Supprimer de Firebase
        await user.destroy();
        logger_1.default.info(`Utilisateur supprimé et synchronisé: ${user.id}`);
        res.status(204).send();
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.deleteUserHandler = deleteUserHandler;
const getAllUsersHandler = async (req, res) => {
    try {
        const users = await utilisateur_1.default.findAll();
        res.status(200).json(users);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.getAllUsersHandler = getAllUsersHandler;
//# sourceMappingURL=userController.js.map