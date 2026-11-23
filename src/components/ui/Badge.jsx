export default function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  const variants = {
    default: { bg: '#F3F4F6', color: '#4B5563' },
    primary: { bg: '#EAF3F9', color: '#176FA9' },
    teal: { bg: '#E7F8F5', color: '#21AFA9' },
    success: { bg: '#DCFCE7', color: '#16A34A' },
    warning: { bg: '#FFFBEB', color: '#D97706' },
    danger: { bg: '#FEF2F2', color: '#DC2626' },
    purple: { bg: '#EDE9FE', color: '#7C3AED' },
    verified: { bg: 'linear-gradient(135deg, #EAF3F9, #E7F8F5)', color: '#176FA9' },
  };
  const v = variants[variant] || variants.default;
  const sizes = { xs: '10px', sm: '11px', md: '12px' };
  const pads = { xs: '1px 6px', sm: '2px 8px', md: '3px 10px' };

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: pads[size] || pads.sm,
        borderRadius: 99,
        fontSize: sizes[size] || sizes.sm,
        fontWeight: 600,
        background: v.bg,
        color: v.color,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}
