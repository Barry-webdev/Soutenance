import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Target, Calendar, Users } from 'lucide-react';

interface LeaderboardUser {
  _id: string;
  name: string;
  email: string;
  points: number;
  avatar?: string;
  value: number;
}

const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<'points' | 'reports'>('points');
  const [activePeriod, setActivePeriod] = useState<'all_time' | 'monthly' | 'weekly'>('all_time');

  useEffect(() => {
    fetchLeaderboard();
  }, [activeType, activePeriod]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/gamification/leaderboard?type=${activeType}&period=${activePeriod}&limit=20`
      );
      
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du classement:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-gray-600">{rank}</span>
          </div>
        );
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'weekly': return 'Cette semaine';
      case 'monthly': return 'Ce mois';
      case 'all_time': return 'Tous les temps';
      default: return 'Tous les temps';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'points': return 'Points';
      case 'reports': return 'Signalements';
      default: return 'Points';
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Classement</h1>
          <p className="text-gray-600">Découvrez les meilleurs contributeurs de la communauté</p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Type de classement */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de classement
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveType('points')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeType === 'points'
                      ? 'bg-green-100 text-green-700 border-2 border-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Points
                </button>
                <button
                  onClick={() => setActiveType('reports')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeType === 'reports'
                      ? 'bg-green-100 text-green-700 border-2 border-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Signalements
                </button>
              </div>
            </div>

            {/* Période */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActivePeriod('weekly')}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activePeriod === 'weekly'
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Semaine
                </button>
                <button
                  onClick={() => setActivePeriod('monthly')}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activePeriod === 'monthly'
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Mois
                </button>
                <button
                  onClick={() => setActivePeriod('all_time')}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activePeriod === 'all_time'
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tout temps
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Podium (Top 3) */}
        {leaderboard.length >= 3 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              🏆 Podium - {getTypeLabel(activeType)} ({getPeriodLabel(activePeriod)})
            </h2>
            <div className="flex justify-center items-end space-x-4">
              {/* 2ème place */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 w-32">
                  <div className="font-semibold text-gray-900 text-sm truncate">
                    {leaderboard[1]?.name}
                  </div>
                  <div className="text-lg font-bold text-gray-700">
                    {leaderboard[1]?.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {activeType === 'points' ? 'points' : 'signalements'}
                  </div>
                </div>
              </div>

              {/* 1ère place */}
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-3">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 w-36">
                  <div className="font-semibold text-gray-900 truncate">
                    {leaderboard[0]?.name}
                  </div>
                  <div className="text-xl font-bold text-yellow-700">
                    {leaderboard[0]?.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">
                    {activeType === 'points' ? 'points' : 'signalements'}
                  </div>
                </div>
              </div>

              {/* 3ème place */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 w-32">
                  <div className="font-semibold text-gray-900 text-sm truncate">
                    {leaderboard[2]?.name}
                  </div>
                  <div className="text-lg font-bold text-amber-700">
                    {leaderboard[2]?.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {activeType === 'points' ? 'points' : 'signalements'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Classement complet */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Classement complet - {getTypeLabel(activeType)} ({getPeriodLabel(activePeriod)})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {leaderboard.map((user, index) => (
              <div
                key={user._id}
                className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                  index < 3 ? getRankBadge(index + 1).includes('gradient') ? 'bg-gradient-to-r from-opacity-10' : '' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getRankIcon(index + 1)}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-700">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {user.value.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {activeType === 'points' ? 'points' : 'signalements'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {leaderboard.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
              <p className="text-gray-600">
                Aucun utilisateur n'a encore de {activeType === 'points' ? 'points' : 'signalements'} pour cette période.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;