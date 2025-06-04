import { DataTypes, Model, ForeignKey } from 'sequelize';
const sequelize = require('../config/db');
import Utilisateur from './utilisateur';

class Depense extends Model {
  public id!: string;
  public driverId!: ForeignKey<Utilisateur['id']>; // Typage correct avec ForeignKey
  public type!: string;
  public entryType!: string;
  public date!: Date;
  public quantity!: number;
  public amount!: number;
  public description?: string;
  public location?: string;
  public paymentMethod?: string;
  public imageUrl?: string;
  public syncStatus!: string;
  public time!: string;
  public adminId?: ForeignKey<Utilisateur['id']>; // Ajout de adminId
  public lastSyncTime?: string;

  public static associate(models: any) {
    Depense.belongsTo(models.Utilisateur, { foreignKey: 'adminId', as: 'admin' });
    Depense.belongsTo(models.Utilisateur, { foreignKey: 'driverId', as: 'driver' });
  }
}

Depense.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    driverId: {
      type: DataTypes.UUID, // Changement de STRING à UUID pour correspondre à Utilisateur.id
      allowNull: false,
      references: {
        model: 'utilisateurs', // Nom de la table
        key: 'id', // Champ référencé
      },
      onDelete: 'RESTRICT', // Empêche la suppression d'un utilisateur si des dépenses y sont liées
      onUpdate: 'CASCADE',
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entryType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true, // Vérifie si cela doit être requis
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    syncStatus: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
      allowNull: true,
    },
    time: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    adminId: {
      type: DataTypes.UUID, // Ajout du champ adminId
      allowNull: true, // Peut être null si la dépense n'est pas liée à un admin
      references: {
        model: 'utilisateurs',
        key: 'id',
      },
      onDelete: 'SET NULL', // Si l'admin est supprimé, mettre à null
      onUpdate: 'CASCADE',
    },
    lastSyncTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'depenses',
    timestamps: true,
  }
);

export default Depense;