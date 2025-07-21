import React from 'react';
import MapView from '../components/map/MapView';

const MapPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Carte des signalements</h1>
        <p className="text-gray-600 mb-4">
          Visualisez tous les signalements de déchets à Pita et suivez leur statut.
        </p>
      </div>
      
      <MapView />
    </div>
  );
};

export default MapPage;