import Button from './Button.jsx';

export default function EmptyState({ icon, title, description, action, actionLabel }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center' }}>
      {icon && (
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #EAF3F9, #E7F8F5)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, color: '#176FA9' }}>
          {icon}
        </div>
      )}
      <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>{title}</h3>
      {description && <p style={{ margin: '0 0 24px', fontSize: 14, color: '#718096', maxWidth: 320, lineHeight: 1.6 }}>{description}</p>}
      {action && <Button onClick={action}>{actionLabel}</Button>}
    </div>
  );
}
