import React, { useState } from 'react';
import { buildApiUrl } from '../../config/api';
import { Bell } from 'lucide-react';

const NotificationTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const testNotificationAPI = async (endpoint: string, method: string = 'GET', body?: any) => {
    setLoading(true);
    setResult('');
    
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      console.log('🔍 Test API Notifications:', endpoint);
      console.log('🔑 Token présent:', !!token);
      console.log('👤 Utilisateur:', user ? JSON.parse(user) : 'Non connecté');
      
      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(buildApiUrl(endpoint), options);
      
      console.log('📊 Statut réponse:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📥 Données reçues:', data);
      
      if (response.ok) {
        setResult(`✅ Succès (${response.status})\n\n${JSON.stringify(data, null, 2)}`);
        
        // Mettre à jour le compteur si c'est l'endpoint unread-count
        if (endpoint.includes('unread-count') && data.data?.unreadCount !== undefined) {
          setUnreadCount(data.data.unreadCount);
        }
      } else {
        setResult(`❌ Erreur (${response.status})\n\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error: any) {
      console.error('❌ Erreur:', error);
      setResult(`❌ Erreur réseau: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestNotification = async () => {
    const user = localStorage.getItem('user');
    if (!user) {
      setResult('❌ Aucun utilisateur connecté');
      return;
    }
    
    const userData = JSON.parse(user);
    console.log('👤 Utilisateur actuel:', userData);
    
    // Créer une notification pour l'utilisateur actuel
    await testNotificationAPI('/api/notifications', 'POST', {
      userId: userData.id,
      title: 'Test de notification admin',
      message: `Notification de test créée à ${new Date().toLocaleTimeString()} pour ${userData.name}`,
      type: 'test',
      priority: 'high'
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Bell className="w-6 h-6" />
        Debug API Notifications
      </h2>
      
      {/* Badge de test */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Badge de notification (test) :</h3>
        <div className="relative inline-block">
          <Bell size={24} className="text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-2">Compteur actuel : {unreadCount}</p>
      </div>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={() => testNotificationAPI('/api/notifications/unread-count')}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mr-2"
        >
          Test Compteur Non Lues
        </button>
        
        <button
          onClick={() => {
            const user = localStorage.getItem('user');
            if (user) {
              const userData = JSON.parse(user);
              testNotificationAPI(`/api/notifications/${userData.id}`);
            }
          }}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 mr-2"
        >
          Test Liste Notifications
        </button>
        
        <button
          onClick={createTestNotification}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50 mr-2"
        >
          Créer Notification Test
        </button>
        
        <button
          onClick={() => {
            // Simuler la création d'un signalement qui devrait notifier les admins
            const user = localStorage.getItem('user');
            if (user) {
              const userData = JSON.parse(user);
              testNotificationAPI('/api/waste', 'POST', {
                description: 'Test de signalement pour déclencher notification admin',
                wasteType: 'plastique',
                location: { lat: 48.8566, lng: 2.3522 }
              });
            }
          }}
          disabled={loading}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50 mr-2"
        >
          Simuler Signalement (→ Notif Admin)
        </button>
        
        <button
          onClick={() => testNotificationAPI('/api/health')}
          disabled={loading}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Test Santé API
        </button>
      </div>
      
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Test en cours...</span>
        </div>
      )}
      
      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Résultat :</h3>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm whitespace-pre-wrap">
            {result}
          </pre>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">Informations de debug :</h4>
        <p className="text-sm text-yellow-700">
          • API URL: {buildApiUrl('')}<br/>
          • Token présent: {localStorage.getItem('token') ? '✅ Oui' : '❌ Non'}<br/>
          • Utilisateur connecté: {localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).role : 'Non connecté'}<br/>
          • Compteur notifications: {unreadCount}
        </p>
      </div>
    </div>
  );
};

export default NotificationTest;