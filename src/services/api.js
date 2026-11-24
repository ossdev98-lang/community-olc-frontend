import axios from 'axios';
import { useAuthStore } from '../store/authStore.js';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://community-olc-backend.onrender.com/api';
let activeRequests = 0;

export const getActiveRequestCount = () => activeRequests;

function trackRequest(config, delta) {
  if (delta > 0) config._olcRequestTracked = true;
  else if (!config?._olcRequestTracked) return;
  activeRequests = Math.max(0, activeRequests + delta);
  window.dispatchEvent(new CustomEvent('olc:active-requests', { detail: activeRequests }));
}

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('olc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  trackRequest(config, 1);
  return config;
});

api.interceptors.response.use(
  (res) => { trackRequest(res.config, -1); return res; },
  (err) => {
    trackRequest(err.config, -1);
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('olc_token');
      localStorage.removeItem('olc_refreshToken');
      localStorage.removeItem('olc_user');
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }
    return Promise.reject(err);
  }
);

export default api;
