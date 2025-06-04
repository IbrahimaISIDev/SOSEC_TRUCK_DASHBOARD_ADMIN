"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const utilisateur_1 = __importDefault(require("./utilisateur"));
class Revenu extends sequelize_1.Model {
}
Revenu.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    montant: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    source: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    notes: {
        type: sequelize_1.DataTypes.TEXT,
    },
}, {
    sequelize: db_1.default,
    tableName: 'revenus',
    timestamps: true,
});
Revenu.belongsTo(utilisateur_1.default, { foreignKey: 'adminId', as: 'admin' });
exports.default = Revenu;
//# sourceMappingURL=revenu.js.map