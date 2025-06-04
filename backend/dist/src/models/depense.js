"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize = require('../config/db');
class Depense extends sequelize_1.Model {
    static associate(models) {
        Depense.belongsTo(models.Utilisateur, { foreignKey: 'adminId', as: 'admin' });
        Depense.belongsTo(models.Utilisateur, { foreignKey: 'driverId', as: 'driver' });
    }
}
Depense.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    driverId: {
        type: sequelize_1.DataTypes.UUID, // Changement de STRING à UUID pour correspondre à Utilisateur.id
        allowNull: false,
        references: {
            model: 'utilisateurs', // Nom de la table
            key: 'id', // Champ référencé
        },
        onDelete: 'RESTRICT', // Empêche la suppression d'un utilisateur si des dépenses y sont liées
        onUpdate: 'CASCADE',
    },
    type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    entryType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    quantity: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true, // Vérifie si cela doit être requis
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    location: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    paymentMethod: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    imageUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    syncStatus: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'pending',
        allowNull: true,
    },
    time: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    adminId: {
        type: sequelize_1.DataTypes.UUID, // Ajout du champ adminId
        allowNull: true, // Peut être null si la dépense n'est pas liée à un admin
        references: {
            model: 'utilisateurs',
            key: 'id',
        },
        onDelete: 'SET NULL', // Si l'admin est supprimé, mettre à null
        onUpdate: 'CASCADE',
    },
    lastSyncTime: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize,
    tableName: 'depenses',
    timestamps: true,
});
exports.default = Depense;
