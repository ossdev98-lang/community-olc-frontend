import api from './api.js';

export const bookmarkService = {
  list: async () => {
    const res = await api.get('/bookmarks');
    return res.data;
  },
  add: async (requirementId) => {
    const res = await api.post(`/bookmarks/${requirementId}`);
    return res.data;
  },
  remove: async (requirementId) => {
    const res = await api.delete(`/bookmarks/${requirementId}`);
    return res.data;
  },
  check: async (requirementId) => {
    const res = await api.get(`/bookmarks/${requirementId}/check`);
    return res.data;
  },
};
