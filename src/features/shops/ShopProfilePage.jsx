import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CheckCircle, MessageSquare, Phone, Calendar, FileText } from 'lucide-react';
import { shopService, requirementService } from '../../services/index.js';
import { useAuthStore } from '../../store/authStore.js';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import RequirementCard from '../community/RequirementCard.jsx';
import { formatTimeAgo } from '../../utils/index.js';

export default function ShopProfilePage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [shopReqs, setShopReqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await shopService.get(id);
        const data = res.data?.data ?? res.data;
        setShop(data.shop ?? data);
        const rRes = await requirementService.list({ limit: 20 });
        const rData = rRes.data?.data ?? rRes.data;
        const allReqs = rData.requirements ?? rData ?? [];
        setShopReqs(allReqs.filter(r => (r.shop?.id == id || r.shop_id == id) && r.status === 'ACTIVE' && new Date(r.expires_at) > Date.now()));
      } catch (err) {
        console.error('Shop load failed', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return null;
  if (!shop) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <p style={{ color: '#718096', marginBottom: 16 }}>Shop not found</p>
      <Button onClick={() => navigate('/shops')} variant="ghost">Back to Directory</Button>
    </div>
  );

  const isOwnShop = user?.shopId && shop.id == user.shopId;

  return (
    <div className="shop-profile-page" style={{ maxWidth: 900 }}>
      <button
        className="shop-profile-back"
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#718096', fontSize: 14, fontWeight: 500, marginBottom: 20 }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="shop-profile-hero" style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5EAF0', overflow: 'hidden', marginBottom: 20 }}>
        <div className="shop-profile-cover" style={{ height: 140, background: 'linear-gradient(135deg, #0B1726 0%, #176FA9 60%, #21AFA9 100%)', position: 'relative' }}>
          {shop.is_verified && (
            <div style={{ position: 'absolute', top: 16, right: 16 }}>
              <Badge variant="teal"><CheckCircle size={12} /> Verified Business</Badge>
            </div>
          )}
        </div>
        <div className="shop-profile-info" style={{ padding: '0 28px 24px' }}>
          <div className="shop-profile-avatar-actions" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: -28, marginBottom: 16 }}>
            <div style={{ border: '3px solid #fff', borderRadius: '50%' }}>
              <Avatar name={shop.shop_name} size={72} />
            </div>
            <div style={{ display: 'flex', gap: 10, paddingBottom: 4 }}>
              {!isOwnShop && (
                <Button onClick={() => navigate(`/inquiries/new?req=${0}`)} icon={<MessageSquare size={15} />} size="sm">
                  Send Message
                </Button>
              )}
              {isOwnShop && (
                <Button onClick={() => navigate('/profile')} variant="secondary" size="sm">Edit Profile</Button>
              )}
            </div>
          </div>
          <h1 className="shop-profile-name" style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>{shop.shop_name}</h1>
          <p style={{ margin: '0 0 4px', fontSize: 14, color: '#718096' }}>{shop.business_type}</p>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: '#A0AEC0' }}>Owner: {shop.owner_name}</p>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: '#718096', display: 'flex', alignItems: 'center', gap: 5 }}>
              <MapPin size={14} /> {shop.city}, {shop.state}
            </span>
            <span style={{ fontSize: 13, color: '#718096', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Calendar size={14} /> Joined {formatTimeAgo(new Date(shop.createdAt).getTime())}
            </span>
          </div>
          {shop.description && (
            <p style={{ margin: '0 0 16px', fontSize: 14, color: '#718096', lineHeight: 1.7 }}>{shop.description}</p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(shop.specializations || []).map(s => <Badge key={s} variant="primary">{s}</Badge>)}
          </div>
        </div>
      </div>

      <div className="shop-profile-grid shop-profile-content-grid">
        <div>
          <h2 className="shop-profile-requirements-title" style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>
            Active Requirements ({shopReqs.length})
          </h2>
          {shopReqs.length === 0 ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <FileText size={32} color="#E5EAF0" style={{ margin: '0 auto 10px' }} />
                <p style={{ margin: 0, color: '#A0AEC0', fontSize: 14 }}>No active requirements</p>
              </div>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {shopReqs.map(req => <RequirementCard key={req.id} requirement={req} compact />)}
            </div>
          )}
        </div>

        <div className="shop-profile-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card className="shop-profile-info-card">
            <h4 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#152536' }}>Business Stats</h4>
            {[
              ['Active Requirements', shopReqs.length],
              ['Member Since', new Date(shop.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })],
              ['Verification', shop.is_verified ? 'Verified ✓' : 'Unverified'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: '#718096' }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: k === 'Verification' && shop.is_verified ? '#21AFA9' : '#152536' }}>{v}</span>
              </div>
            ))}
          </Card>

          <Card className="shop-profile-info-card">
            <h4 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#152536' }}>Contact Info</h4>
            <p style={{ margin: '0 0 10px', fontSize: 13, color: '#718096' }}>
              Owner: <strong style={{ color: '#152536' }}>{shop.owner_name}</strong>
            </p>
            <p style={{ margin: '0 0 10px', fontSize: 13, color: '#718096' }}>
              City: <strong style={{ color: '#152536' }}>{shop.city}, {shop.state}</strong>
            </p>
            <div style={{ padding: '10px 14px', background: '#F9FAFB', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={14} color="#A0AEC0" />
              <span style={{ fontSize: 12, color: '#A0AEC0' }}>Phone hidden — use private inquiry to connect</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
