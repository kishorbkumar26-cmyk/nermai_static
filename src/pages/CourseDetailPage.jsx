import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useReveal } from '../hooks/useReveal'
import { fbFirestore } from '../firebase/firestore'
import { LMS_URL } from '../constants'
import './CourseDetailPage.css'

/* ── Floating Enroll Button ─────────────────────────────────────────────── */
function FloatingEnrollButton({ href, label }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`cdp-floating-btn${visible ? ' visible' : ''}`}
    >
      <i className="fa-solid fa-graduation-cap" />
      {label}
    </a>
  )
}

/* ── Sticky Tab Navigation ─────────────────────────────────────────────── */
function StickyNav({ tabs, activeTab, onTabClick }) {
  return (
    <div className="cdp-sticky-nav">
      <div className="cdp-sticky-nav-inner">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`cdp-nav-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => onTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Rich Content Renderer ─────────────────────────────────────────────── */
function RichContent({ html, className = '' }) {
  if (!html || html === '<p><br></p>' || html.trim() === '') return null
  return (
    <div
      className={`cdp-rich-text ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/* ── Section Block ─────────────────────────────────────────────────────── */
function SectionBlock({ id, eyebrow, title, icon, children, accent = 'primary' }) {
  return (
    <div id={id} className={`cdp-section-block reveal cdp-accent-${accent}`}>
      <div className="cdp-section-eyebrow">
        {icon && <i className={`fa-solid ${icon}`} />}
        {eyebrow}
      </div>
      {title && <h2 className="cdp-section-title">{title}</h2>}
      {children}
    </div>
  )
}

/* ─── Fallback data ─────────────────────────────────────────────────────── */
const FALLBACK_COURSES = [
  { id: 'upsc',       name: 'UPSC Civil Service',   subname: 'IAS / IPS / IFS',               icon: '🏛️', iconType: 'emoji' },
  { id: 'tnpsc',      name: 'TNPSC / Railways',      subname: 'GROUP I · II · IV · VAO',        icon: '📋', iconType: 'emoji' },
  { id: 'udc-ldc',    name: 'UDC / LDC / VAO',       subname: 'CLERICAL & REVENUE SERVICES',   icon: '📁', iconType: 'emoji' },
  { id: 'banking',    name: 'Banking',                subname: 'IBPS · SBI · RBI',              icon: '🏦', iconType: 'emoji' },
  { id: 'puducherry', name: 'Puducherry Exam',        subname: 'UDC · LDC · DT · SI',           icon: '🌿', iconType: 'emoji' },
  { id: 'ssc',        name: 'SSC / PC / DT / SI',    subname: 'CENTRAL & STATE COMBINED',      icon: '⚖️', iconType: 'emoji' },
]

function CourseIcon({ course }) {
  if (course.iconType === 'url' && course.iconUrl) {
    return <img src={course.iconUrl} alt={course.name} style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 8 }} onError={e => { e.target.style.display = 'none' }} />
  }
  return <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{course.icon || '📚'}</span>
}

function ComingSoon({ course }) {
  return (
    <>
      <Header />
      <main style={{ paddingTop: '80px' }}>
        <section className="cdp-hero-section" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center' }}>
          <div className="container" style={{ textAlign: 'center', padding: '5rem 1.5rem' }}>
            <CourseIcon course={course} />
            <h1 className="cdp-hero-title" style={{ marginTop: '1.5rem' }}>{course.name}</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', fontSize: '0.85rem' }}>{course.subname}</p>
            <div className="cdp-coming-soon-badge">
              <i className="fa-solid fa-clock" /> Content Coming Soon
            </div>
            <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, maxWidth: 480, margin: '1.5rem auto', fontSize: '0.95rem' }}>
              Our team is preparing detailed course information for <strong style={{ color: '#fff' }}>{course.name}</strong>.
              Contact us to learn more or enroll directly.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
              <a href={LMS_URL} className="cdp-cta-btn-primary" target="_blank" rel="noopener noreferrer">
                Enroll Now <i className="fa-solid fa-arrow-right" />
              </a>
              <Link to="/contact" className="cdp-cta-btn-ghost">Contact Us</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

