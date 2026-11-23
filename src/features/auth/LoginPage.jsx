import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Laptop, Shield, Users, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { authService } from '../../services/index.js';
import OLCLogo from '../../components/ui/Logo.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import mascot from '../../assets/3d model/Smiling Ozone Community Mascot.png';

const features = [
  { icon: Users, text: 'Connect with 500+ verified computer shops' },
  { icon: Zap, text: 'Post requirements, get responses in minutes' },
  { icon: Shield, text: 'Private B2B conversations, fully secure' },
  { icon: Laptop, text: 'Exclusive to computer hardware businesses' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email or mobile is required';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await authService.login(form.email, form.password);
      const { token, refreshToken, user } = res.data;
      localStorage.setItem('olc_token', token);
      localStorage.setItem('olc_refreshToken', refreshToken);
      localStorage.setItem('olc_user', JSON.stringify(user));
      login(user);
      if (user.isAdmin || user.role === 'ADMIN') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setErrors({ _server: err.response?.data?.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          flex: 1, background: 'linear-gradient(135deg, #0B1726 0%, #176FA9 50%, #21AFA9 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 56px',
          position: 'relative', overflow: 'hidden',
        }}
        className="login-desktop-brand hidden lg:flex"
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(33,175,169,0.15)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(23,111,169,0.2)' }} />
        <div style={{ position: 'absolute', top: '40%', right: '10%', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <OLCLogo size={48} showText textColor="#fff" />
          <div style={{ marginTop: 48 }}>
            <h1 style={{ margin: '0 0 16px', fontSize: 36, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#fff', lineHeight: 1.2 }}>
              The B2B Community<br />for Computer Shops
            </h1>
            <p style={{ margin: '0 0 40px', fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
              Connect with verified dealers, post requirements, and discover products — all in one premium platform.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <f.icon size={18} color="#fff" />
                  </div>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{f.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 48, padding: '20px 24px', background: 'rgba(255,255,255,0.1)', borderRadius: 16, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.9)', fontStyle: 'italic', lineHeight: 1.6 }}>
              "Ozone Lapcare Community has transformed how we source laptop parts. We find what we need in minutes instead of hours."
            </p>
            <p style={{ margin: '12px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>— Rajesh Kumar, Digital Hub Solutions, Delhi</p>
          </div>
        </div>
      </motion.div>

      {/* Right panel */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="login-panel"
        style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 48px', background: '#F4F7FA' }}
      >
        <div className="login-mobile-hero lg:hidden">
          <div className="login-mobile-hero-brand"><OLCLogo size={36} showText /></div>
          <div className="login-mobile-hero-copy">
            <h1>Welcome to<br />Ozone Lapcare<br /><span>Community</span></h1>
            <p>A trusted network for computer &amp; laptop businesses.</p>
            <div className="login-mobile-accent" />
          </div>
          <img className="login-mobile-mascot" src={mascot} alt="Smiling Ozone Community mascot" />
        </div>

        <div className="login-card" style={{ background: '#fff', borderRadius: 20, padding: 36, boxShadow: '0 4px 24px rgba(21,37,54,0.08)', border: '1px solid #E5EAF0' }}>
          <h2 className="login-title" style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>
            <span className="desktop-login-title">Welcome back</span>
            <span className="mobile-login-title">Login to Your Account</span>
          </h2>
          <p className="login-subtitle" style={{ margin: '0 0 28px', fontSize: 14, color: '#718096' }}>
            <span className="desktop-login-subtitle">Sign in to your community account</span>
            <span className="mobile-login-subtitle">Access your shop, requirements, inquiries and business network.</span>
          </p>

          <form className="login-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Email or Mobile Number"
              name="email"
              type="text"
              placeholder="Email or Mobile Number"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              error={errors.email}
              icon={<Mail size={16} />}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              error={errors.password}
              icon={<Lock size={16} />}
              required
            />

            <div className="login-options" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#718096' }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: '#176FA9' }} />
                Remember me
              </label>
              <Link to="/forgot-password" style={{ fontSize: 13, color: '#176FA9', fontWeight: 600, textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={loading} fullWidth icon={<ArrowRight size={16} />}>
              <span className="desktop-login-submit">Sign In</span>
              <span className="mobile-login-submit">Login</span>
            </Button>

            {errors._server && (
              <p style={{ fontSize: 12, color: '#DC2626', marginTop: 12, textAlign: 'center' }}>{errors._server}</p>
            )}
          </form>

          <div className="login-mobile-divider"><span />OR<span /></div>
          <Link to="/register" className="login-mobile-register">Create New Account <ArrowRight size={17} /></Link>

          <div className="login-demo-note" style={{ marginTop: 20, padding: '14px 16px', background: '#F4F7FA', borderRadius: 10, fontSize: 12, color: '#718096' }}>
            <strong style={{ color: '#152536' }}>Demo credentials:</strong><br />
            Member: parmanand@techzone.in / password123<br />
            Admin: admin@ozonelap.in / Admin@12345
          </div>

          <p style={{ margin: '20px 0 0', textAlign: 'center', fontSize: 14, color: '#718096' }}>
            New to OLC?{' '}
            <Link to="/register" style={{ color: '#176FA9', fontWeight: 600, textDecoration: 'none' }}>
              Register your shop
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
