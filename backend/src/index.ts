import express from 'express';
import cors from 'cors';
import sequelize from './config/db';
import authRoutes from './routes/authRoutes';
import financialRoutes from './routes/financialRoutes';
import userRoutes from './routes/userRoutes';
import syncRoutes from './routes/syncRoutes';
import camionRoutes from './routes/camionRoutes';
import dataRoutes from './routes/dataRoutes';
import {
  syncUsers,
  syncCamions,
  syncTickets,
  syncExpenses,
  syncMileages,
  startRealtimeSync,
} from './services/syncService';
import Utilisateur from './models/utilisateur';
import Camion from './models/camion';
import Depense from './models/depense';
import Revenu from './models/revenu';
import Document from './models/document';
import Notification from './models/notification';
import Client from './models/client';
import logger from './utils/logger';

const app = express();

// Middleware CORS placé tout en haut
app.use(
  cors({
    origin: (origin, callback) => {
      console.log('CORS origin:', origin);
      if (
        !origin ||
        [
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'http://localhost:5174',
          'http://127.0.0.1:5174'
        ].includes(origin)
      ) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Définir les associations avant la synchronisation
const models = {
  Utilisateur,
  Camion,
  Depense,
  Revenu,
  Document,
  Notification,
  Client,
};
Utilisateur.associate(models);
Camion.associate(models);
Depense.associate(models);
// Décommentez si besoin
// Revenu.associate(models);
// Document.associate(models);
// Notification.associate(models);
// Client.associate(models);

// Mount all routes
app.use('/auth', authRoutes);
app.use('/api', financialRoutes);
app.use('/api', userRoutes);
app.use('/api', syncRoutes);
app.use('/api', dataRoutes);
app.use('/api', camionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

const PORT = process.env.PORT || 3000;

async function initialize() {
  try {
    // Synchronisation manuelle des modèles dans l'ordre
    await Utilisateur.sync({ force: false });
    logger.info('Utilisateur synchronisé');
    await Camion.sync({ force: false });
    logger.info('Camion synchronisé');
    await Depense.sync({ force: false });
    logger.info('Depense synchronisé');
    await Revenu.sync({ force: false });
    await Document.sync({ force: false });
    await Notification.sync({ force: false });
    await Client.sync({ force: false });
    logger.info('Database synchronized successfully');

    // Perform initial sync with Firebase
    await Promise.all([
      syncUsers(),
      syncCamions(),
      syncTickets(),
      syncExpenses(),
      syncMileages(),
    ]);
    logger.info('Initial Firebase synchronization completed');

    // Start real-time sync
    startRealtimeSync();
    logger.info('Real-time synchronization started');
  } catch (error: any) {
    logger.error('Initialization failed:', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

// Start server only after initialization
initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT} at ${new Date().toISOString()}`
      );
    });
  })
  .catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });