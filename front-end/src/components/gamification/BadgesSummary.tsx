import React from 'react';
import { Trophy, Award, Star, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

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

interface BadgesSummaryProps {
  recentBadges: UserBadge[];
  totalBadges: number;
  completedBadges: number;
  className?: string;
}

const BadgesSummary: React.FC<BadgesSummaryProps> = ({
  recentBadges,
  totalBadges,
  completedBadges,
  className = ''
}) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Mes Badges</h3>
        <Link 
          to="/badges"
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          Voir tout →
        </Link>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-700">{completedBadges}</div>
          <div className="text-sm text-green-600">Obtenus</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-700">{totalBadges}</div>
          <div className="text-sm text-gray-600">Disponibles</div>
        </div>
      </div>

      {/* Badges récents */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Badges récents</h4>
        {recentBadges.length > 0 ? (
          <div className="space-y-3">
            {recentBadges.slice(0, 3).map((userBadge) => (
              <div
                key={userBadge._id}
                className={`flex items-center space-x-3 p-3 rounded-lg border ${getRarityColor(userBadge.badgeId.rarity)}`}
              >
                <div className="text-2xl">{userBadge.badgeId.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {userBadge.badgeId.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    +{userBadge.badgeId.points} points
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(userBadge.earnedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Aucun badge obtenu</p>
            <p className="text-xs text-gray-400">Commencez à signaler pour débloquer des badges !</p>
          </div>
        )}
      </div>

      {recentBadges.length > 3 && (
        <div className="mt-4 text-center">
          <Link 
            to="/badges"
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Voir {recentBadges.length - 3} badges de plus
          </Link>
        </div>
      )}
    </div>
  );
};

export default BadgesSummary;