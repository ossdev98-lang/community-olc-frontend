import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,

      login: (user) => set({ user, isAuthenticated: true, isAdmin: user.role === 'ADMIN' }),
      logout: () => set({ user: null, isAuthenticated: false, isAdmin: false }),
      updateUser: (data) => set((s) => ({ user: { ...s.user, ...data } })),
    }),
    { name: 'olc_auth' }
  )
);
