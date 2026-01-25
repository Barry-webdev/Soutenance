import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl, buildImageUrl } from '../config/api';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, UserCheck, UserX, Trash2, Search, Filter } from 'lucide-react';
import { apiCall, updateStatus, ApiError, testConnectivityWithFallback, testStatusUpdateEndpoint } from '../utils/apiUtils';

// Interfaces
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

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);
  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'collaborations'>('reports');
  const [processingCollaboration, setProcessingCollaboration] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [hasError, setHasError] = useState(false);

  // Error boundary effect
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('❌ Erreur JavaScript détectée:', error);
      setHasError(true);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('❌ Promise rejetée non gérée:', event.reason);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Test de connectivité API
  useEffect(() => {
    const checkApiConnection = async () => {
      console.log('🔍 Test de connectivité API...');
      
      // Test avec fallback
      const workingUrl = await testConnectivityWithFallback();
      
      if (workingUrl) {
        console.log('📡 Connectivité API: ✅ OK avec', workingUrl);
      } else {
        console.error('📡 Connectivité API: ❌ Échec sur toutes les URLs');
        console.error('🚨 Vérifiez:');
        console.error('- Le backend est-il démarré ?');
        console.error('- Y a-t-il des problèmes de CORS ?');
        console.error('- L\'URL de l\'API est-elle correcte ?');
      }
      
      // Test simple avec notre configuration actuelle
      try {
        const response = await apiCall('/api/health');
        console.log('✅ Test API config actuelle: OK');
      } catch (error) {
        console.error('❌ Test API config actuelle: Échec', error);
      }
    };

    checkApiConnection();
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur de chargement</h1>
          <p className="text-gray-600 mb-4">Une erreur s'est produite lors du chargement de la page.</p>
          <button 
            onClick={() => {
              setHasError(false);
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }

  // Vérifier que l'utilisateur est admin ou super admin
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    console.log('❌ Accès refusé - utilisateur:', user);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h1>
          <p className="text-gray-600">Cette page est réservée aux administrateurs.</p>
        </div>
      </div>
    );
  }

  console.log('✅ Utilisateur autorisé:', user.role);

  // Fetch Signalements
  const fetchReports = async (): Promise<WasteReport[]> => {
    try {
      const response = await apiCall('/api/waste');
      
      // Protection contre les données manquantes
      const reports = response.data?.wasteReports || response.data || [];
      
      // Vérifier que chaque signalement a les données nécessaires
      return reports.map((report: any) => ({
        ...report,
        userId: report.userId || { _id: 'unknown', name: 'Utilisateur supprimé', email: 'N/A' }
      }));
    } catch (error) {
      console.error('❌ Erreur récupération signalements:', error);
      throw error;
    }
  };

  // Fetch Utilisateurs (seulement pour super admin)
  const fetchUsers = async (): Promise<User[]> => {
    try {
      const response = await apiCall('/api/users/manage');
      return response.data || [];
    } catch (error) {
      console.error('❌ Erreur récupération utilisateurs:', error);
      throw error;
    }
  };

  // Fetch Collaborations (seulement pour super admin)
  const fetchCollaborations = async (): Promise<CollaborationRequest[]> => {
    try {
      const response = await apiCall('/api/collaborations');
      return response.data || [];
    } catch (error) {
      console.error('❌ Erreur récupération collaborations:', error);
      throw error;
    }
  };

  // useQuery
  const { data: reports = [], isLoading: isLoadingReports, error: reportsError } = 
    useQuery({ 
      queryKey: ['waste_reports'], 
      queryFn: fetchReports,
      refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
      refetchIntervalInBackground: true // Continuer même si l'onglet n'est pas actif
    });

  const { data: users = [], isLoading: isLoadingUsers, error: usersError } = 
    useQuery({ 
      queryKey: ['users'], 
      queryFn: fetchUsers,
      enabled: user?.role === 'super_admin',
      refetchInterval: 60000, // Rafraîchir toutes les 60 secondes
      refetchIntervalInBackground: true
    });

  const { data: collaborations = [], isLoading: isLoadingCollaborations, error: collaborationsError } = 
    useQuery({ 
      queryKey: ['collaborations'], 
      queryFn: fetchCollaborations,
      enabled: user?.role === 'super_admin',
      refetchInterval: 60000, // Rafraîchir toutes les 60 secondes
      refetchIntervalInBackground: true
    });

  // Fonction de transcription audio
  const transcribeAudio = async (reportId: string) => {
    setIsTranscribing(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/transcription/${reportId}/transcribe`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ language: 'fr' })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Mettre à jour le signalement sélectionné avec la transcription
        if (selectedReport && selectedReport._id === reportId) {
          setSelectedReport({
            ...selectedReport,
            audio: {
              ...selectedReport.audio,
              transcription: data.data.transcription,
              language: data.data.detectedLanguage,
              transcribedAt: data.data.transcribedAt
            }
          });
        }
        
        // Invalider les queries pour rafraîchir les données
        await queryClient.invalidateQueries({ queryKey: ['waste_reports'] });
        
        alert('Transcription réalisée avec succès !');
      } else {
        throw new Error(data.error || 'Erreur lors de la transcription');
      }
      
    } catch (error: any) {
      console.error('❌ Erreur transcription:', error);
      alert(`Erreur lors de la transcription: ${error.message}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Fonction de mise à jour du statut avec diagnostic
  const updateReportStatus = async (reportId: string, newStatus: WasteReport['status']) => {
    if (updatingStatus) {
      alert('Une mise à jour est déjà en cours...');
      return;
    }

    setUpdatingStatus(reportId);
    
    try {
      console.log('🔄 Mise à jour statut:', reportId, newStatus);
      console.log('🌐 URL de base API:', import.meta.env.VITE_API_URL);
      
      // Test de l'endpoint spécifique avant la mise à jour
      console.log('🔍 Test de l\'endpoint de mise à jour...');
      const endpointWorking = await testStatusUpdateEndpoint(reportId);
      console.log('📊 Endpoint accessible:', endpointWorking ? '✅' : '❌');
      
      const response = await updateStatus(`/api/waste/${reportId}/status`, newStatus, reportId);
      
      if (response.success && response.data) {
        // Mettre à jour le signalement sélectionné
        setSelectedReport(response.data);
        
        // Invalider et refetch les queries
        await queryClient.invalidateQueries({ queryKey: ['waste_reports'] });
        
        alert("Statut mis à jour avec succès !");
      } else {
        throw new Error('Réponse API invalide');
      }
      
    } catch (error) {
      console.error('❌ Erreur mise à jour statut:', error);
      
      let errorMessage = 'Erreur inconnue lors de la mise à jour';
      
      if (error instanceof ApiError) {
        errorMessage = error.message;
        
        // Diagnostic spécifique selon le type d'erreur
        if (error.status === 0 || !error.status) {
          errorMessage = 'Problème de connexion réseau ou CORS. Le serveur backend est-il accessible ?';
        } else if (error.status === 401) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else if (error.status === 403) {
          errorMessage = 'Droits insuffisants pour cette action.';
        } else if (error.status >= 500) {
          errorMessage = 'Erreur serveur. Réessayez dans quelques instants.';
        }
      }
      
      // Ajouter des informations de diagnostic
      console.error('🔍 Informations de diagnostic:');
      console.error('- URL API:', import.meta.env.VITE_API_URL);
      console.error('- Token présent:', !!localStorage.getItem('token'));
      console.error('- Report ID:', reportId);
      console.error('- Nouveau statut:', newStatus);
      
      alert(`Échec de la mise à jour du statut: ${errorMessage}`);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Gérer une demande de collaboration
  const handleCollaborationStatus = async (collaborationId: string, status: 'approved' | 'rejected') => {
    if (processingCollaboration) {
      alert('Une opération est déjà en cours...');
      return;
    }

    setProcessingCollaboration(collaborationId);
    
    try {
      console.log('🔄 Mise à jour collaboration:', collaborationId, status);
      
      const response = await updateStatus(`/api/collaborations/${collaborationId}/status`, status, collaborationId);

      if (response.success) {
        // Invalider et refetch les queries
        await queryClient.invalidateQueries({ queryKey: ['collaborations'] });
        
        const message = status === 'approved' 
          ? `✅ Collaboration approuvée ! ${response.message || 'L\'utilisateur a été promu admin.'}`
          : '❌ Collaboration rejetée.';
        alert(message);
      } else {
        throw new Error(response.error || 'Réponse API invalide');
      }
    } catch (error) {
      console.error('❌ Erreur gestion collaboration:', error);
      
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Erreur inconnue lors de la gestion de la collaboration';
      
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setProcessingCollaboration(null);
    }
  };

  // Fonctions utilitaires
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

  // Affichage conditionnel pour les erreurs
  if (isLoadingReports) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Chargement des signalements...</p>
        </div>
      </div>
    );
  }

  if (reportsError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur de chargement</h1>
          <p className="text-gray-600 mb-4">Impossible de charger les signalements.</p>
          <p className="text-sm text-gray-500">{reportsError.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Administration {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </h1>
          <p className="text-gray-600 mt-2">
            {user?.role === 'super_admin' 
              ? 'Gestion des signalements, utilisateurs et collaborations'
              : 'Gestion des signalements'
            }
          </p>
        </div>

        {/* Onglets pour Super Admin */}
        {user?.role === 'super_admin' && (
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
                  📋 Signalements ({reports.length})
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'users'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Users className="inline mr-2" size={16} />
                  Utilisateurs ({users.length})
                </button>
                <button
                  onClick={() => setActiveTab('collaborations')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'collaborations'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  🤝 Collaborations ({collaborations.length})
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Message pour admin simple */}
        {user?.role === 'admin' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              <strong>Mode Admin Simple:</strong> Vous avez accès uniquement à la gestion des signalements. 
              Pour accéder à la gestion des utilisateurs et collaborations, contactez le super administrateur.
            </p>
          </div>
        )}

        {/* Contenu des onglets */}
        {(activeTab === 'reports' || user?.role !== 'super_admin') && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold">Signalements ({reports.length})</h2>
                {isLoadingReports && (
                  <div className="ml-3 flex items-center text-sm text-blue-600">
                    <svg className="animate-spin w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                    </svg>
                    Mise à jour...
                  </div>
                )}
              </div>
              <button
                onClick={() => queryClient.invalidateQueries({ queryKey: ['waste_reports'] })}
                className="flex items-center px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                disabled={isLoadingReports}
              >
                <svg className={`w-4 h-4 mr-2 ${isLoadingReports ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualiser
              </button>
            </div>

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
                          {report.userId?.name || 'Utilisateur supprimé'}
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
                            <div className="relative group">
                              <img 
                                src={buildImageUrl(report.images.thumbnail.url)} 
                                alt="Aperçu du signalement" 
                                className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-gray-200 shadow-sm"
                                onClick={() => setSelectedReport(report)}
                                onError={(e) => {
                                  console.error('Erreur chargement image thumbnail:', report.images?.thumbnail?.url);
                                  (e.target as HTMLImageElement).src = buildApiUrl('/public/placeholder-image.svg');
                                }}
                                loading="lazy"
                              />
                              {/* Overlay au hover */}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                  👁️ Voir
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                              <span className="text-gray-400 text-xs">📷</span>
                            </div>
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
          </div>
        )}

        {/* Onglet Utilisateurs */}
        {activeTab === 'users' && user?.role === 'super_admin' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Gestion des utilisateurs ({users.length})</h2>
            </div>

            <div className="overflow-x-auto">
              {isLoadingUsers ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p>Chargement des utilisateurs...</p>
                </div>
              ) : usersError ? (
                <div className="p-8 text-center">
                  <p className="text-red-600 mb-2">Erreur de chargement des utilisateurs</p>
                  <p className="text-sm text-gray-500">{usersError.message}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Réessayer
                  </button>
                </div>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Onglet Collaborations */}
        {activeTab === 'collaborations' && user?.role === 'super_admin' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Demandes de collaboration ({collaborations.length})</h2>
            </div>

            <div className="overflow-x-auto">
              {isLoadingCollaborations ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p>Chargement des collaborations...</p>
                </div>
              ) : collaborationsError ? (
                <div className="p-8 text-center">
                  <p className="text-red-600 mb-2">Erreur de chargement des collaborations</p>
                  <p className="text-sm text-gray-500">{collaborationsError.message}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Réessayer
                  </button>
                </div>
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
                                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                              >
                                ✅ Approuver
                              </button>
                              <button
                                onClick={() => handleCollaborationStatus(collab._id, 'rejected')}
                                disabled={processingCollaboration === collab._id}
                                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                              >
                                ❌ Rejeter
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

        {/* Modale des signalements */}
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
                      <p><strong>Nom:</strong> {selectedReport.userId?.name || 'Utilisateur supprimé'}</p>
                      <p><strong>Email:</strong> {selectedReport.userId?.email || 'Email non disponible'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Localisation</h4>
                    <div className="space-y-2">
                      <p><strong>Latitude:</strong> {selectedReport.location.lat}</p>
                      <p><strong>Longitude:</strong> {selectedReport.location.lng}</p>
                      <p><strong>Coordonnées:</strong> {selectedReport.location.lat.toFixed(6)}, {selectedReport.location.lng.toFixed(6)}</p>
                      
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
                        disabled={updatingStatus === selectedReport._id}
                        className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingStatus === selectedReport._id ? '⏳' : '⏳'} Marquer en attente
                      </button>
                      <button 
                        onClick={() => updateReportStatus(selectedReport._id, 'collected')} 
                        disabled={updatingStatus === selectedReport._id}
                        className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingStatus === selectedReport._id ? '⏳' : '✅'} Marquer collecté
                      </button>
                      <button 
                        onClick={() => updateReportStatus(selectedReport._id, 'not_collected')} 
                        disabled={updatingStatus === selectedReport._id}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingStatus === selectedReport._id ? '⏳' : '❌'} Marquer non collecté
                      </button>
                    </div>
                  </div>
                </div>

                {/* Image */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    📷 Image du signalement
                  </h4>
                  {selectedReport.images?.original?.url ? (
                    <div className="space-y-3">
                      <div className="relative group">
                        <img 
                          src={buildImageUrl(selectedReport.images.original.url)} 
                          alt="Signalement complet" 
                          className="w-full h-80 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-95 transition-opacity shadow-lg"
                          onClick={() => {
                            window.open(buildImageUrl(selectedReport.images.original.url), '_blank');
                          }}
                          onError={(e) => {
                            console.error('Erreur chargement image originale:', selectedReport.images?.original?.url);
                            (e.target as HTMLImageElement).src = buildApiUrl('/public/placeholder-image.svg');
                          }}
                          loading="lazy"
                        />
                        {/* Overlay avec icône d'agrandissement */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-90 rounded-full p-3">
                            <span className="text-gray-800 text-lg">🔍</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Informations sur l'image */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Taille:</span>
                            <span className="ml-2 text-gray-800">
                              {selectedReport.images.original.dimensions ? 
                                `${selectedReport.images.original.dimensions.width} × ${selectedReport.images.original.dimensions.height}px` : 
                                'Non disponible'
                              }
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Poids:</span>
                            <span className="ml-2 text-gray-800">
                              {selectedReport.images.original.size ? 
                                `${(selectedReport.images.original.size / 1024 / 1024).toFixed(2)} MB` : 
                                'Non disponible'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-blue-600 italic flex items-center gap-2">
                        💡 Cliquez sur l'image pour l'ouvrir en plein écran
                      </p>
                      
                      {/* Miniatures des autres tailles */}
                      {(selectedReport.images.medium?.url || selectedReport.images.thumbnail?.url) && (
                        <div className="flex gap-2 mt-3">
                          <span className="text-sm font-medium text-gray-600 self-center">Autres tailles:</span>
                          {selectedReport.images.medium?.url && (
                            <img 
                              src={buildImageUrl(selectedReport.images.medium.url)} 
                              alt="Taille moyenne" 
                              className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80"
                              onClick={() => window.open(buildImageUrl(selectedReport.images.medium.url), '_blank')}
                              title="Taille moyenne - Cliquer pour ouvrir"
                            />
                          )}
                          {selectedReport.images.thumbnail?.url && (
                            <img 
                              src={buildImageUrl(selectedReport.images.thumbnail.url)} 
                              alt="Miniature" 
                              className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80"
                              onClick={() => window.open(buildImageUrl(selectedReport.images.thumbnail.url), '_blank')}
                              title="Miniature - Cliquer pour ouvrir"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-80 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
                      <div className="text-6xl text-gray-300 mb-4">📷</div>
                      <p className="text-gray-500 font-medium">Aucune image disponible</p>
                      <p className="text-gray-400 text-sm mt-1">Ce signalement n'a pas d'image associée</p>
                    </div>
                  )}
                </div>

                {/* Audio */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    🎵 Enregistrement vocal
                  </h4>
                  {selectedReport.audio?.url ? (
                    <div className="space-y-3">
                      {/* Lecteur audio principal */}
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xl">🎤</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">Message vocal</p>
                              <p className="text-sm text-gray-600">
                                Durée: {selectedReport.audio.duration}s • 
                                Taille: {selectedReport.audio.size ? `${(selectedReport.audio.size / 1024).toFixed(1)} KB` : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Lecteur audio HTML5 */}
                        <audio 
                          controls 
                          className="w-full"
                          preload="metadata"
                        >
                          <source src={selectedReport.audio.url} type={selectedReport.audio.mimeType || 'audio/mp3'} />
                          Votre navigateur ne supporte pas la lecture audio.
                        </audio>
                        
                        {/* Bouton de téléchargement */}
                        <div className="mt-3 flex justify-end">
                          <a
                            href={selectedReport.audio.url}
                            download={`audio_signalement_${selectedReport._id}.mp3`}
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                          >
                            📥 Télécharger l'audio
                          </a>
                        </div>
                      </div>

                      {/* Section transcription */}
                      {selectedReport.audio.transcription ? (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                            📝 Transcription automatique
                            <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded">
                              {selectedReport.audio.language?.toUpperCase() || 'FR'}
                            </span>
                          </h5>
                          <p className="text-blue-900 italic">"{selectedReport.audio.transcription}"</p>
                          <div className="mt-2 text-xs text-blue-600">
                            Transcrit le {new Date(selectedReport.audio.transcribedAt).toLocaleString('fr-FR')}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-yellow-800 mb-1">Transcription non disponible</h5>
                              <p className="text-sm text-yellow-700">
                                Cliquez sur "Transcrire" pour convertir l'audio en texte
                              </p>
                            </div>
                            <button
                              onClick={() => transcribeAudio(selectedReport._id)}
                              disabled={isTranscribing}
                              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              {isTranscribing ? '⏳ Transcription...' : '📝 Transcrire'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
                      <div className="text-4xl text-gray-300 mb-2">🎤</div>
                      <p className="text-gray-500 font-medium">Aucun enregistrement vocal</p>
                      <p className="text-gray-400 text-sm mt-1">Ce signalement n'a pas d'audio associé</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;