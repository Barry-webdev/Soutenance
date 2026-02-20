// routes/securityRoute.js
import express from 'express';
import { 
    getSecurityStats, 
    getRecentAttacks, 
    getBlockedIPs, 
    unblockIP 
} from '../controllers/securityController.js';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Toutes les routes nécessitent l'authentification admin
router.use(authenticate);
router.use(requireAdmin);

// Routes de monitoring de sécurité
router.get('/stats', getSecurityStats);
router.get('/attacks', getRecentAttacks);
router.get('/blocked-ips', getBlockedIPs);
router.post('/unblock-ip', unblockIP);

export default router;
