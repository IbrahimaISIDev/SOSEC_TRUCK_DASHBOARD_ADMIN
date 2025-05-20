import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import Utilisateur from './utilisateur';

class Document extends Model {
  public id!: string;
  public nom!: string;
  public type!: string;
  public fichierUrl!: string;
  // public chauffeurId!: string; // Type remains string in TypeScript for UUID values
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
    chauffeurId: {
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
      type: DataTypes.STRING,
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

Document.belongsTo(Utilisateur, { foreignKey: 'driverId', as: 'driver' });

export default Document;