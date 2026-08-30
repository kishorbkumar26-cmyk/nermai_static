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
import { LMS_URL } from '../constants'
import { fbFirestore } from '../firebase/firestore'

const DEFAULT_ABOUT = {
  eyebrow: 'About Nermai',
  title: 'Introduction to Nermai IAS',
  para1: 'The very basic purpose of starting this academy is that the civil services exam is considered to be the highest and most prestigious job of the country along with its 23 cadres including the Indian police service. They are meant to serve the people with a selfless attitude.',
  para2: 'This exam has also proved to be the toughest exam out of all the competitive examinations. Keeping this fact in mind, a handful of youth from Puducherry started NERMAI IAS ACADEMY to change this stereotype and make quality coaching accessible to all.',
  imageUrl: 'https://nermaiiasacademy.in/wp-content/uploads/2024/11/WhatsApp-Image-2024-11-16-at-10.34.22-PM-2-1.jpeg',
  imageLabel: '187+ RESULTS · 2022–25',
  badges: [
    { num: '187+',  label: 'Results' },
    { num: '14+',   label: 'Years' },
    { num: '2400+', label: 'Students' },
  ]
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

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s.homeContent?.about) setAbout(ab => ({ ...ab, ...s.homeContent.about }))
    })
  }, [])

  useEffect(() => {
    const cleanup = initReveal()
    return () => { cleanup() }
  }, [about])

  return (
    <>
      <Header />

      <main>
        {/* ── HERO: Admin-managed sliding banners ── */}
        <HeroCarousel />

        {/* ── STATS BAR ── */}
        <StatsBar />

        {/* ── ABOUT + INTRO ── */}
        <section className="section about-intro-section" id="about">
          <div className="container">
            <div className="about-intro-grid">
              {/* Left: results image */}
              <div className="reveal about-intro-img-wrap">
                <div className="brut-frame">
                  {about.imageUrl && (
                    <img
                      src={about.imageUrl}
                      alt={about.imageLabel || 'Nermai IAS Academy Results'}
                      style={{ width: '100%', display: 'block' }}
                      onError={e => { e.currentTarget.style.display = 'none' }}
                    />
                  )}
                  <div className="brut-frame-label">{about.imageLabel}</div>
                </div>
              </div>

              {/* Right: Introduction text */}
              <div className="reveal about-intro-text">
                <span className="eyebrow" style={{ color: 'var(--maroon)' }}>{about.eyebrow}</span>
                <h2 className="section-title" style={{ marginTop: 'var(--space-2)' }}>
                  {about.title}
                </h2>
                <p style={{ color: 'var(--gray-600)', lineHeight: 1.8, marginBottom: 'var(--space-4)' }}>
                  {about.para1}
                </p>
                <p style={{ color: 'var(--gray-600)', lineHeight: 1.8, marginBottom: 'var(--space-6)' }}>
                  {about.para2}
                </p>
                <div className="about-badges">
                  {(about.badges || []).map((b, i) => (
                    <div key={i} className="about-badge">
                      <span className="about-badge-num">{b.num}</span>
                      <span className="about-badge-label">{b.label}</span>
                    </div>
                  ))}
                </div>
                <a href="/why-nermai" className="btn btn-outline" style={{ marginTop: 'var(--space-6)' }}>
                  Continue Read <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }} />
                </a>
              </div>
            </div>
          </div>
        </section>


        {/* ── WHAT YOU GET (8-feature grid) ── */}
        <WhatYouGet />

        {/* ── COURSES ── */}
        <Courses />

        {/* ── WHY NERMAI ── */}
        <WhyNermai />

        {/* ── HOW IT WORKS ── */}
        <HowNermaiWorks />

        {/* ── RESULTS / TOPPERS ── */}
        <Results />

        {/* ── GALLERY ── */}
        <Gallery />

        {/* ── TESTIMONIALS ── */}
        <Testimonials />

        {/* ── FAQ ── */}
        <FAQ />

        {/* ── FINAL CTA ── */}
        <section className="section cta-final" style={{ backgroundColor: 'var(--maroon-deep)', color: 'var(--white)', textAlign: 'center' }}>
          <div className="container-narrow reveal">
            <span className="eyebrow" style={{ color: 'var(--saffron)', marginBottom: 'var(--space-4)', display: 'block' }}>
              BEGIN YOUR JOURNEY
            </span>
            <h2 className="display-large" style={{ color: 'var(--white)', marginBottom: 'var(--space-4)' }}>
              உங்கள் வெற்றிப் பயணம்<br />இன்றே தொடங்கட்டும்.
            </h2>
            <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.75)', marginBottom: 'var(--space-8)', maxWidth: '500px', margin: '0 auto var(--space-8)' }}>
              தேர்வை மட்டும் நோக்கமாகக் கொள்ளாதீர்கள். தயாரிப்பை முறையாகத் தொடங்குங்கள்.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={LMS_URL} className="btn btn-primary btn-lg" id="home-enroll-btn">
                Enroll Now <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }} />
              </a>
              <a href="/contact" className="btn btn-lg" style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.3)' }}>
                Contact Us
              </a>
            </div>
            <div style={{ marginTop: 'var(--space-8)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>
              UPSC · TNPSC · TN POLICE · BANKING · PUDUCHERRY EXAM
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
