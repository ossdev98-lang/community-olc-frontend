import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Paperclip, Phone, ArrowLeft, MessageSquare, CheckCheck, Check, AlertCircle, Package, X, LoaderCircle } from 'lucide-react';
import { requirementService, inquiryService, shopService, authService, socketService } from '../../services/index.js';
import { useAuthStore } from '../../store/authStore.js';
import LoadingState from '../../components/feedback/LoadingState.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { formatTimeAgo } from '../../utils/index.js';
import { useIsMobile } from '../../hooks/useIsMobile.js';
import { toast } from 'sonner';

function QuotationCard({ q }) {
  return (
    <div style={{ background: 'linear-gradient(135deg,#EAF3F9,#E7F8F5)', borderRadius: 12, padding: 14, border: '1px solid #BFD9EC', maxWidth: 300 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Package size={14} color="#176FA9" />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#176FA9' }}>Product Quotation</span>
      </div>
      {[['Product', q.productName], ['Model', q.modelNumber], ['Qty Available', `${q.quantityAvailable} units`], ['Price/Unit', `₹${q.pricePerUnit?.toLocaleString('en-IN')}`], ['Condition', q.condition], ['Warranty', q.warranty]].map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: '#718096' }}>{k}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#152536' }}>{v}</span>
        </div>
      ))}
      {q.message && <p style={{ margin: '8px 0 0', fontSize: 11, color: '#718096', fontStyle: 'italic', borderTop: '1px solid rgba(23,111,169,0.15)', paddingTop: 8 }}>{q.message}</p>}
    </div>
  );
}

function participantDetails(user, shopOverride = null) {
  const shop = shopOverride || user?.shops?.[0] || user?.shop || null;
  return {
    shopName: shop?.shop_name || user?.shopName || user?.name || 'Unknown shop',
    ownerName: shop?.owner_name || user?.name || 'Unknown owner',
  };
}

const participantShopCache = new Map();

function useParticipantDetails(user, shopId) {
  const [details, setDetails] = useState(() => participantDetails(user));

  useEffect(() => {
    let cancelled = false;
    setDetails(participantDetails(user));
    if (!user) return () => { cancelled = true; };

    const cacheKey = `${user.id || user.email || user.name}:${shopId || ''}`;
    let lookup = participantShopCache.get(cacheKey);
    if (!lookup) {
      lookup = (async () => {
        const embeddedShop = user.shops?.[0] || user.shop;
        if (embeddedShop?.shop_name) return embeddedShop;

        if (shopId) {
          try {
            const response = await shopService.get(shopId);
            const data = response.data?.data ?? response.data;
            const shop = data.shop ?? data;
            if (shop?.shop_name) return shop;
          } catch { /* Try matching the participant by owner name below. */ }
        }

        try {
          const response = await shopService.list({ search: user.name, limit: 100 });
          const data = response.data?.data ?? response.data;
          const shops = data.shops ?? [];
          const participantEmail = user.email?.toLowerCase();
          const participantName = user.name?.trim().toLowerCase();
          return shops.find(shop => (participantEmail && shop.email?.toLowerCase() === participantEmail)
            || (participantName && shop.owner_name?.trim().toLowerCase() === participantName)) || null;
        } catch { return null; }
      })();
      participantShopCache.set(cacheKey, lookup);
    }

    lookup.then(shop => {
      if (!cancelled && shop) setDetails(participantDetails(user, shop));
    });
    return () => { cancelled = true; };
  }, [user?.id, user?.email, user?.name, shopId]);

  return details;
}

