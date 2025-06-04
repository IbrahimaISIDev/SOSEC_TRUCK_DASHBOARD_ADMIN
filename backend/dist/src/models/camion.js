"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/camion.ts
const sequelize_1 = require("sequelize");
const sequelize = require('../config/db');
class Camion extends sequelize_1.Model {
    static associate(models) {
        Camion.belongsTo(models.Utilisateur, {
            foreignKey: 'driverId',
            as: 'chauffeur',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        });
    }
}
Camion.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    immatriculation: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    nom: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    type: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    assuranceDetails: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    assuranceExpiration: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    driverId: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        references: {
            model: 'utilisateurs',
            key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        unique: 'unique_driverId', // Enforce 1:1 relationship
    },
    syncStatus: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'synced',
    },
    time: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
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
    tableName: 'camions',
    timestamps: true,
});
exports.default = Camion;
