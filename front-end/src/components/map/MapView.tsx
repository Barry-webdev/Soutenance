import React, { useState, useEffect, useCallback } from 'react';

// Interface pour les signalements
interface WasteReport {
  _id: string;
  createdAt: string;
  description: string;
  wasteType: string;
  status: 'pending' | 'collected' | 'not_collected';
  location: {
    lat: number;
    lng: number;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
  };
}

const MapView: React.FC = () => {
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState<number>(30);

  // Fonction pour charger les signalements
  const fetchReports = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:4000/api/waste/map', {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        setReports(data.data || []);
        setLastUpdate(new Date());
        setCountdown(30); // Reset countdown
        setError(null);
      } else {
        console.log('Pas de signalements ou erreur API');
        setReports([]);
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les signalements au montage du composant
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Actualisation automatique toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchReports();
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [fetchReports]);

  // Compteur pour l'affichage
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 30; // Reset when it reaches 0
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, []);

  // Actualisation quand on revient sur la page (focus)
  useEffect(() => {
    const handleFocus = () => {
      fetchReports();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        fetchReports();
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [fetchReports]);

  // Fonction pour actualiser manuellement
  const handleRefresh = () => {
    setLoading(true);
    fetchReports();
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center text-gray-600 py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          Chargement de la carte...
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Carte des signalements</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            {reports.length} signalement{reports.length > 1 ? 's' : ''} trouvé{reports.length > 1 ? 's' : ''}
          </div>
          <div className="text-xs text-gray-500">
            Mis à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`px-3 py-1 text-white text-sm rounded transition-colors ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? '🔄 ...' : '🔄 Actualiser'}
          </button>
        </div>
      </div>

      {/* Indicateur d'actualisation automatique */}
      <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <span className="animate-pulse">🔄</span>
          <span>Actualisation automatique toutes les 30 secondes</span>
          <span className="text-xs text-blue-500">
            (Prochaine mise à jour dans {countdown}s)
          </span>
        </div>
      </div>

      {/* Carte simple avec Google Maps Embed */}
      <div className="relative">
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold mb-2">🗺️ Carte interactive</h3>
          <p className="text-sm text-gray-600 mb-4">
            Visualisation des signalements à Pita, Guinée
          </p>
          
          {/* Carte Google Maps simple */}
          <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15768.123456789!2d-12.3953!3d11.0591!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDAzJzMyLjgiTiAxMsKwMjMnNDMuMSJX!5e0!3m2!1sfr!2sgn!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: '8px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Liste des signalements */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">📍 Signalements actifs</h3>
          
          {reports.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Aucun signalement trouvé</p>
              <p className="text-sm text-gray-400 mt-2">
                Les nouveaux signalements apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reports.map((report, index) => (
                <div key={report._id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {report.wasteType === 'plastique' ? '🔵' :
                         report.wasteType === 'verre' ? '🟢' :
                         report.wasteType === 'métal' ? '⚪' :
                         report.wasteType === 'organique' ? '🟤' :
                         report.wasteType === 'papier' ? '🟡' :
                         report.wasteType === 'dangereux' ? '🔴' : '⚫'}
                      </span>
                      <span className="text-sm font-medium text-gray-600">
                        Point #{index + 1}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      report.status === 'collected' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {report.status === 'pending' ? 'En attente' :
                       report.status === 'collected' ? 'Collecté' : 'Non collecté'}
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {report.description}
                  </h4>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium">{report.wasteType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Signalé par:</span>
                      <span className="font-medium">{report.userId.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{new Date(report.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coordonnées:</span>
                      <span className="text-xs">
                        {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <a
                      href={`https://www.google.com/maps?q=${report.location.lat},${report.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      📍 Voir sur Google Maps →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Légende */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-3">🎨 Légende des types de déchets</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span>🔵</span>
              <span>Plastique</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🟢</span>
              <span>Verre</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⚪</span>
              <span>Métal</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🟤</span>
              <span>Organique</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🟡</span>
              <span>Papier</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔴</span>
              <span>Dangereux</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⚫</span>
              <span>Autre</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;