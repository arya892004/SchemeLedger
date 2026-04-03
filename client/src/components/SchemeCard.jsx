import { useNavigate } from 'react-router-dom'

const CATEGORY_COLORS = {
  Agriculture: { bg: '#ecfdf5', color: '#059669', dark: '#064e3b', darkText: '#34d399' },
  Housing: { bg: '#eff6ff', color: '#2563eb', dark: '#1e3a5f', darkText: '#60a5fa' },
  Education: { bg: '#fdf4ff', color: '#9333ea', dark: '#3b0764', darkText: '#c084fc' },
  Business: { bg: '#fff7ed', color: '#ea580c', dark: '#431407', darkText: '#fb923c' },
  Women: { bg: '#fdf2f8', color: '#db2777', dark: '#500724', darkText: '#f472b6' },
  Health: { bg: '#f0fdf4', color: '#16a34a', dark: '#052e16', darkText: '#4ade80' },
}

export default function SchemeCard({ scheme, onApply }) {
  const navigate = useNavigate()
  const cat = CATEGORY_COLORS[scheme.category] || CATEGORY_COLORS['Housing']
  const isDark = document.documentElement.classList.contains('dark')

  return (
    <div
      className="card"
      style={{ padding: '24px', cursor: 'pointer' }}
      onClick={() => navigate(`/schemes/${scheme.id}`)}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px',
      }}>
        <span style={{
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '0.72rem',
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          background: isDark ? cat.dark : cat.bg,
          color: isDark ? cat.darkText : cat.color,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {scheme.category}
        </span>
        <span style={{
          fontSize: '0.82rem',
          fontWeight: 700,
          color: 'var(--accent)',
          fontFamily: 'var(--font-display)',
        }}>
          {scheme.amount}
        </span>
      </div>

      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '1.05rem',
        color: 'var(--text-primary)',
        marginBottom: '8px',
      }}>
        {scheme.name}
      </h3>

      <p style={{
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        lineHeight: '1.6',
        marginBottom: '16px',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {scheme.description}
      </p>

      <div style={{
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap',
        marginBottom: '16px',
      }}>
        {scheme.eligibility?.slice(0, 2).map(e => (
          <span key={e} style={{
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            background: 'var(--bg-secondary)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
            fontFamily: 'var(--font-display)',
          }}>
            {e}
          </span>
        ))}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          📅 {scheme.deadline === 'Ongoing' ? 'Ongoing' : `Deadline: ${scheme.deadline}`}
        </span>
        <button
          className="btn-primary"
          style={{ padding: '7px 16px', fontSize: '0.8rem' }}
          onClick={e => { e.stopPropagation(); onApply?.(scheme) }}
        >
          Apply Now →
        </button>
      </div>
    </div>
  )
}