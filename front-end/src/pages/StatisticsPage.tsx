import React from 'react';
import StatsOverview from '../components/statistics/StatsOverview';

const StatisticsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Statistiques</h1>
        <p className="text-gray-600 mb-4">
          Découvrez les données et les tendances relatives à la gestion des déchets à Pita.
        </p>
      </div>
      
      <StatsOverview />
    </div>
  );
};

export default StatisticsPage;