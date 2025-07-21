import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from '../types';
import { formatDistanceToNow } from '../utils/dateUtils';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const userId = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')!).id
    : null;

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`http://localhost:4000/notifications/${userId}`);
        const data = await response.json();

        const formattedNotifications = data.map((notif: Notification) => ({
          ...notif,
          createdAt: formatDistanceToNow(notif.createdAt),
        }));

        setNotifications(formattedNotifications);
      } catch (error) {
        console.error('❌ Erreur de récupération des notifications', error);
      }
    };

    fetchNotifications();
  }, [userId]);

  // 💬 Fonction pour ajouter une notification (localement + éventuellement côté backend)
  const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(`http://localhost:4000/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification),
      });

      const savedNotification = await response.json();

      setNotifications((prev) => [
        {
          ...savedNotification,
          createdAt: formatDistanceToNow(savedNotification.createdAt),
        },
        ...prev,
      ]);
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout de la notification', error);
    }
  };

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification }}>
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
