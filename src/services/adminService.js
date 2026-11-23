import api from './api.js';

export const adminService = {
  dashboard: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },
  listShops: async () => {
    const res = await api.get('/admin/shops');
    return res.data;
  },
  getShop: async (id) => {
    const res = await api.get(`/admin/shops/${id}`);
    return res.data;
  },
  approveShop: async (id) => {
    const res = await api.post(`/admin/shops/${id}/approve`);
    return res.data;
  },
  rejectShop: async (id) => {
    const res = await api.post(`/admin/shops/${id}/reject`);
    return res.data;
  },
  suspendShop: async (id) => {
    const res = await api.post(`/admin/shops/${id}/suspend`);
    return res.data;
  },
  reactivateShop: async (id) => {
    const res = await api.post(`/admin/shops/${id}/reactivate`);
    return res.data;
  },
  verifyShop: async (id) => {
    const res = await api.post(`/admin/shops/${id}/verify`);
    return res.data;
  },
  listRequirements: async () => {
    const res = await api.get('/admin/requirements');
    return res.data;
  },
  hideRequirement: async (id) => {
    const res = await api.patch(`/admin/requirements/${id}/hide`);
    return res.data;
  },
  unhideRequirement: async (id) => {
    const res = await api.patch(`/admin/requirements/${id}/unhide`);
    return res.data;
  },
  listReports: async () => {
    const res = await api.get('/admin/reports');
    return res.data;
  },
  updateReport: async (id, data) => {
    const res = await api.patch(`/admin/reports/${id}`, data);
    return res.data;
  },
  listLogs: async () => {
    const res = await api.get('/admin/logs');
    return res.data;
  },
};
