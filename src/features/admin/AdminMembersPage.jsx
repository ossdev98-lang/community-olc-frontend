import { useState, useMemo, useEffect } from 'react';
import { Search, CheckCircle, ShieldOff, ShieldCheck, Eye, MapPin } from 'lucide-react';
import { adminService } from '../../services/index.js';
import LoadingState from '../../components/feedback/LoadingState.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { formatTimeAgo } from '../../utils/index.js';
import { toast } from 'sonner';

export default function AdminMembersPage() {
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminService.listShops();
        const data = res.data?.data ?? res.data;
        setShops(data.shops ?? []);
      } catch (err) {
        setShops([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = shops;
    if (search) list = list.filter(s =>
      (s.shop_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.owner_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.city || '').toLowerCase().includes(search.toLowerCase())
    );
    if (filter === 'verified') list = list.filter(s => s.is_verified);
    if (filter === 'unverified') list = list.filter(s => !s.is_verified);
    if (filter === 'suspended') list = list.filter(s => s.approval_status === 'SUSPENDED');
    return list;
  }, [shops, search, filter]);

  const handleSuspend = async (id) => {
    try {
      await adminService.suspendShop(id);
      const res = await adminService.listShops();
      const data = res.data?.data ?? res.data;
      setShops(data.shops ?? []);
      toast.success('Shop suspended');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to suspend');
    }
  };

  const handleReactivate = async (id) => {
    try {
      await adminService.reactivateShop(id);
      const res = await adminService.listShops();
      const data = res.data?.data ?? res.data;
      setShops(data.shops ?? []);
      toast.success('Shop reactivated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reactivate');
    }
  };

  if (loading) return <LoadingState label="Loading members…" variant="table" />;

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Member Management</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>{shops.length} members</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..." className="input-field" style={{ paddingLeft: 38 }} />
        </div>
        {['all', 'verified', 'unverified', 'suspended'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: filter === f ? 'linear-gradient(135deg, #176FA9, #21AFA9)' : '#fff',
            color: filter === f ? '#fff' : '#718096',
            border: filter === f ? 'none' : '1.5px solid #E5EAF0',
            textTransform: 'capitalize',
          }}>{f}</button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5EAF0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5EAF0' }}>
              {['Shop', 'Owner', 'Location', 'Specializations', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#A0AEC0', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((shop, i) => (
              <tr key={shop.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F4F7FA' : 'none' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={shop.shop_name} size={36} />
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#152536' }}>{shop.shop_name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#A0AEC0' }}>{shop.business_type}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#718096' }}>{shop.owner_name}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ fontSize: 12, color: '#718096', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={11} /> {shop.city}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {(shop.specializations || []).slice(0, 2).map(s => <Badge key={s} variant="primary" size="xs">{s}</Badge>)}
                    {(shop.specializations || []).length > 2 && <Badge variant="default" size="xs">+{(shop.specializations || []).length - 2}</Badge>}
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {shop.approval_status === 'SUSPENDED' ? (
                    <Badge variant="danger">Suspended</Badge>
                  ) : shop.is_verified ? (
                    <Badge variant="teal"><CheckCircle size={10} /> Verified</Badge>
                  ) : (
                    <Badge variant="default">Active</Badge>
                  )}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 12, color: '#A0AEC0' }}>
                  {formatTimeAgo(new Date(shop.createdAt).getTime())}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {shop.approval_status !== 'SUSPENDED' ? (
                      <button
                        onClick={() => handleSuspend(shop.id)}
                        style={{ padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600, background: '#FEF2F2', color: '#DC2626', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <ShieldOff size={11} /> Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReactivate(shop.id)}
                        style={{ padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600, background: '#DCFCE7', color: '#16A34A', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <ShieldCheck size={11} /> Reactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#A0AEC0', fontSize: 14 }}>No members found</div>
        )}
      </div>
    </div>
  );
}
