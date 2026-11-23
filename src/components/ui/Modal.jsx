import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, size = 'md', footer }) {
  const sizes = { sm: 420, md: 560, lg: 720, xl: 900 };
  const w = sizes[size] || sizes.md;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(11,23,38,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
          onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              background: '#fff', borderRadius: 20, width: '100%', maxWidth: w,
              maxHeight: '90vh', display: 'flex', flexDirection: 'column',
              boxShadow: '0 24px 64px rgba(11,23,38,0.2)',
            }}
          >
            {title && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #E5EAF0' }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: '#152536' }}>{title}</h3>
                <button onClick={onClose} style={{ background: '#F4F7FA', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex', color: '#718096' }}>
                  <X size={16} />
                </button>
              </div>
            )}
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>{children}</div>
            {footer && <div style={{ padding: '16px 24px', borderTop: '1px solid #E5EAF0' }}>{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
