import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fbFirestore } from '../firebase/firestore'

export default function AdminPage() {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Already authenticated — go straight to dashboard
  useEffect(() => {
    if (sessionStorage.getItem('nermai_admin') === '1') navigate('/admin/dashboard')
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!passcode.trim()) return
    setLoading(true); setError('')
    try {
      const ok = await fbFirestore.verifyPasscode(passcode)
      if (ok) {
        sessionStorage.setItem('nermai_admin', '1')
        navigate('/admin/dashboard')
      } else {
        setError('❌ Incorrect passcode. Please try again.')
      }
    } catch (err) {
      setError('Connection error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        {/* Logo */}
        <div className="admin-login-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', marginBottom: '2rem' }}>
          <img src="/nermai-logo.png" alt="Nermai IAS Academy Logo" style={{ height: '56px', width: 'auto' }} />
          <div className="admin-login-brand" style={{ textAlign: 'left' }}>
            <span className="admin-login-name" style={{ display: 'block', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.05em', lineHeight: 1.2 }}>NERMAI IAS ACADEMY</span>
            <span className="admin-login-sub" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gray-500)', letterSpacing: '0.05em' }}>ADMIN PORTAL · v2.0</span>
          </div>
        </div>

        <h1 className="admin-login-title">Admin Login</h1>
        <p className="admin-login-desc">
          Enter your admin passcode to access the content management dashboard.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="admin-login-label">ADMIN PASSCODE</label>
            <input
              type="password"
              className="admin-login-input"
              placeholder="Enter passcode..."
              value={passcode}
              onChange={e => { setPasscode(e.target.value); setError('') }}
              autoFocus
              autoComplete="current-password"
            />
          </div>

          {error && <div className="admin-login-error">{error}</div>}

          <button
            type="submit"
            className="admin-login-btn"
            disabled={loading || !passcode}
          >
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} /> Verifying...</>
              : <><i className="fa-solid fa-unlock-keyhole" style={{ marginRight: 8 }} /> ACCESS DASHBOARD</>
            }
          </button>
        </form>

        <div className="admin-login-hint">
          <i className="fa-solid fa-shield-halved" style={{ color: 'var(--saffron)' }} />
          &nbsp; Authorised access only
        </div>
      </div>
    </div>
  )
}
