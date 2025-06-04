"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginHandler = exports.getAllUsersHandler = exports.deleteUserHandler = exports.updateUserHandler = exports.getUserHandler = exports.createUserHandler = void 0;
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const utilisateur_1 = __importDefault(require("../models/utilisateur"));
const logger_1 = __importDefault(require("../utils/logger"));
const firebase_1 = require("../config/firebase");
exports.createUserHandler = [
    ...require('../validations/userValidation').createUserValidationRules,
    async (req, res) => {
        var _a, _b;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            logger_1.default.error('Validation errors:', errors.array());
            return res
                .status(400)
                .json({ error: 'Erreur de validation', details: errors.array() });
        }
        try {
            const { nom, email, role, permisNumero, permisDelivrance, permisExpiration, permisLieu, permisCategorie, } = req.body;
            logger_1.default.info('Données utilisateur reçues:', {
                nom,
                email,
                role,
                permisNumero,
                permisDelivrance,
                permisExpiration,
                permisLieu,
                permisCategorie,
            });
            const user = await utilisateur_1.default.create({
                nom,
                email,
                role,
                permisNumero,
                permisDelivrance: permisDelivrance || null,
                permisExpiration: permisExpiration || null,
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
                permisDelivrance: ((_a = user.permisDelivrance) === null || _a === void 0 ? void 0 : _a.toISOString()) || null,
                permisExpiration: ((_b = user.permisExpiration) === null || _b === void 0 ? void 0 : _b.toISOString()) || null,
                permisLieu: user.permisLieu,
                permisCategorie: user.permisCategorie,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
            });
            logger_1.default.info(`Utilisateur créé et synchronisé: ${user.id}`);
            res.status(201).json(user);
        }
        catch (error) {
            logger_1.default.error(`Erreur lors de la création de l'utilisateur: ${error.message}`, { stack: error.stack });
            if (error.name === 'SequelizeValidationError' ||
                error.name === 'SequelizeUniqueConstraintError') {
                return res
                    .status(400)
                    .json({
                    error: 'Erreur de validation',
                    details: error.errors.map((e) => ({
                        field: e.path,
                        message: e.message,
                    })),
                });
            }
            res.status(400).json({ error: error.message });
        }
    },
];
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
exports.updateUserHandler = [
    ...require('../validations/userValidation').updateUserValidationRules,
    async (req, res) => {
        var _a, _b;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res
                .status(400)
                .json({ error: 'Erreur de validation', details: errors.array() });
        }
        try {
            const { userId } = req.params;
            const { nom, email, role, permisNumero, permisDelivrance, permisExpiration, permisLieu, permisCategorie, } = req.body;
            const user = await utilisateur_1.default.findByPk(userId);
            if (!user) {
                return res.status(404).json({ error: 'Utilisateur non trouvé' });
            }
            await user.update({
                nom,
                email,
                role,
                permisNumero,
                permisDelivrance: permisDelivrance || null,
                permisExpiration: permisExpiration || null,
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
                permisDelivrance: ((_a = user.permisDelivrance) === null || _a === void 0 ? void 0 : _a.toISOString()) || null,
                permisExpiration: ((_b = user.permisExpiration) === null || _b === void 0 ? void 0 : _b.toISOString()) || null,
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
            if (error.name === 'SequelizeValidationError' ||
                error.name === 'SequelizeUniqueConstraintError') {
                return res
                    .status(400)
                    .json({
                    error: 'Erreur de validation',
                    details: error.errors.map((e) => ({
                        field: e.path,
                        message: e.message,
                    })),
                });
            }
            res.status(400).json({ error: error.message });
        }
    },
];
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
const loginHandler = async (req, res) => {
    try {
        const { email, role } = req.body;
        console.log('Requête reçue pour login:', { email, role });
        const utilisateur = await utilisateur_1.default.findOne({ where: { email, role } });
        if (!utilisateur) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        console.log('Utilisateur trouvé:', utilisateur.toJSON());
        const token = jsonwebtoken_1.default.sign({ id: utilisateur.id, email: utilisateur.email, role: utilisateur.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Connexion réussie', token });
    }
    catch (error) {
        console.error('Erreur lors de la connexion:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Erreur serveur', error: error.message });
        }
        else {
            res
                .status(500)
                .json({ message: 'Erreur serveur', error: 'Unknown error' });
        }
    }
};
exports.loginHandler = loginHandler;
