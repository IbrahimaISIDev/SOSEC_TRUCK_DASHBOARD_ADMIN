import { Router } from 'express';
import { syncDataHandler } from '../controllers/syncController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/sync', authenticateToken, syncDataHandler);

export default router;