const { db } = require('../config/firebase');
import Document from '../models/document';
import Depense from '../models/depense';
import MileageModel from '../models/mileage';
import logger from '../utils/logger';
import CamionModel from '../models/camion';
import Utilisateur from '../models/utilisateur';
import axios from 'axios';
import { ModelStatic, Model, WhereOptions } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

// Types de base
type SyncItem = {
  id: string;
  sync_status: string;
  time: string;
  imageUrl?: string | null;
  syncStatus?: string;
};

// Interfaces spécifiques pour chaque type de données
interface Ticket extends SyncItem {
  ticketNum?: string;
  type?: string;
  driver?: string;
  dateEntrance?: string;
  dateExit?: string;
  truckId?: string;
  product?: string;
  netWeight?: number;
  extraData?: any;
}

interface User extends SyncItem {
  nom?: string;
  email?: string;
  role?: string;
  permisNumero?: string;
  permisDelivrance?: string;
  permisExpiration?: string;
  permisLieu?: string;
  permisCategorie?: string;
  token?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Camion extends SyncItem {
  nom?: string;
  type?: string;
  immatriculation?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Expense extends SyncItem {
  driverId?: string;
  type?: string;
  entryType?: string;
  date?: string;
  quantity?: number;
  amount?: number;
  description?: string;
  location?: string;
  paymentMethod?: string;
}

interface Mileage extends SyncItem {
  truckId?: string;
  driverId?: string;
  date?: string;
  kilometer?: number;
  extraData?: any;
}

// Interface pour les attributs des modèles
interface ModelAttributes {
  id: string;
  nom?: string | null;
  type?: string | null;
  fichierUrl?: string | null;
  chauffeurId?: string | null;
  dateExpiration?: Date | null;
  ticketNum?: string | null;
  dateEntrance?: Date | null;
  dateExit?: Date | null;
  truckId?: string | null;
  product?: string | null;
  netWeight?: number | null;
  extraData?: any;
  syncStatus?: string | null;
  time?: string | null;
  driverId?: string | null;
  entryType?: string | null;
  date?: Date | null;
  quantity?: number | null;
  amount?: number | null;
  description?: string | null;
  location?: string | null;
  paymentMethod?: string | null;
  imageUrl?: string | null;
  kilometer?: number | null;
  email?: string | null;
  role?: string | null;
  permisNumero?: string | null;
  permisDelivrance?: Date | null;
  permisExpiration?: Date | null;
  permisLieu?: string | null;
  permisCategorie?: string | null;
  token?: string | null;
  immatriculation?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Configuration pour chaque type de données
const syncConfigs = {
  tickets: {
    path: 'tickets',
    model: Document,
    mapData: (ticket: Ticket) => {
      if (!ticket.type)
        logger.warn(
          `Missing type for ticket ${ticket.id}. Using fallback 'unknown'.`
        );
      if (!ticket.driver)
        logger.warn(
          `Missing driver for ticket ${ticket.id}. Using fallback 'unknown'.`
        );

      return {
        id: ticket.id || uuidv4(),
        nom: ticket.ticketNum || `Ticket_${ticket.id || uuidv4()}`,
        type: ticket.type || 'unknown',
        fichierUrl: ticket.imageUrl || null,
        chauffeurId: ticket.driver || 'unknown',
        dateExpiration: null,
        ticketNum: ticket.ticketNum || null,
        dateEntrance: ticket.dateEntrance
          ? new Date(ticket.dateEntrance)
          : null,
        dateExit: ticket.dateExit ? new Date(ticket.dateExit) : null,
        truckId: ticket.truckId || null,
        product: ticket.product || null,
        netWeight: ticket.netWeight ?? null,
        extraData: ticket.extraData ? JSON.stringify(ticket.extraData) : null,
        syncStatus: ticket.syncStatus || 'synced',
        time: ticket.time || new Date().toISOString(),
      };
    },
  },
  expenses: {
    path: 'expenses',
    model: Depense,
    mapData: (expense: Expense) => {
      if (!expense.driverId)
        logger.warn(
          `Missing driverId for expense ${expense.id}. Using fallback 'unknown'.`
        );
      if (!expense.type)
        logger.warn(
          `Missing type for expense ${expense.id}. Using fallback 'unknown'.`
        );
      if (!expense.entryType)
        logger.warn(
          `Missing entryType for expense ${expense.id}. Using fallback 'unknown'.`
        );
      if (!expense.date)
        logger.warn(
          `Missing date for expense ${expense.id}. Using fallback current date.`
        );
      if (expense.amount == null)
        logger.warn(
          `Missing amount for expense ${expense.id}. Using fallback 0.`
        );

      return {
        id: expense.id || uuidv4(),
        driverId: expense.driverId || 'unknown',
        type: expense.type || 'unknown',
        entryType: expense.entryType || 'unknown',
        date: expense.date ? new Date(expense.date) : new Date(),
        quantity: expense.quantity ?? null,
        amount: expense.amount ?? 0,
        description: expense.description || null,
        location: expense.location || null,
        paymentMethod: expense.paymentMethod || null,
        imageUrl: expense.imageUrl || null,
        syncStatus: expense.syncStatus || 'synced',
        time: expense.time || new Date().toISOString(),
        adminId: null,
        chauffeurId: null,
        lastSyncTime: null,
      };
    },
  },
  mileage: {
    path: 'mileage',
    model: MileageModel,
    mapData: (mileage: Mileage) => ({
      id: mileage.id || uuidv4(),
      truckId: mileage.truckId || null,
      driverId: mileage.driverId || null,
      date: mileage.date ? new Date(mileage.date) : null,
      kilometer: mileage.kilometer ?? null,
      imageUrl: mileage.imageUrl || null,
      syncStatus: mileage.syncStatus || 'synced',
      extraData: mileage.extraData || null,
      time: mileage.time || new Date().toISOString(),
    }),
  },
  // Correction du mapData pour camions
  camions: {
    path: 'camions',
    model: CamionModel,
    mapData: (camion: Camion) => {
      logger.debug(
        `Raw camion data for ID ${camion.id}: ${JSON.stringify(camion)}`
      );

      const nom =
        typeof camion.nom === 'string' && camion.nom.trim()
          ? camion.nom.trim()
          : 'unknown';
      const type =
        typeof camion.type === 'string' && camion.type.trim()
          ? camion.type.trim()
          : 'unknown';

      return {
        id: camion.id || uuidv4(),
        nom,
        type,
        immatriculation:
          typeof camion.immatriculation === 'string'
            ? camion.immatriculation
            : null,
        syncStatus:
          typeof camion.syncStatus === 'string' ? camion.syncStatus : 'synced',
        time:
          typeof camion.time === 'string'
            ? camion.time
            : new Date().toISOString(),
        createdAt: camion.createdAt ? new Date(camion.createdAt) : new Date(),
        updatedAt: camion.updatedAt ? new Date(camion.updatedAt) : new Date(),
      };
    },
  },
  users: {
    path: 'users',
    model: Utilisateur,
    mapData: (user: User) => {
      if (!user.nom)
        logger.warn(
          `Missing nom for user ${user.id}. Using fallback 'unknown'.`
        );
      if (!user.email)
        logger.warn(
          `Missing email for user ${user.id}. Using fallback 'unknown'.`
        );
      if (!user.role)
        logger.warn(
          `Missing role for user ${user.id}. Using fallback 'unknown'.`
        );

      return {
        id: user.id || uuidv4(),
        nom: user.nom || 'unknown',
        email: user.email || 'unknown',
        role: user.role || 'unknown',
        permisNumero: user.permisNumero || null,
        permisDelivrance: user.permisDelivrance
          ? new Date(user.permisDelivrance)
          : null,
        permisExpiration: user.permisExpiration
          ? new Date(user.permisExpiration)
          : null,
        permisLieu: user.permisLieu || null,
        permisCategorie: user.permisCategorie || null,
        token: user.token || null,
        syncStatus: user.syncStatus || 'synced',
        time: user.time || new Date().toISOString(),
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
      };
    },
  },
};

// Validation des URLs d'image
const isImageUrlValid = async (url: string | null): Promise<string | null> => {
  if (!url) return null;
  try {
    const response = await axios.head(url, { timeout: 5000 });
    return response.status === 200 ? url : null;
  } catch (error) {
    logger.warn(`Image URL invalide: ${url}`);
    return null;
  }
};

// Fonction pour vérifier si un nouvel item doit être synchronisé
const shouldSyncItem = async <T extends SyncItem>(
  item: T,
  Model: ModelStatic<any>,
  itemId: string
): Promise<boolean> => {
  if (item.sync_status !== 'synced') return false;

  const existingItem = await Model.findOne({
    where: { id: itemId } as WhereOptions<ModelAttributes>,
  });

  if (existingItem) {
    const existingTime = new Date(
      existingItem.getDataValue('time') || '1970-01-01'
    );
    const newTime = new Date(item.time);
    return newTime > existingTime;
  }

  return true;
};

// Traitement d'un item individuel
const processItem = async <T extends SyncItem>(
  item: T,
  itemId: string,
  Model: ModelStatic<any>,
  mapData: (item: T) => Record<string, any>,
  logContext: string
): Promise<void> => {
  if (!(await shouldSyncItem(item, Model, itemId))) {
    logger.debug(
      `Skipping sync for ${logContext} ID ${itemId}: already synced or invalid sync_status`
    );
    return;
  }

  if (Model === CamionModel) {
    const { nom, type } = item as Camion;
    if (
      !nom ||
      !type ||
      typeof nom !== 'string' ||
      typeof type !== 'string' ||
      !nom.trim() ||
      !type.trim()
    ) {
      logger.error(
        `Invalid camion data for ID ${itemId}: nom or type missing, invalid, or empty. Data: ${JSON.stringify(item)}. Skipping.`
      );
      return;
    }
  }

  const validImageUrl = await isImageUrlValid(item.imageUrl ?? null);
  const mappedData = mapData({ ...item, imageUrl: validImageUrl });

  if (Model === CamionModel) {
    if (
      !mappedData.nom ||
      !mappedData.type ||
      typeof mappedData.nom !== 'string' ||
      typeof mappedData.type !== 'string' ||
      !mappedData.nom.trim() ||
      !mappedData.type.trim()
    ) {
      logger.error(
        `Mapped data for camion ID ${itemId} has invalid nom or type: ${JSON.stringify(mappedData)}. Skipping.`
      );
      return;
    }
  }

  try {
    await Model.upsert(mappedData);
    logger.info(`${logContext}: ${itemId}`);
  } catch (error: any) {
    logger.error(
      `Failed to upsert ${logContext} ID ${itemId}: ${error.message}`
    );
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map((err: any) => err.message).join(', ');
      logger.error(
        `Validation error for ${logContext} ID ${itemId}: ${messages}`
      );
    }
  }
};

// Fonction générique de synchronisation
const syncData = async <T extends SyncItem>(
  refPath: string,
  Model: ModelStatic<any>,
  mapData: (data: T) => Record<string, any>
) => {
  try {
    const ref = db.ref(refPath);
    const snapshot = await ref.once('value');
    const dataByDate = snapshot.val() || {};

    const upsertPromises: Promise<void>[] = [];

    for (const date in dataByDate) {
      const items = dataByDate[date];
      for (const itemId in items) {
        const item: T = items[itemId];
        upsertPromises.push(
          processItem(item, itemId, Model, mapData, `${refPath} synchronisé`)
        );
      }
    }

    await Promise.all(upsertPromises);
  } catch (error: any) {
    logger.error(
      `Erreur lors de la synchronisation de ${refPath}: ${error.message}`
    );
    throw error;
  }
};

// Fonctions de synchronisation spécifiques
export const syncTickets = () =>
  syncData<Ticket>(
    syncConfigs.tickets.path,
    syncConfigs.tickets.model,
    syncConfigs.tickets.mapData
  );

export const syncExpenses = () =>
  syncData<Expense>(
    syncConfigs.expenses.path,
    syncConfigs.expenses.model,
    syncConfigs.expenses.mapData
  );

export const syncMileages = () =>
  syncData<Mileage>(
    syncConfigs.mileage.path,
    syncConfigs.mileage.model,
    syncConfigs.mileage.mapData
  );

export const syncUsers = () =>
  syncData<User>(
    syncConfigs.users.path,
    syncConfigs.users.model,
    syncConfigs.users.mapData
  );

export const syncCamions = () =>
  syncData<Camion>(
    syncConfigs.camions.path,
    syncConfigs.camions.model,
    syncConfigs.camions.mapData
  );

// Configuration des écouteurs d'événements pour la synchronisation en temps réel
const setupRealtimeListener = (
  ref: any,
  path: string,
  Model: ModelStatic<any>,
  mapData: (item: SyncItem) => Record<string, any>,
  eventType: string
) => {
  ref.on(eventType, async (snapshot: any) => {
    const dataByDate = snapshot.val();
    if (!dataByDate) return;

    for (const date in dataByDate) {
      const items = dataByDate[date];
      for (const itemId in items) {
        const item = items[itemId];

        if (eventType === 'child_removed') {
          await Model.destroy({ where: { id: itemId } });
          logger.info(`${path} supprimé en temps réel: ${itemId}`);
        } else {
          await processItem(
            item,
            itemId,
            Model,
            mapData,
            `${path} ${eventType === 'child_added' ? 'ajouté' : 'mis à jour'} en temps réel`
          );
        }
      }
    }
  });
};

export const startRealtimeSync = () => {
  Object.values(syncConfigs).forEach(({ path, model, mapData }) => {
    const ref = db.ref(path);

    setupRealtimeListener(ref, path, model, mapData, 'child_added');
    setupRealtimeListener(ref, path, model, mapData, 'child_changed');
    setupRealtimeListener(ref, path, model, mapData, 'child_removed');
  });
};
