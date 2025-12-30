import express from 'express';
import { getStats, getDashboardStats, getPublicStats } from '../controllers/statsController.js';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Statistiques publiques (pour tous les utilisateurs authentifiés)
router.get('/public', authenticate, getPublicStats);

// Statistiques complètes (admin seulement)
router.get('/', authenticate, requireAdmin, getStats);
router.get('/dashboard', authenticate, requireAdmin, getDashboardStats);

export default router;