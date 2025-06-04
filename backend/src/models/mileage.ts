import { DataTypes } from 'sequelize';
const sequelize = require('../config/db');

const MileageModel = sequelize.define('Mileage', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  truckId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  driverId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  kilometer: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  syncStatus: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  extraData: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  time: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

export default MileageModel;