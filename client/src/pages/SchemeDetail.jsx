import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { SCHEMES } from '../services/schemes'
import { useAuth } from '../context/AuthContext'
import { useWallet } from '../context/WalletContext'
import { saveApplication } from '../services/firestore'
import { submitApplicationOnChain } from '../services/blockchain'

export default function SchemeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { wallet, connect, connecting } = useWallet()
  const scheme = SCHEMES.find(s => s.id === id)

  const [aadhaar, setAadhaar] = useState('')
  const [status, setStatus] = useState('idle')
  const [txHash, setTxHash] = useState('')
  const [step, setStep] = useState('')
  const [error, setError] = useState('')

  if (!scheme) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '12px' }}>Scheme not found</h2>
        <button className="btn-primary" onClick={() => navigate('/schemes')}>Back to Schemes</button>
      </div>
    </div>
  )

  const handleApply = async () => {
    if (!user) return navigate('/login')
    if (!aadhaar || aadhaar.length !== 12) {
      return setError('Please enter a valid 12-digit Aadhaar number')
    }
    setError('')
    setStatus('loading')

    try {
      // Step 1: Connect wallet if not connected
      let activeSigner = wallet?.signer
      if (!activeSigner) {
        setStep('Connecting wallet...')
        const result = await connect()
        activeSigner = result.signer
      }

      // Step 2: Submit to blockchain
      setStep('Submitting to blockchain...')
      const result = await submitApplicationOnChain(scheme.id, aadhaar, activeSigner)
      setTxHash(result.txHash)

      // Step 3: Save to Firebase with tx hash
      setStep('Saving application...')
      await saveApplication(user.uid, {
        schemeId: scheme.id,
        schemeName: scheme.name,
        schemeCategory: scheme.category,
        amount: scheme.amount,
        txHash: result.txHash,
        blockNumber: result.blockNumber,
        appId: result.appId,
        chain: 'localhost-hardhat',
      })

      setStatus('success')
      setStep('')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Transaction failed. Please try again.')
      setStatus('error')
      setStep('')
    }
  }

  return (
    <div className="mesh-bg" style={{ minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontFamily: 'var(--font-display)',
            fontWeight: 600, fontSize: '0.875rem',
            display: 'flex', alignItems: 'center', gap: '6px',
            marginBottom: '24px', padding: '0',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          ← Back
        </button>

        <div className="card animate-fade-up" style={{ padding: '40px' }}>

          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{
                padding: '5px 12px', borderRadius: '20px',
                background: 'var(--accent-subtle)', border: '1px solid var(--border-strong)',
                fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-display)',
                color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {scheme.category}
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent)' }}>
                {scheme.amount}
              </span>
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: '2rem', color: 'var(--text-primary)',
              marginTop: '16px', marginBottom: '12px',
            }}>
              {scheme.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '1rem' }}>
              {scheme.description}
            </p>
          </div>

          {/* Eligibility + Documents */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '28px', marginBottom: '28px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
                  Eligibility Criteria
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {scheme.eligibility.map(e => (
                    <div key={e} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{e}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
                  Required Documents
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {scheme.documents.map(d => (
                    <div key={d} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px' }}>📄</span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Ministry + Deadline */}
          <div style={{
            padding: '16px 20px', borderRadius: '12px',
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '28px', flexWrap: 'wrap', gap: '8px',
          }}>
            <div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', marginBottom: '2px' }}>Ministry</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{scheme.ministry}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', marginBottom: '2px' }}>Deadline</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{scheme.deadline}</p>
            </div>
          </div>

          {/* Wallet status */}
          {wallet && (
            <div style={{
              padding: '12px 16px', borderRadius: '10px',
              background: 'var(--accent-subtle)', border: '1px solid var(--border-strong)',
              display: 'flex', alignItems: 'center', gap: '10px',
              marginBottom: '20px',
            }}>
              <span style={{ fontSize: '16px' }}>🔗</span>
              <div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>Wallet Connected</p>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font-display)', fontStyle: 'monospace' }}>
                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </p>
              </div>
            </div>
          )}

          {/* Apply section */}
          {status === 'success' ? (
            <div style={{
              padding: '28px', borderRadius: '14px',
              background: '#ecfdf5', border: '1px solid #6ee7b7', textAlign: 'center',
            }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎉</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#059669', marginBottom: '6px' }}>
                Application Submitted On-Chain!
              </h3>
              <p style={{ color: '#065f46', fontSize: '0.875rem', marginBottom: '16px' }}>
                Your application is permanently recorded on the blockchain.
              </p>
              <div style={{
                padding: '10px 14px', borderRadius: '8px',
                background: 'rgba(0,0,0,0.05)', marginBottom: '16px',
              }}>
                <p style={{ fontSize: '0.72rem', color: '#065f46', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>
                  Transaction Hash
                </p>
                <p style={{ fontSize: '0.78rem', color: '#059669', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {txHash}
                </p>
              </div>
              <button
                className="btn-primary"
                onClick={() => navigate('/applications')}
                style={{ padding: '10px 24px' }}
              >
                Track Application →
              </button>
            </div>
          ) : (
            <div>
              <label style={{
                display: 'block', fontSize: '0.82rem', fontWeight: 600,
                fontFamily: 'var(--font-display)', color: 'var(--text-secondary)', marginBottom: '6px',
              }}>
                Aadhaar Number
              </label>
              <input
                className="input-field"
                type="text"
                placeholder="Enter 12-digit Aadhaar number"
                value={aadhaar}
                onChange={e => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                style={{ marginBottom: '8px' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '20px', fontFamily: 'var(--font-display)' }}>
                🔒 Your Aadhaar is hashed client-side. Only a cryptographic proof is stored on blockchain — never your actual number.
              </p>

              {error && (
                <div style={{
                  padding: '10px 14px', borderRadius: '8px',
                  background: '#fef2f2', border: '1px solid #fecaca',
                  color: '#dc2626', fontSize: '0.82rem',
                  fontFamily: 'var(--font-display)', marginBottom: '16px',
                }}>
                  {error}
                </div>
              )}

              {step && (
                <div style={{
                  padding: '10px 14px', borderRadius: '8px',
                  background: 'var(--accent-subtle)', border: '1px solid var(--border-strong)',
                  color: 'var(--accent)', fontSize: '0.82rem',
                  fontFamily: 'var(--font-display)', marginBottom: '16px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                  {step}
                </div>
              )}

              <button
                className="btn-primary"
                onClick={handleApply}
                disabled={status === 'loading'}
                style={{ width: '100%', padding: '15px', fontSize: '1rem' }}
              >
                {status === 'loading' ? step || 'Processing...' : `⛓️ Apply via Blockchain →`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}