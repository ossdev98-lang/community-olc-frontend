import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, MessageSquare, Bell, Clock, Plus, ArrowRight, TrendingUp, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { requirementService, inquiryService, shopService, notificationService } from '../../services/index.js';
import Card from '../../components/ui/Card.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { formatTimeAgo, formatTimeRemaining, getUrgencyStyles } from '../../utils/index.js';
import { CATEGORY_COLORS } from '../../constants/index.js';
import RequirementCard from '../community/RequirementCard.jsx';

function StatCard({ icon: Icon, label, value, change, color, bg }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(23,111,169,0.12)' }}
      className="dashboard-stat-card"
      style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E5EAF0', boxShadow: '0 1px 3px rgba(21,37,54,0.06)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={color} />
        </div>
        {change && (
          <span style={{ fontSize: 11, fontWeight: 600, color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: 99 }}>
            {change}
          </span>
        )}
      </div>
      <p style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>{value}</p>
      <p style={{ margin: 0, fontSize: 13, color: '#718096', fontWeight: 500 }}>{label}</p>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [myReqs, setMyReqs] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [reqRes, myRes, convRes, shopRes] = await Promise.all([
          requirementService.list({ active: 'true', limit: 6 }),
          requirementService.list({ mine: 'true', active: 'true' }),
          inquiryService.list(),
          shopService.list({ limit: 5 }),
        ]);
        setRequirements(reqRes.data.requirements ?? []);
        setMyReqs(myRes.data.requirements ?? []);
        setConversations(convRes.data.conversations ?? []);
        setShops(shopRes.data.shops ?? []);
      } catch (err) {
        console.error('Dashboard load failed', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = (user?.ownerName || user?.name || 'there').split(' ')[0];

  const stats = [
    { icon: FileText, label: 'Active Requirements', value: myReqs.length, change: '+2 today', color: '#176FA9', bg: '#EAF3F9' },
    { icon: MessageSquare, label: 'New Inquiries', value: conversations.filter(c => (c.unreadCount || 0) > 0).length, change: 'Today', color: '#21AFA9', bg: '#E7F8F5' },
    { icon: Bell, label: 'Unread Messages', value: conversations.reduce((a, c) => a + (c.unreadCount || 0), 0), color: '#7C3AED', bg: '#EDE9FE' },
    { icon: Clock, label: 'Expiring Soon', value: myReqs.filter(r => new Date(r.expires_at || r.expiresAt) - Date.now() < 21600000).length, color: '#D97706', bg: '#FEF3C7' },
  ];

  return (
    <div style={{ maxWidth: 1100 }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-welcome"
        style={{ background: 'linear-gradient(135deg, #0B1726 0%, #176FA9 60%, #21AFA9 100%)', borderRadius: 20, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -30, right: 80, width: 120, height: 120, borderRadius: '50%', background: 'rgba(33,175,169,0.2)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ margin: '0 0 4px', fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{greeting},</p>
          <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#fff' }}>{firstName}! 👋</h1>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>Here's what's happening in your business community today.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button onClick={() => navigate('/community/create')} variant="dark" style={{ background: '#fff', color: '#176FA9' }} icon={<Plus size={15} />}>
              Post Requirement
            </Button>
            <Button onClick={() => navigate('/community')} variant="ghost" style={{ background: 'rgba(255,255,255,0.94)', color: '#0C5772', border: '1px solid rgba(255,255,255,0.9)' }} icon={<Users size={15} />}>
              Browse Community
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className="dashboard-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Recent Community Requirements</h2>
              <button onClick={() => navigate('/community')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#176FA9', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {requirements.map(req => <RequirementCard key={req.id} requirement={req} compact />)}
            </div>
          </div>

          {myReqs.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>My Active Requirements</h2>
                <button onClick={() => navigate('/requirements')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#176FA9', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                  Manage <ArrowRight size={14} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {myReqs.map(req => {
                  const { text, urgency } = formatTimeRemaining(req.expires_at || req.expiresAt);
                  const urg = getUrgencyStyles(urgency);
                  const catColor = CATEGORY_COLORS[req.category] || CATEGORY_COLORS['Other'];
                  return (
                    <Card key={req.id} hover onClick={() => navigate(`/requirements/${req.id}`)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: catColor.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FileText size={20} color={catColor.text} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#152536', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.title}</p>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: '#718096' }}>{req.inquiryCount} inquiries</span>
                            <span style={{ fontSize: 12, color: urg.text, background: urg.bg, padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>{text}</span>
                          </div>
                        </div>
                        <ArrowRight size={16} color="#A0AEC0" />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Recent Inquiries</h3>
              <button onClick={() => navigate('/inquiries')} style={{ fontSize: 12, color: '#176FA9', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>View all</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {conversations.map(conv => {
                const unread = conv.unreadCount || 0;
                return (
                  <div
                    key={conv.id}
                    onClick={() => navigate(`/inquiries/${conv.id}`)}
                    style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', background: unread > 0 ? '#EAF3F9' : '#F9FAFB', transition: 'background 0.15s' }}
                  >
                    <Avatar name={conv.shop_name || conv.requirement?.shop?.shop_name || 'Shop'} size={36} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#152536', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.requirement?.title || conv.shop_name || 'Inquiry'}</p>
                        <span style={{ fontSize: 11, color: '#A0AEC0', flexShrink: 0 }}>{formatTimeAgo(conv.lastMessageAt || conv.createdAt)}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: '#718096', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.lastMessage}</p>
                    </div>
                    {unread > 0 && (
                      <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#176FA9', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{unread}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Community Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { text: 'SpareHub India posted a new requirement', time: '5m ago', color: '#176FA9' },
                { text: 'Digital Hub Solutions responded to 3 requirements', time: '12m ago', color: '#21AFA9' },
                { text: 'PC World Hyderabad joined the community', time: '1h ago', color: '#7C3AED' },
                { text: '8 new requirements posted today', time: '2h ago', color: '#D97706' },
              ].map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color, marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: '#152536', lineHeight: 1.5 }}>{a.text}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#A0AEC0' }}>{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Active Shops</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {shops.slice(1, 5).map(shop => (
                <div key={shop.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Avatar name={shop.shop_name} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#152536', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shop.shop_name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#718096' }}>{shop.city} · Verified</p>
                  </div>
                  {shop.is_verified && <Badge variant="teal" size="xs">✓</Badge>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
