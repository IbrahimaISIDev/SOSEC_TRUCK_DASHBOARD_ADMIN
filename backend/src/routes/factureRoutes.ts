import { Router } from 'express';
import { createFacture, getFactures, getFactureById } from '../controllers/factureController';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';

const router = Router();

// Apply authentication and admin authorization to all routes
router.use(authenticateToken);
router.use(authorizeAdmin);

router.post('/', createFacture);
router.get('/', getFactures);
router.get('/:id', getFactureById);

export default router;