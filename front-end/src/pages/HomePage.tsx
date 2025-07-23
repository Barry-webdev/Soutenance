import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, BarChart2, Award, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/map/MapView';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/dashboard-stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("❌ Erreur de chargement des statistiques :", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4">

      {/* Hero Section */}
      {/* ... [inchangé] */}

      {/* Features Section */}
      {/* ... [inchangé] */}

      {/* Map Preview Section */}
      {/* ... [inchangé] */}

      {/* Statistics Section */}
      <section className="py-10 mb-10">
        <h2 className="text-2xl font-bold mb-6">Statistiques</h2>
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-2">Impact collectif</h3>
          <p className="text-gray-600 mb-4">
            Ensemble, nous faisons la différence pour la propreté de Pita.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: stats?.signalements ?? '...', label: 'Signalements' },
              { value: stats?.resolus ?? '...', label: 'Problèmes résolus' },
              { value: stats?.utilisateurs ?? '...', label: 'Utilisateurs actifs' },
              { value: stats?.quartiers ?? '...', label: 'Quartiers couverts' },
            ].map((stat, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-green-700">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link to="/statistics" className="text-blue-700 hover:text-blue-800 font-medium inline-flex items-center">
              Voir toutes les statistiques
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {/* ... [inchangé] */}
      
    </div>
  );
};

export default HomePage;
