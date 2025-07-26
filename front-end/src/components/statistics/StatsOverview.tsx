import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Trash2, CheckCircle, Clock, AlertCircle, Percent, FileText } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface StatsData {
  totalReports: number;
  completed: number;
  pending: number;
  criticalAreas: number;
  wasteTypeData: { name: string; count: number }[];
  reportsByNeighborhood: { name: string; reports: number }[];
}

const StatsOverview: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/statistics');
        const data: StatsData = await response.json();
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error("❌ Erreur de récupération des statistiques :", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const resolutionRate = stats?.totalReports
    ? Math.round(((stats.completed ?? 0) / stats.totalReports) * 100)
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
    return <div className="text-center text-gray-600">Chargement des statistiques...</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={handleExportPDF} className="btn-secondary flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Exporter en PDF
        </button>
      </div>

      <div ref={pdfRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 🟢 Statistiques générales */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Statistiques générales</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Trash2 className="text-green-700" size={20} />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Total des signalements</p>
                  <p className="text-xl font-semibold">{stats?.totalReports ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="text-blue-700" size={20} />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Signalements résolus</p>
                  <p className="text-xl font-semibold">{stats?.completed ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Clock className="text-yellow-700" size={20} />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">En attente</p>
                  <p className="text-xl font-semibold">{stats?.pending ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="text-red-700" size={20} />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Points critiques</p>
                  <p className="text-xl font-semibold">{stats?.criticalAreas ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg col-span-2">
              <div className="flex items-center">
                <Percent className="text-purple-700" size={20} />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Taux de résolution</p>
                  <p className="text-xl font-semibold">{resolutionRate}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🟢 Graphique en barres des types de déchets */}
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

        {/* 🟢 Graphique circulaire */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Répartition des types de déchets</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats?.wasteTypeData ?? []}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {(stats?.wasteTypeData ?? []).map((entry: { name: string; count: number }, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={['#2E7D32', '#FF9800', '#2196F3', '#E53935'][index % 4]}
                  />
                ))}
              </Pie>
              <Legend />
            </PieChart>
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
    </div>
  );
};

export default StatsOverview;
