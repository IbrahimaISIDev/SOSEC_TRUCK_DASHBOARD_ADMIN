import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Utilisateur from '../models/utilisateur';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  throw new Error('JWT_SECRET is not defined in environment variables');
})();

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Accès non autorisé' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await Utilisateur.findByPk(decoded.id); // Simplified, assuming stateless JWT
    if (!user) {
      return res.status(403).json({ error: 'Utilisateur non trouvé' });
    }

    req.user = user;
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
};

export const authorizeDriver = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'driver') {
    return res.status(403).json({ error: 'Accès interdit' });
  }
  next();
};

export const authorizeAdminOrDriver = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'driver')) {
    return res.status(403).json({ error: 'Accès interdit' });
  }
  next();
};