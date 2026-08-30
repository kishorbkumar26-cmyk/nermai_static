import { useEffect, useState } from 'react'
import Header from '../components/Header'
import HeroCarousel from '../components/HeroCarousel'
import StatsBar from '../components/StatsBar'
import Courses from '../components/Courses'
import WhyNermai from '../components/WhyNermai'
import HowNermaiWorks from '../components/HowNermaiWorks'
import WhatYouGet from '../components/WhatYouGet'
import Results from '../components/Results'
import Gallery from '../components/Gallery'
import Testimonials from '../components/Testimonials'
import FAQ from '../components/FAQ'
import Footer from '../components/Footer'
import EventsCalendar from '../components/EventsCalendar'
import { LMS_URL } from '../constants'
import { fbFirestore } from '../firebase/firestore'

const DEFAULT_ABOUT = {
  eyebrow: 'About Nermai',
  title: 'Built in Puducherry.\nDriven by purpose.',
  para1: 'Quality coaching should not be a privilege. A handful of youth from Puducherry started NERMAI IAS ACADEMY to change this — making serious civil services preparation accessible to every aspirant, regardless of background.',
  para2: 'The civil services examination is the most prestigious and most demanding exam in the country. Nermai exists to make the path clearer, the preparation more structured, and the journey less lonely.',
  imageUrl: 'https://nermaiiasacademy.in/wp-content/uploads/2024/11/WhatsApp-Image-2024-11-16-at-10.34.22-PM-2-1.jpeg',
  imageLabel: '187+ RESULTS · 2022–25',
  badges: [
    { num: '187+',  label: 'Results' },
    { num: '14+',   label: 'Years' },
    { num: '2400+', label: 'Students' },
  ]
}

const MARQUEE_ITEMS = [
  'UPSC CIVIL SERVICES', 'TNPSC GROUP I', 'TNPSC GROUP II', 'TNPSC GROUP IV',
  'TN POLICE SI', 'TN POLICE PC', 'VAO', 'BANKING · IBPS · SBI',
  'PUDUCHERRY UDC · LDC', 'DEPUTY TAHSILDAR', 'SSC CGL', 'RBI GRADE B',
]

function ExamMarquee() {
  return (
    <div className="exam-marquee-strip" aria-hidden="true">
      <div className="exam-marquee-inner">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={i} className="exam-marquee-item">
            <span className="exam-marquee-dot" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const total = el.scrollHeight - el.clientHeight
      setProgress(total > 0 ? (scrolled / total) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className="scroll-progress-bar" style={{ width: `${progress}%` }} aria-hidden="true" />
  )
}

function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible')
      })
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  )
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
  return () => observer.disconnect()
}

