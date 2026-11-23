import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { useAuthStore } from './store/authStore.js';
import NetworkStatus from './components/feedback/NetworkStatus.jsx';
import PwaInstallPrompt from './components/feedback/PwaInstallPrompt.jsx';

// Layouts
import AppLayout from './components/layout/AppLayout.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';

// Auth
import LoginPage from './features/auth/LoginPage.jsx';
import RegisterPage from './features/auth/RegisterPage.jsx';

// Member pages
import DashboardPage from './features/dashboard/DashboardPage.jsx';
import CommunityFeedPage from './features/community/CommunityFeedPage.jsx';
import CreateRequirementPage from './features/community/CreateRequirementPage.jsx';
import RequirementDetailPage from './features/requirements/RequirementDetailPage.jsx';
import MyRequirementsPage from './features/requirements/MyRequirementsPage.jsx';
import InquiriesPage from './features/inquiries/InquiriesPage.jsx';
import ShopDirectoryPage from './features/shops/ShopDirectoryPage.jsx';
import ShopProfilePage from './features/shops/ShopProfilePage.jsx';
import SavedPostsPage from './features/bookmarks/SavedPostsPage.jsx';
import NotificationsPage from './features/notifications/NotificationsPage.jsx';
import ProfilePage from './features/profile/ProfilePage.jsx';
import HelpPage from './features/profile/HelpPage.jsx';
import MobileProfileMenuPage from './features/profile/MobileProfileMenuPage.jsx';

// Admin pages
import AdminDashboardPage from './features/admin/AdminDashboardPage.jsx';
import AdminApprovalsPage from './features/admin/AdminApprovalsPage.jsx';
import AdminMembersPage from './features/admin/AdminMembersPage.jsx';
import AdminPostsPage from './features/admin/AdminPostsPage.jsx';
import AdminCategoriesPage from './features/admin/AdminCategoriesPage.jsx';
import AdminReportsPage from './features/admin/AdminReportsPage.jsx';
import AdminSettingsPage from './features/admin/AdminSettingsPage.jsx';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30000 } } });

function AppSplash() {
  return (
    <motion.div
      className="app-splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.025 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      role="status"
      aria-label="Loading Ozone Lapcare Community"
    >
      <div className="app-splash-orb app-splash-orb-one" />
      <div className="app-splash-orb app-splash-orb-two" />
      <div className="app-splash-content">
        <div className="app-splash-mark-wrap">
          <div className="app-splash-ring" />
          <div className="app-splash-mark">OLC</div>
        </div>
        <div className="app-splash-brand">Ozone Lapcare</div>
        <div className="app-splash-community">COMMUNITY</div>
        <p className="app-splash-tagline">Your business community, together.</p>
        <div className="app-splash-loader" aria-hidden="true"><span /></div>
      </div>
      <div className="app-splash-footer">A trusted space for hardware businesses</div>
    </motion.div>
  );
}

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.key]);

  return null;
}

// Page transition wrapper
function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// Protected route for members
function MemberRoute() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return <Outlet />;
}

// Protected route for admins
function AdminRoute() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

// Public only route (redirect if logged in)
function PublicRoute() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  if (isAuthenticated) return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  return <Outlet />;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    const isMobileApp = window.matchMedia('(max-width: 1023px)').matches
      || window.matchMedia('(display-mode: standalone)').matches;
    if (!isMobileApp || sessionStorage.getItem('olc-splash-shown') === 'true') return false;
    sessionStorage.setItem('olc-splash-shown', 'true');
    return true;
  });

  useEffect(() => {
    if (!showSplash) return undefined;
    const timer = window.setTimeout(() => setShowSplash(false), 1650);
    return () => window.clearTimeout(timer);
  }, [showSplash]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AnimatePresence>{showSplash && <AppSplash key="app-splash" />}</AnimatePresence>
        <PwaInstallPrompt />
        <ScrollToTop />
        <NetworkStatus />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: 12, fontSize: 13, fontFamily: 'Inter, sans-serif' },
            duration: 3000,
          }}
          richColors
        />
        <Routes>
          {/* Public routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
            <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />
          </Route>

          {/* Member routes */}
          <Route element={<MemberRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<PageWrapper><DashboardPage /></PageWrapper>} />
              <Route path="/community" element={<PageWrapper><CommunityFeedPage /></PageWrapper>} />
              <Route path="/community/create" element={<PageWrapper><CreateRequirementPage /></PageWrapper>} />
              <Route path="/requirements" element={<PageWrapper><MyRequirementsPage /></PageWrapper>} />
              <Route path="/requirements/:id/edit" element={<PageWrapper><CreateRequirementPage editMode /></PageWrapper>} />
              <Route path="/requirements/:id" element={<PageWrapper><RequirementDetailPage /></PageWrapper>} />
              <Route path="/inquiries" element={<PageWrapper><InquiriesPage /></PageWrapper>} />
              <Route path="/inquiries/:id" element={<PageWrapper><InquiriesPage /></PageWrapper>} />
              <Route path="/shops" element={<PageWrapper><ShopDirectoryPage /></PageWrapper>} />
              <Route path="/shops/:id" element={<PageWrapper><ShopProfilePage /></PageWrapper>} />
              <Route path="/saved" element={<PageWrapper><SavedPostsPage /></PageWrapper>} />
              <Route path="/notifications" element={<PageWrapper><NotificationsPage /></PageWrapper>} />
              <Route path="/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
              <Route path="/settings" element={<PageWrapper><ProfilePage /></PageWrapper>} />
              <Route path="/help" element={<PageWrapper><HelpPage /></PageWrapper>} />
              <Route path="/menu" element={<PageWrapper><MobileProfileMenuPage /></PageWrapper>} />
            </Route>
          </Route>

          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<PageWrapper><AdminDashboardPage /></PageWrapper>} />
              <Route path="/admin/approvals" element={<PageWrapper><AdminApprovalsPage /></PageWrapper>} />
              <Route path="/admin/members" element={<PageWrapper><AdminMembersPage /></PageWrapper>} />
              <Route path="/admin/posts" element={<PageWrapper><AdminPostsPage /></PageWrapper>} />
              <Route path="/admin/categories" element={<PageWrapper><AdminCategoriesPage /></PageWrapper>} />
              <Route path="/admin/reports" element={<PageWrapper><AdminReportsPage /></PageWrapper>} />
              <Route path="/admin/settings" element={<PageWrapper><AdminSettingsPage /></PageWrapper>} />
            </Route>
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
