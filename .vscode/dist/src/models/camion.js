"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/camion.js
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Camion extends sequelize_1.Model {
}
Camion.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    nom: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Le nom ne peut pas être une chaîne vide"
            }
        }
    },
    type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Le type ne peut pas être une chaîne vide"
            }
        }
    },
    immatriculation: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    syncStatus: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: 'synced',
    },
    time: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: () => new Date().toISOString(),
    },
    assuranceDetails: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    assuranceExpiration: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: db_1.default,
    tableName: 'camions',
    timestamps: true,
});
exports.default = Camion;
