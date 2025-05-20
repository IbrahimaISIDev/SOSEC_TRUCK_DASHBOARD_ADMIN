import { Router } from 'express';
import { createUserHandler, getUserHandler, updateUserHandler, deleteUserHandler, getAllUsersHandler, removeCamionFromDriver, assignCamionToDriver } from '../controllers/userController';
import { authenticateToken, authorizeAdmin, authorizeRole } from '../middleware/auth';
import logger from '../utils/logger';

const router = Router();

// Journal pour toutes les requêtes entrantes
router.use((req, res, next) => {
  logger.info(`Requête reçue: ${req.method} ${req.url}`);
  next();
});

// Récupérer un utilisateur par ID
router.get('/users/:userId', authenticateToken, getUserHandler);

// Récupérer tous les utilisateurs
router.get('/users', authenticateToken, getAllUsersHandler);

// Créer un utilisateur
router.post('/users', authenticateToken, createUserHandler);

// Mettre à jour un utilisateur
router.patch('/users/:userId', authenticateToken, updateUserHandler);

// Supprimer un utilisateur
router.delete('/users/:userId', authenticateToken, deleteUserHandler);

// Assigner un camion à un chauffeur
router.post('/users/:userId/assign-camion', authenticateToken, authorizeAdmin, assignCamionToDriver);

// Retirer un camion d'un chauffeur
router.post('/users/:userId/remove-camion', authenticateToken, removeCamionFromDriver);

export default router;