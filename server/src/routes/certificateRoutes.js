import { Router } from 'express';
import {
  getCertificate,
  getStudentCertificates,
  verifyCertificate,
  downloadCertificatePdf
} from '../controllers/certificateController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Student certificates list
router.get('/student', authenticate, getStudentCertificates);
router.get('/my', authenticate, getStudentCertificates);

// Public verification does not require auth so employers & universities can verify by QR
router.get('/:id/verify', verifyCertificate);
router.get('/:id/download', downloadCertificatePdf);
router.get('/:id', getCertificate);

export default router;
