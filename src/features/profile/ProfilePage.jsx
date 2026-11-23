import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Building, Lock, Bell, Shield, Palette, Camera, Save, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { authService, shopService } from '../../services/index.js';
import Avatar from '../../components/ui/Avatar.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { SPECIALIZATIONS, BUSINESS_TYPES } from '../../constants/index.js';
import { toast } from 'sonner';

const TABS = [
  { id: 'account', label: 'My Account', icon: User },
  { id: 'shop', label: 'My Shop', icon: Building },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'preferences', label: 'Preferences', icon: Palette },
];

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuthStore();
  const [shop, setShop] = useState(user);
  const [activeTab, setActiveTab] = useState('account');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accountForm, setAccountForm] = useState({
    ownerName: user.ownerName || '',
    email: user.email || '',
    mobile: user.mobile || '',
  });
  const [shopForm, setShopForm] = useState({
    name: user.shopName || user.shop_name || '',
    businessType: user.shop?.business_type || '',
    city: user.shop?.city || '',
    state: user.shop?.state || '',
    address: user.shop?.address || '',
    description: user.shop?.description || '',
    specializations: user.shop?.specializations || [],
  });
  const [privacyForm, setPrivacyForm] = useState({
    shareContact: false,
    profileVisible: true,
    showPhone: false,
  });
  const [notifForm, setNotifForm] = useState({
    newInquiry: true,
    newMessage: true,
    expiryReminder: true,
    communityUpdates: false,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await authService.me();
        const data = res.data?.data ?? res.data;
        setShop(data);
        updateUser(data);
      } catch (err) {
        console.error('Profile load failed', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    setAccountForm({
      ownerName: shop.ownerName || '',
      email: shop.email || '',
      mobile: shop.mobile || '',
    });
    setShopForm({
      name: shop.shopName || shop.shop_name || '',
      businessType: shop.shop?.business_type || '',
      city: shop.shop?.city || '',
      state: shop.shop?.state || '',
      address: shop.shop?.address || '',
      description: shop.shop?.description || '',
      specializations: shop.shop?.specializations || [],
    });
  }, [shop]);

  if (loading) return null;
  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = {
        shopName: shopForm.name,
        ownerName: accountForm.ownerName,
        businessType: shopForm.businessType,
        description: shopForm.description,
        mobile: accountForm.mobile,
        email: accountForm.email,
        address: shopForm.address,
        city: shopForm.city,
        state: shopForm.state,
        specializations: shopForm.specializations,
      };
      await shopService.update(updates);
      const res = await authService.me();
      const data = res.data?.data ?? res.data;
      setShop(data);
      updateUser(data);
      toast.success('Changes saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const toggleSpec = (s) => {
    setShopForm(p => ({
      ...p,
      specializations: p.specializations.includes(s)
        ? p.specializations.filter(x => x !== s)
        : [...p.specializations, s],
    }));
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Profile & Settings</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>Manage your account and shop information</p>
      </div>

      <div className="profile-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Card style={{ marginBottom: 12, textAlign: 'center', padding: 20 }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
              <Avatar name={shop.ownerName} size={64} />
              <button style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #176FA9, #21AFA9)', border: '2px solid #fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={11} color="#fff" />
              </button>
            </div>
            <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: '#152536' }}>{shop.ownerName}</p>
            <p style={{ margin: '0 0 8px', fontSize: 12, color: '#718096' }}>{shop.shopName || shop.shop_name || ''}</p>
            {shop.shop?.is_verified && <Badge variant="teal" size="xs"><CheckCircle size={10} /> Verified</Badge>}
          </Card>

          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10,
                fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', textAlign: 'left',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #EAF3F9, #E7F8F5)' : 'transparent',
                color: activeTab === tab.id ? '#176FA9' : '#718096',
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
          {activeTab === 'account' && (
            <Card>
              <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Personal Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Input label="Full Name" value={accountForm.ownerName} onChange={e => setAccountForm(p => ({ ...p, ownerName: e.target.value }))} />
                <Input label="Email Address" type="email" value={accountForm.email} onChange={e => setAccountForm(p => ({ ...p, email: e.target.value }))} />
                <Input label="Mobile Number" value={accountForm.mobile} onChange={e => setAccountForm(p => ({ ...p, mobile: e.target.value }))} />
                <div style={{ borderTop: '1px solid #E5EAF0', paddingTop: 16 }}>
                  <h4 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#152536' }}>Change Password</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Input label="Current Password" type="password" placeholder="Enter current password" />
                    <Input label="New Password" type="password" placeholder="Enter new password" />
                    <Input label="Confirm Password" type="password" placeholder="Confirm new password" />
                  </div>
                </div>
                <Button onClick={handleSave} loading={saving} icon={<Save size={15} />}>Save Changes</Button>
              </div>
            </Card>
          )}

          {activeTab === 'shop' && (
            <Card>
              <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Shop Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Input label="Shop Name" value={shopForm.name} onChange={e => setShopForm(p => ({ ...p, name: e.target.value }))} />
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#152536', display: 'block', marginBottom: 5 }}>Business Type</label>
                  <select value={shopForm.businessType} onChange={e => setShopForm(p => ({ ...p, businessType: e.target.value }))} className="input-field">
                    {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Input label="City" value={shopForm.city} onChange={e => setShopForm(p => ({ ...p, city: e.target.value }))} />
                  <Input label="State" value={shopForm.state} onChange={e => setShopForm(p => ({ ...p, state: e.target.value }))} />
                </div>
                <Input label="Address" value={shopForm.address} onChange={e => setShopForm(p => ({ ...p, address: e.target.value }))} />
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#152536', display: 'block', marginBottom: 5 }}>Description</label>
                  <textarea value={shopForm.description} onChange={e => setShopForm(p => ({ ...p, description: e.target.value }))} rows={3} className="input-field" style={{ resize: 'vertical' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#152536', display: 'block', marginBottom: 8 }}>Specializations</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {SPECIALIZATIONS.map(s => (
                      <button key={s} type="button" onClick={() => toggleSpec(s)} style={{
                        padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        background: shopForm.specializations.includes(s) ? 'linear-gradient(135deg, #176FA9, #21AFA9)' : '#F4F7FA',
                        color: shopForm.specializations.includes(s) ? '#fff' : '#718096',
                        border: shopForm.specializations.includes(s) ? 'none' : '1.5px solid #E5EAF0',
                      }}>{s}</button>
                    ))}
                  </div>
                </div>
                <Button onClick={handleSave} loading={saving} icon={<Save size={15} />}>Save Shop Info</Button>
              </div>
            </Card>
          )}

          {activeTab === 'privacy' && (
            <Card>
              <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Privacy Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { key: 'shareContact', label: 'Auto-share contact in inquiries', desc: 'Automatically share your phone number when starting a conversation' },
                  { key: 'profileVisible', label: 'Public profile visibility', desc: 'Allow other members to view your shop profile' },
                  { key: 'showPhone', label: 'Show phone in profile', desc: 'Display your phone number on your public shop profile' },
                ].map(item => (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #F4F7FA' }}>
                    <div>
                      <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 600, color: '#152536' }}>{item.label}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#718096' }}>{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setPrivacyForm(p => ({ ...p, [item.key]: !p[item.key] }))}
                      style={{
                        width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer', flexShrink: 0,
                        background: privacyForm[item.key] ? 'linear-gradient(135deg, #176FA9, #21AFA9)' : '#E5EAF0',
                        position: 'relative', transition: 'background 0.2s',
                      }}
                    >
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: 3, transition: 'left 0.2s',
                        left: privacyForm[item.key] ? 23 : 3,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }} />
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20 }}>
                <Button onClick={handleSave} loading={saving} icon={<Save size={15} />}>Save Privacy Settings</Button>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Notification Preferences</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { key: 'newInquiry', label: 'New Inquiry Received', desc: 'When someone responds to your requirement' },
                  { key: 'newMessage', label: 'New Message', desc: 'When you receive a new chat message' },
                  { key: 'expiryReminder', label: 'Expiry Reminders', desc: 'When your requirement is about to expire' },
                  { key: 'communityUpdates', label: 'Community Updates', desc: 'New shops and platform announcements' },
                ].map(item => (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #F4F7FA' }}>
                    <div>
                      <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 600, color: '#152536' }}>{item.label}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#718096' }}>{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifForm(p => ({ ...p, [item.key]: !p[item.key] }))}
                      style={{
                        width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer', flexShrink: 0,
                        background: notifForm[item.key] ? 'linear-gradient(135deg, #176FA9, #21AFA9)' : '#E5EAF0',
                        position: 'relative', transition: 'background 0.2s',
                      }}
                    >
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: 3, transition: 'left 0.2s',
                        left: notifForm[item.key] ? 23 : 3,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }} />
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20 }}>
                <Button onClick={handleSave} loading={saving} icon={<Save size={15} />}>Save Preferences</Button>
              </div>
            </Card>
          )}

          {activeTab === 'preferences' && (
            <Card>
              <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>App Preferences</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#152536', display: 'block', marginBottom: 5 }}>Language</label>
                  <select className="input-field" defaultValue="en">
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#152536', display: 'block', marginBottom: 5 }}>Default Post Duration</label>
                  <select className="input-field" defaultValue="24">
                    <option value="24">24 Hours</option>
                    <option value="48">48 Hours</option>
                    <option value="72">72 Hours</option>
                  </select>
                </div>
                <div style={{ padding: '16px', background: '#FEF2F2', borderRadius: 12, border: '1px solid #FECACA' }}>
                  <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: '#DC2626' }}>Danger Zone</p>
                  <p style={{ margin: '0 0 12px', fontSize: 13, color: '#718096' }}>Permanently delete your account and all associated data.</p>
                  <button style={{ padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: '#FEF2F2', color: '#DC2626', border: '1.5px solid #FECACA', cursor: 'pointer' }}>
                    Delete Account
                  </button>
                </div>
                <Button onClick={handleSave} loading={saving} icon={<Save size={15} />}>Save Preferences</Button>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
