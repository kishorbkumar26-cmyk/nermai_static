import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Hero from '../components/hero/Hero'
import TopTicker from '../components/TopTicker'
import StatsBar from '../components/StatsBar'
import Courses from '../components/Courses'
import WhyNermai from '../components/WhyNermai'
import WhatYouGet from '../components/WhatYouGet'
import Results from '../components/Results'
import Gallery from '../components/Gallery'
import Testimonials from '../components/Testimonials'
import ToppersWall from '../components/ToppersWall'
import OfficeLocations from '../components/OfficeLocations'
import Footer from '../components/Footer'
import EventsCalendar from '../components/EventsCalendar'
import JourneySection from '../components/JourneySection'
import ResourcesDesk from '../components/ResourcesDesk'
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

const DEFAULT_TICKER = {
  visible: true,
  items: [
    { text: 'Classroom GS PCM 2027 - Admission Open', link: '#' },
    { text: 'Online GS PCM 2027 - Admission Open', link: '#' },
    { text: 'StepUp Mentorship 2027 - Admission Open', link: '#' }
  ]
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
  const [ticker, setTicker] = useState(DEFAULT_TICKER)
  const [journeySteps, setJourneySteps] = useState(undefined)
  const [visibility, setVisibility] = useState({
    stats: true, about: true, features: true, courses: true, steps: true,
    results: true, gallery: true, testimonials: true
  })

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s.homeContent?.ticker) setTicker(s.homeContent.ticker)
      if (s.homeContent?.about) setAbout(ab => ({ ...DEFAULT_ABOUT, ...s.homeContent.about }))
      if (s.homeContent?.visibility) setVisibility(v => ({ ...v, ...s.homeContent.visibility }))
      if (s.homeContent?.journeySteps) setJourneySteps(s.homeContent.journeySteps)
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

      <div id="top" />
      <Header activePath="/" />
      <TopTicker ticker={ticker} />

      <main>
        {/* ── HERO: Full-Width Cinematic Banners ── */}
        <Hero />

        {/* ── STATS BAR ── */}
        {visibility.stats !== false && <StatsBar />}

        {/* ── ABOUT + INTRO ── */}
        {visibility.about !== false && (
          <section className="section about-intro-section" id="about">
            <div className="container">
              <div className={`about-intro-grid ${visibility.events !== false && about.eventsData?.length !== 0 ? 'has-events' : ''}`}>
                
                {/* Left: Introduction text + Image/Badges group */}
                <div className={`reveal about-intro-text ${visibility.events !== false ? 'events-active' : 'events-inactive'}`}>
                  <span className="eyebrow">{about.eyebrow || 'About Nermai'}</span>
                  <h2 className="about-main-heading">
                    {(about.title || DEFAULT_ABOUT.title).split('\n').map((line, i) => (
                      <span key={i}>{line}{i === 0 && <br />}</span>
                    ))}
                  </h2>
                  <div className="about-divider" />
                  <p className="about-para">{about.para1}</p>
                  <p className="about-para">{about.para2}</p>
                  
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

        {/* ── YOUR JOURNEY ── */}
        {visibility.steps !== false && <JourneySection steps={journeySteps} />}

        {/* ── RESULTS ── */}
        {visibility.results !== false && <Results />}

        {/* ── TOPPERS WALL ── */}
        <ToppersWall />

        {/* ── GALLERY ── */}
        {visibility.gallery !== false && <Gallery />}

        {/* ── TESTIMONIALS ── */}
        {visibility.testimonials !== false && <Testimonials />}

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
                Your Success Journey<br />
                <em>Starts Today.</em>
              </h2>
              <p className="cta-final-sub">
                Don't just aim for the exam.<br />
                Start your preparation systematically.
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

      <OfficeLocations />
      <Footer />
    </>
  )
}
