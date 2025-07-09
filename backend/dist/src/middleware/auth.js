"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeAdminOrDriver = exports.authorizeDriver = exports.authorizeAdmin = exports.authorizeRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const utilisateur_1 = __importDefault(require("../models/utilisateur"));
const logger_1 = __importDefault(require("../utils/logger"));
const JWT_SECRET = process.env.JWT_SECRET || (() => {
    throw new Error('JWT_SECRET is not defined in environment variables');
})();
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Accès non autorisé' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await utilisateur_1.default.findByPk(decoded.id); // Simplified, assuming stateless JWT
        if (!user) {
            return res.status(403).json({ error: 'Utilisateur non trouvé' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        logger_1.default.error(`Erreur d'authentification: ${error.message}`);
        res.status(403).json({ error: 'Token invalide' });
    }
};
exports.authenticateToken = authenticateToken;
const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Accès interdit' });
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
const authorizeAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès interdit' });
    }
    next();
};
exports.authorizeAdmin = authorizeAdmin;
const authorizeDriver = (req, res, next) => {
    if (!req.user || req.user.role !== 'driver') {
        return res.status(403).json({ error: 'Accès interdit' });
    }
    next();
};
exports.authorizeDriver = authorizeDriver;
const authorizeAdminOrDriver = (req, res, next) => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'driver')) {
        return res.status(403).json({ error: 'Accès interdit' });
    }
    next();
};
exports.authorizeAdminOrDriver = authorizeAdminOrDriver;
