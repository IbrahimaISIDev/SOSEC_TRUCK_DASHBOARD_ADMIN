"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/models/index.ts
const sequelize_1 = require("sequelize");
const utilisateur_1 = __importDefault(require("../src/models/utilisateur"));
const camion_1 = __importDefault(require("../src/models/camion"));
const document_1 = __importDefault(require("../src/models/document"));
const depense_1 = __importDefault(require("../src/models/depense"));
const mileage_1 = __importDefault(require("../src/models/mileage"));
const sequelize = new sequelize_1.Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'postgres',
    logging: false,
});
const db = {
    sequelize,
    Sequelize: sequelize_1.Sequelize,
    Utilisateur: utilisateur_1.default,
    Camion: camion_1.default,
    Document: document_1.default,
    Depense: depense_1.default,
    Mileage: mileage_1.default,
};
// Initialize models
Object.values(db).forEach((model) => {
    if (model.associate) {
        model.associate(db);
    }
});
exports.default = db;
