import brandLogo from '../../assets/branding/logo.png';

export default function OLCLogo({ size = 40, showText = true, textColor = '#152536' }) {
  if (showText) {
    return (
      <img
        className="olc-brand-logo"
        src={brandLogo}
        alt="Ozone Lapcare — Your Laptop Care Experts"
        style={{ height: size, width: 'auto', maxWidth: '100%', objectFit: 'contain', filter: textColor === '#fff' ? 'brightness(0) invert(1)' : undefined }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="OLC">
        <defs>
          <linearGradient id="olc_grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#176FA9" />
            <stop offset="100%" stopColor="#21AFA9" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="10" fill="url(#olc_grad)" />
        <text x="20" y="26" textAnchor="middle" fill="white" fontSize="14" fontWeight="800" fontFamily="Manrope, sans-serif">OLC</text>
      </svg>
    </div>
  );
}
