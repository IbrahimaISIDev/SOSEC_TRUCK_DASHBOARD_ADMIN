"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/utilisateur.ts
const sequelize_1 = require("sequelize");
const bcrypt_1 = require("bcrypt");
const sequelize = require('../config/db');
class Utilisateur extends sequelize_1.Model {
    static associate(models) {
        Utilisateur.belongsTo(models.Camion, {
            foreignKey: 'camionId',
            as: 'camion',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        });
    }
}
Utilisateur.init({
    id: {
        type: sequelize_1.DataTypes.STRING(255), // Spécifier la longueur pour correspondre aux UIDs Firebase
        primaryKey: true,
        allowNull: false,
    },
    nom: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    role: {
        type: sequelize_1.DataTypes.ENUM('admin', 'driver'),
        allowNull: false,
    },
    password: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    permisNumero: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    permisDelivrance: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    permisExpiration: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    permisLieu: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    permisCategorie: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    token: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    syncStatus: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'synced',
    },
    time: {
        type: sequelize_1.DataTypes.STRING(255), // ISO string
        allowNull: true,
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
        unique: 'unique_camionId', // Ajouter la contrainte d'unicité
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
    tableName: 'utilisateurs',
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const saltRounds = 10;
                user.password = await (0, bcrypt_1.hash)(user.password, saltRounds);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password') && user.password) {
                const saltRounds = 10;
                user.password = await (0, bcrypt_1.hash)(user.password, saltRounds);
            }
        },
    },
});
exports.default = Utilisateur;
