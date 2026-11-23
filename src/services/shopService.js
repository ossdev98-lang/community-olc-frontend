import api from './api.js';

export const shopService = {
  list: async (params = {}) => {
    const res = await api.get('/shops', { params });
    return res.data;
  },
  get: async (id) => {
    const res = await api.get(`/shops/${id}`);
    return res.data;
  },
  me: async () => {
    const res = await api.get('/shops/me');
    return res.data;
  },
  update: async (data, logo = null, documents = []) => {
    const formData = new FormData();
    if (data.shopName) formData.append('shopName', data.shopName);
    if (data.ownerName) formData.append('ownerName', data.ownerName);
    if (data.businessType) formData.append('businessType', data.businessType);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.mobile) formData.append('mobile', data.mobile);
    if (data.email) formData.append('email', data.email);
    if (data.address !== undefined) formData.append('address', data.address);
    if (data.city) formData.append('city', data.city);
    if (data.state) formData.append('state', data.state);
    if (data.pincode) formData.append('pincode', data.pincode);
    if (data.specializations) formData.append('specializations', JSON.stringify(data.specializations));
    if (logo) formData.append('logo', logo);
    documents.forEach((d) => formData.append('business_documents', d));
    const res = await api.put('/shops/me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
