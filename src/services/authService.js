import api from './api.js';

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (data, logo = null) => {
    let payload = data;
    if (logo) {
      payload = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        payload.append(key, ['specializations', 'businessType'].includes(key) ? JSON.stringify(value) : value);
      });
      payload.append('logo', logo);
    }
    const res = await api.post('/auth/register', payload, logo ? { headers: { 'Content-Type': undefined } } : undefined);
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
