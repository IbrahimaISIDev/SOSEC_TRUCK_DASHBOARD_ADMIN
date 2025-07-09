"use strict";
// ============================================
// 1. CORRECTION DU BACKEND - camionController.ts
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCamionHandler = exports.getAllCamionsHandler = exports.getCamionHandler = exports.updateCamionHandler = exports.createCamionHandler = exports.camionValidationRules = void 0;
const express_validator_1 = require("express-validator");
const camion_1 = __importDefault(require("../models/camion"));
const utilisateur_1 = __importDefault(require("../models/utilisateur"));
const logger_1 = __importDefault(require("../utils/logger"));
const uuid_1 = require("uuid");
const sequelize = require('../config/db');
const { db } = require('../config/firebase');
const sequelize_1 = require("sequelize");
// Validation rules for camion
exports.camionValidationRules = [
    (0, express_validator_1.body)('nom').notEmpty().withMessage('Le nom est requis'),
    (0, express_validator_1.body)('type').notEmpty().withMessage('Le type est requis'),
    (0, express_validator_1.body)('immatriculation')
        .optional()
        .isString()
        .withMessage('Immatriculation doit être une chaîne'),
    (0, express_validator_1.body)('assuranceExpiration')
        .optional()
        .isISO8601()
        .withMessage("La date d'expiration de l'assurance est invalide"),
    (0, express_validator_1.body)('driverId')
        .optional()
        .isString()
        .withMessage('driverId doit être une chaîne'),
];
const createCamionHandler = async (req, res) => {
    try {
        logger_1.default.debug(`Raw request body: ${JSON.stringify(req.body, null, 2)}`);
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            logger_1.default.error('Validation errors:', errors.array());
            return res
                .status(400)
                .json({ error: 'Erreur de validation', details: errors.array() });
        }
        const { immatriculation, assuranceDetails, assuranceExpiration, nom, type, driverId, } = req.body;
        const result = await sequelize.transaction(async (t) => {
            var _a;
            let validatedDriverId = null;
            if (driverId) {
                const user = await utilisateur_1.default.findByPk(driverId, { transaction: t });
                if (!user) {
                    logger_1.default.error(`Chauffeur non trouvé pour driverId: ${driverId}`);
                    throw new Error('Chauffeur non trouvé');
                }
                if (user.role !== 'driver') {
                    logger_1.default.error(`Utilisateur n'est pas un chauffeur: ${driverId}`);
                    throw new Error('Seul un chauffeur peut être affecté à un camion');
                }
                if (user.camionId) {
                    logger_1.default.error(`Chauffeur déjà affecté à un autre camion: ${driverId}`);
                    throw new Error('Ce chauffeur est déjà affecté à un autre camion');
                }
                const existingCamion = await camion_1.default.findOne({
                    where: { driverId },
                    transaction: t,
                });
                if (existingCamion) {
                    logger_1.default.error(`driverId déjà assigné à un autre camion: ${driverId}`);
                    throw new Error('Ce chauffeur est déjà assigné à un autre camion');
                }
                validatedDriverId = driverId;
            }
            const camionData = {
                id: (0, uuid_1.v4)(),
                immatriculation: immatriculation || null,
                nom: nom.trim(),
                type: type.trim(),
                assuranceDetails: assuranceDetails || null,
                assuranceExpiration: assuranceExpiration
                    ? new Date(assuranceExpiration)
                    : null,
                driverId: validatedDriverId,
                syncStatus: 'synced',
                time: new Date().toISOString(),
            };
            logger_1.default.debug(`Final camionData: ${JSON.stringify(camionData, null, 2)}`);
            const camion = await camion_1.default.create(camionData, { transaction: t });
            if (validatedDriverId) {
                await utilisateur_1.default.update({ camionId: camion.id }, { where: { id: validatedDriverId }, transaction: t });
                // CORRECTION: Mise à jour Firebase avec le nom du camion
                await db.ref(`users/${validatedDriverId}`).update({
                    camionId: camion.id,
                    camionNom: camion.nom, // ✅ Ajout du nom du camion
                    syncStatus: 'synced',
                    time: new Date().toISOString(),
                });
            }
            await db.ref(`camions/${camion.id}`).set({
                id: camion.id,
                nom: camion.nom,
                type: camion.type,
                immatriculation: camion.immatriculation,
                syncStatus: camion.syncStatus,
                time: camion.time,
                assuranceDetails: camion.assuranceDetails,
                assuranceExpiration: ((_a = camion.assuranceExpiration) === null || _a === void 0 ? void 0 : _a.toISOString()) || null,
                driverId: camion.driverId || null,
                createdAt: camion.createdAt.toISOString(),
                updatedAt: camion.updatedAt.toISOString(),
            });
            return camion;
        });
        logger_1.default.info(`Camion créé et synchronisé avec Firebase: ID=${result.id}`);
        res.status(201).json(result);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la création du camion: ${error.message}, Stack: ${error.stack}`);
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
};
exports.createCamionHandler = createCamionHandler;
const updateCamionHandler = async (req, res) => {
    try {
        logger_1.default.debug(`Raw request body (update): ${JSON.stringify(req.body, null, 2)}`);
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            logger_1.default.error('Validation errors:', errors.array());
            return res
                .status(400)
                .json({ error: 'Erreur de validation', details: errors.array() });
        }
        const { camionId } = req.params;
        const { immatriculation, assuranceDetails, assuranceExpiration, nom, type, driverId, } = req.body;
        const result = await sequelize.transaction(async (t) => {
            var _a;
            const camion = await camion_1.default.findByPk(camionId, { transaction: t });
            if (!camion) {
                logger_1.default.warn(`Camion non trouvé pour l'ID: ${camionId}`);
                throw new Error('Camion non trouvé');
            }
            let validatedDriverId = null;
            if (driverId) {
                const user = await utilisateur_1.default.findByPk(driverId, { transaction: t });
                if (!user) {
                    logger_1.default.error(`Chauffeur non trouvé pour driverId: ${driverId}`);
                    throw new Error('Chauffeur non trouvé');
                }
                if (user.role !== 'driver') {
                    logger_1.default.error(`Utilisateur n'est pas un chauffeur: ${driverId}`);
                    throw new Error('Seul un chauffeur peut être affecté à un camion');
                }
                if (user.camionId && user.camionId !== camion.id) {
                    logger_1.default.error(`Chauffeur déjà affecté à un autre camion: ${driverId}`);
                    throw new Error('Ce chauffeur est déjà affecté à un autre camion');
                }
                const existingCamion = await camion_1.default.findOne({
                    where: { driverId, id: { [sequelize_1.Op.ne]: camion.id } },
                    transaction: t,
                });
                if (existingCamion) {
                    logger_1.default.error(`driverId déjà assigné à un autre camion: ${driverId}`);
                    throw new Error('Ce chauffeur est déjà assigné à un autre camion');
                }
                validatedDriverId = driverId;
            }
            const updateData = {
                immatriculation: immatriculation || null,
                nom: nom.trim(),
                type: type.trim(),
                assuranceDetails: assuranceDetails || null,
                assuranceExpiration: assuranceExpiration
                    ? new Date(assuranceExpiration)
                    : null,
                driverId: validatedDriverId,
                syncStatus: 'synced',
                time: new Date().toISOString(),
            };
            logger_1.default.debug(`Final updateData: ${JSON.stringify(updateData, null, 2)}`);
            // Gérer les changements de chauffeur
            if (camion.driverId && camion.driverId !== validatedDriverId) {
                await utilisateur_1.default.update({ camionId: null }, { where: { id: camion.driverId }, transaction: t });
                // CORRECTION: Retirer le nom du camion de l'ancien chauffeur
                await db.ref(`users/${camion.driverId}`).update({
                    camionId: null,
                    camionNom: null, // ✅ Suppression du nom du camion
                    syncStatus: 'synced',
                    time: new Date().toISOString(),
                });
            }
            if (validatedDriverId && validatedDriverId !== camion.driverId) {
                await utilisateur_1.default.update({ camionId: camion.id }, { where: { id: validatedDriverId }, transaction: t });
                // CORRECTION: Ajouter le nom du camion au nouveau chauffeur
                await db.ref(`users/${validatedDriverId}`).update({
                    camionId: camion.id,
                    camionNom: updateData.nom, // ✅ Ajout du nom du camion
                    syncStatus: 'synced',
                    time: new Date().toISOString(),
                });
            }
            // Si le nom du camion a changé, mettre à jour le chauffeur actuel
            if (camion.driverId && camion.nom !== updateData.nom) {
                await db.ref(`users/${camion.driverId}`).update({
                    camionNom: updateData.nom, // ✅ Mise à jour du nom du camion
                    syncStatus: 'synced',
                    time: new Date().toISOString(),
                });
            }
            await camion.update(updateData, { transaction: t });
            await db.ref(`camions/${camion.id}`).update({
                id: camion.id,
                nom: camion.nom,
                type: camion.type,
                immatriculation: camion.immatriculation,
                syncStatus: camion.syncStatus,
                time: camion.time,
                assuranceDetails: camion.assuranceDetails,
                assuranceExpiration: ((_a = camion.assuranceExpiration) === null || _a === void 0 ? void 0 : _a.toISOString()) || null,
                driverId: camion.driverId || null,
                updatedAt: camion.updatedAt.toISOString(),
            });
            return camion;
        });
        logger_1.default.info(`Camion mis à jour et synchronisé avec Firebase: ID=${result.id}`);
        res.status(200).json(result);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la mise à jour du camion: ${error.message}, Stack: ${error.stack}`);
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
};
exports.updateCamionHandler = updateCamionHandler;
const getCamionHandler = async (req, res) => {
    try {
        const { camionId } = req.params;
        const camion = await camion_1.default.findByPk(camionId);
        if (!camion) {
            logger_1.default.warn(`Camion non trouvé pour l'ID: ${camionId}`);
            return res.status(404).json({ error: 'Camion non trouvé' });
        }
        res.status(200).json(camion);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération du camion: ${error.message}, Stack: ${error.stack}`);
        res.status(500).json({ error: error.message });
    }
};
exports.getCamionHandler = getCamionHandler;
const getAllCamionsHandler = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (page - 1) * pageSize;
        const { count, rows } = await camion_1.default.findAndCountAll({
            limit: pageSize,
            offset,
        });
        logger_1.default.info(`Récupération des camions: page=${page}, pageSize=${pageSize}, total=${count}`);
        res.status(200).json({ camions: rows, total: count });
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération des camions: ${error.message}, Stack: ${error.stack}`);
        res.status(500).json({ error: error.message });
    }
};
exports.getAllCamionsHandler = getAllCamionsHandler;
const deleteCamionHandler = async (req, res) => {
    try {
        const { camionId } = req.params;
        const result = await sequelize.transaction(async (t) => {
            const camion = await camion_1.default.findByPk(camionId, { transaction: t });
            if (!camion) {
                logger_1.default.warn(`Camion non trouvé pour l'ID: ${camionId}`);
                throw new Error('Camion non trouvé');
            }
            if (camion.driverId) {
                await utilisateur_1.default.update({ camionId: null }, { where: { id: camion.driverId }, transaction: t });
                // CORRECTION: Retirer le nom du camion lors de la suppression
                await db.ref(`users/${camion.driverId}`).update({
                    camionId: null,
                    camionNom: null, // ✅ Suppression du nom du camion
                    syncStatus: 'synced',
                    time: new Date().toISOString(),
                });
            }
            await camion.destroy({ transaction: t });
            await db.ref(`camions/${camionId}`).remove();
            return true;
        });
        logger_1.default.info(`Camion supprimé: ID=${camionId}`);
        res.status(204).send();
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la suppression du camion: ${error.message}, Stack: ${error.stack}`);
        res.status(500).json({ error: error.message });
    }
};
exports.deleteCamionHandler = deleteCamionHandler;
