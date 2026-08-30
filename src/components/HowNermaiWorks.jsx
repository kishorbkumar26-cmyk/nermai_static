import { useState, useEffect } from 'react'
import { fbFirestore } from '../firebase/firestore'
import { LMS_URL } from '../constants'

const STEP_STYLES = [
  { bg: 'var(--saffron)',    color: 'var(--white)',      border: false },
  { bg: 'var(--white)',      color: 'var(--saffron)',    border: true  },
  { bg: 'var(--maroon)',     color: 'var(--white)',      border: false },
  { bg: 'var(--white)',      color: 'var(--gray-500)',   border: true  },
  { bg: '#047857',           color: 'var(--white)',      border: false },
]

const DEFAULT_STEPS = [
  { num: '01', title: 'உங்கள் இலக்கை தேர்வு செய்யுங்கள்', desc: 'Choose from TNPSC, UPSC, Police or Banking on our Website.' },
  { num: '02', title: 'பயிற்சியை தேர்வு செய்யுங்கள்',        desc: 'Find the right batch and course structure for your needs.' },
  { num: '03', title: 'Join Class Platform',                    desc: 'Redirect to our dedicated learning management portal.' },
  { num: '04', title: 'பயிற்சி + தேர்வுகள்',                   desc: 'Attend classes, take mock tests, and track your progress.' },
  { num: '05', title: 'இலக்கை அடையுங்கள்',                    desc: 'Clear the exam and become a Government Officer.' },
]

export default function HowNermaiWorks() {
  const [steps, setSteps] = useState(DEFAULT_STEPS)

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s.homeContent?.steps?.length) setSteps(s.homeContent.steps)
    })
  }, [])

  return (
    <section className="how-section section" style={{ backgroundColor: 'var(--white)' }}>
      <div className="container-narrow">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
          <span className="eyebrow">YOUR JOURNEY</span>
          <h2 className="section-title">நேர்மையுடன் உங்கள் பயணம்</h2>
          <p className="section-desc">
            How our two platforms work together to guarantee your success.
          </p>
        </div>

        <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
          {/* Vertical connector */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '23px', width: '2px', backgroundColor: 'var(--gray-200)', zIndex: 0 }} />

          {steps.map((step, i) => {
            const style = STEP_STYLES[i % STEP_STYLES.length]
            return (
              <div
                key={i}
                className="journey-step reveal"
                style={{ display: 'flex', gap: 'var(--space-6)', marginBottom: 'var(--space-10)', position: 'relative', zIndex: 1, '--reveal-delay': `${i * 80}ms` }}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  backgroundColor: style.bg,
                  color: style.color,
                  border: style.border ? `2px solid ${style.color}` : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontWeight: 700, fontFamily: 'var(--font-mono)'
                }}>
                  {step.num}
                </div>
                <div style={{ paddingTop: '10px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '4px', color: i === 4 ? '#047857' : 'var(--ink)' }}>
                    {step.title}
                  </h3>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-12)' }}>
          <a href={LMS_URL} className="btn btn-primary btn-lg">
            JOIN NERMAI <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }} />
          </a>
        </div>
      </div>
    </section>
  )
}
