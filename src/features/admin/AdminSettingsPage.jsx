import { useState } from 'react';
import { Save, Settings, Clock, Bell, Shield } from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { toast } from 'sonner';

const DEFAULT_SETTINGS = {
  platformName: 'Ozone Lapcare Community',
  defaultDuration: '24',
  maxDuration: '72',
  maxImagesPerPost: '5',
  requireApproval: true,
  allowGuestView: false,
  maintenanceMode: false,
  emailNotifications: true,
  pushNotifications: false,
};

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });

  const set = (k, v) => setSettings(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 700));
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ k }) => (
    <button
      onClick={() => set(k, !settings[k])}
      style={{
        width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer', flexShrink: 0,
        background: settings[k] ? 'linear-gradient(135deg, #176FA9, #21AFA9)' : '#E5EAF0',
        position: 'relative', transition: 'background 0.2s',
      }}
    >
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: settings[k] ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </button>
  );

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Platform Settings</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>Configure platform-wide settings</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Settings size={18} color="#176FA9" />
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>General Settings</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Platform Name" value={settings.platformName} onChange={e => set('platformName', e.target.value)} />
            {[
              { key: 'requireApproval', label: 'Require shop approval before access', desc: 'New shops must be approved by admin before accessing the community' },
              { key: 'allowGuestView', label: 'Allow guest viewing', desc: 'Non-members can view public requirements without logging in' },
              { key: 'maintenanceMode', label: 'Maintenance mode', desc: 'Temporarily disable access for all members' },
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #F4F7FA' }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 600, color: '#152536' }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#718096' }}>{item.desc}</p>
                </div>
                <Toggle k={item.key} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Clock size={18} color="#176FA9" />
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Post Configuration</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#152536', display: 'block', marginBottom: 5 }}>Default Duration (hours)</label>
              <select value={settings.defaultDuration} onChange={e => set('defaultDuration', e.target.value)} className="input-field">
                <option value="24">24 Hours</option>
                <option value="48">48 Hours</option>
                <option value="72">72 Hours</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#152536', display: 'block', marginBottom: 5 }}>Maximum Duration (hours)</label>
              <select value={settings.maxDuration} onChange={e => set('maxDuration', e.target.value)} className="input-field">
                <option value="48">48 Hours</option>
                <option value="72">72 Hours</option>
                <option value="96">96 Hours</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#152536', display: 'block', marginBottom: 5 }}>Max Images Per Post</label>
              <select value={settings.maxImagesPerPost} onChange={e => set('maxImagesPerPost', e.target.value)} className="input-field">
                <option value="3">3 Images</option>
                <option value="5">5 Images</option>
                <option value="10">10 Images</option>
              </select>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Bell size={18} color="#176FA9" />
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Notification Settings</h3>
          </div>
          {[
            { key: 'emailNotifications', label: 'Email notifications', desc: 'Send email alerts for approvals, rejections, and system events' },
            { key: 'pushNotifications', label: 'Push notifications', desc: 'Enable web push notifications (requires backend integration)' },
          ].map(item => (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F4F7FA' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 600, color: '#152536' }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#718096' }}>{item.desc}</p>
              </div>
              <Toggle k={item.key} />
            </div>
          ))}
        </Card>

        <Button onClick={handleSave} loading={saving} icon={<Save size={15} />}>Save All Settings</Button>
      </div>
    </div>
  );
}
