const { db } = require('../config/firebase');
import { getAuth } from 'firebase-admin/auth';
import Utilisateur from '../models/utilisateur';
import logger from '../utils/logger';

async function migrateUsers() {
  try {
    // Récupérer tous les utilisateurs de Firebase Authentication
    const auth = getAuth();
    const { users } = await auth.listUsers();
    
    // Récupérer tous les utilisateurs de Sequelize
    const sequelizeUsers = await Utilisateur.findAll();

    for (const sequelizeUser of sequelizeUsers) {
      // Trouver l'utilisateur correspondant dans Firebase Authentication
      const firebaseUser = users.find(u => u.email === sequelizeUser.email);
      if (!firebaseUser) {
        logger.warn(`Aucun utilisateur Firebase trouvé pour l'email: ${sequelizeUser.email}`);
        continue;
      }

      const firebaseUid = firebaseUser.uid;

      // Mettre à jour l'ID dans Sequelize
      await Utilisateur.update(
        { id: firebaseUid },
        { where: { id: sequelizeUser.id } }
      );

      // Mettre à jour les données dans Realtime Database
      const userData = {
        id: firebaseUid,
        nom: sequelizeUser.nom,
        email: sequelizeUser.email,
        role: sequelizeUser.role,
        permisNumero: sequelizeUser.permisNumero,
        permisDelivrance: sequelizeUser.permisDelivrance?.toISOString() || null,
        permisExpiration: sequelizeUser.permisExpiration?.toISOString() || null,
        permisLieu: sequelizeUser.permisLieu,
        permisCategorie: sequelizeUser.permisCategorie,
        camionId: sequelizeUser.camionId,
        createdAt: sequelizeUser.createdAt.toISOString(),
        updatedAt: sequelizeUser.updatedAt.toISOString(),
      };

      await db.ref(`users/${firebaseUid}`).set(userData);
      await db.ref(`users/${sequelizeUser.id}`).remove(); // Supprimer l'ancienne entrée

      logger.info(`Utilisateur migré: ${sequelizeUser.email} avec UID: ${firebaseUid}`);
    }

    logger.info('Migration des utilisateurs terminée');
  } catch (error: any) {
    logger.error(`Erreur lors de la migration des utilisateurs: ${error.message}`);
  }
}

migrateUsers();