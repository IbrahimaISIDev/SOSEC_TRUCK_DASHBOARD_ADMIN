"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Utilisateur extends sequelize_1.Model {
    static associate(models) {
        // Define associations here if needed
    }
}
Utilisateur.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    nom: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    email: { type: sequelize_1.DataTypes.STRING, allowNull: false, unique: true },
    role: { type: sequelize_1.DataTypes.ENUM('admin', 'driver'), allowNull: false },
    permisNumero: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    permisDelivrance: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    permisExpiration: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    permisLieu: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    permisCategorie: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    token: { type: sequelize_1.DataTypes.TEXT, allowNull: true }, // Changed to TEXT for long JWT tokens
    syncStatus: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    time: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: db_1.default,
    tableName: 'utilisateurs',
    timestamps: true,
});
exports.default = Utilisateur;
