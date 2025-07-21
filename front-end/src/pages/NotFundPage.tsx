import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <div className="card p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Page non trouvée</h2>
        <p className="text-gray-600 mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link 
          to="/" 
          className="btn-primary inline-flex items-center"
        >
          <Home size={18} className="mr-2" />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;