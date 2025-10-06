import express from 'express';
import { 
    createWasteReport, 
    getWasteReports, 
    getUserWasteReports, 
    updateWasteReportStatus,
    getWasteReportsMap 
} from '../controllers/wasteController.js';
import { authenticate, requireAdmin, requireRoles } from '../middlewares/authMiddleware.js';
import { validateWasteReport } from '../middlewares/validationMiddleware.js';

const router = express.Router();

// Routes accessibles aux citoyens et partenaires
router.post('/', authenticate, requireRoles(['citizen', 'partner']), validateWasteReport, createWasteReport);
router.get('/my-reports', authenticate, requireRoles(['citizen', 'partner']), getUserWasteReports);
router.get('/map', authenticate, getWasteReportsMap);

// Routes admin seulement
router.get('/', authenticate, requireAdmin, getWasteReports);
router.patch('/:id/status', authenticate, requireAdmin, updateWasteReportStatus);

export default router;