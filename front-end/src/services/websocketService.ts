import { io, Socket } from 'socket.io-client';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 2000;
  private isConnecting = false;

  connect(token: string) {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    try {
      console.log('🔌 Tentative de connexion WebSocket...');
      this.isConnecting = true;

      // 🔒 SÉCURITÉ: Utiliser la bonne URL selon l'environnement
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      
      this.socket = io(backendUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 5000,
        forceNew: true,
        autoConnect: true,
        reconnection: false // Désactiver la reconnexion automatique
      });

      this.socket.on('connect', () => {
        console.log('✅ WebSocket connecté');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ WebSocket déconnecté:', reason);
        this.isConnecting = false;
        // Ne pas tenter de reconnexion en production si le serveur ne supporte pas WebSocket
      });

      this.socket.on('connect_error', (error) => {
        console.log('⚠️ WebSocket non disponible (mode dégradé - fonctionnalités temps réel désactivées)');
        this.isConnecting = false;
        // Arrêter les tentatives de connexion
        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
        }
      });

      // Écouter les notifications
      this.socket.on('new_notification', (notification: Notification) => {
        console.log('🔔 Nouvelle notification reçue:', notification);
        this.handleNewNotification(notification);
      });

      // Écouter les mises à jour de signalements
      this.socket.on('report_updated', (data) => {
        console.log('📍 Signalement mis à jour:', data);
        this.handleReportUpdate(data);
      });

      // Écouter les nouveaux badges
      this.socket.on('badge_earned', (data) => {
        console.log('🏆 Nouveau badge obtenu:', data);
        this.handleBadgeEarned(data);
      });

    } catch (error) {
      console.log('⚠️ WebSocket non disponible (mode dégradé):', error);
      this.isConnecting = false;
    }
  }

  disconnect() {
    try {
      if (this.socket) {
        console.log('🔌 Déconnexion WebSocket...');
        this.socket.disconnect();
        this.socket = null;
      }
      this.isConnecting = false;
    } catch (error) {
      console.log('Erreur déconnexion WebSocket:', error);
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && !this.isConnecting) {
      this.reconnectAttempts++;
      console.log(`🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
      
      setTimeout(() => {
        if (this.socket && !this.socket.connected && !this.isConnecting) {
          try {
            this.socket.connect();
          } catch (error) {
            console.log('Erreur reconnexion:', error);
          }
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('⚠️ WebSocket en mode dégradé (pas de temps réel)');
    }
  }

  private handleNewNotification(notification: Notification) {
    // Mettre à jour le contexte des notifications
    const event = new CustomEvent('newNotification', { detail: notification });
    window.dispatchEvent(event);

    // Afficher une notification navigateur si autorisé
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  }

  private handleReportUpdate(data: any) {
    // Émettre un événement pour mettre à jour la carte
    const event = new CustomEvent('reportUpdate', { detail: data });
    window.dispatchEvent(event);
  }

  private handleBadgeEarned(data: any) {
    // Afficher une notification spéciale pour les badges
    const event = new CustomEvent('badgeEarned', { detail: data });
    window.dispatchEvent(event);

    if (Notification.permission === 'granted') {
      new Notification('🏆 Nouveau Badge !', {
        body: `Vous avez obtenu le badge "${data.name}"`,
        icon: '/favicon.ico',
        tag: `badge_${data.id}`
      });
    }
  }

  // Méthodes publiques pour émettre des événements
  joinRoom(room: string) {
    if (this.socket?.connected) {
      this.socket.emit('join_room', room);
    }
  }

  leaveRoom(room: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave_room', room);
    }
  }

  markNotificationAsRead(notificationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('mark_notification_read', notificationId);
    }
  }

  requestLiveStats() {
    if (this.socket?.connected) {
      this.socket.emit('request_live_stats');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Instance singleton
const webSocketService = new WebSocketService();

// Demander la permission pour les notifications navigateur
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission().then(permission => {
    console.log('Permission notifications:', permission);
  });
}

export default webSocketService;