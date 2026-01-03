// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { ArrowRight, MapPin, BarChart2, Award, Trash2 } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';
// import MapView from '../components/map/MapView';

// const HomePage: React.FC = () => {
//   const { isAuthenticated } = useAuth();
//   const [stats, setStats] = useState<any>(null);

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const response = await fetch('http://localhost:4000/api/dashboard-stats');
//         const data = await response.json();
//         setStats(data);
//       } catch (error) {
//         console.error("❌ Erreur de chargement des statistiques :", error);
//       }
//     };
//     fetchStats();
//   }, []);

//   return (
//     <div className="max-w-7xl mx-auto px-4">

//       {/* Hero Section */}
//       {/* ... [inchangé] */}

//       {/* Features Section */}
//       {/* ... [inchangé] */}

//       {/* Map Preview Section */}
//       {/* ... [inchangé] */}

//       {/* Statistics Section */}
//       <section className="py-10 mb-10">
//         <h2 className="text-2xl font-bold mb-6">Statistiques</h2>
//         <div className="card p-6">
//           <h3 className="text-lg font-semibold mb-2">Impact collectif</h3>
//           <p className="text-gray-600 mb-4">
//             Ensemble, nous faisons la différence pour la propreté de Pita.
//           </p>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             {[
//               { value: stats?.signalements ?? '...', label: 'Signalements' },
//               { value: stats?.resolus ?? '...', label: 'Problèmes résolus' },
//               { value: stats?.utilisateurs ?? '...', label: 'Utilisateurs actifs' },
//               { value: stats?.quartiers ?? '...', label: 'Quartiers couverts' },
//             ].map((stat, index) => (
//               <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
//                 <p className="text-2xl font-bold text-green-700">{stat.value}</p>
//                 <p className="text-sm text-gray-600">{stat.label}</p>
//               </div>
//             ))}
//           </div>
//           <div className="mt-4 text-center">
//             <Link to="/statistics" className="text-blue-700 hover:text-blue-800 font-medium inline-flex items-center">
//               Voir toutes les statistiques
//               <ArrowRight size={16} className="ml-1" />
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Call to Action */}
//       {/* ... [inchangé] */}
      
//     </div>
//   );
// };

// export default HomePage;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, BarChart2, Award, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../config/api';
import prefectureImage from '../assets/images/prefecture.jpg';
import MapView from '../components/map/MapView';
import WelcomeMessage from '../components/common/WelcomeMessage';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(buildApiUrl('/api/stats/dashboard'), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data.data);
        } else {
          console.warn('⚠️ Impossible de charger les statistiques');
        }
      } catch (error) {
        console.error("❌ Erreur de chargement des statistiques :", error);
        setError('Erreur de chargement des statistiques');
      }
    };
    
    fetchStats();
  }, []);

  // Gestion d'erreur pour éviter que la page disparaisse
  if (error) {
    console.warn('⚠️ Erreur sur HomePage:', error);
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">

        {/* Message de bienvenue personnalisé pour utilisateurs connectés */}
        {isAuthenticated && user && (
          <section className="py-4 sm:py-6 mb-4 sm:mb-6">
            <WelcomeMessage 
              user={{
                name: user.name || 'Utilisateur',
                role: user.role || 'citizen',
                points: user.points || 0
              }}
            />
          </section>
        )}

        {/* Hero Section */}
        <section className="py-6 sm:py-8 lg:py-10 mb-6 sm:mb-8 lg:mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            <div className="order-2 lg:order-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                Ensemble, gardons Pita propre et saine
              </h1>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                Notre application permet aux citoyens de signaler les déchets, aux autorités de les localiser, et aux collecteurs d'optimiser leurs parcours.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {isAuthenticated ? (
                  <Link
                    to="/report"
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center transition-colors touch-manipulation"
                  >
                    <Trash2 size={18} className="mr-2" />
                    Signaler un déchet
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center transition-colors touch-manipulation"
                  >
                    Commencer maintenant
                    <ArrowRight size={18} className="ml-2" />
                  </Link>
                )}
                <Link
                  to="/map"
                  className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center border border-gray-300 transition-colors touch-manipulation"
                >
                  <MapPin size={18} className="mr-2" />
                  Voir la carte
                </Link>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="bg-gray-200 rounded-lg overflow-hidden h-48 sm:h-64 lg:h-80 xl:h-96">
                <img
                  src={prefectureImage}
                  alt="Illustration Waste Management"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.warn('⚠️ Erreur chargement image prefecture');
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-6 sm:py-8 lg:py-10 mb-6 sm:mb-8 lg:mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 lg:mb-10">Comment ça fonctionne</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                icon: <Trash2 size={24} />,
                title: 'Signalez',
                description: 'Prenez une photo des déchets, décrivez-les et partagez votre localisation pour les signaler.',
                bg: 'bg-green-100 text-green-700',
              },
              {
                icon: <MapPin size={24} />,
                title: 'Localisez',
                description: 'Visualisez tous les signalements sur une carte interactive pour voir les zones à problèmes.',
                bg: 'bg-blue-100 text-blue-700',
              },
              {
                icon: <Award size={24} />,
                title: 'Gagnez des points',
                description: 'Obtenez des récompenses pour vos contributions à la propreté de notre communauté.',
                bg: 'bg-yellow-100 text-yellow-700',
              },
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 transition-all hover:shadow-md touch-manipulation">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center ${feature.bg} rounded-full mb-3 sm:mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Map Preview Section */}
        <section className="py-6 sm:py-8 lg:py-10 mb-6 sm:mb-8 lg:mb-10">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Carte des signalements</h2>
          <div className="rounded-lg overflow-hidden">
            <MapView />
          </div>
          <div className="mt-4 text-center">
            <Link 
              to="/map" 
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center text-sm sm:text-base touch-manipulation"
            >
              Voir la carte complète
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-6 sm:py-8 lg:py-10 mb-6 sm:mb-8 lg:mb-10">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Statistiques</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-2">Impact collectif</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Ensemble, nous faisons la différence pour la propreté de Pita.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { value: stats?.signalements ?? '...', label: 'Signalements' },
                { value: stats?.resolus ?? '...', label: 'Problèmes résolus' },
                { value: stats?.utilisateurs ?? '...', label: 'Utilisateurs actifs' },
                { value: stats?.quartiers ?? '...', label: 'Quartiers couverts' },
              ].map((stat, index) => (
                <div key={index} className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <p className="text-xl sm:text-2xl font-bold text-green-700">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 sm:mt-6 text-center">
              <Link 
                to="/statistics" 
                className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center text-sm sm:text-base touch-manipulation"
              >
                Voir toutes les statistiques
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-green-600 text-white rounded-lg p-6 sm:p-8 mb-6 sm:mb-8 lg:mb-10">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Prêt à contribuer à un Pita plus propre ?</h2>
            <p className="text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
              Rejoignez notre communauté et aidez-nous à identifier et résoudre les problèmes de déchets.
            </p>
            {isAuthenticated ? (
              <Link 
                to="/report" 
                className="bg-white text-green-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium inline-block transition-colors touch-manipulation"
              >
                Signaler un déchet
              </Link>
            ) : (
              <Link 
                to="/register" 
                className="bg-white text-green-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium inline-block transition-colors touch-manipulation"
              >
                S'inscrire gratuitement
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
