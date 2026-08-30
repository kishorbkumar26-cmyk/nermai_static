import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import WhyNermaiPage from './pages/WhyNermaiPage'
import CoursesPage from './pages/CoursesPage'
import CourseDetailPage from './pages/CourseDetailPage'
import ContactPage from './pages/ContactPage'
import AdminPage from './pages/AdminPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminPortal from './components/AdminPortal'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public pages ── */}
        <Route path="/"              element={<Home />} />
        <Route path="/why-nermai"    element={<WhyNermaiPage />} />
        <Route path="/courses"       element={<CoursesPage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        <Route path="/contact"       element={<ContactPage />} />

        {/* ── Admin pages ── */}
        <Route path="/admin"           element={<AdminPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>

      {/* Floating admin panel — available on all public pages */}
      <AdminPortal />
    </BrowserRouter>
  )
}
