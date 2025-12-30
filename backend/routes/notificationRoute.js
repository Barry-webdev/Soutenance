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

// Récupérer les notifications de l'utilisateur connecté
router.get('/', getUserNotifications);

// Récupérer les notifications d'un utilisateur spécifique (pour les admins)
router.get('/:userId', getUserNotifications);

// Créer une nouvelle notification
router.post('/', createNotification);

// Marquer une notification comme lue
router.put('/:id/read', markNotificationAsRead);
router.patch('/:id/read', markNotificationAsRead);

// Marquer toutes les notifications comme lues
router.put('/:userId/markAllAsRead', markAllNotificationsAsRead);
router.patch('/read-all', markAllNotificationsAsRead);

// Récupérer le nombre de notifications non lues
router.get('/unread-count', getUnreadCount);
router.get('/:userId/unread-count', getUnreadCount);

export default router;
