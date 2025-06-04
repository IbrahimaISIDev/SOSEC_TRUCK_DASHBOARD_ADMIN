"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const camionController_1 = require("../controllers/camionController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/camions', auth_1.authenticateToken, camionController_1.createCamionHandler);
router.get('/camions/:camionId', auth_1.authenticateToken, camionController_1.getCamionHandler);
router.get('/camions', auth_1.authenticateToken, camionController_1.getAllCamionsHandler);
router.put('/camions/:camionId', auth_1.authenticateToken, camionController_1.updateCamionHandler);
router.delete('/camions/:camionId', auth_1.authenticateToken, camionController_1.deleteCamionHandler);
exports.default = router;
//# sourceMappingURL=camionRoutes.js.map