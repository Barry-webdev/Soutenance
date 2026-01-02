import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

class WebSocketService {
    constructor() {
        this.io = null;
        this.connectedUsers = new Map(); // userId -> socketId
        this.userSockets = new Map(); // socketId -> userId
    }

    /**
     * Initialiser le serveur WebSocket
     */
    initialize(server) {
        this.io = new Server(server, {
            cors: {
                origin: [
                    process.env.FRONTEND_URL || 'http://localhost:3000',
                    'http://localhost:5173',
                    'http://localhost:5174'
                ],
                methods: ['GET', 'POST'],
                credentials: true
            }
        });

        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Token manquant'));
                }

                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
                const user = await User.findById(decoded.userId).select('-password');
                
                if (!user) {
                    return next(new Error('Utilisateur non trouvé'));
                }

                socket.userId = user._id.toString();
                socket.user = user;
                next();
            } catch (error) {
                next(new Error('Token invalide'));
            }
        });

        this.io.on('connection', (socket) => {
            this.handleConnection(socket);
        });

        console.log('🔌 Service WebSocket initialisé');
    }

    /**
     * Gérer une nouvelle connexion
     */
    handleConnection(socket) {
        const userId = socket.userId;
        
        // Enregistrer la connexion
        this.connectedUsers.set(userId, socket.id);
        this.userSockets.set(socket.id, userId);

        console.log(`👤 Utilisateur ${socket.user.name} connecté (${socket.id})`);

        // Rejoindre les salles appropriées
        socket.join(`user_${userId}`);
        if (socket.user.role === 'admin') {
            socket.join('admins');
        }

        // Envoyer les notifications en attente
        this.sendPendingNotifications(userId);

        // Gérer les événements
        socket.on('join_room', (room) => {
            socket.join(room);
            console.log(`📍 Utilisateur ${userId} a rejoint la salle ${room}`);
        });

        socket.on('leave_room', (room) => {
            socket.leave(room);
            console.log(`📍 Utilisateur ${userId} a quitté la salle ${room}`);
        });

        socket.on('disconnect', () => {
            this.handleDisconnection(socket);
        });

        // Événements personnalisés
        socket.on('mark_notification_read', (notificationId) => {
            this.markNotificationAsRead(userId, notificationId);
        });

        socket.on('request_live_stats', () => {
            this.sendLiveStats(socket);
        });
    }

    /**
     * Gérer une déconnexion
     */
    handleDisconnection(socket) {
        const userId = this.userSockets.get(socket.id);
        if (userId) {
            this.connectedUsers.delete(userId);
            this.userSockets.delete(socket.id);
            console.log(`👤 Utilisateur ${userId} déconnecté`);
        }
    }

    /**
     * Envoyer une notification à un utilisateur spécifique
     */
    sendNotificationToUser(userId, notification) {
        const socketId = this.connectedUsers.get(userId.toString());
        if (socketId) {
            this.io.to(socketId).emit('new_notification', notification);
            console.log(`🔔 Notification envoyée à l'utilisateur ${userId}`);
            return true;
        }
        return false;
    }

    /**
     * Envoyer une notification à tous les admins
     */
    sendNotificationToAdmins(notification) {
        this.io.to('admins').emit('admin_notification', notification);
        console.log('🔔 Notification envoyée aux admins');
    }

    /**
     * Diffuser une mise à jour en temps réel
     */
    broadcastUpdate(event, data, room = null) {
        if (room) {
            this.io.to(room).emit(event, data);
        } else {
            this.io.emit(event, data);
        }
        console.log(`📡 Diffusion: ${event} ${room ? `dans ${room}` : 'globale'}`);
    }

    /**
     * Envoyer les statistiques en temps réel
     */
    async sendLiveStats(socket) {
        try {
            // Ici vous pouvez récupérer les stats en temps réel
            const stats = {
                connectedUsers: this.connectedUsers.size,
                timestamp: new Date().toISOString()
            };
            
            socket.emit('live_stats', stats);
        } catch (error) {
            console.error('❌ Erreur envoi stats temps réel:', error);
        }
    }

    /**
     * Envoyer les notifications en attente
     */
    async sendPendingNotifications(userId) {
        try {
            // Récupérer les notifications non lues depuis la base de données
            // et les envoyer via WebSocket
            console.log(`📬 Envoi des notifications en attente pour ${userId}`);
        } catch (error) {
            console.error('❌ Erreur envoi notifications en attente:', error);
        }
    }

    /**
     * Marquer une notification comme lue
     */
    async markNotificationAsRead(userId, notificationId) {
        try {
            // Logique pour marquer la notification comme lue
            console.log(`✅ Notification ${notificationId} marquée comme lue par ${userId}`);
        } catch (error) {
            console.error('❌ Erreur marquage notification:', error);
        }
    }

    /**
     * Obtenir les utilisateurs connectés
     */
    getConnectedUsers() {
        return Array.from(this.connectedUsers.keys());
    }

    /**
     * Vérifier si un utilisateur est connecté
     */
    isUserConnected(userId) {
        return this.connectedUsers.has(userId.toString());
    }

    /**
     * Envoyer une mise à jour de signalement
     */
    sendReportUpdate(reportId, updateData, type = 'report_updated') {
        this.io.emit(type, {
            reportId,
            ...updateData,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Envoyer une mise à jour de badge
     */
    sendBadgeUpdate(userId, badgeData) {
        this.sendNotificationToUser(userId, {
            type: 'badge_earned',
            data: badgeData,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Envoyer les mises à jour de la carte en temps réel
     */
    sendMapUpdate(updateData) {
        this.io.emit('map_update', {
            ...updateData,
            timestamp: new Date().toISOString()
        });
    }
}

// Instance singleton
const webSocketService = new WebSocketService();
export default webSocketService;