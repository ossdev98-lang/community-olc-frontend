import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, MessageCircle, Mail, Phone, BookOpen, ArrowLeft } from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { toast } from 'sonner';

const FAQS = [
  { q: 'How do I post a requirement?', a: 'Go to Community Feed and click "Post Requirement". Fill in the product details, set a duration (24/48/72 hours), and submit. Your requirement will be visible to all approved members.' },
  { q: 'How does the private inquiry system work?', a: 'When you click "Private Inquiry" on a requirement, a private one-to-one conversation is created between you and the requirement owner. No other member can see this conversation.' },
  { q: 'Why is my phone number hidden?', a: 'Phone numbers are hidden by default to protect your privacy. You can choose to share your contact details within a private conversation using the "Share Contact" button.' },
  { q: 'What happens when a requirement expires?', a: 'Expired requirements are removed from the active community feed. However, all existing private conversations related to that requirement remain accessible to the participants.' },
  { q: 'How long does shop approval take?', a: 'Our team reviews new shop registrations within 24-48 hours. You will receive an email notification once your shop is approved or if additional information is needed.' },
  { q: 'Can I renew an expired requirement?', a: 'Yes! Go to My Requirements, find the expired requirement, and click "Renew". This creates a fresh 24-hour posting cycle for the same requirement.' },
  { q: 'How do I send a product quotation?', a: 'Inside a private inquiry conversation, click the quotation icon (box icon) in the message composer. Fill in the product details, price, and warranty information to send a structured quotation card.' },
];

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #F4F7FA' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: '#152536' }}>{faq.q}</span>
        {open ? <ChevronUp size={16} color="#718096" style={{ flexShrink: 0 }} /> : <ChevronDown size={16} color="#718096" style={{ flexShrink: 0 }} />}
      </button>
      {open && <p style={{ margin: '0 0 16px', fontSize: 13, color: '#718096', lineHeight: 1.7 }}>{faq.a}</p>}
    </div>
  );
}

export default function HelpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Support ticket submitted! We\'ll respond within 24 hours.');
    setForm({ subject: '', message: '' });
  };

  return (
    <div className="help-page" style={{ maxWidth: 800 }}>
      <div className="help-page-heading" style={{ marginBottom: 24 }}>
        <button className="mobile-page-back" onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeft size={16} /><span>Back</span></button>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Help & Support</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>Find answers or contact our support team</p>
      </div>

      {/* Contact cards */}
      <div className="contact-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { icon: MessageCircle, label: 'Live Chat', desc: 'Chat with support', color: '#176FA9', bg: '#EAF3F9' },
          { icon: Mail, label: 'Email Support', desc: 'support@ozonelap.in', color: '#21AFA9', bg: '#E7F8F5' },
          { icon: Phone, label: 'Phone Support', desc: '+91 98765 43210', color: '#7C3AED', bg: '#EDE9FE' },
        ].map(item => (
          <Card key={item.label} className="help-contact-card" hover style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <item.icon size={20} color={item.color} />
            </div>
            <div className="help-contact-copy">
              <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#152536' }}>{item.label}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#718096' }}>{item.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="help-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* FAQs */}
        <Card className="help-content-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <BookOpen size={18} color="#176FA9" />
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Frequently Asked Questions</h3>
          </div>
          {FAQS.map((faq, i) => <FAQItem key={i} faq={faq} />)}
        </Card>

        {/* Contact form */}
        <Card className="help-content-card help-ticket-card">
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>Submit a Support Ticket</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#152536', display: 'block', marginBottom: 5 }}>Subject</label>
              <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Brief description of your issue" className="input-field" required />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#152536', display: 'block', marginBottom: 5 }}>Message</label>
              <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Describe your issue in detail..." rows={6} className="input-field" style={{ resize: 'vertical' }} required />
            </div>
            <Button type="submit" icon={<Mail size={15} />}>Submit Ticket</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
