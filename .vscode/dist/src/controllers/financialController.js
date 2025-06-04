"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMileagesByDateHandler = exports.getTicketsByDateHandler = exports.getAllDepensesHandler = exports.getDepensesByDateHandler = exports.createDepenseHandler = exports.createRevenuHandler = void 0;
const sequelize_1 = require("sequelize");
const financialService_1 = require("../services/financialService");
const depense_1 = __importDefault(require("../models/depense"));
const document_1 = __importDefault(require("../models/document"));
const mileage_1 = __importDefault(require("../models/mileage"));
const logger_1 = __importDefault(require("../utils/logger"));
const createRevenuHandler = async (req, res) => {
    var _a;
    try {
        const { montant, source, date, notes } = req.body;
        const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!adminId) {
            return res.status(401).json({ error: 'Authentification requise' });
        }
        const revenu = await (0, financialService_1.createRevenu)(montant, source, new Date(date), notes, adminId);
        res.status(201).json(revenu);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la création du revenu: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};
exports.createRevenuHandler = createRevenuHandler;
const createDepenseHandler = async (req, res) => {
    var _a;
    try {
        const { id, driverId, type, entryType, date, quantity, amount, description, location, paymentMethod, imageUrl, syncStatus, time } = req.body;
        const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!adminId) {
            return res.status(401).json({ error: 'Authentification requise' });
        }
        const depense = await (0, financialService_1.createDepense)(id, driverId, type, entryType, new Date(date), quantity, amount, description, location, paymentMethod, imageUrl, syncStatus, time, adminId);
        res.status(201).json(depense);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la création de la dépense: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};
exports.createDepenseHandler = createDepenseHandler;
const getDepensesByDateHandler = async (req, res) => {
    try {
        const { date } = req.params;
        const startDate = new Date(date);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        const depenses = await depense_1.default.findAll({
            where: {
                date: {
                    [sequelize_1.Op.between]: [startDate, endDate],
                },
            },
        });
        res.status(200).json(depenses);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération des dépenses: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.getDepensesByDateHandler = getDepensesByDateHandler;
const getAllDepensesHandler = async (req, res) => {
    try {
        const depenses = await depense_1.default.findAll();
        res.status(200).json(depenses);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération des dépenses: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.getAllDepensesHandler = getAllDepensesHandler;
const getTicketsByDateHandler = async (req, res) => {
    try {
        const { date } = req.params;
        const startDate = new Date(date);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        const tickets = await document_1.default.findAll({
            where: {
                dateEntrance: {
                    [sequelize_1.Op.between]: [startDate, endDate],
                },
            },
        });
        res.status(200).json(tickets);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération des tickets: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.getTicketsByDateHandler = getTicketsByDateHandler;
const getMileagesByDateHandler = async (req, res) => {
    try {
        const { date } = req.params;
        const startDate = new Date(date);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        const mileages = await mileage_1.default.findAll({
            where: {
                date: {
                    [sequelize_1.Op.between]: [startDate, endDate],
                },
            },
        });
        res.status(200).json(mileages);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération des mileages: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.getMileagesByDateHandler = getMileagesByDateHandler;
