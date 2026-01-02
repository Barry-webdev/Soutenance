import Notification from '../models/notificationModel.js';
import User from '../models/userModel.js';
import EmailService from './emailService.js';
import webSocketService from './websocketService.js';

class NotificationService {
    
    /**
     * Créer une notification
     */
    static async createNotification(notificationData) {
        try {
            const notification = await Notification.create(notificationData);
            
            // Émettre un événement WebSocket si disponible
            this.emitNotification(notification);
            
            console.log(`🔔 Notification créée: ${notification.title}`);
            return notification;
        } catch (error) {
            console.error('❌ Erreur création notification:', error);
            throw error;
        }
    }

    /**
     * Émettre une notification via WebSocket
     */
    static emitNotification(notification) {
        try {
            if (webSocketService && webSocketService.sendNotificationToUser) {
                webSocketService.sendNotificationToUser(notification.userId, {
                    id: notification._id,
                    userId: notification.userId,
                    title: notification.title,
                    message: notification.message,
                    type: notification.type || 'info',
                    read: notification.read || false,
                    createdAt: notification.createdAt
                });
            }
        } catch (error) {
            console.error('❌ Erreur émission WebSocket:', error);
        }
    }

    /**
     * Notifier les admins d'un nouveau signalement
     */
    static async notifyAdminsNewWasteReport(wasteReport) {
        try {
            const admins = await User.find({ role: 'admin' }).select('_id name email');
            const user = await User.findById(wasteReport.userId).select('name email');
            
            // Créer les notifications in-app
            const notifications = admins.map(admin => ({
                userId: admin._id,
                title: '🚨 Nouveau Signalement de Déchet',
                message: `Un citoyen a signalé des déchets: "${wasteReport.description.substring(0, 50)}..."`,
                type: 'waste_report_created',
                relatedEntity: {
                    entityType: 'WasteReport',
                    entityId: wasteReport._id
                },
                priority: 'high',
                actionUrl: `/admin/waste-reports/${wasteReport._id}`
            }));

            await Promise.all(
                notifications.map(notification => this.createNotification(notification))
            );

            // Notification WebSocket spéciale pour les admins
            if (webSocketService && webSocketService.sendNotificationToAdmins) {
                webSocketService.sendNotificationToAdmins({
                    type: 'new_waste_report',
                    title: '🚨 Nouveau Signalement',
                    message: `Signalement de ${wasteReport.wasteType} par ${user?.name}`,
                    data: wasteReport
                });
            }

            // Envoyer les emails aux admins
            try {
                await EmailService.notifyAdminsNewReport(wasteReport, user);
                console.log('📧 Emails de notification envoyés aux admins');
            } catch (emailError) {
                console.log('⚠️ Erreur envoi email (non bloquante):', emailError.message);
            }

            console.log(`📢 Notifications signalement envoyées à ${admins.length} admins`);
        } catch (error) {
            console.error('❌ Erreur notification admins signalement:', error);
        }
    }

    /**
     * Notifier l'utilisateur du changement de statut de son signalement
     */
    static async notifyUserWasteReportStatus(wasteReport, oldStatus, newStatus) {
        try {
            const statusMessages = {
                'pending': '⏳ en attente de collecte',
                'collected': '✅ collecté',
                'not_collected': '❌ non collecté'
            };

            // Notification in-app
            const notification = await this.createNotification({
                userId: wasteReport.userId._id || wasteReport.userId,
                title: '📋 Statut de Votre Signalement Mis à Jour',
                message: `Votre signalement a été marqué comme "${statusMessages[newStatus]}"`,
                type: 'waste_report_status_updated',
                relatedEntity: {
                    entityType: 'WasteReport',
                    entityId: wasteReport._id
                },
                priority: 'medium',
                actionUrl: `/my-reports/${wasteReport._id}`
            });

            // Email de notification
            try {
                const user = wasteReport.userId.name ? wasteReport.userId : 
                             await User.findById(wasteReport.userId).select('name email');
                
                if (user && user.email) {
                    await EmailService.notifyUserStatusChange(wasteReport, user, oldStatus, newStatus);
                    console.log('📧 Email de changement de statut envoyé');
                }
            } catch (emailError) {
                console.log('⚠️ Erreur envoi email statut (non bloquante):', emailError.message);
            }

            console.log(`✅ Notification statut envoyée à l'utilisateur ${wasteReport.userId._id || wasteReport.userId}`);
        } catch (error) {
            console.error('❌ Erreur notification statut signalement:', error);
        }
    }

    /**
     * Notifier l'utilisateur des points gagnés
     */
    static async notifyUserPointsAwarded(userId, points, reason) {
        try {
            const user = await User.findById(userId).select('name');
            
            const notification = await this.createNotification({
                userId: userId,
                title: '🎉 Points Attribués !',
                message: `Félicitations ${user.name} ! Vous avez gagné ${points} points pour ${reason}`,
                type: 'points_awarded',
                priority: 'low',
                actionUrl: '/profile'
            });

            console.log(`💰 Notification points envoyée à l'utilisateur ${userId}`);
        } catch (error) {
            console.error('❌ Erreur notification points:', error);
        }
    }

