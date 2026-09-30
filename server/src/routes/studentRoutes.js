import { Router } from 'express';
import { getStudentProfile } from '../controllers/studentController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/students/me - authenticated endpoint to retrieve student's own MongoDB record
router.get('/me', authenticate, getStudentProfile);

export default router;