/* ── Main Page ─────────────────────────────────────────────────────────── */
export default function CourseDetailPage() {
  const { slug } = useParams()
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const sectionRefs = useRef({})

  useEffect(() => { window.scrollTo(0, 0) }, [slug])
  useReveal([content])

  useEffect(() => {
    Promise.all([
      fbFirestore.getCourseContent(slug),
      fbFirestore.getSettings()
    ]).then(([courseData, settings]) => {
      const allCourses = settings.homeContent?.courses || FALLBACK_COURSES
      const base = allCourses.find(c =>
        c.slug === slug || c.id === slug ||
        (c.enrollLink && c.enrollLink.replace('/courses/', '') === slug)
      ) || FALLBACK_COURSES.find(c =>
        c.id === slug ||
        (c.enrollLink && c.enrollLink.replace('/courses/', '') === slug)
      )
      if (courseData) {
        setContent({ ...base, ...courseData })
      } else {
        setContent(base ? { ...base, isLive: false } : null)
      }
      setLoading(false)
    })
  }, [slug])

  // Scroll spy
  useEffect(() => {
    const onScroll = () => {
      const offsets = Object.entries(sectionRefs.current).map(([id, el]) => ({
        id, top: el?.getBoundingClientRect().top ?? Infinity
      })).filter(x => x.top < 160)
      if (offsets.length > 0) {
        const last = offsets[offsets.length - 1]
        setActiveTab(last.id)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToSection = (id) => {
    const el = sectionRefs.current[id]
    if (el) {
      const offset = 100
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' })
    }
    setActiveTab(id)
  }

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px', background: 'var(--color-background, #FAF9F7)' }}>
          <div style={{ textAlign: 'center' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--color-primary, #A00001)', marginBottom: '1rem' }} />
            <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>Loading course details...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!content) {
    return (
      <>
        <Header />
        <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h1 style={{ marginBottom: '0.5rem' }}>Course not found</h1>
            <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>This course doesn't exist or may have been moved.</p>
            <Link to="/courses" className="cdp-cta-btn-primary">Browse All Courses</Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!content.isLive) return <ComingSoon course={content} />

  // Build visible tabs
  const visibleTabs = [
    content.overview && content.visibility?.overview !== false && { id: 'overview', label: 'Overview' },
    content.syllabus && content.visibility?.syllabus !== false && { id: 'syllabus', label: 'Syllabus' },
    content.eligibility && content.visibility?.eligibility !== false && { id: 'eligibility', label: 'Eligibility' },
    (content.batchInfo || content.feeInfo) && { id: 'details', label: 'Batch & Fees' },
  ].filter(Boolean)

  const hasKeyFeatures = content.features && content.features.length > 0

  return (
    <>
      <Header />
      <main style={{ paddingTop: '80px', background: 'var(--color-background, #FAF9F7)' }}>

        {/* ── HERO ── */}
        <section
          className="cdp-hero-section"
          style={content.bannerUrl ? {
            backgroundImage: `linear-gradient(135deg, rgba(100,5,5,0.92) 0%, rgba(30,5,5,0.97) 100%), url(${content.bannerUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : undefined}
        >
          {/* Decorative pattern */}
          {!content.bannerUrl && (
            <div className="cdp-hero-pattern" aria-hidden="true" />
          )}

          <div className="container">
            <div className="cdp-hero-inner">
              {/* Breadcrumb */}
              <div className="cdp-breadcrumb">
                <Link to="/">Home</Link>
                <i className="fa-solid fa-chevron-right" />
                <Link to="/courses">Courses</Link>
                <i className="fa-solid fa-chevron-right" />
                <span>{content.title || content.name}</span>
              </div>

              <div className="cdp-hero-content">
                {/* Course Icon */}
                <div className="cdp-hero-icon">
                  <CourseIcon course={content} />
                </div>

                <div className="cdp-hero-text">
                  {/* Tags */}
                  {(content.tags || content.badges || []).length > 0 && (
                    <div className="cdp-hero-tags">
                      {(content.tags || content.badges || []).map((tag, i) => (
                        <span key={i} className="cdp-hero-tag">
                          {typeof tag === 'string' ? tag : tag.text || tag.label}
                        </span>
                      ))}
                    </div>
                  )}

                  <h1 className="cdp-hero-title">
                    {content.title || content.name}
                  </h1>

                  <p className="cdp-hero-subtitle">
                    {content.shortDescription || content.subname}
                  </p>

                  {/* Key stats row */}
                  {hasKeyFeatures && (
                    <div className="cdp-hero-features">
                      {content.features.slice(0, 3).map((f, i) => (
                        <div key={i} className="cdp-hero-feature">
                          <i className="fa-solid fa-circle-check" />
                          <span>{typeof f === 'string' ? f : f.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hero CTA card */}
                <div className="cdp-hero-cta-card">
                  {content.coverImageUrl && (
                    <div className="cdp-hero-cta-img">
                      <img src={content.coverImageUrl} alt={content.title} loading="lazy" />
                    </div>
                  )}
                  <div className="cdp-hero-cta-body">
                    <p className="cdp-hero-cta-label">Start Your Preparation</p>
                    <a
                      href={content.ctaLink || LMS_URL}
                      className="cdp-hero-enroll-btn"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {content.ctaText || 'Enroll Now'}
                      <i className="fa-solid fa-arrow-right" />
                    </a>
                    <Link to="/contact" className="cdp-hero-contact-link">
                      <i className="fa-solid fa-comments" /> Ask a Counsellor
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STICKY NAV ── */}
        {visibleTabs.length > 1 && (
          <StickyNav tabs={visibleTabs} activeTab={activeTab} onTabClick={scrollToSection} />
        )}

        {/* ── CONTENT BODY ── */}
        <div className="cdp-body">
          <div className="container">
            <div className="cdp-body-layout">

              {/* ─── Main Content Column ─── */}
              <div className="cdp-main-col">

                {/* Overview */}
                {(content.overview && content.visibility?.overview !== false) && (
                  <div ref={el => sectionRefs.current['overview'] = el}>
                    <SectionBlock id="overview" eyebrow="Course Overview" title="About This Course" icon="fa-book-open" accent="primary">
                      <RichContent html={content.overview} />
                    </SectionBlock>
                  </div>
                )}

                {/* Syllabus */}
                {(content.syllabus && content.visibility?.syllabus !== false) && (
                  <div ref={el => sectionRefs.current['syllabus'] = el}>
                    <SectionBlock id="syllabus" eyebrow="Course Curriculum" title="What You Will Learn" icon="fa-list-check" accent="gold">
                      <RichContent html={content.syllabus} />
                    </SectionBlock>
                  </div>
                )}

                {/* Eligibility */}
                {(content.eligibility && content.visibility?.eligibility !== false) && (
                  <div ref={el => sectionRefs.current['eligibility'] = el}>
                    <SectionBlock id="eligibility" eyebrow="Requirements" title="Eligibility Criteria" icon="fa-user-check" accent="neutral">
                      <RichContent html={content.eligibility} />
                    </SectionBlock>
                  </div>
                )}

                {/* Batch & Fees */}
                {((content.batchInfo && content.visibility?.batchInfo !== false) ||
                  (content.feeInfo && content.visibility?.feeInfo !== false)) && (
                  <div ref={el => sectionRefs.current['details'] = el}>
                    <SectionBlock id="details" eyebrow="Course Details" title="Batch & Fee Information" icon="fa-calendar-days" accent="primary">
                      <div className="cdp-two-col">
                        {(content.batchInfo && content.visibility?.batchInfo !== false) && (
                          <div className="cdp-info-panel">
                            <div className="cdp-info-panel-header">
                              <i className="fa-solid fa-clock" />
                              Batch Information
                            </div>
                            <RichContent html={content.batchInfo} />
                          </div>
                        )}
                        {(content.feeInfo && content.visibility?.feeInfo !== false) && (
                          <div className="cdp-info-panel cdp-info-panel--gold">
                            <div className="cdp-info-panel-header">
                              <i className="fa-solid fa-indian-rupee-sign" />
                              Fee Structure
                            </div>
                            <RichContent html={content.feeInfo} />
                          </div>
                        )}
                      </div>
                    </SectionBlock>
                  </div>
                )}

              </div>

              {/* ─── Sidebar ─── */}
              <aside className="cdp-sidebar">
                <div className="cdp-sidebar-sticky">

                  {/* Enroll Card */}
                  <div className="cdp-sidebar-card cdp-enroll-card">
                    <p className="cdp-enroll-card-label">Ready to join?</p>
                    <h3 className="cdp-enroll-card-title">Start Your Journey Today</h3>
                    <a
                      href={content.ctaLink || LMS_URL}
                      className="cdp-hero-enroll-btn"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ marginBottom: '0.75rem' }}
                    >
                      {content.ctaText || 'Enroll Now'}
                      <i className="fa-solid fa-arrow-right" />
                    </a>
                    <Link to="/contact" className="cdp-hero-contact-link">
                      <i className="fa-solid fa-comments" /> Ask a Counsellor
                    </Link>
                  </div>

                  {/* Key Features */}
                  {hasKeyFeatures && (
                    <div className="cdp-sidebar-card">
                      <div className="cdp-sidebar-card-title">
                        <i className="fa-solid fa-star" /> What's Included
                      </div>
                      <ul className="cdp-feature-list">
                        {content.features.map((f, i) => (
                          <li key={i} className="cdp-feature-item">
                            <i className="fa-solid fa-circle-check" />
                            <span>{typeof f === 'string' ? f : f.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* FAQ Link */}
                  <div className="cdp-sidebar-card cdp-faq-link-card">
                    <i className="fa-solid fa-circle-question cdp-faq-icon" />
                    <h4>Have questions?</h4>
                    <p>Visit our FAQ page for answers about admission, fees, and course structure.</p>
                    <Link to="/faq" className="cdp-faq-link-btn">View FAQs</Link>
                  </div>

                </div>
              </aside>

            </div>
          </div>
        </div>

        {/* ── FINAL CTA ── */}
        <section className="cdp-final-cta">
          <div className="container-narrow" style={{ textAlign: 'center' }}>
            <p className="cdp-final-cta-eyebrow">BEGIN YOUR JOURNEY</p>
            <h2 className="cdp-final-cta-title">
              Ready to crack<br /><span>{content.title || content.name}?</span>
            </h2>
            <p className="cdp-final-cta-desc">
              Join Nermai IAS Academy — quality coaching accessible to every aspirant in Tamil Nadu and Puducherry.
            </p>
            <div className="cdp-final-cta-btns">
              <a href={content.ctaLink || LMS_URL} className="cdp-hero-enroll-btn cdp-hero-enroll-btn--lg" target="_blank" rel="noopener noreferrer">
                {content.ctaText || 'Enroll Now'} <i className="fa-solid fa-arrow-right" />
              </a>
              <Link to="/contact" className="cdp-cta-btn-ghost">Contact Us</Link>
            </div>
          </div>
        </section>

        {/* ── FLOATING BUTTON ── */}
        <FloatingEnrollButton href={content.ctaLink || LMS_URL} label={content.ctaText || 'Enroll Now'} />

      </main>
      <Footer />
    </>
  )
}

