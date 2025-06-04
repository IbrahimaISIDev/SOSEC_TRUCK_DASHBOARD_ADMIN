"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./config/db"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const financialRoutes_1 = __importDefault(require("./routes/financialRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const syncRoutes_1 = __importDefault(require("./routes/syncRoutes"));
const syncService_1 = require("./services/syncService");
const dataRoutes_1 = __importDefault(require("./routes/dataRoutes"));
const camionRoutes_1 = __importDefault(require("./routes/camionRoutes"));
require("./models/utilisateur");
require("./models/revenu");
require("./models/depense");
require("./models/document");
require("./cron/expirationCron");
require("./models/notification");
require("./models/client");
require("./models/camion");
const camionController_1 = require("./controllers/camionController");
const logger_1 = __importDefault(require("./utils/logger"));
console.log('camionRoutes importé :', camionRoutes_1.default); // Vérifiez si l'import fonctionne
console.log('camionRoutes :', camionRoutes_1.default); // Vérifiez si l'import fonctionne
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Mount all routes
app.use('/auth', authRoutes_1.default);
app.use('/financial', financialRoutes_1.default);
app.use('/api', userRoutes_1.default);
app.use('/sync', syncRoutes_1.default); // Consider mounting under /api if part of API
app.use('/api', financialRoutes_1.default); // Ensure financialRoutes is only mounted once
app.use('/api', dataRoutes_1.default);
console.log('Avant d\'ajouter les routes camion');
app.use('/api', camionRoutes_1.default);
console.log('Après avoir ajouté les routes camion');
app.post('/api/camions-direct-test', camionController_1.createCamionHandler);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});
const PORT = process.env.PORT || 3000;
async function initialize() {
    try {
        // Sync database schema
        await db_1.default.sync({ force: false });
        logger_1.default.info('Database synchronized successfully');
        // Perform initial sync with Firebase
        await Promise.all([
            (0, syncService_1.syncUsers)(),
            (0, syncService_1.syncCamions)(),
            (0, syncService_1.syncTickets)(),
            (0, syncService_1.syncExpenses)(),
            (0, syncService_1.syncMileages)(),
        ]);
        logger_1.default.info('Initial Firebase synchronization completed');
        // Start real-time sync
        (0, syncService_1.startRealtimeSync)();
        logger_1.default.info('Real-time synchronization started');
    }
    catch (error) {
        logger_1.default.error('Initialization failed:', { error: error.message, stack: error.stack });
        process.exit(1);
    }
}
// Start server only after initialization
initialize().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} at ${new Date().toISOString()}`);
    });
}).catch((error) => {
    logger_1.default.error('Failed to start server:', error);
    process.exit(1);
});
