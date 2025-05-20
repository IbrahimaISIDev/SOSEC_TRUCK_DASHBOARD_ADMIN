import { DataTypes, Model, ForeignKey } from 'sequelize';
import sequelize from '../config/db';
import Utilisateur from './utilisateur'; // Import Utilisateur pour l'association

class Camion extends Model {
  public id!: string;
  public nom!: string;
  public type!: string;
  public immatriculation?: string;
  public syncStatus?: string;
  public time?: string;
  public assuranceDetails?: object;
  public assuranceExpiration?: Date;
  public driverId?: ForeignKey<Utilisateur['id']>; // Clé étrangère vers Utilisateur
  public createdAt!: Date;
  public updatedAt!: Date;

  public static associate(models: any) {
    // Définir l'association 1:1 avec Utilisateur
    Camion.belongsTo(models.Utilisateur, {
      foreignKey: 'driverId',
      as: 'driver',
      onDelete: 'SET NULL', // Si le chauffeur est supprimé, le lien est annulé
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
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Le nom ne peut pas être une chaîne vide',
        },
      },
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Le type ne peut pas être une chaîne vide',
        },
      },
    },
    immatriculation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    syncStatus: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'synced',
    },
    time: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: () => new Date().toISOString(),
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
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'utilisateurs',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'camions',
    timestamps: true,
  }
);

export default Camion;