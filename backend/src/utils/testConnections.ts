import sequelize from '../config/db';
import { db } from '../config/firebase';
import logger from './logger';

const testConnections = async () => {
  try {
    // Test PostgreSQL
    await sequelize.authenticate();
    logger.info('Connexion à PostgreSQL établie avec succès');

    // Test Firebase
    await db.ref('test').once('value');
    logger.info('Connexion à Firebase établie avec succès');
  } catch (error: any) {
    logger.error(`Erreur lors de la vérification des connexions: ${error.message}`);
    process.exit(1);
  }
};

export default testConnections;