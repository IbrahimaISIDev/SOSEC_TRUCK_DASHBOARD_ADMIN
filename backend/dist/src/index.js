"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const financialRoutes_1 = __importDefault(require("./routes/financialRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const syncRoutes_1 = __importDefault(require("./routes/syncRoutes"));
const camionRoutes_1 = __importDefault(require("./routes/camionRoutes"));
const dataRoutes_1 = __importDefault(require("./routes/dataRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const factureRoutes_1 = __importDefault(require("./routes/factureRoutes"));
const syncService_1 = require("./services/syncService");
require("./services/notificationService");
const utilisateur_1 = __importDefault(require("./models/utilisateur"));
const camion_1 = __importDefault(require("./models/camion"));
const depense_1 = __importDefault(require("./models/depense"));
const revenu_1 = __importDefault(require("./models/revenu"));
const document_1 = __importDefault(require("./models/document"));
const client_1 = __importDefault(require("./models/client"));
const facture_1 = __importDefault(require("./models/facture"));
const notification_1 = __importDefault(require("./models/notification"));
const logger_1 = __importDefault(require("./utils/logger"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        console.log('CORS origin:', origin);
        if (!origin ||
            [
                'http://localhost:5173',
                'http://127.0.0.1:5173',
                'http://localhost:5174',
                'http://127.0.0.1:5174',
            ].includes(origin)) {
            callback(null, true);
        }
        else {
            callback(null, false);
        }
    },
    credentials: true,
}));
// Increase payload size limit to 10MB (or adjust as needed)
app.use(express_1.default.json({ limit: '10mb' }));
// Initialize models
const models = {
    Utilisateur: utilisateur_1.default,
    Camion: camion_1.default,
    Depense: depense_1.default,
    Revenu: revenu_1.default,
    Document: document_1.default,
    Client: client_1.default,
    Facture: facture_1.default,
    Notification: notification_1.default,
};
// Initialize associations
Object.values(models).forEach((model) => {
    if (model.associate) {
        model.associate(models);
    }
});
app.use('/auth', authRoutes_1.default);
app.use('/api', financialRoutes_1.default);
app.use('/api', userRoutes_1.default);
app.use('/api', syncRoutes_1.default);
app.use('/api', dataRoutes_1.default);
app.use('/api', camionRoutes_1.default);
app.use('/api', notificationRoutes_1.default);
app.use('/api/factures', factureRoutes_1.default);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});
const PORT = process.env.PORT || 3000;
async function initialize() {
    try {
        await utilisateur_1.default.sync({ force: false });
        logger_1.default.info('Utilisateur synchronisé');
        await camion_1.default.sync({ force: false });
        logger_1.default.info('Camion synchronisé');
        await depense_1.default.sync({ force: false });
        logger_1.default.info('Depense synchronisé');
        await revenu_1.default.sync({ force: false });
        logger_1.default.info('Revenu synchronisé');
        await document_1.default.sync({ force: false });
        logger_1.default.info('Document synchronisé');
        await client_1.default.sync({ force: false });
        logger_1.default.info('Client synchronisé');
        await facture_1.default.sync({ force: false });
        logger_1.default.info('Facture synchronisé');
        await notification_1.default.sync({ force: false });
        logger_1.default.info('Notification synchronisé');
        logger_1.default.info('Database synchronized successfully');
        await Promise.all([
            (0, syncService_1.syncUsers)(),
            (0, syncService_1.syncCamions)(),
            (0, syncService_1.syncTickets)(),
            (0, syncService_1.syncExpenses)(),
            (0, syncService_1.syncMileages)(),
        ]);
        logger_1.default.info('Initial Firebase synchronization completed');
        (0, syncService_1.startRealtimeSync)();
        logger_1.default.info('Real-time synchronization started');
    }
    catch (error) {
        if (error instanceof Error) {
            logger_1.default.error('Initialization failed:', {
                error: error.message,
                stack: error.stack,
            });
        }
        else {
            logger_1.default.error('Initialization failed:', {
                error: String(error),
            });
        }
        process.exit(1);
    }
}
initialize()
    .then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} at ${new Date().toISOString()}`);
    });
})
    .catch((error) => {
    logger_1.default.error('Failed to start server:', error);
    process.exit(1);
});
