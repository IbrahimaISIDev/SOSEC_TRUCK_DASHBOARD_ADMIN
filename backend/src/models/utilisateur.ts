// src/models/utilisateur.ts
import { DataTypes, Model } from 'sequelize';
import { hash } from 'bcrypt';
const sequelize = require('../config/db');

class Utilisateur extends Model {
  public id!: string;
  public nom!: string;
  public email!: string;
  public role!: 'admin' | 'driver';
  public password!: string;
  public permisNumero?: string | null;
  public permisDelivrance?: Date | null;
  public permisExpiration?: Date | null;
  public permisLieu?: string | null;
  public permisCategorie?: string | null;
  public token?: string | null;
  public syncStatus?: string | null;
  public time?: string | null;
  public camionId?: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
  public telephone?: string | null;
  public adresse?: string | null;

  public static associate(models: any) {
    Utilisateur.belongsTo(models.Camion, {
      foreignKey: 'camionId',
      as: 'camion',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  }
}

Utilisateur.init(
  {
    id: {
      type: DataTypes.STRING(255), // Spécifier la longueur pour correspondre aux UIDs Firebase
      primaryKey: true,
      allowNull: false,
    },
    nom: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    role: {
      type: DataTypes.ENUM('admin', 'driver'),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    permisNumero: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    permisDelivrance: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    permisExpiration: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    permisLieu: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    permisCategorie: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    telephone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    adresse: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    syncStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'synced',
    },
    time: {
      type: DataTypes.STRING(255), // ISO string
      allowNull: true,
    },
    camionId: {
      type: DataTypes.UUID,
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
    tableName: 'utilisateurs',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const saltRounds = 10;
          user.password = await hash(user.password, saltRounds);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password') && user.password) {
          const saltRounds = 10;
          user.password = await hash(user.password, saltRounds);
        }
      },
    },
  }
);

Utilisateur.associate = (models) => {
  Utilisateur.belongsTo(models.Camion, {
    foreignKey: 'camionId',
    as: 'camion',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
};

export default Utilisateur;
