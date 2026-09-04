import React, { useState, useEffect } from 'react'
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

const DEFAULT_FEATURE_DETAILS = [
  {
    number: '01',
    icon: 'GraduationCap',
    title: 'Structured Classes',
    subtitle: 'Live + recorded classes with expert faculty',
    tag: 'FEATURE 01',
    caption: 'Learn from the best, at your own pace.',
    desc: 'Daily scheduled classes covering the complete syllabus with expert faculty in Tamil and English medium. Includes live interactive sessions, recorded classes, doubt clearing and revision sessions.',
    checkpoints: [
      'Expert faculty with years of experience',
      'Live + recorded classes',
      'Tamil & English medium',
      'Exam-oriented teaching approach',
      'Doubt clearing sessions'
    ],
    primaryCta: 'EXPLORE CLASSES',
    secondaryCta: 'View Sample Class',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop',
    quote: 'Well-structured classes made it easy for me to understand complex topics.',
    author: '— M. Karthik, TNPSC Group II (2024)'
  },
  {
    number: '02',
    icon: 'BookOpen',
    title: 'Study Materials',
    subtitle: 'Notes, PDFs, question banks & reference materials',
    tag: 'FEATURE 02',
    caption: 'Comprehensive notes tailored for civil service exams.',
    desc: 'Access structured study materials, topic-wise PDFs, hand-curated question banks, and standard reference materials updated according to the latest exam pattern.',
    checkpoints: [
      'Comprehensive Tamil & English PDF notes',
      'Topic-wise previous year questions',
      'Curated standard textbook summaries',
      'Regular current affairs updates',
      'Downloadable for offline learning'
    ],
    primaryCta: 'GET STUDY MATERIALS',
    secondaryCta: 'View Sample PDF',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1200&auto=format&fit=crop',
    quote: 'The study materials provided by Nermai were concise, exam-focused, and easy to review.',
    author: '— S. Priyadharshini, TNPSC Group I Selected'
  },
  {
    number: '03',
    icon: 'PenTool',
    title: 'Mock Tests',
    subtitle: 'Sectional and full-length tests with detailed analysis',
    tag: 'FEATURE 03',
    caption: 'Simulate the real exam experience before test day.',
    desc: 'Take weekly full-length mock tests and sectional practice tests. Get instant performance analytics, detailed solutions, and rank comparisons.',
    checkpoints: [
      'Weekly full-length exam simulations',
      'Sectional and subject-wise test series',
      'Detailed answer keys & explanations',
      'All-Puducherry & Tamil Nadu rank tracking',
      'Personalized weak-area analysis'
    ],
    primaryCta: 'TAKE MOCK TEST',
    secondaryCta: 'View Test Schedule',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200&auto=format&fit=crop',
    quote: 'Weekly mock tests helped me eliminate exam fear and manage my time effectively.',
    author: '— R. Vimal, TNPSC Group II Rank 14'
  },
  {
    number: '04',
    icon: 'LineChart',
    title: 'Progress Tracking',
    subtitle: 'Track your performance and identify weak areas',
    tag: 'FEATURE 04',
    caption: 'Data-driven insights for smarter preparation.',
    desc: 'Monitor your study hours, score trends, and subject mastery over time with our intuitive student analytics dashboard.',
    checkpoints: [
      'Subject-wise mastery percentages',
      'Time management & speed analytics',
      'Score trend graphs over weeks',
      'Personalized study plan recommendations',
      'Direct feedback from course mentors'
    ],
    primaryCta: 'VIEW DASHBOARD',
    secondaryCta: 'Learn More',
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop',
    quote: 'Tracking my weekly scores helped me focus exactly where I was losing marks.',
    author: '— A. Soundarya, Sub-Inspector Exam 2024'
  },
  {
    number: '05',
    icon: 'CalendarCheck',
    title: 'Class Schedule',
    subtitle: 'Flexible batches for students, professionals and rural aspirants',
    tag: 'FEATURE 05',
    caption: 'Study on your timeline without compromising quality.',
    desc: 'Choose from weekday regular batches, weekend batches for working professionals, or evening online sessions designed for maximum flexibility.',
    checkpoints: [
      'Morning & Evening live batch timings',
      'Special weekend batches for professionals',
      '24/7 access to recorded lectures',
      'Flexible batch transfer options',
      'Structured weekly timetable updates'
    ],
    primaryCta: 'VIEW TIMETABLE',
    secondaryCta: 'Batch Details',
    imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1200&auto=format&fit=crop',
    quote: 'As a working professional, the flexible weekend schedule made my preparation possible.',
    author: '— K. Venkatesh, VAO Selected'
  },
  {
    number: '06',
    icon: 'UserCircle',
    title: 'Academic Guidance',
    subtitle: 'Personal mentoring by IAS/IPS & experienced faculty',
    tag: 'FEATURE 06',
    caption: 'Direct 1-on-1 mentorship throughout your journey.',
    desc: 'Get guidance from selected officers, experienced faculty, and subject experts to clear strategy doubts, stay motivated, and refine your approach.',
    checkpoints: [
      '1-on-1 personal mentorship sessions',
      'Strategy planning with selected alumni',
      'Regular progress reviews & feedback',
      'Answer writing evaluation & review',
      'Motivation and stress management support'
    ],
    primaryCta: 'BOOK MENTOR SESSION',
    secondaryCta: 'Our Faculty',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop',
    quote: 'One-on-one sessions with faculty kept me focused during tough phases of preparation.',
    author: '— P. Divya, TNPSC Group I Mains Aspirant'
  }
]

