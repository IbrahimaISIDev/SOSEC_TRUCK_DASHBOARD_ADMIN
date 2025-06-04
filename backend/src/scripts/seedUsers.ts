// src/scripts/seedUsers.ts
const dotenv = require('dotenv');
dotenv.config();

const sequelize = require('../config/db');
import Utilisateur from '../models/utilisateur';
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
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

// const db = getDatabase();
const db = admin.database();
const auth = admin.auth();

interface UserData {
  id: string;
  nom: string;
  email: string;
  role: 'admin' | 'driver';
  password: string;
  permisNumero?: string;
  permisDelivrance?: Date;
  permisExpiration?: Date;
  permisLieu?: string;
  permisCategorie?: string;
  createdAt: Date;
  updatedAt: Date;
}

async function createUsers(): Promise<UserData[]> {
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

  const createdUsers: UserData[] = [];
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
      const userData: UserData = {
        id: firebaseUid,
        nom: user.nom,
        email: user.email,
        role: user.role as 'admin' | 'driver',
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
        permisDelivrance: user.permisDelivrance?.toISOString() || null,
        permisExpiration: user.permisExpiration?.toISOString() || null,
        permisLieu: user.permisLieu || null,
        permisCategorie: user.permisCategorie || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error);
    }
  }

  return createdUsers;
}

async function seedUsers() {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful at', new Date().toISOString());

    await Utilisateur.sync({ force: true }); // Drops and recreates table
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
    await Utilisateur.bulkCreate(userPlainObjects);
    console.log('Users seeded successfully at', new Date().toISOString());

    await sequelize.close();
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

seedUsers();