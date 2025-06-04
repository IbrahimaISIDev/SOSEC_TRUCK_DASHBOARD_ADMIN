"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const document_1 = __importDefault(require("./document"));
const utilisateur_1 = __importDefault(require("./utilisateur"));
class Notification extends sequelize_1.Model {
}
Notification.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    joursRestants: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    lue: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    sequelize: db_1.default,
    tableName: 'notifications',
    timestamps: true,
});
Notification.belongsTo(document_1.default, { foreignKey: 'documentId', as: 'document' });
Notification.belongsTo(utilisateur_1.default, { foreignKey: 'utilisateurId', as: 'utilisateur' });
exports.default = Notification;
