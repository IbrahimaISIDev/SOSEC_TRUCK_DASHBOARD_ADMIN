// src/models/camion.ts
import { DataTypes, Model } from 'sequelize';
const sequelize = require('../config/db');

class Camion extends Model {
  public id!: string;
  public immatriculation!: string | null;
  public nom!: string;
  public type!: string;
  public assuranceDetails!: object | null;
  public assuranceExpiration!: Date | null;
  public driverId!: string | null;
  public syncStatus!: string;
  public time!: string;
  public createdAt!: Date;
  public updatedAt!: Date;

  public static associate(models: {
    Utilisateur: typeof import('./utilisateur').default;
  }) {
    Camion.belongsTo(models.Utilisateur, {
      foreignKey: 'driverId',
      as: 'chauffeur',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  }
}

Camion.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    immatriculation: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    nom: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    assuranceDetails: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    assuranceExpiration: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    driverId: {
      type: DataTypes.STRING(255),
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
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'synced',
    },
    time: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
    tableName: 'camions',
    timestamps: true,
  }
);

export default Camion;