// routes/auditRoutes.js
import express from 'express';
import { getAuditLogs, getAuditStats, searchAuditLogs } from '../controllers/auditLogController.js';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/', getAuditLogs);
router.get('/stats', getAuditStats);
router.get('/search', searchAuditLogs);

export default router;