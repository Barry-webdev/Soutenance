import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import { Navigation, Filter, RefreshCw, Route, AlertTriangle, CheckCircle, Clock, Trash2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface WasteReport {
  _id: string;
  description: string;
  wasteType: string;
  status: 'pending' | 'in_progress' | 'collected' | 'resolved';
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  createdAt: string;
  userId: {
    name: string;
    email: string;
  };
  images?: {
    originalUrl?: string;
    mediumUrl?: string;
    thumbnailUrl?: string;
  };
}

interface FullScreenMapProps {
  className?: string;
  showRouting?: boolean;
  userRole?: 'citizen' | 'admin' | 'partner';
}

// Composant pour ajuster la vue de la carte
const MapController: React.FC<{ reports: WasteReport[] }> = ({ reports }) => {
  const map = useMap();

  useEffect(() => {
    if (reports.length > 0) {
      const bounds = new LatLngBounds(
        reports.map(report => [report.location.lat, report.location.lng])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [reports, map]);

  return null;
};

const FullScreenMap: React.FC<FullScreenMapProps> = ({ 
  className = '', 
  showRouting = false,
  userRole = 'citizen'
}) => {
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<WasteReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    wasteType: 'all',
    dateRange: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [routingMode, setRoutingMode] = useState(false);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);

  // Icônes personnalisées selon le statut
  const getMarkerIcon = (status: string, wasteType: string) => {
    const colors = {
      pending: '#f59e0b', // orange
      in_progress: '#3b82f6', // blue
      collected: '#10b981', // green
      resolved: '#6b7280' // gray
    };

    const color = colors[status as keyof typeof colors] || colors.pending;
    
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="${color}"/>
          <circle cx="12.5" cy="12.5" r="6" fill="white"/>
          <text x="12.5" y="16" text-anchor="middle" font-size="8" fill="${color}">🗑️</text>
        </svg>
      `)}`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Utiliser la route publique de la carte
      const response = await fetch('http://localhost:4000/api/waste/map', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      
      if (!response.ok) {
        // Si pas d'authentification, essayer sans token
        if (response.status === 401) {
          const publicResponse = await fetch('http://localhost:4000/api/waste/public', {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (publicResponse.ok) {
            const data = await publicResponse.json();
            if (data.success && Array.isArray(data.data)) {
              setReports(data.data);
              setFilteredReports(data.data);
              return;
            }
          }
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setReports(data.data);
        setFilteredReports(data.data);
      } else {
        throw new Error('Format de données invalide');
      }
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des signalements:', error);
      setError(error.message || 'Erreur lors du chargement des signalements');
      setReports([]);
      setFilteredReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    
    // Actualisation automatique toutes les 30 secondes
    const interval = setInterval(fetchReports, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filtrage des signalements
  useEffect(() => {
    let filtered = [...reports];

    if (filters.status !== 'all') {
      filtered = filtered.filter(report => report.status === filters.status);
    }

    if (filters.wasteType !== 'all') {
      filtered = filtered.filter(report => report.wasteType === filters.wasteType);
    }

    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      if (filters.dateRange !== 'all') {
        filtered = filtered.filter(report => new Date(report.createdAt) >= filterDate);
      }
    }

    setFilteredReports(filtered);
  }, [reports, filters]);

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'En attente',
      in_progress: 'En cours',
      collected: 'Collecté',
      resolved: 'Résolu'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <AlertTriangle className="w-4 h-4" />;
      case 'collected': return <CheckCircle className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      default: return <Trash2 className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'collected': return 'text-green-600 bg-green-100';
      case 'resolved': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const toggleReportSelection = (reportId: string) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const generateRoute = () => {
    if (selectedReports.length < 2) {
      alert('Sélectionnez au moins 2 signalements pour générer un itinéraire');
      return;
    }
    
    const selectedReportData = filteredReports.filter(r => selectedReports.includes(r._id));
    const coordinates = selectedReportData.map(r => `${r.location.lng},${r.location.lat}`).join(';');
    
    // Ouvrir dans une nouvelle fenêtre avec l'itinéraire optimisé
    const routeUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${coordinates}`;
    window.open(routeUrl, '_blank');
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={{ height: '70vh' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-50 ${className}`} style={{ height: '70vh' }}>
        <div className="text-center p-6">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur de chargement</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchReports}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height: '80vh' }}>
      {/* Barre d'outils */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between bg-white rounded-lg shadow-lg p-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              showFilters ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filtres</span>
          </button>
          
          {(userRole === 'admin' || userRole === 'partner') && (
            <button
              onClick={() => setRoutingMode(!routingMode)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                routingMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Route className="w-4 h-4" />
              <span>Itinéraire</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">
            {filteredReports.length} signalement{filteredReports.length > 1 ? 's' : ''}
          </span>
          
          <button
            onClick={fetchReports}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Panneau de filtres */}
      {showFilters && (
        <div className="absolute top-20 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 w-80">
          <h3 className="font-semibold mb-3">Filtres</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="in_progress">En cours</option>
                <option value="collected">Collecté</option>
                <option value="resolved">Résolu</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de déchet</label>
              <select
                value={filters.wasteType}
                onChange={(e) => setFilters(prev => ({ ...prev, wasteType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Tous les types</option>
                <option value="plastique">Plastique</option>
                <option value="verre">Verre</option>
                <option value="métal">Métal</option>
                <option value="organique">Organique</option>
                <option value="papier">Papier</option>
                <option value="dangereux">Dangereux</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Période</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Toutes les périodes</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Panneau d'itinéraire */}
      {routingMode && (
        <div className="absolute top-20 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4 w-80">
          <h3 className="font-semibold mb-3">Planification d'itinéraire</h3>
          <p className="text-sm text-gray-600 mb-3">
            Cliquez sur les signalements pour les sélectionner et générer un itinéraire optimisé.
          </p>
          
          {selectedReports.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700">
                {selectedReports.length} signalement{selectedReports.length > 1 ? 's' : ''} sélectionné{selectedReports.length > 1 ? 's' : ''}
              </p>
              <button
                onClick={generateRoute}
                disabled={selectedReports.length < 2}
                className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Générer l'itinéraire
              </button>
              <button
                onClick={() => setSelectedReports([])}
                className="mt-1 w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Effacer la sélection
              </button>
            </div>
          )}
        </div>
      )}

      {/* Carte */}
      <MapContainer
        center={[14.6928, -17.4467]} // Coordonnées de Dakar par défaut
        zoom={12}
        className="w-full h-full rounded-lg"
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapController reports={filteredReports} />
        
        {filteredReports.map((report) => (
          <Marker
            key={report._id}
            position={[report.location.lat, report.location.lng]}
            icon={getMarkerIcon(report.status, report.wasteType)}
            eventHandlers={{
              click: () => {
                if (routingMode) {
                  toggleReportSelection(report._id);
                }
              }
            }}
          >
            <Popup className="custom-popup" maxWidth={300}>
              <div className="p-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 capitalize">
                    {report.wasteType}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(report.status)}`}>
                    {getStatusIcon(report.status)}
                    {getStatusLabel(report.status)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {report.description}
                </p>
                
                {report.images?.thumbnailUrl && (
                  <img
                    src={report.images.thumbnailUrl}
                    alt="Signalement"
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}
                
                <div className="text-xs text-gray-500 space-y-1">
                  <p>📍 {report.location.address || `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}`}</p>
                  <p>👤 Par {report.userId.name}</p>
                  <p>📅 {new Date(report.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
                
                {routingMode && (
                  <button
                    onClick={() => toggleReportSelection(report._id)}
                    className={`mt-2 w-full px-2 py-1 text-xs rounded ${
                      selectedReports.includes(report._id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {selectedReports.includes(report._id) ? 'Désélectionner' : 'Sélectionner'}
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {filteredReports.length === 0 && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-[1000]">
          <div className="text-center">
            <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun signalement trouvé</h3>
            <p className="text-gray-600">Aucun signalement ne correspond aux filtres sélectionnés.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullScreenMap;