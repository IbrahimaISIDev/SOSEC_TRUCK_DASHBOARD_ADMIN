import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Utilisateur from '../models/utilisateur';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'c57f6619b230a8735fa7dd2fb2753d581c3311be1b0daa490fdbada15d6652ce4ba6c239cf9e44c8f5f1675693b25a02ae480e2b37c6946e243994195cf9afaf';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Accès non autorisé' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await Utilisateur.findOne({ where: { id: decoded.id, token } });
    if (!user) {
      return res.status(403).json({ error: 'Token invalide' });
    }

    // Assigner l'utilisateur complet à req.user
    req.user = user; // Compatible avec l'interface étendue
    next();
  } catch (error: any) {
    logger.error(`Erreur d'authentification: ${error.message}`);
    res.status(403).json({ error: 'Token invalide' });
  }
};

export const authorizeRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès interdit' });
    }
    next();
  };
};
  export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès interdit' });
    }
    next();
  }
  export const authorizeDriver = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'driver') {
      return res.status(403).json({ error: 'Accès interdit' });
    }
    next();
  }
  export const authorizeAdminOrDriver = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'driver')) {
      return res.status(403).json({ error: 'Accès interdit' });
    }
    next();
  }