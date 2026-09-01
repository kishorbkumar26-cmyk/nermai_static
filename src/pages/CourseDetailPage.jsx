import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import FAQ from '../components/FAQ'
import { useReveal } from '../hooks/useReveal'
import { fbFirestore } from '../firebase/firestore'
import { LMS_URL } from '../constants'

/* ─── Fallback data from homeContent.courses ─────────────────────────────── */
const FALLBACK_COURSES = [
  { slug: 'upsc',       name: 'UPSC Civil Service',  subname: 'IAS / IPS / IFS',               icon: '🏛️', iconType: 'emoji' },
  { slug: 'tnpsc',      name: 'TNPSC / Railways',    subname: 'GROUP I · II · IV · VAO',        icon: '📋', iconType: 'emoji' },
  { slug: 'udc-ldc',    name: 'UDC / LDC / VAO',     subname: 'CLERICAL & REVENUE SERVICES',   icon: '📁', iconType: 'emoji' },
  { slug: 'banking',    name: 'Banking',              subname: 'IBPS · SBI · RBI',              icon: '🏦', iconType: 'emoji' },
  { slug: 'puducherry', name: 'Puducherry Exam',      subname: 'UDC · LDC · DT · SI',           icon: '🌿', iconType: 'emoji' },
  { slug: 'ssc',        name: 'SSC / PC / DT / SI',  subname: 'CENTRAL & STATE COMBINED',      icon: '⚖️', iconType: 'emoji' },
]

function CourseIcon({ course }) {
  if (course.iconType === 'url' && course.iconUrl) {
    return (
      <img
        src={course.iconUrl}
        alt={course.name}
        style={{ width: 64, height: 64, objectFit: 'contain' }}
        onError={e => { e.target.style.display = 'none' }}
      />
    )
  }
  return <span style={{ fontSize: '3rem', lineHeight: 1 }}>{course.icon || '📚'}</span>
}

