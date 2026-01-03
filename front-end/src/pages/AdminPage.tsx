import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../config/api';
import { Users, UserCheck, UserX, Shield, Trash2, Search, Filter } from 'lucide-react';
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

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'collaborations'>('users');
  
  // États pour les utilisateurs
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userFilter, setUserFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  
  // États pour les collaborations
  const [collaborations, setCollaborations] = useState<CollaborationRequest[]>([]);
  const [collaborationsLoading, setCollaborationsLoading] = useState(true);
  const [processingCollaboration, setProcessingCollaboration] = useState<string | null>(null);

  // Vérifier que l'utilisateur est super admin
  if (user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h1>
          <p className="text-gray-600">Cette page est réservée aux super administrateurs.</p>
        </div>
      </div>
    );
  }

  // Charger les utilisateurs
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Debug API temporaire */}
      <ApiUrlDebug />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administration Super Admin</h1>
          <p className="text-gray-600 mt-2">Gestion des utilisateurs et des collaborations</p>
        </div>

        {/* Onglets */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
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
            </nav>
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'users' && (
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

        {activeTab === 'collaborations' && (
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