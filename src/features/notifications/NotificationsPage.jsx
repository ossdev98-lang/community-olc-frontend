import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, MessageSquare, MessageCircle, Clock, Phone, CheckCircle, AlertCircle, Info, Check, CheckCheck, ArrowLeft } from 'lucide-react';
import { notificationService } from '../../services/index.js';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { formatTimeAgo } from '../../utils/index.js';
import LoadingState from '../../components/feedback/LoadingState.jsx';

const ICON_MAP = {
  new_inquiry: { icon: MessageSquare, color: '#176FA9', bg: '#EAF3F9' },
  new_message: { icon: MessageCircle, color: '#21AFA9', bg: '#E7F8F5' },
  expiring_soon: { icon: Clock, color: '#D97706', bg: '#FEF3C7' },
  requirement_expired: { icon: AlertCircle, color: '#DC2626', bg: '#FEF2F2' },
  contact_shared: { icon: Phone, color: '#7C3AED', bg: '#EDE9FE' },
  shop_approved: { icon: CheckCircle, color: '#16A34A', bg: '#DCFCE7' },
  shop_rejected: { icon: AlertCircle, color: '#DC2626', bg: '#FEF2F2' },
  system: { icon: Info, color: '#718096', bg: '#F3F4F6' },
};

const FILTERS = ['All', 'Unread', 'Inquiries', 'Messages', 'System'];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await notificationService.list();
      const data = res.data?.data ?? res.data;
      setNotifications(data.notifications ?? []);
    } catch (err) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const filtered = notifications.filter(n => {
    if (filter === 'Unread') return !n.is_read;
    if (filter === 'Inquiries') return n.type === 'new_inquiry';
    if (filter === 'Messages') return n.type === 'new_message';
    if (filter === 'System') return ['shop_approved', 'shop_rejected', 'system'].includes(n.type);
    return true;
  });

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Mark read failed', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Mark all read failed', err);
    }
  };

  const handleClick = (notif) => {
    handleMarkRead(notif.id);
    if (notif.link) navigate(notif.link);
  };

  if (loading) return <LoadingState label="Loading notifications…" />;

  return (
    <div className="notifications-page" style={{ maxWidth: 700 }}>
      <div className="notifications-heading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <button className="mobile-page-back" onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeft size={16} /><span>Back</span></button>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Notifications</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead} icon={<CheckCheck size={14} />}>
            Mark all read
          </Button>
        )}
      </div>

      <div className="notifications-filters no-scrollbar" style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#F4F7FA', borderRadius: 12, padding: 4 }}>
        {FILTERS.map(f => (
          <button
            key={f}
            className="notifications-filter"
            onClick={() => setFilter(f)}
            style={{
              flex: 1, padding: '8px 10px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
              background: filter === f ? '#fff' : 'transparent',
              color: filter === f ? '#176FA9' : '#718096',
              boxShadow: filter === f ? '0 1px 4px rgba(21,37,54,0.08)' : 'none',
              transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bell size={32} />}
          title="No notifications"
          description="You're all caught up! New notifications will appear here."
        />
      ) : (
        <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((notif, i) => {
            const cfg = ICON_MAP[notif.type] || ICON_MAP.system;
            const Icon = cfg.icon;
            return (
              <motion.div
                key={notif.id}
                className="notification-row"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => handleClick(notif)}
                style={{
                  display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
                  background: notif.is_read ? '#fff' : '#EAF3F9',
                  border: `1px solid ${notif.is_read ? '#E5EAF0' : '#BFD9EC'}`,
                  transition: 'background 0.15s',
                }}
              >
                <div className="notification-icon" style={{ width: 42, height: 42, borderRadius: 12, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={cfg.color} />
                </div>
                <div className="notification-copy" style={{ flex: 1, minWidth: 0 }}>
                  <div className="notification-row-heading" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: notif.is_read ? 500 : 700, color: '#152536' }}>{notif.title}</p>
                    <span style={{ fontSize: 11, color: '#A0AEC0', flexShrink: 0 }}>{formatTimeAgo(notif.createdAt)}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#718096', lineHeight: 1.5 }}>{notif.message}</p>
                </div>
                {!notif.is_read && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#176FA9', flexShrink: 0, marginTop: 6 }} />
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
