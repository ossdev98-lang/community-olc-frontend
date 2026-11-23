import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, CheckCircle, Filter, ArrowLeft } from 'lucide-react';
import { shopService } from '../../services/index.js';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { formatTimeAgo } from '../../utils/index.js';

export default function ShopDirectoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await shopService.list({ verified: verifiedOnly ? 'true' : undefined });
        const data = res.data?.data ?? res.data;
        setShops(data.shops ?? []);
      } catch (err) {
        setShops([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [verifiedOnly]);

  const cities = useMemo(() => [...new Set(shops.map(s => s.city))].sort(), [shops]);

  const filtered = useMemo(() => {
    let list = shops;
    if (search) list = list.filter(s =>
      (s.shop_name || s.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.owner_name || s.ownerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.city || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.specializations || []).some(sp => sp.toLowerCase().includes(search.toLowerCase()))
    );
    if (cityFilter) list = list.filter(s => s.city === cityFilter);
    if (verifiedOnly) list = list.filter(s => s.is_verified || s.verified);
    return list;
  }, [shops, search, cityFilter, verifiedOnly]);

  if (loading) return null;

  return (
    <div className="shop-directory-page" style={{ maxWidth: 1000 }}>
      <div className="shop-directory-heading" style={{ marginBottom: 24 }}>
        <button className="mobile-page-back" onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeft size={16} /><span>Back</span></button>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Shop Directory</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>{shops.length} verified computer hardware businesses</p>
      </div>

      <div className="shop-directory-filters" style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search shops, cities, specializations..." className="input-field" style={{ paddingLeft: 38 }} />
        </div>
        <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="input-field" style={{ width: 'auto' }}>
          <option value="">All Cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          onClick={() => setVerifiedOnly(!verifiedOnly)}
          style={{
            padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: verifiedOnly ? 'linear-gradient(135deg, #176FA9, #21AFA9)' : '#fff',
            color: verifiedOnly ? '#fff' : '#718096',
            border: verifiedOnly ? 'none' : '1.5px solid #E5EAF0',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <CheckCircle size={14} /> Verified Only
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Search size={32} />} title="No shops found" description="Try adjusting your search or filters." />
      ) : (
        <div className="shop-grid">
          {filtered.map(shop => (
            <div
              key={shop.id}
              className="shop-directory-card"
              onClick={() => navigate(`/shops/${shop.id}`)}
              style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5EAF0', overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(23,111,169,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <div className="shop-directory-cover" style={{ height: 72, background: 'linear-gradient(135deg, #0B1726, #176FA9)', position: 'relative' }}>
                <div style={{ position: 'absolute', bottom: -20, left: 16 }}>
                  <Avatar name={shop.shop_name || shop.name} size={44} />
                </div>
                {(shop.is_verified || shop.verified) && (
                  <div style={{ position: 'absolute', top: 10, right: 10 }}>
                    <Badge variant="teal" size="xs"><CheckCircle size={10} /> Verified</Badge>
                  </div>
                )}
              </div>
              <div className="shop-directory-card-content" style={{ padding: '28px 16px 16px' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#152536' }}>{shop.shop_name || shop.name}</h3>
                <p style={{ margin: '0 0 8px', fontSize: 12, color: '#718096' }}>{shop.business_type || shop.businessType}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                  <MapPin size={12} color="#A0AEC0" />
                  <span style={{ fontSize: 12, color: '#718096' }}>{shop.city}, {shop.state}</span>
                </div>
                {shop.description && (
                  <p style={{ margin: '0 0 12px', fontSize: 12, color: '#718096', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {shop.description}
                  </p>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                  {(shop.specializations || []).slice(0, 3).map(s => (
                    <Badge key={s} variant="primary" size="xs">{s}</Badge>
                  ))}
                  {(shop.specializations || []).length > 3 && <Badge variant="default" size="xs">+{(shop.specializations || []).length - 3}</Badge>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#A0AEC0' }}>Joined {formatTimeAgo(new Date(shop.createdAt || shop.joinedAt).getTime())}</span>
                  <span style={{ fontSize: 12, color: '#176FA9', fontWeight: 600 }}>{shop.activeRequirements ?? 0} active</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
