import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserApplications } from '../services/firestore'
import { STATUS_CONFIG } from '../services/schemes'
import StatusTimeline from '../components/StatusTimeline'

export default function Applications() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (!user) return
    getUserApplications(user.uid)
      .then(setApplications)
      .finally(() => setLoading(false))
  }, [user])

  const filtered = filter === 'all'
    ? applications
    : applications.filter(a => a.status === filter)

  return (
    <div className="mesh-bg" style={{ minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div className="animate-fade-up" style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
            My Applications
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Track and manage all your scheme applications
          </p>
        </div>

        <div className="animate-fade-up-delay-1" style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { value: 'all', label: 'All' },
            { value: 'submitted', label: 'Submitted' },
            { value: 'under_review', label: 'Under Review' },
            { value: 'verified', label: 'Verified' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: '7px 16px', borderRadius: '20px', cursor: 'pointer',
                border: `1.5px solid ${filter === f.value ? 'var(--accent)' : 'var(--border)'}`,
                background: filter === f.value ? 'var(--accent-subtle)' : 'var(--bg-card)',
                color: filter === f.value ? 'var(--accent)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-display)', fontWeight: filter === f.value ? 700 : 500,
                fontSize: '0.82rem', transition: 'all 0.2s',
              }}
            >
              {f.label}{f.value === 'all' ? ` (${applications.length})` : ''}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="card" style={{ height: '100px', background: 'var(--bg-secondary)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {filter === 'all' ? 'No applications yet' : `No ${filter.replace('_', ' ')} applications`}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
              {filter === 'all' ? 'Start by browsing available schemes.' : 'Try a different filter.'}
            </p>
            {filter === 'all' && (
              <Link to="/schemes">
                <button className="btn-primary" style={{ padding: '10px 24px' }}>Browse Schemes →</button>
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filtered.map(app => {
              const config = STATUS_CONFIG[app.status] || STATUS_CONFIG.submitted
              const isExpanded = expanded === app.id
              return (
                <div key={app.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                  <div
                    style={{ padding: '20px 24px', cursor: 'pointer' }}
                    onClick={() => setExpanded(isExpanded ? null : app.id)}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                          {app.schemeName}
                        </h3>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            📅 {app.createdAt?.toDate?.()?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) || 'Recently'}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600 }}>
                            💰 {app.amount}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className={`badge ${config.color}`}>
                          {config.icon} {config.label}
                        </span>
                        <span style={{
                          color: 'var(--text-muted)', fontSize: '12px',
                          transition: 'transform 0.2s',
                          display: 'inline-block',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                        }}>▼</span>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border)' }}>
                      <div style={{ paddingTop: '20px' }}>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', marginBottom: '16px' }}>
                          Application Progress
                        </p>
                        <StatusTimeline status={app.status} />
                      </div>
                      {app.status === 'approved' && (
                        <div style={{
                          marginTop: '16px', padding: '14px 18px', borderRadius: '10px',
                          background: '#ecfdf5', border: '1px solid #6ee7b7',
                          display: 'flex', gap: '10px', alignItems: 'center',
                        }}>
                          <span style={{ fontSize: '18px' }}>🎉</span>
                          <p style={{ fontSize: '0.875rem', color: '#065f46', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                            Congratulations! Your application has been approved.
                          </p>
                        </div>
                      )}
                      {app.status === 'rejected' && (
                        <div style={{
                          marginTop: '16px', padding: '14px 18px', borderRadius: '10px',
                          background: '#fef2f2', border: '1px solid #fecaca',
                          display: 'flex', gap: '10px', alignItems: 'center',
                        }}>
                          <span style={{ fontSize: '18px' }}>❌</span>
                          <p style={{ fontSize: '0.875rem', color: '#991b1b', fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                            Application rejected. {app.rejectionReason || 'Please check eligibility and reapply.'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}