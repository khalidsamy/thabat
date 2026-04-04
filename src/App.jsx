import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Standard Structure
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Footer from './components/Footer';

// Pages
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ErrorLog from './pages/ErrorLog';
import ReviewSession from './pages/ReviewSession';
import MutashabihatLog from './pages/MutashabihatLog';
import MutashabihatReview from './pages/MutashabihatReview';

// Route Barriers
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
              <Navbar />
              <Toast />
              
              <main className="flex-grow">
                <Routes>
                  {/* Base URL automatically drops user into dashboard */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
                  <Route 
                    path="/register" 
                    element={
                      <PublicOnlyRoute>
                        <Register />
                      </PublicOnlyRoute>
                    } 
                  />
                  
                  <Route 
                    path="/login" 
                    element={
                      <PublicOnlyRoute>
                        <Login />
                      </PublicOnlyRoute>
                    } 
                  />
                  
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />

                  <Route 
                    path="/errors" 
                    element={
                      <ProtectedRoute>
                        <ErrorLog />
                      </ProtectedRoute>
                    } 
                  />

                  <Route 
                    path="/review" 
                    element={
                      <ProtectedRoute>
                        <ReviewSession />
                      </ProtectedRoute>
                    } 
                  />

                  <Route 
                    path="/mutashabihat" 
                    element={
                      <ProtectedRoute>
                        <MutashabihatLog />
                      </ProtectedRoute>
                    } 
                  />

                  <Route 
                    path="/mutashabihat-review" 
                    element={
                      <ProtectedRoute>
                        <MutashabihatReview />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Catch-all route to prevent blank screens */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>

              <Footer />
            </div>
        </Router>
      </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
