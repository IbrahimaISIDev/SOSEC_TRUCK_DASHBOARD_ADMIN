import { DataTypes, Model, ForeignKey } from 'sequelize';
import sequelize from '../config/db';
import bcrypt from 'bcrypt';
import Camion from './camion';

class Utilisateur extends Model {
  public id!: string;
  public nom!: string;
  public email!: string;
  public role!: 'admin' | 'driver';
  public password!: string;
  public permisNumero?: string;
  public permisDelivrance?: Date | null;
  public permisExpiration?: Date | null;
  public permisLieu?: string;
  public permisCategorie?: string;
  public token?: string;
  public syncStatus?: string;
  public time?: string;
  public camionId?: ForeignKey<Camion['id']>;
  public createdAt!: Date;
  public updatedAt!: Date;

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
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nom: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    role: { type: DataTypes.ENUM('admin', 'driver'), allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    permisNumero: { type: DataTypes.STRING, allowNull: true },
    permisDelivrance: { type: DataTypes.DATE, allowNull: true },
    permisExpiration: { type: DataTypes.DATE, allowNull: true },
    permisLieu: { type: DataTypes.STRING, allowNull: true },
    permisCategorie: { type: DataTypes.STRING, allowNull: true },
    token: { type: DataTypes.TEXT, allowNull: true },
    syncStatus: { type: DataTypes.STRING, allowNull: true },
    time: { type: DataTypes.STRING, allowNull: true },
    camionId: {
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
    tableName: 'utilisateurs',
    timestamps: true,
    hooks: {
      beforeCreate: async (user: Utilisateur) => {
        if (user.password) {
          const saltRounds = 10;
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      },
      beforeUpdate: async (user: Utilisateur) => {
        if (user.changed('password') && user.password) {
          const saltRounds = 10;
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      },
    },
  }
);

export default Utilisateur;