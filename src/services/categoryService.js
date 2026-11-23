import api from './api.js';

export const categoryService = {
  list: async () => {
    const res = await api.get('/categories');
    return res.data;
  },
};
