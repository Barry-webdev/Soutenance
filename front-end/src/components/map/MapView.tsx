import React, { useState, useEffect, useCallback } from 'react';
import { buildApiUrl, buildImageUrl } from '../../config/api';

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
    address?: string;
  };
  images?: {
    original?: { url: string; filename: string };
    thumbnail?: { url: string; filename: string };
    medium?: { url: string; filename: string };
  } | null;
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
  const [hasError, setHasError] = useState(false);

  // Error boundary effect
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('❌ Erreur JavaScript dans MapView:', error);
      setHasError(true);
      setError('Erreur de rendu de la carte');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('❌ Promise rejetée dans MapView:', event.reason);
      setHasError(true);
      setError('Erreur de chargement des données');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Fonction pour charger les signalements
  const fetchReports = useCallback(async () => {
    try {
      console.log('🗺️ Chargement des signalements pour la carte...');
      
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(buildApiUrl('/api/waste/map'), {
        headers
      });
      
      console.log('📊 Réponse API carte:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Signalements chargés:', data.data?.length || 0);
        setReports(data.data || []);
        setLastUpdate(new Date());
        setCountdown(30); // Reset countdown
        setError(null);
      } else {
        console.log('⚠️ Pas de signalements ou erreur API');
        setReports([]);
        setError('Impossible de charger les signalements');
      }
    } catch (error: any) {
      console.error('❌ Erreur chargement carte:', error);
      setError('Erreur de connexion au serveur');
      setReports([]);
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
    setError(null);
    fetchReports();
  };

  // Error boundary UI
  if (hasError) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">Une erreur s'est produite lors du chargement de la carte.</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button 
            onClick={() => {
              setHasError(false);
              setError(null);
              setLoading(true);
              fetchReports();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-600 py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Chargement de la carte...</p>
          <p className="text-sm text-gray-500 mt-2">Récupération des signalements en cours</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
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

      {/* Message d'erreur */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <span>⚠️</span>
            <span>{error}</span>
            <button 
              onClick={handleRefresh}
              className="ml-auto text-red-600 hover:text-red-800 underline"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

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
              title="Carte des signalements - Pita, Guinée"
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
                  
                  {/* Image du signalement */}
                  {report.images?.thumbnail?.url && (
                    <div className="mb-3">
                      <img 
                        src={buildImageUrl(report.images.thumbnail.url)} 
                        alt="Photo du signalement" 
                        className="w-full h-40 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity border border-gray-200 shadow-sm"
                        onClick={() => {
                          if (report.images?.original?.url) {
                            window.open(buildImageUrl(report.images.original.url), '_blank');
                          }
                        }}
                        onError={(e) => {
                          console.error('Erreur chargement image:', report.images?.thumbnail?.url);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                        loading="lazy"
                      />
                      <p className="text-xs text-blue-600 mt-1 italic">
                        📷 Cliquez pour agrandir l'image
                      </p>
                    </div>
                  )}
                  
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
                      <span className="font-medium">{report.userId?.name || 'Utilisateur inconnu'}</span>
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
                    {report.location.address && (
                      <div className="flex justify-between">
                        <span>Adresse:</span>
                        <span className="text-xs">{report.location.address}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    {/* Bouton d'itinéraire */}
                    <button
                      onClick={() => {
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${report.location.lat},${report.location.lng}`;
                        window.open(url, '_blank');
                      }}
                      className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium"
                    >
                      🚗 Obtenir l'itinéraire
                    </button>
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