import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';


const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('http://localhost:3000/notifications');
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error('Erreur de récupération des notifications', error);
      }
    };

    fetchNotifications();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Mon profil</h1>
      </div>

      {/* 🔥 Affichage des notifications */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold mb-4">🔔 Notifications récentes</h3>

        {notifications.length === 0 ? (
          <p className="text-gray-600 text-center">Aucune nouvelle notification.</p>
        ) : (
          <ul className="space-y-3">
            {notifications.map((notif) => (
              <li key={notif.id} className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-800">
                  <strong>{notif.wasteType}</strong> signalé à {notif.location}.
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
