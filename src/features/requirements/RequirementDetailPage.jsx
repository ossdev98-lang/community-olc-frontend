import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Package, Clock, MessageSquare, Bookmark, BookmarkCheck, CheckCircle, Edit, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { requirementService, bookmarkService, inquiryService, shopService } from '../../services/index.js';
import { useAuthStore } from '../../store/authStore.js';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import { formatTimeAgo, formatTimeRemaining, getUrgencyStyles } from '../../utils/index.js';
import { CATEGORY_COLORS } from '../../constants/index.js';
import { toast } from 'sonner';
import LoadingState from '../../components/feedback/LoadingState.jsx';

export default function RequirementDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [req, setReq] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [rRes, bRes, iRes] = await Promise.all([
          requirementService.get(id),
          bookmarkService.check(id),
          inquiryService.list(),
        ]);
        const rData = rRes.data?.data ?? rRes.data;
        setReq(rData.requirement ?? rData);
        const bData = bRes.data?.data ?? bRes.data;
        setIsSaved(!!(bData.isBookmarked ?? bData.bookmarked));
        const iData = iRes.data?.data ?? iRes.data;
        const allInquiries = iData.conversations ?? [];
        const shopId = user?.shopId;
        setInquiries(allInquiries.filter((c) => c.requirement_id == id && (shopId ? c.owner_user_id == shopId : true)));
      } catch (err) {
        console.error('Detail load failed', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user?.shopId]);

  if (loading) return <LoadingState label="Loading requirement…" variant="detail" />;
  if (!req) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <p style={{ color: '#718096' }}>Requirement not found</p>
    </div>
  );

  const shopId = user?.shopId;
  const isOwner = req.shop && req.shop.id == shopId;
  const { text: timeText, urgency } = formatTimeRemaining(req.expires_at || req.expiresAt);
  const urg = getUrgencyStyles(urgency);
  const catColor = CATEGORY_COLORS[req.category] || CATEGORY_COLORS['Other'];
  const isExpired = urgency === 'expired' || req.status !== 'ACTIVE';

  const handleSave = async () => {
    try {
      if (isSaved) {
        await bookmarkService.remove(id);
      } else {
        await bookmarkService.add(id);
      }
      setIsSaved(!isSaved);
      toast.success(isSaved ? 'Removed from saved' : 'Saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleClose = async () => {
    try {
      await requirementService.close(id);
      setReq((r) => ({ ...r, status: 'CLOSED' }));
      toast.success('Requirement closed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close');
    }
  };

  const handleRenew = async () => {
    try {
      await requirementService.renew(id, 24);
      setReq((r) => ({ ...r, status: 'ACTIVE', expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }));
      toast.success('Requirement renewed for 24 hours');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to renew');
    }
  };

  return (
    <div className="requirement-detail-page" style={{ maxWidth: 800 }}>
      <button className="requirement-detail-back" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#718096', fontSize: 14, fontWeight: 500, marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back
      </button>

      {isExpired && (
        <div style={{ display: 'flex', gap: 10, padding: '12px 16px', background: '#FEF2F2', borderRadius: 12, marginBottom: 20, border: '1px solid #FECACA' }}>
          <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 13, color: '#DC2626', fontWeight: 500 }}>
            This requirement has expired. New inquiries are disabled, but existing conversations remain accessible.
          </p>
        </div>
      )}

      <div className="req-detail-grid">
        <div className="requirement-detail-main" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card className="requirement-detail-summary">
            <div className="requirement-detail-shop" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #F4F7FA' }}>
              <Avatar name={req.shop?.shop_name || req.shopName} size={48} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#152536' }}>{req.shop?.shop_name || req.shopName}</span>
                  {req.shop?.is_verified && <CheckCircle size={15} color="#21AFA9" />}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: '#718096', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> {req.shop?.city || req.shopCity}</span>
                  <span style={{ fontSize: 12, color: '#718096' }}>Posted {formatTimeAgo(req.published_at || req.publishedAt)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 99, background: urg.bg }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: urg.dot }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: urg.text }}>{timeText}</span>
              </div>
            </div>

            <h1 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>{req.title}</h1>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#718096', lineHeight: 1.7 }}>{req.description}</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              <Badge style={{ background: catColor.bg, color: catColor.text, fontSize: 12 }}>{req.category?.name || req.category?.label || req.category}</Badge>
              <Badge variant="default">{req.condition}</Badge>
              {req.model_number && <Badge variant="default">Model: {req.model_number}</Badge>}
            </div>

            <div className="requirement-detail-specs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['Product Name', req.product_name],
                ['Quantity Required', `${req.quantity} units`],
                ['Condition', req.condition],
                ['Location', req.location],
                req.expected_price && ['Expected Price', req.expected_price],
                ['Post Duration', `${req.duration_hours} hours`],
              ].filter(Boolean).map(([k, v]) => (
                <div key={k} style={{ padding: '12px 16px', background: '#F9FAFB', borderRadius: 10 }}>
                  <p style={{ margin: '0 0 4px', fontSize: 11, color: '#A0AEC0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#152536' }}>{v}</p>
                </div>
              ))}
            </div>
          </Card>

          {isOwner && inquiries.length > 0 && (
            <Card className="requirement-detail-inquiries">
              <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>
                Inquiries ({inquiries.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {inquiries.map(conv => {
                  return (
                    <div
                      key={conv.id}
                      onClick={() => navigate(`/inquiries/${conv.id}`)}
                      style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 10, background: '#F9FAFB', cursor: 'pointer', alignItems: 'center' }}
                    >
                      <Avatar name={conv.shop_name || 'Shop'} size={36} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: '#152536' }}>{conv.shop_name || 'Shop'}</p>
                        <p style={{ margin: 0, fontSize: 12, color: '#718096' }}>{conv.lastMessage}</p>
                      </div>
                      <MessageSquare size={16} color="#176FA9" />
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        <div className="requirement-detail-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card className="requirement-detail-actions">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {!isOwner && !isExpired && (
                <Button onClick={() => navigate(`/inquiries/new?req=${req.id}`)} fullWidth icon={<MessageSquare size={15} />}>
                  Send Private Inquiry
                </Button>
              )}
              {!isOwner && isExpired && (
                <div style={{ padding: '10px 14px', background: '#F9FAFB', borderRadius: 10, textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: 13, color: '#A0AEC0' }}>Inquiries disabled — requirement expired</p>
                </div>
              )}
              {isOwner && (
                <>
                  <Button variant="secondary" onClick={() => navigate(`/requirements/${req.id}/edit`)} fullWidth icon={<Edit size={15} />}>Edit Requirement</Button>
                  {!isExpired && req.status === 'ACTIVE' && (
                    <Button variant="danger" onClick={handleClose} fullWidth icon={<XCircle size={15} />}>Close Requirement</Button>
                  )}
                  {(isExpired || req.status !== 'ACTIVE') && (
                    <Button onClick={handleRenew} fullWidth icon={<RefreshCw size={15} />}>Renew for 24h</Button>
                  )}
                </>
              )}
              <Button variant="ghost" onClick={handleSave} fullWidth icon={isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}>
                {isSaved ? 'Saved' : 'Save Requirement'}
              </Button>
            </div>
          </Card>

          <Card className="requirement-detail-stats">
            <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#152536' }}>Requirement Stats</h4>
            {[
              ['Total Inquiries', req.inquiryCount ?? 0],
              ['Status', req.status.charAt(0).toUpperCase() + req.status.slice(1).toLowerCase()],
              ['Posted', formatTimeAgo(req.published_at || req.publishedAt)],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#718096' }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#152536' }}>{v}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
