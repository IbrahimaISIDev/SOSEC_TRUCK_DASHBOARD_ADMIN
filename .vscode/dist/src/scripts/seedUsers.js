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
// import sequelize from '../config/db';
// import Utilisateur from '../models/utilisateur';
// const seedUsers = async () => {
//   try {
//     await sequelize.sync({ force: true }); // Utilise { force: false } en production
//     await Utilisateur.create({
//       nom: 'Ibrahima Diallo',
//       email: 'ibrahima.diallo@gmail.com',
//       role: 'driver',
//       permisNumero: 'D123456',
//       permisDelivrance: new Date('2020-05-10'),
//       permisExpiration: new Date('2025-05-10'),
//       permisLieu: 'Dakar',
//       permisCategorie: 'C',
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
// backend/src/scripts/seedUsers.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db_1 = __importDefault(require("../config/db"));
const utilisateur_1 = __importDefault(require("../models/utilisateur"));
// Sample users to seed
const users = [
    {
        nom: 'Moussa Diop',
        email: 'moussa.diop@example.com',
        role: 'driver',
        permisNumero: 'D789012',
        permisDelivrance: new Date('2021-06-15'),
        permisExpiration: new Date('2026-06-15'),
        permisLieu: 'Thies',
        permisCategorie: 'B',
    },
    {
        nom: 'Ibrahima Diallo',
        email: 'ibrahima.diallo@example.com',
        role: 'admin',
        permisNumero: 'A123456',
        permisDelivrance: new Date('2020-01-10'),
        permisExpiration: new Date('2025-01-10'),
        permisLieu: 'Dakar',
        permisCategorie: 'C',
    },
];
async function seedUsers() {
    try {
        await db_1.default.authenticate();
        console.log('Database connection successful at', new Date().toISOString());
        await utilisateur_1.default.sync({ force: true }); // Drops table and recreates it (use with caution)
        console.log('Utilisateur table synced');
        await utilisateur_1.default.bulkCreate(users);
        console.log('Users seeded successfully at', new Date().toISOString());
        await db_1.default.close();
    }
    catch (error) {
        console.error('Error seeding users:', error);
    }
}
seedUsers();
