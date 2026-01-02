import React from 'react';
import { Trophy, Star } from 'lucide-react';

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

interface UserLevelBadgeProps {
  userLevel: UserLevel;
  totalPoints: number;
  className?: string;
}

const UserLevelBadge: React.FC<UserLevelBadgeProps> = ({ 
  userLevel, 
  totalPoints, 
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: userLevel.current.color + '20', color: userLevel.current.color }}
          >
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              Niveau {userLevel.current.level}
            </div>
            <div className="text-sm text-gray-600">
              {userLevel.current.name}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">
            {totalPoints.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">points</div>
        </div>
      </div>

      {userLevel.next && (
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progrès vers {userLevel.next.name}</span>
            <span>{userLevel.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${userLevel.progress}%`,
                backgroundColor: userLevel.current.color
              }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 text-center">
            {userLevel.pointsToNext} points restants
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLevelBadge;