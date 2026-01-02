import React from 'react';
import { HelpCircle, User, Shield, Lightbulb, ArrowRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import NavigationGuide from '../components/help/NavigationGuide';
import RoleBadge from '../components/common/RoleBadge';

const HelpPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Centre d'Aide</h1>
          <p className="text-gray-600">Découvrez comment utiliser EcoPulse selon votre rôle</p>
          
          {/* Lien vers la collaboration */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center space-x-3">
              <Users className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Collaborations Communautaires</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Participez aux initiatives locales et proposez vos propres projets environnementaux
                </p>
                <Link 
                  to="/collaboration"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🤝 Accéder aux Collaborations
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Guide de navigation */}
        <NavigationGuide className="mb-8" />

        {/* FAQ par rôle */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* FAQ Citoyen */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <User className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Guide Citoyen</h2>
              <RoleBadge role="citizen" size="sm" />
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Comment signaler un déchet ?</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4 text-green-500" />
                    <span>Cliquez sur "Signaler" dans la navigation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4 text-green-500" />
                    <span>Remplissez le formulaire avec les détails</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4 text-green-500" />
                    <span>Ajoutez une photo (optionnel)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4 text-green-500" />
                    <span>Confirmez la localisation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4 text-green-500" />
                    <span>Soumettez le signalement</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Comment participer à la collaboration ?</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4 text-green-500" />
                    <span>Accédez à la section "Collaboration"</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4 text-green-500" />
                    <span>Rejoignez des initiatives locales</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4 text-green-500" />
                    <span>Proposez vos propres projets</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-green-900 mb-1">Conseil</h4>
                    <p className="text-sm text-green-700">
                      Plus vous signalez de déchets, plus vous gagnez de points et débloquez de badges !
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Admin */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">Guide Administrateur</h2>
              <RoleBadge role="admin" size="sm" />
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Comment gérer les signalements ?</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4 text-red-500" />
                    <span>Accédez au tableau de bord admin</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4 text-red-500" />
                    <span>Consultez la liste des signalements</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4 text-red-500" />
                    <span>Modifiez le statut (en cours, collecté, résolu)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4 text-red-500" />
                    <span>Ajoutez des commentaires si nécessaire</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Comment utiliser les outils d'analyse ?</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4 text-red-500" />
                    <span>Consultez les statistiques détaillées</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4 text-red-500" />
                    <span>Utilisez la recherche avancée</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4 text-red-500" />
                    <span>Visualisez les données sur la carte</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4 text-red-500" />
                    <span>Suivez les classements et badges</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-900 mb-1">Conseil</h4>
                    <p className="text-sm text-red-700">
                      Utilisez les filtres de recherche pour analyser les tendances par zone géographique ou type de déchet.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fonctionnalités communes */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Fonctionnalités Communes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Profil Utilisateur</h3>
              <p className="text-sm text-gray-600">
                Gérez vos informations personnelles, consultez vos statistiques et suivez vos accomplissements.
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <HelpCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Notifications</h3>
              <p className="text-sm text-gray-600">
                Recevez des alertes en temps réel sur les nouveaux signalements, badges obtenus et mises à jour.
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lightbulb className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Support</h3>
              <p className="text-sm text-gray-600">
                Besoin d'aide ? Contactez notre équipe support ou consultez la documentation complète.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;