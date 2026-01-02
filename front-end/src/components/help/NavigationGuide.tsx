import React from 'react';
import { Shield, User, Home, MapPin, BarChart3, Trophy, Medal, Search, Users, AlertTriangle } from 'lucide-react';

interface NavigationGuideProps {
  className?: string;
}

const NavigationGuide: React.FC<NavigationGuideProps> = ({ className = '' }) => {
  const citizenFeatures = [
    { icon: Home, label: 'Accueil', description: 'Page d\'accueil avec aperçu général' },
    { icon: Users, label: 'Collaboration', description: 'Participer aux initiatives communautaires' },
    { icon: AlertTriangle, label: 'Signaler', description: 'Créer des signalements de déchets' }
  ];

  const adminFeatures = [
    { icon: Home, label: 'Accueil', description: 'Page d\'accueil avec aperçu général' },
    { icon: MapPin, label: 'Carte', description: 'Visualisation géographique des signalements' },
    { icon: BarChart3, label: 'Statistiques', description: 'Analyses et rapports détaillés' },
    { icon: Trophy, label: 'Badges', description: 'Gestion du système de gamification' },
    { icon: Medal, label: 'Classement', description: 'Classements des utilisateurs' },
    { icon: Search, label: 'Recherche', description: 'Recherche avancée dans les données' },
    { icon: Users, label: 'Collaboration', description: 'Gestion des partenariats' }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Guide de Navigation</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Navigation Citoyen */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-5 h-5 text-green-600" />
            <h4 className="text-md font-medium text-gray-900">Interface Citoyen</h4>
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              Simplifiée
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Interface épurée pour une expérience utilisateur optimale, centrée sur l'essentiel.
          </p>
          <div className="space-y-3">
            {citizenFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <feature.icon className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{feature.label}</div>
                  <div className="text-xs text-gray-600">{feature.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Admin */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-red-600" />
            <h4 className="text-md font-medium text-gray-900">Interface Administrateur</h4>
            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
              Complète
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Accès complet à tous les outils de gestion et d'analyse pour une administration efficace.
          </p>
          <div className="space-y-2">
            {adminFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-2 bg-red-50 rounded-lg">
                <feature.icon className="w-4 h-4 text-red-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{feature.label}</div>
                  <div className="text-xs text-gray-600">{feature.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
          <div>
            <h5 className="text-sm font-medium text-blue-900 mb-1">Pourquoi cette différenciation ?</h5>
            <p className="text-sm text-blue-700">
              Cette approche permet d'offrir une expérience utilisateur adaptée à chaque rôle : 
              interface simple et intuitive pour les citoyens, outils complets pour les administrateurs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationGuide;