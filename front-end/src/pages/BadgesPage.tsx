import React, { useState, useEffect } from 'react';
import { Trophy, Star, Award, Target, Users, TrendingUp } from 'lucide-react';

interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  rarity: string;
  points: number;
}

interface UserBadge {
  _id: string;
  badgeId: Badge;
  earnedAt: string;
  progress: {
    current: number;
    target: number;
    percentage: number;
  };
  isCompleted: boolean;
}

interface UserStats {
  totalReports: number;
  collectedReports: number;
  reportsWithImages: number;
  uniqueLocations: number;
  totalPoints: number;
}

interface Level {
  level: number;
  name: string;
  color: string;
  minPoints: number;
}

interface UserLevel {
  current: Level;
  next: Level | null;
  progress: number;
  pointsToNext: number;
}

const BadgesPage: React.FC = () => {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'earned' | 'available' | 'stats'>('earned');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [userBadgesRes, allBadgesRes, profileRes] = await Promise.all([
        fetch('/api/gamification/my-badges', { headers }),
        fetch('/api/gamification/badges', { headers }),
        fetch('/api/gamification/my-profile', { headers })
      ]);

      if (userBadgesRes.ok) {
        const userBadgesData = await userBadgesRes.json();
        setUserBadges(userBadgesData.data.badges);
      }

      if (allBadgesRes.ok) {
        const allBadgesData = await allBadgesRes.json();
        setAllBadges(allBadgesData.data);
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUserStats(profileData.data.stats);
        setUserLevel(profileData.data.level);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'reports': return <Target className="w-4 h-4" />;
      case 'collection': return <Award className="w-4 h-4" />;
      case 'achievement': return <Trophy className="w-4 h-4" />;
      case 'special': return <Star className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

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
        {/* Header avec niveau utilisateur */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Badges</h1>
              <p className="text-gray-600">Suivez vos accomplissements et débloquez de nouveaux badges</p>
            </div>
            {userLevel && (
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: userLevel.current.color }}>
                  Niveau {userLevel.current.level}
                </div>
                <div className="text-lg font-medium text-gray-700">{userLevel.current.name}</div>
                <div className="text-sm text-gray-500">{userStats?.totalPoints} points</div>
                {userLevel.next && (
                  <div className="mt-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${userLevel.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {userLevel.pointsToNext} points pour {userLevel.next.name}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Statistiques rapides */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Target className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{userStats.totalReports}</div>
                  <div className="text-sm text-gray-600">Signalements</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Award className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{userStats.collectedReports}</div>
                  <div className="text-sm text-gray-600">Collectés</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Star className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{userStats.reportsWithImages}</div>
                  <div className="text-sm text-gray-600">Avec photos</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{userStats.uniqueLocations}</div>
                  <div className="text-sm text-gray-600">Zones explorées</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('earned')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'earned'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Badges obtenus ({userBadges.filter(b => b.isCompleted).length})
              </button>
              <button
                onClick={() => setActiveTab('available')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'available'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Badges disponibles ({allBadges.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'earned' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userBadges.filter(badge => badge.isCompleted).map((userBadge) => (
                  <div
                    key={userBadge._id}
                    className={`p-6 rounded-lg border-2 ${getRarityColor(userBadge.badgeId.rarity)}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">{userBadge.badgeId.icon}</div>
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(userBadge.badgeId.category)}
                        <span className="text-xs font-medium text-gray-600 uppercase">
                          {userBadge.badgeId.rarity}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {userBadge.badgeId.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {userBadge.badgeId.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600">
                        +{userBadge.badgeId.points} points
                      </span>
                      <span className="text-xs text-gray-500">
                        Obtenu le {new Date(userBadge.earnedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                {userBadges.filter(badge => badge.isCompleted).length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun badge obtenu</h3>
                    <p className="text-gray-600">Commencez à signaler des déchets pour débloquer vos premiers badges !</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'available' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allBadges.map((badge) => {
                  const userBadge = userBadges.find(ub => ub.badgeId._id === badge._id);
                  const isEarned = userBadge?.isCompleted || false;
                  const progress = userBadge?.progress;

                  return (
                    <div
                      key={badge._id}
                      className={`p-6 rounded-lg border-2 ${
                        isEarned 
                          ? getRarityColor(badge.rarity)
                          : 'border-gray-200 bg-gray-50 opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`text-3xl ${isEarned ? '' : 'grayscale'}`}>
                          {badge.icon}
                        </div>
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(badge.category)}
                          <span className="text-xs font-medium text-gray-600 uppercase">
                            {badge.rarity}
                          </span>
                        </div>
                      </div>
                      <h3 className={`text-lg font-semibold mb-2 ${
                        isEarned ? 'text-gray-900' : 'text-gray-600'
                      }`}>
                        {badge.name}
                      </h3>
                      <p className={`text-sm mb-4 ${
                        isEarned ? 'text-gray-600' : 'text-gray-500'
                      }`}>
                        {badge.description}
                      </p>
                      
                      {progress && !isEarned && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progrès</span>
                            <span>{progress.current}/{progress.target}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${
                          isEarned ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          +{badge.points} points
                        </span>
                        {isEarned && (
                          <span className="text-xs text-green-600 font-medium">
                            ✓ Obtenu
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgesPage;