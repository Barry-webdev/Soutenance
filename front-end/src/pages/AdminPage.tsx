import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../config/api';
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

        {/* Test simple d'abord */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test AdminPage</h2>
          <p>Utilisateur connecté : {user?.name} ({user?.role})</p>
          <p>Nombre de signalements : {reports.length}</p>
          <p>Chargement : {reportsLoading ? 'Oui' : 'Non'}</p>
          
          {reports.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium">Premier signalement :</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-2">
                {JSON.stringify(reports[0], null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;