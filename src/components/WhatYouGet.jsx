import { useState, useEffect } from 'react'
import { fbFirestore } from '../firebase/firestore'
import * as LucideIcons from 'lucide-react'
import { LMS_URL } from '../constants'
import ResourcesDesk from './ResourcesDesk'

const FA_TO_LUCIDE_MAP = {
  'fa-solid fa-graduation-cap': 'GraduationCap',
  'fa-solid fa-book-open': 'BookOpen',
  'fa-solid fa-file-pen': 'PenTool',
  'fa-solid fa-chart-line': 'LineChart',
  'fa-regular fa-calendar-check': 'CalendarCheck',
  'fa-solid fa-user-tie': 'UserCircle'
}

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

  const visible = features.filter(f => f.visible !== false)

  return (
    <section className="what-section section" style={{ background: 'var(--cream)', overflow: 'hidden' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem', marginBottom: 'clamp(3rem,5vw,5rem)' }}>
          <div>
            <span className="eyebrow" style={{ marginBottom: '1rem', display: 'block' }}>NERMAI CLASS PLATFORM</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3.5rem)', margin: 0, lineHeight: 1.15 }}>
              Everything you need<br />to <em style={{ fontStyle: 'normal', color: 'var(--maroon)' }}>crack the exam.</em>
            </h2>
          </div>
          <a href={LMS_URL} className="btn btn-primary" style={{ flexShrink: 0 }}>
            JOIN NERMAI <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }} />
          </a>
        </div>

        {/* Feature Strip & Resources Grid */}
        <div className="wyg-main-grid">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
          {visible.map((feat, i) => {
            const iconName = FA_TO_LUCIDE_MAP[feat.icon] || feat.icon
            const IconComponent = LucideIcons[iconName] || LucideIcons.Star
            return (
              <div
                key={i}
                className="reveal wyg-strip-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '56px 1fr auto',
                  gap: '2rem',
                  alignItems: 'center',
                  padding: 'clamp(1.5rem,2.5vw,2.25rem) 0',
                  borderTop: '1px solid var(--gray-200)',
                  '--reveal-delay': `${i * 60}ms`,
                }}
              >
                {/* Icon */}
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--maroon-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {feat.imageUrl ? (
                    <img src={feat.imageUrl} alt={feat.title} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                  ) : (
                    <IconComponent size={20} strokeWidth={2.5} color="var(--cream)" />
                  )}
                </div>
                {/* Text */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.3rem', color: 'var(--ink)' }}>{feat.title}</div>
                  {feat.desc && <div style={{ fontSize: '0.9rem', color: 'var(--gray-500)', lineHeight: 1.55 }}>{feat.desc}</div>}
                </div>
                {/* Index */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gray-300)', letterSpacing: '0.08em', flexShrink: 0 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
              </div>
            )
          })}
          <div style={{ borderTop: '1px solid var(--gray-200)' }} />
          </div>

          {/* Resources Widget */}
          <div>
            <ResourcesDesk isWidget={true} />
          </div>
        </div>
      </div>
      <style>{`
        .wyg-main-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 450px), 1fr));
          gap: 4rem;
          align-items: start;
        }
        @media (max-width: 600px) {
          .wyg-main-grid { gap: 2rem; }
          .wyg-strip-row { grid-template-columns: 48px 1fr !important; }
          .wyg-strip-row > *:last-child { display: none; }
        }
      `}</style>
    </section>
  )
}

