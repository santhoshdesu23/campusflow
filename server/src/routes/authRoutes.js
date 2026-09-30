import { Router } from 'express';
import { login, getMe, getDemoAccounts } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.get('/me', authenticate, getMe);
router.get('/demo-accounts', getDemoAccounts);

export default router;
