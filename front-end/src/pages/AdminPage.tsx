import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../config/api';

interface WasteReport {
  _id: string;
  description: string;
  wasteType: string;
  status: 'pending' | 'collected' | 'not_collected';
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  images?: {
    original?: { url: string; filename?: string };
    medium?: { url: string; filename?: string };
    thumbnail?: { url: string; filename?: string };
  } | null;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt?: string;
}

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  // Vérifier que l'utilisateur est admin ou super admin
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h1>
          <p className="text-gray-600">Cette page est réservée aux administrateurs.</p>
        </div>
      </div>
    );
  }

  // Charger les signalements avec gestion d'erreur
  const fetchReports = async () => {
    try {
      console.log('🔄 Début chargement signalements...');
      setReportsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token manquant');
      }

      console.log('📡 Appel API...');
      const response = await fetch(buildApiUrl('/api/waste'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('📊 Réponse reçue:', response.status);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Données reçues:', data);
      
      const reportsData = data.data?.wasteReports || data.data || [];
      console.log('📋 Signalements extraits:', reportsData.length);
      
      setReports(reportsData);
    } catch (error) {
      console.error('❌ Erreur:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setReportsLoading(false);
      console.log('🏁 Chargement terminé');
    }
  };

  useEffect(() => {
    console.log('🚀 AdminPage montée, utilisateur:', user);
    fetchReports();
  }, []);

  // Affichage avec gestion d'erreur
  try {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-4">AdminPage - Debug</h1>
            
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold">Utilisateur connecté :</h2>
                <p>Nom: {user?.name}</p>
                <p>Rôle: {user?.role}</p>
                <p>Email: {user?.email}</p>
              </div>

              <div>
                <h2 className="font-semibold">État du chargement :</h2>
                <p>Chargement: {reportsLoading ? 'En cours...' : 'Terminé'}</p>
                <p>Nombre de signalements: {reports.length}</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <h2 className="font-semibold text-red-800">Erreur :</h2>
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {!reportsLoading && !error && reports.length > 0 && (
                <div>
                  <h2 className="font-semibold">Premier signalement :</h2>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(reports[0], null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <button 
                  onClick={fetchReports}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Recharger les signalements
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (renderError) {
    console.error('💥 Erreur de rendu:', renderError);
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur de rendu</h1>
          <p className="text-red-700 mb-4">
            {renderError instanceof Error ? renderError.message : 'Erreur inconnue'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }
};

export default AdminPage;