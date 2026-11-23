import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  label, name, type = 'text', placeholder, value, onChange, onBlur,
  error, icon, required, disabled, hint, className = '',
}) {
  const [showPwd, setShowPwd] = useState(false);
  const inputType = type === 'password' ? (showPwd ? 'text' : 'password') : type;

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: '#152536' }}>
          {label} {required && <span style={{ color: '#DC2626' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0', display: 'flex' }}>
            {icon}
          </div>
        )}
        <input
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className="input-field"
          style={{
            paddingLeft: icon ? 38 : 14,
            paddingRight: type === 'password' ? 40 : 14,
            borderColor: error ? '#FCA5A5' : undefined,
            background: disabled ? '#F9FAFB' : undefined,
          }}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p style={{ fontSize: 12, color: '#DC2626', margin: 0 }}>{error}</p>}
      {hint && !error && <p style={{ fontSize: 12, color: '#718096', margin: 0 }}>{hint}</p>}
    </div>
  );
}