const KEY_HIGHLIGHTS = [
  { icon: LucideIcons.Tv, title: 'Live + Recorded', sub: 'FLEXIBLE LEARNING' },
  { icon: LucideIcons.GraduationCap, title: 'Expert Faculty', sub: '15+ YEARS EXPERIENCE' },
  { icon: LucideIcons.ShieldCheck, title: 'Exam Focused', sub: 'RESULT ORIENTED' },
  { icon: LucideIcons.Globe, title: 'Tamil & English', sub: 'BILINGUAL SUPPORT' }
]

export default function WhatYouGet() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [featureList, setFeatureList] = useState(DEFAULT_FEATURE_DETAILS)

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s.homeContent?.features?.length) {
        // Merge custom Firestore settings while keeping rich default structure
        const merged = DEFAULT_FEATURE_DETAILS.map((def, idx) => {
          const item = s.homeContent.features[idx]
          if (!item) return def
          return {
            ...def,
            title: item.title || def.title,
            subtitle: item.desc || def.subtitle,
            imageUrl: item.imageUrl || def.imageUrl
          }
        })
        setFeatureList(merged)
      }
    })
  }, [])

  const activeFeat = featureList[activeIndex] || featureList[0]

  return (
    <section className="what-section section" style={{ background: 'var(--cream)', padding: '5rem 1rem', overflow: 'hidden' }}>
      <div style={{ width: '100%', maxWidth: '1560px', margin: '0 auto', padding: '0 clamp(1rem, 2.5vw, 2.5rem)' }}>
        
        {/* Top Header */}
        <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto 4rem' }}>
          <span style={{ 
            fontFamily: 'var(--font-body)', 
            fontSize: '0.8rem', 
            fontWeight: 700, 
            letterSpacing: '0.14em', 
            color: 'var(--maroon)', 
            textTransform: 'uppercase', 
            display: 'block', 
            marginBottom: '0.75rem' 
          }}>
            NERMAI CLASS PLATFORM
          </span>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: 'clamp(2.5rem, 4.5vw, 3.75rem)', 
            fontWeight: 700, 
            color: 'var(--ink)', 
            margin: '0 0 1rem', 
            lineHeight: 1.15 
          }}>
            Everything You Need to Succeed
          </h2>
          <p style={{ 
            fontSize: 'clamp(1.05rem, 1.25vw, 1.2rem)', 
            color: 'var(--gray-600)', 
            lineHeight: 1.6, 
            margin: 0 
          }}>
            A complete learning ecosystem designed for Tamil-medium aspirants, with expert guidance, structured preparation and continuous support.
          </p>
        </div>

        {/* Main 3-Column Interactive Platform Card Showcase */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--gray-200)',
          borderRadius: '24px',
          padding: 'clamp(2rem, 3vw, 3.5rem)',
          boxShadow: '0 16px 50px rgba(26, 16, 8, 0.05)',
          marginBottom: '4rem'
        }}>
          <div className="wyg-platform-grid">
            
            {/* Left Column: 01 to 06 Feature List Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {featureList.map((feat, i) => {
                const isActive = activeIndex === i
                const iconName = FA_TO_LUCIDE_MAP[feat.icon] || feat.icon
                const IconComponent = LucideIcons[iconName] || LucideIcons.BookOpen

                return (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    onMouseEnter={() => setActiveIndex(i)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.25rem',
                      padding: '1.1rem 1.35rem',
                      background: isActive ? 'rgba(123, 27, 46, 0.05)' : 'transparent',
                      border: 'none',
                      borderLeft: isActive ? '4px solid var(--maroon)' : '4px solid transparent',
                      borderRadius: '0 14px 14px 0',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    {/* Number */}
                    <span style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '0.95rem', 
                      fontWeight: 700, 
                      color: isActive ? 'var(--maroon)' : 'var(--gray-400)',
                      minWidth: '24px'
                    }}>
                      {feat.number || String(i + 1).padStart(2, '0')}
                    </span>

                    {/* Icon Circle */}
                    <div style={{ 
                      width: '46px', 
                      height: '46px', 
                      borderRadius: '50%', 
                      background: isActive ? 'var(--maroon)' : 'var(--gray-100)',
                      color: isActive ? 'var(--white)' : 'var(--gray-600)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.25s ease'
                    }}>
                      <IconComponent size={20} strokeWidth={2.2} />
                    </div>

                    {/* Title & Subtitle */}
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: 700, 
                        fontSize: '1.05rem', 
                        color: isActive ? 'var(--ink)' : 'var(--gray-800)',
                        marginBottom: '0.2rem'
                      }}>
                        {feat.title}
                      </div>
                      <div style={{ 
                        fontSize: '0.85rem', 
                        color: 'var(--gray-500)', 
                        lineHeight: 1.45
                      }}>
                        {feat.subtitle}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Middle Column: Active Feature Details */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              padding: '0 0.5rem',
              transition: 'opacity 0.3s ease'
            }}>
              <div>
                <span style={{ 
                  fontSize: '0.78rem', 
                  fontWeight: 700, 
                  letterSpacing: '0.14em', 
                  color: 'var(--saffron-dark)', 
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '0.6rem'
                }}>
                  {activeFeat.tag || `FEATURE 0${activeIndex + 1}`}
                </span>

                <h3 style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontSize: '2.25rem', 
                  fontWeight: 700, 
                  color: 'var(--ink)', 
                  margin: '0 0 0.6rem',
                  lineHeight: 1.2
                }}>
                  {activeFeat.title}
                </h3>

                {activeFeat.caption && (
                  <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--maroon)', marginBottom: '1.25rem' }}>
                    {activeFeat.caption}
                  </p>
                )}

                <p style={{ fontSize: '0.98rem', color: 'var(--gray-600)', lineHeight: 1.65, marginBottom: '2rem' }}>
                  {activeFeat.desc}
                </p>

                {/* Checkpoints */}
                {activeFeat.checkpoints && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.25rem' }}>
                    {activeFeat.checkpoints.map((point, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: 'var(--gray-700)', fontWeight: 500 }}>
                        <i className="fa-solid fa-circle-check" style={{ color: 'var(--maroon)', fontSize: '1rem' }} />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
                <a
                  href={LMS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="btn"
                  style={{
                    background: 'var(--maroon)',
                    color: 'var(--white)',
                    padding: '0.85rem 1.8rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    letterSpacing: '0.04em',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 16px rgba(123, 27, 46, 0.25)'
                  }}
                >
                  {activeFeat.primaryCta || 'EXPLORE CLASSES'} <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.8rem' }} />
                </a>

                {activeFeat.secondaryCta && (
                  <a
                    href={LMS_URL}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: 'transparent',
                      color: 'var(--ink)',
                      border: '1px solid var(--gray-300)',
                      padding: '0.8rem 1.4rem',
                      borderRadius: '10px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <i className="fa-regular fa-circle-play" style={{ color: 'var(--maroon)', fontSize: '0.95rem' }} />
                    {activeFeat.secondaryCta}
                  </a>
                )}
              </div>
            </div>

            {/* Right Column: Feature Image / Mockup & Testimonial Overlay */}
            <div style={{ position: 'relative' }}>
              <div style={{ 
                borderRadius: '20px', 
                overflow: 'hidden', 
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.09)',
                position: 'relative',
                height: '100%',
                minHeight: '440px',
                background: '#1a1008'
              }}>
                <img
                  src={activeFeat.imageUrl}
                  alt={activeFeat.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'opacity 0.3s ease'
                  }}
                />

                {/* Floating Handwritten Style Note Overlay */}
                <div style={{
                  position: 'absolute',
                  top: '1.5rem',
                  right: '1.5rem',
                  background: 'rgba(253, 246, 236, 0.94)',
                  backdropFilter: 'blur(8px)',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '24px',
                  fontStyle: 'italic',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  color: 'var(--maroon-deep)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <i className="fa-solid fa-graduation-cap" style={{ fontSize: '0.9rem' }} />
                  "Your classroom anywhere, anytime"
                </div>

                {/* Bottom Testimonial Quote Box */}
                {activeFeat.quote && (
                  <div style={{
                    position: 'absolute',
                    bottom: '1.25rem',
                    right: '1.25rem',
                    left: '1.25rem',
                    background: 'rgba(74, 14, 28, 0.94)',
                    backdropFilter: 'blur(12px)',
                    color: 'var(--cream)',
                    padding: '1.2rem 1.5rem',
                    borderRadius: '14px',
                    boxShadow: '0 8px 28px rgba(0, 0, 0, 0.28)',
                    border: '1px solid rgba(255, 255, 255, 0.12)'
                  }}>
                    <div style={{ fontSize: '0.95rem', fontStyle: 'italic', lineHeight: 1.45, marginBottom: '0.45rem' }}>
                      "{activeFeat.quote}"
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--saffron-light)', textAlign: 'right' }}>
                      {activeFeat.author}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Key Highlights Bar */}
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--gray-200)',
          borderRadius: '20px',
          padding: '2rem 2.5rem',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.03)',
          marginBottom: '4rem'
        }}>
          <div className="wyg-highlights-grid">
            {KEY_HIGHLIGHTS.map((item, idx) => {
              const IconComp = item.icon
              return (
                <div 
                  key={idx} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1.1rem',
                    padding: '0.5rem 1.25rem',
                    borderRight: idx < KEY_HIGHLIGHTS.length - 1 ? '1px solid var(--gray-200)' : 'none'
                  }}
                  className="highlight-col"
                >
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '12px', 
                    background: 'rgba(123, 27, 46, 0.06)', 
                    color: 'var(--maroon)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0 
                  }}>
                    <IconComp size={24} strokeWidth={2.2} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--ink)' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--gray-500)', textTransform: 'uppercase', marginTop: '0.15rem' }}>
                      {item.sub}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Resources Desk Widget */}
        <div>
          <ResourcesDesk isWidget={true} />
        </div>

      </div>

      <style>{`
        .wyg-platform-grid {
          display: grid;
          grid-template-columns: 360px 1fr 460px;
          gap: 3rem;
          align-items: stretch;
        }
        .wyg-highlights-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        @media (max-width: 1380px) {
          .wyg-platform-grid {
            grid-template-columns: 320px 1fr 400px;
            gap: 2rem;
          }
        }
        @media (max-width: 1180px) {
          .wyg-platform-grid {
            grid-template-columns: 300px 1fr;
          }
          .wyg-platform-grid > *:last-child {
            grid-column: span 2;
          }
        }
        @media (max-width: 900px) {
          .wyg-highlights-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .highlight-col {
            border-right: none !important;
            border-bottom: 1px solid var(--gray-200);
            padding-bottom: 1rem !important;
          }
        }
        @media (max-width: 768px) {
          .wyg-platform-grid {
            grid-template-columns: 1fr;
          }
          .wyg-platform-grid > *:last-child {
            grid-column: span 1;
          }
        }
        @media (max-width: 480px) {
          .wyg-highlights-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  )
}


