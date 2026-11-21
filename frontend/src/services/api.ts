import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('certiflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't clear token if on login or verify pages
      if (!window.location.pathname.startsWith('/verify') && window.location.pathname !== '/login') {
        localStorage.removeItem('certiflow_token');
        localStorage.removeItem('certiflow_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
