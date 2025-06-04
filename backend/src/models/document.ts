import { DataTypes, Model } from 'sequelize';
const sequelize = require('../config/db');
import Utilisateur from './utilisateur';
import Camion from './camion';
import Client from './client';
import Depense from './depense';
const Notification = require('../models/notification');

import Revenu from './revenu';

class Document extends Model {
  public id!: string;
  public nom!: string;
  public type!: string;
  public fichierUrl!: string;
  public driverId!: string; // Type remains string in TypeScript for UUID values
  public dateExpiration!: Date;
  public ticketNum!: string;
  public dateEntrance!: Date;
  public dateExit!: Date;
  public truckId!: string;
  public product!: string;
  public netWeight!: number;
  public extraData!: string;
  public syncStatus!: string;
  public time!: string;

  public static associate(models: { 
    Utilisateur: typeof Utilisateur; 
    Camion: typeof Camion; 
    Depense: typeof Depense; 
    Revenu: typeof Revenu; 
    Document: typeof Document; 
    Notification: typeof Notification; 
    Client: typeof Client; 
  }) {
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

Document.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fichierUrl: {
      type: DataTypes.STRING,
    },
    driverId: { // Renamed from chauffeurId to match the class property
      type: DataTypes.UUID, // Changed from STRING to UUID
      allowNull: false,
      references: {
        model: 'utilisateurs', // Table name of Utilisateur model
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    },
    dateExpiration: {
      type: DataTypes.DATE,
    },
    ticketNum: {
      type: DataTypes.STRING,
    },
    dateEntrance: {
      type: DataTypes.DATE,
    },
    dateExit: {
      type: DataTypes.DATE,
    },
    truckId: {
      type: DataTypes.UUID, // Changed to UUID for consistency
      allowNull: true,
      references: {
        model: 'camions',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    product: {
      type: DataTypes.STRING,
    },
    netWeight: {
      type: DataTypes.DECIMAL(10, 2),
    },
    extraData: {
      type: DataTypes.TEXT,
    },
    syncStatus: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
    },
    time: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    tableName: 'documents',
    timestamps: true,
  }
);

export default Document;