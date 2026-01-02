import React from 'react';
import StatsDebug from '../components/debug/StatsDebug';

const StatsDebugPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Debug Statistiques</h1>
        <StatsDebug />
      </div>
    </div>
  );
};

export default StatsDebugPage;