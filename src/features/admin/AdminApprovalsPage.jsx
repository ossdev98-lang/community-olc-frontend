import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Eye, MapPin, Building, Phone, Mail } from 'lucide-react';
import { adminService } from '../../services/index.js';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { formatTimeAgo } from '../../utils/index.js';
import { toast } from 'sonner';

export default function AdminApprovalsPage() {
  const [pending, setPending] = useState([]);
  const [selected, setSelected] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminService.listShops();
      const data = res.data?.data ?? res.data;
      const shops = data.shops ?? [];
      setPending(shops.filter(s => s.approval_status === 'PENDING'));
    } catch (err) {
      setPending([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    try {
      await adminService.approveShop(id);
      load();
      setSelected(null);
      toast.success('Shop approved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Please provide a rejection reason'); return; }
    try {
      await adminService.rejectShop(rejectModal);
      load();
      setRejectModal(null);
      setRejectReason('');
      toast.success('Shop application rejected');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  if (loading) return null;

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Shop Approvals</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>{pending.length} applications awaiting review</p>
      </div>

      {pending.length === 0 ? (
        <EmptyState icon={<CheckCircle size={32} />} title="All caught up!" description="No pending shop applications at the moment." />
      ) : (
        <div id="approvals-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
          <style>{`@media(min-width:900px){#approvals-grid{grid-template-columns:${selected ? '1fr 380px' : '1fr'};}}`}</style>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pending.map(shop => (
              <motion.div
                key={shop.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: '#fff', borderRadius: 14, border: `1px solid ${selected?.id === shop.id ? '#176FA9' : '#E5EAF0'}`,
                  padding: '16px 20px', cursor: 'pointer', transition: 'border-color 0.15s',
                }}
                onClick={() => setSelected(shop)}
              >
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <Avatar name={shop.shop_name} size={48} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#152536' }}>{shop.shop_name}</h3>
                      <Badge variant="warning" size="xs">Pending</Badge>
                    </div>
                    <p style={{ margin: '0 0 4px', fontSize: 13, color: '#718096' }}>{shop.business_type}</p>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <span style={{ fontSize: 12, color: '#A0AEC0', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> {shop.city}, {shop.state}</span>
                      <span style={{ fontSize: 12, color: '#A0AEC0' }}>Applied {formatTimeAgo(new Date(shop.createdAt).getTime())}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={e => { e.stopPropagation(); handleApprove(shop.id); }}
                      style={{ padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 600, background: '#DCFCE7', color: '#16A34A', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                    >
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setRejectModal(shop.id); }}
                      style={{ padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 600, background: '#FEF2F2', color: '#DC2626', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5EAF0', padding: 24, height: 'fit-content', position: 'sticky', top: 88 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #F4F7FA' }}>
                  <Avatar name={selected.shop_name} size={52} />
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#152536' }}>{selected.shop_name}</h3>
                    <p style={{ margin: 0, fontSize: 13, color: '#718096' }}>{selected.business_type}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {[
                    [Building, 'Owner', selected.owner_name],
                    [Mail, 'Email', selected.email],
                    [Phone, 'Phone', selected.mobile],
                    [MapPin, 'Location', `${selected.address}, ${selected.city}, ${selected.state}`],
                  ].map(([Icon, label, value]) => (
                    <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <Icon size={14} color="#A0AEC0" style={{ marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <p style={{ margin: 0, fontSize: 11, color: '#A0AEC0', fontWeight: 600 }}>{label}</p>
                        <p style={{ margin: 0, fontSize: 13, color: '#152536' }}>{value}</p>
                      </div>
                    </div>
                  ))}
                  {selected.description && (
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: 11, color: '#A0AEC0', fontWeight: 600 }}>DESCRIPTION</p>
                      <p style={{ margin: 0, fontSize: 13, color: '#718096', lineHeight: 1.6 }}>{selected.description}</p>
                    </div>
                  )}
                  <div>
                    <p style={{ margin: '0 0 6px', fontSize: 11, color: '#A0AEC0', fontWeight: 600 }}>SPECIALIZATIONS</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(selected.specializations || []).map(s => <Badge key={s} variant="primary" size="xs">{s}</Badge>)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button onClick={() => handleApprove(selected.id)} fullWidth icon={<CheckCircle size={14} />}>Approve</Button>
                  <Button variant="danger" onClick={() => setRejectModal(selected.id)} fullWidth icon={<XCircle size={14} />}>Reject</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Application"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} icon={<XCircle size={14} />}>Confirm Rejection</Button>
          </div>
        }
      >
        <p style={{ margin: '0 0 14px', fontSize: 14, color: '#718096' }}>Please provide a reason for rejecting this application. This will be communicated to the applicant.</p>
        <textarea
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
          placeholder="e.g. Business type does not match our community guidelines..."
          rows={4}
          className="input-field"
          style={{ resize: 'none' }}
        />
      </Modal>
    </div>
  );
}
