import React, { useState, useEffect } from 'react';
import { 
  Activity, Users, TrendingUp, Clock, CheckCircle, AlertTriangle,
  RefreshCw, Calendar, Award, Target
} from 'lucide-react';

interface DashboardStatsData {
  success: boolean;
  data: {
    recent: {
      users: number;
      wasteReports: number;
      collaborations: number;
    };
    topUsers: Array<{
      _id: string;
      name: string;
      email: string;
      points: number;
    }>;
    period: string;
  };
}

const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/stats/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: DashboardStatsData = await response.json();
      setStats(data);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error("❌ Erreur de récupération des statistiques dashboard :", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchStats, 30000); // Actualisation toutes les 30 secondes
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleRefresh = () => {
    setLoading(true);
    fetchStats();
  };

  if (loading && !stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Chargement du tableau de bord...</span>
      </div>
    );
  }

  if (!stats?.data) {
    return (
      <div className="text-center text-red-600 p-8">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
        <p>Erreur lors du chargement du tableau de bord</p>
        <button 
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const { recent, topUsers, period } = stats.data;

  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="w-6 h-6 text-green-600" />
            Tableau de Bord - Activité Récente
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            Actualisation auto
          </label>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Métriques récentes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Nouveaux utilisateurs</p>
              <p className="text-3xl font-bold">{recent.users}</p>
              <p className="text-blue-100 text-xs mt-1">{period}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-blue-200 mr-1" />
            <span className="text-blue-100 text-sm">
              {recent.users > 0 ? '+' : ''}{recent.users} cette semaine
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Nouveaux signalements</p>
              <p className="text-3xl font-bold">{recent.wasteReports}</p>
              <p className="text-green-100 text-xs mt-1">{period}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-green-200" />
          </div>
          <div className="mt-4 flex items-center">
            <Activity className="w-4 h-4 text-green-200 mr-1" />
            <span className="text-green-100 text-sm">
              {recent.wasteReports > 0 ? '+' : ''}{recent.wasteReports} cette semaine
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Nouvelles collaborations</p>
              <p className="text-3xl font-bold">{recent.collaborations}</p>
              <p className="text-purple-100 text-xs mt-1">{period}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-200" />
          </div>
          <div className="mt-4 flex items-center">
            <Target className="w-4 h-4 text-purple-200 mr-1" />
            <span className="text-purple-100 text-sm">
              {recent.collaborations > 0 ? '+' : ''}{recent.collaborations} cette semaine
            </span>
          </div>
        </div>
      </div>

      {/* Top utilisateurs */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Top Contributeurs
          </h3>
          <span className="text-sm text-gray-500">Classement par points</span>
        </div>

        {topUsers && topUsers.length > 0 ? (
          <div className="space-y-4">
            {topUsers.map((user, index) => (
              <div 
                key={user._id} 
                className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                  index === 0 ? 'border-yellow-200 bg-yellow-50' :
                  index === 1 ? 'border-gray-200 bg-gray-50' :
                  index === 2 ? 'border-orange-200 bg-orange-50' :
                  'border-gray-100 bg-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-500' :
                    'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900">{user.points}</p>
                  <p className="text-sm text-gray-600">points</p>
                </div>
                {index < 3 && (
                  <div className="ml-4">
                    {index === 0 && <Award className="w-6 h-6 text-yellow-500" />}
                    {index === 1 && <Award className="w-6 h-6 text-gray-400" />}
                    {index === 2 && <Award className="w-6 h-6 text-orange-500" />}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>

      {/* Indicateurs de performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Tendances
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Activité utilisateurs</span>
              </div>
              <span className="text-green-600 font-semibold">
                {recent.users > 0 ? '↗' : recent.users < 0 ? '↘' : '→'} 
                {Math.abs(recent.users)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">Signalements</span>
              </div>
              <span className="text-blue-600 font-semibold">
                {recent.wasteReports > 0 ? '↗' : recent.wasteReports < 0 ? '↘' : '→'} 
                {Math.abs(recent.wasteReports)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium">Collaborations</span>
              </div>
              <span className="text-purple-600 font-semibold">
                {recent.collaborations > 0 ? '↗' : recent.collaborations < 0 ? '↘' : '→'} 
                {Math.abs(recent.collaborations)}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Activité en temps réel
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border-l-4 border-green-500 bg-green-50">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Système opérationnel</p>
                <p className="text-xs text-gray-600">Tous les services fonctionnent</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border-l-4 border-blue-500 bg-blue-50">
              <Activity className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Actualisation automatique</p>
                <p className="text-xs text-gray-600">
                  {autoRefresh ? 'Activée (30s)' : 'Désactivée'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border-l-4 border-yellow-500 bg-yellow-50">
              <Calendar className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Période d'analyse</p>
                <p className="text-xs text-gray-600">{period}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;