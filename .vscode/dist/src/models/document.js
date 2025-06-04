"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const utilisateur_1 = __importDefault(require("./utilisateur"));
class Document extends sequelize_1.Model {
}
Document.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    nom: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    fichierUrl: {
        type: sequelize_1.DataTypes.STRING,
    },
    chauffeurId: {
        type: sequelize_1.DataTypes.UUID, // Changed from STRING to UUID
        allowNull: false,
        references: {
            model: 'utilisateurs', // Table name of Utilisateur model
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
    },
    dateExpiration: {
        type: sequelize_1.DataTypes.DATE,
    },
    ticketNum: {
        type: sequelize_1.DataTypes.STRING,
    },
    dateEntrance: {
        type: sequelize_1.DataTypes.DATE,
    },
    dateExit: {
        type: sequelize_1.DataTypes.DATE,
    },
    truckId: {
        type: sequelize_1.DataTypes.STRING,
    },
    product: {
        type: sequelize_1.DataTypes.STRING,
    },
    netWeight: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
    },
    extraData: {
        type: sequelize_1.DataTypes.TEXT,
    },
    syncStatus: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'pending',
    },
    time: {
        type: sequelize_1.DataTypes.STRING,
    },
}, {
    sequelize: db_1.default,
    tableName: 'documents',
    timestamps: true,
});
Document.belongsTo(utilisateur_1.default, { foreignKey: 'driverId', as: 'driver' });
exports.default = Document;
