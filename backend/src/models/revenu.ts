import { DataTypes, Model } from 'sequelize';
const sequelize = require('../config/db');
import Utilisateur from './utilisateur';
import Camion from './camion';
import Client from './client';
import Depense from './depense';
import Document from './document';
const Notification = require('../models/notification');

class Revenu extends Model {
  public id!: string;
  public montant!: number;
  public source!: string;
  public date!: Date;
  public notes?: string | null;
  public adminId!: string;
  public clientId?: string | null; // Optional: if revenues are linked to clients
  public camionId?: string | null; // Optional: if revenues are linked to trucks
  public createdAt!: Date;
  public updatedAt!: Date;

  public static associate(models: {
    Utilisateur: typeof Utilisateur;
    Camion: typeof Camion;
    Client: typeof Client;
  }) {
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

Revenu.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    montant: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    adminId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: 'utilisateurs',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    clientId: { // Optional: if revenues are linked to clients
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'clients',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    camionId: { // Optional: if revenues are linked to trucks
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'camions',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
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
  },
  {
    sequelize,
    tableName: 'revenus',
    timestamps: true,
  }
);

export default Revenu;