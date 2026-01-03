import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoginDebug from '../components/debug/LoginDebug';
import NotificationTest from '../components/debug/NotificationTest';

const StatsDebugPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-red-600 mb-2">🚨 Page de Debug</h1>
          <p className="text-gray-600">
            Page de test pour diagnostiquer les problèmes de connexion et notifications
          </p>
          
          {/* Statut utilisateur */}
          <div className="mt-4 p-4 bg-white rounded-lg border">
            <h3 className="font-semibold mb-2">Statut utilisateur :</h3>
            <p>Connecté : {isAuthenticated ? '✅ Oui' : '❌ Non'}</p>
            {user && (
              <div className="mt-2">
                <p>Nom : {user.name}</p>
                <p>Email : {user.email}</p>
                <p>Rôle : {user.role}</p>
                <p>Points : {user.points}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section Login Debug */}
          <div>
            <LoginDebug />
          </div>

          {/* Section Notification Test */}
          <div>
            <NotificationTest />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-3">📋 Instructions de test :</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700">
            <li>Tester d'abord la santé de l'API avec le bouton "Test Santé API"</li>
            <li>Si l'API fonctionne, tester la connexion avec "Connexion Debug"</li>
            <li>Une fois connecté, tester les notifications avec les boutons de droite</li>
            <li>Vérifier que le badge de notification s'affiche dans la navbar</li>
            <li>Si tout fonctionne, le backend est correctement déployé</li>
          </ol>
        </div>

        {/* Informations système */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-semibold mb-2">🔧 Informations système :</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>URL API : {process.env.REACT_APP_API_URL || 'https://ecopulse-backend-00i3.onrender.com'}</p>
            <p>Environnement : {process.env.NODE_ENV}</p>
            <p>Token stocké : {localStorage.getItem('token') ? 'Oui' : 'Non'}</p>
            <p>Utilisateur stocké : {localStorage.getItem('user') ? 'Oui' : 'Non'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDebugPage;