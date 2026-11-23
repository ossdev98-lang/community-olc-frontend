import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, Plus, ChevronDown } from 'lucide-react';
import Avatar from '../ui/Avatar.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { useUIStore } from '../../store/uiStore.js';
import { notificationService } from '../../services/index.js';

export default function Header({ title, subtitle }) {
  const { user } = useAuthStore();
  const { setMobileMenu } = useUIStore();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationService.unreadCount().then((res) => {
      const count = res.data?.data?.unreadCount ?? res.data?.unreadCount ?? 0;
      setUnread(count);
    }).catch(() => setUnread(0));
  }, []);

  const firstName = (user?.ownerName || user?.name || '').split(' ')[0];

  return (
    <header style={{
      height: 64, background: '#fff', borderBottom: '1px solid #E5EAF0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 1px 3px rgba(21,37,54,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => setMobileMenu(true)}
          id="mobile-menu-btn"
          style={{ background: '#F4F7FA', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex', color: '#718096' }}
        >
          <Menu size={18} />
        </button>
        <div>
          {title && <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>{title}</h1>}
          {subtitle && <p style={{ margin: 0, fontSize: 12, color: '#718096' }}>{subtitle}</p>}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={() => navigate('/community/create')}
          id="post-req-btn"
          style={{
            background: 'linear-gradient(135deg, #176FA9, #21AFA9)', color: '#fff',
            border: 'none', borderRadius: 10, padding: '8px 16px', cursor: 'pointer',
            alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600,
            display: 'none',
          }}
        >
          <Plus size={15} style={{ verticalAlign: 'middle' }} /> Post Requirement
        </button>

        <button
          onClick={() => navigate('/notifications')}
          style={{ position: 'relative', background: '#F4F7FA', border: 'none', borderRadius: 10, padding: 9, cursor: 'pointer', display: 'flex', color: '#718096' }}
        >
          <Bell size={18} />
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: 4, right: 4, width: 8, height: 8,
              background: '#DC2626', borderRadius: '50%', border: '2px solid #fff',
            }} />
          )}
        </button>

        <button
          onClick={() => navigate('/profile')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F4F7FA', border: 'none', borderRadius: 10, padding: '6px 10px', cursor: 'pointer' }}
        >
          <Avatar name={user?.ownerName || user?.name} size={28} />
          <span id="header-name" style={{ fontSize: 13, fontWeight: 600, color: '#152536', display: 'none' }}>{firstName}</span>
          <ChevronDown size={14} style={{ color: '#718096', display: 'none' }} id="header-chevron" />
        </button>
      </div>

      <style>{`
        @media (min-width: 640px) {
          #post-req-btn { display: flex !important; }
          #header-name { display: block !important; }
          #header-chevron { display: block !important; }
        }
        @media (min-width: 1024px) {
          #mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </header>
  );
}
