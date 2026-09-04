import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { fbFirestore } from '../firebase/firestore'
import { LMS_URL, CONTACT, WHATSAPP_NUMBER } from '../constants'
import { 
  MapPin, Phone, Mail, Send, 
  Search, ChevronDown, Home as HomeIcon, ArrowRight, X, Sparkles, BookOpen, Trophy, HelpCircle
} from 'lucide-react'
import TopTicker from './TopTicker'
import './Header.css'

const NAV_DROPDOWNS = {
  whyNermai: [
    { label: 'Our Story & Mission', href: '/why-nermai' },
    { label: 'Why Nermai Platform', href: '/why-nermai#features' },
    { label: 'Faculty & Mentors', href: '/why-nermai#team' },
  ],
  courses: [
    { label: 'UPSC Civil Services', href: '/courses?cat=upsc' },
    { label: 'TNPSC Group I & II', href: '/courses?cat=tnpsc' },
    { label: 'Puducherry Govt Exams', href: '/courses?cat=puducherry' },
    { label: 'Banking & SSC', href: '/courses?cat=banking' },
  ],
  results: [
    { label: 'Success Stories 2024', href: '/#success-stories' },
    { label: 'Toppers Hall of Fame', href: '/#results' },
    { label: 'Selected Candidates', href: '/#impact' },
  ],
  resources: [
    { label: 'Current Affairs PDFs', href: '/contact#resources' },
    { label: 'Syllabus & PYQ Papers', href: '/contact#resources' },
    { label: 'Mock Test Series', href: '/courses' },
  ]
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [tickerData, setTickerData] = useState({
    visible: true,
    items: [
      { text: 'Admission opened for UDC/LDC 2026', link: '/courses' },
      { text: 'TNPSC Group II – New Batch from 15 Sep 2026', link: '/courses' },
      { text: 'UPSC Foundation Batch – Limited Seats', link: '/courses' },
      { text: 'Free Daily Current Affairs PDF Available', link: '/contact' }
    ]
  })

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s.homeContent?.ticker) setTickerData(s.homeContent.ticker)
    })
  }, [])

  // Lock/unlock body scroll for mobile nav
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const closeMobileNav = useCallback(() => setMobileOpen(false), [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearchOpen(false)
    navigate(`/courses?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}`

  return (
    <div className="site-header-wrapper" id="site-header">
      
      {/* Tier 1: Top Contact & Social Bar (Deep Maroon) */}
      <div className="top-bar-strip">
        <div className="container" style={{ maxWidth: '1560px' }}>
          <div className="top-bar-inner">
            
            {/* Left Contact Info */}
            <div className="top-bar-left">
              <span className="top-bar-item">
                <MapPin size={13} style={{ color: '#F5D061' }} /> Puducherry, India
              </span>
              <div className="top-bar-divider" />
              <a href={`tel:${CONTACT.phones[0]}`} className="top-bar-item">
                <Phone size={13} style={{ color: '#F5D061' }} /> {CONTACT.phones[0]}
              </a>
              <div className="top-bar-divider" />
              <a href={`mailto:${CONTACT.email}`} className="top-bar-item">
                <Mail size={13} style={{ color: '#F5D061' }} /> {CONTACT.email}
              </a>
            </div>

            {/* Right Slogan & Social Links */}
            <div className="top-bar-right">
              <div className="top-bar-tagline">
                Empowering Aspirants. Strengthening the Nation.
              </div>
              <div className="top-bar-socials">
                <a href="#" className="top-bar-social-link" title="YouTube" aria-label="YouTube">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="#" className="top-bar-social-link" title="Instagram" aria-label="Instagram">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href="#" className="top-bar-social-link" title="Telegram" aria-label="Telegram">
                  <Send size={14} />
                </a>
                <a href="#" className="top-bar-social-link" title="Facebook" aria-label="Facebook">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Tier 2: Main Navigation Bar (Warm Cream) */}
      <header className="main-nav-strip">
        <div className="container" style={{ maxWidth: '1560px' }}>
          <div className="main-nav-inner">
            
            {/* Brand Logo & Motto */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/" className="brand-group" aria-label="Nermai IAS Academy Home">
                <img src="/nermai-logo.png" alt="Nermai IAS Academy Logo" className="brand-logo-img" />
                <div className="brand-titles">
                  <span className="brand-name">NERMAI</span>
                  <span className="brand-sub">IAS ACADEMY</span>
                </div>
              </Link>

              <div className="brand-divider" />

              <div className="brand-motto">
                <span>Learn</span>
                <span>Compete</span>
                <span>Serve</span>
              </div>
            </div>

            {/* Center Navigation Items */}
            <nav className="nav-links-row" aria-label="Primary Navigation">
              
              {/* Home */}
              <Link 
                to="/" 
                className={`nav-link-btn ${location.pathname === '/' ? 'active nav-active-pill' : ''}`}
              >
                <HomeIcon size={16} style={{ marginRight: '2px' }} /> Home
              </Link>

              {/* Why Nermai Dropdown */}
              <div className="nav-item-wrap">
                <Link to="/why-nermai" className={`nav-link-btn ${location.pathname === '/why-nermai' ? 'active nav-active-pill' : ''}`}>
                  Why Nermai <ChevronDown size={14} />
                </Link>
                <div className="nav-dropdown">
                  {NAV_DROPDOWNS.whyNermai.map((item, idx) => (
                    <Link key={idx} to={item.href} className="dropdown-item-link">
                      <Sparkles size={14} style={{ color: 'var(--maroon)' }} />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Courses Dropdown */}
              <div className="nav-item-wrap">
                <Link to="/courses" className={`nav-link-btn ${location.pathname.startsWith('/courses') ? 'active nav-active-pill' : ''}`}>
                  Courses <ChevronDown size={14} />
                </Link>
                <div className="nav-dropdown">
                  {NAV_DROPDOWNS.courses.map((item, idx) => (
                    <Link key={idx} to={item.href} className="dropdown-item-link">
                      <BookOpen size={14} style={{ color: 'var(--maroon)' }} />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Results Dropdown */}
              <div className="nav-item-wrap">
                <a href="/#results" className="nav-link-btn">
                  Results <ChevronDown size={14} />
                </a>
                <div className="nav-dropdown">
                  {NAV_DROPDOWNS.results.map((item, idx) => (
                    <a key={idx} href={item.href} className="dropdown-item-link">
                      <Trophy size={14} style={{ color: 'var(--maroon)' }} />
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Resources Dropdown */}
              <div className="nav-item-wrap">
                <a href="/contact#resources" className="nav-link-btn">
                  Resources <ChevronDown size={14} />
                </a>
                <div className="nav-dropdown">
                  {NAV_DROPDOWNS.resources.map((item, idx) => (
                    <a key={idx} href={item.href} className="dropdown-item-link">
                      <BookOpen size={14} style={{ color: 'var(--maroon)' }} />
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* FAQ */}
              <Link to="/contact#faq" className="nav-link-btn">
                FAQ
              </Link>

              {/* Contact Us */}
              <Link to="/contact" className={`nav-link-btn ${location.pathname === '/contact' ? 'active nav-active-pill' : ''}`}>
                Contact Us
              </Link>

            </nav>

            {/* Right Action Controls */}
            <div className="nav-actions-right">
              {/* Search Circle Button */}
              <button 
                className="action-circle-btn"
                onClick={() => setSearchOpen(true)}
                title="Search Courses & Notes"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              {/* WhatsApp Green Circle */}
              <a 
                href={waLink} 
                target="_blank" 
                rel="noreferrer" 
                className="action-wa-circle"
                title="Chat on WhatsApp"
                aria-label="WhatsApp"
              >
                <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.25rem' }} />
              </a>

              {/* Golden ENROLL / LOGIN CTA Button */}
              <a href={LMS_URL} target="_blank" rel="noreferrer" className="enroll-gold-btn">
                ENROLL / LOGIN <ArrowRight size={16} />
              </a>

              {/* Mobile Hamburger */}
              <button
                className="header-hamburger"
                onClick={() => setMobileOpen(true)}
                aria-label="Open Navigation Menu"
              >
                <span /><span /><span />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Tier 3: Bottom Ticker Bar (Latest Updates) */}
      <TopTicker ticker={tickerData} />

      {/* Search Modal Overlay */}
      {searchOpen && (
        <div className="search-modal-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#7B1B2E', fontFamily: 'var(--font-display)' }}>Search Nermai IAS Academy</h3>
              <button onClick={() => setSearchOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#635345' }}>
                <X size={22} />
              </button>
            </div>
            
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search courses, syllabus, mock tests..."
                autoFocus
                style={{
                  flex: 1, padding: '0.85rem 1.1rem', borderRadius: '12px',
                  border: '1px solid rgba(212, 175, 55, 0.4)', background: '#FFFFFF',
                  fontSize: '1rem', outline: 'none'
                }}
              />
              <button type="submit" className="enroll-gold-btn" style={{ borderRadius: '12px', padding: '0.85rem 1.5rem' }}>
                Search
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={closeMobileNav} aria-hidden="true" />
      )}
      <nav className={`mobile-nav${mobileOpen ? ' open' : ''}`} aria-label="Mobile navigation">
        <div className="mobile-nav-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/nermai-logo.png" alt="Nermai IAS Academy Logo" style={{ width: '42px', height: '42px', objectFit: 'contain', borderRadius: '50%' }} />
          <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.05em', color: '#FFF' }}>
            NERMAI IAS ACADEMY
          </span>
          <button className="mobile-nav-close" onClick={closeMobileNav} aria-label="Close menu">
            <X size={24} />
          </button>
        </div>

        <div className="mobile-nav-links" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          <Link to="/" className="mobile-nav-link" onClick={closeMobileNav}>Home</Link>
          <Link to="/why-nermai" className="mobile-nav-link" onClick={closeMobileNav}>Why Nermai</Link>
          <Link to="/courses" className="mobile-nav-link" onClick={closeMobileNav}>Courses</Link>
          <a href="/#results" className="mobile-nav-link" onClick={closeMobileNav}>Results</a>
          <Link to="/contact" className="mobile-nav-link" onClick={closeMobileNav}>Contact Us</Link>
        </div>

        <div className="mobile-nav-footer" style={{ marginTop: 'auto', paddingTop: '2rem' }}>
          <a href={LMS_URL} target="_blank" rel="noreferrer" className="enroll-gold-btn" style={{ width: '100%', justifyContent: 'center' }}>
            ENROLL / LOGIN <ArrowRight size={16} />
          </a>
        </div>
      </nav>

    </div>
  )
}
