import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useRef, useState } from 'react'

const FEATURES = [
  {
    icon: '🔍',
    title: 'Smart Discovery',
    desc: 'Find schemes you qualify for instantly. No more searching through hundreds of government websites manually.',
    color: '#2563eb',
  },
  {
    icon: '⛓️',
    title: 'Blockchain Verified',
    desc: 'Every application is permanently recorded on-chain. Tamper-proof, transparent, and publicly auditable.',
    color: '#6366f1',
  },
  {
    icon: '🔒',
    title: 'Privacy First',
    desc: 'Your Aadhaar is hashed client-side. Only a cryptographic proof hits the blockchain — never your raw data.',
    color: '#8b5cf6',
  },
  {
    icon: '📋',
    title: 'Real-time Tracking',
    desc: 'Track every application from submission to fund disbursement with a complete on-chain audit trail.',
    color: '#3b82f6',
  },
]

const SCHEMES_MARQUEE = [
  'PM-KISAN', 'PM Awas Yojana', 'Ayushman Bharat', 'MUDRA Yojana',
  'PM Ujjwala', 'NSP Scholarship', 'Sukanya Samriddhi', 'PM Fasal Bima',
  'Atal Pension', 'Jan Dhan Yojana', 'PMEGP', 'Kisan Credit Card',
  'Beti Bachao', 'Swachh Bharat', 'Digital India', 'Make in India',
]

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed')
          observer.unobserve(e.target)
        }
      }),
      { threshold: 0.1 }
    )
    const elements = document.querySelectorAll('.scroll-reveal')
    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

