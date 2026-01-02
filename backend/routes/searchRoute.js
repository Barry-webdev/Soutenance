import express from 'express';
import {
    searchReports,
    searchUsers,
    getSearchSuggestions,
    getSearchStats
} from '../controllers/searchController.js';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/reports', searchReports);
router.get('/suggestions', getSearchSuggestions);
router.get('/stats', getSearchStats);

// Routes admin
router.get('/users', authenticate, requireAdmin, searchUsers);

export default router;