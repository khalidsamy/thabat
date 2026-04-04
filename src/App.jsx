import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Footer from './components/Footer';

// Pages
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/dashboard/Home';
import Progress from './pages/dashboard/Progress';
import Recite from './pages/dashboard/Recite';
import Community from './pages/dashboard/Community';
import Review from './pages/dashboard/Review';
import Profile from './pages/Profile';
import ErrorLog from './pages/ErrorLog';
import ReviewSession from './pages/ReviewSession';
import MutashabihatLog from './pages/MutashabihatLog';
import MutashabihatReview from './pages/MutashabihatReview';

// Auth Guards
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import AnimatedPage from './components/AnimatedPage';

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
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
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
                  
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <AnimatedPage>
                          <Dashboard />
                        </AnimatedPage>
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Home />} />
                    <Route path="progress" element={<Progress />} />
                    <Route path="recite" element={<Recite />} />
                    <Route path="community" element={<Community />} />
                    <Route path="review" element={<Review />} />
                  </Route>
                  
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <AnimatedPage>
                          <Profile />
                        </AnimatedPage>
                      </ProtectedRoute>
                    } 
                  />

                  <Route 
                    path="/errors" 
                    element={
                      <ProtectedRoute>
                        <AnimatedPage>
                          <ErrorLog />
                        </AnimatedPage>
                      </ProtectedRoute>
                    } 
                  />

                  <Route 
                    path="/review" 
                    element={
                      <ProtectedRoute>
                        <AnimatedPage>
                          <ReviewSession />
                        </AnimatedPage>
                      </ProtectedRoute>
                    } 
                  />

                  <Route 
                    path="/mutashabihat" 
                    element={
                      <ProtectedRoute>
                        <AnimatedPage>
                          <MutashabihatLog />
                        </AnimatedPage>
                      </ProtectedRoute>
                    } 
                  />

                  <Route 
                    path="/mutashabihat-review" 
                    element={
                      <ProtectedRoute>
                        <AnimatedPage>
                          <MutashabihatReview />
                        </AnimatedPage>
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
