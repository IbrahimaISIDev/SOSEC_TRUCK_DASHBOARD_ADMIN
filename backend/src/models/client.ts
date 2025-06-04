import { DataTypes, Model } from 'sequelize';
const sequelize = require('../config/db');

class Client extends Model {
  public id!: string;
  public nom!: string;
  static associate: any;
}

Client.init(
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
  },
  {
    sequelize,
    tableName: 'clients',
    timestamps: true,
  }
);

export default Client;