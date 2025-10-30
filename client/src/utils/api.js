import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      // Redirect to login if unauthorized and not already on login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
