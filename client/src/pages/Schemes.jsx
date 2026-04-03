import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SCHEMES, CATEGORIES } from '../services/schemes'
import SchemeCard from '../components/SchemeCard'
import { useAuth } from '../context/AuthContext'
import { saveApplication } from '../services/firestore'

export default function Schemes() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [applying, setApplying] = useState(null)
  const [success, setSuccess] = useState(false)

  const filtered = SCHEMES.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'All' || s.category === activeCategory
    return matchSearch && matchCat
  })

  const handleApply = async (scheme) => {
    if (!user) return navigate('/login')
    setApplying(scheme.id)
    try {
      await saveApplication(user.uid, {
        schemeId: scheme.id,
        schemeName: scheme.name,
        schemeCategory: scheme.category,
        amount: scheme.amount,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setApplying(null)
    }
  }

  return (
    <div className="mesh-bg" style={{ minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <div className="animate-fade-up" style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
            Government Schemes
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Browse {SCHEMES.length} welfare schemes across categories
          </p>
        </div>

        <div className="animate-fade-up-delay-1" style={{ marginBottom: '28px' }}>
          <input
            className="input-field"
            type="text"
            placeholder="🔍  Search schemes by name or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ marginBottom: '16px', fontSize: '0.95rem' }}
          />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '7px 16px', borderRadius: '20px', cursor: 'pointer',
                  border: `1.5px solid ${activeCategory === cat ? 'var(--accent)' : 'var(--border)'}`,
                  background: activeCategory === cat ? 'var(--accent-subtle)' : 'var(--bg-card)',
                  color: activeCategory === cat ? 'var(--accent)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-display)', fontWeight: activeCategory === cat ? 700 : 500,
                  fontSize: '0.82rem', transition: 'all 0.2s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {success && (
          <div style={{
            position: 'fixed', top: '80px', right: '24px', zIndex: 100,
            background: '#ecfdf5', border: '1px solid #6ee7b7',
            color: '#059669', padding: '12px 20px', borderRadius: '12px',
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          }}>
            ✅ Application submitted successfully!
          </div>
        )}

        <div style={{ marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-display)' }}>
          Showing {filtered.length} scheme{filtered.length !== 1 ? 's' : ''}
          {activeCategory !== 'All' && ` in ${activeCategory}`}
          {search && ` for "${search}"`}
        </div>

        {filtered.length === 0 ? (
          <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              No schemes found
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Try a different search term or category.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}>
            {filtered.map(scheme => (
              <div key={scheme.id} style={{ position: 'relative' }}>
                <SchemeCard scheme={scheme} onApply={handleApply} />
                {applying === scheme.id && (
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '16px',
                    background: 'rgba(255,255,255,0.85)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(4px)',
                  }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--accent)' }}>
                      Submitting...
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}