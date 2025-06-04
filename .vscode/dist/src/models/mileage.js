"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const MileageModel = db_1.default.define('Mileage', {
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
    },
    truckId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    driverId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    kilometer: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    imageUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    syncStatus: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    extraData: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    time: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
});
exports.default = MileageModel;
