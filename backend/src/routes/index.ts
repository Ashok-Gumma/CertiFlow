import { Router, Request, Response } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { Role } from '@prisma/client';

import { authenticate, requireRoles } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import {
  loginSchema,
  createBatchSchema,
  approvalSchema,
  revokeCertificateSchema,
  createCandidateSchema,
} from '../validators';

import { AuthController } from '../controllers/authController';
import { BatchController } from '../controllers/batchController';
import { ApprovalController } from '../controllers/approvalController';
import { CandidateController } from '../controllers/candidateController';
import { CertificateController } from '../controllers/certificateController';
import { PublicVerificationController } from '../controllers/publicVerificationController';
import { DeliveryController } from '../controllers/deliveryController';
import { DashboardController } from '../controllers/dashboardController';
import { AuditLogController } from '../controllers/auditLogController';
import { NotificationController } from '../controllers/notificationController';
import { eventBus } from '../events/eventBus';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Rate limiter for public certificate verification endpoint
const publicVerifyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many verification attempts from this IP. Please wait a moment and try again.',
  },
});

const router = Router();

// 1. Health Check
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'certiflow-api',
  });
});

// 2. Real-time Server-Sent Events (SSE)
router.get('/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  eventBus.addClient(res);

  // Initial welcome ping
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Connected to CertiFlow live updates' })}\n\n`);

  req.on('close', () => {
    eventBus.removeClient(res);
  });
});

// 3. Public Verification API (No auth required!)
router.get('/public/verify/:certificateId', publicVerifyLimiter, PublicVerificationController.verify);

// 4. Sample CSV Download
router.get('/batches/sample-csv', BatchController.getSampleCsv);
router.get('/lookups', BatchController.getLookups);

// 5. Authentication
router.post('/auth/login', validateBody(loginSchema), AuthController.login);
router.get('/auth/demo-users', AuthController.getDemoUsers);
router.post('/auth/demo-switch', AuthController.demoSwitch);
router.get('/auth/me', authenticate, AuthController.me);

// 6. Dashboard
router.get('/dashboard/stats', authenticate, DashboardController.getStats);
router.get(
  '/dashboard/stuck-batches',
  authenticate,
  requireRoles(Role.STATE_OFFICE, Role.DISTRICT_OFFICER, Role.QUALITY_TEAM),
  DashboardController.getStuckBatches
);

// 7. Batches
router.get('/batches', authenticate, BatchController.getBatches);
router.post(
  '/batches',
  authenticate,
  requireRoles(Role.TRAINING_CENTRE),
  validateBody(createBatchSchema),
  BatchController.createBatch
);
router.get('/batches/:id', authenticate, BatchController.getBatchById);
router.post(
  '/batches/:id/upload',
  authenticate,
  requireRoles(Role.TRAINING_CENTRE),
  upload.single('file'),
  BatchController.uploadCsv
);
router.post(
  '/batches/:id/submit',
  authenticate,
  requireRoles(Role.TRAINING_CENTRE),
  BatchController.submitBatch
);

// 8. Approvals
router.get(
  '/approvals',
  authenticate,
  ApprovalController.getPendingApprovals
);
router.post(
  '/batches/:id/approve',
  authenticate,
  requireRoles(Role.DISTRICT_OFFICER, Role.QUALITY_TEAM, Role.STATE_OFFICE),
  validateBody(approvalSchema),
  ApprovalController.approveBatch
);
router.post(
  '/batches/:id/reject',
  authenticate,
  requireRoles(Role.DISTRICT_OFFICER, Role.QUALITY_TEAM, Role.STATE_OFFICE),
  validateBody(approvalSchema),
  ApprovalController.rejectBatch
);
router.post(
  '/batches/:id/return',
  authenticate,
  requireRoles(Role.DISTRICT_OFFICER, Role.QUALITY_TEAM, Role.STATE_OFFICE),
  validateBody(approvalSchema),
  ApprovalController.returnBatch
);

// 9. Candidates
router.get('/candidates', authenticate, CandidateController.getCandidates);
router.post(
  '/candidates',
  authenticate,
  requireRoles(Role.TRAINING_CENTRE),
  validateBody(createCandidateSchema),
  CandidateController.createCandidate
);
router.get('/candidates/:id', authenticate, CandidateController.getCandidateById);

// 10. Certificates
router.get('/certificates', authenticate, CertificateController.getCertificates);
router.get('/certificates/:id', authenticate, CertificateController.getCertificateById);
router.get('/certificates/:id/download', CertificateController.downloadCertificate); // Can download with token or direct link
router.post(
  '/certificates/:id/revoke',
  authenticate,
  requireRoles(Role.STATE_OFFICE),
  validateBody(revokeCertificateSchema),
  CertificateController.revokeCertificate
);

// 11. WhatsApp Deliveries
router.get(
  '/deliveries',
  authenticate,
  requireRoles(Role.TRAINING_CENTRE, Role.DISTRICT_OFFICER, Role.STATE_OFFICE),
  DeliveryController.getDeliveries
);
router.post(
  '/deliveries/retry-failed',
  authenticate,
  requireRoles(Role.TRAINING_CENTRE, Role.DISTRICT_OFFICER, Role.STATE_OFFICE),
  DeliveryController.retryFailed
);

// 12. Audit Logs
router.get(
  '/audit-logs',
  authenticate,
  AuditLogController.getLogs
);

// 13. Notifications
router.get('/notifications', authenticate, NotificationController.getNotifications);
router.patch('/notifications/:id/read', authenticate, NotificationController.markAsRead);
router.patch('/notifications/read-all', authenticate, NotificationController.markAllAsRead);

export default router;
