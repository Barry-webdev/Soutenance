import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIconPng from "leaflet/dist/images/marker-icon.png"; // Correctif d'icône par défaut

const MapView: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 📌 Coordonnées centrales de Pita, Guinée
  const centerCoordinates: [number, number] = [11.0591, -12.3953];

  // 🔥 Charger les signalements réels depuis MySQL
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/waste_reports');
        if (!response.ok) {
          throw new Error('Erreur de récupération des signalements.');
        }
        const data = await response.json();
        setReports(data);
      } catch (error: any) {
        console.error("❌ Erreur :", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // 🔥 Utilisation de useMemo() pour optimiser l'itinéraire
  const routePathMemo = useMemo(() => {
    return reports.length > 1 ? reports.map((report) => [report.latitude, report.longitude]) : [];
  }, [reports]);

  // 🔥 Gestion des icônes Leaflet (Correction)
  const getMarkerIcon = useCallback((wasteType: string) => {
    const iconMap: Record<string, string> = {
      recyclable: "/icons/recycle.png",
      hazardous: "/icons/hazard.png",
      general: "/icons/trash.png",
    };

    return new L.Icon({
      iconUrl: iconMap[wasteType] || markerIconPng, // Assure une icône par défaut
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  }, []);

  return (
    <div className="card relative">
      <h2 className="text-xl font-semibold mb-4">Carte des signalements - Pita</h2>

      {loading ? (
        <div className="text-center text-gray-600">Chargement de la carte...</div>
      ) : (
        <MapContainer center={centerCoordinates} zoom={13} style={{ height: '500px', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* 🔥 Tracer l'itinéraire */}
          {routePathMemo.length > 1 && <Polyline positions={routePathMemo} color="red" />}

          {/* 🔥 Affichage des marqueurs */}
          {reports.map((report) => (
            <Marker key={report.id} position={[report.latitude, report.longitude]} icon={getMarkerIcon(report.wasteType)}>
              <Popup>
                <div>
                  <h3 className="font-medium">{report.description}</h3>
                  <p className="text-sm text-gray-600">Signalé par: {report.userName}</p>
                  <p className="text-sm text-gray-600">Adresse: {report.address}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
};

export default MapView;
