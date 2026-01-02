import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Calendar, MapPin, Users, Zap, Award } from 'lucide-react';
import { buildApiUrl } from '../../config/api';

interface AdvancedStatsData {
  success: boolean;
  data: {
    wasteReports?: {
      total: number;
      pending: number;
      collected: number;
      byType: { _id: string; count: number }[];
      last7Days: { _id: string; count: number }[];
    };
    users?: {
      total: number;
      citizens: number;
      admins: number;
      partners: number;
    };
    collaborations?: {
      total: number;
      pending: number;
      approved: number;
      byType: { _id: string; count: number }[];
    };
  };
}

const AdvancedStats: React.FC = () => {
  const [stats, setStats] = useState<AdvancedStatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(buildApiUrl('/api/stats'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: AdvancedStatsData = await response.json();
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error("❌ Erreur de récupération des statistiques avancées :", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Chargement des statistiques avancées...</span>
      </div>
    );
  }

  if (!stats?.data) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>Erreur lors du chargement des statistiques avancées</p>
      </div>
    );
  }

  const { wasteReports, users, collaborations } = stats.data;

  // Données pour les graphiques
  const wasteTypeData = wasteReports?.byType.map(item => ({
    name: item._id || 'Non spécifié',
    count: item.count,
    percentage: wasteReports.total > 0 ? Math.round((item.count / wasteReports.total) * 100) : 0
  })) || [];

  const evolutionData = wasteReports?.last7Days.map(item => ({
    date: new Date(item._id).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    signalements: item.count
  })) || [];

  const collaborationData = collaborations?.byType.map(item => ({
    name: item._id || 'Non spécifié',
    count: item.count
  })) || [];

  const colors = ['#2E7D32', '#FF9800', '#2196F3', '#E53935', '#9C27B0', '#00BCD4', '#FF5722', '#795548'];

  return (
    <div className="space-y-6">
      {/* Header avec sélecteur de période */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-600" />
          Statistiques Avancées
        </h2>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
          </select>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Efficacité</p>
              <p className="text-3xl font-bold">
                {wasteReports?.total ? Math.round((wasteReports.collected / wasteReports.total) * 100) : 0}%
              </p>
              <p className="text-green-100 text-xs mt-1">Taux de résolution</p>
            </div>
            <Award className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Activité</p>
              <p className="text-3xl font-bold">{wasteReports?.total || 0}</p>
              <p className="text-blue-100 text-xs mt-1">Signalements totaux</p>
            </div>
            <Zap className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Communauté</p>
              <p className="text-3xl font-bold">{users?.citizens || 0}</p>
              <p className="text-purple-100 text-xs mt-1">Citoyens actifs</p>
            </div>
            <Users className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Partenariats</p>
              <p className="text-3xl font-bold">{collaborations?.approved || 0}</p>
              <p className="text-orange-100 text-xs mt-1">Collaborations actives</p>
            </div>
            <MapPin className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution temporelle */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Évolution des signalements
          </h3>
          {evolutionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={evolutionData}>
                <defs>
                  <linearGradient id="colorSignalements" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="signalements" 
                  stroke="#2E7D32" 
                  fillOpacity={1} 
                  fill="url(#colorSignalements)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune donnée d'évolution disponible</p>
            </div>
          )}
        </div>

        {/* Répartition par type de déchet */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-green-600" />
            Types de déchets
          </h3>
          {wasteTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={wasteTypeData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                >
                  {wasteTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune donnée de type disponible</p>
            </div>
          )}
        </div>
      </div>

      {/* Graphiques secondaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Détail des types de déchets */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Détail par type de déchet</h3>
          {wasteTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={wasteTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#2E7D32" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <BarChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune donnée détaillée disponible</p>
            </div>
          )}
        </div>

        {/* Collaborations */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Types de collaborations</h3>
          {collaborationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={collaborationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#FF9800" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune donnée de collaboration disponible</p>
            </div>
          )}
        </div>
      </div>

      {/* Tableau récapitulatif */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Récapitulatif détaillé</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type de déchet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pourcentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {wasteTypeData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-3" 
                        style={{ backgroundColor: colors[index % colors.length] }}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.percentage}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.percentage > 30 ? 'bg-red-100 text-red-800' :
                      item.percentage > 15 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.percentage > 30 ? 'Critique' :
                       item.percentage > 15 ? 'Élevé' : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdvancedStats;