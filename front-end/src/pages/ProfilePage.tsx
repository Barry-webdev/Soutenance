import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import UserLevelBadge from '../components/gamification/UserLevelBadge';
import BadgesSummary from '../components/gamification/BadgesSummary';
import RoleBadge from '../components/common/RoleBadge';
import { User, Mail, Calendar, Trophy, Target, Award, Shield, Info } from 'lucide-react';


const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [gamificationData, setGamificationData] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const [notificationsRes, profileRes, badgesRes] = await Promise.all([
          fetch('/api/notifications', { headers }),
          fetch('/api/gamification/my-profile', { headers }),
          fetch('/api/gamification/my-badges?completedOnly=true&limit=5', { headers })
        ]);

        if (notificationsRes.ok) {
          const notifData = await notificationsRes.json();
          setNotifications(notifData);
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setGamificationData(profileData.data);
          setUserStats(profileData.data.stats);
        }

      } catch (error) {
        console.error('Erreur de récupération des données', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
          <p className="text-gray-600">Gérez vos informations et suivez vos accomplissements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Informations utilisateur */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations personnelles</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">Nom</div>
                      <div className="text-gray-900">{user.name}</div>
                    </div>
                  </div>
                  <RoleBadge role={user.role} />
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Email</div>
                    <div className="text-gray-900">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Membre depuis</div>
                    <div className="text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Information sur les privilèges selon le rôle */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">
                      Privilèges de votre rôle
                    </h4>
                    {user.role === 'citizen' ? (
                      <p className="text-sm text-blue-700">
                        En tant que <strong>citoyen</strong>, vous avez accès à une interface simplifiée avec les fonctionnalités essentielles : 
                        signalement de déchets et collaboration communautaire.
                      </p>
                    ) : user.role === 'admin' ? (
                      <p className="text-sm text-blue-700">
                        En tant qu'<strong>administrateur</strong>, vous avez accès à toutes les fonctionnalités de gestion : 
                        carte, statistiques, badges, classements, recherche avancée et outils d'administration.
                      </p>
                    ) : (
                      <p className="text-sm text-blue-700">
                        En tant que <strong>partenaire</strong>, vous avez accès aux fonctionnalités de collaboration 
                        et de suivi des signalements dans votre zone d'intervention.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            {userStats && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Mes Statistiques</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-700">{userStats.totalReports}</div>
                    <div className="text-sm text-green-600">Signalements</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-700">{userStats.collectedReports}</div>
                    <div className="text-sm text-blue-600">Collectés</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-700">{userStats.totalPoints}</div>
                    <div className="text-sm text-purple-600">Points</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="w-8 h-8 text-orange-600 mx-auto mb-2 flex items-center justify-center text-lg">🗺️</div>
                    <div className="text-2xl font-bold text-orange-700">{userStats.uniqueLocations}</div>
                    <div className="text-sm text-orange-600">Zones</div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">🔔 Notifications récentes</h2>
              {notifications.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Aucune nouvelle notification.</p>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notif: any) => (
                    <div key={notif.id} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-800">
                        <strong>{notif.wasteType}</strong> signalé à {notif.location}.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Niveau utilisateur */}
            {gamificationData?.level && (
              <UserLevelBadge 
                userLevel={gamificationData.level}
                totalPoints={userStats?.totalPoints || 0}
              />
            )}

            {/* Badges récents */}
            {gamificationData?.recentBadges && (
              <BadgesSummary
                recentBadges={gamificationData.recentBadges}
                totalBadges={20} // À récupérer depuis l'API
                completedBadges={gamificationData.recentBadges.length}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
