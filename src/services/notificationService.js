import api from './api.js';

export const notificationService = {
  list: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },
  markRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },
  unreadCount: async () => {
    const res = await api.get('/notifications/unread-count');
    return res.data;
  },
};
