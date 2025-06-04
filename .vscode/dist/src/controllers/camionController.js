"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCamionsHandler = exports.deleteCamionHandler = exports.getCamionHandler = exports.updateCamionHandler = exports.createCamionHandler = void 0;
const camion_1 = __importDefault(require("../models/camion"));
const logger_1 = __importDefault(require("../utils/logger"));
const uuid_1 = require("uuid");
const createCamionHandler = async (req, res) => {
    try {
        logger_1.default.debug(`Content-Type: ${req.get('Content-Type')}`);
        logger_1.default.debug(`Raw request body: ${JSON.stringify(req.body, null, 2)}`);
        const { matricule, assuranceDetails, assuranceExpiration, nom, type } = req.body;
        // Validation avec plus de détails
        if (!nom) {
            logger_1.default.error(`Nom manquant. Type: ${typeof nom}, Valeur: ${nom}`);
            return res.status(400).json({
                error: "Le champ 'nom' est requis",
            });
        }
        if (typeof nom !== 'string') {
            logger_1.default.error(`Nom n'est pas une chaîne. Type: ${typeof nom}`);
            return res.status(400).json({
                error: "Le champ 'nom' doit être une chaîne",
            });
        }
        if (!nom.trim()) {
            logger_1.default.error(`Nom est vide après trim: '${nom}'`);
            return res.status(400).json({
                error: "Le champ 'nom' ne peut pas être vide",
            });
        }
        // Même validation pour le type
        if (!type) {
            logger_1.default.error(`Type manquant. Type: ${typeof type}, Valeur: ${type}`);
            return res.status(400).json({
                error: "Le champ 'type' est requis",
            });
        }
        if (typeof type !== 'string') {
            logger_1.default.error(`Type n'est pas une chaîne. Type: ${typeof type}`);
            return res.status(400).json({
                error: "Le champ 'type' doit être une chaîne",
            });
        }
        if (!type.trim()) {
            logger_1.default.error(`Type est vide après trim: '${type}'`);
            return res.status(400).json({
                error: "Le champ 'type' ne peut pas être vide",
            });
        }
        // Créer une copie des valeurs pour éviter de modifier les originaux
        const nomTrimmed = nom.trim();
        const typeTrimmed = type.trim();
        const camionData = {
            id: (0, uuid_1.v4)(),
            immatriculation: matricule || null,
            nom: nomTrimmed,
            type: typeTrimmed,
            assuranceDetails: assuranceDetails || null,
            assuranceExpiration: assuranceExpiration
                ? new Date(assuranceExpiration)
                : null,
            syncStatus: 'synced',
            time: new Date().toISOString(),
        };
        logger_1.default.debug(`Final camionData: ${JSON.stringify(camionData, null, 2)}`);
        // Utiliser create avec des options pour voir exactement ce qui est envoyé à la BD
        const camion = await camion_1.default.create(camionData, {
            logging: (sql) => logger_1.default.debug(`SQL executed: ${sql}`),
        });
        logger_1.default.info(`Camion créé: ID=${camion.id}`);
        res.status(201).json(camion);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la création du camion: ${error.message}, Stack: ${error.stack}`);
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors
                .map((err) => `${err.path}: ${err.message}`)
                .join(', ');
            return res
                .status(400)
                .json({ error: `Erreur de validation: ${messages}` });
        }
        res.status(500).json({ error: error.message });
    }
};
exports.createCamionHandler = createCamionHandler;
const updateCamionHandler = async (req, res) => {
    try {
        logger_1.default.debug(`Raw request body (update): ${JSON.stringify(req.body, null, 2)}`);
        const { camionId } = req.params;
        const { matricule, assuranceDetails, assuranceExpiration, nom, type } = req.body;
        if (!nom || typeof nom !== 'string' || !nom.trim()) {
            logger_1.default.error(`Invalid nom: ${nom}`);
            return res.status(400).json({
                error: "Le champ 'nom' est requis et doit être une chaîne non vide.",
            });
        }
        if (!type || typeof type !== 'string' || !type.trim()) {
            logger_1.default.error(`Invalid type: ${type}`);
            return res.status(400).json({
                error: "Le champ 'type' est requis et doit être une chaîne non vide.",
            });
        }
        const camion = await camion_1.default.findByPk(camionId);
        if (!camion) {
            logger_1.default.warn(`Camion non trouvé pour l'ID: ${camionId}`);
            return res.status(404).json({ error: 'Camion non trouvé' });
        }
        const updateData = {
            immatriculation: matricule || null,
            nom: nom.trim(),
            type: type.trim(),
            assuranceDetails: assuranceDetails || null,
            assuranceExpiration: assuranceExpiration
                ? new Date(assuranceExpiration)
                : null,
            syncStatus: 'synced',
            time: new Date().toISOString(),
        };
        logger_1.default.debug(`Final updateData: ${JSON.stringify(updateData, null, 2)}`);
        await camion.update(updateData);
        logger_1.default.info(`Camion mis à jour: ID=${camion.id}`);
        res.status(200).json(camion);
    }
    catch (error) {
        logger_1.default.error(`Erreur: ${error.message}, Stack: ${error.stack}`);
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors
                .map((err) => `${err.path}: ${err.message}`)
                .join(', ');
            return res
                .status(400)
                .json({ error: `Erreur de validation: ${messages}` });
        }
        res.status(500).json({ error: error.message });
    }
};
exports.updateCamionHandler = updateCamionHandler;
// Les autres fonctions restent identiques
const getCamionHandler = async (req, res) => {
    try {
        const { camionId } = req.params;
        const camion = await camion_1.default.findByPk(camionId);
        if (!camion) {
            return res.status(404).json({ error: 'Camion non trouvé' });
        }
        res.status(200).json(camion);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération du camion: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.getCamionHandler = getCamionHandler;
const deleteCamionHandler = async (req, res) => {
    try {
        const { camionId } = req.params;
        const camion = await camion_1.default.findByPk(camionId);
        if (!camion) {
            return res.status(404).json({ error: 'Camion non trouvé' });
        }
        await camion.destroy();
        logger_1.default.info(`Camion supprimé: ${camion.id}`);
        res.status(204).send();
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la suppression du camion: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.deleteCamionHandler = deleteCamionHandler;
const getAllCamionsHandler = async (req, res) => {
    try {
        const camions = await camion_1.default.findAll();
        res.status(200).json(camions);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération des camions: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.getAllCamionsHandler = getAllCamionsHandler;
