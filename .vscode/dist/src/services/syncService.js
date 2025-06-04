"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRealtimeSync = exports.syncCamions = exports.syncUsers = exports.syncMileages = exports.syncExpenses = exports.syncTickets = void 0;
const firebase_1 = require("../config/firebase");
const document_1 = __importDefault(require("../models/document"));
const depense_1 = __importDefault(require("../models/depense"));
const mileage_1 = __importDefault(require("../models/mileage"));
const logger_1 = __importDefault(require("../utils/logger"));
const camion_1 = __importDefault(require("../models/camion"));
const utilisateur_1 = __importDefault(require("../models/utilisateur"));
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
// Configuration pour chaque type de données
const syncConfigs = {
    tickets: {
        path: 'tickets',
        model: document_1.default,
        mapData: (ticket) => {
            var _a;
            if (!ticket.type)
                logger_1.default.warn(`Missing type for ticket ${ticket.id}. Using fallback 'unknown'.`);
            if (!ticket.driver)
                logger_1.default.warn(`Missing driver for ticket ${ticket.id}. Using fallback 'unknown'.`);
            return {
                id: ticket.id || (0, uuid_1.v4)(),
                nom: ticket.ticketNum || `Ticket_${ticket.id || (0, uuid_1.v4)()}`,
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
                netWeight: (_a = ticket.netWeight) !== null && _a !== void 0 ? _a : null,
                extraData: ticket.extraData ? JSON.stringify(ticket.extraData) : null,
                syncStatus: ticket.syncStatus || 'synced',
                time: ticket.time || new Date().toISOString(),
            };
        },
    },
    expenses: {
        path: 'expenses',
        model: depense_1.default,
        mapData: (expense) => {
            var _a, _b;
            if (!expense.driverId)
                logger_1.default.warn(`Missing driverId for expense ${expense.id}. Using fallback 'unknown'.`);
            if (!expense.type)
                logger_1.default.warn(`Missing type for expense ${expense.id}. Using fallback 'unknown'.`);
            if (!expense.entryType)
                logger_1.default.warn(`Missing entryType for expense ${expense.id}. Using fallback 'unknown'.`);
            if (!expense.date)
                logger_1.default.warn(`Missing date for expense ${expense.id}. Using fallback current date.`);
            if (expense.amount == null)
                logger_1.default.warn(`Missing amount for expense ${expense.id}. Using fallback 0.`);
            return {
                id: expense.id || (0, uuid_1.v4)(),
                driverId: expense.driverId || 'unknown',
                type: expense.type || 'unknown',
                entryType: expense.entryType || 'unknown',
                date: expense.date ? new Date(expense.date) : new Date(),
                quantity: (_a = expense.quantity) !== null && _a !== void 0 ? _a : null,
                amount: (_b = expense.amount) !== null && _b !== void 0 ? _b : 0,
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
        model: mileage_1.default,
        mapData: (mileage) => {
            var _a;
            return ({
                id: mileage.id || (0, uuid_1.v4)(),
                truckId: mileage.truckId || null,
                driverId: mileage.driverId || null,
                date: mileage.date ? new Date(mileage.date) : null,
                kilometer: (_a = mileage.kilometer) !== null && _a !== void 0 ? _a : null,
                imageUrl: mileage.imageUrl || null,
                syncStatus: mileage.syncStatus || 'synced',
                extraData: mileage.extraData || null,
                time: mileage.time || new Date().toISOString(),
            });
        },
    },
    // Correction du mapData pour camions
    camions: {
        path: 'camions',
        model: camion_1.default,
        mapData: (camion) => {
            logger_1.default.debug(`Raw camion data for ID ${camion.id}: ${JSON.stringify(camion)}`);
            const nom = typeof camion.nom === 'string' && camion.nom.trim()
                ? camion.nom.trim()
                : 'unknown';
            const type = typeof camion.type === 'string' && camion.type.trim()
                ? camion.type.trim()
                : 'unknown';
            return {
                id: camion.id || (0, uuid_1.v4)(),
                nom,
                type,
                immatriculation: typeof camion.immatriculation === 'string'
                    ? camion.immatriculation
                    : null,
                syncStatus: typeof camion.syncStatus === 'string' ? camion.syncStatus : 'synced',
                time: typeof camion.time === 'string'
                    ? camion.time
                    : new Date().toISOString(),
                createdAt: camion.createdAt ? new Date(camion.createdAt) : new Date(),
                updatedAt: camion.updatedAt ? new Date(camion.updatedAt) : new Date(),
            };
        },
    },
    users: {
        path: 'users',
        model: utilisateur_1.default,
        mapData: (user) => {
            if (!user.nom)
                logger_1.default.warn(`Missing nom for user ${user.id}. Using fallback 'unknown'.`);
            if (!user.email)
                logger_1.default.warn(`Missing email for user ${user.id}. Using fallback 'unknown'.`);
            if (!user.role)
                logger_1.default.warn(`Missing role for user ${user.id}. Using fallback 'unknown'.`);
            return {
                id: user.id || (0, uuid_1.v4)(),
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
const isImageUrlValid = async (url) => {
    if (!url)
        return null;
    try {
        const response = await axios_1.default.head(url, { timeout: 5000 });
        return response.status === 200 ? url : null;
    }
    catch (error) {
        logger_1.default.warn(`Image URL invalide: ${url}`);
        return null;
    }
};
// Fonction pour vérifier si un nouvel item doit être synchronisé
const shouldSyncItem = async (item, Model, itemId) => {
    if (item.sync_status !== 'synced')
        return false;
    const existingItem = await Model.findOne({
        where: { id: itemId },
    });
    if (existingItem) {
        const existingTime = new Date(existingItem.getDataValue('time') || '1970-01-01');
        const newTime = new Date(item.time);
        return newTime > existingTime;
    }
    return true;
};
// Traitement d'un item individuel
const processItem = async (item, itemId, Model, mapData, logContext) => {
    var _a;
    if (!(await shouldSyncItem(item, Model, itemId))) {
        logger_1.default.debug(`Skipping sync for ${logContext} ID ${itemId}: already synced or invalid sync_status`);
        return;
    }
    if (Model === camion_1.default) {
        const { nom, type } = item;
        if (!nom ||
            !type ||
            typeof nom !== 'string' ||
            typeof type !== 'string' ||
            !nom.trim() ||
            !type.trim()) {
            logger_1.default.error(`Invalid camion data for ID ${itemId}: nom or type missing, invalid, or empty. Data: ${JSON.stringify(item)}. Skipping.`);
            return;
        }
    }
    const validImageUrl = await isImageUrlValid((_a = item.imageUrl) !== null && _a !== void 0 ? _a : null);
    const mappedData = mapData({ ...item, imageUrl: validImageUrl });
    if (Model === camion_1.default) {
        if (!mappedData.nom ||
            !mappedData.type ||
            typeof mappedData.nom !== 'string' ||
            typeof mappedData.type !== 'string' ||
            !mappedData.nom.trim() ||
            !mappedData.type.trim()) {
            logger_1.default.error(`Mapped data for camion ID ${itemId} has invalid nom or type: ${JSON.stringify(mappedData)}. Skipping.`);
            return;
        }
    }
    try {
        await Model.upsert(mappedData);
        logger_1.default.info(`${logContext}: ${itemId}`);
    }
    catch (error) {
        logger_1.default.error(`Failed to upsert ${logContext} ID ${itemId}: ${error.message}`);
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map((err) => err.message).join(', ');
            logger_1.default.error(`Validation error for ${logContext} ID ${itemId}: ${messages}`);
        }
    }
};
// Fonction générique de synchronisation
const syncData = async (refPath, Model, mapData) => {
    try {
        const ref = firebase_1.db.ref(refPath);
        const snapshot = await ref.once('value');
        const dataByDate = snapshot.val() || {};
        const upsertPromises = [];
        for (const date in dataByDate) {
            const items = dataByDate[date];
            for (const itemId in items) {
                const item = items[itemId];
                upsertPromises.push(processItem(item, itemId, Model, mapData, `${refPath} synchronisé`));
            }
        }
        await Promise.all(upsertPromises);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la synchronisation de ${refPath}: ${error.message}`);
        throw error;
    }
};
// Fonctions de synchronisation spécifiques
const syncTickets = () => syncData(syncConfigs.tickets.path, syncConfigs.tickets.model, syncConfigs.tickets.mapData);
exports.syncTickets = syncTickets;
const syncExpenses = () => syncData(syncConfigs.expenses.path, syncConfigs.expenses.model, syncConfigs.expenses.mapData);
exports.syncExpenses = syncExpenses;
const syncMileages = () => syncData(syncConfigs.mileage.path, syncConfigs.mileage.model, syncConfigs.mileage.mapData);
exports.syncMileages = syncMileages;
const syncUsers = () => syncData(syncConfigs.users.path, syncConfigs.users.model, syncConfigs.users.mapData);
exports.syncUsers = syncUsers;
const syncCamions = () => syncData(syncConfigs.camions.path, syncConfigs.camions.model, syncConfigs.camions.mapData);
exports.syncCamions = syncCamions;
// Configuration des écouteurs d'événements pour la synchronisation en temps réel
const setupRealtimeListener = (ref, path, Model, mapData, eventType) => {
    ref.on(eventType, async (snapshot) => {
        const dataByDate = snapshot.val();
        if (!dataByDate)
            return;
        for (const date in dataByDate) {
            const items = dataByDate[date];
            for (const itemId in items) {
                const item = items[itemId];
                if (eventType === 'child_removed') {
                    await Model.destroy({ where: { id: itemId } });
                    logger_1.default.info(`${path} supprimé en temps réel: ${itemId}`);
                }
                else {
                    await processItem(item, itemId, Model, mapData, `${path} ${eventType === 'child_added' ? 'ajouté' : 'mis à jour'} en temps réel`);
                }
            }
        }
    });
};
const startRealtimeSync = () => {
    Object.values(syncConfigs).forEach(({ path, model, mapData }) => {
        const ref = firebase_1.db.ref(path);
        setupRealtimeListener(ref, path, model, mapData, 'child_added');
        setupRealtimeListener(ref, path, model, mapData, 'child_changed');
        setupRealtimeListener(ref, path, model, mapData, 'child_removed');
    });
};
exports.startRealtimeSync = startRealtimeSync;
