import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import Document from './document';
import Utilisateur from './utilisateur';

class Notification extends Model {
  public id!: string;
  public documentId!: string;
  public joursRestants!: number;
  public lue!: boolean;
  public utilisateurId!: string;
}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    joursRestants: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lue: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
  }
);

Notification.belongsTo(Document, { foreignKey: 'documentId', as: 'document' });
Notification.belongsTo(Utilisateur, { foreignKey: 'utilisateurId', as: 'utilisateur' });

export default Notification;