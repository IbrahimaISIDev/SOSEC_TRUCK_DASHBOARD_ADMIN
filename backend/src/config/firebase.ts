import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || ""),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

export const db = admin.database();