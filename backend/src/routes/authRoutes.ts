import { Router } from 'express';
import { loginHandler } from '../controllers/authController';

const router = Router();

router.post('/login', loginHandler);

export default router;