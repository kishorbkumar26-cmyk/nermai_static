import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { fbFirestore } from '../firebase/firestore'
import { LMS_URL, CONTACT } from '../constants'

const NAV_ITEMS = [
  { label: 'Home',       href: '/',          type: 'route' },
  { label: 'Why Nermai', href: '/why-nermai', type: 'route' },
  { label: 'Courses',    href: '/courses',    type: 'route' },
  { label: 'Results',    href: '/#results',   type: 'hash'  },
  { label: 'Contact Us', href: '/contact',    type: 'route' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pageVisibility, setPageVisibility] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    
    fbFirestore.getSettings().then(s => {
      setPageVisibility(s.pageVisibility || { courses: true, results: true })
    })

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile nav on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const handleHashNav = (href) => {
    setMobileOpen(false)
    const hash = href.replace('/#', '')
    if (location.pathname === '/') {
      const el = document.getElementById(hash)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById(hash)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 400)
    }
  }

  return (
    <>
      <header className={`site-header${scrolled ? ' scrolled' : ''}`} id="site-header">
        <div className="container-wide">
          <div className="header-inner">
            {/* Logo */}
            <Link to="/" className="header-logo" aria-label="Nermai IAS Academy Home">
              <div className="header-logo-mark" aria-hidden="true">ந</div>
              <div className="header-logo-text">
                <span className="header-logo-name">NERMAI</span>
                <span className="header-logo-sub">IAS Academy</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="header-nav" aria-label="Primary navigation">
              {NAV_ITEMS.filter(item => {
                if (item.href === '/courses' && pageVisibility?.courses === false) return false
                if (item.href === '/#results' && pageVisibility?.results === false) return false
                return true
              }).map(item => {
                if (item.type === 'route') {
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`header-nav-link${location.pathname === item.href ? ' active' : ''}`}
                    >
                      {item.label}
                    </Link>
                  )
                }
                if (item.type === 'hash') {
                  return (
                    <button
                      key={item.href}
                      className="header-nav-link"
                      onClick={() => handleHashNav(item.href)}
                    >
                      {item.label}
                    </button>
                  )
                }
                // LMS external link
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="header-nav-link"
                    target={item.href !== '#' ? '_blank' : undefined}
                    rel="noopener noreferrer"
                  >
                    {item.label}
                  </a>
                )
              })}
            </nav>

            {/* Right side actions */}
            <div className="header-actions">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/${CONTACT.phones[0].replace(/\D/g, '')}`}
                className="header-whatsapp"
                aria-label="WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-whatsapp" />
              </a>

              {/* Enroll CTA */}
              <a
                href={LMS_URL}
                className="btn btn-primary header-cta"
                id="header-enroll-btn"
              >
                Enroll / Login
                <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }} />
              </a>

              {/* Hamburger */}
              <button
                className="header-hamburger"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={mobileOpen}
              >
                <span /><span /><span />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}
      <nav className={`mobile-nav${mobileOpen ? ' open' : ''}`} aria-label="Mobile navigation" aria-hidden={!mobileOpen}>
        <div className="mobile-nav-header">
          <div className="header-logo-mark" style={{ width: 36, height: 36, fontSize: '1rem' }}>ந</div>
          <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.05em' }}>NERMAI</span>
          <button
            className="mobile-nav-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="mobile-nav-links">
          {NAV_ITEMS.filter(item => {
            if (item.href === '/courses' && pageVisibility?.courses === false) return false
            if (item.href === '/#results' && pageVisibility?.results === false) return false
            return true
          }).map(item => {
            if (item.type === 'route') {
              return (
                <Link key={item.href} to={item.href} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                  {item.label}
                </Link>
              )
            }
            if (item.type === 'hash') {
              return (
                <button key={item.href} className="mobile-nav-link" onClick={() => handleHashNav(item.href)}>
                  {item.label}
                </button>
              )
            }
            return (
              <a
                key={item.label}
                href={item.href}
                className="mobile-nav-link"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            )
          })}
        </div>

        <div className="mobile-nav-footer">
          <a href={LMS_URL} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <i className="fa-solid fa-graduation-cap" style={{ marginRight: '8px' }} />
            Enroll / Login
          </a>
          <div style={{ textAlign: 'center', fontSize: '0.75rem', opacity: 0.5, marginTop: '1rem' }}>
            {CONTACT.phones[0]}
          </div>
        </div>
      </nav>
    </>
  )
}
