import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Store, Bookmark, Bell, Settings, HelpCircle,
  LogOut, ChevronRight, CheckCircle, ShieldCheck, Download,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { notificationService } from '../../services/index.js';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';

const MENU_SECTIONS = [
  {
    title: 'My Business',
    items: [
      { label: 'My Requirements', icon: FileText, to: '/requirements', desc: 'Manage your posted requirements' },
      { label: 'Shop Directory', icon: Store, to: '/shops', desc: 'Browse verified computer shops' },
      { label: 'Saved Posts', icon: Bookmark, to: '/saved', desc: 'Your bookmarked requirements' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Notifications', icon: Bell, to: '/notifications', badge: true },
      { label: 'Settings', icon: Settings, to: '/settings', desc: 'Account & privacy settings' },
      { label: 'Help & Support', icon: HelpCircle, to: '/help', desc: 'FAQs and contact support' },
    ],
  },
];

export default function MobileProfileMenuPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationService.unreadCount().then((res) => {
      const count = res.data?.data?.unreadCount ?? res.data?.unreadCount ?? 0;
      setUnread(count);
    }).catch(() => setUnread(0));
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };
  const appInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  return (
    <div style={{ paddingBottom: 80 }}>
      <div
        onClick={() => navigate('/profile')}
        style={{
          background: 'linear-gradient(135deg, #0B1726 0%, #176FA9 60%, #21AFA9 100%)',
          padding: '24px 20px 20px',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ border: '3px solid rgba(255,255,255,0.3)', borderRadius: '50%' }}>
            <Avatar name={user?.ownerName || user?.name} size={56} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.ownerName || user?.name}
              </h2>
              {user?.shop?.is_verified && <CheckCircle size={15} color="#21AFA9" />}
            </div>
            <p style={{ margin: '0 0 4px', fontSize: 13, color: 'rgba(255,255,255,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.shopName || user?.shop_name || ''}</p>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{user?.shop?.city || ''}, {user?.shop?.state || ''}</p>
          </div>
          <ChevronRight size={18} color="rgba(255,255,255,0.5)" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 20 }}>
          {[
            { label: 'Active Reqs', value: 0 },
            { label: 'Total Reqs', value: 0 },
            { label: 'Notifications', value: unread },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 2px', fontSize: 20, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#fff' }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {MENU_SECTIONS.map(section => (
          <div key={section.title} style={{ marginBottom: 20 }}>
            <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#A0AEC0', letterSpacing: '0.08em', textTransform: 'uppercase', paddingLeft: 4 }}>
              {section.title}
            </p>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5EAF0', overflow: 'hidden' }}>
              {section.items.map((item, i) => {
                const itemUnread = item.badge ? unread : 0;
                return (
                  <motion.div
                    key={item.to}
                    whileTap={{ backgroundColor: '#F4F7FA' }}
                    onClick={() => navigate(item.to)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                      borderBottom: i < section.items.length - 1 ? '1px solid #F4F7FA' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: '#EAF3F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <item.icon size={18} color="#176FA9" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#152536' }}>{item.label}</p>
                      {item.desc && <p style={{ margin: 0, fontSize: 12, color: '#A0AEC0' }}>{item.desc}</p>}
                    </div>
                    {itemUnread > 0 && (
                      <span style={{ background: '#176FA9', color: '#fff', borderRadius: 99, fontSize: 11, fontWeight: 700, padding: '2px 8px', flexShrink: 0 }}>{itemUnread}</span>
                    )}
                    <ChevronRight size={16} color="#CBD5E0" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '14px', borderRadius: 14, background: '#FEF2F2',
            border: '1px solid #FECACA', cursor: 'pointer', marginBottom: 16,
          }}
        >
          <LogOut size={18} color="#DC2626" />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#DC2626' }}>Logout</span>
        </motion.button>

        {!appInstalled && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            className="profile-install-app-button"
            onClick={() => window.dispatchEvent(new Event('olc:show-install-prompt'))}
          >
            <Download size={17} />
            Install app
            <ChevronRight size={16} />
          </motion.button>
        )}

        <p style={{ textAlign: 'center', fontSize: 11, color: '#CBD5E0', marginBottom: 8 }}>
          Ozone Lapcare Community v1.0
        </p>
      </div>
    </div>
  );
}
