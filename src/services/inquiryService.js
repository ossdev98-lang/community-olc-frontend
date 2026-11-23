import api from './api.js';

export const inquiryService = {
  create: async (data) => {
    const res = await api.post('/inquiries', data);
    return res.data;
  },
  list: async () => {
    const res = await api.get('/inquiries');
    return res.data;
  },
  get: async (id) => {
    const res = await api.get(`/inquiries/${id}`);
    return res.data;
  },
  markRead: async (id) => {
    const res = await api.patch(`/inquiries/${id}/read`);
    return res.data;
  },
  close: async (id) => {
    const res = await api.patch(`/inquiries/${id}/close`);
    return res.data;
  },
  messages: {
    list: async (conversationId) => {
      const res = await api.get(`/inquiries/${conversationId}/messages`);
      return res.data;
    },
    send: async (conversationId, attachment = null, content = '', messageType = 'TEXT') => {
      const formData = new FormData();
      if (attachment) formData.append('attachment', attachment);
      formData.append('content', content);
      formData.append('messageType', messageType);
      const res = await api.post(`/inquiries/${conversationId}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
  },
  quotations: {
    send: async (conversationId, data) => {
      const res = await api.post(`/inquiries/${conversationId}/quotations`, data);
      return res.data;
    },
    list: async (conversationId) => {
      const res = await api.get(`/inquiries/${conversationId}/quotations`);
      return res.data;
    },
  },
};
