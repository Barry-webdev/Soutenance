import React from 'react';
import { User, Shield, Users, Sparkles } from 'lucide-react';

interface WelcomeMessageProps {
  user: {
    name: string;
    role: 'citizen' | 'admin' | 'partner';
    points?: number;
  };
  className?: string;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ user, className = '' }) => {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          icon: Shield,
          title: 'Tableau de Bord Administrateur',
          message: 'Gérez efficacement les signalements et analysez les données de la communauté.',
          bgColor: 'bg-gradient-to-r from-red-500 to-red-600',
          accentColor: 'text-red-100'
        };
      case 'partner':
        return {
          icon: Users,
          title: 'Espace Partenaire',
          message: 'Collaborez avec la communauté et suivez les initiatives dans votre zone.',
          bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
          accentColor: 'text-blue-100'
        };
      case 'citizen':
      default:
        return {
          icon: User,
          title: 'Bienvenue dans EcoPulse',
          message: 'Contribuez à un environnement plus propre en signalant les déchets autour de vous.',
          bgColor: 'bg-gradient-to-r from-green-500 to-green-600',
          accentColor: 'text-green-100'
        };
    }
  };

  const config = getRoleConfig(user.role);
  const IconComponent = config.icon;
  const firstName = user.name.split(' ')[0];

  return (
    <div className={`${config.bgColor} rounded-lg p-6 text-white ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white bg-opacity-20 rounded-full">
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              Bonjour {firstName} ! 👋
            </h2>
            <h3 className="text-lg font-medium opacity-90">
              {config.title}
            </h3>
            <p className={`text-sm ${config.accentColor} mt-1`}>
              {config.message}
            </p>
          </div>
        </div>
        
        {user.points !== undefined && (
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-1">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-2xl font-bold">{user.points}</span>
            </div>
            <p className={`text-sm ${config.accentColor}`}>points</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeMessage;