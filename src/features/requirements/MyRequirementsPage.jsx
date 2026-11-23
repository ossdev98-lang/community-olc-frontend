import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Clock, CheckCircle, XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { requirementService } from '../../services/index.js';
import { useAuthStore } from '../../store/authStore.js';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { formatTimeAgo, formatTimeRemaining, getUrgencyStyles } from '../../utils/index.js';
import { CATEGORY_COLORS } from '../../constants/index.js';
import { toast } from 'sonner';

const TABS = ['All', 'Active', 'Expiring Soon', 'Expired', 'Closed'];

export default function MyRequirementsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('All');
  const [reqs, setReqs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await requirementService.list({ mine: 'true' });
      const data = res.data?.data ?? res.data;
      setReqs(data.requirements ?? []);
    } catch (err) {
      setReqs([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = reqs.filter(r => {
    if (tab === 'All') return true;
    if (tab === 'Active') return r.status === 'ACTIVE' && new Date(r.expires_at || r.expiresAt) > Date.now();
    if (tab === 'Expiring Soon') return r.status === 'ACTIVE' && new Date(r.expires_at || r.expiresAt) > Date.now() && new Date(r.expires_at || r.expiresAt) - Date.now() < 21600000;
    if (tab === 'Expired') return r.status === 'EXPIRED' || (r.status === 'ACTIVE' && new Date(r.expires_at || r.expiresAt) <= Date.now());
    if (tab === 'Closed') return r.status === 'CLOSED';
    return true;
  });

  const handleClose = async (id, e) => {
    e.stopPropagation();
    try {
      await requirementService.close(id);
      load();
      toast.success('Requirement closed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close');
    }
  };

  const handleRenew = async (id, e) => {
    e.stopPropagation();
    try {
      await requirementService.renew(id, 24);
      load();
      toast.success('Renewed for 24 hours');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to renew');
    }
  };

  if (loading) return null;

  return (
    <div className="my-requirements-page" style={{ maxWidth: 900 }}>
      <div className="my-requirements-heading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <button className="mobile-page-back" onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeft size={16} /><span>Back</span></button>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>My Requirements</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>Manage your posted requirements</p>
        </div>
        <Button onClick={() => navigate('/community/create')} icon={<Plus size={15} />}>Post New</Button>
      </div>

      <div className="my-requirements-tabs no-scrollbar" style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#F4F7FA', borderRadius: 12, padding: 4 }}>
        {TABS.map(t => (
          <button
            key={t}
            className="my-requirements-tab"
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
              background: tab === t ? '#fff' : 'transparent',
              color: tab === t ? '#176FA9' : '#718096',
              boxShadow: tab === t ? '0 1px 4px rgba(21,37,54,0.08)' : 'none',
              transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText size={32} />}
          title={`No ${tab.toLowerCase()} requirements`}
          description="Post a requirement to let the community know what you need."
          action={() => navigate('/community/create')}
          actionLabel="Post Requirement"
        />
      ) : (
        <div className="my-requirements-list" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(req => {
            const { text: timeText, urgency } = formatTimeRemaining(req.expires_at || req.expiresAt);
            const urg = getUrgencyStyles(urgency);
            const catColor = CATEGORY_COLORS[req.category] || CATEGORY_COLORS['Other'];
            const isExpired = req.status === 'EXPIRED' || req.status !== 'ACTIVE';

            return (
              <div
                key={req.id}
                onClick={() => navigate(`/requirements/${req.id}`)}
                className="my-requirement-card"
                style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5EAF0', padding: '16px 20px', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
              >
                <div className="my-requirement-card-row" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: catColor.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={20} color={catColor.text} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="my-requirement-card-heading" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#152536' }}>{req.title}</h3>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <Badge style={{ background: catColor.bg, color: catColor.text }}>{req.category?.name || req.category?.label || req.category}</Badge>
                        {req.status === 'CLOSED' ? (
                          <Badge variant="default">Closed</Badge>
                        ) : isExpired ? (
                          <Badge variant="danger">Expired</Badge>
                        ) : (
                          <Badge variant="success">Active</Badge>
                        )}
                      </div>
                    </div>
                    <div className="my-requirement-meta" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
                      <span style={{ fontSize: 12, color: '#718096' }}>Qty: {req.quantity}</span>
                      <span style={{ fontSize: 12, color: '#718096' }}>{req.inquiryCount ?? 0} inquiries</span>
                      <span style={{ fontSize: 12, color: '#718096' }}>Posted {formatTimeAgo(req.published_at || req.publishedAt)}</span>
                      <span style={{ fontSize: 12, color: urg.text, fontWeight: 600 }}>{timeText}</span>
                    </div>
                    <div className="my-requirement-actions" style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/requirements/${req.id}`); }}
                        style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: '#EAF3F9', color: '#176FA9', border: 'none', cursor: 'pointer' }}
                      >
                        View Details
                      </button>
                      {req.status === 'ACTIVE' && !isExpired && (
                        <button
                          onClick={e => handleClose(req.id, e)}
                          style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: '#FEF2F2', color: '#DC2626', border: 'none', cursor: 'pointer' }}
                        >
                          Close
                        </button>
                      )}
                      {(isExpired || req.status === 'CLOSED') && (
                        <button
                          onClick={e => handleRenew(req.id, e)}
                          style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: '#E7F8F5', color: '#21AFA9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <RefreshCw size={12} /> Renew
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
