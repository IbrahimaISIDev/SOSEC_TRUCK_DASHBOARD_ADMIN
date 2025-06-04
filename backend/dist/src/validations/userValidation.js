"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserValidationRules = exports.createUserValidationRules = void 0;
const express_validator_1 = require("express-validator");
exports.createUserValidationRules = [
    (0, express_validator_1.body)('nom')
        .notEmpty()
        .withMessage('Le nom est requis')
        .trim()
        .escape(),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Email invalide')
        .normalizeEmail()
        .custom(async (value) => {
        const { default: Utilisateur } = await Promise.resolve().then(() => __importStar(require('../models/utilisateur')));
        const existingUser = await Utilisateur.findOne({ where: { email: value } });
        if (existingUser) {
            throw new Error('Cet email est déjà utilisé');
        }
    }),
    (0, express_validator_1.body)('role')
        .isIn(['admin', 'driver'])
        .withMessage('Le rôle doit être "admin" ou "driver"'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Le mot de passe est requis')
        .isLength({ min: 6 })
        .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    (0, express_validator_1.body)('permisNumero')
        .optional()
        .trim()
        .escape(),
    (0, express_validator_1.body)('permisDelivrance')
        .optional()
        .isISO8601()
        .withMessage('Date de délivrance invalide')
        .toDate(),
    (0, express_validator_1.body)('permisExpiration')
        .optional()
        .isISO8601()
        .withMessage('Date d\'expiration invalide')
        .toDate(),
    (0, express_validator_1.body)('permisLieu')
        .optional()
        .trim()
        .escape(),
    (0, express_validator_1.body)('permisCategorie')
        .optional()
        .trim()
        .escape(),
];
exports.updateUserValidationRules = [
    (0, express_validator_1.body)('nom')
        .optional()
        .notEmpty()
        .withMessage('Le nom est requis')
        .trim()
        .escape(),
    (0, express_validator_1.body)('email')
        .optional()
        .isEmail()
        .withMessage('Email invalide')
        .normalizeEmail()
        .custom(async (value, { req }) => {
        var _a, _b;
        const { default: Utilisateur } = await Promise.resolve().then(() => __importStar(require('../models/utilisateur')));
        const userId = (_b = (_a = req.params) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : '';
        const existingUser = await Utilisateur.findOne({ where: { email: value } });
        if (existingUser && existingUser.id !== userId) {
            throw new Error('Cet email est déjà utilisé');
        }
    }),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['admin', 'driver'])
        .withMessage('Le rôle doit être "admin" ou "driver"'),
    (0, express_validator_1.body)('password')
        .optional()
        .isLength({ min: 6 })
        .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    (0, express_validator_1.body)('permisNumero')
        .optional()
        .trim()
        .escape(),
    (0, express_validator_1.body)('permisDelivrance')
        .optional()
        .isISO8601()
        .withMessage('Date de délivrance invalide')
        .toDate(),
    (0, express_validator_1.body)('permisExpiration')
        .optional()
        .isISO8601()
        .withMessage('Date d\'expiration invalide')
        .toDate(),
    (0, express_validator_1.body)('permisLieu')
        .optional()
        .trim()
        .escape(),
    (0, express_validator_1.body)('permisCategorie')
        .optional()
        .trim()
        .escape(),
];
