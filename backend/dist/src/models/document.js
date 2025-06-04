"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize = require('../config/db');
const Notification = require('../models/notification');
class Document extends sequelize_1.Model {
    static associate(models) {
        // Association with Utilisateur (driver)
        Document.belongsTo(models.Utilisateur, {
            foreignKey: 'driverId',
            as: 'driver',
            onDelete: 'NO ACTION',
            onUpdate: 'CASCADE',
        });
        // Optional: Association with Camion (if documents are tied to trucks)
        Document.belongsTo(models.Camion, {
            foreignKey: 'truckId',
            as: 'truck',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        });
        // You can add more associations here if needed
        // For example, if documents are related to expenses or revenues
    }
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
    driverId: {
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
        type: sequelize_1.DataTypes.UUID, // Changed to UUID for consistency
        allowNull: true,
        references: {
            model: 'camions',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
    sequelize,
    tableName: 'documents',
    timestamps: true,
});
exports.default = Document;
