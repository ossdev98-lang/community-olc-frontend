import { Outlet, useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';
import Header from './Header.jsx';
import MobileHeader from './MobileHeader.jsx';
import { useIsMobile } from '../../hooks/useIsMobile.js';
import { LayoutDashboard, Store, Users, FileText, Tag, Flag, Settings } from 'lucide-react';

const ADMIN_TABS = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
  { label: 'Approvals', icon: Store, to: '/admin/approvals' },
  { label: 'Members', icon: Users, to: '/admin/members' },
  { label: 'Posts', icon: FileText, to: '/admin/posts' },
  { label: 'More', icon: Settings, to: '/admin/settings' },
];

function AdminBottomNav() {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 300,
      background: '#0B1726', borderTop: '1px solid rgba(255,255,255,0.1)',
      display: 'flex', alignItems: 'center',
      paddingBottom: 'env(safe-area-inset-bottom)',
      height: 'calc(60px + env(safe-area-inset-bottom))',
    }}>
      {ADMIN_TABS.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/admin'}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, textDecoration: 'none', padding: '8px 0' }}
        >
          {({ isActive }) => (
            <>
              <tab.icon size={20} color={isActive ? '#21AFA9' : 'rgba(255,255,255,0.4)'} strokeWidth={isActive ? 2.5 : 2} />
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? '#21AFA9' : 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>
                {tab.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AdminLayout() {
  const isMobile = useIsMobile(1024);

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F4F7FA' }}>
        <div style={{ background: '#0B1726', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#21AFA9', letterSpacing: '0.05em' }}>⚙ ADMIN PANEL</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Ozone Lapcare</span>
        </div>
        <main style={{ flex: 1, padding: '16px 16px 80px', minWidth: 0, overflowX: 'hidden' }}>
          <Outlet />
        </main>
        <AdminBottomNav />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F7FA' }}>
      <AdminSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header />
        <main style={{ flex: 1, padding: 24, minWidth: 0, overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
