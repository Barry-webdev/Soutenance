import NotificationService from '../services/notification.js';

/**
 * Récupérer les notifications de l'utilisateur
 */
export const getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, unreadOnly = false } = req.query;

        const result = await NotificationService.getUserNotifications(req.user._id, {
            page: parseInt(page),
            limit: parseInt(limit),
            unreadOnly: unreadOnly === 'true'
        });

        res.json({
            success: true,
            data: result
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
 * Marquer une notification comme lue
 */
export const markAsRead = async (req, res) => {
    try {
        const notification = await NotificationService.markAsRead(
            req.params.id, 
            req.user._id
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Notification non trouvée'
            });
        }

        res.json({
            success: true,
            message: 'Notification marquée comme lue',
            data: notification
        });
    } catch (error) {
        console.error('❌ Erreur marquer notification comme lue:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
};

/**
 * Marquer toutes les notifications comme lues
 */
export const markAllAsRead = async (req, res) => {
    try {
        const result = await NotificationService.markAllAsRead(req.user._id);

        res.json({
            success: true,
            message: `${result.modifiedCount} notifications marquées comme lues`,
            data: result
        });
    } catch (error) {
        console.error('❌ Erreur marquer toutes notifications comme lues:', error);
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
        const result = await NotificationService.getUserNotifications(req.user._id, {
            unreadOnly: true,
            limit: 1
        });

        res.json({
            success: true,
            data: {
                unreadCount: result.pagination.unreadCount
            }
        });
    } catch (error) {
        console.error('❌ Erreur récupération compte notifications non lues:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
};