function MessageBubble({ msg, isOwn, userName }) {
  return (
    <div style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
      <div style={{ maxWidth: '78%' }}>
        {msg.message_type === 'quotation' ? <QuotationCard q={msg.quotation ?? {}} /> : (
          <div style={{ padding: '10px 14px', borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isOwn ? 'linear-gradient(135deg,#176FA9,#21AFA9)' : '#F4F7FA', color: isOwn ? '#fff' : '#152536', fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word' }}>
            {msg.message_text}
            {!isOwn && <span style={{ display: 'block', fontSize: 10, color: '#A0AEC0', marginTop: 4 }}>{userName}</span>}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
          <span style={{ fontSize: 10, color: '#A0AEC0' }}>{formatTimeAgo(msg.createdAt)}</span>
          {isOwn && (msg.is_read ? <CheckCheck size={11} color="#21AFA9" /> : <Check size={11} color="#A0AEC0" />)}
        </div>
      </div>
    </div>
  );
}

function ConversationItem({ conv, active, onClick, userId }) {
  const other = conv.owner_user_id == userId ? conv.interestedUser : conv.owner;
  const { shopName, ownerName } = useParticipantDetails(other, conv.requirement?.shop_id);
  const unread = conv.unreadCount || 0;
  return (
    <div onClick={onClick} style={{ display: 'flex', gap: 12, padding: '14px 16px', cursor: 'pointer', background: active ? '#EAF3F9' : 'transparent', borderLeft: `3px solid ${active ? '#176FA9' : 'transparent'}`, borderBottom: '1px solid #F4F7FA', transition: 'background 0.15s' }}>
      <Avatar name={shopName} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ fontSize: 14, fontWeight: unread > 0 ? 700 : 600, color: '#152536', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>{shopName}</span>
          <span style={{ fontSize: 11, color: '#A0AEC0', flexShrink: 0 }}>{formatTimeAgo(conv.last_message_at)}</span>
        </div>
        <p style={{ margin: '0 0 3px', fontSize: 11, color: '#718096', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Owner: {ownerName}</p>
        <p style={{ margin: '0 0 2px', fontSize: 13, color: '#718096', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.last_message || 'No messages yet'}</p>
        <p style={{ margin: 0, fontSize: 11, color: '#A0AEC0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.requirement?.title || ''}</p>
      </div>
      {unread > 0 && <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#176FA9', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'center' }}>{unread}</span>}
    </div>
  );
}

function ChatView({ convId, onBack, isMobile, userId, userName }) {
  const [conv, setConv] = useState(null);
  const [message, setMessage] = useState('');
  const [showQForm, setShowQForm] = useState(false);
  const [quotation, setQuotation] = useState({ productName: '', modelNumber: '', quantityAvailable: '', pricePerUnit: '', condition: 'New', warranty: '', message: '' });
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const sendingMessageRef = useRef(false);
  const sharingContactRef = useRef(false);
  const [otherUser, setOtherUser] = useState(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const otherShop = useParticipantDetails(otherUser, conv?.requirement?.shop_id);
  const [isExpired, setIsExpired] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sharingContact, setSharingContact] = useState(false);
  const [contactShares, setContactShares] = useState([]);

  const loadConv = async () => {
    try {
      const res = await inquiryService.get(convId);
      const data = res.data?.data ?? res.data;
      const c = data.conversation ?? data;
      setConv(c);
      const other = c.owner_user_id == userId ? c.interestedUser : c.owner;
      setOtherUser(other);
      if (c.requirement) {
        setIsExpired(c.requirement.status === 'EXPIRED' || new Date(c.requirement.expires_at) <= Date.now());
      }
      setContactShares(c.contactShares || []);
    } catch (err) {
      console.error('Load conversation failed', err);
    }
  };

  useEffect(() => { loadConv(); }, [convId]);
  useEffect(() => {
    socketService.joinConversation(convId);
    const handleNewMessage = (event) => {
      if (String(event.detail?.conversationId) === String(convId)) loadConv();
    };
    const handleNewQuotation = (event) => {
      if (String(event.detail?.conversationId) === String(convId)) loadConv();
    };
    const handleContactShared = (event) => {
      if (String(event.detail?.conversationId) === String(convId)) loadConv();
    };
    const handleTyping = (event) => {
      if (String(event.detail?.conversationId) === String(convId) && String(event.detail?.userId) !== String(userId)) setOtherTyping(true);
    };
    const handleStopTyping = (event) => {
      if (String(event.detail?.conversationId) === String(convId) && String(event.detail?.userId) !== String(userId)) setOtherTyping(false);
    };
    window.addEventListener('olc:socket:new_message', handleNewMessage);
    window.addEventListener('olc:socket:new_quotation', handleNewQuotation);
    window.addEventListener('olc:socket:contact_shared', handleContactShared);
    window.addEventListener('olc:socket:typing', handleTyping);
    window.addEventListener('olc:socket:stop_typing', handleStopTyping);
    return () => {
      socketService.leaveConversation(convId);
      window.removeEventListener('olc:socket:new_message', handleNewMessage);
      window.removeEventListener('olc:socket:new_quotation', handleNewQuotation);
      window.removeEventListener('olc:socket:contact_shared', handleContactShared);
      window.removeEventListener('olc:socket:typing', handleTyping);
      window.removeEventListener('olc:socket:stop_typing', handleStopTyping);
      window.clearTimeout(typingTimeoutRef.current);
    };
  }, [convId, userId]);
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, [conv?.messages?.length]);

  const req = conv?.requirement;
  const senderName = otherShop.ownerName;

  const sendMessage = async () => {
    if (!message.trim() || !conv || sendingMessageRef.current) return;
    sendingMessageRef.current = true;
    setSendingMessage(true);
    socketService.stopTyping(convId, userId);
    window.clearTimeout(typingTimeoutRef.current);
    try {
      await inquiryService.messages.send(convId, null, message.trim(), 'TEXT');
      setMessage('');
      loadConv();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally {
      sendingMessageRef.current = false;
      setSendingMessage(false);
    }
  };

  const shareContact = async () => {
    if (sharingContactRef.current) return;
    sharingContactRef.current = true;
    setSharingContact(true);
    try {
      const response = await inquiryService.shareContact(convId);
      const data = response.data?.data ?? response.data;
      const share = data.contactShare;
      if (share) setContactShares(current => current.some(item => item.id === share.id) ? current : [...current, share]);
      toast.success('Your name and phone number are now shared in this chat.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to share contact details');
    } finally {
      sharingContactRef.current = false;
      setSharingContact(false);
    }
  };

  const sendQuotation = async () => {
    if (!conv) return;
    try {
      await inquiryService.quotations.send(convId, {
        productName: quotation.productName,
        modelNumber: quotation.modelNumber,
        quantityAvailable: parseInt(quotation.quantityAvailable) || 0,
        pricePerUnit: parseFloat(quotation.pricePerUnit) || 0,
        condition: quotation.condition,
        warranty: quotation.warranty,
        message: quotation.message,
      });
      setShowQForm(false);
      setQuotation({ productName: '', modelNumber: '', quantityAvailable: '', pricePerUnit: '', condition: 'New', warranty: '', message: '' });
      loadConv();
      toast.success('Quotation sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send quotation');
    }
  };

  if (!conv) return <LoadingState label="Loading conversation…" variant="chat" minHeight="100%" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: isMobile ? '100%' : '100%', minHeight: 0, overflow: 'hidden', background: '#fff' }}>
      <div className="chat-header" style={{ padding: '12px 16px', borderBottom: '1px solid #E5EAF0', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {isMobile && <button onClick={onBack} style={{ background: '#F4F7FA', border: 'none', borderRadius: 9, padding: 8, cursor: 'pointer', display: 'flex', color: '#152536', flexShrink: 0 }}><ArrowLeft size={18} /></button>}
        <Avatar name={otherShop.shopName} size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#152536', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{otherShop.shopName}</p>
          <p style={{ margin: 0, fontSize: 11, color: '#718096', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Owner: {otherShop.ownerName}</p>
          <p style={{ margin: 0, fontSize: 10, color: '#A0AEC0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Re: {conv.requirement?.title || ''}</p>
        </div>
        {contactShares.some(share => share.shared_by_user_id == userId) ? (
          <Badge variant="teal" size="xs"><Check size={11} /> You shared</Badge>
        ) : (
          <button onClick={shareContact} disabled={sharingContact} title="Share your name and phone number in this chat" style={{ padding: '7px 10px', borderRadius: 9, fontSize: 11, fontWeight: 600, background: sharingContact ? '#F4F7FA' : '#EAF3F9', color: '#176FA9', border: 'none', cursor: sharingContact ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, opacity: sharingContact ? 0.7 : 1 }}>
            {sharingContact ? <LoaderCircle size={13} style={{ animation: 'olc-spin 0.8s linear infinite' }} /> : <Phone size={12} />} {sharingContact ? 'Sharing…' : 'Share Contact'}
          </button>
        )}
      </div>

      {isExpired && (
        <div style={{ padding: '8px 16px', background: '#FFFBEB', borderBottom: '1px solid #FDE68A', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <AlertCircle size={13} color="#D97706" />
          <p style={{ margin: 0, fontSize: 12, color: '#D97706' }}>Requirement expired — existing conversation continues</p>
        </div>
      )}

      <div ref={messagesContainerRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehaviorY: 'contain', WebkitOverflowScrolling: 'touch', padding: '16px' }} className="chat-messages no-scrollbar">
        {conv.messages.map(msg => <MessageBubble key={msg.id} msg={msg} isOwn={msg.sender_user_id == userId} userName={senderName} />)}
        {contactShares.map(share => {
          const ownShare = share.shared_by_user_id == userId;
          return (
            <div key={`contact-${share.id}`} style={{ display: 'flex', justifyContent: ownShare ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
              <div style={{ maxWidth: '85%', padding: '11px 14px', borderRadius: 14, background: ownShare ? '#EAF3F9' : '#E7F8F5', border: `1px solid ${ownShare ? '#BFD9EC' : '#B8E8DF'}`, color: '#152536' }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 5px', fontSize: 12, fontWeight: 700, color: '#176FA9' }}><Phone size={13} />{ownShare ? 'You shared your contact' : 'Contact details shared'}</p>
                <p style={{ margin: '0 0 3px', fontSize: 13, fontWeight: 600 }}>{share.contact_name}</p>
                <a href={`tel:${share.contact_mobile}`} style={{ color: '#176FA9', fontSize: 13, textDecoration: 'none' }}>{share.contact_mobile}</a>
              </div>
            </div>
          );
        })}
        {otherTyping && <p style={{ margin: '4px 0 12px', fontSize: 12, color: '#718096', fontStyle: 'italic' }}>Typing…</p>}
        <div ref={messagesEndRef} />
      </div>

      <AnimatePresence>
        {showQForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ borderTop: '1px solid #E5EAF0', padding: '14px 16px', background: '#F9FAFB', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#152536' }}>Send Quotation</p>
              <button onClick={() => setShowQForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#718096' }}><X size={16} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              {[['productName', 'Product Name'], ['modelNumber', 'Model No.'], ['quantityAvailable', 'Qty Available'], ['pricePerUnit', 'Price/Unit (₹)'], ['warranty', 'Warranty']].map(([k, l]) => (
                <input key={k} placeholder={l} value={quotation[k]} onChange={e => setQuotation(p => ({ ...p, [k]: e.target.value }))} className="input-field" style={{ fontSize: 12, padding: '8px 10px' }} />
              ))}
            </div>
            <textarea placeholder="Additional message..." value={quotation.message} onChange={e => setQuotation(p => ({ ...p, message: e.target.value }))} className="input-field" rows={2} style={{ fontSize: 12, marginBottom: 8, resize: 'none' }} />
            <button onClick={sendQuotation} style={{ width: '100%', padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'linear-gradient(135deg,#176FA9,#21AFA9)', color: '#fff', border: 'none', cursor: 'pointer' }}>Send Quotation</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="chat-composer" style={{ padding: '10px 12px', borderTop: '1px solid #E5EAF0', display: 'flex', gap: 8, alignItems: 'flex-end', flexShrink: 0, background: '#fff' }}>
        <button onClick={() => setShowQForm(!showQForm)} style={{ padding: 9, borderRadius: 10, background: '#F4F7FA', border: 'none', cursor: 'pointer', display: 'flex', color: '#718096', flexShrink: 0 }} title="Send Quotation"><Package size={18} /></button>
        <button style={{ padding: 9, borderRadius: 10, background: '#F4F7FA', border: 'none', cursor: 'pointer', display: 'flex', color: '#718096', flexShrink: 0 }}><Paperclip size={18} /></button>
        <input value={message} disabled={sendingMessage} onChange={e => {
          setMessage(e.target.value);
          if (e.target.value.trim()) {
            socketService.typing(convId, userId, userName);
            window.clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = window.setTimeout(() => socketService.stopTyping(convId, userId), 900);
          } else {
            socketService.stopTyping(convId, userId);
            window.clearTimeout(typingTimeoutRef.current);
          }
        }} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())} placeholder="Type a message..." className="input-field" style={{ flex: 1, fontSize: 14 }} />
        <button onClick={sendMessage} disabled={!message.trim() || sendingMessage} aria-label={sendingMessage ? 'Sending message' : 'Send message'} style={{ padding: 9, borderRadius: 10, border: 'none', cursor: message.trim() && !sendingMessage ? 'pointer' : 'not-allowed', background: message.trim() && !sendingMessage ? 'linear-gradient(135deg,#176FA9,#21AFA9)' : '#E5EAF0', color: message.trim() && !sendingMessage ? '#fff' : '#A0AEC0', display: 'flex', flexShrink: 0 }}>
          {sendingMessage ? <LoaderCircle size={18} style={{ animation: 'olc-spin 0.8s linear infinite' }} /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
}

export default function InquiriesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(id && id !== 'new' ? id : null);
  const [showChat, setShowChat] = useState(!!id && id !== 'new');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile(768);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await inquiryService.list();
      const data = res.data?.data ?? res.data;
      setConversations(data.conversations ?? []);
    } catch (err) {
      if (!silent) setConversations([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const refreshConversations = () => load(true);
    window.addEventListener('olc:socket:new_inquiry', refreshConversations);
    window.addEventListener('olc:socket:new_message', refreshConversations);
    return () => {
      window.removeEventListener('olc:socket:new_inquiry', refreshConversations);
      window.removeEventListener('olc:socket:new_message', refreshConversations);
    };
  }, []);

  useEffect(() => {
    if (id && id !== 'new') { setActiveId(id); setShowChat(true); inquiryService.markRead(id).then(() => load()); navigate(`/inquiries/${id}`); }
  }, [id]);

  useEffect(() => {
    const reqId = searchParams.get('req');
    if (!reqId) return;
    (async () => {
      try {
        const rRes = await requirementService.get(reqId);
        const rData = rRes.data?.data ?? rRes.data;
        const reqItem = rData.requirement ?? rData;
        if (!reqItem) return;
        const existing = conversations.find(c => c.requirement?.id == reqId && c.interested_user_id == user.id);
        if (existing) { setActiveId(existing.id); setShowChat(true); navigate(`/inquiries/${existing.id}`); return; }
        const cRes = await inquiryService.create({ requirementId: reqItem.id });
        const cData = cRes.data?.data ?? cRes.data;
        const conv = cData.conversation ?? cData;
        load(); setActiveId(conv.id); setShowChat(true); navigate(`/inquiries/${conv.id}`);
      } catch (err) {
        console.error('Create inquiry failed', err);
      }
    })();
  }, [searchParams, conversations, user?.id]);

  const filtered = conversations.filter(c => !search || (c.requirement?.title || '').toLowerCase().includes(search.toLowerCase()));

  const handleSelect = async (conv) => {
    setActiveId(conv.id); setShowChat(true);
    await inquiryService.markRead(conv.id);
    load();
    navigate(`/inquiries/${conv.id}`);
  };

  const handleBack = () => {
    // The URL is the source of truth for the mobile split view. Replacing the
    // chat entry prevents a stale :id route from reopening the conversation.
    setShowChat(false);
    setActiveId(null);
    navigate('/inquiries', { replace: true });
  };

  if (loading) return <LoadingState label="Loading inquiries…" variant="list" />;

  if (isMobile) {
    if (id && id !== 'new') {
      return (
        <div className="inquiry-mobile-chat" style={{ margin: '0 -12px', height: '100%', minHeight: 0 }}>
          <ChatView convId={id} onBack={handleBack} isMobile={true} userId={user.id} userName={user.name} />
        </div>
      );
    }
    return (
      <div style={{ margin: '-16px', marginBottom: 0 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5EAF0', background: '#fff' }}>
          <div className="inquiries-mobile-title">
            <button className="mobile-page-back" onClick={() => navigate('/dashboard')} aria-label="Go to home"><ArrowLeft size={16} /><span>Back</span></button>
            <h2 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Private Inquiries</h2>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations..." className="input-field" style={{ paddingLeft: 32, fontSize: 13 }} />
          </div>
        </div>
        <div style={{ background: '#fff', minHeight: 'calc(100vh - 180px)' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center' }}>
              <MessageSquare size={40} color="#E5EAF0" style={{ margin: '0 auto 12px' }} />
              <p style={{ margin: 0, fontSize: 14, color: '#A0AEC0' }}>No conversations yet</p>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#CBD5E0' }}>Respond to a requirement to start a conversation</p>
            </div>
          ) : filtered.map(conv => <ConversationItem key={conv.id} conv={conv} active={false} onClick={() => handleSelect(conv)} userId={user.id} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="inquiries-desktop-chat-shell" style={{ display: 'flex', height: '100%', background: '#fff', borderRadius: 16, border: '1px solid #E5EAF0', overflow: 'hidden' }}>
      <div style={{ width: 320, borderRight: '1px solid #E5EAF0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #E5EAF0' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Private Inquiries</h2>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations..." className="input-field" style={{ paddingLeft: 32, fontSize: 13 }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }} className="no-scrollbar">
          {filtered.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center' }}><MessageSquare size={32} color="#E5EAF0" style={{ margin: '0 auto 12px' }} /><p style={{ margin: 0, fontSize: 13, color: '#A0AEC0' }}>No conversations yet</p></div>
          ) : filtered.map(conv => <ConversationItem key={conv.id} conv={conv} active={activeId === conv.id} onClick={() => handleSelect(conv)} userId={user.id} />)}
        </div>
      </div>
      {activeId ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <ChatView convId={activeId} isMobile={false} userId={user.id} userName={user.name} />
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
          <MessageSquare size={48} color="#E5EAF0" />
          <p style={{ margin: 0, fontSize: 15, color: '#A0AEC0', fontWeight: 500 }}>Select a conversation to start chatting</p>
        </div>
      )}
    </div>
  );
}
