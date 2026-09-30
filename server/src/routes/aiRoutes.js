import { Router } from 'express';
import { parseRequest } from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/parse-request', authenticate, parseRequest);

export default router;
