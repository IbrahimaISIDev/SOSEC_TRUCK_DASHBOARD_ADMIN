import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

class Client extends Model {
  public id!: string;
  public nom!: string;
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