import React, { useState } from 'react';
import StatsOverview from '../components/statistics/StatsOverview';
import AdvancedStats from '../components/statistics/AdvancedStats';
import DashboardStats from '../components/statistics/DashboardStats';
import { BarChart3, TrendingUp, Activity } from 'lucide-react';

const StatisticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'advanced' | 'dashboard'>('overview');

  const tabs = [
    {
      id: 'overview' as const,
      name: 'Vue d\'ensemble',
      icon: BarChart3,
      description: 'Statistiques générales et graphiques principaux'
    },
    {
      id: 'advanced' as const,
      name: 'Analyse avancée',
      icon: TrendingUp,
      description: 'Graphiques détaillés et analyses approfondies'
    },
    {
      id: 'dashboard' as const,
      name: 'Tableau de bord',
      icon: Activity,
      description: 'Activité récente et métriques en temps réel'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Statistiques</h1>
        <p className="text-gray-600 mb-6">
          Découvrez les données et les tendances relatives à la gestion des déchets à Pita.
        </p>

        {/* Navigation par onglets */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`mr-2 h-5 w-5 ${
                    activeTab === tab.id ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Description de l'onglet actif */}
        <div className="mt-4 mb-6">
          <p className="text-sm text-gray-600">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>
      </div>
      
      {/* Contenu des onglets */}
      <div className="tab-content">
        {activeTab === 'overview' && <StatsOverview />}
        {activeTab === 'advanced' && <AdvancedStats />}
        {activeTab === 'dashboard' && <DashboardStats />}
      </div>
    </div>
  );
};

export default StatisticsPage;