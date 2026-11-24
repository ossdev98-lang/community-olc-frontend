import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, Users, FileText, MessageSquare, TrendingUp, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { adminService } from '../../services/index.js';
import LoadingState from '../../components/feedback/LoadingState.jsx';
import Card from '../../components/ui/Card.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { formatTimeAgo } from '../../utils/index.js';

const registrationData = [
  { month: 'Jan', shops: 12 }, { month: 'Feb', shops: 19 }, { month: 'Mar', shops: 15 },
  { month: 'Apr', shops: 28 }, { month: 'May', shops: 22 }, { month: 'Jun', shops: 35 },
  { month: 'Jul', shops: 41 },
];

const requirementData = [
  { day: 'Mon', posted: 18, expired: 12 }, { day: 'Tue', posted: 24, expired: 18 },
  { day: 'Wed', posted: 31, expired: 22 }, { day: 'Thu', posted: 27, expired: 19 },
  { day: 'Fri', posted: 38, expired: 28 }, { day: 'Sat', posted: 22, expired: 15 },
  { day: 'Sun', posted: 14, expired: 10 },
];

const categoryData = [
  { name: 'Laptop Parts', value: 32, color: '#176FA9' },
  { name: 'RAM & SSD', value: 24, color: '#21AFA9' },
  { name: 'Displays', value: 18, color: '#7C3AED' },
  { name: 'Processors', value: 14, color: '#D97706' },
  { name: 'Others', value: 12, color: '#E5EAF0' },
];

function StatCard({ icon: Icon, label, value, sub, color, bg, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E5EAF0', boxShadow: '0 1px 3px rgba(21,37,54,0.06)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={color} />
        </div>
        {trend && <span style={{ fontSize: 11, fontWeight: 600, color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: 99 }}>{trend}</span>}
      </div>
      <p style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>{value}</p>
      <p style={{ margin: '0 0 2px', fontSize: 13, color: '#718096', fontWeight: 500 }}>{label}</p>
      {sub && <p style={{ margin: 0, fontSize: 11, color: '#A0AEC0' }}>{sub}</p>}
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalShops: 0, approvedShops: 0, pendingApprovals: 0, activeRequirements: 0,
    expiredRequirements: 0, totalInquiries: 0, suspendedShops: 0,
  });
  const [pendingShops, setPendingShops] = useState([]);
  const [recentShops, setRecentShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [dRes, sRes] = await Promise.all([
          adminService.dashboard(),
          adminService.listShops(),
        ]);
        const dData = dRes.data?.data ?? dRes.data;
        setStats({
          totalShops: dData.totalShops ?? 0,
          approvedShops: dData.approvedShops ?? 0,
          pendingApprovals: dData.pendingApprovals ?? 0,
          activeRequirements: dData.activeRequirements ?? 0,
          expiredRequirements: dData.expiredRequirements ?? 0,
          totalInquiries: dData.totalInquiries ?? 0,
          suspendedShops: dData.suspendedShops ?? 0,
        });
        const sData = sRes.data?.data ?? sRes.data;
        const shops = sData.shops ?? [];
        setPendingShops(shops.filter(s => s.approval_status === 'PENDING'));
        setRecentShops(shops.slice(-4).reverse());
      } catch (err) {
        console.error('Admin dashboard load failed', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingState label="Loading admin dashboard…" />;

  const statCards = [
    { icon: Store, label: 'Total Shops', value: stats.totalShops, sub: `${stats.approvedShops} approved`, color: '#176FA9', bg: '#EAF3F9', trend: '+3 this week' },
    { icon: Clock, label: 'Pending Approvals', value: stats.pendingApprovals, sub: 'Awaiting review', color: '#D97706', bg: '#FEF3C7' },
    { icon: FileText, label: 'Active Requirements', value: stats.activeRequirements, sub: `${stats.expiredRequirements} expired`, color: '#21AFA9', bg: '#E7F8F5', trend: '+8 today' },
    { icon: MessageSquare, label: 'Total Inquiries', value: stats.totalInquiries, sub: 'Private conversations', color: '#7C3AED', bg: '#EDE9FE', trend: '+12 today' },
    { icon: AlertTriangle, label: 'Suspended Shops', value: stats.suspendedShops, sub: 'Under review', color: '#DC2626', bg: '#FEF2F2' },
    { icon: ShieldCheck, label: 'Verified Shops', value: recentShops.filter(s => s.is_verified).length + 4, sub: 'Verified businesses', color: '#16A34A', bg: '#DCFCE7' },
  ];

  return (
    <div style={{ maxWidth: 1200 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Admin Dashboard</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>Platform overview and management</p>
      </div>

      <div className="admin-stats-grid" style={{ marginBottom: 28 }}>
        {statCards.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className="admin-charts-grid">
        <Card>
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Shop Registrations</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={registrationData}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#176FA9" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#176FA9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F4F7FA" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A0AEC0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#A0AEC0' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E5EAF0', fontSize: 12 }} />
              <Area type="monotone" dataKey="shops" stroke="#176FA9" strokeWidth={2} fill="url(#grad1)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Weekly Requirements</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={requirementData} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F4F7FA" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#A0AEC0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#A0AEC0' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E5EAF0', fontSize: 12 }} />
              <Bar dataKey="posted" fill="#176FA9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expired" fill="#E5EAF0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="admin-bottom-grid">
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Category Distribution</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E5EAF0', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {categoryData.map(c => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} />
                  <span style={{ fontSize: 11, color: '#718096' }}>{c.name}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#152536' }}>{c.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Pending Approvals</h3>
            <Badge variant="warning">{pendingShops.length}</Badge>
          </div>
          {pendingShops.length === 0 ? (
            <p style={{ fontSize: 13, color: '#A0AEC0', textAlign: 'center', padding: '20px 0' }}>All caught up!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pendingShops.map(shop => (
                <div key={shop.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Avatar name={shop.shop_name} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#152536', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shop.shop_name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#718096' }}>{shop.city} · {formatTimeAgo(new Date(shop.createdAt).getTime())}</p>
                  </div>
                  <Badge variant="warning" size="xs">Pending</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Recent Members</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentShops.map(shop => (
              <div key={shop.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Avatar name={shop.shop_name} size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#152536', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shop.shop_name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#718096' }}>{shop.city}</p>
                </div>
                {shop.is_verified ? <Badge variant="teal" size="xs">✓</Badge> : <Badge variant="default" size="xs">New</Badge>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
