import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-2 text-green-700 font-semibold">
            <Leaf className="w-5 h-5" />
            <span>EcoPulse</span>
          </div>

          {/* Liens */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-gray-500">
            <Link to="/about" className="hover:text-green-600 transition-colors">Qui sommes-nous</Link>
            <Link to="/faq" className="hover:text-green-600 transition-colors">FAQ</Link>
            <Link to="/contact" className="hover:text-green-600 transition-colors">Contact</Link>
            <Link to="/help" className="hover:text-green-600 transition-colors">Aide</Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} EcoPulse — Pita, Guinée
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
