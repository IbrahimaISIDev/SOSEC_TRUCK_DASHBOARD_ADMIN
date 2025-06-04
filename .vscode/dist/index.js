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
const app = (0, express_1.default)();
app.use(express_1.default.json());
// app.use('/auth', authRoutes);
// app.use('/financial', financialRoutes);
// app.use('/sync', syncRoutes);
// app.use('/api', userRoutes);
app.use('/api', financialRoutes_1.default);
app.use('/api', syncRoutes_1.default);
app.use('/auth', authRoutes_1.default);
app.use('/api', userRoutes_1.default);
app.use('/api', dataRoutes_1.default);
app.use('/api', camionRoutes_1.default); // Ajout
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});
const PORT = process.env.PORT || 3000;
db_1.default.sync({ force: false }).then(() => {
    (0, syncService_1.startRealtimeSync)();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
//# sourceMappingURL=index.js.map