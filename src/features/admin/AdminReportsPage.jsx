import { useState } from 'react';
import { Flag, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Badge from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { formatTimeAgo } from '../../utils/index.js';
import { toast } from 'sonner';

const MOCK_REPORTS = [
  { id: 'r1', type: 'post', targetName: 'Suspicious Laptop Parts Listing', reportedBy: 'TechZone Computer Store', reason: 'Misleading product description and fake images', status: 'pending', createdAt: Date.now() - 3600000 * 2 },
  { id: 'r2', type: 'member', targetName: 'FakeShop123', reportedBy: 'Digital Hub Solutions', reason: 'Not a legitimate computer hardware business', status: 'pending', createdAt: Date.now() - 3600000 * 5 },
  { id: 'r3', type: 'post', targetName: 'Overpriced RAM Modules', reportedBy: 'PC World Hyderabad', reason: 'Price manipulation and spam', status: 'resolved', createdAt: Date.now() - 3600000 * 24 },
  { id: 'r4', type: 'member', targetName: 'SpamDealer', reportedBy: 'SpareHub India', reason: 'Sending unsolicited messages', status: 'dismissed', createdAt: Date.now() - 3600000 * 48 },
];

export default function AdminReportsPage() {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [filter, setFilter] = useState('all');

  const filtered = reports.filter(r => filter === 'all' || r.status === filter);

  const updateStatus = (id, status) => {
    setReports(p => p.map(r => r.id === id ? { ...r, status } : r));
    toast.success(`Report ${status}`);
  };

  const statusBadge = (status) => {
    if (status === 'pending') return <Badge variant="warning">Pending</Badge>;
    if (status === 'resolved') return <Badge variant="success">Resolved</Badge>;
    return <Badge variant="default">Dismissed</Badge>;
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Reports Management</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>{reports.filter(r => r.status === 'pending').length} pending reports</p>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#F4F7FA', borderRadius: 12, padding: 4 }}>
        {['all', 'pending', 'resolved', 'dismissed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            flex: 1, padding: '8px 12px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
            background: filter === f ? '#fff' : 'transparent', color: filter === f ? '#176FA9' : '#718096',
            boxShadow: filter === f ? '0 1px 4px rgba(21,37,54,0.08)' : 'none', textTransform: 'capitalize',
          }}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Flag size={32} />} title="No reports" description="No reports match the selected filter." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(report => (
            <div key={report.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5EAF0', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: report.type === 'post' ? '#FEF3C7' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {report.type === 'post' ? <AlertTriangle size={14} color="#D97706" /> : <Flag size={14} color="#DC2626" />}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {report.type === 'post' ? 'Post Report' : 'Member Report'}
                    </span>
                    {statusBadge(report.status)}
                  </div>
                  <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#152536' }}>{report.targetName}</p>
                  <p style={{ margin: '0 0 6px', fontSize: 13, color: '#718096' }}><strong>Reason:</strong> {report.reason}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#A0AEC0' }}>Reported by {report.reportedBy} · {formatTimeAgo(report.createdAt)}</p>
                </div>
                {report.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => updateStatus(report.id, 'resolved')}
                      style={{ padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 600, background: '#DCFCE7', color: '#16A34A', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                    >
                      <CheckCircle size={13} /> Resolve
                    </button>
                    <button
                      onClick={() => updateStatus(report.id, 'dismissed')}
                      style={{ padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 600, background: '#F4F7FA', color: '#718096', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                    >
                      <XCircle size={13} /> Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
