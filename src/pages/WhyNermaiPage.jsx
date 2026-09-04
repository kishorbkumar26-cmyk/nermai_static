import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useReveal } from '../hooks/useReveal'
import Header from '../components/Header'
import Footer from '../components/Footer'
import WhyNermaiShowcase from '../components/WhyNermaiShowcase'
import { LMS_URL } from '../constants'

const FEATURES = [
  {
    icon: 'fa-hand-holding-heart',
    title: 'Non Profit Initiative',
    desc: 'Run entirely by volunteers. Our sole mission is to empower rural and economically weaker youth — not to profit from their aspirations.',
  },
  {
    icon: 'fa-book-open',
    title: 'Comprehensive Syllabus Coverage',
    desc: 'Every topic from Prelims to Mains is covered systematically. No gaps, no shortcuts — structured preparation from day one.',
  },
  {
    icon: 'fa-clipboard-check',
    title: 'Regular Test Practice',
    desc: 'Frequent mock tests and topic-wise tests that closely mirror the actual exam pattern to build speed and accuracy.',
  },
  {
    icon: 'fa-user-tie',
    title: 'Personal Guidance / Counseling',
    desc: 'One-on-one mentoring sessions to assess your strengths, address weaknesses, and keep you on the right track.',
  },
  {
    icon: 'fa-laptop-house',
    title: 'Offline & Online',
    desc: 'Attend classes at our Puducherry centre or learn from anywhere via our online platform — flexible learning your way.',
  },
  {
    icon: 'fa-display',
    title: 'Digitally Interactive Classroom',
    desc: 'We have said goodbye to the old marker-board model. Every class is a digitally interactive, multimedia-rich experience.',
  },
  {
    icon: 'fa-trophy',
    title: 'Result Driven Learning',
    desc: '187+ successful candidates across UPSC, TNPSC, Police and Puducherry Recruitments prove that our approach works.',
  },
  {
    icon: 'fa-video',
    title: 'Video Library',
    desc: 'Every class is recorded and uploaded to our cloud library. Revise any topic, any time — no matter what.',
  },
]

const TEAM_SPIRIT = [
  'Volunteers from Nermai Trust',
  'Nermai Samuga Iyakkam',
  'Service-minded teachers',
  'Student communities',
]

export default function WhyNermaiPage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  useReveal()

  return (
    <>
      <Header />
      <main style={{ paddingTop: '80px' }}>

        {/* Page Hero */}
        <section className="page-hero" style={{ backgroundColor: 'var(--maroon)', color: 'var(--white)' }}>
          <div className="container">
            <div className="page-hero-inner">
              <span className="eyebrow" style={{ color: 'var(--saffron)', marginBottom: '1rem', display: 'block' }}>
                WHY NERMAI
              </span>
              <h1 className="display-large" style={{ color: 'var(--white)', marginBottom: '1rem', maxWidth: '650px' }}>
                An Institute Run by Volunteers, For the People
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '600px', lineHeight: 1.8, fontSize: '1.1rem' }}>
                Nermai IAS Academy is not just a coaching centre — it is a social movement to democratise
                access to quality civil services preparation for every aspirant, regardless of economic background.
              </p>
            </div>
          </div>
        </section>

        {/* Mission section */}
        <section className="section" style={{ backgroundColor: 'var(--cream)' }}>
          <div className="container">
            <div className="why-mission-grid">
              <div className="reveal">
                <span className="eyebrow">OUR MISSION</span>
                <h2 className="section-title" style={{ marginTop: '0.5rem' }}>
                  Breaking the Stereotype
                </h2>
                <p style={{ color: 'var(--gray-600)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                  The civil services exam is considered to be the highest and most prestigious job of
                  the country along with its 23 cadres including the Indian Police Service — meant to serve
                  the people with a selfless attitude.
                </p>
                <p style={{ color: 'var(--gray-600)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                  Many institutions collect fees in lakhs, shattering the dreams of poor students.
                  A handful of youth from Puducherry started <strong>NERMAI IAS ACADEMY</strong> to
                  change this stereotype.
                </p>

                <div className="why-team-list">
                  <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--gray-400)', marginBottom: '0.75rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                    Built by
                  </div>
                  {TEAM_SPIRIT.map(t => (
                    <div key={t} className="why-team-item">
                      <i className="fa-solid fa-circle-check" style={{ color: 'var(--maroon)', marginRight: '0.5rem', fontSize: '0.85rem' }} />
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="why-stats-block reveal">
                <div className="why-stat-card">
                  <div className="why-stat-num">187+</div>
                  <div className="why-stat-label">Government Job Results</div>
                  <div className="why-stat-sub">2022 – 2025</div>
                </div>
                <div className="why-stat-card">
                  <div className="why-stat-num">14+</div>
                  <div className="why-stat-label">Years of Service</div>
                  <div className="why-stat-sub">Est. ~2010, Puducherry</div>
                </div>
                <div className="why-stat-card">
                  <div className="why-stat-num">2400+</div>
                  <div className="why-stat-label">Students Trained</div>
                  <div className="why-stat-sub">Across 28+ batches</div>
                </div>
                <div className="why-stat-card">
                  <div className="why-stat-num">₹0</div>
                  <div className="why-stat-label">Profit Motive</div>
                  <div className="why-stat-sub">Non-profit · Non-commercial</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Showcase matching design mockup */}
        <WhyNermaiShowcase />

        {/* CTA */}
        <section className="section" style={{ backgroundColor: 'var(--maroon-deep)', textAlign: 'center' }}>
          <div className="container-narrow reveal">
            <h2 style={{ color: 'var(--white)', marginBottom: '1rem' }}>
              Ready to Be Part of the Movement?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>
              Join thousands of aspirants who chose honest coaching over expensive shortcuts.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={LMS_URL} className="btn btn-primary btn-lg" id="why-enroll-btn">
                Enroll Now <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }} />
              </a>
              <Link to="/courses" className="btn btn-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.3)' }}>
                View Courses
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
