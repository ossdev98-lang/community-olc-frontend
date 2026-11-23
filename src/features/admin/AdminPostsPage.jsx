import { useState, useMemo, useEffect } from 'react';
import { Search, EyeOff, Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/index.js';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { formatTimeAgo, formatTimeRemaining, getUrgencyStyles } from '../../utils/index.js';
import { CATEGORY_COLORS } from '../../constants/index.js';
import { toast } from 'sonner';

const TABS = ['All', 'Active', 'Expired', 'Closed'];

export default function AdminPostsPage() {
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [hidden, setHidden] = useState([]);
  const [reqs, setReqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminService.listRequirements();
        const data = res.data?.data ?? res.data;
        setReqs(data.requirements ?? []);
      } catch (err) {
        setReqs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = reqs;
    if (tab === 'Active') list = list.filter(r => r.status === 'ACTIVE' && new Date(r.expires_at) > Date.now());
    if (tab === 'Expired') list = list.filter(r => new Date(r.expires_at) <= Date.now() || r.status === 'EXPIRED');
    if (tab === 'Closed') list = list.filter(r => r.status === 'CLOSED');
    if (search) list = list.filter(r => r.title.toLowerCase().includes(search.toLowerCase()) || (r.shop?.shop_name || '').toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [reqs, tab, search]);

  const toggleHide = async (id) => {
    try {
      if (hidden.includes(id)) {
        await adminService.unhideRequirement(id);
        toast.success('Post restored');
      } else {
        await adminService.hideRequirement(id);
        toast.success('Post hidden from feed');
      }
      setHidden(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return null;

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Post Moderation</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>{reqs.length} total requirements</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts..." className="input-field" style={{ paddingLeft: 38 }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#F4F7FA', borderRadius: 12, padding: 4 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '8px 12px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
            background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#176FA9' : '#718096',
            boxShadow: tab === t ? '0 1px 4px rgba(21,37,54,0.08)' : 'none', transition: 'all 0.15s',
          }}>{t}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(req => {
          const { text: timeText, urgency } = formatTimeRemaining(req.expires_at);
          const urg = getUrgencyStyles(urgency);
          const catColor = CATEGORY_COLORS[req.category] || CATEGORY_COLORS['Other'];
          const isHidden = hidden.includes(req.id);

          return (
            <div key={req.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5EAF0', padding: '14px 18px', opacity: isHidden ? 0.5 : 1 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <Avatar name={req.shop?.shop_name} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#152536' }}>{req.title}</p>
                    <Badge style={{ background: catColor.bg, color: catColor.text }}>{req.category?.name || req.category?.label || req.category}</Badge>
                    {isHidden && <Badge variant="danger" size="xs">Hidden</Badge>}
                  </div>
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: '#718096' }}>{req.shop?.shop_name} · {req.city}</span>
                    <span style={{ fontSize: 12, color: '#718096' }}>{req.inquiryCount ?? 0} inquiries</span>
                    <span style={{ fontSize: 12, color: '#718096' }}>Posted {formatTimeAgo(req.published_at)}</span>
                    <span style={{ fontSize: 12, color: urg.text, fontWeight: 600 }}>{timeText}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => toggleHide(req.id)}
                    style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, background: isHidden ? '#DCFCE7' : '#FEF2F2', color: isHidden ? '#16A34A' : '#DC2626' }}
                  >
                    {isHidden ? <><Eye size={12} /> Restore</> : <><EyeOff size={12} /> Hide</>}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#A0AEC0', fontSize: 14 }}>No posts found</div>
        )}
      </div>
    </div>
  );
}
