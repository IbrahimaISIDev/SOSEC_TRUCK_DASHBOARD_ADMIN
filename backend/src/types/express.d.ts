// src/types/express.d.ts
import 'express';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      role?: string;
    } | Utilisateur; // Permet de stocker soit un objet simple { id, role }, soit l'instance Utilisateur
  }
}