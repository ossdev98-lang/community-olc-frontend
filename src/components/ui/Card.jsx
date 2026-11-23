import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = false, onClick, style = {}, padding = true }) {
  const base = {
    background: '#FFFFFF',
    borderRadius: 16,
    border: '1px solid #E5EAF0',
    boxShadow: '0 1px 3px rgba(21,37,54,0.06)',
    padding: padding ? 20 : 0,
    ...style,
  };

  if (hover || onClick) {
    return (
      <motion.div
        className={className}
        style={{ ...base, cursor: onClick ? 'pointer' : 'default' }}
        whileHover={{ boxShadow: '0 8px 24px rgba(23,111,169,0.12)', y: -1 }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={className} style={base}>{children}</div>;
}
