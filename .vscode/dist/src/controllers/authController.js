"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginHandler = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const utilisateur_1 = __importDefault(require("../models/utilisateur"));
const logger_1 = __importDefault(require("../utils/logger"));
const JWT_SECRET = process.env.JWT_SECRET || '';
const loginHandler = async (req, res) => {
    var _a, _b, _c, _d;
    try {
        console.log('Requête reçue pour login:', req.body); // Log
        const { email, role } = req.body;
        // Validation des champs requis
        if (!email || !role) {
            console.log('Échec de la validation: email ou rôle manquant'); // Log
            return res.status(400).json({ error: 'Les champs email et role sont requis' });
        }
        // Vérification de l'existence de l'utilisateur
        const user = await utilisateur_1.default.findOne({ where: { email } });
        console.log('Utilisateur trouvé:', user ? user.dataValues : 'Aucun utilisateur'); // Log
        if (!user || user.role !== role) {
            console.log('Échec de la vérification: utilisateur non trouvé ou rôle incorrect'); // Log
            return res.status(401).json({ error: 'Identifiants invalides' });
        }
        // Validation des informations du permis pour les drivers
        if (user.role === 'driver') {
            if (!user.permisNumero || !user.permisExpiration) {
                console.log('Échec de la validation: permisNumero ou permisExpiration manquant pour driver'); // Log
                return res.status(401).json({ error: 'Informations de permis manquantes pour le conducteur' });
            }
            // Vérifier si le permis est expiré
            const now = new Date();
            if (user.permisExpiration && user.permisExpiration < now) {
                console.log('Échec de la validation: permis expiré'); // Log
                return res.status(401).json({ error: 'Le permis de conduire est expiré' });
            }
        }
        // Générer le token JWT
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            role: user.role,
            email: user.email,
        }, JWT_SECRET, { expiresIn: '2h' });
        // Sauvegarder le token dans la base de données
        await user.update({ token });
        console.log('Token généré:', token); // Log
        // Réponse avec les informations de l'utilisateur et le token
        res.status(200).json({
            token,
            user: {
                id: user.id,
                nom: user.nom,
                email: user.email,
                role: user.role,
                permisNumero: user.permisNumero,
                permisDelivrance: (_b = (_a = user.permisDelivrance) === null || _a === void 0 ? void 0 : _a.toISOString()) !== null && _b !== void 0 ? _b : null,
                permisExpiration: (_d = (_c = user.permisExpiration) === null || _c === void 0 ? void 0 : _c.toISOString()) !== null && _d !== void 0 ? _d : null,
                permisLieu: user.permisLieu,
                permisCategorie: user.permisCategorie,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
            },
        });
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la connexion: ${error.message}`);
        console.log('Erreur serveur:', error.message); // Log
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
exports.loginHandler = loginHandler;
