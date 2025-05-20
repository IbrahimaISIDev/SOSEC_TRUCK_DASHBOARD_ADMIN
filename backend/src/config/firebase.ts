import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GOOGLE_CREDENTIALS_JSON) {
  throw new Error("Missing GOOGLE_CREDENTIALS_JSON in environment variables");
}

const serviceAccount = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

export const db = admin.database();
