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
            <Link to="/" className="header-logo" aria-label="Nermai IAS Academy Home" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/nermai-logo.png" alt="Nermai IAS Academy Logo" style={{ height: '50px', width: 'auto' }} />
              <div className="header-logo-text" style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="header-logo-name" style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.05em', lineHeight: 1.2 }}>NERMAI</span>
                <span className="header-logo-sub" style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.05em', color: 'var(--gray-500)', lineHeight: 1 }}>IAS Academy</span>
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
                className="header-contact-icon"
                aria-label="WhatsApp"
                title="Chat on WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
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
        <div className="mobile-nav-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/nermai-logo.png" alt="Nermai IAS Academy Logo" style={{ height: '36px', width: 'auto' }} />
          <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.05em', lineHeight: 1.2 }}>
            NERMAI<br/>
            <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--gray-500)' }}>IAS Academy</span>
          </span>
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
