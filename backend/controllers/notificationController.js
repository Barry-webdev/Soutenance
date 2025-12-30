import Notification from '../models/notificationModel.js';
import { logManualAudit } from '../middlewares/auditMiddleware.js';

/**
 * Récupérer les notifications d'un utilisateur
 */
export const getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.params.userId })
            .sort({ createdAt: -1 })
            .limit(50);

        // Audit pour consultation des notifications
        await logManualAudit(
            'NOTIFICATIONS_VIEW',
            req.user,
            `Consultation des notifications utilisateur`,
            { userId: req.params.userId, count: notifications.length }
        );

        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('❌ Erreur récupération notifications:', error);
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Créer une nouvelle notification
 */
export const createNotification = async (req, res) => {
    try {
        const { userId, title, message, type = 'info' } = req.body;

        const notification = await Notification.create({
            userId,
            title,
            message,
            type
        });

        // Audit pour création de notification
        await logManualAudit(
            'NOTIFICATION_CREATE',
            req.user,
            `Nouvelle notification créée`,
            { 
                notificationId: notification._id,
                userId: userId,
                title: title 
            }
        );

        res.status(201).json({
            success: true,
            message: 'Notification créée avec succès',
            data: notification
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            
            return res.status(400).json({ 
                success: false,
                error: 'Données invalides', 
                details: errors 
            });
        }
        
        console.error('❌ Erreur création notification:', error);
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur lors de la création de la notification' 
        });
    }
};

/**
 * Marquer une notification comme lue
 */
export const markNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ 
                success: false,
                error: 'Notification non trouvée' 
            });
        }

        // Audit pour marquage notification
        await logManualAudit(
            'NOTIFICATION_READ',
            req.user,
            `Notification marquée comme lue`,
            { notificationId: notification._id }
        );

        res.json({
            success: true,
            message: 'Notification marquée comme lue',
            data: notification
        });
    } catch (error) {
        console.error('❌ Erreur marquage notification:', error);
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Marquer toutes les notifications comme lues
 */
export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { userId: req.params.userId, read: false },
            { read: true }
        );

        // Audit pour marquage toutes notifications
        await logManualAudit(
            'NOTIFICATIONS_READ_ALL',
            req.user,
            `Toutes les notifications marquées comme lues`,
            { userId: req.params.userId, count: result.modifiedCount }
        );

        res.json({
            success: true,
            message: `${result.modifiedCount} notifications marquées comme lues`,
            data: { modifiedCount: result.modifiedCount }
        });
    } catch (error) {
        console.error('❌ Erreur marquage toutes notifications:', error);
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Récupérer le nombre de notifications non lues
 */
export const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ 
            userId: req.params.userId, 
            read: false 
        });

        res.json({
            success: true,
            data: { count }
        });
    } catch (error) {
        console.error('❌ Erreur comptage notifications:', error);
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};


