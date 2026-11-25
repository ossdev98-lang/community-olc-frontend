export function Skeleton({ width = '100%', height = 16, borderRadius = 8, className = '', style = {} }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius, flexShrink: 0, ...style }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Skeleton width={40} height={40} borderRadius={99} />
        <div style={{ flex: 1 }}>
          <Skeleton height={14} width="60%" style={{ marginBottom: 6 }} />
          <Skeleton height={12} width="40%" />
        </div>
      </div>
      <Skeleton height={18} width="80%" style={{ marginBottom: 8 }} />
      <Skeleton height={14} width="100%" style={{ marginBottom: 6 }} />
      <Skeleton height={14} width="90%" style={{ marginBottom: 16 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <Skeleton height={28} width={80} borderRadius={99} />
        <Skeleton height={28} width={80} borderRadius={99} />
      </div>
    </div>
  );
}
