import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const StatsOverview: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // ✅ Correction ici : route alignée avec le backend
        const response = await fetch('http://localhost:4000/api/statistics');
        const data = await response.json();
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error("❌ Erreur de récupération des statistiques :", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-600">Chargement des statistiques...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 🟢 Statistiques générales */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Statistiques générales</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Trash2 className="text-green-700" size={20} />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total des signalements</p>
                <p className="text-xl font-semibold">{stats?.totalReports}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="text-blue-700" size={20} />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Signalements résolus</p>
                <p className="text-xl font-semibold">{stats?.completed}</p> {/* ✅ clé renommée */}
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="text-yellow-700" size={20} />
              <div className="ml-3">
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-xl font-semibold">{stats?.pending}</p> {/* ✅ clé renommée */}
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="text-red-700" size={20} />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Points critiques</p>
                <p className="text-xl font-semibold">{stats?.criticalAreas ?? 0}</p> {/* ✅ fallback si absent */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 Types de déchets */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Types de déchets signalés</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats?.wasteTypeData ?? []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#2E7D32" barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🟢 Signalements par quartier */}
      <div className="card md:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Signalements par quartier (Pita)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats?.reportsByNeighborhood ?? []} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={120} />
            <Tooltip />
            <Bar dataKey="reports" fill="#1565C0" barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsOverview;
