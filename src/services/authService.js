import api from './api.js';

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  me: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
  refreshToken: async (refreshToken) => {
    const res = await api.post('/auth/refresh-token', { refreshToken });
    return res.data;
  },
  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },
  verifyOtp: async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    return res.data;
  },
  resetPassword: async (email, otp, password) => {
    const res = await api.post('/auth/reset-password', { email, otp, password });
    return res.data;
  },
};
