"use strict";
// import sequelize from '../config/db';
// import Utilisateur from '../models/utilisateur';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const seedUsers = async () => {
//   try {
//     // Synchroniser la base de données (créer la table si elle n'existe pas)
//     await sequelize.sync({ force: true }); // Utilise { force: false } en production
//     // Insérer des utilisateurs de test
//     await Utilisateur.create({
//       nom: 'Ibrahima Diallo',
//       email: 'ibrahima.diallo@gmail.com',
//       role: 'driver',
//     });
//     await Utilisateur.create({
//       nom: 'Admin Saraya_Portal',
//       email: 'admin.saraya@gmail.com',
//       role: 'admin',
//     });
//     console.log('Utilisateurs insérés avec succès !');
//     const users = await Utilisateur.findAll();
//     console.log('Utilisateurs créés:', users);
//   } catch (error: any) {
//     console.error('Erreur lors de l\'insertion des utilisateurs:', error.message);
//   } finally {
//     await sequelize.close();
//   }
// };
// seedUsers();
const db_1 = __importDefault(require("../config/db"));
const utilisateur_1 = __importDefault(require("../models/utilisateur"));
const seedUsers = async () => {
    try {
        await db_1.default.sync({ force: true }); // Utilise { force: false } en production
        await utilisateur_1.default.create({
            nom: 'Ibrahima Diallo',
            email: 'ibrahima.diallo@gmail.com',
            role: 'driver',
            permisNumero: 'D123456',
            permisDelivrance: new Date('2020-05-10'),
            permisExpiration: new Date('2025-05-10'),
            permisLieu: 'Dakar',
            permisCategorie: 'C',
        });
        await utilisateur_1.default.create({
            nom: 'Admin Saraya_Portal',
            email: 'admin.saraya@gmail.com',
            role: 'admin',
        });
        console.log('Utilisateurs insérés avec succès !');
        const users = await utilisateur_1.default.findAll();
        console.log('Utilisateurs créés:', users);
    }
    catch (error) {
        console.error('Erreur lors de l\'insertion des utilisateurs:', error.message);
    }
    finally {
        await db_1.default.close();
    }
};
seedUsers();
//# sourceMappingURL=seedUsers.js.map