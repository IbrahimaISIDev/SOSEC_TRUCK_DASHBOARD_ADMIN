import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../config/db';
import Utilisateur from '../models/utilisateur';
import bcrypt from 'bcrypt';

// Fonction pour hasher les mots de passe
async function createUsers() {
  const saltRounds = 10;
  
  // Utilisateurs avec mots de passe hashés
  return Promise.all([
    {
      nom: 'Admin Saraya_Portal',
      email: 'admin.saraya@gmail.com',
      role: 'admin',
      password: await bcrypt.hash('admin1234', saltRounds),
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
      password: await bcrypt.hash('driver1234', saltRounds),
    },
  ]);
}

async function seedUsers() {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful at', new Date().toISOString());

    await Utilisateur.sync({ force: true }); // Drops table and recreates it (use with caution)
    console.log('Utilisateur table synced');

    const users = await createUsers();
    await Utilisateur.bulkCreate(users);
    console.log('Users seeded successfully at', new Date().toISOString());

    await sequelize.close();
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

seedUsers();