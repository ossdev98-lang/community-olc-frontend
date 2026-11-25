import { CardSkeleton, Skeleton } from '../ui/Skeleton.jsx';

function HeaderSkeleton({ action = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
      <div style={{ display: 'grid', gap: 9, flex: 1 }}>
        <Skeleton width="min(250px, 65%)" height={25} borderRadius={7} />
        <Skeleton width="min(340px, 82%)" height={13} borderRadius={6} />
      </div>
      {action && <Skeleton width={118} height={38} borderRadius={10} />}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <Skeleton height={158} borderRadius={20} style={{ marginBottom: 22 }} />
      <div className="loading-skeleton-stats">
        {[1, 2, 3, 4].map(item => <Skeleton key={item} height={112} borderRadius={15} />)}
      </div>
      <div className="loading-skeleton-columns">
        <div style={{ display: 'grid', gap: 14 }}><Skeleton width="44%" height={19} />{[1, 2].map(item => <CardSkeleton key={item} />)}</div>
        <div style={{ display: 'grid', gap: 14 }}><Skeleton width="52%" height={19} />{[1, 2].map(item => <CardSkeleton key={item} />)}</div>
      </div>
    </>
  );
}

function TableSkeleton() {
  return (
    <div style={{ overflow: 'hidden', border: '1px solid #E5EAF0', borderRadius: 14, background: '#fff' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr .7fr', gap: 14, padding: '14px 18px', background: '#F8FAFC' }}>
        {[1, 2, 3, 4].map(item => <Skeleton key={item} height={12} />)}
      </div>
      {[1, 2, 3, 4, 5].map(item => (
        <div key={item} className="loading-skeleton-table-row">
          <Skeleton width="75%" height={15} />
          <Skeleton width="64%" height={14} />
          <Skeleton width="55%" height={14} />
          <Skeleton width="70%" height={28} borderRadius={99} />
        </div>
      ))}
    </div>
  );
}

function FormSkeleton() {
  return (
    <div style={{ display: 'grid', gap: 18, maxWidth: 760 }}>
      <div className="card" style={{ display: 'grid', gap: 18, padding: 22 }}>
        {[1, 2, 3, 4].map(item => (
          <div key={item} style={{ display: 'grid', gap: 8 }}>
            <Skeleton width={`${22 + (item % 2) * 7}%`} height={12} />
            <Skeleton height={42} borderRadius={9} />
          </div>
        ))}
      </div>
      <div className="loading-skeleton-form-actions"><Skeleton width={100} height={40} /><Skeleton width={150} height={40} /></div>
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 320, height: '100%', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 16px', borderBottom: '1px solid #E5EAF0' }}>
        <Skeleton width={38} height={38} borderRadius={99} />
        <div style={{ display: 'grid', gap: 7, flex: 1 }}><Skeleton width="42%" height={14} /><Skeleton width="26%" height={11} /></div>
        <Skeleton width={92} height={31} borderRadius={9} />
      </div>
      <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 12 }}>
        <Skeleton width="57%" height={58} borderRadius={14} />
        <Skeleton width="49%" height={50} borderRadius={14} style={{ alignSelf: 'flex-end' }} />
        <Skeleton width="68%" height={68} borderRadius={14} />
      </div>
      <div style={{ display: 'flex', gap: 9, padding: 12, borderTop: '1px solid #E5EAF0' }}><Skeleton width={38} height={38} borderRadius={10} /><Skeleton height={40} borderRadius={10} /><Skeleton width={38} height={38} borderRadius={10} /></div>
    </div>
  );
}

export default function LoadingState({ label = 'Loading…', minHeight = 260, variant = 'list' }) {
  const ariaLabel = label.replace(/[.…]+$/, '').trim() || 'Loading';
  const wrapperStyle = { minHeight, width: '100%', maxWidth: variant === 'dashboard' ? 1100 : undefined, margin: '0 auto' };

  if (variant === 'chat') {
    return <div role="status" aria-label={ariaLabel} aria-busy="true" style={{ minHeight, height: '100%', display: 'flex', width: '100%' }}><ChatSkeleton /></div>;
  }

  return (
    <div role="status" aria-label={ariaLabel} aria-busy="true" style={wrapperStyle}>
      <span className="visually-hidden">{label}</span>
      {variant === 'dashboard' ? <DashboardSkeleton /> : (
        <>
          <HeaderSkeleton action={variant === 'table' || variant === 'list'} />
          {variant === 'table' ? <TableSkeleton /> : variant === 'form' || variant === 'detail' || variant === 'profile' ? <FormSkeleton /> : (
            <>
              <div className="loading-skeleton-toolbar"><Skeleton width="min(360px, 100%)" height={40} borderRadius={10} /><Skeleton width={92} height={34} borderRadius={99} /><Skeleton width={80} height={34} borderRadius={99} /></div>
              <div className="loading-skeleton-list">{[1, 2, 3].map(item => <CardSkeleton key={item} />)}</div>
            </>
          )}
        </>
      )}
    </div>
  );
}
