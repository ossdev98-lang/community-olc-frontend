import api from './api.js';

export const dashboardService = {
  get: async () => {
    const res = await api.get('/dashboard/dashboard');
    return res.data;
  },
};