    /**
     * Notifier les admins d'une nouvelle demande de collaboration
     */
    static async notifyAdminsNewCollaboration(collaboration) {
        try {
            const admins = await User.find({ role: 'admin' }).select('_id name email');
            
            const notifications = admins.map(admin => ({
                userId: admin._id,
                title: '🤝 Nouvelle Demande de Collaboration',
                message: `📩 ${collaboration.organizationName} souhaite collaborer avec vous`,
                type: 'collaboration_submitted',
                relatedEntity: {
                    entityType: 'CollaborationRequest',
                    entityId: collaboration._id
                },
                priority: 'medium',
                actionUrl: `/admin/collaborations/${collaboration._id}`
            }));

            await Promise.all(
                notifications.map(notification => this.createNotification(notification))
            );

            console.log(`📨 Notifications collaboration envoyées à ${admins.length} admins`);
        } catch (error) {
            console.error('❌ Erreur notification collaboration:', error);
        }
    }

    /**
     * Notifier l'utilisateur de la suppression de son signalement
     */
    static async notifyUserWasteReportDeleted(userId, wasteReport) {
        try {
            const notification = await this.createNotification({
                userId: userId,
                title: '🗑️ Signalement Supprimé',
                message: `Votre signalement "${wasteReport.description.substring(0, 50)}..." a été supprimé par un administrateur`,
                type: 'waste_report_status_updated',
                priority: 'medium',
                actionUrl: '/my-reports'
            });

            console.log(`🗑️ Notification suppression envoyée à l'utilisateur ${userId}`);
        } catch (error) {
            console.error('❌ Erreur notification suppression signalement:', error);
        }
    }

    /**
     * Envoyer un email de bienvenue aux nouveaux utilisateurs
     */
    static async sendWelcomeNotification(user) {
        try {
            // Notification in-app
            await this.createNotification({
                userId: user._id,
                title: '🌱 Bienvenue sur EcoApp Pita !',
                message: `Bonjour ${user.name} ! Commencez à signaler des déchets et gagnez des points.`,
                type: 'welcome',
                priority: 'low',
                actionUrl: '/report'
            });

            // Email de bienvenue
            try {
                await EmailService.sendWelcomeEmail(user);
                console.log('📧 Email de bienvenue envoyé');
            } catch (emailError) {
                console.log('⚠️ Erreur envoi email bienvenue (non bloquante):', emailError.message);
            }

            console.log(`👋 Notification de bienvenue envoyée à ${user.name}`);
        } catch (error) {
            console.error('❌ Erreur notification bienvenue:', error);
        }
    }

    /**
     * Émettre une notification via WebSocket (si configuré)
     */
    static emitNotification(notification) {
        // Intégration WebSocket (optionnelle)
        if (global.io) {
            global.io.to(notification.userId.toString()).emit('new_notification', {
                id: notification._id,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                isRead: notification.isRead,
                createdAt: notification.createdAt
            });
        }
    }

    /**
     * Marquer une notification comme lue
     */
    static async markAsRead(notificationId, userId) {
        try {
            const notification = await Notification.findOneAndUpdate(
                { _id: notificationId, userId: userId },
                { isRead: true },
                { new: true }
            );

            return notification;
        } catch (error) {
            console.error('❌ Erreur marquer notification comme lue:', error);
            throw error;
        }
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    static async markAllAsRead(userId) {
        try {
            const result = await Notification.updateMany(
                { userId: userId, isRead: false },
                { isRead: true }
            );

            console.log(`📭 ${result.modifiedCount} notifications marquées comme lues pour l'utilisateur ${userId}`);
            return result;
        } catch (error) {
            console.error('❌ Erreur marquer toutes notifications comme lues:', error);
            throw error;
        }
    }

    /**
     * Récupérer les notifications d'un utilisateur
     */
    static async getUserNotifications(userId, options = {}) {
        try {
            const { page = 1, limit = 20, unreadOnly = false } = options;
            const skip = (page - 1) * limit;

            const filter = { userId: userId };
            if (unreadOnly) {
                filter.isRead = false;
            }

            const notifications = await Notification.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await Notification.countDocuments(filter);
            const unreadCount = await Notification.countDocuments({ 
                userId: userId, 
                isRead: false 
            });

            return {
                notifications,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total,
                    unreadCount
                }
            };
        } catch (error) {
            console.error('❌ Erreur récupération notifications:', error);
            throw error;
        }
    }

    /**
     * Supprimer les anciennes notifications (nettoyage)
     */
    static async cleanupOldNotifications(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const result = await Notification.deleteMany({
                createdAt: { $lt: cutoffDate },
                isRead: true
            });

            console.log(`🧹 ${result.deletedCount} anciennes notifications supprimées`);
            return result;
        } catch (error) {
            console.error('❌ Erreur nettoyage notifications:', error);
            throw error;
        }
    }

    /**
     * Envoyer le rapport hebdomadaire aux admins
     */
    static async sendWeeklyReport() {
        try {
            await EmailService.sendWeeklyReport();
            console.log('📊 Rapport hebdomadaire envoyé');
        } catch (error) {
            console.error('❌ Erreur envoi rapport hebdomadaire:', error);
        }
    }
}

export default NotificationService;