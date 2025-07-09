"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDriverCamion = exports.removeCamionFromDriver = exports.assignCamionToDriver = exports.getAllUsersHandler = exports.deleteUserHandler = exports.updateUserHandler = exports.getUserHandler = exports.createUserHandler = void 0;
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const utilisateur_1 = __importDefault(require("../models/utilisateur"));
const camion_1 = __importDefault(require("../models/camion"));
const logger_1 = __importDefault(require("../utils/logger"));
const sequelize = require('../config/db'); // Fix: Added sequelize import
const { db } = require('../config/firebase');
const auth_1 = require("firebase-admin/auth");
const sequelize_1 = require("sequelize");
const JWT_SECRET = process.env.JWT_SECRET || '';
exports.createUserHandler = [
    ...require('../validations/userValidation').createUserValidationRules,
    async (req, res) => {
        var _a, _b;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            logger_1.default.error('Validation errors:', errors.array());
            return res.status(400).json({ error: 'Erreur de validation', details: errors.array() });
        }
        try {
            const { nom, email, role, password, permisNumero, permisDelivrance, permisExpiration, permisLieu, permisCategorie, camionId, telephone, adresse, } = req.body;
            if (!password) {
                return res.status(400).json({ error: 'Le mot de passe est requis pour créer un utilisateur.' });
            }
            const result = await sequelize.transaction(async (t) => {
                var _a, _b;
                // Create user in Firebase Authentication
                const auth = (0, auth_1.getAuth)();
                const userRecord = await auth.createUser({ email, password });
                const firebaseUid = userRecord.uid;
                let validatedCamionId = null;
                if (camionId) {
                    const camion = await camion_1.default.findByPk(camionId, { transaction: t });
                    if (!camion) {
                        logger_1.default.error(`Camion non trouvé pour camionId: ${camionId}`);
                        throw new Error('Camion non trouvé');
                    }
                    if (camion.driverId) {
                        logger_1.default.error(`Camion déjà assigné à un autre chauffeur: ${camionId}`);
                        throw new Error('Ce camion est déjà assigné à un autre chauffeur');
                    }
                    const existingUser = await utilisateur_1.default.findOne({
                        where: { camionId },
                        transaction: t,
                    });
                    if (existingUser) {
                        logger_1.default.error(`camionId déjà assigné à un autre utilisateur: ${camionId}`);
                        throw new Error('Ce camion est déjà assigné à un autre utilisateur');
                    }
                    validatedCamionId = camionId;
                }
                // Hash password
                const saltRounds = 10;
                const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
                // Create user in Sequelize
                const user = await utilisateur_1.default.create({
                    id: firebaseUid,
                    nom,
                    email,
                    role,
                    password: hashedPassword,
                    permisNumero,
                    permisDelivrance: permisDelivrance ? new Date(permisDelivrance) : null,
                    permisExpiration: permisExpiration ? new Date(permisExpiration) : null,
                    permisLieu,
                    permisCategorie,
                    camionId: validatedCamionId,
                    telephone,
                    adresse,
                    syncStatus: 'synced',
                    time: new Date().toISOString(),
                }, { transaction: t });
                if (validatedCamionId) {
                    await camion_1.default.update({ driverId: firebaseUid }, { where: { id: validatedCamionId }, transaction: t });
                }
                // Generate JWT
                const token = jsonwebtoken_1.default.sign({ id: firebaseUid, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '2h' });
                await user.update({ token }, { transaction: t });
                // Sync with Firebase Realtime Database
                await db.ref(`users/${firebaseUid}`).set({
                    id: firebaseUid,
                    nom: user.nom,
                    email: user.email,
                    role: user.role,
                    permisNumero: user.permisNumero,
                    permisDelivrance: ((_a = user.permisDelivrance) === null || _a === void 0 ? void 0 : _a.toISOString()) || null,
                    permisExpiration: ((_b = user.permisExpiration) === null || _b === void 0 ? void 0 : _b.toISOString()) || null,
                    permisLieu: user.permisLieu,
                    permisCategorie: user.permisCategorie,
                    camionId: user.camionId || null,
                    telephone: user.telephone || null,
                    adresse: user.adresse || null,
                    syncStatus: user.syncStatus,
                    time: user.time,
                    createdAt: user.createdAt.toISOString(),
                    updatedAt: user.updatedAt.toISOString(),
                });
                if (validatedCamionId) {
                    await db.ref(`camions/${validatedCamionId}`).update({
                        driverId: firebaseUid,
                        syncStatus: 'synced',
                        time: new Date().toISOString(),
                    });
                }
                return { user, token };
            });
            logger_1.default.info(`Utilisateur créé et synchronisé avec UID: ${result.user.id}`);
            res.status(201).json({
                id: result.user.id,
                nom: result.user.nom,
                email: result.user.email,
                role: result.user.role,
                permisNumero: result.user.permisNumero,
                permisDelivrance: ((_a = result.user.permisDelivrance) === null || _a === void 0 ? void 0 : _a.toISOString()) || null,
                permisExpiration: ((_b = result.user.permisExpiration) === null || _b === void 0 ? void 0 : _b.toISOString()) || null,
                permisLieu: result.user.permisLieu,
                permisCategorie: result.user.permisCategorie,
                camionId: result.user.camionId,
                token: result.token,
                syncStatus: result.user.syncStatus,
                time: result.user.time,
                createdAt: result.user.createdAt.toISOString(),
                updatedAt: result.user.updatedAt.toISOString(),
            });
        }
        catch (error) {
            logger_1.default.error(`Erreur lors de la création de l'utilisateur: ${error.message}, Stack: ${error.stack}`);
            if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({
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
    var _a, _b;
    try {
        const { userId } = req.params;
        logger_1.default.info(`Tentative de récupération de l'utilisateur avec ID: ${userId}`);
        const user = await utilisateur_1.default.findByPk(userId);
        if (!user) {
            logger_1.default.warn(`Utilisateur non trouvé pour ID: ${userId}`);
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        logger_1.default.info(`Utilisateur trouvé: ${userId}`);
        res.status(200).json({
            id: user.id,
            nom: user.nom,
            email: user.email,
            role: user.role,
            permisNumero: user.permisNumero,
            permisDelivrance: ((_a = user.permisDelivrance) === null || _a === void 0 ? void 0 : _a.toISOString()) || null,
            permisExpiration: ((_b = user.permisExpiration) === null || _b === void 0 ? void 0 : _b.toISOString()) || null,
            permisLieu: user.permisLieu,
            permisCategorie: user.permisCategorie,
            camionId: user.camionId,
            syncStatus: user.syncStatus,
            time: user.time,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        });
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération de l'utilisateur: ${error.message}`, { stack: error.stack });
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
            logger_1.default.error('Validation errors:', errors.array());
            return res.status(400).json({ error: 'Erreur de validation', details: errors.array() });
        }
        try {
            const { userId } = req.params;
            const { nom, email, role, password, permisNumero, permisDelivrance, permisExpiration, permisLieu, permisCategorie, camionId, telephone, adresse, } = req.body;
            const result = await sequelize.transaction(async (t) => {
                var _a, _b;
                const user = await utilisateur_1.default.findByPk(userId, { transaction: t });
                if (!user) {
                    logger_1.default.warn(`Utilisateur non trouvé pour ID: ${userId}`);
                    throw new Error('Utilisateur non trouvé.');
                }
                let validatedCamionId = null;
                if (camionId) {
                    const camion = await camion_1.default.findByPk(camionId, { transaction: t });
                    if (!camion) {
                        logger_1.default.error(`Camion non trouvé pour camionId: ${camionId}`);
                        throw new Error('Camion non trouvé');
                    }
                    if (camion.driverId && camion.driverId !== user.id) {
                        logger_1.default.error(`Camion déjà assigné à un autre chauffeur: ${camionId}`);
                        throw new Error('Ce camion est déjà assigné à un autre chauffeur');
                    }
                    const existingUser = await utilisateur_1.default.findOne({
                        where: { camionId, id: { [sequelize_1.Op.ne]: user.id } },
                        transaction: t,
                    });
                    if (existingUser) {
                        logger_1.default.error(`camionId déjà assigné à un autre utilisateur: ${camionId}`);
                        throw new Error('Ce camion est déjà assigné à un autre utilisateur');
                    }
                    validatedCamionId = camionId;
                }
                const updateData = {
                    nom,
                    email,
                    role,
                    permisNumero,
                    permisDelivrance: permisDelivrance ? new Date(permisDelivrance) : null,
                    permisExpiration: permisExpiration ? new Date(permisExpiration) : null,
                    permisLieu,
                    permisCategorie,
                    camionId: validatedCamionId,
                    syncStatus: 'synced',
                    time: new Date().toISOString(),
                };
                if (password) {
                    const saltRounds = 10;
                    updateData.password = await bcrypt_1.default.hash(password, saltRounds);
                }
                // Handle truck unassignment
                if (user.camionId && user.camionId !== validatedCamionId) {
                    await camion_1.default.update({ driverId: null }, { where: { id: user.camionId }, transaction: t });
                    await db.ref(`camions/${user.camionId}`).update({
                        driverId: null,
                        syncStatus: 'synced',
                        time: new Date().toISOString(),
                    });
                }
                // Handle truck assignment
                if (validatedCamionId && validatedCamionId !== user.camionId) {
                    await camion_1.default.update({ driverId: user.id }, { where: { id: validatedCamionId }, transaction: t });
                    await db.ref(`camions/${validatedCamionId}`).update({
                        driverId: user.id,
                        syncStatus: 'synced',
                        time: new Date().toISOString(),
                    });
                }
                await user.update(updateData, { transaction: t });
                // Sync with Firebase
                await db.ref(`users/${user.id}`).set({
                    id: user.id,
                    nom: user.nom,
                    email: user.email,
                    role: user.role,
                    permisNumero: user.permisNumero,
                    permisDelivrance: ((_a = user.permisDelivrance) === null || _a === void 0 ? void 0 : _a.toISOString()) || null,
                    permisExpiration: ((_b = user.permisExpiration) === null || _b === void 0 ? void 0 : _b.toISOString()) || null,
                    permisLieu: user.permisLieu,
                    permisCategorie: user.permisCategorie,
                    camionId: user.camionId || null,
                    syncStatus: user.syncStatus,
                    time: user.time,
                    createdAt: user.createdAt.toISOString(),
                    updatedAt: user.updatedAt.toISOString(),
                });
                return user;
            });
            logger_1.default.info(`Utilisateur mis à jour et synchronisé: ${result.id}`);
            res.status(200).json({
                id: result.id,
                nom: result.nom,
                email: result.email,
                role: result.role,
                permisNumero: result.permisNumero,
                permisDelivrance: ((_a = result.permisDelivrance) === null || _a === void 0 ? void 0 : _a.toISOString()) || null,
                permisExpiration: ((_b = result.permisExpiration) === null || _b === void 0 ? void 0 : _b.toISOString()) || null,
                permisLieu: result.permisLieu,
                permisCategorie: result.permisCategorie,
                camionId: result.camionId,
                syncStatus: result.syncStatus,
                time: result.time,
                createdAt: result.createdAt.toISOString(),
                updatedAt: result.updatedAt.toISOString(),
            });
        }
        catch (error) {
            logger_1.default.error(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}, Stack: ${error.stack}`);
            if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({
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
        const result = await sequelize.transaction(async (t) => {
            const user = await utilisateur_1.default.findByPk(userId, { transaction: t });
            if (!user) {
                logger_1.default.warn(`Utilisateur non trouvé pour ID: ${userId}`);
                return res.status(404).json({ error: 'Utilisateur non trouvé' });
            }
            // Unassign truck if assigned
            if (user.camionId) {
                await camion_1.default.update({ driverId: null }, { where: { id: user.camionId }, transaction: t });
                await db.ref(`camions/${user.camionId}`).update({
                    driverId: null,
                    syncStatus: 'synced',
                    time: new Date().toISOString(),
                });
            }
            await db.ref(`users/${user.id}`).remove();
            await user.destroy({ transaction: t });
            return true;
        });
        logger_1.default.info(`Utilisateur supprimé et synchronisé: ${userId}`);
        res.status(204).send();
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la suppression de l'utilisateur: ${error.message}, Stack: ${error.stack}`);
        res.status(500).json({ error: error.message });
    }
};
exports.deleteUserHandler = deleteUserHandler;
const getAllUsersHandler = async (req, res) => {
    try {
        const users = await utilisateur_1.default.findAll();
        res.status(200).json(users.map(user => {
            var _a, _b;
            return ({
                id: user.id,
                nom: user.nom,
                email: user.email,
                role: user.role,
                permisNumero: user.permisNumero,
                permisDelivrance: ((_a = user.permisDelivrance) === null || _a === void 0 ? void 0 : _a.toISOString()) || null,
                permisExpiration: ((_b = user.permisExpiration) === null || _b === void 0 ? void 0 : _b.toISOString()) || null,
                permisLieu: user.permisLieu,
                permisCategorie: user.permisCategorie,
                camionId: user.camionId,
                syncStatus: user.syncStatus,
                time: user.time,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
            });
        }));
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération des utilisateurs: ${error.message}, Stack: ${error.stack}`);
        res.status(500).json({ error: error.message });
    }
};
exports.getAllUsersHandler = getAllUsersHandler;
const assignCamionToDriver = async (req, res) => {
    try {
        const { userId } = req.params;
        const { camionId } = req.body;
        const result = await sequelize.transaction(async (t) => {
            const user = await utilisateur_1.default.findByPk(userId, { transaction: t });
            if (!user) {
                logger_1.default.warn(`Chauffeur non trouvé pour l'ID: ${userId}`);
                throw new Error('Chauffeur non trouvé');
            }
            if (user.role !== 'driver') {
                logger_1.default.error(`Utilisateur n'est pas un chauffeur: ${userId}`);
                throw new Error('Seul un chauffeur peut être affecté à un camion');
            }
            const camion = await camion_1.default.findByPk(camionId, { transaction: t });
            if (!camion) {
                logger_1.default.warn(`Camion non trouvé pour l'ID: ${camionId}`);
                throw new Error('Camion non trouvé');
            }
            if (camion.driverId && camion.driverId !== user.id) {
                logger_1.default.error(`Camion déjà affecté à un autre chauffeur: ${camionId}`);
                throw new Error('Ce camion est déjà affecté à un autre chauffeur');
            }
            if (user.camionId && user.camionId !== camion.id) {
                logger_1.default.error(`Chauffeur déjà affecté à un autre camion: ${userId}`);
                throw new Error('Ce chauffeur est déjà affecté à un autre camion');
            }
            // Unassign previous driver if necessary
            if (camion.driverId && camion.driverId !== user.id) {
                await utilisateur_1.default.update({ camionId: null }, { where: { id: camion.driverId }, transaction: t });
                await db.ref(`users/${camion.driverId}`).update({
                    camionId: null,
                    syncStatus: 'synced',
                    time: new Date().toISOString(),
                });
            }
            // Unassign previous truck if necessary
            if (user.camionId && user.camionId !== camion.id) {
                await camion_1.default.update({ driverId: null }, { where: { id: user.camionId }, transaction: t });
                await db.ref(`camions/${user.camionId}`).update({
                    driverId: null,
                    syncStatus: 'synced',
                    time: new Date().toISOString(),
                });
            }
            // Assign truck to driver
            await user.update({ camionId: camion.id }, { transaction: t });
            await camion.update({ driverId: user.id }, { transaction: t });
            // Sync with Firebase
            await db.ref(`users/${user.id}`).update({
                camionId: camion.id,
                syncStatus: 'synced',
                time: new Date().toISOString(),
            });
            await db.ref(`camions/${camion.id}`).update({
                driverId: user.id,
                syncStatus: 'synced',
                time: new Date().toISOString(),
            });
            return { user, camion };
        });
        logger_1.default.info(`Affectation réussie: Chauffeur ${result.user.id} affecté au camion ${result.camion.id}`);
        res.status(200).json({
            message: 'Affectation réussie',
            user: {
                id: result.user.id,
                nom: result.user.nom,
                email: result.user.email,
                role: result.user.role,
                camionId: result.user.camionId,
            },
            camion: {
                id: result.camion.id,
                nom: result.camion.nom,
                immatriculation: result.camion.immatriculation,
                driverId: result.camion.driverId,
            },
        });
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de l'affectation: ${error.message}, Stack: ${error.stack}`);
        res.status(400).json({ error: error.message });
    }
};
exports.assignCamionToDriver = assignCamionToDriver;
const removeCamionFromDriver = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await sequelize.transaction(async (t) => {
            const user = await utilisateur_1.default.findByPk(userId, { transaction: t });
            if (!user) {
                logger_1.default.warn(`Chauffeur non trouvé pour l'ID: ${userId}`);
                throw new Error('Chauffeur non trouvé');
            }
            if (!user.camionId) {
                logger_1.default.error(`Chauffeur non affecté à un camion: ${userId}`);
                throw new Error("Ce chauffeur n'est affecté à aucun camion");
            }
            const camion = await camion_1.default.findByPk(user.camionId, { transaction: t });
            if (!camion) {
                logger_1.default.warn(`Camion non trouvé pour l'ID: ${user.camionId}`);
                throw new Error('Camion non trouvé');
            }
            // Remove assignment
            await user.update({ camionId: null }, { transaction: t });
            await camion.update({ driverId: null }, { transaction: t });
            // Sync with Firebase
            await db.ref(`users/${user.id}`).update({
                camionId: null,
                syncStatus: 'synced',
                time: new Date().toISOString(),
            });
            await db.ref(`camions/${camion.id}`).update({
                driverId: null,
                syncStatus: 'synced',
                time: new Date().toISOString(),
            });
            return { user, camion };
        });
        logger_1.default.info(`Affectation supprimée: Chauffeur ${result.user.id} détaché du camion ${result.camion.id}`);
        res.status(200).json({
            message: 'Affectation supprimée',
            user: {
                id: result.user.id,
                nom: result.user.nom,
                email: result.user.email,
                role: result.user.role,
                camionId: result.user.camionId,
            },
            camion: {
                id: result.camion.id,
                nom: result.camion.nom,
                immatriculation: result.camion.immatriculation,
                driverId: result.camion.driverId,
            },
        });
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la suppression de l'affectation: ${error.message}, Stack: ${error.stack}`);
        res.status(400).json({ error: error.message });
    }
};
exports.removeCamionFromDriver = removeCamionFromDriver;
const getDriverCamion = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await utilisateur_1.default.findByPk(userId, {
            include: [{ model: camion_1.default, as: 'camion' }],
        });
        if (!user) {
            logger_1.default.warn(`Chauffeur non trouvé pour l'ID: ${userId}`);
            return res.status(404).json({ error: 'Chauffeur non trouvé' });
        }
        if (user.role !== 'driver') {
            logger_1.default.error(`Utilisateur n'est pas un chauffeur: ${userId}`);
            return res
                .status(400)
                .json({ error: 'Seul un chauffeur peut avoir un camion associé' });
        }
        res.status(200).json(user.camionId);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération du camion du chauffeur: ${error.message}`, { stack: error.stack });
        res.status(500).json({ error: error.message });
    }
};
exports.getDriverCamion = getDriverCamion;
