import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import Utilisateur from './utilisateur';

class Revenu extends Model {
  public id!: string;
  public montant!: number;
  public source!: string;
  public date!: Date;
  public notes?: string;
  public adminId!: string;
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
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    tableName: 'revenus',
    timestamps: true,
  }
);

Revenu.belongsTo(Utilisateur, { foreignKey: 'adminId', as: 'admin' });

export default Revenu;