import { STATUS_CONFIG } from '../services/schemes'

const STEPS = ['submitted', 'under_review', 'verified', 'approved']

export default function StatusTimeline({ status }) {
  const currentIndex = STEPS.indexOf(status)
  const isRejected = status === 'rejected'

  return (
    <div style={{ padding: '16px 0' }}>
      {isRejected ? (
        <div style={{
          padding: '16px',
          borderRadius: '10px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          ❌ Application Rejected
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            right: '16px',
            height: '2px',
            background: 'var(--border)',
            zIndex: 0,
          }} />
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            height: '2px',
            width: `${Math.max(0, (currentIndex / (STEPS.length - 1)) * 88)}%`,
            background: 'linear-gradient(90deg, #2563eb, #6366f1)',
            zIndex: 1,
            transition: 'width 0.6s ease',
          }} />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 2,
          }}>
            {STEPS.map((step, i) => {
              const done = i <= currentIndex
              const config = STATUS_CONFIG[step]
              return (
                <div key={step} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: done ? 'linear-gradient(135deg, #2563eb, #6366f1)' : 'var(--bg-card)',
                    border: done ? 'none' : '2px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: done ? '14px' : '12px',
                    color: done ? 'white' : 'var(--text-muted)',
                    fontWeight: 700,
                    transition: 'all 0.3s',
                    boxShadow: done ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
                  }}>
                    {done ? '✓' : i + 1}
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-display)',
                    fontWeight: done ? 600 : 400,
                    color: done ? 'var(--accent)' : 'var(--text-muted)',
                    textAlign: 'center',
                    maxWidth: '64px',
                    lineHeight: '1.3',
                  }}>
                    {config.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}