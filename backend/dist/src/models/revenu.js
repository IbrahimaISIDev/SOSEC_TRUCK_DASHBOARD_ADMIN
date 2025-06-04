"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize = require('../config/db');
const Notification = require('../models/notification');
class Revenu extends sequelize_1.Model {
    static associate(models) {
        // Association with Utilisateur (admin who recorded the revenue)
        Revenu.belongsTo(models.Utilisateur, {
            foreignKey: 'adminId',
            as: 'admin',
            onDelete: 'RESTRICT', // Prevent deletion of admin if revenues exist
            onUpdate: 'CASCADE',
        });
        // Optional: Association with Client (if revenues are tied to clients)
        Revenu.belongsTo(models.Client, {
            foreignKey: 'clientId',
            as: 'client',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        });
        // Optional: Association with Camion (if revenues are tied to trucks)
        Revenu.belongsTo(models.Camion, {
            foreignKey: 'camionId',
            as: 'camion',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        });
    }
}
Revenu.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    montant: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    source: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    notes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    adminId: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        references: {
            model: 'utilisateurs',
            key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
    },
    clientId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'clients',
            key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    },
    camionId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'camions',
            key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    },
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
    sequelize,
    tableName: 'revenus',
    timestamps: true,
});
exports.default = Revenu;
