"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncDataHandler = void 0;
const syncService_1 = require("../services/syncService");
const logger_1 = __importDefault(require("../utils/logger"));
const syncDataHandler = async (req, res) => {
    try {
        await Promise.all([(0, syncService_1.syncTickets)(), (0, syncService_1.syncExpenses)(), (0, syncService_1.syncMileages)(), (0, syncService_1.syncUsers)(), (0, syncService_1.syncCamions)()]);
        // logger.info('Synchronisation des données en cours...');
        // await Promise.all([syncTickets(), syncExpenses(), syncMileages()]);
        // logger.info('Synchronisation des tickets, dépenses et kilométrages terminée');
        logger_1.default.info('Synchronisation des données terminée');
        res.status(200).json({ message: 'Synchronisation terminée' });
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la synchronisation: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.syncDataHandler = syncDataHandler;
