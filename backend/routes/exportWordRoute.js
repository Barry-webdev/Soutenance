// routes/exportRoutes.js
import express from 'express';
import { 
    exportWasteReports, 
    exportCollaborations, 
    exportStatistics,
    getExportHistory,
    deleteExportHistory
} from '../controllers/exportWordController.js';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/waste-reports', exportWasteReports);
router.get('/collaborations', exportCollaborations);
router.get('/statistics', exportStatistics);
router.get('/history', getExportHistory);
router.delete('/history/:id', deleteExportHistory);

export default router;