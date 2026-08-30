import { useState, useEffect } from 'react'
import { fbFirestore } from '../firebase/firestore'
import * as LucideIcons from 'lucide-react'
import { LMS_URL } from '../constants'

const DEFAULT_FEATURES = [
  { icon: 'GraduationCap', title: 'Structured Classes',  desc: 'Daily scheduled classes with expert faculty in Tamil & English medium.', imageUrl: '', visible: true },
  { icon: 'BookOpen',      title: 'Study Materials',     desc: 'Comprehensive study notes and question banks aligned to exam pattern.', imageUrl: '', visible: true },
  { icon: 'PenTool',       title: 'Mock Tests',          desc: 'Weekly full-length tests and sectional tests with detailed analysis.', imageUrl: '', visible: true },
  { icon: 'LineChart',     title: 'Progress Tracking',   desc: 'Personal performance dashboard to monitor strengths and weaknesses.', imageUrl: '', visible: true },
  { icon: 'CalendarCheck', title: 'Class Schedule',      desc: 'Flexible batch timings for students, working professionals and rural aspirants.', imageUrl: '', visible: true },
  { icon: 'UserCircle',    title: 'Academic Guidance',   desc: 'One-on-one mentoring sessions with IAS/IPS selected alumni faculty.', imageUrl: '', visible: true },
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
          {features.filter(f => f.visible !== false).map((feat, i) => (
            <div
              key={i}
              className="wyg-card reveal"
              style={{ '--reveal-delay': `${i * 60}ms` }}
            >
              <div className="wyg-card-icon">
                {feat.imageUrl ? (
                  <img src={feat.imageUrl} alt={feat.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  (() => {
                    const IconComponent = LucideIcons[feat.icon] || LucideIcons.Star
                    return <IconComponent size={24} strokeWidth={2.5} color="var(--cream)" />
                  })()
                )}
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
