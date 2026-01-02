import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { useQuery } from "@tanstack/react-query";

// Interfaces
interface WasteReport {
  _id: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  wasteType: string;
  status: 'pending' | 'collected' | 'not_collected';
  location: {
    lat: number;
    lng: number;
  };
  images?: {
    original?: { url: string; filename: string };
    thumbnail?: { url: string; filename: string };
    medium?: { url: string; filename: string };
  } | null;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  points: number;
  createdAt: string;
}

// Composant principal
const AdminPanel: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);

  // Fetch Signalements
  const fetchReports = async (): Promise<WasteReport[]> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token d\'authentification manquant. Veuillez vous reconnecter.');
    }

    const response = await fetch("http://localhost:4000/api/waste", {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API:', response.status, errorText);
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Données reçues:', data);
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur inconnue');
    }
    
    return data.data?.wasteReports || [];
  };

  // Fetch Utilisateurs
  const fetchUsers = async (): Promise<User[]> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token d\'authentification manquant. Veuillez vous reconnecter.');
    }

    const response = await fetch("http://localhost:4000/api/users", {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API utilisateurs:', response.status, errorText);
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Utilisateurs reçus:', data);
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur inconnue');
    }
    
    return data.data || [];
  };

  // useQuery
  const {
    data: reports = [],
    isLoading: isLoadingReports,
    error: reportsError,
  } = useQuery({ queryKey: ['waste_reports'], queryFn: fetchReports });

  const {
    data: users = [],
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });

  // Fonction de mise à jour du statut
  const updateReportStatus = async (reportId: string, newStatus: WasteReport['status']) => {
    try {
      const response = await fetch(`http://localhost:4000/api/waste/${reportId}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour du statut");

      const updated = await response.json();
      
      // Mettre à jour le signalement sélectionné avec les nouvelles données
      if (updated.success && updated.data) {
        setSelectedReport(updated.data);
        // Optionnel: rafraîchir la liste des signalements
        window.location.reload(); // Solution simple, ou utiliser react-query invalidation
      }
      
      alert("Statut mis à jour avec succès !");
    } catch (error) {
      console.error(error);
      alert("Échec de la mise à jour du statut !");
    }
  };

  // Affichage conditionnel
  if (isLoadingReports || isLoadingUsers) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }
  
  if (reportsError || usersError) {
    const error = reportsError || usersError as Error;
    const isAuthError = error.message.includes('Session expirée') || error.message.includes('authentification manquant');
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <h3 className="text-red-800 font-semibold mb-2">
          {isAuthError ? 'Problème d\'authentification' : 'Erreur de chargement'}
        </h3>
        <p className="text-red-700 mb-2">{error.message}</p>
        
        {isAuthError ? (
          <div className="flex gap-2">
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
          <>
            <details className="text-sm text-red-600 mb-3">
              <summary className="cursor-pointer hover:text-red-800">Détails techniques</summary>
              <pre className="mt-2 bg-red-100 p-2 rounded text-xs overflow-auto">
                {error.stack || 'Aucun détail supplémentaire disponible'}
              </pre>
            </details>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Réessayer
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Panneau d'administration</h2>
      <Tabs defaultValue="reports">
        <TabsList className="flex mb-4">
          <TabsTrigger value="reports" className="flex-1">Signalements</TabsTrigger>
          <TabsTrigger value="users" className="flex-1">Utilisateurs</TabsTrigger>
        </TabsList>

        {/* Signalements */}
        <TabsContent value="reports" className="p-1">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm">Date</th>
                  <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm hidden sm:table-cell">Description</th>
                  <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm hidden md:table-cell">Utilisateur</th>
                  <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm">Type</th>
                  <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm">Statut</th>
                  <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm">Image</th>
                  <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-4">Aucun signalement</td></tr>
                ) : (
                  reports.map(report => (
                    <tr key={report._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                        {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm hidden sm:table-cell">
                        {report.description.length > 50 ? `${report.description.substring(0, 50)}...` : report.description}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm hidden md:table-cell">
                        {report.userId.name}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {report.wasteType}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          report.status === 'collected' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {report.status === 'pending' ? 'En attente' :
                           report.status === 'collected' ? 'Collecté' : 'Non collecté'}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                        {report.images?.thumbnail?.url ? (
                          <img 
                            src={report.images.thumbnail.url} 
                            alt="Aperçu" 
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">Pas d'image</span>
                        )}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                        <button 
                          onClick={() => setSelectedReport(report)} 
                          className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-300 rounded hover:bg-blue-50"
                        >
                          Voir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Modale */}
          {selectedReport && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">Détails du signalement</h3>
                  <button 
                    onClick={() => setSelectedReport(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informations du signalement */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Informations générales</h4>
                      <div className="space-y-2">
                        <p><strong>Description:</strong> {selectedReport.description}</p>
                        <p><strong>Type de déchet:</strong> 
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {selectedReport.wasteType}
                          </span>
                        </p>
                        <p><strong>Statut:</strong> 
                          <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
                            selectedReport.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            selectedReport.status === 'collected' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {selectedReport.status === 'pending' ? 'En attente' :
                             selectedReport.status === 'collected' ? 'Collecté' : 'Non collecté'}
                          </span>
                        </p>
                        <p><strong>Date de création:</strong> {new Date(selectedReport.createdAt).toLocaleString('fr-FR')}</p>
                        <p><strong>Dernière mise à jour:</strong> {new Date(selectedReport.updatedAt).toLocaleString('fr-FR')}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Utilisateur</h4>
                      <div className="space-y-2">
                        <p><strong>Nom:</strong> {selectedReport.userId.name}</p>
                        <p><strong>Email:</strong> {selectedReport.userId.email}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Localisation</h4>
                      <div className="space-y-2">
                        <p><strong>Latitude:</strong> {selectedReport.location.lat}</p>
                        <p><strong>Longitude:</strong> {selectedReport.location.lng}</p>
                        <p><strong>Coordonnées:</strong> {selectedReport.location.lat.toFixed(6)}, {selectedReport.location.lng.toFixed(6)}</p>
                      </div>
                    </div>

                    {/* Actions de mise à jour du statut */}
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Actions</h4>
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => updateReportStatus(selectedReport._id, 'pending')} 
                          className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                        >
                          Marquer en attente
                        </button>
                        <button 
                          onClick={() => updateReportStatus(selectedReport._id, 'collected')} 
                          className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                          Marquer collecté
                        </button>
                        <button 
                          onClick={() => updateReportStatus(selectedReport._id, 'not_collected')} 
                          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          Marquer non collecté
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Image */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Image du signalement</h4>
                    {selectedReport.images?.original?.url ? (
                      <div className="space-y-2">
                        <img 
                          src={selectedReport.images.original.url} 
                          alt="Signalement" 
                          className="w-full h-64 object-cover rounded-lg border"
                        />
                        <p className="text-sm text-gray-600">
                          Fichier: {selectedReport.images.original.filename}
                        </p>
                        {selectedReport.images.original.size && (
                          <p className="text-sm text-gray-600">
                            Taille: {(selectedReport.images.original.size / 1024).toFixed(1)} KB
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-gray-100 rounded-lg border flex items-center justify-center">
                        <p className="text-gray-500">Aucune image disponible</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Utilisateurs */}
        <TabsContent value="users" className="p-1">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Nom</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Rôle</th>
                  <th className="py-3 px-4">Points</th>
                  <th className="py-3 px-4">Inscription</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={6}>Aucun utilisateur</td></tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id}>
                      <td className="py-3 px-4">{user.id}</td>
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">{user.role}</td>
                      <td className="py-3 px-4">{user.points}</td>
                      <td className="py-3 px-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
