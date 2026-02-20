import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import webSocketService from '../services/websocketService';
import { buildApiUrl } from '../config/api';

// Mock authentication - would be replaced with actual API calls
const MOCK_ADMIN_USER = {
  id: 'admin-1',
  email: 'babdoulrazzai@gmail.com',
  name: 'Admin',
  role: 'admin',
  points: 0,
  createdAt: new Date().toISOString(),
} as User;

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Initialisation immédiate depuis localStorage
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      return {
        user: JSON.parse(savedUser) as User,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    }
    
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
  });

  // 🔁 Re-sync user when localStorage changes (useful when login from another tab)
  useEffect(() => {
    const handleStorage = () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser) as User;
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState(prev => ({ ...prev, user: null, isAuthenticated: false }));
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Connexion WebSocket quand l'utilisateur est authentifié (non bloquant)
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      const token = localStorage.getItem('token');
      if (token) {
        // Connexion WebSocket en arrière-plan (non bloquant)
        setTimeout(() => {
          try {
            webSocketService.connect(token);
          } catch (error) {
            // Silencieux - WebSocket optionnel
          }
        }, 2000);
      }
    }
  }, [authState.isAuthenticated]);

  // Supprimé : useEffect qui recharge l'auth (déjà fait dans l'initialisation)

  const login = async (email: string, password: string) => {
    setAuthState(prevState => ({ ...prevState, isLoading: true, error: null }));

    try {
      const response = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Identifiants invalides');
      }

      const { token, user } = data.data;
      
      // ✅ Sauvegarde immédiate
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // ✅ Mise à jour immédiate du state
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // ✅ Retour immédiat pour redirection
      return { 
        success: true, 
        user, 
        token,
        redirect: user.role === 'super_admin' ? '/admin' : 
                 user.role === 'admin' ? '/statistics' : 
                 '/'
      };
    } catch (error) {
      setAuthState(prevState => ({
        ...prevState,
        isLoading: false,
        error: error.message || 'Erreur de connexion',
      }));
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setAuthState(prevState => ({ ...prevState, isLoading: true, error: null }));

    try {
      const response = await fetch(buildApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role: 'citizen' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      // ✅ Inscription réussie - redirection immédiate vers login
      setAuthState(prevState => ({
        ...prevState,
        isLoading: false,
        error: null,
      }));

      return { 
        success: true, 
        message: 'Inscription réussie ! Veuillez vous connecter.',
        redirect: '/login'
      };
    } catch (error) {
      setAuthState(prevState => ({
        ...prevState,
        isLoading: false,
        error: error.message || 'Erreur lors de l\'inscription',
      }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const value = {
    ...authState,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ✅ Ne pas créer de states ici : ils doivent être dans AuthProvider
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
