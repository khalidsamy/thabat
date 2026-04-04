import axios from 'axios';

// Create a unified Axios instance pointing to our environment API URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept ANY outgoing request from this instance
api.interceptors.request.use(
  (config) => {
    // 1. Check local storage for the JWT token
    const token = localStorage.getItem('thabat_token');
    
    // 2. If token exists, inject it into the Authorization header natively
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Detailed Network Tracer - Outgoing
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data ? config.data : '');
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept ANY incoming response to centrally catch 401 Unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Detailed Network Tracer - Incoming Errors
    console.error(`[API Error] ${error.response?.status || 'NETWORK_ERROR'}`, error.message, error.response?.data);

    if (error.response && error.response.status === 401) {
      // Clear local storage to wipe the bad token
      localStorage.removeItem('thabat_token');
      
      // Force reload the window to safely bounce them back to the login page via routing
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Centralized Error Normalization
    // Overriding the default axios error.message to automatically map backend JSON error messages.
    // This allows components to simply consume `showError(err.message)` globally.
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    } else if (error.message === 'Network Error') {
      error.message = 'Unable to connect to the server. Please check your connection.';
    } else {
      error.message = 'Something went wrong. Please try again later.';
    }

    return Promise.reject(error);
  }
);

export default api;
