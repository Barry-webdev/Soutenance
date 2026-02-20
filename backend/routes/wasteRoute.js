import express from 'express';
import { 
    createWasteReport, 
    getWasteReports, 
    getUserWasteReports, 
    updateWasteReportStatus,
    deleteWasteReport,
    getWasteReportsMap 
} from '../controllers/wasteController.js';
import { authenticate, requireAdmin, requireRoles } from '../middlewares/authMiddleware.js';
import { validateWasteReport } from '../middlewares/validationMiddleware.js';
import { uploadImageAndAudio, validateUploads, handleUploadError } from '../middlewares/uploadMiddleware.js';
import { reportLimiter, sanitizeInput, validateMongoId } from '../middlewares/securityMiddleware.js';

const router = express.Router();

// Routes publiques (sans authentification)
router.get('/public', getWasteReportsMap);

// Routes accessibles aux citoyens et partenaires
// 🔒 SÉCURITÉ: Limitation de signalements + sanitization
router.post('/', 
    authenticate, 
    requireRoles(['citizen', 'partner']),
    reportLimiter,
    sanitizeInput,
    uploadImageAndAudio, 
    validateUploads, 
    validateWasteReport, 
    createWasteReport,
    handleUploadError
);
router.get('/my-reports', authenticate, requireRoles(['citizen', 'partner']), getUserWasteReports);

// Routes admin et partenaires seulement
router.get('/map', authenticate, requireRoles(['admin', 'super_admin', 'partner']), getWasteReportsMap);

// Routes admin seulement
// 🔒 SÉCURITÉ: Validation des IDs MongoDB
router.get('/', authenticate, requireAdmin, getWasteReports);
router.patch('/:id/status', authenticate, requireAdmin, validateMongoId('id'), sanitizeInput, updateWasteReportStatus);
router.delete('/:id', authenticate, requireAdmin, validateMongoId('id'), deleteWasteReport);

export default router;