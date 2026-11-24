import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Mail, Lock, Building, MapPin, FileText, CheckCircle, ArrowRight, ArrowLeft, Upload } from 'lucide-react';
import OLCLogo from '../../components/ui/Logo.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { BUSINESS_TYPES, SPECIALIZATIONS } from '../../constants/index.js';
import { authService } from '../../services/index.js';
import mascot from '../../assets/3d model/Smiling Ozone Community Mascot.png';

const STEPS = ['Owner Details', 'Business Details', 'Shop Profile', 'Review & Submit'];

const initialForm = {
  ownerName: '', mobile: '', email: '', password: '',
  shopName: '', businessType: [], city: '', state: '', address: '', gstin: '',
  specializations: [], description: '',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const logoInput = useRef(null);
  const [businessTypeOpen, setBusinessTypeOpen] = useState(false);
  const businessTypeRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!businessTypeRef.current?.contains(event.target)) setBusinessTypeOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.ownerName) e.ownerName = 'Required';
      if (!form.mobile) e.mobile = 'Required';
      if (!form.email) e.email = 'Required';
      if (!form.password || form.password.length < 6) e.password = 'Min 6 characters';
    }
    if (step === 1) {
      if (!form.shopName) e.shopName = 'Required';
      if (!form.businessType.length) e.businessType = 'Select at least one business type';
      if (!form.city) e.city = 'Required';
      if (!form.state) e.state = 'Required';
      if (!form.address) e.address = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await authService.register({
        name: form.ownerName,
        email: form.email,
        mobile: form.mobile,
        password: form.password,
        shopName: form.shopName,
        ownerName: form.ownerName,
        businessType: form.businessType,
        city: form.city,
        state: form.state,
        address: form.address,
        gstin: form.gstin,
        description: form.description,
        specializations: form.specializations,
      }, logo);
      setSubmitted(true);
    } catch (err) {
      setErrors({ _server: err.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  const toggleSpec = (s) => {
    set('specializations', form.specializations.includes(s)
      ? form.specializations.filter(x => x !== s)
      : [...form.specializations, s]);
  };

  if (submitted) {
    return (
      <div className="register-success-page" style={{ minHeight: '100vh', background: '#F4F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="register-success-card"
          style={{ background: '#fff', borderRadius: 24, padding: 48, maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 8px 32px rgba(21,37,54,0.1)' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #EAF3F9, #E7F8F5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}
          >
            <CheckCircle size={40} color="#21AFA9" />
          </motion.div>
          <h2 style={{ margin: '0 0 12px', fontSize: 24, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Application Submitted!</h2>
          <p style={{ margin: '0 0 24px', fontSize: 15, color: '#718096', lineHeight: 1.7 }}>
            Your shop registration for <strong style={{ color: '#152536' }}>{form.shopName}</strong> has been submitted successfully.
          </p>
          <div style={{ background: '#F4F7FA', borderRadius: 12, padding: 20, marginBottom: 24, textAlign: 'left' }}>
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#152536' }}>What happens next?</p>
            {['Our team will review your application within 24-48 hours', 'You will receive an email notification once approved', 'After approval, you can access the full community'].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg, #176FA9, #21AFA9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>{i + 1}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#718096' }}>{t}</p>
              </div>
            ))}
          </div>
          <Button onClick={() => navigate('/login')} fullWidth>Back to Login</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="register-page" style={{ minHeight: '100vh', background: '#F4F7FA', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="login-mobile-hero register-mobile-hero lg:hidden">
        <div className="login-mobile-hero-brand"><OLCLogo size={36} showText /></div>
        <div className="login-mobile-hero-copy">
          <h1>Join Ozone<br />Lapcare<br /><span>Community</span></h1>
          <p>Your business network starts here.</p>
          <div className="login-mobile-accent" />
        </div>
        <img className="login-mobile-mascot" src={mascot} alt="Smiling Ozone Community mascot" />
      </div>
      <div className="register-desktop-logo" style={{ marginBottom: 24 }}><OLCLogo size={40} showText /></div>

      {/* Step indicator */}
      <div className="register-steps" style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28, background: '#fff', borderRadius: 12, padding: '12px 20px', boxShadow: '0 1px 4px rgba(21,37,54,0.06)' }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i < step ? 'linear-gradient(135deg, #176FA9, #21AFA9)' : i === step ? '#176FA9' : '#E5EAF0',
                color: i <= step ? '#fff' : '#A0AEC0', fontSize: 12, fontWeight: 700,
              }}>
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span style={{ fontSize: 12, fontWeight: i === step ? 700 : 500, color: i === step ? '#176FA9' : i < step ? '#21AFA9' : '#A0AEC0', whiteSpace: 'nowrap' }} className="hidden sm:block">
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && <div style={{ width: 24, height: 2, background: i < step ? '#21AFA9' : '#E5EAF0', margin: '0 8px' }} />}
          </div>
        ))}
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="register-card"
        style={{ background: '#fff', borderRadius: 20, padding: 36, width: '100%', maxWidth: 520, boxShadow: '0 4px 24px rgba(21,37,54,0.08)', border: '1px solid #E5EAF0' }}
      >
        <h2 className="register-step-title" style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>{STEPS[step]}</h2>
        <p className="register-step-count" style={{ margin: '0 0 24px', fontSize: 13, color: '#718096' }}>Step {step + 1} of {STEPS.length}</p>

        {step === 0 && (
          <div className="register-step-fields" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input className="register-input-with-icon" label="Owner Name" value={form.ownerName} onChange={e => set('ownerName', e.target.value)} error={errors.ownerName} icon={<User size={16} />} required placeholder="Your full name" />
            <Input className="register-input-with-icon" label="Mobile Number" value={form.mobile} onChange={e => set('mobile', e.target.value)} error={errors.mobile} icon={<Phone size={16} />} required placeholder="10-digit mobile number" />
            <Input className="register-input-with-icon" label="Email Address" type="email" value={form.email} onChange={e => set('email', e.target.value)} error={errors.email} icon={<Mail size={16} />} required placeholder="your@email.com" />
            <Input className="register-input-with-icon" label="Password" type="password" value={form.password} onChange={e => set('password', e.target.value)} error={errors.password} icon={<Lock size={16} />} required placeholder="Min 6 characters" />
          </div>
        )}

        {step === 1 && (
          <div className="register-step-fields" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input className="register-input-with-icon" label="Shop Name" value={form.shopName} onChange={e => set('shopName', e.target.value)} error={errors.shopName} icon={<Building size={16} />} required placeholder="Your shop name" />
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#152536', display: 'block', marginBottom: 5 }}>Business Type <span style={{ color: '#DC2626' }}>*</span></label>
              <p style={{ fontSize: 12, color: '#718096', margin: '0 0 9px' }}>Select all that apply</p>
              <div ref={businessTypeRef} style={{ position: 'relative' }}>
                <button type="button" aria-haspopup="listbox" aria-expanded={businessTypeOpen} onClick={() => setBusinessTypeOpen(open => !open)} className="input-field" style={{ width: '100%', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', cursor: 'pointer', background: '#fff', color: form.businessType.length ? '#263746' : '#718096' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{form.businessType.length ? `${form.businessType.length} selected: ${form.businessType.join(', ')}` : 'Select business type'}</span>
                  <span aria-hidden="true" style={{ marginLeft: 10, color: '#718096', transform: businessTypeOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}>▾</span>
                </button>
                {businessTypeOpen && <ul aria-label="Business types" className="register-business-type-menu" style={{ position: 'absolute', zIndex: 20, top: 'calc(100% + 5px)', left: 0, right: 0, maxHeight: 230, overflowY: 'auto', margin: 0, padding: 5, listStyle: 'none', background: '#fff', border: '1px solid #DCE4EC', borderRadius: 10, boxShadow: '0 10px 24px rgba(21,37,54,0.14)' }}>
                  {BUSINESS_TYPES.map(t => {
                    const selected = form.businessType.includes(t);
                    return <li key={t}>
                      <button type="button" aria-pressed={selected} onClick={() => set('businessType', selected ? form.businessType.filter(type => type !== t) : [...form.businessType, t])} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', border: 0, borderRadius: 7, background: selected ? '#EAF3F9' : '#fff', color: selected ? '#176FA9' : '#34495A', textAlign: 'left', fontSize: 13, fontWeight: selected ? 600 : 500, cursor: 'pointer' }}>
                        <span aria-hidden="true" style={{ width: 16, height: 16, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${selected ? '#176FA9' : '#B8C4D0'}`, borderRadius: 4, background: selected ? '#176FA9' : '#fff', color: '#fff', fontSize: 11 }}>{selected ? '✓' : ''}</span>
                        {t}
                      </button>
                    </li>;
                  })}
                </ul>}
              </div>
              {errors.businessType && <p style={{ fontSize: 12, color: '#DC2626', margin: '4px 0 0' }}>{errors.businessType}</p>}
            </div>
            <div className="register-fields-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input className="register-input-with-icon" label="City" value={form.city} onChange={e => set('city', e.target.value)} error={errors.city} icon={<MapPin size={16} />} required placeholder="City" />
              <Input label="State" value={form.state} onChange={e => set('state', e.target.value)} error={errors.state} required placeholder="State" />
            </div>
            <Input label="Shop Address" value={form.address} onChange={e => set('address', e.target.value)} error={errors.address} required placeholder="Full shop address" />
            <Input label="GSTIN (Optional)" value={form.gstin} onChange={e => set('gstin', e.target.value)} placeholder="15-digit GSTIN" hint="Leave blank if not applicable" />
          </div>
        )}

        {step === 2 && (
          <div className="register-step-fields" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#152536', display: 'block', marginBottom: 8 }}>Specializations</label>
              <div className="register-specializations" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SPECIALIZATIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpec(s)}
                    style={{
                      padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      background: form.specializations.includes(s) ? 'linear-gradient(135deg, #176FA9, #21AFA9)' : '#F4F7FA',
                      color: form.specializations.includes(s) ? '#fff' : '#718096',
                      border: form.specializations.includes(s) ? 'none' : '1.5px solid #E5EAF0',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#152536', display: 'block', marginBottom: 5 }}>Shop Description</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Describe your shop, products, and services..."
                rows={4}
                className="input-field"
                style={{ resize: 'vertical' }}
              />
            </div>
            <input ref={logoInput} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
                setErrors({ logo: 'Choose a PNG, JPG, or WEBP image.' }); e.target.value = ''; return;
              }
              if (file.size > 2 * 1024 * 1024) {
                setErrors({ logo: 'Logo must be 2MB or smaller.' }); e.target.value = ''; return;
              }
              setErrors({}); setLogo(file); setLogoPreview(URL.createObjectURL(file));
            }} />
            <button type="button" className="register-upload" onClick={() => logoInput.current?.click()} style={{ width: '100%', border: '2px dashed #E5EAF0', borderRadius: 12, padding: 24, textAlign: 'center', cursor: 'pointer', background: '#F9FAFB', color: 'inherit' }}>
              {logoPreview ? <img src={logoPreview} alt="Shop logo preview" style={{ width: 72, height: 72, objectFit: 'contain', margin: '0 auto 8px' }} /> : <Upload size={24} color="#A0AEC0" style={{ margin: '0 auto 8px' }} />}
              <p style={{ margin: 0, fontSize: 13, color: '#718096' }}>{logo ? logo.name : 'Upload Shop Logo (Optional)'}</p>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#A0AEC0' }}>PNG, JPG up to 2MB · Click to choose or replace</p>
            </button>
            {errors.logo && <p style={{ margin: '-12px 0 0', fontSize: 12, color: '#DC2626' }}>{errors.logo}</p>}
          </div>
        )}

        {step === 3 && (
          <div className="register-step-fields register-review" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="register-review-panel" style={{ background: '#F4F7FA', borderRadius: 12, padding: 20 }}>
              <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#152536' }}>Owner Details</p>
              {[['Name', form.ownerName], ['Mobile', form.mobile], ['Email', form.email]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#718096' }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#152536' }}>{v}</span>
                </div>
              ))}
            </div>
            <div className="register-review-panel" style={{ background: '#F4F7FA', borderRadius: 12, padding: 20 }}>
              <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#152536' }}>Business Details</p>
              {[['Shop Name', form.shopName], ['Type', form.businessType.join(', ')], ['City', form.city], ['State', form.state]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#718096' }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#152536' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: 16, background: '#EAF3F9', borderRadius: 12, border: '1px solid #BFD9EC' }}>
              <p style={{ margin: 0, fontSize: 13, color: '#176FA9', lineHeight: 1.6 }}>
                By submitting, you confirm that all information is accurate and your business is related to computer hardware, laptops, or IT equipment.
              </p>
            </div>
          </div>
        )}

        <div className="register-actions" style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          {step > 0 && (
            <Button variant="ghost" onClick={back} icon={<ArrowLeft size={16} />}>Back</Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={next} fullWidth icon={<ArrowRight size={16} />}>Continue</Button>
          ) : (
            <Button onClick={handleSubmit} loading={loading} fullWidth icon={<CheckCircle size={16} />}>Submit Application</Button>
          )}
        </div>
      </motion.div>

      <p className="register-login-link" style={{ marginTop: 20, fontSize: 14, color: '#718096' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#176FA9', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
      </p>
    </div>
  );
}
