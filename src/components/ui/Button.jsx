import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Button({
  children, onClick, variant = 'primary', size = 'md',
  disabled = false, loading = false, icon, className = '', type = 'button', fullWidth = false, style = {},
}) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = loading || internalLoading;
  const variants = {
    primary: { background: 'linear-gradient(135deg, #176FA9 0%, #21AFA9 100%)', color: '#fff', border: 'none' },
    secondary: { background: '#fff', color: '#176FA9', border: '1.5px solid #176FA9' },
    ghost: { background: 'transparent', color: '#718096', border: '1.5px solid #E5EAF0' },
    danger: { background: '#FEF2F2', color: '#DC2626', border: '1.5px solid #FECACA' },
    dark: { background: '#0B1726', color: '#fff', border: 'none' },
  };
  const sizes = {
    xs: { padding: '5px 10px', fontSize: 12, borderRadius: 8 },
    sm: { padding: '7px 14px', fontSize: 13, borderRadius: 9 },
    md: { padding: '10px 20px', fontSize: 14, borderRadius: 10 },
    lg: { padding: '13px 28px', fontSize: 15, borderRadius: 12 },
  };
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;
  const handleClick = async (event) => {
    if (!onClick || isLoading || disabled) return;
    const result = onClick(event);
    if (!result || typeof result.then !== 'function') return;
    setInternalLoading(true);
    try { await result; }
    catch (error) { console.error('Button action failed', error); }
    finally { setInternalLoading(false); }
  };

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      disabled={disabled || isLoading}
      whileHover={!disabled && !isLoading ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      className={className}
      style={{
        ...v, ...s,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        fontWeight: 600, fontFamily: 'Inter, sans-serif', cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || isLoading ? 0.65 : 1, transition: 'opacity 0.15s',
        width: fullWidth ? '100%' : 'auto', whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {isLoading ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
          </path>
        </svg>
      ) : icon}
      {children}
    </motion.button>
  );
}
