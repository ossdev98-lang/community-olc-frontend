import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, FileText, MessageSquare, Store,
  Bookmark, Bell, UserCircle, HelpCircle, Settings, LogOut,
  ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import OLCLogo from '../ui/Logo.jsx';
import Avatar from '../ui/Avatar.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { useUIStore } from '../../store/uiStore.js';
import { notificationService } from '../../services/index.js';

const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Community Feed', icon: Users, to: '/community' },
  { label: 'My Requirements', icon: FileText, to: '/requirements' },
  { label: 'Private Inquiries', icon: MessageSquare, to: '/inquiries' },
  { label: 'Shop Directory', icon: Store, to: '/shops' },
];
const TOOLS = [
  { label: 'Saved Posts', icon: Bookmark, to: '/saved' },
  { label: 'Notifications', icon: Bell, to: '/notifications', badge: true },
  { label: 'My Shop Profile', icon: UserCircle, to: '/profile' },
];

function NavItem({ item, collapsed, unread }) {
  const count = item.badge ? unread : 0;
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
      style={{ justifyContent: collapsed ? 'center' : 'flex-start', position: 'relative' }}
      title={collapsed ? item.label : undefined}
    >
      <item.icon size={18} style={{ flexShrink: 0 }} />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            style={{ overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      {count > 0 && (
        <span style={{
          position: collapsed ? 'absolute' : 'static',
          top: collapsed ? 4 : undefined, right: collapsed ? 4 : undefined,
          marginLeft: collapsed ? 0 : 'auto',
          background: 'linear-gradient(135deg, #176FA9, #21AFA9)',
          color: '#fff', borderRadius: 99, fontSize: 10, fontWeight: 700,
          padding: '1px 6px', minWidth: 18, textAlign: 'center',
        }}>
          {count > 9 ? '9+' : count}
        </span>
      )}
    </NavLink>
  );
}

function SidebarContent({ collapsed, onToggle, onClose, isMobile, unread }) {
  const { user, logout } = useAuthStore();
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
          <button onClick={onToggle} style={{ background: '#F4F7FA', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex', color: '#718096', flexShrink: 0 }}>
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }} className="no-scrollbar">
        <div style={{ marginBottom: 8 }}>
          {!collapsed && <p style={{ fontSize: 10, fontWeight: 700, color: '#A0AEC0', letterSpacing: '0.08em', padding: '8px 12px 4px', margin: 0 }}>MAIN</p>}
          {NAV.map(item => <NavItem key={item.to} item={item} collapsed={collapsed} unread={unread} />)}
        </div>
        <div style={{ marginBottom: 8 }}>
          {!collapsed && <p style={{ fontSize: 10, fontWeight: 700, color: '#A0AEC0', letterSpacing: '0.08em', padding: '8px 12px 4px', margin: 0 }}>TOOLS</p>}
          {TOOLS.map(item => <NavItem key={item.to} item={item} collapsed={collapsed} unread={unread} />)}
        </div>
      </div>

      <div style={{ padding: '10px 10px 16px', borderTop: '1px solid #E5EAF0' }}>
        <NavItem item={{ label: 'Help & Support', icon: HelpCircle, to: '/help' }} collapsed={collapsed} unread={0} />
        <NavItem item={{ label: 'Settings', icon: Settings, to: '/settings' }} collapsed={collapsed} unread={0} />

        <div style={{ margin: '8px 0 4px', padding: '10px 12px', borderRadius: 10, background: 'linear-gradient(135deg, #EAF3F9, #E7F8F5)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={user?.ownerName || user?.name} size={32} />
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#152536', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.ownerName || user?.name}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: '#718096', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name || user?.shopName}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={handleLogout}
          className="sidebar-item"
          style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start', color: '#DC2626', border: 'none', background: 'none' }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Logout</motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, mobileMenuOpen, setMobileMenu } = useUIStore();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationService.unreadCount().then((res) => {
      const count = res.data?.data?.unreadCount ?? res.data?.unreadCount ?? 0;
      setUnread(count);
    }).catch(() => setUnread(0));
  }, []);

  return (
    <>
      <motion.aside
        animate={{ width: sidebarCollapsed ? 68 : 240 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        style={{
          height: '100vh', background: '#FFFFFF', borderRight: '1px solid #E5EAF0',
          position: 'sticky', top: 0, flexShrink: 0, overflow: 'hidden',
          boxShadow: '2px 0 8px rgba(21,37,54,0.04)',
          display: 'none',
        }}
        id="desktop-sidebar"
      >
        <SidebarContent collapsed={sidebarCollapsed} onToggle={toggleSidebar} isMobile={false} unread={unread} />
      </motion.aside>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(11,23,38,0.5)', zIndex: 200 }}
              onClick={() => setMobileMenu(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 260, background: '#fff', zIndex: 201, boxShadow: '4px 0 24px rgba(11,23,54,0.15)' }}
            >
              <SidebarContent collapsed={false} onClose={() => setMobileMenu(false)} isMobile={true} unread={unread} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 1024px) {
          #desktop-sidebar { display: block !important; }
        }
      `}</style>
    </>
  );
}
