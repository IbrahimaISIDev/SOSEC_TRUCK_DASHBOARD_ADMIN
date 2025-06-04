"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const utilisateur_1 = __importDefault(require("../models/utilisateur"));
const logger_1 = __importDefault(require("../utils/logger"));
const JWT_SECRET = process.env.JWT_SECRET || 'c57f6619b230a8735fa7dd2fb2753d581c3311be1b0daa490fdbada15d6652ce4ba6c239cf9e44c8f5f1675693b25a02ae480e2b37c6946e243994195cf9afaf';
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Accès non autorisé' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await utilisateur_1.default.findOne({ where: { id: decoded.id, token } });
        if (!user) {
            return res.status(403).json({ error: 'Token invalide' });
        }
        // Assigner l'utilisateur complet à req.user
        req.user = user; // Compatible avec l'interface étendue
        next();
    }
    catch (error) {
        logger_1.default.error(`Erreur d'authentification: ${error.message}`);
        res.status(403).json({ error: 'Token invalide' });
    }
};
exports.authenticateToken = authenticateToken;
