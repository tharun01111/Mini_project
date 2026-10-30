import axios from 'axios';

// VITE_API_URL must be set to your Render backend URL during the frontend build.
// Example: https://symposium-server.onrender.com/api
// Falls back to localhost for local development (Vite proxy handles /api → :5000).
const baseURL = import.meta.env.VITE_API_URL || '/api/';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// Interceptor to attach Authorization Bearer token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle 401 responses globally (token expired / invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale credentials and reload to login page
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on auth pages to avoid redirect loops
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
