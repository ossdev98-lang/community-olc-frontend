import api from './api.js';

export const requirementService = {
  list: async (params = {}) => {
    const res = await api.get('/requirements', { params });
    return res.data;
  },
  get: async (id) => {
    const res = await api.get(`/requirements/${id}`);
    return res.data;
  },
  create: async (data, images = []) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('category', data.category);
    formData.append('productName', data.productName);
    if (data.modelNumber) formData.append('modelNumber', data.modelNumber);
    if (data.partName) formData.append('partName', data.partName);
    formData.append('description', data.description);
    formData.append('quantity', String(data.quantity));
    formData.append('condition', data.condition);
    if (data.expectedPrice) formData.append('expectedPrice', data.expectedPrice);
    formData.append('location', data.location);
    formData.append('duration', String(data.duration));
    images.forEach((img) => formData.append('images', img));
    const res = await api.post('/requirements', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  update: async (id, data, images = []) => {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.category) formData.append('category', data.category);
    if (data.productName) formData.append('productName', data.productName);
    if (data.modelNumber !== undefined) formData.append('modelNumber', data.modelNumber);
    if (data.partName !== undefined) formData.append('partName', data.partName);
    if (data.description) formData.append('description', data.description);
    if (data.quantity) formData.append('quantity', String(data.quantity));
    if (data.condition) formData.append('condition', data.condition);
    if (data.expectedPrice !== undefined) formData.append('expectedPrice', data.expectedPrice);
    if (data.location) formData.append('location', data.location);
    if (data.duration) formData.append('duration', String(data.duration));
    images.forEach((img) => formData.append('images', img));
    const res = await api.put(`/requirements/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  close: async (id) => {
    const res = await api.patch(`/requirements/${id}/close`);
    return res.data;
  },
  renew: async (id, duration = 24) => {
    const res = await api.patch(`/requirements/${id}/renew`, { duration });
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/requirements/${id}`);
    return res.data;
  },
  mine: async (params = {}) => {
    const res = await api.get('/requirements', { params: { ...params, mine: 'true' } });
    return res.data;
  },
};
