import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import OLCLogo from '../ui/Logo.jsx';
import Avatar from '../ui/Avatar.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { notificationService } from '../../services/index.js';

const BACK_ROUTES = ['/community/create', '/profile', '/settings', '/help', '/saved', '/notifications'];

export default function MobileHeader() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationService.unreadCount().then((res) => {
      const count = res.data?.data?.unreadCount ?? res.data?.unreadCount ?? 0;
      setUnread(count);
    }).catch(() => setUnread(0));
  }, []);

  const path = location.pathname;
  const isDashboard = path === '/dashboard';
  const isDetail = path.startsWith('/requirements/') || path.startsWith('/shops/') || path.startsWith('/inquiries/');
  const isBackRoute = BACK_ROUTES.includes(path) || isDetail;

  return (
    <header style={{
      minHeight: 60, paddingTop: 'env(safe-area-inset-top)', background: 'rgba(255,255,255,0.96)', borderBottom: '1px solid rgba(21,37,54,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', position: 'sticky', top: 0, zIndex: 200,
      boxShadow: '0 4px 18px rgba(21,37,54,0.045)',
      backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        {isBackRoute && (
          <button onClick={() => navigate(-1)} style={{ background: '#F4F7FA', border: 'none', borderRadius: 9, padding: 8, cursor: 'pointer', display: 'flex', color: '#152536', flexShrink: 0 }}>
            <ArrowLeft size={18} />
          </button>
        )}
        {isDashboard && <OLCLogo size={30} showText />}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button aria-label="Notifications" onClick={() => navigate('/notifications')} style={{ position: 'relative', background: '#F4F7FA', border: 'none', borderRadius: 11, padding: 10, cursor: 'pointer', display: 'flex', color: '#526579', minWidth: 40, minHeight: 40, alignItems: 'center', justifyContent: 'center' }}>
          <Bell size={18} />
          {unread > 0 && <span style={{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, background: '#DC2626', borderRadius: '50%', border: '1.5px solid #fff' }} />}
        </button>
        <button aria-label="Open profile menu" onClick={() => navigate('/menu')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 2, borderRadius: 99 }}>
          <Avatar name={user?.ownerName || user?.name} size={32} />
        </button>
      </div>
    </header>
  );
}
