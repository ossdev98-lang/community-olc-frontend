import { getInitials, generateAvatarColor } from '../../utils/index.js';

export default function Avatar({ name, src, size = 36, className = '' }) {
  const [bg, text] = generateAvatarColor(name);
  const style = {
    width: size, height: size, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.35, fontWeight: 700, fontFamily: 'Manrope, sans-serif',
    flexShrink: 0, overflow: 'hidden',
  };

  if (src) {
    return <img src={src} alt={name} style={{ ...style, objectFit: 'cover' }} className={className} />;
  }

  return (
    <div style={{ ...style, background: bg, color: text }} className={className}>
      {getInitials(name)}
    </div>
  );
}
