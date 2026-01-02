import React from 'react';
import StatsDebug from '../components/debug/StatsDebug';
import NotificationTest from '../components/debug/NotificationTest';

const StatsDebugPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">Debug API</h1>
        <StatsDebug />
        <NotificationTest />
      </div>
    </div>
  );
};

export default StatsDebugPage;