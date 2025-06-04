"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.deleteUser = exports.updateUser = exports.getUser = exports.createUser = void 0;
const utilisateur_1 = __importDefault(require("../models/utilisateur"));
const logger_1 = __importDefault(require("../utils/logger"));
const createUser = async (nom, email, role) => {
    try {
        const user = await utilisateur_1.default.create({
            nom,
            email,
            role,
        });
        logger_1.default.info(`Utilisateur créé: ${user.id}`);
        return user;
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
        throw error;
    }
};
exports.createUser = createUser;
const getUser = async (userId) => {
    try {
        const user = await utilisateur_1.default.findOne({ where: { id: userId } });
        if (!user) {
            logger_1.default.warn(`Utilisateur non trouvé: ${userId}`);
        }
        return user;
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération de l'utilisateur: ${error.message}`);
        throw error;
    }
};
exports.getUser = getUser;
const updateUser = async (userId, nom, email, role) => {
    try {
        const user = await utilisateur_1.default.findOne({ where: { id: userId } });
        if (!user)
            throw new Error('Utilisateur non trouvé');
        if (nom)
            user.nom = nom;
        if (email)
            user.email = email;
        if (role)
            user.role = role;
        await user.save();
        logger_1.default.info(`Utilisateur mis à jour: ${userId}`);
        return user;
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`);
        throw error;
    }
};
exports.updateUser = updateUser;
const deleteUser = async (userId) => {
    try {
        const result = await utilisateur_1.default.destroy({ where: { id: userId } });
        if (result === 0) {
            logger_1.default.warn(`Utilisateur non trouvé pour suppression: ${userId}`);
        }
        else {
            logger_1.default.info(`Utilisateur supprimé: ${userId}`);
        }
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
        throw error;
    }
};
exports.deleteUser = deleteUser;
const getAllUsers = async () => {
    try {
        const users = await utilisateur_1.default.findAll();
        logger_1.default.info(`Récupération de ${users.length} utilisateurs`);
        return users;
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
        throw error;
    }
};
exports.getAllUsers = getAllUsers;
//# sourceMappingURL=userService.js.map