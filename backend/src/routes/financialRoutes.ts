import { Router } from 'express';
import {
  createRevenuHandler,
  createDepenseHandler,
  getDepensesByDateHandler,
  getAllDepensesHandler,
  getTicketsByDateHandler,
  getMileagesByDateHandler,
} from '../controllers/financialController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/revenus', authenticateToken, createRevenuHandler);
router.post('/depenses', authenticateToken, createDepenseHandler);
router.get('/depenses/:date', authenticateToken, getDepensesByDateHandler);
router.get('/depenses', authenticateToken, getAllDepensesHandler);
router.get('/tickets/:date', authenticateToken, getTicketsByDateHandler);
router.get('/mileages/:date', authenticateToken, getMileagesByDateHandler);

export default router;