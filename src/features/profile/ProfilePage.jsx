import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, CheckCircle, ArrowLeft, Edit2, X, Camera } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { authService, shopService } from '../../services/index.js';
import Avatar from '../../components/ui/Avatar.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { SPECIALIZATIONS, BUSINESS_TYPES } from '../../constants/index.js';
import { toast } from 'sonner';
import LoadingState from '../../components/feedback/LoadingState.jsx';

const SETTING_TITLES = { account: 'My Account', shop: 'My Shop', privacy: 'Privacy', notifications: 'Notifications', preferences: 'Preferences' };

export default function ProfilePage({ settingSection = null }) {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [shop, setShop] = useState(user);
  const activeTab = settingSection;
  const [editingProfile, setEditingProfile] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const logoInputRef = useRef(null);
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
    if (!logoPreview.startsWith('blob:')) return undefined;
    return () => URL.revokeObjectURL(logoPreview);
  }, [logoPreview]);

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

  if (loading) return <LoadingState label="Loading your profile…" variant="profile" />;
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
      await shopService.update(updates, logoFile);
      const res = await authService.me();
      const data = res.data?.data ?? res.data;
      setShop(data);
      updateUser(data);
      setLogoFile(null);
      setLogoPreview('');
      toast.success('Changes saved successfully!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
      return false;
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
        {settingSection ? (
          <div style={{ marginBottom: 24 }}>
            <button type="button" onClick={() => navigate('/settings')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: 0, marginBottom: 12, border: 0, background: 'none', color: '#718096', fontSize: 13, cursor: 'pointer' }}><ArrowLeft size={15} /> Settings</button>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>{SETTING_TITLES[settingSection] || 'Settings'}</h1>
          </div>
        ) : (
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>My Profile</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>Your account and shop information</p>
          </div>
        )}

        {!settingSection ? (
          <Card style={{ maxWidth: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ position: 'relative' }}>
                <Avatar name={editingProfile ? accountForm.ownerName : shop.ownerName} src={logoPreview || shop.shop?.logo || shop.logo} size={64} />
                {editingProfile && <>
                  <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={event => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { toast.error('Choose a PNG, JPG, or WEBP logo.'); event.target.value = ''; return; }
                    if (file.size > 2 * 1024 * 1024) { toast.error('Logo must be 2MB or smaller.'); event.target.value = ''; return; }
                    setLogoFile(file);
                    setLogoPreview(URL.createObjectURL(file));
                  }} />
                  <button type="button" onClick={() => logoInputRef.current?.click()} aria-label="Update shop logo" title="Update shop logo" style={{ position: 'absolute', right: -3, bottom: -3, width: 26, height: 26, borderRadius: '50%', border: '2px solid #fff', background: 'linear-gradient(135deg, #176FA9, #21AFA9)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Camera size={13} /></button>
                </>}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#152536' }}>{shop.ownerName || 'Your name'}</p>
                <p style={{ margin: 0, fontSize: 13, color: '#718096' }}>{shop.shopName || shop.shop_name || 'Shop name not added'}</p>
                {shop.shop?.is_verified && <div style={{ marginTop: 6 }}><Badge variant="teal" size="xs"><CheckCircle size={10} /> Verified</Badge></div>}
              </div>
            </div>
            {editingProfile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Input label="Full Name" value={accountForm.ownerName} onChange={e => setAccountForm(p => ({ ...p, ownerName: e.target.value }))} />
                <Input label="Email Address" type="email" value={accountForm.email} onChange={e => setAccountForm(p => ({ ...p, email: e.target.value }))} />
                <Input label="Mobile Number" value={accountForm.mobile} onChange={e => setAccountForm(p => ({ ...p, mobile: e.target.value }))} />
                <Input label="Shop Name" value={shopForm.name} onChange={e => setShopForm(p => ({ ...p, name: e.target.value }))} />
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <Button type="button" variant="ghost" onClick={() => { setAccountForm({ ownerName: shop.ownerName || '', email: shop.email || '', mobile: shop.mobile || '' }); setShopForm(p => ({ ...p, name: shop.shopName || shop.shop_name || '' })); setLogoFile(null); setLogoPreview(''); setEditingProfile(false); }} icon={<X size={15} />}>Cancel</Button>
                  <Button onClick={async () => { if (await handleSave()) setEditingProfile(false); }} loading={saving} fullWidth icon={<Save size={15} />}>Save Profile</Button>
                </div>
              </div>
            ) : (
              <>
                {[
                  ['Full Name', shop.ownerName],
                  ['Email Address', shop.email],
                  ['Mobile Number', shop.mobile],
                  ['Shop Name', shop.shopName || shop.shop_name],
                  ['Location', [shop.shop?.city, shop.shop?.state].filter(Boolean).join(', ')],
                ].filter(([, value]) => value).map(([label, value]) => (
                  <div key={label} style={{ padding: '12px 0', borderTop: '1px solid #F1F4F7' }}>
                    <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</p>
                    <p style={{ margin: 0, fontSize: 14, color: '#526579' }}>{value}</p>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={() => setEditingProfile(true)} icon={<Edit2 size={15} />} style={{ marginTop: 14 }}>Edit Profile</Button>
              </>
            )}
          </Card>
        ) : (
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
        )}
    </div>
  );
}
