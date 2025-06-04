"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersFromFirebase = exports.getMileagesFromFirebase = exports.getExpensesFromFirebase = exports.getTicketsFromFirebase = exports.getAllDataHandler = void 0;
const sequelize_1 = require("sequelize");
const firebase_1 = require("../config/firebase");
const document_1 = __importDefault(require("../models/document"));
const depense_1 = __importDefault(require("../models/depense"));
const mileage_1 = __importDefault(require("../models/mileage"));
const logger_1 = __importDefault(require("../utils/logger"));
const getAllDataHandler = async (req, res) => {
    try {
        const { date } = req.query;
        let whereClause = {};
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            whereClause = {
                date: {
                    [sequelize_1.Op.between]: [startDate, endDate],
                },
            };
        }
        const [tickets, depenses, mileages] = await Promise.all([
            document_1.default.findAll({ where: whereClause }),
            depense_1.default.findAll({ where: whereClause }),
            mileage_1.default.findAll({ where: whereClause }),
        ]);
        res.status(200).json({
            tickets,
            depenses,
            mileages,
        });
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération des données: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.getAllDataHandler = getAllDataHandler;
const getTicketsFromFirebase = async (req, res) => {
    try {
        const { date } = req.query;
        const ticketsRef = firebase_1.db.ref('tickets');
        const snapshot = await ticketsRef.once('value');
        let tickets = snapshot.val() || {};
        if (date) {
            tickets = tickets[date] || {};
        }
        const result = [];
        for (const date in tickets) {
            for (const ticketId in tickets[date]) {
                result.push({ id: ticketId, ...tickets[date][ticketId] });
            }
        }
        res.status(200).json(result);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération des tickets depuis Firebase: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.getTicketsFromFirebase = getTicketsFromFirebase;
const getExpensesFromFirebase = async (req, res) => {
    try {
        const { date } = req.query;
        const expensesRef = firebase_1.db.ref('expenses');
        const snapshot = await expensesRef.once('value');
        let expenses = snapshot.val() || {};
        if (date) {
            expenses = expenses[date] || {};
        }
        const result = [];
        for (const date in expenses) {
            for (const expenseId in expenses[date]) {
                result.push({ id: expenseId, ...expenses[date][expenseId] });
            }
        }
        res.status(200).json(result);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération des dépenses depuis Firebase: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.getExpensesFromFirebase = getExpensesFromFirebase;
const getMileagesFromFirebase = async (req, res) => {
    try {
        const { date } = req.query;
        const mileageRef = firebase_1.db.ref('mileage');
        const snapshot = await mileageRef.once('value');
        let mileages = snapshot.val() || {};
        if (date) {
            mileages = mileages[date] || {};
        }
        const result = [];
        for (const date in mileages) {
            for (const mileageId in mileages[date]) {
                result.push({ id: mileageId, ...mileages[date][mileageId] });
            }
        }
        res.status(200).json(result);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération des mileages depuis Firebase: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.getMileagesFromFirebase = getMileagesFromFirebase;
const getUsersFromFirebase = async (req, res) => {
    try {
        const usersRef = firebase_1.db.ref('users');
        const snapshot = await usersRef.once('value');
        const users = snapshot.val() || {};
        const result = [];
        for (const userId in users) {
            result.push({ id: userId, ...users[userId] });
        }
        res.status(200).json(result);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération des utilisateurs depuis Firebase: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.getUsersFromFirebase = getUsersFromFirebase;
