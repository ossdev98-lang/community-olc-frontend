import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getActiveRequestCount } from '../../services/api.js';

export default function GlobalLoadingBar() {
  const [visible, setVisible] = useState(() => getActiveRequestCount() > 0);

  useEffect(() => {
    const update = (event) => setVisible(event.detail > 0);
    window.addEventListener('olc:active-requests', update);
    return () => window.removeEventListener('olc:active-requests', update);
  }, []);

  if (!visible) return null;
  return (
    <div role="progressbar" aria-label="Loading" style={{ position: 'fixed', inset: '0 0 auto', height: 3, zIndex: 10000, overflow: 'hidden', background: 'rgba(33,175,169,0.16)', pointerEvents: 'none' }}>
      <motion.div
        style={{ width: '38%', height: '100%', background: 'linear-gradient(90deg, #176FA9, #21AFA9)', boxShadow: '0 0 10px rgba(33,175,169,0.45)' }}
        animate={{ x: ['-110%', '270%'] }}
        transition={{ duration: 1.1, ease: 'easeInOut', repeat: Infinity }}
      />
    </div>
  );
}
