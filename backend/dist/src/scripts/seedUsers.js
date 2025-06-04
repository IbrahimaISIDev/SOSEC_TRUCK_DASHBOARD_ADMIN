"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/scripts/seedUsers.ts
const dotenv = require('dotenv');
dotenv.config();
const sequelize = require('../config/db');
const utilisateur_1 = __importDefault(require("../models/utilisateur"));
const bcrypt = require('bcrypt');
const { getAuth, cert } = require('firebase-admin/auth');
const { initializeApp } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const admin = require('firebase-admin'); // Import firebase-admin directly
// Initialize Firebase Admin
const serviceAccount = require('/home/dev/Sosec_Truck_Admin_Dashboard_1/backend/sosec-app-firebase-adminsdk-fbsvc-8560d813da.json');
const firebaseConfig = {
    credential: admin.credential.cert(serviceAccount), // Use admin.credential.cert
    databaseURL: process.env.FIREBASE_DATABASE_URL,
};
try {
    initializeApp(firebaseConfig);
    console.log('Firebase Admin initialized successfully');
}
catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    process.exit(1);
}
// const db = getDatabase();
const db = admin.database();
const auth = admin.auth();
async function createUsers() {
    var _a, _b;
    const saltRounds = 10;
    const auth = getAuth();
    const users = [
        {
            nom: 'Admin Saraya_Portal',
            email: 'admin.saraya@gmail.com',
            role: 'admin',
            password: 'admin1234',
        },
        {
            nom: 'Moussa Diop',
            email: 'moussa.diop@example.com',
            role: 'driver',
            permisNumero: 'D789012',
            permisDelivrance: new Date('2021-06-15'),
            permisExpiration: new Date('2026-06-15'),
            permisLieu: 'Thies',
            permisCategorie: 'B',
            password: 'driver1234',
        },
    ];
    const createdUsers = [];
    for (const user of users) {
        try {
            // Create user in Firebase Authentication
            const userRecord = await auth.createUser({
                email: user.email,
                password: user.password,
            });
            const firebaseUid = userRecord.uid;
            console.log(`Created Firebase user: ${user.email} with UID: ${firebaseUid}`);
            // Hash password for Sequelize
            const hashedPassword = await bcrypt.hash(user.password, saltRounds);
            // Prepare user data for Sequelize
            const userData = {
                id: firebaseUid,
                nom: user.nom,
                email: user.email,
                role: user.role,
                password: hashedPassword,
                permisNumero: user.permisNumero,
                permisDelivrance: user.permisDelivrance,
                permisExpiration: user.permisExpiration,
                permisLieu: user.permisLieu,
                permisCategorie: user.permisCategorie,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            createdUsers.push(userData);
            // Synchronize with Firebase Realtime Database
            await db.ref(`users/${firebaseUid}`).set({
                id: firebaseUid,
                nom: user.nom,
                email: user.email,
                role: user.role,
                permisNumero: user.permisNumero || null,
                permisDelivrance: ((_a = user.permisDelivrance) === null || _a === void 0 ? void 0 : _a.toISOString()) || null,
                permisExpiration: ((_b = user.permisExpiration) === null || _b === void 0 ? void 0 : _b.toISOString()) || null,
                permisLieu: user.permisLieu || null,
                permisCategorie: user.permisCategorie || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }
        catch (error) {
            console.error(`Error creating user ${user.email}:`, error);
        }
    }
    return createdUsers;
}
async function seedUsers() {
    try {
        await sequelize.authenticate();
        console.log('Database connection successful at', new Date().toISOString());
        await utilisateur_1.default.sync({ force: true }); // Drops and recreates table
        console.log('Utilisateur table synced');
        const users = await createUsers();
        // Map UserData to plain objects compatible with Utilisateur model
        const userPlainObjects = users.map(user => ({
            id: user.id,
            nom: user.nom,
            email: user.email,
            role: user.role,
            password: user.password,
            permisNumero: user.permisNumero,
            permisDelivrance: user.permisDelivrance,
            permisExpiration: user.permisExpiration,
            permisLieu: user.permisLieu,
            permisCategorie: user.permisCategorie,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));
        await utilisateur_1.default.bulkCreate(userPlainObjects);
        console.log('Users seeded successfully at', new Date().toISOString());
        await sequelize.close();
    }
    catch (error) {
        console.error('Error seeding users:', error);
    }
}
seedUsers();
