import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Eye, Trash2, AlertCircle } from 'lucide-react';

interface WasteReport {
  _id: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  wasteType: string;
  status: 'pending' | 'collected' | 'not_collected';
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  images?: {
    original?: { url: string; filename: string; size?: number };
    thumbnail?: { url: string; filename: string };
    medium?: { url: string; filename: string };
  } | null;
}

const MyReportsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);

  // Fetch mes signalements
  const fetchMyReports = async (): Promise<WasteReport[]> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token d\'authentification manquant. Veuillez vous reconnecter.');
    }

    const response = await fetch("http://localhost:4000/api/waste/my-reports", {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API mes signalements:', response.status, errorText);
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Mes signalements reçus:', data);
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur inconnue');
    }
    
    return data.data || [];
  };

  const {
    data: reports = [],
    isLoading,
    error,
    refetch
  } = useQuery({ 
    queryKey: ['my_waste_reports'], 
    queryFn: fetchMyReports 
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p>Chargement de vos signalements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isAuthError = error.message.includes('Session expirée') || error.message.includes('authentification manquant');
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
        <h3 className="text-red-800 font-semibold mb-2">
          {isAuthError ? 'Problème d\'authentification' : 'Erreur de chargement'}
        </h3>
        <p className="text-red-700 mb-4">{error.message}</p>
        
        {isAuthError ? (
          <div className="flex justify-center gap-2">
            <button 
              onClick={() => window.location.href = '/login'} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Se reconnecter
            </button>
            <button 
              onClick={() => refetch()} 
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <button 
            onClick={() => refetch()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Mes Signalements</h1>
        <p className="text-gray-600">
          Consultez et gérez tous vos signalements de déchets.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun signalement</h3>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas encore créé de signalement.
          </p>
          <button 
            onClick={() => window.location.href = '/report'}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Créer mon premier signalement
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {reports.length} signalement{reports.length > 1 ? 's' : ''} trouvé{reports.length > 1 ? 's' : ''}
            </div>
            <button 
              onClick={() => refetch()}
              className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              🔄 Actualiser
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <div key={report._id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                {/* Image du signalement */}
                {report.images?.medium?.url ? (
                  <div className="relative">
                    <img 
                      src={`http://localhost:4000${report.images.medium.url}`} 
                      alt="Signalement" 
                      className="w-full h-48 object-cover rounded-t-lg cursor-pointer hover:opacity-90"
                      onClick={() => {
                        if (report.images?.original?.url) {
                          window.open(`http://localhost:4000${report.images.original.url}`, '_blank');
                        }
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'collected' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {report.status === 'pending' ? 'En attente' :
                         report.status === 'collected' ? 'Collecté' : 'Non collecté'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-sm">Pas d'image</p>
                    </div>
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {report.wasteType}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {report.description}
                  </h3>

                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Créé le {new Date(report.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}</span>
                    </div>
                    {report.location.address && (
                      <div className="text-xs text-gray-500">
                        📍 {report.location.address}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm flex items-center justify-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Détails
                    </button>
                    <button
                      onClick={() => {
                        const url = `https://www.google.com/maps?q=${report.location.lat},${report.location.lng}`;
                        window.open(url, '_blank');
                      }}
                      className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm flex items-center justify-center gap-1"
                    >
                      <MapPin className="w-4 h-4" />
                      Localiser
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modale de détails */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">Détails du signalement</h3>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Informations générales</h4>
                    <div className="space-y-2">
                      <p><strong>Description:</strong> {selectedReport.description}</p>
                      <p><strong>Type de déchet:</strong> 
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {selectedReport.wasteType}
                        </span>
                      </p>
                      <p><strong>Statut:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
                          selectedReport.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          selectedReport.status === 'collected' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedReport.status === 'pending' ? 'En attente' :
                           selectedReport.status === 'collected' ? 'Collecté' : 'Non collecté'}
                        </span>
                      </p>
                      <p><strong>Date de création:</strong> {new Date(selectedReport.createdAt).toLocaleString('fr-FR')}</p>
                      <p><strong>Dernière mise à jour:</strong> {new Date(selectedReport.updatedAt).toLocaleString('fr-FR')}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Localisation</h4>
                    <div className="space-y-2">
                      <p><strong>Coordonnées:</strong> {selectedReport.location.lat.toFixed(6)}, {selectedReport.location.lng.toFixed(6)}</p>
                      {selectedReport.location.address && (
                        <p><strong>Adresse:</strong> {selectedReport.location.address}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button 
                          onClick={() => {
                            const url = `https://www.google.com/maps?q=${selectedReport.location.lat},${selectedReport.location.lng}`;
                            window.open(url, '_blank');
                          }}
                          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                          📍 Google Maps
                        </button>
                        <button 
                          onClick={() => {
                            const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedReport.location.lat},${selectedReport.location.lng}`;
                            window.open(url, '_blank');
                          }}
                          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          🚗 Itinéraire
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Image du signalement</h4>
                  {selectedReport.images?.original?.url ? (
                    <div className="space-y-2">
                      <img 
                        src={`http://localhost:4000${selectedReport.images.original.url}`} 
                        alt="Signalement" 
                        className="w-full h-64 object-cover rounded-lg border cursor-pointer hover:opacity-90"
                        onClick={() => {
                          window.open(`http://localhost:4000${selectedReport.images.original.url}`, '_blank');
                        }}
                      />
                      <p className="text-sm text-gray-600">
                        Fichier: {selectedReport.images.original.filename}
                      </p>
                      {selectedReport.images.original.size && (
                        <p className="text-sm text-gray-600">
                          Taille: {(selectedReport.images.original.size / 1024).toFixed(1)} KB
                        </p>
                      )}
                      <p className="text-xs text-gray-500 italic">
                        💡 Cliquez sur l'image pour l'agrandir
                      </p>
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded-lg border flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">📷</div>
                        <p>Aucune image disponible</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReportsPage;