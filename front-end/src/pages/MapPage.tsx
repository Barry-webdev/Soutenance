import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/map/MapView';

const MapPage: React.FC = () => {
  const { user } = useAuth();
  const [hasError, setHasError] = useState(false);

  // Error boundary effect
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('❌ Erreur JavaScript dans MapPage:', error);
      setHasError(true);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('❌ Promise rejetée dans MapPage:', event.reason);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur de chargement</h1>
          <p className="text-gray-600 mb-4">Une erreur s'est produite lors du chargement de la carte.</p>
          <button 
            onClick={() => {
              setHasError(false);
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }

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

      {/* Carte avec gestion d'erreur */}
      <div className="p-4">
        <div style={{ height: '80vh' }}>
          <MapView />
        </div>
      </div>
    </div>
  );
};

export default MapPage;