"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const utilisateur_1 = __importDefault(require("./utilisateur"));
class Depense extends sequelize_1.Model {
}
Depense.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    driverId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    entryType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    quantity: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
    },
    location: {
        type: sequelize_1.DataTypes.STRING,
    },
    paymentMethod: {
        type: sequelize_1.DataTypes.STRING,
    },
    imageUrl: {
        type: sequelize_1.DataTypes.STRING,
    },
    syncStatus: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'pending',
    },
    time: {
        type: sequelize_1.DataTypes.STRING,
    },
}, {
    sequelize: db_1.default,
    tableName: 'depenses',
    timestamps: true,
});
Depense.belongsTo(utilisateur_1.default, { foreignKey: 'adminId', as: 'admin' });
Depense.belongsTo(utilisateur_1.default, { foreignKey: 'driverId', as: 'driver' });
exports.default = Depense;
