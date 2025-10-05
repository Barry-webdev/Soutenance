// routes/exportRoutes.js
import express from 'express';
import { 
    exportWasteReports, 
    exportCollaborations, 
    exportStatistics,
    getExportHistory 
} from '../controllers/exportWordController.js';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(requireAdmin); // Seuls les admins peuvent exporter

router.get('/waste-reports', exportWasteReports);
router.get('/collaborations', exportCollaborations);
router.get('/statistics', exportStatistics);
router.get('/history', getExportHistory);

export default router;