export default function LoadingState({ label = 'Loading…', minHeight = 260 }) {
  return (
    <div role="status" aria-live="polite" style={{ minHeight, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#718096' }}>
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#176FA9" strokeWidth="2.5" aria-hidden="true">
        <circle cx="12" cy="12" r="9" strokeOpacity=".2" />
        <path d="M21 12a9 9 0 0 0-9-9"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur=".8s" repeatCount="indefinite" /></path>
      </svg>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
    </div>
  );
}
