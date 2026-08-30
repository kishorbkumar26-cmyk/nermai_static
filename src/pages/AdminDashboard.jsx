import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminPanelContent } from '../components/AdminPortal'
import CourseContentSection from '../components/admin/CourseContentSection'
import ResultsGallerySection from '../components/admin/ResultsGallerySection'
import { fbFirestore } from '../firebase/firestore'

/* ─── Toast ─────────────────────────────────────────────────────────────── */
function useToast() {
  const [toasts, setToasts] = useState([])
  const add = (msg, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }
  return { toasts, success: m => add(m, 'success'), error: m => add(m, 'error'), info: m => add(m, 'info') }
}

/* ─── All Sections ───────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: 'homecontent',  label: 'Home Content',   icon: 'fa-solid fa-house',                group: 'Content' },
  { id: 'courses',      label: 'Course Pages',   icon: 'fa-solid fa-graduation-cap',        group: 'Content' },
  { id: 'results',      label: 'Results Gallery',icon: 'fa-solid fa-images',                group: 'Content' },
  { id: 'hero',         label: 'Hero Slides',    icon: 'fa-solid fa-film',                  group: 'Media' },
  { id: 'gallery',      label: 'Gallery',        icon: 'fa-solid fa-camera',                group: 'Media' },
  { id: 'notices',      label: 'Notices',        icon: 'fa-solid fa-bell',                  group: 'Updates' },
  { id: 'toppers',      label: 'Toppers',        icon: 'fa-solid fa-trophy',                group: 'Updates' },
  { id: 'testimonials', label: 'Reviews',        icon: 'fa-solid fa-quote-right',           group: 'Updates' },
  { id: 'siteinfo',     label: 'Site Info',      icon: 'fa-solid fa-circle-info',           group: 'Settings' },
  { id: 'drive',        label: 'Drive Config',   icon: 'fa-brands fa-google-drive',         group: 'Settings' },
  { id: 'settings',     label: 'Passcode',       icon: 'fa-solid fa-lock',                  group: 'Settings' },
]

const GROUPS = ['Content', 'Media', 'Updates', 'Settings']

/* ─── Settings Section ───────────────────────────────────────────────────── */
function SettingsSection({ toast }) {
  const [newPass, setNewPass] = useState('')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const handleSave = async () => {
    if (!newPass.trim() || newPass.length < 6) {
      toast.error('Passcode must be at least 6 characters.')
      return
    }
    setSaving(true)
    try {
      await fbFirestore.updateSettings({ passcode: newPass.trim() })
      toast.success('Passcode updated! Use it next time you log in.')
      setNewPass('')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 className="ap-section-title"><i className="fa-solid fa-lock" /> Admin Passcode</h2>
      <div className="ap-card" style={{ marginBottom: '1rem' }}>
        <div style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem' }}>Change Admin Passcode</div>
        <div className="ap-form-group">
          <label>New Passcode (minimum 6 characters)</label>
          <input
            type="password"
            className="ap-input"
            placeholder="Enter new passcode..."
            value={newPass}
            onChange={e => setNewPass(e.target.value)}
            style={{ letterSpacing: '0.2em', fontFamily: 'var(--font-mono)' }}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
        </div>
        <button className="ap-btn ap-btn-primary" onClick={handleSave} disabled={saving}>
          {saving
            ? <><i className="fa-solid fa-spinner fa-spin" /> Saving...</>
            : <><i className="fa-solid fa-key" /> Update Passcode</>
          }
        </button>
      </div>
      <div className="ap-card">
        <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Session Info</div>
        <div className="dash-info-row">
          <span className="dash-info-label">Login URL</span>
          <code className="dash-info-value">/admin</code>
        </div>
        <div className="dash-info-row">
          <span className="dash-info-label">Session</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#16a34a' }}>✓ Active (browser session)</span>
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.78rem', color: 'var(--gray-400)', lineHeight: 1.6 }}>
          Admin session expires when you close the browser or click Logout. Keep the passcode safe — it is not displayed anywhere on the public site.
        </p>
      </div>
    </div>
  )
}

/* ─── Sidebar ────────────────────────────────────────────────────────────── */
function Sidebar({ active, onSelect, onLogout }) {
  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar-logo">
        <div className="dash-sidebar-badge">ந</div>
        <div>
          <div className="dash-sidebar-name">NERMAI IAS</div>
          <div className="dash-sidebar-sub">Master Admin Dashboard</div>
        </div>
      </div>

      <nav className="dash-sidebar-nav">
        {GROUPS.map(group => (
          <div key={group}>
            <div style={{ padding: '0.6rem 1rem 0.2rem', fontSize: '0.62rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              {group}
            </div>
            {SECTIONS.filter(s => s.group === group).map(s => (
              <button
                key={s.id}
                className={`dash-nav-item${active === s.id ? ' active' : ''}`}
                onClick={() => onSelect(s.id)}
              >
                <i className={s.icon} style={{ width: 16, textAlign: 'center' }} />
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="dash-sidebar-footer">
        <a href="/" className="dash-footer-link" target="_blank" rel="noopener noreferrer">
          <i className="fa-solid fa-arrow-up-right-from-square" /> View Live Site
        </a>
        <button className="dash-footer-link dash-logout-btn" onClick={onLogout}>
          <i className="fa-solid fa-right-from-bracket" /> Logout
        </button>
      </div>
    </aside>
  )
}

/* ─── Main AdminDashboard ───────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [active, setActive]           = useState('homecontent')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { toasts, success, error, info } = useToast()
  const toast = { success, error, info }
  const navigate = useNavigate()

  // Auth guard
  useEffect(() => {
    if (sessionStorage.getItem('nermai_admin') !== '1') {
      navigate('/admin')
    }
  }, [navigate])

  const handleLogout = () => {
    sessionStorage.removeItem('nermai_admin')
    navigate('/admin')
  }

  const currentSection = SECTIONS.find(s => s.id === active)

  return (
    <div className="dash-layout">
      {/* Mobile bar */}
      <div className="dash-mobile-bar">
        <button className="dash-icon-btn" onClick={() => setSidebarOpen(o => !o)}>
          <i className="fa-solid fa-bars" />
        </button>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.8)' }}>
          NERMAI MASTER ADMIN
        </span>
        <button className="dash-icon-btn" onClick={handleLogout} title="Logout">
          <i className="fa-solid fa-right-from-bracket" />
        </button>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="dash-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`dash-sidebar-wrap${sidebarOpen ? ' open' : ''}`}>
        <Sidebar
          active={active}
          onSelect={id => { setActive(id); setSidebarOpen(false) }}
          onLogout={handleLogout}
        />
      </div>

      {/* Main */}
      <main className="dash-main">
        {/* Top bar */}
        <div className="dash-topbar">
          <div className="dash-breadcrumb">
            <i className="fa-solid fa-house" style={{ color: 'var(--gray-400)' }} />
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.65rem', color: 'var(--gray-300)' }} />
            <span>{currentSection?.group}</span>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.65rem', color: 'var(--gray-300)' }} />
            <span>{currentSection?.label || 'Dashboard'}</span>
          </div>
          <a href="/" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '0.75rem', color: 'var(--maroon)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <i className="fa-solid fa-arrow-up-right-from-square" /> View Site
          </a>
        </div>

        {/* Content */}
        <div className="dash-content">
          {/* Custom sections */}
          {active === 'courses'  && <CourseContentSection toast={toast} />}
          {active === 'results'  && <ResultsGallerySection toast={toast} />}
          {active === 'settings' && <SettingsSection toast={toast} />}

          {/* Reused from AdminPortal (via named export) */}
          {!['courses', 'results', 'settings'].includes(active) && (
            <AdminPanelContent activeSection={active} toast={toast} />
          )}
        </div>
      </main>

      {/* Toasts */}
      <div className="toast-container" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <i className={`fa-solid ${t.type === 'success' ? 'fa-circle-check' : t.type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info'}`} />
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  )
}
