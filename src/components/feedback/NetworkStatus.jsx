import { useUIStore } from '../../store/uiStore.js';
import { AnimatePresence, motion } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function NetworkStatus() {
  const { isOnline } = useUIStore();
  const [showOnline, setShowOnline] = useState(false);
  const [prevOnline, setPrevOnline] = useState(isOnline);

  useEffect(() => {
    if (!prevOnline && isOnline) {
      setShowOnline(true);
      const t = setTimeout(() => setShowOnline(false), 3000);
      return () => clearTimeout(t);
    }
    setPrevOnline(isOnline);
  }, [isOnline]);

  return (
    <AnimatePresence>
      {(!isOnline || showOnline) && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
            background: isOnline ? '#16A34A' : '#DC2626',
            color: '#fff', padding: '10px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif',
          }}
        >
          {isOnline ? <Wifi size={15} /> : <WifiOff size={15} />}
          {isOnline ? 'Back online' : 'No internet connection'}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
