import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from '../types';
import { formatDistanceToNow } from '../utils/dateUtils';
import { buildApiUrl } from '../config/api';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAllAsRead: () => void;
  markAsRead: (notificationId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const userData = localStorage.getItem('user');
  const userId = userData ? (JSON.parse(userData)?.id ?? null) : null;

  // Écouter les nouvelles notifications via WebSocket
  useEffect(() => {
    const handleNewNotification = (event: CustomEvent) => {
      const notification = event.detail;
      addNotification(notification);
    };

    window.addEventListener('newNotification', handleNewNotification as EventListener);
    return () => {
      window.removeEventListener('newNotification', handleNewNotification as EventListener);
    };
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/notifications/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) throw new Error('Erreur réseau');

        const responseData = await response.json();
        const data: Notification[] = responseData.data || [];

        const formattedNotifications = data.map((notif) => ({
          ...notif,
          createdAt: formatDistanceToNow(notif.createdAt),
        }));

        setNotifications(formattedNotifications);

        const nonLues = data.filter((n) => !n.read).length;
        setUnreadCount(nonLues);
      } catch (error) {
        console.error('❌ Erreur de récupération des notifications', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(buildApiUrl('/api/notifications'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(notification),
      });

      if (!response.ok) throw new Error("Erreur lors de l'ajout");

      const responseData = await response.json();
      const savedNotification: Notification = responseData.data;

      setNotifications((prev) => [
        {
          ...savedNotification,
          createdAt: formatDistanceToNow(savedNotification.createdAt),
        },
        ...prev,
      ]);

      setUnreadCount((prev) => prev + 1);
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout de la notification", error);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      const response = await fetch(buildApiUrl(`/api/notifications/${userId}/markAllAsRead`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour');

      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          read: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des notifications', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour');

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la notification', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        setUnreadCount,
        setNotifications,
        addNotification,
        markAllAsRead,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
