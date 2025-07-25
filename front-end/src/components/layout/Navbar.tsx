import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, MapPin, User, LogOut, BarChart2, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { unreadCount, setUnreadCount } = useNotifications();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        if (user?.id) {
          const res = await fetch(`/api/notifications/${user.id}/unread-count`);
          const data = await res.json();
          setUnreadCount(data.count);
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des notifications non lues', error);
      }
    };

    fetchUnreadCount();
  }, [user, setUnreadCount]);

  return (
    <nav className="bg-white shadow-md fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-green-700 font-bold text-xl">WasteManagement App</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium">Accueil</Link>
            <Link to="/map" className="text-gray-700 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium">Carte</Link>
            <Link to="/statistics" className="text-gray-700 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium">Statistiques</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/report" className="bg-green-700 hover:bg-green-800 text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300">Signaler</Link>
                
                <div className="relative">
                  <button onClick={toggleNotifications} className="text-gray-700 hover:text-green-700 p-1 rounded-full relative">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && user?.id && (
                    <NotificationDropdown
                      userId={user.id} // ✅ Ajout pour corriger le soulignement
                      onClose={() => setShowNotifications(false)}
                    />
                  )}
                </div>
                
                <div className="relative group">
                  <button className="flex items-center text-gray-700 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium">
                    <span className="mr-1">{user?.name}</span>
                    <User size={18} />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profil</Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Administration</Link>
                    )}
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Déconnexion
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link to="/login" className="bg-green-700 hover:bg-green-800 text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300">Connexion</Link>
            )}
          </div>
          
          <div className="flex md:hidden items-center">
            <button onClick={toggleMenu} className="text-gray-700 hover:text-green-700 p-2 rounded-md">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>
              <div className="flex items-center"><Home size={18} className="mr-2" />Accueil</div>
            </Link>
            <Link to="/map" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>
              <div className="flex items-center"><MapPin size={18} className="mr-2" />Carte</div>
            </Link>
            <Link to="/statistics" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>
              <div className="flex items-center"><BarChart2 size={18} className="mr-2" />Statistiques</div>
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/report" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-green-700" onClick={() => setIsMenuOpen(false)}>Signaler</Link>
                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center"><User size={18} className="mr-2" />Profil</div>
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Administration</Link>
                )}
                <button onClick={handleLogout} className="w-full block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 text-left">
                  <div className="flex items-center"><LogOut size={18} className="mr-2" />Déconnexion</div>
                </button>
              </>
            ) : (
              <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-green-700" onClick={() => setIsMenuOpen(false)}>Connexion</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
