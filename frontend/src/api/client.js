import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_BASE_URL = BASE_URL.endsWith('/api/v1') ? BASE_URL : `${BASE_URL}/api/v1`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dogfood_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract error message cleanly
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized on protected route, can clear token
      // Avoid clearing on login attempt failures
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('dogfood_token');
        localStorage.removeItem('dogfood_user');
      }
    }
    const customMessage = error.response?.data?.error?.message || error.response?.data?.detail || error.message;
    error.userMessage = customMessage;
    return Promise.reject(error);
  }
);

export default apiClient;
