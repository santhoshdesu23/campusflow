import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  // If VITE_API_URL is set (from .env.production, .env.development, or deployment env), use it.
  // Otherwise, default to production Render backend in production, or localhost in dev.
  const targetUrl = (envUrl && envUrl.trim())
    ? envUrl.trim()
    : (import.meta.env.PROD
        ? 'https://campusflow-tv7o.onrender.com'
        : 'http://localhost:5000');

  const clean = targetUrl.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

export const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campusflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('campusflow_token');
        localStorage.removeItem('campusflow_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
