const admin = require('firebase-admin');
import dotenv from 'dotenv';

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
      '/home/dev/Sosec_Truck_Admin_Dashboard_1/backend/sosec-app-firebase-adminsdk-fbsvc-8560d813da.json'
  ),
  databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://sosec-app.firebaseio.com',
});

module.exports = {
  db: admin.database(),
  auth: admin.auth(),
  admin: admin,
};