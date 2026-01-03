import express from 'express';
import { 
    submitCollaborationRequest, 
    getCollaborationRequests, 
    updateCollaborationRequestStatus 
} from '../controllers/collaborationController.js';
import { validateCollaborationRequest } from '../middlewares/validationMiddleware.js';
import { authenticate, requireSuperAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Soumission publique (pas d'authentification requise)
router.post('/', validateCollaborationRequest, submitCollaborationRequest);

// Routes super admin seulement
router.get('/', authenticate, requireSuperAdmin, getCollaborationRequests);
router.patch('/:id/status', authenticate, requireSuperAdmin, updateCollaborationRequestStatus);

export default router;