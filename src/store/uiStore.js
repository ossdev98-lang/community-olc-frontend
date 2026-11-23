import { create } from 'zustand';

export const useUIStore = create((set) => ({
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  isOnline: navigator.onLine,

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setMobileMenu: (open) => set({ mobileMenuOpen: open }),
  setOnline: (val) => set({ isOnline: val }),
}));

// Track online/offline globally
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => useUIStore.getState().setOnline(true));
  window.addEventListener('offline', () => useUIStore.getState().setOnline(false));
}
