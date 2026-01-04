import React, { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Trash2, CheckCircle, Clock, AlertCircle, Percent, FileText, RefreshCw } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { buildApiUrl } from '../../config/api';

interface StatsData {
  success: boolean;
  error?: string;
  data: {
    summary?: {
      totalReports: number;
      collectedReports: number;
      totalCitizens: number;
      activePartnerships: number;
      collectionRate: number;
    };
    users?: {
      total: number;
      citizens: number;
      admins: number;
      partners: number;
    };
    wasteReports?: {
      total: number;
      pending: number;
      collected: number;
      byType: { _id: string; count: number }[];
      last7Days: { _id: string; count: number }[];
    };
    wasteByType?: { _id: string; count: number }[];
    reportsLast30Days?: { _id: string; count: number }[];
    collaborations?: {
      total: number;
      pending: number;
      approved: number;
      byType: { _id: string; count: number }[];
    };
  };
}

const StatsOverview: React.FC = () => {
  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');
  const pdfRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fonction pour récupérer les statistiques
  const fetchStats = async (): Promise<StatsData> => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = user.role || 'citizen';
    
    if (!token) {
      throw new Error('Token d\'authentification manquant. Veuillez vous reconnecter.');
    }
    
    // Déterminer l'endpoint selon le rôle
    const endpoint = (userRole === 'admin' || userRole === 'super_admin') ? '/api/stats' : '/api/stats/public';
    
    const response = await fetch(buildApiUrl(endpoint), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API stats:', response.status, errorText);
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    const data: StatsData = await response.json();
    console.log('Statistiques reçues:', data);
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur inconnue');
    }
    
    return data;
  };

  // React Query pour les statistiques avec actualisation automatique
  const { data: stats, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['statistics_overview'],
    queryFn: fetchStats,
    refetchInterval: 60000, // Actualiser toutes les 60 secondes
    refetchIntervalInBackground: true
  });

  // Effet pour définir le mode d'affichage selon les données
  React.useEffect(() => {
    if (stats?.data.users) {
      setViewMode('admin');
    } else if (stats?.data.summary) {
      setViewMode('public');
    }
  }, [stats]);

  // Gestion des erreurs
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <AlertCircle size={48} className="mx-auto mb-2" />
          <p className="text-lg font-semibold">Erreur de chargement</p>
          <p className="text-sm">{error.message}</p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Calculer les données pour l'affichage
  const getDisplayData = () => {
    if (!stats?.data) return null;

    if (viewMode === 'admin' && stats.data.wasteReports) {
      return {
        totalReports: stats.data.wasteReports.total,
        completed: stats.data.wasteReports.collected,
        pending: stats.data.wasteReports.pending,
        wasteTypeData: stats.data.wasteReports.byType.map(item => ({
          name: item._id || 'Non spécifié',
          count: item.count
        })),
        evolutionData: stats.data.wasteReports.last7Days.map(item => ({
          date: item._id,
          count: item.count
        })),
        users: stats.data.users
      };
    } else if (stats.data.summary) {
      return {
        totalReports: stats.data.summary.totalReports,
        completed: stats.data.summary.collectedReports,
        pending: stats.data.summary.totalReports - stats.data.summary.collectedReports,
        wasteTypeData: stats.data.wasteByType?.map(item => ({
          name: item._id || 'Non spécifié',
          count: item.count
        })) || [],
        evolutionData: stats.data.reportsLast30Days?.map(item => ({
          date: item._id,
          count: item.count
        })) || [],
        collectionRate: stats.data.summary.collectionRate,
        totalCitizens: stats.data.summary.totalCitizens,
        activePartnerships: stats.data.summary.activePartnerships
      };
    }
    
    return null;
  };

  const displayData = getDisplayData();
  const resolutionRate = displayData?.totalReports
    ? Math.round(((displayData.completed ?? 0) / displayData.totalReports) * 100)
    : 0;

  const handleExportPDF = () => {
    if (pdfRef.current) {
      html2pdf().set({
        margin: 0.5,
        filename: 'statistiques-dechets.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      }).from(pdfRef.current).save();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Chargement des statistiques...</span>
      </div>
    );
  }

  if (!displayData) {
    const isAuthError = stats?.error && (
      stats.error.includes('Session expirée') || 
      stats.error.includes('authentification manquant')
    );
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
        <h3 className="text-red-800 font-semibold mb-2">
          {isAuthError ? 'Problème d\'authentification' : 'Erreur de chargement'}
        </h3>
        <p className="text-red-700 mb-4">
          {stats?.error || 'Erreur lors du chargement des statistiques'}
        </p>
        
        {isAuthError ? (
          <div className="flex justify-center gap-2">
            <button 
              onClick={() => window.location.href = '/login'} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Se reconnecter
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {viewMode === 'admin' ? 'Statistiques Administrateur' : 'Statistiques Publiques'}
          </h2>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            {viewMode === 'admin' ? 'Vue complète' : 'Vue publique'}
          </span>
          {loading && (
            <div className="flex items-center text-sm text-blue-600">
              <svg className="animate-spin w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
              </svg>
              Mise à jour...
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button onClick={handleExportPDF} className="btn-secondary flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Exporter en PDF
          </button>
        </div>
      </div>

      <div ref={pdfRef} className="space-y-6">
        {/* 🟢 Statistiques générales */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-green-600" />
            Vue d'ensemble
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Total des signalements</p>
                  <p className="text-3xl font-bold text-green-800">{displayData.totalReports}</p>
                </div>
                <Trash2 className="text-green-600 w-8 h-8" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Signalements résolus</p>
                  <p className="text-3xl font-bold text-blue-800">{displayData.completed}</p>
                </div>
                <CheckCircle className="text-blue-600 w-8 h-8" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 font-medium">En attente</p>
                  <p className="text-3xl font-bold text-yellow-800">{displayData.pending}</p>
                </div>
                <Clock className="text-yellow-600 w-8 h-8" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">Taux de résolution</p>
                  <p className="text-3xl font-bold text-purple-800">{resolutionRate}%</p>
                </div>
                <Percent className="text-purple-600 w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Statistiques supplémentaires pour la vue publique */}
          {viewMode === 'public' && displayData.totalCitizens && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-lg border border-indigo-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-700 font-medium">Citoyens actifs</p>
                    <p className="text-3xl font-bold text-indigo-800">{displayData.totalCitizens}</p>
                  </div>
                  <AlertCircle className="text-indigo-600 w-8 h-8" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-6 rounded-lg border border-teal-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-teal-700 font-medium">Partenariats actifs</p>
                    <p className="text-3xl font-bold text-teal-800">{displayData.activePartnerships}</p>
                  </div>
                  <CheckCircle className="text-teal-600 w-8 h-8" />
                </div>
              </div>
            </div>
          )}

          {/* Statistiques utilisateurs pour les admins */}
          {viewMode === 'admin' && displayData.users && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-lg border border-indigo-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-700 font-medium">Total utilisateurs</p>
                    <p className="text-3xl font-bold text-indigo-800">{displayData.users.total}</p>
                  </div>
                  <AlertCircle className="text-indigo-600 w-8 h-8" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-6 rounded-lg border border-teal-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-teal-700 font-medium">Citoyens</p>
                    <p className="text-3xl font-bold text-teal-800">{displayData.users.citizens}</p>
                  </div>
                  <CheckCircle className="text-teal-600 w-8 h-8" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-700 font-medium">Partenaires</p>
                    <p className="text-3xl font-bold text-orange-800">{displayData.users.partners}</p>
                  </div>
                  <AlertCircle className="text-orange-600 w-8 h-8" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 🟢 Graphique en barres des types de déchets */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-green-600" />
            Types de déchets signalés
          </h3>
          {displayData.wasteTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={displayData.wasteTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2E7D32" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <Trash2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune donnée de type de déchet disponible</p>
            </div>
          )}
        </div>

        {/* 🟢 Graphique circulaire */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-green-600" />
            Répartition des types de déchets
          </h3>
          {displayData.wasteTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={displayData.wasteTypeData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {displayData.wasteTypeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={['#2E7D32', '#FF9800', '#2196F3', '#E53935', '#9C27B0', '#00BCD4'][index % 6]}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune donnée de répartition disponible</p>
            </div>
          )}
        </div>

        {/* 🟢 Évolution des signalements */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-green-600" />
            Évolution des signalements ({viewMode === 'admin' ? '7 derniers jours' : '30 derniers jours'})
          </h3>
          {displayData.evolutionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={displayData.evolutionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1565C0" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <BarChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune donnée d'évolution disponible</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
