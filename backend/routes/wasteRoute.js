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
import { uploadSingleImage, validateImageUpload, handleUploadError } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Routes publiques (sans authentification)
router.get('/public', getWasteReportsMap);

// Routes accessibles aux citoyens et partenaires
router.post('/', 
    authenticate, 
    requireRoles(['citizen', 'partner']), 
    uploadSingleImage, 
    validateImageUpload, 
    validateWasteReport, 
    createWasteReport,
    handleUploadError
);
router.get('/my-reports', authenticate, requireRoles(['citizen', 'partner']), getUserWasteReports);
router.get('/map', authenticate, getWasteReportsMap);

// Routes admin seulement
router.get('/', authenticate, requireAdmin, getWasteReports);
router.patch('/:id/status', authenticate, requireAdmin, updateWasteReportStatus);
router.delete('/:id', authenticate, requireAdmin, deleteWasteReport);

export default router;