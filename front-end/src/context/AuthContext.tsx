import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';

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
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true, // ✅ cohérent avec Navbar
    error: null,
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

  // ✅ Check for saved auth on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
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
          setAuthState(prevState => ({ ...prevState, isLoading: false }));
        }
      } catch (error) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to restore session',
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState(prevState => ({ ...prevState, isLoading: true, error: null }));

    try {
      let user: User;

      if (email === 'babdoulrazzai@gmail.com' && password === 'kathioure') {
        user = MOCK_ADMIN_USER;
      } else {
        user = {
          id: `user-${Date.now()}`,
          email,
          name: email.split('@')[0],
          role: 'citizen',
          points: 0,
          createdAt: new Date().toISOString(),
        };
      }

      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState(prevState => ({
        ...prevState,
        isLoading: false,
        error: 'Invalid email or password',
      }));
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setAuthState(prevState => ({ ...prevState, isLoading: true, error: null }));

    try {
      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        name,
        role: 'citizen',
        points: 0,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('user', JSON.stringify(newUser));

      setAuthState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState(prevState => ({
        ...prevState,
        isLoading: false,
        error: 'Registration failed',
      }));
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
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
