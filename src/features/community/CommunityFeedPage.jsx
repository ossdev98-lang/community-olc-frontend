import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Plus, LayoutGrid, Laptop, Monitor, MemoryStick, CircuitBoard, Tv, Zap, Cpu, Package, Printer, Wifi, MoreHorizontal, RefreshCw, ArrowLeft } from 'lucide-react';
import { requirementService } from '../../services/index.js';
import RequirementCard from './RequirementCard.jsx';
import { CardSkeleton } from '../../components/ui/Skeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Button from '../../components/ui/Button.jsx';
import { CATEGORIES } from '../../constants/index.js';

const ICON_MAP = { LayoutGrid, Laptop, Monitor, MemoryStick, CircuitBoard, Tv, Zap, Cpu, Package, Printer, Wifi, MoreHorizontal };

export default function CommunityFeedPage() {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sort, setSort] = useState('newest');

  const load = async () => {
    setLoading(true);
    try {
      const res = await requirementService.list({
        search: search || undefined,
        category: activeCategory === 'all' ? undefined : activeCategory,
        sort,
        active: 'true',
        limit: 20,
      });
      const data = res.data?.data ?? res.data;
      setRequirements(data.requirements ?? []);
      setPagination(data.pagination ?? {});
    } catch (err) {
      setRequirements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, activeCategory, sort]);

  const filtered = useMemo(() => {
    return requirements;
  }, [requirements]);

  return (
    <div style={{ maxWidth: 800 }}>
      <div className="feed-heading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div className="feed-title-group">
          <button className="mobile-page-back" onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeft size={16} /><span>Back</span></button>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Community Feed</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>{requirements.length} active requirements</p>
        </div>
        <Button onClick={() => navigate('/community/create')} icon={<Plus size={15} />}>Post Requirement</Button>
      </div>

      <div className="feed-tools" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0' }} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); }}
            placeholder="Search requirements, products, shops..."
            className="input-field"
            style={{ paddingLeft: 38 }}
          />
        </div>
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); }}
          className="input-field"
          style={{ width: 'auto', paddingRight: 32 }}
        >
          <option value="newest">Newest First</option>
          <option value="expiring">Expiring Soon</option>
          <option value="popular">Most Inquiries</option>
        </select>
        <button
          onClick={load}
          style={{ padding: '10px 14px', borderRadius: 10, background: '#F4F7FA', border: '1.5px solid #E5EAF0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#718096', fontWeight: 500 }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 20 }} className="no-scrollbar feed-categories">
        {CATEGORIES.map(cat => {
          const Icon = ICON_MAP[cat.icon] || Package;
          const active = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                background: active ? 'linear-gradient(135deg, #176FA9, #21AFA9)' : '#fff',
                color: active ? '#fff' : '#718096',
                border: active ? 'none' : '1.5px solid #E5EAF0',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={13} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search size={32} />}
          title={search ? 'No results found' : 'No requirements yet'}
          description={search ? `No requirements match "${search}". Try a different search.` : 'Be the first to post a requirement in this category.'}
          action={() => navigate('/community/create')}
          actionLabel="Post Requirement"
        />
      ) : (
        <AnimatePresence>
          <div className="feed-list" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map((req, i) => (
              <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <RequirementCard requirement={req} />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
