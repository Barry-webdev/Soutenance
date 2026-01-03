import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { useQuery } from "@tanstack/react-query";
import { buildApiUrl, buildImageUrl } from '../../config/api';

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

interface CollaborationRequest {
  _id: string;
  organizationName: string;
  contactPerson: string;
  email: string;
  phone: string;
  type: 'ngo' | 'company' | 'government' | 'educational' | 'other';
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  createdAt: string;
}

// Composant principal
const AdminPanel: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);
  const [selectedCollaboration, setSelectedCollaboration] = useState<CollaborationRequest | null>(null);

  // Fetch Signalements
  const fetchReports = async (): Promise<WasteReport[]> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token d\'authentification manquant. Veuillez vous reconnecter.');
    }

    const response = await fetch(buildApiUrl("/api/waste"), {
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

    const response = await fetch(buildApiUrl("/api/users"), {
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

  // Fetch Collaborations
  const fetchCollaborations = async (): Promise<CollaborationRequest[]> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token d\'authentification manquant. Veuillez vous reconnecter.');
    }

    const response = await fetch(buildApiUrl("/api/collaborations"), {
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
      console.error('Erreur API collaborations:', response.status, errorText);
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Collaborations reçues:', data);
    
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

  const {
    data: collaborations = [],
    isLoading: isLoadingCollaborations,
    error: collaborationsError,
  } = useQuery({ queryKey: ['collaborations'], queryFn: fetchCollaborations });

  // Fonction de mise à jour du statut
  const updateReportStatus = async (reportId: string, newStatus: WasteReport['status']) => {
    try {
      const response = await fetch(buildApiUrl(`/api/waste/${reportId}/status`), {
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

  // Fonction de mise à jour du statut des collaborations
  const updateCollaborationStatus = async (collaborationId: string, newStatus: CollaborationRequest['status']) => {
    try {
      const response = await fetch(buildApiUrl(`/api/collaborations/${collaborationId}/status`), {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour du statut");

      const updated = await response.json();
      
      if (updated.success && updated.data) {
        setSelectedCollaboration(updated.data);
        window.location.reload(); // Rafraîchir la liste
      }
      
      alert("Statut de collaboration mis à jour avec succès !");
    } catch (error) {
      console.error(error);
      alert("Échec de la mise à jour du statut de collaboration !");
    }
  };

  // Affichage conditionnel
  if (isLoadingReports || isLoadingUsers || isLoadingCollaborations) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }
  
  if (reportsError || usersError || collaborationsError) {
    const error = (reportsError || usersError || collaborationsError) as Error;
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
          <TabsTrigger value="collaborations" className="flex-1">Collaborations</TabsTrigger>
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
                            src={buildImageUrl(report.images.thumbnail.url)} 
                            alt="Aperçu" 
                            className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80"
                            onClick={() => setSelectedReport(report)}
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
                        {selectedReport.location.address && (
                          <p><strong>Adresse:</strong> {selectedReport.location.address}</p>
                        )}
                        
                        {/* Bouton de navigation */}
                        <div className="mt-2">
                          <button 
                            onClick={() => {
                              const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedReport.location.lat},${selectedReport.location.lng}`;
                              window.open(url, '_blank');
                            }}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center gap-1"
                          >
                            🚗 Obtenir l'itinéraire
                          </button>
                        </div>
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
                          src={buildImageUrl(selectedReport.images.original.url)} 
                          alt="Signalement" 
                          className="w-full h-64 object-cover rounded-lg border cursor-pointer hover:opacity-90"
                          onClick={() => {
                            // Ouvrir l'image en plein écran
                            window.open(buildImageUrl(selectedReport.images.original.url), '_blank');
                          }}
                        />
                        <p className="text-sm text-gray-600">
                          Fichier: {selectedReport.images.original.filename}
                        </p>
                        {selectedReport.images.original.size && (
                          <p className="text-sm text-gray-600">
                            Taille: {(selectedReport.images.original.size / 1024).toFixed(1)} KB
                          </p>
                        )}
                        <p className="text-xs text-gray-500 italic">
                          💡 Cliquez sur l'image pour l'agrandir
                        </p>
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

        {/* Collaborations */}
        <TabsContent value="collaborations" className="p-1">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm">Date</th>
                  <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm">Organisation</th>
                  <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm hidden sm:table-cell">Contact</th>
                  <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm hidden md:table-cell">Type</th>
                  <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm">Statut</th>
                  <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {collaborations.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4">Aucune demande de collaboration</td></tr>
                ) : (
                  collaborations.map(collaboration => (
                    <tr key={collaboration._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                        {new Date(collaboration.submittedAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium">
                        {collaboration.organizationName}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm hidden sm:table-cell">
                        <div>
                          <div>{collaboration.contactPerson}</div>
                          <div className="text-gray-500">{collaboration.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm hidden md:table-cell">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                          {collaboration.type === 'ngo' ? '🤝 ONG' :
                           collaboration.type === 'company' ? '🏢 Entreprise' :
                           collaboration.type === 'government' ? '🏛️ Gouvernement' :
                           collaboration.type === 'educational' ? '🎓 Éducation' : '📋 Autre'}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          collaboration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          collaboration.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {collaboration.status === 'pending' ? 'En attente' :
                           collaboration.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                        <button 
                          onClick={() => setSelectedCollaboration(collaboration)} 
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

          {/* Modale Collaboration */}
          {selectedCollaboration && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">Demande de Collaboration</h3>
                  <button 
                    onClick={() => setSelectedCollaboration(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Informations de l'organisation */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Informations de l'organisation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Organisation</p>
                        <p className="font-medium">{selectedCollaboration.organizationName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Type</p>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          {selectedCollaboration.type === 'ngo' ? '🤝 ONG/Association' :
                           selectedCollaboration.type === 'company' ? '🏢 Entreprise' :
                           selectedCollaboration.type === 'government' ? '🏛️ Institution Gouvernementale' :
                           selectedCollaboration.type === 'educational' ? '🎓 Établissement Éducatif' : '📋 Autre'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Personne de contact</p>
                        <p className="font-medium">{selectedCollaboration.contactPerson}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Statut actuel</p>
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          selectedCollaboration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          selectedCollaboration.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedCollaboration.status === 'pending' ? 'En attente' :
                           selectedCollaboration.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Informations de contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <a href={`mailto:${selectedCollaboration.email}`} className="text-blue-600 hover:text-blue-800">
                          {selectedCollaboration.email}
                        </a>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Téléphone</p>
                        <a href={`tel:${selectedCollaboration.phone}`} className="text-blue-600 hover:text-blue-800">
                          {selectedCollaboration.phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  {selectedCollaboration.message && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">Message</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedCollaboration.message}</p>
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Informations temporelles</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Date de soumission</p>
                        <p>{new Date(selectedCollaboration.submittedAt).toLocaleString('fr-FR')}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Dernière mise à jour</p>
                        <p>{new Date(selectedCollaboration.createdAt).toLocaleString('fr-FR')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => updateCollaborationStatus(selectedCollaboration._id, 'pending')} 
                        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                      >
                        Marquer en attente
                      </button>
                      <button 
                        onClick={() => updateCollaborationStatus(selectedCollaboration._id, 'approved')} 
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                      >
                        Approuver
                      </button>
                      <button 
                        onClick={() => updateCollaborationStatus(selectedCollaboration._id, 'rejected')} 
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Rejeter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
