import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl, buildImageUrl } from '../config/api';
import { Users, UserCheck, UserX, Shield, Trash2, Search, Filter, MapPin, Eye, Navigation } from 'lucide-react';
import ApiUrlDebug from '../components/debug/ApiUrlDebug';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'citizen' | 'admin' | 'partner' | 'super_admin';
  isActive: boolean;
  createdAt: string;
  points?: number;
}

interface CollaborationRequest {
  _id: string;
  organizationName: string;
  contactPerson: string;
  email: string;
  phone: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

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
  const [activeTab, setActiveTab] = useState<'users' | 'collaborations' | 'reports'>('reports');
  
  // États pour les utilisateurs
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userFilter, setUserFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  
  // États pour les collaborations
  const [collaborations, setCollaborations] = useState<CollaborationRequest[]>([]);
  const [collaborationsLoading, setCollaborationsLoading] = useState(true);
  const [processingCollaboration, setProcessingCollaboration] = useState<string | null>(null);

  // États pour les signalements
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportFilter, setReportFilter] = useState('all');
  const [updatingReport, setUpdatingReport] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);

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

  // Charger les signalements
  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (reportFilter !== 'all') params.append('status', reportFilter);

      const response = await fetch(buildApiUrl(`/api/waste?${params}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Données signalements reçues:', data); // Debug
        const reportsData = data.data.wasteReports || data.data;
        setReports(reportsData);
      }
    } catch (error) {
      console.error('Erreur chargement signalements:', error);
    } finally {
      setReportsLoading(false);
    }
  };

  // Mettre à jour le statut d'un signalement
  const updateReportStatus = async (reportId: string, newStatus: string) => {
    setUpdatingReport(reportId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/waste/${reportId}/status`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchReports(); // Recharger la liste
        // Mettre à jour le signalement sélectionné si c'est le même
        if (selectedReport && selectedReport._id === reportId) {
          setSelectedReport({...selectedReport, status: newStatus as any});
        }
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setUpdatingReport(null);
    }
  };

  // Supprimer un signalement
  const deleteReport = async (reportId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce signalement ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/waste/${reportId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchReports(); // Recharger la liste
        alert('Signalement supprimé avec succès');
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur suppression signalement:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // Ouvrir l'itinéraire vers le signalement
  const openDirections = (location: { lat: number; lng: number }) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
    window.open(url, '_blank');
  };
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (userFilter !== 'all') params.append('role', userFilter);
      if (userSearch) params.append('search', userSearch);

      const response = await fetch(buildApiUrl(`/api/users/manage?${params}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  // Charger les collaborations
  const fetchCollaborations = async () => {
    try {
      setCollaborationsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/api/collaborations'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCollaborations(data.data);
      }
    } catch (error) {
      console.error('Erreur chargement collaborations:', error);
    } finally {
      setCollaborationsLoading(false);
    }
  };

  // Modifier le rôle d'un utilisateur
  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/users/manage/${userId}/role`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        await fetchUsers(); // Recharger la liste
        alert('Rôle mis à jour avec succès');
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur mise à jour rôle:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  // Supprimer un utilisateur
  const deleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userEmail} ?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/users/manage/${userId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchUsers(); // Recharger la liste
        alert('Utilisateur supprimé avec succès');
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // Activer/Désactiver un utilisateur
  const toggleUserStatus = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/users/manage/${userId}/toggle-status`), {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchUsers(); // Recharger la liste
        alert('Statut mis à jour avec succès');
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur modification statut:', error);
      alert('Erreur lors de la modification');
    }
  };

  // Gérer une demande de collaboration
  const handleCollaborationStatus = async (collaborationId: string, status: 'approved' | 'rejected') => {
    setProcessingCollaboration(collaborationId);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      const response = await fetch(buildApiUrl(`/api/collaborations/${collaborationId}/status`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (response.ok) {
        await fetchCollaborations(); // Recharger la liste
        const message = status === 'approved' 
          ? `✅ Collaboration approuvée ! ${data.message || 'L\'utilisateur a été promu admin.'}`
          : '❌ Collaboration rejetée.';
        alert(message);
      } else {
        console.error('Erreur API:', data);
        alert(`Erreur: ${data.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur gestion collaboration:', error);
      alert('Erreur de connexion. Vérifiez votre connexion internet.');
    } finally {
      setProcessingCollaboration(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userFilter, userSearch]);

  useEffect(() => {
    fetchCollaborations();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [reportFilter]);

  const getRoleBadge = (role: string) => {
    const colors = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      partner: 'bg-green-100 text-green-800',
      citizen: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || colors.citizen;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  const getReportStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      collected: 'bg-green-100 text-green-800',
      not_collected: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Debug API temporaire */}
      <ApiUrlDebug />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Administration {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </h1>
          <p className="text-gray-600 mt-2">
            {user?.role === 'super_admin' 
              ? 'Gestion des utilisateurs, collaborations et signalements'
              : 'Gestion des signalements et statistiques'
            }
          </p>
        </div>

        {/* Onglets */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MapPin className="inline mr-2" size={16} />
                Signalements
              </button>
              {user?.role === 'super_admin' && (
                <>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'users'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Users className="inline mr-2" size={16} />
                    Gestion des utilisateurs
                  </button>
                  <button
                    onClick={() => setActiveTab('collaborations')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'collaborations'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    🤝 Demandes de collaboration
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Gestion des signalements</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Gérez les statuts des signalements et suivez leur traitement
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-400" />
                  <select
                    value={reportFilter}
                    onChange={(e) => setReportFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="collected">Collecté</option>
                    <option value="not_collected">Non collecté</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {reportsLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p>Chargement...</p>
                </div>
              ) : (
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
              )}
            </div>

            {/* Modale détaillée des signalements */}
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
                              onClick={() => openDirections(selectedReport.location)}
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
                            onClick={() => {
                              updateReportStatus(selectedReport._id, 'pending');
                              setSelectedReport({...selectedReport, status: 'pending'});
                            }} 
                            className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                            disabled={updatingReport === selectedReport._id}
                          >
                            Marquer en attente
                          </button>
                          <button 
                            onClick={() => {
                              updateReportStatus(selectedReport._id, 'collected');
                              setSelectedReport({...selectedReport, status: 'collected'});
                            }} 
                            className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                            disabled={updatingReport === selectedReport._id}
                          >
                            Marquer collecté
                          </button>
                          <button 
                            onClick={() => {
                              updateReportStatus(selectedReport._id, 'not_collected');
                              setSelectedReport({...selectedReport, status: 'not_collected'});
                            }} 
                            className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                            disabled={updatingReport === selectedReport._id}
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
                          {selectedReport.images.original.filename && (
                            <p className="text-sm text-gray-600">
                              Fichier: {selectedReport.images.original.filename}
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
          </div>
        )}

        {activeTab === 'users' && user?.role === 'super_admin' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Rechercher par nom ou email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-400" />
                  <select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tous les rôles</option>
                    <option value="citizen">Citoyens</option>
                    <option value="admin">Admins</option>
                    <option value="partner">Partenaires</option>
                    <option value="super_admin">Super Admins</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {usersLoading ? (
                <div className="p-8 text-center">Chargement...</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rôle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inscription
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? <UserCheck size={12} className="mr-1" /> : <UserX size={12} className="mr-1" />}
                            {user.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {user.role !== 'super_admin' && (
                            <div className="flex gap-2">
                              <select
                                value={user.role}
                                onChange={(e) => updateUserRole(user._id, e.target.value)}
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="citizen">Citoyen</option>
                                <option value="admin">Admin</option>
                                <option value="partner">Partenaire</option>
                              </select>
                              <button
                                onClick={() => toggleUserStatus(user._id)}
                                className={`px-2 py-1 text-xs rounded ${
                                  user.isActive 
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                              >
                                {user.isActive ? 'Désactiver' : 'Activer'}
                              </button>
                              <button
                                onClick={() => deleteUser(user._id, user.email)}
                                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'collaborations' && user?.role === 'super_admin' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Demandes de collaboration</h3>
              <p className="text-sm text-gray-500 mt-1">
                Gérez les demandes de collaboration et promouvez automatiquement les utilisateurs
              </p>
            </div>

            <div className="overflow-x-auto">
              {collaborationsLoading ? (
                <div className="p-8 text-center">Chargement...</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Organisation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {collaborations.map((collab) => (
                      <tr key={collab._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{collab.organizationName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{collab.contactPerson}</div>
                            <div className="text-sm text-gray-500">{collab.email}</div>
                            <div className="text-sm text-gray-500">{collab.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {collab.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(collab.status)}`}>
                            {collab.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(collab.submittedAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {collab.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleCollaborationStatus(collab._id, 'approved')}
                                disabled={processingCollaboration === collab._id}
                                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingCollaboration === collab._id ? (
                                  <div className="flex items-center">
                                    <div className="animate-spin h-3 w-3 border border-green-600 border-t-transparent rounded-full mr-1"></div>
                                    Traitement...
                                  </div>
                                ) : (
                                  '✅ Approuver'
                                )}
                              </button>
                              <button
                                onClick={() => handleCollaborationStatus(collab._id, 'rejected')}
                                disabled={processingCollaboration === collab._id}
                                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingCollaboration === collab._id ? (
                                  <div className="flex items-center">
                                    <div className="animate-spin h-3 w-3 border border-red-600 border-t-transparent rounded-full mr-1"></div>
                                    Traitement...
                                  </div>
                                ) : (
                                  '❌ Rejeter'
                                )}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;