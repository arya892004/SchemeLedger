import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { sendChatMessage, getAIRecommendations } from '../services/rag'

const QUICK_QUESTIONS = [
  'What schemes are available for farmers?',
  'How to apply for PM-KISAN?',
  'Scholarships for SC/ST students?',
  'Housing schemes for poor families?',
  'Business loans without collateral?',
  'Health insurance for poor families?',
]

export default function AIAssistant() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: `Namaste! 🙏 I'm SchemeSaathi, your AI welfare assistant.\n\nI can help you:\n• Find government schemes you qualify for\n• Explain eligibility criteria and required documents\n• Answer any question about welfare schemes\n• Guide you through the application process\n\nHow can I help you today?`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState(null)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: user?.displayName || '',
    age: '',
    occupation: '',
    income: '',
    gender: '',
    state: '',
  })
  const [recommendations, setRecommendations] = useState(null)
  const [loadingRecs, setLoadingRecs] = useState(false)
  const [activeTab, setActiveTab] = useState('recommendations')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text) => {
    const userMessage = (text || input).trim()
    if (!userMessage || loading) return
    setInput('')

    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const history = messages.slice(1).map(m => ({ role: m.role, content: m.content }))
      const result = await sendChatMessage(userMessage, history, profile || {})
      setMessages(prev => [...prev, {
        role: 'model',
        content: result.response,
        sources: result.retrievedSchemes,
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'model',
        content: `Sorry, I encountered an error: ${err.message}. Please try again.`,
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSubmit = async () => {
    if (!profileForm.name && !profileForm.occupation) return
    setProfile(profileForm)
    setShowProfileForm(false)
    setActiveTab('recommendations')
    setMessages(prev => [...prev, {
      role: 'model',
      content: `Thanks ${profileForm.name || 'there'}! I've saved your profile. Generating personalized recommendations now...`,
    }])
    setLoadingRecs(true)
    try {
      const result = await getAIRecommendations(profileForm)
      setRecommendations(result)
    } catch (err) {
      console.error('Recommendations error:', err)
    } finally {
      setLoadingRecs(false)
    }
  }

  const handleGetRecommendations = async () => {
    if (!profile) return setShowProfileForm(true)
    setLoadingRecs(true)
    try {
      const result = await getAIRecommendations(profile)
      setRecommendations(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingRecs(false)
    }
  }

  const priorityColor = (p) => ({
    high: { bg: '#ecfdf5', color: '#059669' },
    medium: { bg: '#eff6ff', color: '#2563eb' },
    low: { bg: '#f5f3ff', color: '#7c3aed' },
  }[p] || { bg: '#eff6ff', color: '#2563eb' })

  return (
    <div className="mesh-bg" style={{ minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div className="animate-fade-up" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            }}>🤖</div>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: '1.6rem', color: 'var(--text-primary)',
              }}>
                AI Scheme Assistant
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#059669', boxShadow: '0 0 6px #059669',
                }} />
                <span style={{
                  fontSize: '0.78rem', color: 'var(--text-muted)',
                  fontFamily: 'var(--font-display)',
                }}>
                  AI-Powered · RAG enabled · Smart scheme discovery
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>

          {/* ── Chat Column ── */}
          <div className="card" style={{
            padding: 0, overflow: 'hidden',
            display: 'flex', flexDirection: 'column', height: '75vh',
          }}>

            {/* Chat header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--bg-secondary)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: '#059669', boxShadow: '0 0 8px #059669',
                }} />
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 600,
                  fontSize: '0.9rem', color: 'var(--text-primary)',
                }}>
                  SchemeSaathi Chat
                </span>
              </div>
              <button
                onClick={() => setMessages([messages[0]])}
                style={{
                  fontSize: '0.75rem', color: 'var(--text-muted)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-display)',
                }}
              >
                Clear chat
              </button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '20px',
              display: 'flex', flexDirection: 'column', gap: '16px',
            }}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: '10px', alignItems: 'flex-end',
                }}>
                  {msg.role === 'model' && (
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #2563eb, #6366f1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px',
                    }}>🤖</div>
                  )}

                  <div style={{ maxWidth: '78%' }}>
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: msg.role === 'user'
                        ? '18px 18px 4px 18px'
                        : '18px 18px 18px 4px',
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, #2563eb, #6366f1)'
                        : 'var(--bg-secondary)',
                      color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                      fontSize: '0.88rem', lineHeight: 1.7,
                      border: msg.role === 'model' ? '1px solid var(--border)' : 'none',
                      boxShadow: msg.role === 'user'
                        ? '0 4px 12px rgba(37,99,235,0.25)'
                        : 'none',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}>
                      {msg.content}
                    </div>

                    {msg.sources && msg.sources.length > 0 && (
                      <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '0.68rem', color: 'var(--text-muted)',
                          fontFamily: 'var(--font-display)',
                        }}>
                          Sources:
                        </span>
                        {msg.sources.map(s => (
                          <span key={s.id} style={{
                            padding: '2px 8px', borderRadius: '10px', fontSize: '0.68rem',
                            background: 'var(--accent-subtle)', color: 'var(--accent)',
                            fontFamily: 'var(--font-display)', fontWeight: 600,
                          }}>
                            {s.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700, color: 'white',
                      fontFamily: 'var(--font-display)',
                    }}>
                      {user?.displayName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #6366f1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px',
                  }}>🤖</div>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '18px 18px 18px 4px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    display: 'flex', gap: '5px', alignItems: 'center',
                  }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: 'var(--accent)',
                        animation: `typingDot 1.2s ease infinite ${i * 0.2}s`,
                      }} />
                    ))}
                    <style>{`
                      @keyframes typingDot {
                        0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                        30% { transform: translateY(-6px); opacity: 1; }
                      }
                    `}</style>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick questions */}
            {messages.length <= 1 && (
              <div style={{
                padding: '0 20px 12px',
                display: 'flex', gap: '8px', flexWrap: 'wrap',
              }}>
                {QUICK_QUESTIONS.slice(0, 4).map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    style={{
                      padding: '6px 12px', borderRadius: '16px', fontSize: '0.75rem',
                      border: '1px solid var(--border)', background: 'var(--bg-secondary)',
                      color: 'var(--text-secondary)', cursor: 'pointer',
                      fontFamily: 'var(--font-display)', fontWeight: 500,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--accent)'
                      e.currentTarget.style.color = 'var(--accent)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid var(--border)',
              display: 'flex', gap: '10px',
              background: 'var(--bg-card)',
            }}>
              <input
                className="input-field"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask about any government scheme..."
                disabled={loading}
                style={{ flex: 1, fontSize: '0.9rem' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="btn-primary"
                style={{
                  padding: '12px 20px', flexShrink: 0,
                  opacity: loading || !input.trim() ? 0.6 : 1,
                }}
              >
                Send →
              </button>
            </div>
          </div>

          {/* ── Right Sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Tabs */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-secondary)',
              borderRadius: '12px', padding: '4px',
              border: '1px solid var(--border)',
            }}>
              {['recommendations', 'profile'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '9px', border: 'none',
                    background: activeTab === tab ? 'var(--bg-card)' : 'transparent',
                    color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-display)', fontWeight: 600,
                    fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  {tab === 'recommendations' ? '✨ AI Picks' : '👤 Profile'}
                </button>
              ))}
            </div>

            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '16px',
                }}>
                  Your Profile
                </h3>

                {profile && !showProfileForm ? (
                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      {Object.entries(profile).filter(([_, v]) => v).map(([k, v]) => (
                        <div key={k} style={{
                          display: 'flex', justifyContent: 'space-between',
                          padding: '8px 12px', borderRadius: '8px',
                          background: 'var(--bg-secondary)',
                        }}>
                          <span style={{
                            fontSize: '0.78rem', color: 'var(--text-muted)',
                            fontFamily: 'var(--font-display)', textTransform: 'capitalize',
                          }}>
                            {k}
                          </span>
                          <span style={{
                            fontSize: '0.78rem', color: 'var(--text-primary)',
                            fontWeight: 600, fontFamily: 'var(--font-display)',
                          }}>
                            {k === 'income' ? `₹${parseInt(v).toLocaleString('en-IN')}` : v}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowProfileForm(true)}
                      className="btn-ghost"
                      style={{ width: '100%', padding: '9px', fontSize: '0.82rem' }}
                    >
                      Edit Profile
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { key: 'name', label: 'Full Name', placeholder: 'Your name', type: 'text' },
                      { key: 'age', label: 'Age', placeholder: 'e.g. 35', type: 'number' },
                      { key: 'occupation', label: 'Occupation', placeholder: 'Farmer, Student, etc.', type: 'text' },
                      { key: 'income', label: 'Annual Income (₹)', placeholder: 'e.g. 150000', type: 'number' },
                      { key: 'gender', label: 'Gender', placeholder: 'Male / Female', type: 'text' },
                      { key: 'state', label: 'State', placeholder: 'e.g. Bihar, UP, MP', type: 'text' },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{
                          display: 'block', fontSize: '0.72rem', fontWeight: 600,
                          fontFamily: 'var(--font-display)', color: 'var(--text-muted)',
                          marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em',
                        }}>
                          {f.label}
                        </label>
                        <input
                          className="input-field"
                          type={f.type}
                          placeholder={f.placeholder}
                          value={profileForm[f.key]}
                          onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))}
                          style={{ padding: '9px 12px', fontSize: '0.85rem' }}
                        />
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button
                        onClick={handleProfileSubmit}
                        className="btn-primary"
                        style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                      >
                        Save & Analyze ✨
                      </button>
                      {profile && (
                        <button
                          onClick={() => setShowProfileForm(false)}
                          className="btn-ghost"
                          style={{ padding: '10px 14px', fontSize: '0.85rem' }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Recommendations Tab ── */}
            {activeTab === 'recommendations' && (
              <div className="card" style={{ padding: '20px' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: '16px',
                }}>
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700,
                    fontSize: '0.95rem', color: 'var(--text-primary)',
                  }}>
                    ✨ AI Recommendations
                  </h3>
                  {recommendations && (
                    <button
                      onClick={handleGetRecommendations}
                      style={{
                        fontSize: '0.72rem', color: 'var(--accent)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--font-display)', fontWeight: 600,
                      }}
                    >
                      Refresh
                    </button>
                  )}
                </div>

                {loadingRecs ? (
                  <div style={{ textAlign: 'center', padding: '32px 20px' }}>
                    <div style={{
                      width: '32px', height: '32px',
                      border: '3px solid var(--border)',
                      borderTopColor: 'var(--accent)',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                      margin: '0 auto 12px',
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p style={{
                      fontSize: '0.82rem', color: 'var(--text-muted)',
                      fontFamily: 'var(--font-display)',
                    }}>
                      Analyzing your profile...
                    </p>
                  </div>
                ) : recommendations ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {recommendations.summary && (
                      <div style={{
                        padding: '10px 14px', borderRadius: '10px',
                        background: 'var(--accent-subtle)',
                        border: '1px solid var(--border-strong)',
                      }}>
                        <p style={{
                          fontSize: '0.8rem', color: 'var(--accent)',
                          fontFamily: 'var(--font-display)', fontWeight: 500, lineHeight: 1.5,
                        }}>
                          {recommendations.summary}
                        </p>
                      </div>
                    )}

                    {recommendations.recommendations?.map((rec, i) => {
                      const pc = priorityColor(rec.priority)
                      return (
                        <div key={i} style={{
                          padding: '14px', borderRadius: '12px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border)',
                          transition: 'all 0.2s',
                        }}>
                          <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'flex-start', marginBottom: '8px', gap: '8px',
                          }}>
                            <h4 style={{
                              fontFamily: 'var(--font-display)', fontWeight: 700,
                              fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.3,
                            }}>
                              {rec.schemeName}
                            </h4>
                            <span style={{
                              padding: '3px 8px', borderRadius: '10px',
                              fontSize: '0.65rem', fontFamily: 'var(--font-display)',
                              fontWeight: 700, flexShrink: 0,
                              background: pc.bg, color: pc.color,
                              textTransform: 'uppercase',
                            }}>
                              {rec.priority}
                            </span>
                          </div>

                          <p style={{
                            fontSize: '0.75rem', color: 'var(--text-secondary)',
                            lineHeight: 1.55, marginBottom: '8px',
                          }}>
                            {rec.whyEligible}
                          </p>

                          <span style={{
                            fontSize: '0.75rem', fontWeight: 700,
                            color: 'var(--accent)', fontFamily: 'var(--font-display)',
                          }}>
                            💰 {rec.benefit}
                          </span>

                          {rec.nextStep && (
                            <p style={{
                              fontSize: '0.72rem', color: 'var(--text-muted)',
                              marginTop: '6px', fontFamily: 'var(--font-display)',
                              fontStyle: 'italic',
                            }}>
                              → {rec.nextStep}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎯</div>
                    <p style={{
                      fontSize: '0.85rem', color: 'var(--text-muted)',
                      marginBottom: '16px', lineHeight: 1.6,
                      fontFamily: 'var(--font-display)',
                    }}>
                      {profile
                        ? 'Click below to get AI-powered scheme recommendations'
                        : 'Fill your profile first to get personalized recommendations'}
                    </p>
                    <button
                      onClick={profile ? handleGetRecommendations : () => setActiveTab('profile')}
                      className="btn-primary"
                      style={{ width: '100%', padding: '11px', fontSize: '0.88rem' }}
                    >
                      {profile ? '✨ Get AI Recommendations' : '👤 Set Up Profile First'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quick Questions */}
            <div className="card" style={{ padding: '16px' }}>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '0.78rem', color: 'var(--text-muted)',
                marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                Quick Questions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {QUICK_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    style={{
                      padding: '8px 12px', borderRadius: '8px', fontSize: '0.78rem',
                      border: '1px solid var(--border)', background: 'var(--bg-secondary)',
                      color: 'var(--text-secondary)', cursor: 'pointer',
                      fontFamily: 'var(--font-display)', fontWeight: 500,
                      textAlign: 'left', transition: 'all 0.2s', lineHeight: 1.4,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--accent)'
                      e.currentTarget.style.color = 'var(--accent)'
                      e.currentTarget.style.background = 'var(--accent-subtle)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.color = 'var(--text-secondary)'
                      e.currentTarget.style.background = 'var(--bg-secondary)'
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}