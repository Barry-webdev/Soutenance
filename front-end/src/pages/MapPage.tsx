import React from 'react';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/map/MapView';

const MapPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simple */}
      <div className="bg-white shadow-sm border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Carte des Signalements</h1>
              <p className="text-gray-600">Visualisez tous les signalements de déchets en temps réel</p>
            </div>
            
            {user?.role === 'admin' && (
              <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                💡 Mode administrateur : Gestion des signalements
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Carte avec l'ancien composant fonctionnel */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-lg" style={{ height: '80vh' }}>
          <MapView />
        </div>
      </div>
    </div>
  );
};

export default MapPage;