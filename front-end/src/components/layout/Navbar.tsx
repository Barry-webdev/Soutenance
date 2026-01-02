import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, MapPin, User, LogOut, BarChart2, Home, Trophy, Medal, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import EcoPulseLogo from '../../assets/images/EcoPulse.logo.png'; // ✅ logo ajouté
import { Brain } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const { unreadCount, setUnreadCount } = useNotifications(); // ✅ Utilisation du contexte

  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleNotifications = () => setShowNotifications(!showNotifications);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  // ✅ Rafraîchissement automatique du nombre de notifications non lues
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        if (user?.id) {
          const res = await fetch(`/api/notifications/${user.id}/unread-count`);
          const data = await res.json();
          setUnreadCount(data.count); // Mise à jour du compteur
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des notifications non lues', error);
      }
    };

    fetchUnreadCount(); // Appel initial

    const interval = setInterval(fetchUnreadCount, 5000); // Mise à jour toutes les 5 secondes
    return () => clearInterval(interval);
  }, [user, setUnreadCount]);

  if (isLoading) return null;

  return (
    <nav className="bg-white shadow-md fixed top-0 w-full z-50 transition-all duration-300">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-start h-16 items-center">
      {/* LOGO */}
      <Link to="/" className="flex items-center space-x-2">
        <img
          src={EcoPulseLogo}
          alt="Logo EcoPulse"
          className="w-12 h-12 object-contain bg-gray-100 p-1 rounded-full"
        />
        <span className="text-green-700 font-bold text-xl">EcoPulse App</span>
      </Link>

      {/* MENU DESKTOP */}
      <div className="hidden md:flex items-center space-x-4 ml-auto">
        <Link to="/" className="text-gray-700 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium">
          Accueil
        </Link>
        
        {/* Navigation pour CITOYENS */}
        {isAuthenticated && user?.role === 'citizen' && (
          <>
            <Link
              to="/my-reports"
              className="text-gray-700 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              📋 Mes signalements
            </Link>
            <Link
              to="/collaboration"
              className="text-gray-700 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              🤝 Collaboration
            </Link>
            <Link
              to="/report"
              className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300"
            >
              Signaler
            </Link>
          </>
        )}

        {/* Navigation pour ADMINS */}
        {isAuthenticated && user?.role === 'admin' && (
          <>
            <Link to="/map" className="text-gray-700 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium">
              Carte
            </Link>
            <Link to="/statistics" className="text-gray-700 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium">
              Statistiques
            </Link>
            <Link to="/badges" className="text-gray-700 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium">
              Badges
            </Link>
            <Link to="/leaderboard" className="text-gray-700 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium">
              Classement
            </Link>
            <Link to="/search" className="text-gray-700 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium">
              Recherche
            </Link>
          </>
        )}

        {/* Navigation pour utilisateurs NON CONNECTÉS */}
        {!isAuthenticated && (
          <>
            <Link to="/map" className="text-gray-700 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium">
              Carte
            </Link>
            <Link to="/statistics" className="text-gray-700 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium">
              Statistiques
            </Link>
            <Link to="/leaderboard" className="text-gray-700 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium">
              Classement
            </Link>
          </>
        )}

        {isAuthenticated ? (
          <>
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="text-gray-700 hover:text-green-700 p-1 rounded-full relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && user?.id && (
                <NotificationDropdown
                  userId={user.id}
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </div>

            {/* Profil */}
            <div className="relative group">
              <button className="flex items-center text-gray-700 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium transition-opacity duration-500 ease-in">
                <span className="mr-1 transition-opacity duration-500 ease-in opacity-100">
                  {user?.role === 'admin'
                    ? 'Admin'
                    : `${user?.name?.split(' ')[0] || 'Utilisateur'}`}
                </span>
                <User size={18} />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block transition-opacity duration-300">
                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Profil
                </Link>
                <Link to="/help" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Aide
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Administration
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300"
          >
            Connexion
          </Link>
        )}
      </div>

      {/* BOUTON MENU MOBILE */}
      <div className="flex md:hidden items-center ml-auto">
        <button
          onClick={toggleMenu}
          className="text-gray-700 hover:text-green-700 p-2 rounded-md transition-transform duration-300"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </div>
  </div>

  {/* MENU MOBILE */}
  {isMenuOpen && (
    <div className="md:hidden bg-white border-t border-gray-200 transition-all duration-300">
      <div className="px-2 pt-2 pb-3 space-y-1">
        <Link
          to="/"
          className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
          onClick={toggleMenu}
        >
          <div className="flex items-center">
            <Home size={18} className="mr-2" />Accueil
          </div>
        </Link>

        {/* Menu mobile pour CITOYENS */}
        {isAuthenticated && user?.role === 'citizen' && (
          <>
            <Link
              to="/collaboration"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={toggleMenu}
            >
              <div className="flex items-center">🤝 Collaboration</div>
            </Link>
            <Link
              to="/report"
              className="block px-3 py-2 rounded-md text-base font-medium text-white bg-green-700"
              onClick={toggleMenu}
            >
              Signaler
            </Link>
          </>
        )}

        {/* Menu mobile pour ADMINS */}
        {isAuthenticated && user?.role === 'admin' && (
          <>
            <Link
              to="/map"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={toggleMenu}
            >
              <div className="flex items-center">
                <MapPin size={18} className="mr-2" />Carte
              </div>
            </Link>
            <Link
              to="/statistics"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={toggleMenu}
            >
              <div className="flex items-center">
                <BarChart2 size={18} className="mr-2" />Statistiques
              </div>
            </Link>
            <Link
              to="/badges"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={toggleMenu}
            >
              <div className="flex items-center">
                <Trophy size={18} className="mr-2" />Badges
              </div>
            </Link>
            <Link
              to="/leaderboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={toggleMenu}
            >
              <div className="flex items-center">
                <Medal size={18} className="mr-2" />Classement
              </div>
            </Link>
            <Link
              to="/search"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={toggleMenu}
            >
              <div className="flex items-center">
                <Search size={18} className="mr-2" />Recherche
              </div>
            </Link>
          </>
        )}

        {/* Menu mobile pour utilisateurs NON CONNECTÉS */}
        {!isAuthenticated && (
          <>
            <Link
              to="/map"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={toggleMenu}
            >
              <div className="flex items-center">
                <MapPin size={18} className="mr-2" />Carte
              </div>
            </Link>
            <Link
              to="/statistics"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={toggleMenu}
            >
              <div className="flex items-center">
                <BarChart2 size={18} className="mr-2" />Statistiques
              </div>
            </Link>
            <Link
              to="/leaderboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={toggleMenu}
            >
              <div className="flex items-center">
                <Medal size={18} className="mr-2" />Classement
              </div>
            </Link>
          </>
        )}

        {isAuthenticated ? (
          <>
            <Link
              to="/profile"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={toggleMenu}
            >
              <div className="flex items-center">
                <User size={18} className="mr-2" />Profil
              </div>
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={toggleMenu}
              >
                Administration
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="w-full block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 text-left"
            >
              <div className="flex items-center">
                <LogOut size={18} className="mr-2" />Déconnexion
              </div>
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="block px-3 py-2 rounded-md text-base font-medium text-white bg-green-700"
            onClick={toggleMenu}
          >
            Connexion
          </Link>
        )}
      </div>
    </div>
  )}
</nav>

  );
};

export default Navbar;
