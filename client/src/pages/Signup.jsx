import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { registerWithEmail, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    if (!form.name.trim()) return 'Please enter your full name.'
    if (!form.email) return 'Please enter your email.'
    if (form.password.length < 6) return 'Password must be at least 6 characters.'
    if (form.password !== form.confirm) return 'Passwords do not match.'
    return null
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  const err = validate()
  if (err) return setError(err)
  setError('')
  setLoading(true)
  try {
    await registerWithEmail(form.name.trim(), form.email, form.password)
    navigate('/dashboard', { replace: true })
  } catch (err) {
    setError(getErrorMessage(err.code))
  } finally {
    setLoading(false)
  }
}

const handleGoogle = async () => {
  try {
    await loginWithGoogle()
    navigate('/dashboard', { replace: true })
  } catch {
    setError('Google sign-in failed.')
  }
}

  return (
    <div className="mesh-bg" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div className="animate-fade-up" style={{ width: '100%', maxWidth: '440px' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '52px', height: '52px',
            background: 'linear-gradient(135deg, #2563eb, #6366f1)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
          }}>🏛️</div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: '6px',
          }}>Create your account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Start discovering schemes you deserve
          </p>
        </div>

        <div className="card" style={{ padding: '32px' }}>

          <button
            onClick={handleGoogle}
            style={{
              width: '100%', padding: '12px', borderRadius: '10px',
              border: '1.5px solid var(--border)', background: 'var(--bg-card)',
              color: 'var(--text-primary)', fontFamily: 'var(--font-display)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '10px', transition: 'all 0.2s', marginBottom: '20px',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>or with email</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Arya Singh' },
              { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
              { key: 'password', label: 'Password', type: 'password', placeholder: 'Min. 6 characters' },
              { key: 'confirm', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password' },
            ].map(field => (
              <div key={field.key}>
                <label style={{
                  display: 'block', fontSize: '0.82rem', fontWeight: 600,
                  fontFamily: 'var(--font-display)', color: 'var(--text-secondary)', marginBottom: '6px',
                }}>
                  {field.label}
                </label>
                <input
                  className="input-field"
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                />
              </div>
            ))}

            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px',
                background: '#fef2f2', border: '1px solid #fecaca',
                color: '#dc2626', fontSize: '0.82rem', fontFamily: 'var(--font-display)',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '13px', fontSize: '0.95rem', marginTop: '4px' }}
            >
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

function getErrorMessage(code) {
  const messages = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/weak-password': 'Password is too weak.',
  }
  return messages[code] || 'Something went wrong. Please try again.'
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}