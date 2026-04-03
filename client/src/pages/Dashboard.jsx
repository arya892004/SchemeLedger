import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserApplications } from '../services/firestore'
import { SCHEMES, STATUS_CONFIG } from '../services/schemes'
import StatusTimeline from '../components/StatusTimeline'

export default function Dashboard() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getUserApplications(user.uid)
      .then(setApplications)
      .finally(() => setLoading(false))
  }, [user])

  const firstName = user?.displayName?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const stats = [
    { label: 'Applications', value: applications.length, icon: '📋', color: 'var(--accent)' },
    { label: 'Under Review', value: applications.filter(a => a.status === 'under_review').length, icon: '🔍', color: '#d97706' },
    { label: 'Approved', value: applications.filter(a => a.status === 'approved').length, icon: '✅', color: '#059669' },
    { label: 'Available Schemes', value: SCHEMES.length, icon: '🏛️', color: '#7c3aed' },
  ]

  return (
    <div className="mesh-bg" style={{ minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <div className="animate-fade-up" style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '6px',
          }}>
            {greeting}, {firstName} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Here's an overview of your welfare scheme journey.
          </p>
        </div>

        {/* Stats */}
        <div className="animate-fade-up-delay-1" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          {stats.map((s, i) => (
            <div key={i} className="card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: 'var(--accent-subtle)', border: '1px solid var(--border-strong)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', flexShrink: 0,
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800,
                  fontSize: '1.8rem', color: s.color, lineHeight: 1,
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontSize: '0.82rem', color: 'var(--text-muted)',
                  fontFamily: 'var(--font-display)', marginTop: '4px',
                }}>
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>

          {/* Recent Applications */}
          <div className="animate-fade-up-delay-2">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                Recent Applications
              </h2>
              <Link to="/applications" style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-display)' }}>
                View all →
              </Link>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="card" style={{ height: '80px', background: 'var(--bg-secondary)' }} />
                ))}
              </div>
            ) : applications.length === 0 ? (
              <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  No applications yet
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
                  Browse available schemes and start your first application.
                </p>
                <Link to="/schemes">
                  <button className="btn-primary" style={{ padding: '10px 24px' }}>Browse Schemes →</button>
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {applications.slice(0, 4).map(app => {
                  const config = STATUS_CONFIG[app.status] || STATUS_CONFIG.submitted
                  return (
                    <div key={app.id} className="card" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                            {app.schemeName}
                          </h4>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Applied {app.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                          </p>
                        </div>
                        <span className={`badge ${config.color}`}>
                          {config.icon} {config.label}
                        </span>
                      </div>
                      <StatusTimeline status={app.status} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="animate-fade-up-delay-3">
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '16px' }}>
              Recommended Schemes
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {SCHEMES.slice(0, 4).map(scheme => (
                <Link key={scheme.id} to={`/schemes/${scheme.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '3px' }}>
                          {scheme.name}
                        </h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{scheme.category}</p>
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-display)', marginLeft: '8px', whiteSpace: 'nowrap' }}>
                        {scheme.amount}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              <Link to="/schemes">
                <button className="btn-ghost" style={{ width: '100%', padding: '10px' }}>
                  View All Schemes →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}