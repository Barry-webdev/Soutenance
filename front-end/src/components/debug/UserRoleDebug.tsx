import React from 'react';
import { useAuth } from '../../context/AuthContext';

const UserRoleDebug: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Récupérer aussi depuis localStorage pour comparaison
  const localStorageUser = localStorage.getItem('user');
  const parsedUser = localStorageUser ? JSON.parse(localStorageUser) : null;

  return (
    <div className="fixed top-4 right-4 bg-red-100 border-2 border-red-500 p-4 rounded-lg z-50 max-w-sm">
      <h3 className="font-bold text-red-800 mb-2">🔍 DEBUG UTILISATEUR</h3>
      
      <div className="text-sm space-y-1">
        <p><strong>Authentifié:</strong> {isAuthenticated ? '✅ Oui' : '❌ Non'}</p>
        
        <p><strong>Contexte Auth:</strong></p>
        <div className="ml-2 text-xs bg-white p-2 rounded">
          {user ? (
            <>
              <p>Nom: {user.name}</p>
              <p>Email: {user.email}</p>
              <p>Rôle: <span className="font-bold text-red-600">{user.role}</span></p>
            </>
          ) : (
            <p>Aucun utilisateur dans le contexte</p>
          )}
        </div>
        
        <p><strong>LocalStorage:</strong></p>
        <div className="ml-2 text-xs bg-white p-2 rounded">
          {parsedUser ? (
            <>
              <p>Nom: {parsedUser.name}</p>
              <p>Email: {parsedUser.email}</p>
              <p>Rôle: <span className="font-bold text-red-600">{parsedUser.role}</span></p>
            </>
          ) : (
            <p>Aucun utilisateur dans localStorage</p>
          )}
        </div>
        
        <p><strong>Conditions d'affichage:</strong></p>
        <div className="ml-2 text-xs bg-white p-2 rounded">
          <p>Est Admin: {user?.role === 'admin' ? '✅' : '❌'}</p>
          <p>Est Citoyen: {user?.role === 'citizen' ? '✅' : '❌'}</p>
          <p>Doit voir stats: {isAuthenticated && user?.role === 'admin' ? '✅' : '❌'}</p>
          <p>Doit voir carte: {isAuthenticated && user?.role === 'admin' ? '✅' : '❌'}</p>
        </div>
      </div>
    </div>
  );
};

export default UserRoleDebug;