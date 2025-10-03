// routes/statsRoutes.js
import express from 'express';
import { getStats, getDashboardStats } from '../controllers/statsController.js';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/', getStats);
router.get('/dashboard', getDashboardStats);

export default router;