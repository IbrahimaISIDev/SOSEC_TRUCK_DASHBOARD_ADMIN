"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require('firebase-admin');
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
admin.initializeApp({
    credential: admin.credential.cert(process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
        '/home/dev/Sosec_Truck_Admin_Dashboard_1/backend/sosec-app-firebase-adminsdk-fbsvc-8560d813da.json'),
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://sosec-app.firebaseio.com',
});
module.exports = {
    db: admin.database(),
    auth: admin.auth(),
    admin: admin,
};
