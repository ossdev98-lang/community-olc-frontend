import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, X, CheckCircle, ArrowLeft, Eye, ChevronDown, MapPin, Package, Clock } from 'lucide-react';
import { requirementService, uploadService } from '../../services/index.js';
import { CATEGORIES, CONDITIONS, DURATIONS, CATEGORY_COLORS } from '../../constants/index.js';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import { toast } from 'sonner';
import LoadingState from '../../components/feedback/LoadingState.jsx';
import Badge from '../../components/ui/Badge.jsx';

export default function CreateRequirementPage({ editMode = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(editMode);
  const [preview, setPreview] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryPickerRef = useRef(null);
  const [durationOpen, setDurationOpen] = useState(false);
  const durationPickerRef = useRef(null);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [form, setForm] = useState({
    title: '', category: '', productName: '', modelNumber: '',
    description: '', quantity: 1, condition: 'New',
    expectedPrice: '', location: '', duration: 24,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const urls = images.map(file => URL.createObjectURL(file));
    setImagePreviews(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [images]);

  useEffect(() => {
    if (!editMode || !id) return undefined;
    let cancelled = false;
    const loadRequirement = async () => {
      try {
        const res = await requirementService.get(id);
        const data = res.data?.data ?? res.data;
        const req = data.requirement ?? data;
        if (cancelled) return;
        setForm({
          title: req.title || '',
          category: req.category?.name || req.category?.label || '',
          productName: req.product_name || req.productName || '',
          modelNumber: req.model_number || req.modelNumber || '',
          description: req.description || '',
          quantity: req.quantity || 1,
          condition: (req.condition || 'NEW').toLowerCase().replace(/^./, letter => letter.toUpperCase()),
          expectedPrice: req.expected_price || req.expectedPrice || '',
          location: req.location || req.city || '',
          duration: req.duration_hours || req.duration || 24,
        });
        setExistingImages(Array.isArray(req.images) ? req.images : []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load requirement');
        navigate('/requirements');
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    };
    loadRequirement();
    return () => { cancelled = true; };
  }, [editMode, id, navigate]);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!categoryPickerRef.current?.contains(event.target)) setCategoryOpen(false);
      if (!durationPickerRef.current?.contains(event.target)) setDurationOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setCategoryOpen(false);
        setDurationOpen(false);
      }
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('touchstart', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('touchstart', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.title) e.title = 'Required';
    if (!form.category) e.category = 'Required';
    if (!form.productName) e.productName = 'Required';
    if (!form.description) e.description = 'Required';
    if (!form.quantity || form.quantity < 1) e.quantity = 'Min 1';
    if (!form.duration) e.duration = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleImages = (e) => {
    const input = e.target;
    const files = Array.from(input.files || []).filter((f) => f.type.startsWith('image/'));
    const available = Math.max(0, 5 - existingImages.length - images.length);
    if (files.length > available) toast.error(`Only ${available} more image${available === 1 ? '' : 's'} can be added`);
    setImages(current => [...current, ...files.slice(0, available)]);
    input.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = editMode
        ? await requirementService.update(id, form, images)
        : await requirementService.create(form, images);
      const responseData = res.data?.data ?? res.data;
      const req = responseData.requirement ?? responseData;
      toast.success(editMode ? 'Requirement updated successfully!' : 'Requirement posted successfully!');
      navigate(`/requirements/${req.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${editMode ? 'update' : 'post'} requirement`);
    } finally {
      setLoading(false);
    }
  };

  const cats = CATEGORIES.filter(c => c.id !== 'all');

  const imageUrl = (image) => {
    const path = typeof image === 'string' ? image : image?.image_path || image?.url || image?.path;
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return uploadService.serve('requirements', path.replace(/\\/g, '/').split('/').pop());
  };

  if (pageLoading) return <LoadingState label="Loading requirement…" variant="form" />;

  if (preview) {
    const categoryColor = CATEGORY_COLORS[form.category] || CATEGORY_COLORS.Other;
    const previewImages = [...existingImages.map(imageUrl), ...imagePreviews].filter(Boolean);
    return (
      <div className="create-requirement-page" style={{ maxWidth: 720 }}>
        <div className="create-requirement-heading" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button type="button" onClick={() => setPreview(false)} aria-label="Back to editing" style={{ background: '#F4F7FA', border: 'none', borderRadius: 10, padding: 9, cursor: 'pointer', display: 'flex', color: '#718096' }}><ArrowLeft size={18} /></button>
          <div><h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Preview Requirement</h1><p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>This is how your post will appear to the community</p></div>
        </div>
        <Card>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {form.category && <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: categoryColor.bg, color: categoryColor.text }}>{form.category}</span>}
            {form.condition && <Badge>{form.condition}</Badge>}
          </div>
          <h2 style={{ margin: '0 0 8px', fontSize: 21, fontWeight: 800, color: '#152536', fontFamily: 'Manrope, sans-serif' }}>{form.title || 'Requirement title'}</h2>
          {form.productName && <p style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 600, color: '#526579' }}>{form.productName}{form.modelNumber ? ` · ${form.modelNumber}` : ''}</p>}
          <p style={{ margin: '0 0 18px', fontSize: 14, color: '#718096', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{form.description || 'Your description will appear here.'}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
            <Badge><Package size={12} /> Qty: {form.quantity || 1}</Badge>
            {form.location && <Badge><MapPin size={12} /> {form.location}</Badge>}
            <Badge><Clock size={12} /> {form.duration} hours</Badge>
            {form.expectedPrice && <Badge>Expected price: {form.expectedPrice}</Badge>}
          </div>
          {previewImages.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8, marginBottom: 18 }}>{previewImages.map((src, index) => <img key={`${src}-${index}`} src={src} alt={`Requirement preview ${index + 1}`} style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 10, border: '1px solid #E5EAF0' }} />)}</div>}
          <div style={{ display: 'flex', gap: 10, borderTop: '1px solid #F1F4F7', paddingTop: 16 }}>
            <Button type="button" variant="secondary" onClick={() => setPreview(false)} icon={<ArrowLeft size={15} />}>Edit Details</Button>
            <Button type="button" onClick={handleSubmit} loading={loading} fullWidth icon={<CheckCircle size={15} />}>{editMode ? 'Save Changes' : 'Post Requirement'}</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="create-requirement-page" style={{ maxWidth: 720 }}>
      <div className="create-requirement-heading" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} style={{ background: '#F4F7FA', border: 'none', borderRadius: 10, padding: 9, cursor: 'pointer', display: 'flex', color: '#718096' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>{editMode ? 'Edit Requirement' : 'Post a Requirement'}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>{editMode ? 'Update your requirement details' : 'Let the community know what you need'}</p>
        </div>
      </div>

      <form className="requirement-form-stack" style={{ display: 'flex', flexDirection: 'column', gap: 20 }} onSubmit={handleSubmit}>
        <Card className="requirement-form-card">
          <h3 className="requirement-form-title" style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Requirement Details</h3>
          <div className="requirement-form-fields" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Requirement Title" value={form.title} onChange={e => set('title', e.target.value)} error={errors.title} required placeholder="e.g. Need HP Pavilion 15 Display Panel FHD" />

            <div>
              <label id="requirement-category-label" style={{ fontSize: 13, fontWeight: 600, color: '#152536', display: 'block', marginBottom: 8 }}>Category <span style={{ color: '#DC2626' }}>*</span></label>
              <div className="category-picker" ref={categoryPickerRef}>
                <button
                  type="button"
                  className={`category-picker-trigger${categoryOpen ? ' is-open' : ''}`}
                  aria-labelledby="requirement-category-label"
                  aria-haspopup="listbox"
                  aria-expanded={categoryOpen}
                  onClick={() => setCategoryOpen(open => !open)}
                >
                  <span className={form.category ? '' : 'category-picker-placeholder'}>
                    {cats.find(category => category.id === form.category)?.label || 'Select a category'}
                  </span>
                  <ChevronDown className="category-picker-chevron" aria-hidden="true" size={16} style={{ display: 'block', flexShrink: 0, marginLeft: 'auto' }} />
                </button>
                {categoryOpen && (
                  <ul className="category-picker-list" role="listbox" aria-labelledby="requirement-category-label">
                    {cats.map(category => (
                      <li key={category.id} role="presentation">
                        <button
                          type="button"
                          role="option"
                          aria-selected={form.category === category.id}
                          className={`category-picker-option${form.category === category.id ? ' is-selected' : ''}`}
                          onClick={() => { set('category', category.id); setCategoryOpen(false); }}
                        >
                          {category.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {errors.category && <p style={{ fontSize: 12, color: '#DC2626', margin: '4px 0 0' }}>{errors.category}</p>}
            </div>

            <div className="requirement-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Input label="Product Name" value={form.productName} onChange={e => set('productName', e.target.value)} error={errors.productName} required placeholder="e.g. HP Pavilion 15 Display" />
              <Input label="Model Number" value={form.modelNumber} onChange={e => set('modelNumber', e.target.value)} placeholder="e.g. HP-PAV15-FHD" />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#152536', display: 'block', marginBottom: 5 }}>Description <span style={{ color: '#DC2626' }}>*</span></label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Describe the product specifications, brand preferences, urgency, and any other details..."
                rows={4}
                className="input-field"
                style={{ resize: 'vertical' }}
              />
              {errors.description && <p style={{ fontSize: 12, color: '#DC2626', margin: '4px 0 0' }}>{errors.description}</p>}
            </div>
          </div>
        </Card>

        <Card className="requirement-form-card">
          <h3 className="requirement-form-title" style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Product Specifications</h3>
          <div className="requirement-form-fields" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="requirement-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#152536', display: 'block', marginBottom: 5 }}>Quantity Required <span style={{ color: '#DC2626' }}>*</span></label>
                <input type="number" min="1" value={form.quantity} onChange={e => set('quantity', parseInt(e.target.value) || 1)} className="input-field" />
                {errors.quantity && <p style={{ fontSize: 12, color: '#DC2626', margin: '4px 0 0' }}>{errors.quantity}</p>}
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#152536', display: 'block', marginBottom: 5 }}>Product Condition</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {CONDITIONS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => set('condition', c)}
                      style={{
                        flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        background: form.condition === c ? '#EAF3F9' : '#F4F7FA',
                        color: form.condition === c ? '#176FA9' : '#718096',
                        border: form.condition === c ? '1.5px solid #176FA9' : '1.5px solid #E5EAF0',
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="requirement-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Input label="Expected Price (Optional)" value={form.expectedPrice} onChange={e => set('expectedPrice', e.target.value)} placeholder="e.g. ₹3,500 - ₹4,200" hint="Leave blank if flexible" />
              <Input label="Location" value={form.location} onChange={e => set('location', e.target.value)} placeholder="City" />
              <div>
                <label id="requirement-duration-label" style={{ fontSize: 13, fontWeight: 600, color: '#152536', display: 'block', marginBottom: 5 }}>Duration (hours)</label>
                <div className="category-picker" ref={durationPickerRef}>
                  <button
                    type="button"
                    className={`category-picker-trigger${durationOpen ? ' is-open' : ''}`}
                    aria-labelledby="requirement-duration-label"
                    aria-haspopup="listbox"
                    aria-expanded={durationOpen}
                    onClick={() => setDurationOpen(open => !open)}
                  >
                    <span>{form.duration} hours</span>
                    <ChevronDown className="category-picker-chevron" aria-hidden="true" size={16} style={{ display: 'block', flexShrink: 0, marginLeft: 'auto' }} />
                  </button>
                  {durationOpen && (
                    <ul className="category-picker-list" role="listbox" aria-labelledby="requirement-duration-label">
                      {DURATIONS.map(({ value }) => (
                        <li key={value} role="presentation">
                          <button
                            type="button"
                            role="option"
                            aria-selected={Number(form.duration) === value}
                            className={`category-picker-option${Number(form.duration) === value ? ' is-selected' : ''}`}
                            onClick={() => { set('duration', value); setDurationOpen(false); }}
                          >
                            {value} hours
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <p style={{ fontSize: 12, color: '#A0AEC0', margin: '4px 0 0' }}>How long the requirement stays active</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="requirement-form-card">
          <h3 className="requirement-form-title" style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Product Images (Optional)</h3>
          <div
            className="requirement-image-dropzone"
            style={{ border: '2px dashed #E5EAF0', borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer', background: '#F9FAFB', transition: 'border-color 0.15s' }}
            onDragOver={e => e.preventDefault()}
            onClick={(e) => { if (e.target.id !== 'req-image-input') document.getElementById('req-image-input')?.click(); }}
          >
            <input id="req-image-input" type="file" accept="image/*" multiple onChange={handleImages} onClick={e => e.stopPropagation()} style={{ display: 'none' }} />
            <Upload size={28} color="#A0AEC0" style={{ margin: '0 auto 12px' }} />
            <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#152536' }}>Drag & drop images here</p>
            <p style={{ margin: '0 0 12px', fontSize: 12, color: '#718096' }}>or click to browse files</p>
            <span style={{ fontSize: 11, color: '#A0AEC0' }}>PNG, JPG up to 5MB each · Max {5 - images.length - existingImages.length} left</span>
          </div>
          {existingImages.length > 0 && (
            <div className="requirement-existing-images" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              {existingImages.map(image => (
                <div key={image.id || image.image_path} style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden', border: '1px solid #E5EAF0' }}>
                  <img src={imageUrl(image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Current requirement" />
                </div>
              ))}
            </div>
          )}
          {images.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              {images.map((_, i) => (
                <div key={i} style={{ position: 'relative', width: 60, height: 60, borderRadius: 8, overflow: 'hidden', border: '1px solid #E5EAF0' }}>
                  <img src={imagePreviews[i]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: 2, right: 2, background: '#DC2626', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 10 }}><X size={10} /></button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="requirement-form-actions" style={{ display: 'flex', gap: 12 }}>
          <Button variant="ghost" type="button" onClick={() => navigate(editMode ? `/requirements/${id}` : -1)} icon={<ArrowLeft size={15} />}>Cancel</Button>
          <Button variant="secondary" type="button" onClick={() => setPreview(!preview)} icon={<Eye size={15} />}>Preview</Button>
          <Button type="submit" loading={loading} fullWidth icon={<CheckCircle size={15} />}>{editMode ? 'Save Changes' : 'Post Requirement'}</Button>
        </div>
      </form>
    </div>
  );
}
