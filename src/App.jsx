import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { fbFirestore } from './firebase/firestore'
import { WHATSAPP_NUMBER } from './constants'
import Home from './pages/Home'
import WhyNermaiPage from './pages/WhyNermaiPage'
import CoursesPage from './pages/CoursesPage'
import CourseDetailPage from './pages/CourseDetailPage'
import ContactPage from './pages/ContactPage'
import AdminPage from './pages/AdminPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminPortal from './components/AdminPortal'
import FaqPage from './pages/FaqPage'
import LiveBackground from './components/LiveBackground'

function VisibilityGuard({ pageKey, children }) {
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s.pageVisibility && s.pageVisibility[pageKey] === false) {
        setVisible(false)
      }
      setLoading(false)
    })
  }, [pageKey])

  if (loading) return null
  if (!visible) return <Navigate to="/" replace />
  return children
}

function FloatingButtons() {
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}`
  return (
    <div className="floating-btns" style={{ zIndex: 9999 }}>
      {/* WhatsApp */}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
        style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, #25D366, #128C7E)',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem',
          textDecoration: 'none',
          border: '2px solid var(--gold, #D4AF37)',
          boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4), 0 0 15px rgba(212, 175, 55, 0.4)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.15) translateY(-3px)'
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(37, 211, 102, 0.6), 0 0 22px rgba(212, 175, 55, 0.6)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 211, 102, 0.4), 0 0 15px rgba(212, 175, 55, 0.4)'
        }}
      >
        <i className="fa-brands fa-whatsapp" />
      </a>

      {/* Info / FAQ */}
      <a
        href="/contact#faq"
        aria-label="FAQs &amp; Help"
        title="FAQs &amp; Help"
        style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--maroon, #7B1B2E), var(--maroon-deep, #4A0E1C))',
          color: 'var(--gold-light, #F5D061)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem',
          textDecoration: 'none',
          border: '2px solid var(--gold, #D4AF37)',
          boxShadow: '0 8px 24px rgba(123, 27, 46, 0.4), 0 0 15px rgba(212, 175, 55, 0.4)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.15) translateY(-3px)'
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(123, 27, 46, 0.6), 0 0 22px rgba(212, 175, 55, 0.6)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(123, 27, 46, 0.4), 0 0 15px rgba(212, 175, 55, 0.4)'
        }}
      >
        <i className="fa-solid fa-circle-info" />
      </a>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <FloatingButtons />
      <Routes>
        {/* ── Public pages ── */}
        <Route path="/"              element={<Home />} />
        <Route path="/why-nermai"    element={<WhyNermaiPage />} />
        <Route path="/contact"       element={<ContactPage />} />
        {/* FAQ integrated into Contact page */}
        <Route path="/faq"           element={<Navigate to="/contact#faq" replace />} />

        {/* ── Protected pages (controlled via admin Site Visibility) ── */}
        <Route
          path="/courses"
          element={<VisibilityGuard pageKey="courses"><CoursesPage /></VisibilityGuard>}
        />
        <Route
          path="/courses/:slug"
          element={<VisibilityGuard pageKey="courses"><CourseDetailPage /></VisibilityGuard>}
        />

        {/* ── Admin pages ── */}
        <Route path="/admin"           element={<AdminPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>


    </BrowserRouter>
  )
}

