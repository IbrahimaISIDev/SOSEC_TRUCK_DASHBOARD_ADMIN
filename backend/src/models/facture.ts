import { DataTypes, Model } from 'sequelize';
const sequelize = require('../config/db');

class Facture extends Model {}

Facture.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    numero: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    clientNom: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    clientAdresse: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    clientTelephone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    clientEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    societeNom: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    societeAdresse: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    societeSiret: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    lignes: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    totalHT: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    tva: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    totalTTC: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    commentaire: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    statut: {
      type: DataTypes.ENUM('brouillon', 'envoyée', 'payée'),
      allowNull: false,
      defaultValue: 'brouillon',
    },
    pdfUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'factures',
    timestamps: true,
  }
);

export default Facture;
// export interface LigneFacture {
//   designation: string;
//   quantite: number;
//   prixUnitaire: number;
//   totalLigne: number;
//   poids?: string; // Weight, e.g., "75,740 T"
//   destination?: string; // Destination, e.g., "PORT - SENICO"
// }