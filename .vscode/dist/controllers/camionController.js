"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCamionsHandler = exports.deleteCamionHandler = exports.updateCamionHandler = exports.getCamionHandler = exports.createCamionHandler = void 0;
const camion_1 = __importDefault(require("../models/camion"));
const logger_1 = __importDefault(require("../utils/logger"));
const createCamionHandler = async (req, res) => {
    try {
        const { matricule, photoUrl, assuranceDetails, assuranceExpiration } = req.body;
        const camion = await camion_1.default.create({
            matricule,
            photoUrl,
            assuranceDetails,
            assuranceExpiration: assuranceExpiration ? new Date(assuranceExpiration) : undefined,
        });
        logger_1.default.info(`Camion créé: ${camion.id}`);
        res.status(201).json(camion);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la création du camion: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};
exports.createCamionHandler = createCamionHandler;
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
const updateCamionHandler = async (req, res) => {
    try {
        const { camionId } = req.params;
        const { matricule, photoUrl, assuranceDetails, assuranceExpiration } = req.body;
        const camion = await camion_1.default.findByPk(camionId);
        if (!camion) {
            return res.status(404).json({ error: 'Camion non trouvé' });
        }
        await camion.update({
            matricule,
            photoUrl,
            assuranceDetails,
            assuranceExpiration: assuranceExpiration ? new Date(assuranceExpiration) : undefined,
        });
        logger_1.default.info(`Camion mis à jour: ${camion.id}`);
        res.status(200).json(camion);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la mise à jour du camion: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};
exports.updateCamionHandler = updateCamionHandler;
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
//# sourceMappingURL=camionController.js.map