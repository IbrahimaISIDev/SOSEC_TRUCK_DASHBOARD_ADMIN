"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCamionFromDriver = exports.assignCamionToDriver = exports.updateUserHandler = exports.createUserHandler = void 0;
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const utilisateur_1 = __importDefault(require("../models/utilisateur"));
const logger_1 = __importDefault(require("../utils/logger"));
const { db } = require('../config/firebase');
const auth_1 = require("firebase-admin/auth");
const camion_1 = __importDefault(require("../models/camion"));
const test_db_1 = __importDefault(require("../test-db"));
const JWT_SECRET = process.env.JWT_SECRET || '';
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
            const { nom, email, role, password, permisNumero, permisDelivrance, permisExpiration, permisLieu, permisCategorie, camionId, } = req.body;
            if (!password) {
                return res.status(400).json({
                    error: 'Le mot de passe est requis pour créer un utilisateur.',
                });
            }
            // Démarrer une transaction
            const result = await test_db_1.default.transaction(async (t) => {
                var _a, _b;
                // Créer l'utilisateur dans Firebase Authentication
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
                    // Vérifier si un autre utilisateur a ce camionId
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
                // Hasher le mot de passe
                const saltRounds = 10;
                const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
                // Créer l'utilisateur dans Sequelize
                const user = await utilisateur_1.default.create({
                    id: firebaseUid,
                    nom,
                    email,
                    role,
                    password: hashedPassword,
                    permisNumero,
                    permisDelivrance: permisDelivrance || null,
                    permisExpiration: permisExpiration || null,
                    permisLieu,
                    permisCategorie,
                    camionId: validatedCamionId,
                }, { transaction: t });
                if (validatedCamionId) {
                    await camion_1.default.update({ driverId: firebaseUid }, { where: { id: validatedCamionId }, transaction: t });
                }
                // Générer le token JWT
                const token = jsonwebtoken_1.default.sign({ id: firebaseUid, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '2h' });
                await user.update({ token }, { transaction: t });
                // Synchroniser avec Firebase
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
                createdAt: result.user.createdAt.toISOString(),
                updatedAt: result.user.updatedAt.toISOString(),
            });
        }
        catch (error) {
            logger_1.default.error(`Erreur lors de la création de l'utilisateur: ${error.message}, Stack: ${error.stack}`);
            if (error.name === 'SequelizeValidationError' ||
                error.name === 'SequelizeUniqueConstraintError') {
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
exports.updateUserHandler = [
    ...require('../validations/userValidation').updateUserValidationRules,
    async (req, res) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            logger_1.default.error('Validation errors:', errors.array());
            return res
                .status(400)
                .json({ error: 'Erreur de validation', details: errors.array() });
        }
        try {
            const { userId } = req.params;
            const { nom, email, role, password, permisNumero, permisDelivrance, permisExpiration, permisLieu, permisCategorie, camionId, } = req.body;
            // Démarrer une transaction
            const result = await test_db_1.default.transaction(async (t) => {
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
                    // Vérifier si un autre utilisateur a ce camionId
                    const existingUser = await utilisateur_1.default.findOne({
                        where: { camionId, id: { [Sequelize.Op.ne]: user.id } },
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
                    permisDelivrance: permisDelivrance || null,
                    permisExpiration: permisExpiration || null,
                    permisLieu,
                    permisCategorie,
                    camionId: validatedCamionId,
                };
                if (password) {
                    const saltRounds = 10;
                    updateData.password = await bcrypt_1.default.hash(password, saltRounds);
                }
                // Gérer les désassignations
                if (user.camionId && user.camionId !== validatedCamionId) {
                    await camion_1.default.update({ driverId: null }, { where: { id: user.camionId }, transaction: t });
                    await db.ref(`camions/${user.camionId}`).update({
                        driverId: null,
                        syncStatus: 'synced',
                        time: new Date().toISOString(),
                    });
                }
                if (validatedCamionId && validatedCamionId !== user.camionId) {
                    await camion_1.default.update({ driverId: user.id }, { where: { id: validatedCamionId }, transaction: t });
                    await db.ref(`camions/${validatedCamionId}`).update({
                        driverId: user.id,
                        syncStatus: 'synced',
                        time: new Date().toISOString(),
                    });
                }
                await user.update(updateData, { transaction: t });
                // Synchronisation avec Firebase
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
                    createdAt: user.createdAt.toISOString(),
                    updatedAt: user.updatedAt.toISOString(),
                });
                return user;
            });
            logger_1.default.info(`Utilisateur mis à jour et synchronisé: ${result.id}`);
            res.status(200).json(result);
        }
        catch (error) {
            logger_1.default.error(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}, Stack: ${error.stack}`);
            if (error.name === 'SequelizeValidationError' ||
                error.name === 'SequelizeUniqueConstraintError') {
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
const assignCamionToDriver = async (req, res) => {
    try {
        const { userId } = req.params;
        const { camionId } = req.body;
        // Démarrer une transaction
        const result = await test_db_1.default.transaction(async (t) => {
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
            // Vérifier si le camion est déjà affecté à un autre chauffeur
            if (camion.driverId && camion.driverId !== user.id) {
                logger_1.default.error(`Camion déjà affecté à un autre chauffeur: ${camionId}`);
                throw new Error('Ce camion est déjà affecté à un autre chauffeur');
            }
            // Vérifier si le chauffeur est déjà affecté à un autre camion
            if (user.camionId && user.camionId !== camion.id) {
                logger_1.default.error(`Chauffeur déjà affecté à un autre camion: ${userId}`);
                throw new Error('Ce chauffeur est déjà affecté à un autre camion');
            }
            // Désassigner l'ancien chauffeur du camion, si nécessaire
            if (camion.driverId && camion.driverId !== user.id) {
                await utilisateur_1.default.update({ camionId: null }, { where: { id: camion.driverId }, transaction: t });
                await db.ref(`users/${camion.driverId}`).update({
                    camionId: null,
                    syncStatus: 'synced',
                    time: new Date().toISOString(),
                });
            }
            // Désassigner l'ancien camion du chauffeur, si nécessaire
            if (user.camionId && user.camionId !== camion.id) {
                await camion_1.default.update({ driverId: null }, { where: { id: user.camionId }, transaction: t });
                await db.ref(`camions/${user.camionId}`).update({
                    driverId: null,
                    syncStatus: 'synced',
                    time: new Date().toISOString(),
                });
            }
            // Effectuer l'affectation
            await user.update({ camionId: camion.id }, { transaction: t });
            await camion.update({ driverId: user.id }, { transaction: t });
            // Synchronisation avec Firebase
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
        res
            .status(200)
            .json({
            message: 'Affectation réussie',
            user: result.user,
            camion: result.camion,
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
        // Démarrer une transaction
        const result = await test_db_1.default.transaction(async (t) => {
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
            // Supprimer l'affectation
            await user.update({ camionId: null }, { transaction: t });
            await camion.update({ driverId: null }, { transaction: t });
            // Synchronisation avec Firebase
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
        res.status(200).json({ message: 'Affectation supprimée', user: result.user, camion: result.camion });
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la suppression de l'affectation: ${error.message}, Stack: ${error.stack}`);
        res.status(400).json({ error: error.message });
    }
};
exports.removeCamionFromDriver = removeCamionFromDriver;
