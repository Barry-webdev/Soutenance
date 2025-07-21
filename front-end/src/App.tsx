// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import { NotificationProvider } from './context/NotificationContext';
// import Navbar from './components/layout/Navbar';
// import ProtectedRoute from './components/auth/ProtectedRoute';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import HomePage from './pages/HomePage';
// import ReportPage from './pages/ReportPage';
// import MapPage from './pages/MapPage';
// import ProfilePage from './pages/ProfilePage';
// import AdminDashboard from './pages/AdminDashboard';
// import StatisticsPage from './pages/StatisticsPage';
// import NotFoundPage from './pages/NotFundPage';
// import './App.css';
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 5 * 60 * 1000, // Cache des requêtes pendant 5 minutes
//     },
//   },
// });

// function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <AuthProvider>
//         <NotificationProvider>
//           <Router>
//             <div className="min-h-screen bg-gray-50">
//               <Navbar />
//               <div className="pt-16 pb-8 px-4 sm:px-6 lg:px-8">
//                 <Routes>
//                   {/* Routes publiques */}
//                   <Route path="/" element={<HomePage />} />
//                   <Route path="/login" element={<LoginPage />} />
//                   <Route path="/register" element={<RegisterPage />} />
//                   <Route path="/map" element={<MapPage />} />
//                   <Route path="/statistics" element={<StatisticsPage />} />

//                   {/* Routes protégées */}
//                   <Route
//                     path="/report" element={
//                       <ProtectedRoute>
//                         <ReportPage />
//                       </ProtectedRoute>
//                     }
//                   />
//                   <Route
//                     path="/profile" element={
//                       <ProtectedRoute>
//                         <ProfilePage />
//                       </ProtectedRoute>
//                     }
//                   />
//                   <Route
//                     path="/admin" element={
//                       <ProtectedRoute requiredRole="admin">
//                         <AdminDashboard />
//                       </ProtectedRoute>
//                     }
//                   />

//                   {/* Page 404 */}
//                   <Route path="*" element={<NotFoundPage />} />
//                 </Routes>
//               </div>
//             </div>
//           </Router>
//         </NotificationProvider>
//       </AuthProvider>
//     </QueryClientProvider>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import StatisticsPage from './pages/StatisticsPage';
import NotFoundPage from './pages/NotFundPage';
import './App.css';
import {QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
    }
  }
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-16 pb-8 px-4 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/report" element={
                  <ProtectedRoute>
                    <ReportPage />
                  </ProtectedRoute>
                } />
                <Route path="/map" element={<MapPage />} />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/statistics" element={<StatisticsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;