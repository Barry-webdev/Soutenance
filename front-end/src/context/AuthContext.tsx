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
    isLoading: true,
    error: null,
  });

  // Check for saved auth on app load
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
      // Mock authentication - would be replaced with actual API calls
      if (email === 'babdoulrazzai@gmail.com' && password === 'kathioure') {
        // Admin login
        localStorage.setItem('user', JSON.stringify(MOCK_ADMIN_USER));
        
        setAuthState({
          user: MOCK_ADMIN_USER,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        // Mock regular user login (in a real app, this would be replaced with API call)
        const mockUser: User = {
          id: `user-${Date.now()}`,
          email,
          name: email.split('@')[0],
          role: 'citizen',
          points: 0,
          createdAt: new Date().toISOString(),
        };
        
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        setAuthState({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      }
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
      // Mock registration - would be replaced with actual API calls
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};