import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from LocalStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('thabat_token');
    const storedUser = localStorage.getItem('thabat_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    
    localStorage.setItem('thabat_token', newToken);
    localStorage.setItem('thabat_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    
    localStorage.removeItem('thabat_token');
    localStorage.removeItem('thabat_user');
  };

  const updateUser = (updatedUserData) => {
    const newUser = { ...user, ...updatedUserData };
    setUser(newUser);
    localStorage.setItem('thabat_user', JSON.stringify(newUser));
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
