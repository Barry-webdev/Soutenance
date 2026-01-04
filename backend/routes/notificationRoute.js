import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
    getUserNotifications,
    createNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadCount
} from '../controllers/notificationController.js';

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticate);

// Routes spécifiques AVANT les routes avec paramètres
// Récupérer le nombre de notifications non lues
router.get('/unread-count', getUnreadCount);

// Récupérer les notifications de l'utilisateur connecté
router.get('/', getUserNotifications);

// Créer une nouvelle notification
router.post('/', createNotification);

// Marquer toutes les notifications comme lues
router.patch('/read-all', markAllNotificationsAsRead);

// Routes avec paramètres APRÈS les routes spécifiques
// Récupérer les notifications d'un utilisateur spécifique (pour les admins)
router.get('/:userId', getUserNotifications);

// Marquer une notification comme lue
router.put('/:id/read', markNotificationAsRead);
router.patch('/:id/read', markNotificationAsRead);

// Marquer toutes les notifications comme lues pour un utilisateur spécifique
router.put('/:userId/markAllAsRead', markAllNotificationsAsRead);

// Récupérer le nombre de notifications non lues pour un utilisateur spécifique
router.get('/:userId/unread-count', getUnreadCount);

export default router;
