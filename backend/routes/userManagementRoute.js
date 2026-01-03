import express from 'express';
import { 
    getAllUsers,
    updateUserRole,
    deleteUser,
    toggleUserStatus,
    getUserStats
} from '../controllers/userManagementController.js';
import { authenticate, requireSuperAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification super admin
router.use(authenticate, requireSuperAdmin);

// Routes de gestion des utilisateurs
router.get('/', getAllUsers);
router.get('/stats', getUserStats);
router.patch('/:id/role', updateUserRole);
router.patch('/:id/toggle-status', toggleUserStatus);
router.delete('/:id', deleteUser);

export default router;