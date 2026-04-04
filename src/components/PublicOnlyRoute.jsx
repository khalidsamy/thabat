import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PublicOnlyRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);

  if (loading) return null;

  // If already logged in, redirect them directly to the dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicOnlyRoute;
