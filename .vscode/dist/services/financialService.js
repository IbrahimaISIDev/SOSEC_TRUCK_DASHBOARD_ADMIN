"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDepense = exports.createRevenu = void 0;
const depense_1 = __importDefault(require("../models/depense"));
const logger_1 = __importDefault(require("../utils/logger"));
const createRevenu = async (montant, source, date, notes, adminId) => {
    // Simuler la création d'un revenu (vous pouvez ajouter un modèle Revenu si nécessaire)
    const revenu = { id: `revenu_${Date.now()}`, montant, source, date, notes, adminId };
    logger_1.default.info(`Revenu créé: ${revenu.id}`);
    return revenu;
};
exports.createRevenu = createRevenu;
const createDepense = async (id, driverId, type, entryType, date, quantity, amount, description, location, paymentMethod, imageUrl, syncStatus, time, adminId) => {
    const depense = await depense_1.default.create({
        id,
        driverId,
        type,
        entryType,
        date,
        quantity,
        amount,
        description,
        location,
        paymentMethod,
        imageUrl,
        syncStatus,
        time,
        createdBy: adminId,
    });
    return depense;
};
exports.createDepense = createDepense;
//# sourceMappingURL=financialService.js.map