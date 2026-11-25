import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Building, Shield, Bell, Palette, ChevronRight } from 'lucide-react';
import Card from '../../components/ui/Card.jsx';

const OPTIONS = [
  { label: 'My Account', description: 'Personal information and password', icon: User, path: '/settings/account' },
  { label: 'My Shop', description: 'Shop details and specializations', icon: Building, path: '/settings/shop' },
  { label: 'Privacy', description: 'Profile visibility and contact sharing', icon: Shield, path: '/settings/privacy' },
  { label: 'Notifications', description: 'Choose which updates you receive', icon: Bell, path: '/settings/notifications' },
  { label: 'Preferences', description: 'Language and app preferences', icon: Palette, path: '/settings/preferences' },
];

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Settings</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>Choose a setting to manage</p>
      </div>
      <Card padding={false}>
        {OPTIONS.map(({ label, description, icon: Icon, path }, index) => (
          <motion.button
            key={path}
            type="button"
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate(path)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: '15px 16px', textAlign: 'left', border: 0, borderBottom: index < OPTIONS.length - 1 ? '1px solid #F1F4F7' : 0, background: '#fff', cursor: 'pointer' }}
          >
            <span style={{ width: 40, height: 40, borderRadius: 11, background: '#EAF3F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={18} color="#176FA9" /></span>
            <span style={{ flex: 1 }}><span style={{ display: 'block', fontSize: 14, fontWeight: 650, color: '#152536' }}>{label}</span><span style={{ display: 'block', marginTop: 3, fontSize: 12, color: '#8A99A8' }}>{description}</span></span>
            <ChevronRight size={17} color="#A0AEC0" />
          </motion.button>
        ))}
      </Card>
    </div>
  );
}
