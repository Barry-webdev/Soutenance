import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import './App.css';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Lazy loading des pages pour améliorer les performances
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const StatisticsPage = lazy(() => import('./pages/StatisticsPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const MyReportsPage = lazy(() => import('./pages/MyReportsPage'));
const CollaborationPage = lazy(() => import('./pages/CollaborationPage'));
const NotFoundPage = lazy(() => import('./pages/NotFundPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 15 * 60 * 1000, // 15 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Composant de chargement simple et rapide
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <div className="pt-16 pb-8 px-4 sm:px-6 lg:px-8">
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/" element={<HomePage />} />
                    <Route path="/report" element={
                      <ProtectedRoute>
                        <ReportPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/my-reports" element={
                      <ProtectedRoute>
                        <MyReportsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/map" element={
                      <ProtectedRoute requiredRole={["admin", "super_admin", "partner"]}>
                        <MapPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
                        <AdminPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/statistics" element={
                      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
                        <StatisticsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="/collaboration" element={<CollaborationPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </div>
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;