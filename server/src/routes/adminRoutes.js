import { Router } from 'express';
import {
  getAllAdminRequests,
  getAdminRequestDetail,
  approveRequest,
  rejectRequest,
  requestMoreInfo,
  routeRequest,
  getAuditLogs,
  getAllCertificates
} from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes with authentication and admin role requirement
router.use(authenticate, requireRole('admin'));

router.get('/requests', getAllAdminRequests);
router.get('/requests/:id', getAdminRequestDetail);
router.post('/requests/:id/approve', approveRequest);
router.post('/requests/:id/reject', rejectRequest);
router.post('/requests/:id/request-info', requestMoreInfo);
router.post('/requests/:id/route', routeRequest);
router.get('/audit-logs', getAuditLogs);
router.get('/certificates', getAllCertificates);

export default router;
