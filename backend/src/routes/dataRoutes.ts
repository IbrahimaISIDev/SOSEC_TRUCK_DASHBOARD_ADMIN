import { Router } from 'express';
import {
  getAllDataHandler,
  getTicketsFromFirebase,
  getExpensesFromFirebase,
  getMileagesFromFirebase,
  getUsersFromFirebase,
  getCamionsFromFirebase
} from '../controllers/dataController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/data', authenticateToken, getAllDataHandler);
router.get('/firebase/tickets', authenticateToken, getTicketsFromFirebase);
router.get('/firebase/expenses', authenticateToken, getExpensesFromFirebase);
router.get('/firebase/mileages', authenticateToken, getMileagesFromFirebase);
router.get('/firebase/users', authenticateToken, getUsersFromFirebase);
router.get('/firebase/trucks', authenticateToken, getCamionsFromFirebase); 

export default router;