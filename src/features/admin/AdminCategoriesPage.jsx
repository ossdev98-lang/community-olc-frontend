import { useState } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { CATEGORIES } from '../../constants/index.js';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { toast } from 'sonner';

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState(
    CATEGORIES.filter(c => c.id !== 'all').map(c => ({ ...c, enabled: true, count: Math.floor(Math.random() * 50) + 5 }))
  );
  const [modal, setModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ label: '', icon: 'Package' });

  const openAdd = () => { setEditCat(null); setForm({ label: '', icon: 'Package' }); setModal(true); };
  const openEdit = (cat) => { setEditCat(cat); setForm({ label: cat.label, icon: cat.icon }); setModal(true); };

  const handleSave = () => {
    if (!form.label.trim()) { toast.error('Category name required'); return; }
    if (editCat) {
      setCats(p => p.map(c => c.id === editCat.id ? { ...c, label: form.label, icon: form.icon } : c));
      toast.success('Category updated');
    } else {
      setCats(p => [...p, { id: form.label.toLowerCase().replace(/\s+/g, '_'), label: form.label, icon: form.icon, enabled: true, count: 0 }]);
      toast.success('Category created');
    }
    setModal(false);
  };

  const toggleEnabled = (id) => {
    setCats(p => p.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const handleDelete = (id) => {
    setCats(p => p.filter(c => c.id !== id));
    toast.success('Category deleted');
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Categories</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>Manage requirement categories</p>
        </div>
        <Button onClick={openAdd} icon={<Plus size={15} />}>Add Category</Button>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5EAF0', overflow: 'hidden' }}>
        {cats.map((cat, i) => (
          <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: i < cats.length - 1 ? '1px solid #F4F7FA' : 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: cat.enabled ? '#EAF3F9' : '#F4F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 16 }}>📦</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 600, color: cat.enabled ? '#152536' : '#A0AEC0' }}>{cat.label}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#A0AEC0' }}>{cat.count} requirements</p>
            </div>
            <Badge variant={cat.enabled ? 'success' : 'default'} size="xs">{cat.enabled ? 'Active' : 'Disabled'}</Badge>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => toggleEnabled(cat.id)} style={{ padding: '6px 10px', borderRadius: 8, background: '#F4F7FA', border: 'none', cursor: 'pointer', display: 'flex', color: '#718096' }}>
                {cat.enabled ? <ToggleRight size={16} color="#21AFA9" /> : <ToggleLeft size={16} />}
              </button>
              <button onClick={() => openEdit(cat)} style={{ padding: '6px 10px', borderRadius: 8, background: '#EAF3F9', border: 'none', cursor: 'pointer', display: 'flex', color: '#176FA9' }}>
                <Edit2 size={14} />
              </button>
              <button onClick={() => handleDelete(cat.id)} style={{ padding: '6px 10px', borderRadius: 8, background: '#FEF2F2', border: 'none', cursor: 'pointer', display: 'flex', color: '#DC2626' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editCat ? 'Edit Category' : 'Add Category'}
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editCat ? 'Update' : 'Create'}</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Category Name" value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="e.g. Laptop Parts" required />
          <Input label="Icon Name (Lucide)" value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} placeholder="e.g. Laptop" hint="Use any Lucide React icon name" />
        </div>
      </Modal>
    </div>
  );
}
