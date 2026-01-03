import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from '../../utils/dateUtils';
import { useNotifications } from '../../context/NotificationContext'; // 👈 Ajouté
import { buildApiUrl } from '../../config/api';

interface NotificationDropdownProps {
  userId: string;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ userId, onClose }) => {
  const { notifications, setNotifications, setUnreadCount, markAllAsRead } = useNotifications(); // ✅ Ajout de markAllAsRead
  const [loading, setLoading] = useState(true);

  // 🔥 Récupération des notifications depuis MySQL
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(buildApiUrl(`/api/notifications/${userId}`), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const responseData = await response.json();
        
        // ✅ Protection contre les données null/undefined
        const data = Array.isArray(responseData.data) ? responseData.data : [];

        // ✅ Ajout d'un formatage sûr de la date
        const formattedNotifications = data.map((notif: any) => ({
          ...notif,
          createdAt: formatDistanceToNow(notif.createdAt),
        }));

        setNotifications(formattedNotifications);
        setLoading(false);

        const nonLues = data.filter((n: any) => !n.read).length;
        setUnreadCount(nonLues);
      } catch (error) {
        console.error("❌ Erreur de récupération des notifications", error);
        // ✅ En cas d'erreur, initialiser avec un tableau vide
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId, setNotifications, setUnreadCount]);

  // 🔥 Marquer une notification comme lue
  const handleNotificationClick = async (id: string) => {
    try {
      await fetch(buildApiUrl(`/api/notifications/${id}/read`), { 
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setNotifications(prev =>
        prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
      );

      setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
    } catch (error) {
      console.error("❌ Erreur lors du marquage de la notification", error);
    }
  };

  // 🔥 Marquer toutes les notifications comme lues
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error("❌ Erreur lors du marquage de toutes les notifications", error);
    }
  };

  // 📌 Fermer le menu quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notification-dropdown')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="notification-dropdown absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50">
      <div className="border-b border-gray-200">
        <div className="flex justify-between items-center px-4 py-2">
          <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
          <button onClick={handleMarkAllAsRead} className="text-xs text-green-700 hover:text-green-800">
            Tout marquer comme lu
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-gray-500">Chargement...</p>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification.id)}
              className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-green-50' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                  <p className="text-xs text-gray-600">{notification.message}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {notification.createdAt}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-gray-500">Aucune notification</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
