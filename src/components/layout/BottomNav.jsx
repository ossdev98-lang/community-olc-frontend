import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Plus, MessageSquare, UserCircle } from 'lucide-react';

const TABS = [
  { label: 'Home', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Community', icon: Users, to: '/community' },
  { label: 'Create', icon: Plus, to: '/community/create', isCreate: true },
  { label: 'Inquiries', icon: MessageSquare, to: '/inquiries' },
  { label: 'Profile', icon: UserCircle, to: '/menu' },
];

export default function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 300,
      background: 'rgba(255,255,255,0.96)',
      borderTop: '1px solid rgba(21,37,54,0.08)',
      boxShadow: '0 -8px 28px rgba(21,37,54,0.10)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      display: 'flex', alignItems: 'center',
      paddingBottom: 'env(safe-area-inset-bottom)',
      height: 'calc(66px + env(safe-area-inset-bottom))',
    }}>
      {TABS.map(tab => {
        if (tab.isCreate) {
          return (
            <div key={tab.to} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => navigate('/community/create')}
                style={{
                  width: 50, height: 50, borderRadius: 17,
                  background: 'linear-gradient(135deg, #176FA9, #21AFA9)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(23,111,169,0.4)',
                  marginBottom: 12,
                  color: '#fff',
                }}
              >
                <Plus size={24} color="#fff" strokeWidth={2.5} />
              </motion.button>
            </div>
          );
        }
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, textDecoration: 'none', padding: '7px 0 5px', minHeight: 60, WebkitTapHighlightColor: 'transparent' }}
          >
            {({ isActive }) => (
              <>
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: isActive ? 'linear-gradient(135deg, #EAF3F9, #E7F8F5)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <tab.icon size={20} color={isActive ? '#176FA9' : '#A0AEC0'} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? '#176FA9' : '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
