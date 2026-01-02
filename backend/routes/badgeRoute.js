import express from 'express';
import {
    initializeBadges,
    getAllBadges,
    getUserBadges,
    getUserProfile,
    getLeaderboard,
    checkUserBadges,
    getUserStats
} from '../controllers/badgeController.js';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/badges', getAllBadges);
router.get('/leaderboard', getLeaderboard);

// Routes utilisateur authentifié
router.get('/my-badges', authenticate, getUserBadges);
router.get('/my-profile', authenticate, getUserProfile);
router.get('/my-stats', authenticate, getUserStats);

// Routes admin
router.post('/initialize', authenticate, requireAdmin, initializeBadges);
router.post('/check/:userId', authenticate, requireAdmin, checkUserBadges);

export default router;