export default function Home() {
  const [about, setAbout] = useState(DEFAULT_ABOUT)
  const [visibility, setVisibility] = useState({
    stats: true, about: true, features: true, courses: true, steps: true,
    results: true, gallery: true, testimonials: true, faq: true
  })

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s.homeContent?.about) setAbout(ab => ({ ...DEFAULT_ABOUT, ...s.homeContent.about }))
      if (s.homeContent?.visibility) setVisibility(v => ({ ...v, ...s.homeContent.visibility }))
    })
  }, [])

  useEffect(() => {
    const cleanup = initReveal()
    return () => { cleanup() }
  }, [about])

  return (
    <>
      {/* Scroll progress indicator */}
      <ScrollProgress />

      <Header />

      <main>
        {/* ── HERO: Admin-managed sliding banners ── */}
        <HeroCarousel />

        {/* ── EXAM MARQUEE STRIP ── */}
        {visibility.results !== false && <ExamMarquee />}

        {/* ── STATS BAR ── */}
        {visibility.stats !== false && <StatsBar />}

        {/* ── ABOUT + INTRO ── */}
        {visibility.about !== false && (
          <section className="section about-intro-section" id="about">
            <div className="container">
              <div 
                className="about-intro-grid" 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: visibility.events !== false && about.eventsData?.length !== 0 ? '1fr 1fr' : '1fr',
                  gap: '5rem',
                  alignItems: 'start'
                }}
              >
                
                {/* Left: Introduction text + Image/Badges group */}
                <div 
                  className="reveal about-intro-text"
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: visibility.events !== false ? 'flex-start' : 'center',
                    textAlign: visibility.events !== false ? 'left' : 'center',
                    maxWidth: visibility.events !== false ? 'none' : '800px',
                    margin: visibility.events !== false ? '0' : '0 auto'
                  }}
                >
                  <span className="eyebrow">{about.eyebrow || 'About Nermai'}</span>
                  <h2 className="about-main-heading">
                    {(about.title || DEFAULT_ABOUT.title).split('\n').map((line, i) => (
                      <span key={i}>{line}{i === 0 && <br />}</span>
                    ))}
                  </h2>
                  <div className="about-divider" style={{ margin: visibility.events !== false ? '1.5rem 0' : '1.5rem auto' }} />
                  <p className="about-para">{about.para1}</p>
                  <p className="about-para">{about.para2}</p>
                  
                  <div className="about-stamp" style={{ margin: visibility.events !== false ? '2rem 0' : '2rem auto' }}>
                    <div className="stamp-text">NERMAI</div>
                    <div className="stamp-sub">IAS ACADEMY</div>
                    <div className="stamp-meta">PUDUCHERRY · INDIA · EST. 2011</div>
                  </div>
                  <a href="/why-nermai" className="btn btn-outline about-cta-btn">
                    Our Story <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }} />
                  </a>
                  
                  {/* Image and Badges Group */}
                  <div className="about-img-group" style={{ marginTop: '3rem', width: '100%', maxWidth: '500px' }}>
                    <div className="about-img-frame">
                      {about.imageUrl && (
                        <img
                          src={about.imageUrl}
                          alt={about.imageLabel || 'Nermai IAS Academy Results'}
                          style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                          onError={e => { e.currentTarget.style.display = 'none' }}
                        />
                      )}
                      <div className="about-img-label">{about.imageLabel}</div>
                    </div>
                    
                    <div className="about-badges-row">
                      {(about.badges || []).map((b, i) => (
                        <div key={i} className="about-badge-v2">
                          <span className="about-badge-num">{b.num}</span>
                          <span className="about-badge-label">{b.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Events Calendar */}
                {visibility.events !== false && (
                  <div className="reveal">
                    <EventsCalendar />
                  </div>
                )}
                
              </div>
            </div>
          </section>
        )}

        {/* ── WHAT YOU GET (Features) ── */}
        {visibility.features !== false && <WhatYouGet />}

        {/* ── COURSES ── */}
        {visibility.courses !== false && <Courses />}

        {/* ── WHY NERMAI ── */}
        <WhyNermai />

        {/* ── HOW IT WORKS ── */}
        {visibility.steps !== false && <HowNermaiWorks />}

        {/* ── RESULTS ── */}
        {visibility.results !== false && <Results />}

        {/* ── GALLERY ── */}
        {visibility.gallery !== false && <Gallery />}

        {/* ── TESTIMONIALS ── */}
        {visibility.testimonials !== false && <Testimonials />}

        {/* ── FAQ ── */}
        {visibility.faq !== false && <FAQ />}

        {/* ── FINAL CTA ── */}
        <section className="cta-final-section" id="enroll">
          <div className="cta-final-bg-grid" aria-hidden="true" />
          <div className="container-narrow">
            <div className="cta-final-inner reveal">
              <div className="cta-final-stamp-wrap" aria-hidden="true">
                <div className="cta-final-stamp">
                  <span>ந</span>
                </div>
              </div>
              <span className="eyebrow cta-eyebrow">BEGIN YOUR JOURNEY</span>
              <h2 className="cta-final-heading">
                உங்கள் வெற்றிப் பயணம்<br />
                <em>இன்றே தொடங்கட்டும்.</em>
              </h2>
              <p className="cta-final-sub">
                தேர்வை மட்டும் நோக்கமாகக் கொள்ளாதீர்கள்.<br />
                தயாரிப்பை முறையாகத் தொடங்குங்கள்.
              </p>
              <div className="cta-final-actions">
                <a href={LMS_URL} className="btn btn-primary btn-lg cta-enroll-btn" id="home-enroll-btn" target="_blank" rel="noopener noreferrer">
                  Enroll Now <i className="fa-solid fa-arrow-right" />
                </a>
                <a href="/contact" className="btn btn-ghost btn-lg">
                  Talk to Us
                </a>
              </div>
              <div className="cta-exam-row">
                UPSC · TNPSC · TN POLICE · BANKING · PUDUCHERRY EXAM · SSC
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
