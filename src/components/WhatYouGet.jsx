import { useState, useEffect } from 'react'
import { fbFirestore } from '../firebase/firestore'
import { LMS_URL } from '../constants'

const DEFAULT_FEATURES = [
  { icon: 'fa-solid fa-graduation-cap', title: 'Structured Classes',  desc: 'Daily scheduled classes with expert faculty in Tamil & English medium.' },
  { icon: 'fa-solid fa-book-open',      title: 'Study Materials',     desc: 'Comprehensive study notes and question banks aligned to exam pattern.' },
  { icon: 'fa-solid fa-file-pen',       title: 'Mock Tests',          desc: 'Weekly full-length tests and sectional tests with detailed analysis.' },
  { icon: 'fa-solid fa-chart-line',     title: 'Progress Tracking',   desc: 'Personal performance dashboard to monitor strengths and weaknesses.' },
  { icon: 'fa-regular fa-calendar-check', title: 'Class Schedule',    desc: 'Flexible batch timings for students, working professionals and rural aspirants.' },
  { icon: 'fa-solid fa-user-tie',       title: 'Academic Guidance',   desc: 'One-on-one mentoring sessions with IAS/IPS selected alumni faculty.' },
]

export default function WhatYouGet() {
  const [features, setFeatures] = useState(DEFAULT_FEATURES)

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s.homeContent?.features?.length) setFeatures(s.homeContent.features)
    })
  }, [])

  return (
    <section className="what-section section" style={{ backgroundColor: 'var(--surface)' }}>
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <span className="eyebrow">NERMAI CLASS PLATFORM</span>
          <h2 className="section-title">Nermai Class Platform-ல் என்ன கிடைக்கும்?</h2>
        </div>

        <div className="wyg-grid">
          {features.map((feat, i) => (
            <div
              key={i}
              className="wyg-card reveal"
              style={{ '--reveal-delay': `${i * 60}ms` }}
            >
              <div className="wyg-card-icon">
                <i className={feat.icon} />
              </div>
              <div className="wyg-card-body">
                <h3 className="wyg-card-title">{feat.title}</h3>
                {feat.desc && <p className="wyg-card-desc">{feat.desc}</p>}
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-12)' }}>
          <p style={{ marginBottom: 'var(--space-6)', fontSize: '1.1rem', color: 'var(--gray-600)' }}>
            இவை அனைத்தும் Nermai Class Platform-ல்
          </p>
          <a href={LMS_URL} className="btn btn-primary btn-lg">
            JOIN NERMAI <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }} />
          </a>
        </div>
      </div>
    </section>
  )
}
