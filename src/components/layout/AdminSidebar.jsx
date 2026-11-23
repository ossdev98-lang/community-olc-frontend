import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Store, Users, FileText, Tag, Flag, Settings, LogOut, ChevronLeft, ChevronRight, X, ShieldCheck } from 'lucide-react';
import OLCLogo from '../ui/Logo.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { useUIStore } from '../../store/uiStore.js';
import { adminService } from '../../services/index.js';

const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
  { label: 'Shop Approvals', icon: Store, to: '/admin/approvals', badge: true },
  { label: 'Members', icon: Users, to: '/admin/members' },
  { label: 'Post Moderation', icon: FileText, to: '/admin/posts' },
  { label: 'Categories', icon: Tag, to: '/admin/categories' },
  { label: 'Reports', icon: Flag, to: '/admin/reports' },
  { label: 'Settings', icon: Settings, to: '/admin/settings' },
];

function NavItem({ item, collapsed, pendingCount }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/admin'}
      className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
      style={{ justifyContent: collapsed ? 'center' : 'flex-start', position: 'relative' }}
      title={collapsed ? item.label : undefined}
    >
      <item.icon size={18} style={{ flexShrink: 0 }} />
      <AnimatePresence>
        {!collapsed && (
          <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} style={{ overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      {item.badge && pendingCount > 0 && (
        <span style={{
          background: '#DC2626', color: '#fff', borderRadius: 99, fontSize: 10, fontWeight: 700,
          padding: '1px 6px', minWidth: 18, textAlign: 'center',
          position: collapsed ? 'absolute' : 'static',
          top: collapsed ? 4 : undefined, right: collapsed ? 4 : undefined,
        }}>
          {pendingCount}
        </span>
      )}
    </NavLink>
  );
}

function SidebarContent({ collapsed, onToggle, onClose, isMobile, pendingCount }) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 16px 16px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
        <OLCLogo size={36} showText={!collapsed} />
        {isMobile ? (
          <button onClick={onClose} style={{ background: '#F4F7FA', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex', color: '#718096' }}>
            <X size={16} />
          </button>
        ) : (
          <button onClick={onToggle} style={{ background: '#F4F7FA', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex', color: '#718096' }}>
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      {!collapsed && (
        <div style={{ margin: '0 10px 12px', padding: '8px 12px', background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={14} color="#D97706" />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#D97706' }}>ADMIN PANEL</span>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }} className="no-scrollbar">
        {!collapsed && <p style={{ fontSize: 10, fontWeight: 700, color: '#A0AEC0', letterSpacing: '0.08em', padding: '8px 12px 4px', margin: 0 }}>ADMINISTRATION</p>}
        {NAV.map(item => <NavItem key={item.to} item={item} collapsed={collapsed} pendingCount={pendingCount} />)}
      </div>

      <div style={{ padding: '10px 10px 16px', borderTop: '1px solid #E5EAF0' }}>
        <button
          onClick={handleLogout}
          className="sidebar-item"
          style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start', color: '#DC2626', border: 'none', background: 'none' }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Logout</motion.span>}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const { sidebarCollapsed, toggleSidebar, mobileMenuOpen, setMobileMenu } = useUIStore();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    adminService.listShops().then((res) => {
      const shops = res.data?.data?.shops ?? res.data?.shops ?? [];
      setPendingCount(shops.filter((s) => s.approval_status === 'PENDING').length);
    }).catch(() => setPendingCount(0));
  }, []);

  return (
    <>
      <motion.aside
        animate={{ width: sidebarCollapsed ? 68 : 240 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        style={{ height: '100vh', background: '#fff', borderRight: '1px solid #E5EAF0', position: 'sticky', top: 0, flexShrink: 0, overflow: 'hidden', boxShadow: '2px 0 8px rgba(21,37,54,0.04)', display: 'none' }}
        id="admin-desktop-sidebar"
      >
        <SidebarContent collapsed={sidebarCollapsed} onToggle={toggleSidebar} isMobile={false} pendingCount={pendingCount} />
      </motion.aside>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(11,23,38,0.5)', zIndex: 200 }} onClick={() => setMobileMenu(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', stiffness: 400, damping: 35 }} style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 260, background: '#fff', zIndex: 201 }}>
              <SidebarContent collapsed={false} onClose={() => setMobileMenu(false)} isMobile={true} pendingCount={pendingCount} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 1024px) {
          #admin-desktop-sidebar { display: block !important; }
        }
      `}</style>
    </>
  );
}
