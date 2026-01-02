import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, BarChart3, MapPin } from 'lucide-react';
import AdvancedSearch from '../components/search/AdvancedSearch';

interface SearchStats {
  totalReports: number;
  wasteTypes: Array<{ _id: string; count: number }>;
  statusDistribution: Array<{ _id: string; count: number }>;
  recentActivity: Array<{ _id: string; count: number }>;
}

const SearchPage: React.FC = () => {
  const [searchStats, setSearchStats] = useState<SearchStats | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSearchStats();
  }, []);

  const fetchSearchStats = async () => {
    try {
      const response = await fetch('/api/search/stats');
      const data = await response.json();
      
      if (data.success) {
        setSearchStats(data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultsChange = (results: any[]) => {
    setSearchResults(results);
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'En attente',
      in_progress: 'En cours',
      collected: 'Collecté',
      resolved: 'Résolu'
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Recherche Avancée</h1>
          <p className="text-gray-600">Trouvez rapidement les signalements qui vous intéressent</p>
        </div>

        {/* Statistiques rapides */}
        {searchStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Search className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {searchStats.totalReports.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Signalements totaux</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {searchStats.wasteTypes.length}
                  </div>
                  <div className="text-sm text-gray-600">Types de déchets</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {searchStats.recentActivity.reduce((sum, item) => sum + item.count, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Cette semaine</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {searchResults.length}
                  </div>
                  <div className="text-sm text-gray-600">Résultats actuels</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Recherche principale */}
          <div className="lg:col-span-3">
            <AdvancedSearch onResultsChange={handleResultsChange} />
          </div>

          {/* Sidebar avec statistiques */}
          <div className="space-y-6">
            {/* Types de déchets les plus fréquents */}
            {searchStats && searchStats.wasteTypes.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Types les plus signalés
                </h3>
                <div className="space-y-3">
                  {searchStats.wasteTypes.slice(0, 5).map((type, index) => (
                    <div key={type._id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-green-700">
                            {index + 1}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {type._id}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {type.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Distribution des statuts */}
            {searchStats && searchStats.statusDistribution.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Répartition par statut
                </h3>
                <div className="space-y-3">
                  {searchStats.statusDistribution.map((status) => {
                    const percentage = (status.count / searchStats.totalReports) * 100;
                    return (
                      <div key={status._id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {getStatusLabel(status._id)}
                          </span>
                          <span className="text-sm text-gray-600">
                            {status.count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Activité récente */}
            {searchStats && searchStats.recentActivity.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Activité des 7 derniers jours
                </h3>
                <div className="space-y-2">
                  {searchStats.recentActivity.map((activity) => (
                    <div key={activity._id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {new Date(activity._id).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ 
                              width: `${Math.min(100, (activity.count / Math.max(...searchStats.recentActivity.map(a => a.count))) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8 text-right">
                          {activity.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;