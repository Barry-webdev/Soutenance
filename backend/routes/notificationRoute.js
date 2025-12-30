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

// Récupérer les notifications d'un utilisateur
router.get('/:userId', authenticate, getUserNotifications);

// Créer une nouvelle notification
router.post('/', authenticate, createNotification);

// Marquer une notification comme lue
router.put('/:id/read', authenticate, markNotificationAsRead);

// Marquer toutes les notifications comme lues
router.put('/:userId/markAllAsRead', authenticate, markAllNotificationsAsRead);

// Récupérer le nombre de notifications non lues
router.get('/:userId/unread-count', authenticate, getUnreadCount);

export default router;


