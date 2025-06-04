"use strict";
// src/models/notification.ts
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const Utilisateur = require('./utilisateur');
class NotificationModel extends Model {
    static associate(models) {
        NotificationModel.belongsTo(models.Utilisateur, {
            foreignKey: 'utilisateurId',
            as: 'utilisateur',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
    }
}
NotificationModel.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    utilisateurId: {
        type: DataTypes.STRING, // Match Utilisateur.id
        allowNull: false,
        references: {
            model: 'utilisateurs',
            key: 'id',
        },
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('permis_expiration', 'autre'),
        allowNull: false,
    },
    daysRemaining: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
});
module.exports = NotificationModel;