function ComingSoon({ course }) {
  return (
    <>
      <Header />
      <main style={{ paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'var(--maroon-deep)', color: 'var(--white)', padding: '4rem 0', borderBottom: '4px solid var(--saffron)' }}>
          <div className="container-narrow" style={{ textAlign: 'center' }}>
            <CourseIcon course={course} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3rem)', marginTop: '1rem', color: 'var(--white)' }}>
              {course.name}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginTop: '0.5rem' }}>
              {course.subname}
            </p>
          </div>
        </section>
        <section style={{ padding: '5rem 0', textAlign: 'center', background: 'var(--cream)' }}>
          <div className="container-narrow">
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🚧</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '1rem' }}>
              Content Coming Soon
            </h2>
            <p style={{ color: 'var(--gray-500)', lineHeight: 1.8, maxWidth: 480, margin: '0 auto 2rem' }}>
              Our team is preparing detailed course information for <strong>{course.name}</strong>. 
              Contact us to learn more or enroll now.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={LMS_URL} className="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">
                Enroll Now <i className="fa-solid fa-arrow-right" style={{ marginLeft: 8 }} />
              </a>
              <Link to="/contact" className="btn btn-outline btn-lg">Contact Us</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default function CourseDetailPage() {
  const { slug } = useParams()
  const [content, setContent] = useState(null)
  const [baseCourse, setBaseCourse] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { window.scrollTo(0, 0) }, [slug])
  useReveal([content])

  useEffect(() => {
    Promise.all([
      fbFirestore.getCourseContent(slug),
      fbFirestore.getSettings()
    ]).then(([courseData, settings]) => {
      // Find base course info from homeContent.courses
      const allCourses = settings.homeContent?.courses || FALLBACK_COURSES
      const base = allCourses.find(c => c.slug === slug) || FALLBACK_COURSES.find(c => c.slug === slug)
      setBaseCourse(base)
      // Merge content
      if (courseData) {
        setContent({ ...base, ...courseData })
      } else {
        setContent(base ? { ...base, isLive: false } : null)
      }
      setLoading(false)
    })
  }, [slug])

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--maroon)' }} />
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
            <h1>Course not found</h1>
            <Link to="/courses" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>View All Courses</Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // Show "Coming Soon" if not published
  if (!content.isLive) return <ComingSoon course={content} />

  // Render HTML content safely
  const renderRichText = (html) => ({ __html: html || '' })

  return (
    <>
      <Header />
      <main style={{ paddingTop: '80px' }}>
        {/* ── HERO ── */}
        <section style={{ 
          background: content.bannerUrl 
            ? `linear-gradient(to bottom, rgba(74, 21, 33, 0.85), rgba(74, 21, 33, 0.95)), url(${content.bannerUrl}) center/cover no-repeat` 
            : 'var(--maroon-deep)', 
          color: 'var(--white)', 
          padding: '6rem 0 5rem', 
          borderBottom: '4px solid var(--saffron)', 
          position: 'relative', 
          overflow: 'hidden' 
        }}>
          {!content.bannerUrl && <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.03) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.03) 40px)', pointerEvents: 'none' }} />}
          
          <div className="container" style={{ position: 'relative', transform: content.bannerUrl ? 'translateZ(20px) scale(1.02)' : 'none', textShadow: content.bannerUrl ? '0 4px 15px rgba(0,0,0,0.5)' : 'none', transition: 'transform 0.3s ease-out' }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap', background: content.bannerUrl ? 'rgba(0,0,0,0.25)' : 'transparent', padding: content.bannerUrl ? '2rem' : '0', borderRadius: '12px', backdropFilter: content.bannerUrl ? 'blur(4px)' : 'none', border: content.bannerUrl ? '1px solid rgba(255,255,255,0.1)' : 'none', boxShadow: content.bannerUrl ? '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)' : 'none' }}>
              <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CourseIcon course={content} />
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {(content.tags || []).map(tag => (
                    <span key={tag} style={{ background: 'rgba(230,92,0,0.25)', color: 'var(--saffron)', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', padding: '3px 8px', border: '1px solid rgba(230,92,0,0.3)' }}>{tag}</span>
                  ))}
                </div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', color: 'var(--white)', marginBottom: '0.25rem', lineHeight: 1.15 }}>
                  {content.name}
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', fontSize: '0.85rem' }}>
                  {content.subname}
                </p>
              </div>
              <a href={LMS_URL} className="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
                {content.ctaText || 'Enroll Now'} <i className="fa-solid fa-arrow-right" style={{ marginLeft: 8 }} />
              </a>
            </div>
          </div>
        </section>

        {/* ── OVERVIEW ── */}
        {(content.overview && content.visibility?.overview !== false) && (
          <section className="section" style={{ background: 'var(--cream)' }}>
            <div className="container">
              <div className="about-intro-grid">
                <div className="reveal about-intro-text" style={{ gridColumn: '1 / -1' }}>
                  <span className="eyebrow">Overview</span>
                  <h2 className="section-title" style={{ marginTop: 'var(--space-2)' }}>About This Course</h2>
                  <div className="rich-text-content" style={{ color: 'var(--gray-600)', lineHeight: 1.9 }} dangerouslySetInnerHTML={renderRichText(content.overview)} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── RICH TEXT CONTENT LAYOUT ── */}
        <section className="section" style={{ background: 'var(--white)' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', maxWidth: '900px', margin: '0 auto' }}>

              {/* Syllabus / What You'll Learn */}
              {(content.syllabus && content.visibility?.syllabus !== false) && (
                <div className="reveal">
                  <div className="eyebrow" style={{ marginBottom: '1rem', color: 'var(--maroon)' }}>Course Curriculum</div>
                  <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>What You Will Learn</h2>
                  <div className="rich-text-content brut-frame" style={{ padding: '2rem', background: 'var(--cream)', borderRadius: '8px' }} dangerouslySetInnerHTML={renderRichText(content.syllabus)} />
                </div>
              )}

              {/* Eligibility */}
              {(content.eligibility && content.visibility?.eligibility !== false) && (
                <div className="reveal">
                  <div className="eyebrow" style={{ marginBottom: '1rem', color: 'var(--saffron)' }}>Requirements</div>
                  <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Eligibility Criteria</h2>
                  <div className="rich-text-content" dangerouslySetInnerHTML={renderRichText(content.eligibility)} />
                </div>
              )}

              {/* Batch & Fee Grid */}
              {((content.batchInfo && content.visibility?.batchInfo !== false) || (content.feeInfo && content.visibility?.feeInfo !== false)) && (
                <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                  {(content.batchInfo && content.visibility?.batchInfo !== false) && (
                    <div className="brut-frame" style={{ padding: '2rem', borderTop: '4px solid var(--maroon)' }}>
                      <div className="eyebrow" style={{ marginBottom: '1rem' }}>Batch Information</div>
                      <div className="rich-text-content" dangerouslySetInnerHTML={renderRichText(content.batchInfo)} />
                    </div>
                  )}
                  {(content.feeInfo && content.visibility?.feeInfo !== false) && (
                    <div className="brut-frame" style={{ padding: '2rem', borderTop: '4px solid var(--saffron)' }}>
                      <div className="eyebrow" style={{ marginBottom: '1rem' }}>Fee Structure</div>
                      <div className="rich-text-content" dangerouslySetInnerHTML={renderRichText(content.feeInfo)} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── FAQS ── */}
        {content.faqs && content.faqs.length > 0 && (
          <FAQ faqs={content.faqs} eyebrow="Course FAQs" title={<>Frequently Asked<br />Questions</>} />
        )}

        {/* ── CTA ── */}
        <section className="section cta-final" style={{ background: 'var(--maroon-deep)', color: 'var(--white)', textAlign: 'center' }}>
          <div className="container-narrow reveal">
            <span className="eyebrow" style={{ color: 'var(--saffron)', marginBottom: 'var(--space-4)', display: 'block' }}>
              BEGIN YOUR JOURNEY
            </span>
            <h2 className="display-large" style={{ color: 'var(--white)', marginBottom: 'var(--space-4)' }}>
              Ready to crack {content.name}?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 'var(--space-8)', maxWidth: 420, margin: '0 auto var(--space-8)' }}>
              Join Nermai IAS Academy — quality coaching accessible to every aspirant.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={LMS_URL} className="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">
                {content.ctaText || 'Enroll Now'} <i className="fa-solid fa-arrow-right" style={{ marginLeft: 8 }} />
              </a>
              <Link to="/contact" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.25)' }}>
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
