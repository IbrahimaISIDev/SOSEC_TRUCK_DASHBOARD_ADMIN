"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const camionController_1 = require("../controllers/camionController");
const auth_1 = require("../middleware/auth");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
// Journal pour toutes les requêtes entrantes
router.use((req, res, next) => {
    logger_1.default.info(`Requête reçue: ${req.method} ${req.url}`, {
        headers: req.headers.authorization ? 'Authorization present' : 'No Authorization header',
        camionId: req.params.camionId,
    });
    next();
});
// Créer un camion (admin uniquement)
router.post('/camions', auth_1.authenticateToken, auth_1.authorizeAdmin, camionController_1.createCamionHandler);
// Récupérer un camion (admin uniquement)
router.get('/camions/:camionId', auth_1.authenticateToken, auth_1.authorizeAdmin, camionController_1.getCamionHandler);
// Lister tous les camions (admin uniquement)
router.get('/camions', auth_1.authenticateToken, auth_1.authorizeAdmin, camionController_1.getAllCamionsHandler);
// Mettre à jour un camion (admin uniquement)
router.patch('/camions/:camionId', auth_1.authenticateToken, auth_1.authorizeAdmin, camionController_1.updateCamionHandler);
// Supprimer un camion (admin uniquement)
router.delete('/camions/:camionId', auth_1.authenticateToken, auth_1.authorizeAdmin, camionController_1.deleteCamionHandler);
exports.default = router;
