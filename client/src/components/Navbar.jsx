import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav style={{
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            background: 'linear-gradient(135deg, #2563eb, #6366f1)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
          }}>🏛️</div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '1.1rem',
            color: 'var(--text-primary)',
          }}>SchemeLedger</span>
        </Link>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

          {/* Nav links — only when logged in */}
          {user && (
            <>
              <NavLink to="/dashboard" active={isActive('/dashboard')}>Dashboard</NavLink>
              <NavLink to="/schemes" active={isActive('/schemes')}>Schemes</NavLink>
              <NavLink to="/applications" active={isActive('/applications')}>My Applications</NavLink>
              <NavLink to="/assistant" active={isActive('/assistant')}>AI Assistant</NavLink>
            </>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              marginLeft: '8px',
              transition: 'all 0.2s',
            }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {/* Auth section */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '10px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
              }}>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt=""
                    style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                  />
                ) : (
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #6366f1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}>
                    {user.displayName?.[0] || user.email?.[0] || 'U'}
                  </div>
                )}
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                }}>
                  {user.displayName?.split(' ')[0] || 'User'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn-ghost"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
              <Link to="/login">
                <button className="btn-ghost" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                  Login
                </button>
              </Link>
              <Link to="/signup">
                <button className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                  Get Started
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

function NavLink({ to, children, active }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <button
        style={{
          padding: '7px 14px',
          borderRadius: '8px',
          border: 'none',
          background: active ? 'var(--accent-subtle)' : 'transparent',
          color: active ? 'var(--accent)' : 'var(--text-secondary)',
          fontFamily: 'var(--font-display)',
          fontWeight: active ? 600 : 500,
          fontSize: '0.875rem',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          if (!active) {
            e.target.style.background = 'var(--bg-secondary)'
            e.target.style.color = 'var(--text-primary)'
          }
        }}
        onMouseLeave={e => {
          if (!active) {
            e.target.style.background = 'transparent'
            e.target.style.color = 'var(--text-secondary)'
          }
        }}
      >
        {children}
      </button>
    </Link>
  )
}