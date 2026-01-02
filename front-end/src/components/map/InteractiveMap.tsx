import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { 
  MapPin, 
  Navigation, 
  Filter, 
  RefreshCw, 
  Eye, 
  Calendar,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

// Configuration des icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icônes personnalisées pour différents types de déchets
const createCustomIcon = (color: string, type: string) => {
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
    ">
      ${type.charAt(0).toUpperCase()}
    </div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

// Couleurs par type de déchet
const wasteTypeColors = {
  'plastique': '#3B82F6',
  'verre': '#10B981',
  'métal': '#6B7280',
  'organique': '#F59E0B',
  'papier': '#8B5CF6',
  'dangereux': '#EF4444',
  'autre': '#6B7280'
};

// Couleurs par statut
const statusColors = {
  'pending': '#F59E0B',
  'collected': '#10B981',
  'not_collected': '#EF4444'
};

interface WasteReport {
  _id: string;
  description: string;
  wasteType: string;
  status: string;
  location: {
    lat: number;
    lng: number;
  };
  images?: {
    thumbnail?: { url: string };
    medium?: { url: string };
  };
  userId: {
    name: string;
  };
  createdAt: string;
}

interface InteractiveMapProps {
  height?: string;
  showControls?: boolean;
  onReportClick?: (report: WasteReport) => void;
}

// Composant pour gérer les événements de la carte
const MapEventHandler: React.FC<{
  onLocationFound: (lat: number, lng: number) => void;
  userLocation: [number, number] | null;
}> = ({ onLocationFound, userLocation }) => {
  const map = useMap();

  useMapEvents({
    locationfound: (e) => {
      onLocationFound(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, 15);
    },
  });

  useEffect(() => {
    if (userLocation) {
      map.flyTo(userLocation, 15);
    }
  }, [userLocation, map]);

  return null;
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  height = '500px', 
  showControls = true,
  onReportClick 
}) => {
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);
  const [filters, setFilters] = useState({
    wasteType: 'all',
    status: 'all',
    dateRange: 'all'
  });
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const mapRef = useRef<L.Map | null>(null);

  // Coordonnées par défaut (Pita, Guinée)
  const defaultCenter: [number, number] = [11.0, -12.0];

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/waste/map', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data.data || []);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('❌ Erreur chargement signalements:', error);
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

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error('Erreur géolocalisation:', error);
          // Utiliser la position par défaut
          setUserLocation(defaultCenter);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setUserLocation(defaultCenter);
    }
  };

  // Filtrer les signalements
  const filteredReports = reports.filter(report => {
    if (filters.wasteType !== 'all' && report.wasteType !== filters.wasteType) {
      return false;
    }
    if (filters.status !== 'all' && report.status !== filters.status) {
      return false;
    }
    if (filters.dateRange !== 'all') {
      const reportDate = new Date(report.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (filters.dateRange) {
        case 'today':
          if (daysDiff > 0) return false;
          break;
        case 'week':
          if (daysDiff > 7) return false;
          break;
        case 'month':
          if (daysDiff > 30) return false;
          break;
      }
    }
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'collected': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'not_collected': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'collected': return 'Collecté';
      case 'not_collected': return 'Non collecté';
      default: return 'En attente';
    }
  };

  return (
    <div className="relative">
      {/* Contrôles de la carte */}
      {showControls && (
        <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap gap-2">
          <div className="bg-white rounded-lg shadow-lg p-3 flex items-center gap-2">
            <button
              onClick={getCurrentLocation}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              Ma position
            </button>
            
            <button
              onClick={fetchReports}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-lg shadow-lg p-3 flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            
            <select
              value={filters.wasteType}
              onChange={(e) => setFilters(prev => ({ ...prev, wasteType: e.target.value }))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">Tous types</option>
              <option value="plastique">Plastique</option>
              <option value="verre">Verre</option>
              <option value="métal">Métal</option>
              <option value="organique">Organique</option>
              <option value="papier">Papier</option>
              <option value="dangereux">Dangereux</option>
              <option value="autre">Autre</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">Tous statuts</option>
              <option value="pending">En attente</option>
              <option value="collected">Collecté</option>
              <option value="not_collected">Non collecté</option>
            </select>

            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">Toutes dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>

          {/* Statistiques */}
          <div className="bg-white rounded-lg shadow-lg p-3 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Trash2 className="w-4 h-4 text-gray-600" />
              <span className="font-medium">{filteredReports.length}</span>
              <span className="text-gray-600">signalements</span>
            </div>
            <div className="text-xs text-gray-500">
              Mis à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
            </div>
          </div>
        </div>
      )}

      {/* Carte */}
      <MapContainer
        center={userLocation || defaultCenter}
        zoom={13}
        style={{ height, width: '100%' }}
        className="rounded-lg"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEventHandler 
          onLocationFound={(lat, lng) => setUserLocation([lat, lng])}
          userLocation={userLocation}
        />

        {/* Marqueur de position utilisateur */}
        {userLocation && (
          <Marker 
            position={userLocation}
            icon={L.divIcon({
              html: `
                <div style="
                  background-color: #3B82F6;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                  animation: pulse 2s infinite;
                "></div>
              `,
              className: 'user-location-marker',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          >
            <Popup>
              <div className="text-center">
                <MapPin className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <p className="font-medium">Votre position</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marqueurs des signalements */}
        {filteredReports.map((report) => (
          <Marker
            key={report._id}
            position={[report.location.lat, report.location.lng]}
            icon={createCustomIcon(
              wasteTypeColors[report.wasteType as keyof typeof wasteTypeColors] || '#6B7280',
              report.wasteType
            )}
            eventHandlers={{
              click: () => {
                setSelectedReport(report);
                if (onReportClick) {
                  onReportClick(report);
                }
              }
            }}
          >
            <Popup maxWidth={300}>
              <div className="p-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 capitalize">
                    {report.wasteType}
                  </h3>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(report.status)}
                    <span className="text-xs font-medium" style={{ color: statusColors[report.status as keyof typeof statusColors] }}>
                      {getStatusLabel(report.status)}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {report.description}
                </p>
                
                {report.images?.thumbnail && (
                  <img
                    src={`http://localhost:4000${report.images.thumbnail.url}`}
                    alt="Déchet signalé"
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}
                
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    Signalé par {report.userId.name}
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedReport(report)}
                  className="w-full mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                >
                  Voir détails
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Modal de détails */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold capitalize">
                  Signalement - {selectedReport.wasteType}
                </h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {selectedReport.images?.medium && (
                <img
                  src={`http://localhost:4000${selectedReport.images.medium.url}`}
                  alt="Déchet signalé"
                  className="w-full h-48 object-cover rounded"
                />
              )}
              
              <div>
                <h3 className="font-medium text-gray-800 mb-1">Description</h3>
                <p className="text-gray-600">{selectedReport.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Type</h4>
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm capitalize">
                    {selectedReport.wasteType}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Statut</h4>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(selectedReport.status)}
                    <span className="text-sm font-medium" style={{ color: statusColors[selectedReport.status as keyof typeof statusColors] }}>
                      {getStatusLabel(selectedReport.status)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Informations</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Signalé par: {selectedReport.userId.name}</div>
                  <div>Date: {new Date(selectedReport.createdAt).toLocaleString('fr-FR')}</div>
                  <div>Position: {selectedReport.location.lat.toFixed(6)}, {selectedReport.location.lng.toFixed(6)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles CSS pour l'animation */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default InteractiveMap;