"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const firebase_1 = require("../config/firebase");
const logger_1 = __importDefault(require("./logger"));
const testConnections = async () => {
    try {
        // Test PostgreSQL
        await db_1.default.authenticate();
        logger_1.default.info('Connexion à PostgreSQL établie avec succès');
        // Test Firebase
        await firebase_1.db.ref('test').once('value');
        logger_1.default.info('Connexion à Firebase établie avec succès');
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la vérification des connexions: ${error.message}`);
        process.exit(1);
    }
};
exports.default = testConnections;
//# sourceMappingURL=testConnections.js.map