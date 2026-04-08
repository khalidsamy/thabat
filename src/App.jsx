import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { FloatingActionProvider } from './context/FloatingActionContext';
import FloatingActionStack from './components/layout/FloatingActionStack';

import Toast from './components/Toast';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

// Pages
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/dashboard/Home';
import Progress from './pages/dashboard/Progress';
import Recite from './pages/dashboard/RecitePremium';
import ListeningStation from './pages/dashboard/ListeningStation';
import Community from './pages/dashboard/CommunityDashboard';
import Review from './pages/dashboard/Review';
import Profile from './pages/Profile';
import ErrorLog from './pages/ErrorLog';
import ReviewSession from './pages/ReviewSession';
import MutashabihatLog from './pages/MutashabihatLog';
import MutashabihatReview from './pages/MutashabihatReview';
import Settings from './pages/Settings';
import ChatAssistant from './components/ChatAssistant';

// Auth Guards
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import AnimatedPage from './components/AnimatedPage';
import ResponsiveLayout from './components/layout/ResponsiveLayout';

function App() {
  return (
    <ThemeProvider>
      <FloatingActionProvider>
        <ToastProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <FloatingActionStack />
              <Toast />
              <ChatAssistant />
              <Routes>
              {/* Global Root Transition Logic */}
                <Route path="/" element={<RootRedirect />} />

              {/* Public Routes with standalone layout */}
                <Route
                  path="/register"
                  element={
                    <PublicOnlyRoute>
                      <AnimatedPage>
                        <Register />
                      </AnimatedPage>
                    </PublicOnlyRoute>
                  }
                />
              
                <Route
                  path="/login"
                  element={
                    <PublicOnlyRoute>
                      <AnimatedPage>
                        <Login />
                      </AnimatedPage>
                    </PublicOnlyRoute>
                  }
                />

              {/* Unified Dashboard Hub */}
                <Route element={<ProtectedRoute><ResponsiveLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<Dashboard />}>
                    <Route index element={<Home />} />
                    <Route path="progress" element={<Progress />} />
                    <Route path="recite" element={<Recite />} />
                    <Route path="listen" element={<ListeningStation />} />
                    <Route path="community" element={<Community />} />
                    <Route path="review" element={<Review />} />
                  
                  {/* Specialized Tools Consolidated Under Dashboard Layout */}
                    <Route path="errors" element={<ErrorLog />} />
                    <Route path="review-session" element={<ReviewSession />} />
                    <Route path="mutashabihat" element={<MutashabihatLog />} />
                    <Route path="mutashabihat-review" element={<MutashabihatReview />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </FloatingActionProvider>
    </ThemeProvider>
  );
}

function RootRedirect() {
  const { token, loading } = useContext(AuthContext);
  if (loading) return null; // Avoid flickering during bootstrap
  return token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

export default App;
