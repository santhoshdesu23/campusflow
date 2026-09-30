import { Router } from 'express';
import {
  createStudentRequest,
  getStudentRequests,
  getRequestById
} from '../controllers/requestController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, createStudentRequest);
router.get('/student', authenticate, getStudentRequests);
router.get('/my', authenticate, getStudentRequests);
router.get('/:id', authenticate, getRequestById);

export default router;
