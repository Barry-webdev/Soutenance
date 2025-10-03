// routes/collaborationRoutes.js
import express from 'express';
import { 
    submitCollaborationRequest, 
    getCollaborationRequests, 
    updateCollaborationRequestStatus 
} from '../controllers/collaborationController.js';
import { validateCollaborationRequest } from '../middlewares/validationMiddleware.js';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Soumission publique (pas d'authentification requise)
router.post('/', validateCollaborationRequest, submitCollaborationRequest);

// Routes admin seulement
router.get('/', authenticate, requireAdmin, getCollaborationRequests);
router.patch('/:id/status', authenticate, requireAdmin, updateCollaborationRequestStatus);

export default router;