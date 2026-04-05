import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  withCredentials: true,
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
});

// Retry a failed request once after a short delay — handles cold Railway starts.
const retryRequest = (config) =>
  new Promise(resolve => setTimeout(() => resolve(axios(config)), 2000));

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('thabat_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    // Single automatic retry on network timeout or 502/503 (Railway cold start)
    const status = error.response?.status;
    const isRetryable = !error.response || status === 502 || status === 503 || status === 504;
    if (isRetryable && !error.config._retried) {
      error.config._retried = true;
      try { return await retryRequest(error.config); } catch (_) {}
    }

    if (status === 401) {
      localStorage.removeItem('thabat_token');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }

    // Normalize error message so components can just call showError(err.message)
    error.message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED' ? 'Request timed out — server may be waking up, try again.' :
      !error.response           ? 'Unable to connect to the server. Please check your connection.' :
                                  'Something went wrong. Please try again later.');

    return Promise.reject(error);
  }
);

export default api;