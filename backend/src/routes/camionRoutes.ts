import { Router } from 'express';
import { createCamionHandler, getCamionHandler, updateCamionHandler, deleteCamionHandler, getAllCamionsHandler } from '../controllers/camionController';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';
import logger from '../utils/logger';

const router = Router();

// Journal pour toutes les requêtes entrantes
router.use((req, res, next) => {
  logger.info(`Requête reçue: ${req.method} ${req.url}`, {
    headers: req.headers.authorization ? 'Authorization present' : 'No Authorization header',
    camionId: req.params.camionId,
  });
  next();
});

// Créer un camion (admin uniquement)
router.post('/camions', authenticateToken, authorizeAdmin, createCamionHandler);

// Récupérer un camion (admin uniquement)
router.get('/camions/:camionId', authenticateToken, authorizeAdmin, getCamionHandler);

// Lister tous les camions (admin uniquement)
router.get('/camions', authenticateToken, authorizeAdmin, getAllCamionsHandler);

// Mettre à jour un camion (admin uniquement)
router.patch('/camions/:camionId', authenticateToken, authorizeAdmin, updateCamionHandler);

// Supprimer un camion (admin uniquement)
router.delete('/camions/:camionId', authenticateToken, authorizeAdmin, deleteCamionHandler);

export default router;