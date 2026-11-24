import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Search, Trash2, ExternalLink, ArrowLeft } from 'lucide-react';
import { bookmarkService, requirementService } from '../../services/index.js';
import RequirementCard from '../community/RequirementCard.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import LoadingState from '../../components/feedback/LoadingState.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { formatTimeRemaining } from '../../utils/index.js';
import { toast } from 'sonner';

export default function SavedPostsPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await bookmarkService.list();
        const data = res.data?.data ?? res.data;
        const bookmarks = data.bookmarks ?? data.savedRequirements ?? data ?? [];
        setSaved(bookmarks);
      } catch (err) {
        setSaved([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = saved.filter(r =>
    !search || (r.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.shop_name || r.shopName || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleRemove = async (id, e) => {
    e.stopPropagation();
    try {
      await bookmarkService.remove(id);
      setSaved(saved.filter(s => (s.id ?? s.requirement_id) !== id));
      toast.success('Removed from saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const active = filtered.filter(r => r.status === 'ACTIVE' && new Date(r.expires_at || r.expiresAt) > Date.now());
  const expired = filtered.filter(r => r.status !== 'ACTIVE' || new Date(r.expires_at || r.expiresAt) <= Date.now());

  if (loading) return <LoadingState label="Loading saved posts…" />;

  return (
    <div className="saved-posts-page" style={{ maxWidth: 800 }}>
      <div className="saved-posts-heading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <button className="mobile-page-back" onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeft size={16} /><span>Back</span></button>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Saved Posts</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>{saved.length} saved requirements</p>
        </div>
      </div>

      {saved.length === 0 ? (
        <EmptyState
          icon={<Bookmark size={32} />}
          title="No saved posts yet"
          description="Save requirements from the community feed to find them quickly later."
          action={() => navigate('/community')}
          actionLabel="Browse Community"
        />
      ) : (
        <>
          <div className="saved-posts-search" style={{ position: 'relative', marginBottom: 20 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search saved posts..."
              className="input-field"
              style={{ paddingLeft: 38 }}
            />
          </div>

          {active.length > 0 && (
            <div className="saved-posts-section" style={{ marginBottom: 28 }}>
              <p style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: '#152536', display: 'flex', alignItems: 'center', gap: 8 }}>
                Active <Badge variant="success">{active.length}</Badge>
              </p>
              <div className="saved-posts-list" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {active.map(req => (
                  <div key={req.id} className="saved-post-item">
                    <RequirementCard requirement={req} compact trailingAction={
                      <button
                      onClick={e => handleRemove(req.id, e)}
                      className="saved-post-remove"
                      style={{ padding: '8px 10px', borderRadius: 10, background: '#FEF2F2', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}
                      title="Remove from saved"
                      aria-label="Remove from saved"
                    >
                      <Trash2 size={16} />
                    </button>
                    } />
                  </div>
                ))}
              </div>
            </div>
          )}

          {expired.length > 0 && (
            <div className="saved-posts-section">
              <p style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: '#718096', display: 'flex', alignItems: 'center', gap: 8 }}>
                Expired <Badge variant="danger">{expired.length}</Badge>
              </p>
              <div className="saved-posts-list saved-posts-expired-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {expired.map(req => (
                  <div
                    key={req.id}
                    className="saved-post-expired-card"
                    style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5EAF0', padding: '14px 16px', opacity: 0.7 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#152536', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.title}</p>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <span style={{ fontSize: 12, color: '#718096' }}>{req.shop_name || req.shopName}</span>
                          <Badge variant="danger" size="xs">Expired</Badge>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => navigate(`/requirements/${req.id}`)}
                          style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: '#EAF3F9', color: '#176FA9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <ExternalLink size={12} /> View
                        </button>
                        <button
                          onClick={e => handleRemove(req.id, e)}
                          style={{ padding: '6px 10px', borderRadius: 8, background: '#FEF2F2', border: 'none', cursor: 'pointer', display: 'flex', color: '#DC2626' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
