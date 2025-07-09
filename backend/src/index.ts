import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import financialRoutes from './routes/financialRoutes';
import userRoutes from './routes/userRoutes';
import syncRoutes from './routes/syncRoutes';
import camionRoutes from './routes/camionRoutes';
import dataRoutes from './routes/dataRoutes';
import notificationRoutes from './routes/notificationRoutes';
import factureRoutes from './routes/factureRoutes';
import {
  syncUsers,
  syncCamions,
  syncTickets,
  syncExpenses,
  syncMileages,
  startRealtimeSync,
} from './services/syncService';
import './services/notificationService';
import Utilisateur from './models/utilisateur';
import Camion from './models/camion';
import Depense from './models/depense';
import Revenu from './models/revenu';
import Document from './models/document';
import Client from './models/client';
import Facture from './models/facture';
import NotificationModel from './models/notification';
import logger from './utils/logger';

// Define the type for the models object
interface Models {
  Utilisateur: typeof Utilisateur;
  Camion: typeof Camion;
  Depense: typeof Depense;
  Revenu: typeof Revenu;
  Document: typeof Document;
  Client: typeof Client;
  Facture: typeof Facture;
  Notification: typeof NotificationModel;
}

const app = express();

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
          'http://127.0.0.1:5174',
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

// Increase payload size limit to 10MB (or adjust as needed)
app.use(express.json({ limit: '10mb' }));

// Initialize models
const models: Models = {
  Utilisateur,
  Camion,
  Depense,
  Revenu,
  Document,
  Client,
  Facture,
  Notification: NotificationModel,
};

// Initialize associations
Object.values(models).forEach((model) => {
  if ((model as any).associate) {
    (model as any).associate(models);
  }
});

app.use('/auth', authRoutes);
app.use('/api', financialRoutes);
app.use('/api', userRoutes);
app.use('/api', syncRoutes);
app.use('/api', dataRoutes);
app.use('/api', camionRoutes);
app.use('/api', notificationRoutes);
app.use('/api/factures', factureRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

const PORT = process.env.PORT || 3000;

async function initialize() {
  try {
    await Utilisateur.sync({ force: false });
    logger.info('Utilisateur synchronisé');
    await Camion.sync({ force: false });
    logger.info('Camion synchronisé');
    await Depense.sync({ force: false });
    logger.info('Depense synchronisé');
    await Revenu.sync({ force: false });
    logger.info('Revenu synchronisé');
    await Document.sync({ force: false });
    logger.info('Document synchronisé');
    await Client.sync({ force: false });
    logger.info('Client synchronisé');
    await Facture.sync({ force: false });
    logger.info('Facture synchronisé');
    await NotificationModel.sync({ force: false });
    logger.info('Notification synchronisé');
    logger.info('Database synchronized successfully');

    await Promise.all([
      syncUsers(),
      syncCamions(),
      syncTickets(),
      syncExpenses(),
      syncMileages(),
    ]);

    logger.info('Initial Firebase synchronization completed');

    startRealtimeSync();
    logger.info('Real-time synchronization started');
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Initialization failed:', {
        error: error.message,
        stack: error.stack,
      });
    } else {
      logger.error('Initialization failed:', {
        error: String(error),
      });
    }
    process.exit(1);
  }
}

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