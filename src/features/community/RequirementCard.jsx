import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Package, MessageSquare, Bookmark, BookmarkCheck, Share2, MoreVertical, CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { formatTimeAgo, formatTimeRemaining, getUrgencyStyles } from '../../utils/index.js';
import { CATEGORY_COLORS } from '../../constants/index.js';
import { bookmarkService } from '../../services/index.js';
import { uploadService } from '../../services/index.js';
import { useAuthStore } from '../../store/authStore.js';
import { toast } from 'sonner';

export default function RequirementCard({ requirement: req, compact = false, trailingAction = null }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const shopName = req.shopName || req.shop?.shop_name || req.shop?.name || 'Shop';
  const shopCity = req.shopCity || req.shop?.city || req.city || req.location || '';
  const shopVerified = req.shopVerified ?? req.shop?.is_verified ?? false;
  const requirementImages = Array.isArray(req.images) ? req.images : [];
  const imageTrackRef = useRef(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const imageSrc = (image) => {
    const path = typeof image === 'string' ? image : image?.image_path || image?.url || image?.path;
    if (!path) return '';
    return /^https?:\/\//i.test(path)
      ? path
      : uploadService.serve('requirements', path.replace(/\\/g, '/').split('/').pop());
  };
  const showImage = (index) => {
    const nextIndex = Math.max(0, Math.min(index, requirementImages.length - 1));
    setActiveImageIndex(nextIndex);
    imageTrackRef.current?.children[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  };
  const [isSaved, setIsSaved] = useState(false);
  const { text: timeText, urgency } = formatTimeRemaining(req.expires_at || req.expiresAt);
  const urg = getUrgencyStyles(urgency);
  const catColor = CATEGORY_COLORS[req.category?.name || req.category?.label || req.category] || CATEGORY_COLORS['Other'];
  const isOwner = Boolean(user && ((req.user_id && req.user_id === user.id) || (req.shopId && req.shopId === user.id)));

  useEffect(() => {
    const loadSaved = async () => {
      try {
        const res = await bookmarkService.check(req.id);
        setIsSaved(!!(res.data?.isSaved || res.data?.bookmarked || res.data?.is_bookmarked));
      } catch {}
    };
    loadSaved();
  }, [req.id]);

  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      if (isSaved) {
        await bookmarkService.remove(req.id);
        setIsSaved(false);
        toast.success('Removed from saved');
      } else {
        await bookmarkService.add(req.id);
        setIsSaved(true);
        toast.success('Requirement saved');
      }
    } catch {}
  };

  const handleInquiry = (e) => {
    e.stopPropagation();
    if (isOwner) { toast.info('This is your own requirement'); return; }
    navigate(`/inquiries/new?req=${req.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(23,111,169,0.1)' }}
      onClick={() => navigate(`/requirements/${req.id}`)}
      style={{
        background: '#fff', borderRadius: 16, border: '1px solid #E5EAF0',
        boxShadow: '0 1px 3px rgba(21,37,54,0.06)', cursor: 'pointer',
        overflow: 'hidden', transition: 'box-shadow 0.2s',
      }}
      className="requirement-card"
    >
      {/* Header */}
      <div className="requirement-card-header" style={{ padding: compact ? '14px 16px 10px' : '16px 20px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name={shopName} size={compact ? 34 : 40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#152536', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shopName}</span>
            {shopVerified && <CheckCircle size={13} color="#21AFA9" style={{ flexShrink: 0 }} />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: '#A0AEC0', display: 'flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={10} /> {shopCity}
            </span>
            <span style={{ fontSize: 11, color: '#A0AEC0' }}>·</span>
            <span style={{ fontSize: 11, color: '#A0AEC0' }}>{formatTimeAgo(req.published_at || req.publishedAt)}</span>
          </div>
        </div>
        {/* Expiry badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 99, background: urg.bg, flexShrink: 0 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: urg.dot }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: urg.text }}>{timeText}</span>
        </div>
      </div>

      {requirementImages.length > 0 && (
        <div className={`requirement-card-image${compact ? ' is-compact' : ''}`} onClick={e => e.stopPropagation()}>
          <div
            className="requirement-card-image-track"
            ref={imageTrackRef}
            onScroll={(event) => {
              const track = event.currentTarget;
              const index = Math.round(track.scrollLeft / track.clientWidth);
              setActiveImageIndex(index);
            }}
          >
            {requirementImages.map((image, index) => (
              <div className="requirement-card-image-slide" key={image.id || image.image_path || image.url || index}>
                <img
                  src={imageSrc(image)}
                  alt={`${req.title} product ${index + 1}`}
                  loading="lazy"
                  onError={(event) => { event.currentTarget.parentElement.hidden = true; }}
                />
              </div>
            ))}
          </div>
          {requirementImages.length > 1 && (
            <>
              <button type="button" className="requirement-card-image-arrow is-prev" aria-label="Previous image" onClick={() => showImage(activeImageIndex - 1)} disabled={activeImageIndex === 0}><ChevronLeft size={17} /></button>
              <button type="button" className="requirement-card-image-arrow is-next" aria-label="Next image" onClick={() => showImage(activeImageIndex + 1)} disabled={activeImageIndex === requirementImages.length - 1}><ChevronRight size={17} /></button>
              <span className="requirement-card-image-count">{activeImageIndex + 1} / {requirementImages.length}</span>
              <div className="requirement-card-image-dots">
                {requirementImages.map((image, index) => <button key={image.id || image.image_path || index} type="button" aria-label={`Show image ${index + 1}`} className={index === activeImageIndex ? 'is-active' : ''} onClick={() => showImage(index)} />)}
              </div>
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="requirement-card-content" style={{ padding: compact ? '0 16px 12px' : '0 20px 16px' }}>
        <h3 style={{ margin: '0 0 6px', fontSize: compact ? 14 : 15, fontWeight: 700, color: '#152536', lineHeight: 1.4 }}>{req.title}</h3>
        {!compact && <p style={{ margin: '0 0 12px', fontSize: 13, color: '#718096', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{req.description}</p>}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: compact ? 10 : 14 }}>
          <Badge style={{ background: catColor.bg, color: catColor.text }}>{req.category?.name || req.category?.label || req.category}</Badge>
          <Badge variant="default"><Package size={10} style={{ marginRight: 2 }} /> Qty: {req.quantity}</Badge>
          <Badge variant="default">{req.condition}</Badge>
          {req.expectedPrice && !compact && <Badge variant="primary">{req.expectedPrice}</Badge>}
        </div>

        {!compact && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 14 }}>
            <MapPin size={12} color="#A0AEC0" />
            <span style={{ fontSize: 12, color: '#718096' }}>{req.location}</span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: compact ? 8 : 12, borderTop: '1px solid #F4F7FA' }}>
          {!isOwner ? (
            <button
              onClick={handleInquiry}
              style={{
                flex: 1, padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: 'linear-gradient(135deg, #176FA9, #21AFA9)', color: '#fff', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <MessageSquare size={14} /> Private Inquiry
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/requirements/${req.id}`); }}
              style={{
                flex: 1, padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: '#EAF3F9', color: '#176FA9', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <MessageSquare size={14} /> {req.inquiryCount} Inquiries
            </button>
          )}
          <button
            onClick={handleSave}
            style={{ padding: '8px 12px', borderRadius: 10, background: isSaved ? '#EAF3F9' : '#F4F7FA', border: 'none', cursor: 'pointer', display: 'flex', color: isSaved ? '#176FA9' : '#718096' }}
          >
            {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); toast.success('Link copied!'); }}
            style={{ padding: '8px 12px', borderRadius: 10, background: '#F4F7FA', border: 'none', cursor: 'pointer', display: 'flex', color: '#718096' }}
          >
            <Share2 size={16} />
          </button>
          {trailingAction}
        </div>
      </div>
    </motion.div>
  );
}