export default function Landing() {
  const { user } = useAuth()
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 })
  useScrollReveal()

  useEffect(() => {
    const handleMove = e => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    particlesRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 0.5,
      color: ['#2563eb', '#6366f1', '#8b5cf6', '#3b82f6'][Math.floor(Math.random() * 4)],
      opacity: Math.random() * 0.6 + 0.2,
      pulseOffset: Math.random() * Math.PI * 2,
    }))

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.01
      const particles = particlesRef.current
      const mouse = mouseRef.current

      particles.forEach((p, i) => {
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) {
          const force = (120 - dist) / 120
          p.vx += (dx / dist) * force * 0.3
          p.vy += (dy / dist) * force * 0.3
        }
        p.vx *= 0.98
        p.vy *= 0.98
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        const pulse = Math.sin(t * 30 * 0.015 + p.pulseOffset) * 0.3 + 0.7
        const alpha = p.opacity * pulse

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, '0')
        ctx.fill()

        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4)
        glow.addColorStop(0, p.color + '28')
        glow.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx2 = p.x - p2.x
          const dy2 = p.y - p2.y
          const d = Math.sqrt(dx2 * dx2 + dy2 * dy2)
          if (d < 110) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(99,102,241,${(1 - d / 110) * 0.12})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      })

      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        const sy = canvas.height * (0.2 + i * 0.3)
        ctx.moveTo(0, sy)
        for (let x = 0; x <= canvas.width; x += 4) {
          const y = sy + Math.sin(x * 0.005 + t * (0.5 + i * 0.2)) * 35 + Math.cos(x * 0.008 + t * 0.3) * 18
          ctx.lineTo(x, y)
        }
        const lg = ctx.createLinearGradient(0, 0, canvas.width, 0)
        lg.addColorStop(0, 'transparent')
        lg.addColorStop(0.3, `rgba(${i === 0 ? '37,99,235' : i === 1 ? '99,102,241' : '139,92,246'},0.07)`)
        lg.addColorStop(0.7, `rgba(${i === 0 ? '37,99,235' : i === 1 ? '99,102,241' : '139,92,246'},0.07)`)
        lg.addColorStop(1, 'transparent')
        ctx.strokeStyle = lg
        ctx.lineWidth = 1
        ctx.stroke()
      }

      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes marqueeReverse { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        @keyframes neonPulse { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
        @keyframes floatY { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-14px); } }
        @keyframes rotateRing { from { transform:translate(-50%,-50%) rotate(0deg); } to { transform:translate(-50%,-50%) rotate(360deg); } }
        @keyframes rotateRingRev { from { transform:translate(-50%,-50%) rotate(0deg); } to { transform:translate(-50%,-50%) rotate(-360deg); } }
        @keyframes glowPulse { 0%,100% { box-shadow:0 0 30px rgba(99,102,241,0.15); } 50% { box-shadow:0 0 60px rgba(99,102,241,0.35); } }
        .scroll-reveal { opacity:0; transform:translateY(48px); transition:opacity 0.8s cubic-bezier(0.16,1,0.3,1),transform 0.8s cubic-bezier(0.16,1,0.3,1); }
        .scroll-reveal.revealed { opacity:1; transform:translateY(0); }
        .feature-card { transition:all 0.4s cubic-bezier(0.16,1,0.3,1); border:1px solid rgba(99,102,241,0.2); }
        .feature-card:hover { transform:translateY(-8px) scale(1.01); border-color:rgba(99,102,241,0.6) !important; box-shadow:0 0 40px rgba(99,102,241,0.15),0 20px 40px rgba(0,0,0,0.12) !important; }
        .step-row { transition:all 0.3s ease; border-radius:20px; }
        .step-row:hover { background:rgba(99,102,241,0.04) !important; }
        .step-row:hover .step-ico { box-shadow:0 0 24px rgba(99,102,241,0.4) !important; border-color:rgba(99,102,241,0.5) !important; }
      `}</style>

      {/* Cursor glow */}
      <div style={{
        position: 'fixed', left: mousePos.x, top: mousePos.y,
        width: '380px', height: '380px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.07), transparent 70%)',
        transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 9998,
        transition: 'left 0.08s ease, top 0.08s ease',
      }} />

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />

        {/* Orbit rings */}
        {[
          { size: 560, dur: '28s', dir: 'rotateRing', dots: [{ pos: 'top:-3px;left:50%;transform:translateX(-50%)', color: '#6366f1', s: 6 }] },
          { size: 760, dur: '42s', dir: 'rotateRingRev', dots: [{ pos: 'bottom:-3px;right:22%', color: '#2563eb', s: 4 }, { pos: 'top:18%;left:-3px', color: '#8b5cf6', s: 5 }] },
          { size: 960, dur: '58s', dir: 'rotateRing', dots: [{ pos: 'top:-3px;right:28%', color: '#3b82f6', s: 3 }] },
        ].map((ring, ri) => (
          <div key={ri} style={{
            position: 'absolute', width: ring.size, height: ring.size,
            top: '50%', left: '50%',
            borderRadius: '50%',
            border: `1px solid rgba(99,102,241,${0.12 - ri * 0.03})`,
            animation: `${ring.dir} ${ring.dur} linear infinite`,
            pointerEvents: 'none',
          }}>
            {ring.dots.map((dot, di) => (
              <div key={di} style={{
                position: 'absolute',
                width: dot.s, height: dot.s,
                borderRadius: '50%',
                background: dot.color,
                boxShadow: `0 0 ${dot.s * 2}px ${dot.color}`,
                ...Object.fromEntries(dot.pos.split(';').map(s => { const [k, v] = s.split(':'); return [k.trim(), v?.trim()] }).filter(([k]) => k)),
              }} />
            ))}
          </div>
        ))}

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: '980px', margin: '0 auto' }}>
          <div className="animate-fade-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '8px 20px', borderRadius: '50px',
            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.22)',
            marginBottom: '40px', backdropFilter: 'blur(12px)',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 12px #6366f1', animation: 'neonPulse 2s infinite' }} />
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: '#818cf8', letterSpacing: '0.02em' }}>
              Blockchain-Powered · Privacy-First · Built for India
            </span>
          </div>

          <h1 className="animate-fade-up-delay-1" style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(3rem, 7.5vw, 6rem)',
            lineHeight: 1.05, marginBottom: '28px', letterSpacing: '-0.04em',
            color: 'var(--text-primary)',
          }}>
            Government
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #6366f1 50%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 28px rgba(99,102,241,0.45))',
            }}>Benefits,</span>
            <br />
            Finally Yours.
          </h1>

          <p className="animate-fade-up-delay-2" style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--text-secondary)',
            maxWidth: '540px', margin: '0 auto 52px', lineHeight: 1.8,
          }}>
            Discover welfare schemes, apply with one click, and track every rupee on a public blockchain — built for every Indian citizen.
          </p>

          <div className="animate-fade-up-delay-3" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <Link to="/dashboard">
                <button style={{
                  padding: '18px 48px', fontSize: '1.05rem',
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  background: 'linear-gradient(135deg, #2563eb, #6366f1, #8b5cf6)',
                  color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer',
                  boxShadow: '0 0 28px rgba(99,102,241,0.45)', transition: 'all 0.3s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 0 50px rgba(99,102,241,0.65)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 28px rgba(99,102,241,0.45)' }}
                >
                  Go to Dashboard →
                </button>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <button style={{
                    padding: '18px 48px', fontSize: '1.05rem',
                    fontFamily: 'var(--font-display)', fontWeight: 700,
                    background: 'linear-gradient(135deg, #2563eb, #6366f1, #8b5cf6)',
                    color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer',
                    boxShadow: '0 0 28px rgba(99,102,241,0.45)', transition: 'all 0.3s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 0 50px rgba(99,102,241,0.65)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 28px rgba(99,102,241,0.45)' }}
                  >
                    Get Started Free →
                  </button>
                </Link>
                <Link to="/login">
                  <button style={{
                    padding: '18px 40px', fontSize: '1.05rem',
                    fontFamily: 'var(--font-display)', fontWeight: 600,
                    background: 'rgba(99,102,241,0.07)', color: 'var(--text-primary)',
                    border: '1px solid rgba(99,102,241,0.3)', borderRadius: '16px',
                    cursor: 'pointer', backdropFilter: 'blur(12px)', transition: 'all 0.3s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.7)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(99,102,241,0.2)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    Sign In
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Floating pills */}
          <div className="animate-fade-up-delay-4" style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '68px', flexWrap: 'wrap' }}>
            {[
              { label: '400+ Schemes', icon: '🏛️', delay: '0s' },
              { label: 'On-Chain Proof', icon: '⛓️', delay: '0.4s' },
              { label: 'Zero Duplicates', icon: '🔒', delay: '0.8s' },
              { label: 'Live Tracking', icon: '📊', delay: '1.2s' },
            ].map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '50px',
                background: 'rgba(99,102,241,0.06)',
                border: '1px solid rgba(99,102,241,0.18)',
                backdropFilter: 'blur(8px)',
                animation: `floatY 4s ease-in-out ${p.delay} infinite`,
              }}>
                <span style={{ fontSize: '14px' }}>{p.icon}</span>
                <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-secondary)' }}>{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEES ── */}
      <section style={{ padding: '36px 0', borderTop: '1px solid rgba(99,102,241,0.1)', borderBottom: '1px solid rgba(99,102,241,0.1)', background: 'rgba(99,102,241,0.02)', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '120px', background: 'linear-gradient(90deg,var(--bg-primary),transparent)', zIndex: 2, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '120px', background: 'linear-gradient(-90deg,var(--bg-primary),transparent)', zIndex: 2, pointerEvents: 'none' }} />
        <div style={{ display: 'flex', width: 'max-content', animation: 'marquee 22s linear infinite' }}>
          {[...SCHEMES_MARQUEE, ...SCHEMES_MARQUEE].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 28px', whiteSpace: 'nowrap' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: ['#2563eb','#6366f1','#8b5cf6','#3b82f6'][i%4], boxShadow: `0 0 8px ${['#2563eb','#6366f1','#8b5cf6','#3b82f6'][i%4]}`, animation: 'neonPulse 2s infinite', animationDelay: `${i*0.12}s` }} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '20px 0', borderBottom: '1px solid rgba(99,102,241,0.06)', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '120px', background: 'linear-gradient(90deg,var(--bg-primary),transparent)', zIndex: 2, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '120px', background: 'linear-gradient(-90deg,var(--bg-primary),transparent)', zIndex: 2, pointerEvents: 'none' }} />
        <div style={{ display: 'flex', width: 'max-content', animation: 'marqueeReverse 32s linear infinite' }}>
          {[...SCHEMES_MARQUEE.slice().reverse(), ...SCHEMES_MARQUEE.slice().reverse()].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 32px', whiteSpace: 'nowrap' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.78rem', color: 'var(--text-muted)', opacity: 0.65 }}>{s}</span>
              <span style={{ color: 'rgba(99,102,241,0.25)', fontSize: '10px' }}>◆</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '140px 24px 100px' }}>
        <div className="scroll-reveal" style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '50px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '20px' }}>
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#818cf8', letterSpacing: '0.08em' }}>WHY SCHEMELEDGER</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem,4vw,3.2rem)', color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.025em' }}>
            Built different.{' '}
            <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Built right.</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.75 }}>
            Every feature solves a real problem in India's welfare distribution system.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="scroll-reveal feature-card" style={{
              padding: '36px 32px', borderRadius: '24px', background: 'var(--bg-card)',
              position: 'relative', overflow: 'hidden', cursor: 'default',
              transitionDelay: `${i * 0.1}s`,
            }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '140px', height: '140px', background: `radial-gradient(circle at top right,${f.color}15,transparent 70%)`, pointerEvents: 'none' }} />
              <div style={{ width: 56, height: 56, borderRadius: '18px', background: `${f.color}12`, border: `1px solid ${f.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', marginBottom: '24px', boxShadow: `0 0 20px ${f.color}12` }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '12px' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.75 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: 'rgba(99,102,241,0.02)', borderTop: '1px solid rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.08)', padding: '140px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-200px', top: '50%', width: '500px', height: '500px', borderRadius: '50%', border: '1px solid rgba(99,102,241,0.06)', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: '-80px', top: '50%', width: '280px', height: '280px', borderRadius: '50%', border: '1px solid rgba(99,102,241,0.1)', transform: 'translateY(-50%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div className="scroll-reveal" style={{ textAlign: 'center', marginBottom: '80px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '50px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#818cf8', letterSpacing: '0.08em' }}>HOW IT WORKS</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem,4vw,3.2rem)', color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
              Four steps to your benefits
            </h2>
          </div>

          {[
            { step: '01', title: 'Create Your Account', desc: 'Sign up with Google or email in under 30 seconds. Your identity is secured with Firebase Auth.', icon: '👤', color: '#2563eb' },
            { step: '02', title: 'Browse & Discover', desc: 'Explore 400+ government schemes filtered by category, state, and eligibility. Find what you deserve.', icon: '🔍', color: '#6366f1' },
            { step: '03', title: 'Apply On-Chain', desc: "Enter your Aadhaar — it's hashed client-side. Only a cryptographic nullifier proof goes to the blockchain.", icon: '⛓️', color: '#8b5cf6' },
            { step: '04', title: 'Track Every Step', desc: 'Monitor your application in real-time. Every status change is a permanent, tamper-proof blockchain event.', icon: '✅', color: '#3b82f6' },
          ].map((item, i) => (
            <div key={i} className="scroll-reveal step-row" style={{
              display: 'flex', gap: '28px', alignItems: 'flex-start',
              padding: '36px 24px',
              borderBottom: i < 3 ? '1px solid rgba(99,102,241,0.08)' : 'none',
              transitionDelay: `${i * 0.12}s`,
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.5rem', lineHeight: 1, background: `linear-gradient(135deg,${item.color}55,transparent)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', minWidth: '64px', flexShrink: 0 }}>
                {item.step}
              </div>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div className="step-ico" style={{ width: 52, height: 52, borderRadius: '16px', background: `${item.color}10`, border: `1px solid ${item.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0, transition: 'all 0.3s' }}>
                  {item.icon}
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '140px 24px' }}>
        <div className="scroll-reveal" style={{
          borderRadius: '32px', padding: '100px 48px', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, #0f0c29, #1a1340, #0d1b3e)',
          border: '1px solid rgba(99,102,241,0.22)',
          animation: 'glowPulse 4s ease-in-out infinite',
        }}>
          {/* Mini particles */}
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: `${Math.random() * 3 + 1}px`, height: `${Math.random() * 3 + 1}px`,
              borderRadius: '50%',
              left: `${5 + Math.random() * 90}%`, top: `${5 + Math.random() * 90}%`,
              background: ['#2563eb','#6366f1','#8b5cf6'][i%3],
              boxShadow: `0 0 8px ${['#2563eb','#6366f1','#8b5cf6'][i%3]}`,
              animation: `floatY ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite`,
              pointerEvents: 'none',
            }} />
          ))}

          {/* Orbit rings inside CTA */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '500px', height: '500px', borderRadius: '50%', border: '1px solid rgba(99,102,241,0.08)', animation: 'rotateRing 25s linear infinite', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '320px', height: '320px', borderRadius: '50%', border: '1px solid rgba(99,102,241,0.06)', animation: 'rotateRingRev 18s linear infinite', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '7px 18px', borderRadius: '50px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.32)', marginBottom: '28px' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#818cf8', boxShadow: '0 0 12px #818cf8', animation: 'neonPulse 2s infinite' }} />
              <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: '#a5b4fc' }}>Join thousands of citizens</span>
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem,5vw,3.5rem)', color: 'white', marginBottom: '20px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Start claiming<br />
              <span style={{ background: 'linear-gradient(135deg,#818cf8,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                what's yours today
              </span>
            </h2>

            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem', marginBottom: '48px', lineHeight: 1.8, maxWidth: '480px', margin: '0 auto 48px' }}>
              Millions of eligible citizens miss out on benefits every year. Don't be one of them.
            </p>

            <Link to="/signup">
              <button style={{
                padding: '18px 60px', fontSize: '1.1rem',
                fontFamily: 'var(--font-display)', fontWeight: 700,
                background: 'linear-gradient(135deg,#818cf8,#6366f1)',
                color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer',
                boxShadow: '0 0 40px rgba(99,102,241,0.5),0 12px 32px rgba(0,0,0,0.4)',
                transition: 'all 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 0 64px rgba(99,102,241,0.7),0 16px 40px rgba(0,0,0,0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(99,102,241,0.5),0 12px 32px rgba(0,0,0,0.4)' }}
              >
                Create Free Account →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(99,102,241,0.1)', padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-display)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#2563eb,#6366f1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', boxShadow: '0 0 12px rgba(99,102,241,0.4)' }}>🏛️</div>
          <span style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>SchemeLedger</span>
        </div>
        <p>© 2024 SchemeLedger · Built for every Indian citizen · Powered by Blockchain</p>
      </footer>
    </div>
  )
}