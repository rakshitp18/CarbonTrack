import axios from 'axios';

const defaultBaseUrl = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
  ? 'https://carbontrack-ud64.onrender.com/api/v1'
  : '/api/v1';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthenticationRequest = error.config?.url?.startsWith('/auth/');
    if (error.response?.status === 401 && !isAuthenticationRequest) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
