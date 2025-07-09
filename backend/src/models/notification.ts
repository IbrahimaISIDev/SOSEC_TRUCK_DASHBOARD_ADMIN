// src/models/notification.ts
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const Utilisateur = require('./utilisateur');

class NotificationModel extends Model {
  public id!: string;
  public utilisateurId!: string;
  public message!: string;
  public type!: 'permis_expiration' | 'autre';
  public daysRemaining!: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  public static associate(models: any) {
    NotificationModel.belongsTo(models.Utilisateur, {
      foreignKey: 'utilisateurId',
      as: 'utilisateur',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }
}

NotificationModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    utilisateurId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'utilisateurs',
        key: 'id',
      },
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('permis_expiration', 'autre'),
      allowNull: false,
    },
    daysRemaining: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
  }
);

NotificationModel.associate = (models) => {
  NotificationModel.belongsTo(models.Utilisateur, {
    foreignKey: 'utilisateurId',
    as: 'utilisateur',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
};

// module.exports = NotificationModel;
export default NotificationModel;
