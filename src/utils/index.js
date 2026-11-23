export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  const time = typeof timestamp === 'string' ? new Date(timestamp).getTime() : (timestamp instanceof Date ? timestamp.getTime() : timestamp);
  if (isNaN(time)) return '';
  const diff = Date.now() - time;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const formatTimeRemaining = (expiresAt) => {
  if (!expiresAt) return { text: '', urgency: 'normal' };
  const time = typeof expiresAt === 'string' ? new Date(expiresAt).getTime() : (expiresAt instanceof Date ? expiresAt.getTime() : expiresAt);
  if (isNaN(time)) return { text: '', urgency: 'normal' };
  const diff = time - Date.now();
  if (diff <= 0) return { text: 'Expired', urgency: 'expired' };
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  let urgency = 'normal';
  if (diff < 3600000) urgency = 'critical';
  else if (diff < 21600000) urgency = 'warning';
  if (hours === 0) return { text: `${mins}m remaining`, urgency };
  if (mins === 0) return { text: `${hours}h remaining`, urgency };
  return { text: `${hours}h ${mins}m remaining`, urgency };
};

export const getUrgencyStyles = (urgency) => {
  switch (urgency) {
    case 'critical': return { bg: '#FEF2F2', text: '#DC2626', dot: '#DC2626' };
    case 'warning': return { bg: '#FFFBEB', text: '#D97706', dot: '#F59E0B' };
    case 'expired': return { bg: '#F9FAFB', text: '#9CA3AF', dot: '#9CA3AF' };
    default: return { bg: '#F0FDF4', text: '#16A34A', dot: '#22C55E' };
  }
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
};

export const formatCurrency = (amount) => {
  if (!amount) return '';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

export const truncate = (str, n) => str && str.length > n ? str.slice(0, n) + '...' : str;

export const generateAvatarColor = (name) => {
  const colors = [
    ['#EAF3F9', '#176FA9'], ['#E7F8F5', '#21AFA9'], ['#EDE9FE', '#7C3AED'],
    ['#FEF3C7', '#D97706'], ['#FCE7F3', '#DB2777'], ['#DCFCE7', '#16A34A'],
    ['#FFF7ED', '#EA580C'], ['#EFF6FF', '#2563EB'],
  ];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  return colors[idx];
};
