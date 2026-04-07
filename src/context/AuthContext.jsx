import React, { createContext, useCallback, useMemo, useState } from 'react';

export const AuthContext = createContext();

const readStoredAuth = () => {
  if (typeof window === 'undefined') {
    return { user: null, token: null };
  }

  try {
    const storedToken = localStorage.getItem('thabat_token');
    const storedUser = localStorage.getItem('thabat_user');

    return {
      token: storedToken || null,
      user: storedUser ? JSON.parse(storedUser) : null,
    };
  } catch (error) {
    console.warn('Failed to restore auth state:', error);
    localStorage.removeItem('thabat_token');
    localStorage.removeItem('thabat_user');
    return { user: null, token: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => readStoredAuth());
  const loading = false;
  const { user, token } = authState;

  const login = useCallback((newToken, userData) => {
    setAuthState({ token: newToken, user: userData });
    localStorage.setItem('thabat_token', newToken);
    localStorage.setItem('thabat_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setAuthState({ token: null, user: null });
    localStorage.removeItem('thabat_token');
    localStorage.removeItem('thabat_user');
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    setAuthState((prev) => {
      const newUser = { ...(prev.user || {}), ...updatedUserData };
      localStorage.setItem('thabat_user', JSON.stringify(newUser));
      return { ...prev, user: newUser };
    });
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
  }), [loading, login, logout, token, updateUser, user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
