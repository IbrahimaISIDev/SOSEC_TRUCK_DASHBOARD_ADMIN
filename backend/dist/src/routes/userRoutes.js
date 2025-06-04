"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
// Journal pour toutes les requêtes entrantes
router.use((req, res, next) => {
    logger_1.default.info(`Requête reçue: ${req.method} ${req.url}`);
    next();
});
// Récupérer un utilisateur par ID
router.get('/users/:userId', auth_1.authenticateToken, userController_1.getUserHandler);
// Récupérer tous les utilisateurs
router.get('/users', auth_1.authenticateToken, userController_1.getAllUsersHandler);
// Créer un utilisateur
router.post('/users', auth_1.authenticateToken, userController_1.createUserHandler);
// Mettre à jour un utilisateur
router.patch('/users/:userId', auth_1.authenticateToken, userController_1.updateUserHandler);
// Supprimer un utilisateur
router.delete('/users/:userId', auth_1.authenticateToken, userController_1.deleteUserHandler);
// Assigner un camion à un chauffeur
router.post('/users/:userId/assign-camion', auth_1.authenticateToken, auth_1.authorizeAdmin, userController_1.assignCamionToDriver);
// Retirer un camion d'un chauffeur
router.post('/users/:userId/remove-camion', auth_1.authenticateToken, userController_1.removeCamionFromDriver);
exports.default = router;
