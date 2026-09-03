import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { fbFirestore } from './firebase/firestore'
import Home from './pages/Home'
import WhyNermaiPage from './pages/WhyNermaiPage'
import CoursesPage from './pages/CoursesPage'
import CourseDetailPage from './pages/CourseDetailPage'
import ContactPage from './pages/ContactPage'
import AdminPage from './pages/AdminPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminPortal from './components/AdminPortal'
import FaqPage from './pages/FaqPage'

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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public pages ── */}
        <Route path="/"              element={<Home />} />
        <Route path="/why-nermai"    element={<WhyNermaiPage />} />
        <Route path="/contact"       element={<ContactPage />} />
        <Route path="/faq"           element={<FaqPage />} />

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
