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

const DEFAULT_FEATURES_CONFIG = {
  eyebrow: 'NERMAI CLASS PLATFORM',
  title: 'Everything You Need to Succeed',
  subtitle: 'A complete learning ecosystem designed for Tamil-medium aspirants, with expert guidance, structured preparation and continuous support.',
  highlights: [
    { icon: 'Tv', title: 'Live + Recorded', sub: 'FLEXIBLE LEARNING' },
    { icon: 'GraduationCap', title: 'Expert Faculty', sub: '15+ YEARS EXPERIENCE' },
    { icon: 'ShieldCheck', title: 'Exam Focused', sub: 'RESULT ORIENTED' },
    { icon: 'Globe', title: 'Tamil & English', sub: 'BILINGUAL SUPPORT' }
  ]
}

const DEFAULT_FEATURE_DETAILS = [
  {
    number: '01',
    icon: 'GraduationCap',
    title: 'Structured Classes',
    subtitle: 'Daily scheduled classes with expert faculty in Tamil & English medium.',
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
    primaryCtaLink: '',
    secondaryCta: 'View Sample Class',
    secondaryCtaLink: '',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop',
    calloutNote: 'Your classroom anywhere, anytime',
    quote: 'Well-structured classes made it easy for me to understand complex topics.',
    author: '— M. Karthik, TNPSC Group II (2024)',
    visible: true
  },
  {
    number: '02',
    icon: 'BookOpen',
    title: 'Study Materials',
    subtitle: 'Comprehensive study notes and question banks aligned to exam pattern.',
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
    primaryCtaLink: '',
    secondaryCta: 'View Sample PDF',
    secondaryCtaLink: '',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1200&auto=format&fit=crop',
    calloutNote: 'Curated for Tamil Medium',
    quote: 'The study materials provided by Nermai were concise, exam-focused, and easy to review.',
    author: '— S. Priyadharshini, TNPSC Group I Selected',
    visible: true
  },
  {
    number: '03',
    icon: 'PenTool',
    title: 'Mock Tests',
    subtitle: 'Weekly full-length tests and sectional tests with detailed analysis.',
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
    primaryCtaLink: '',
    secondaryCta: 'View Test Schedule',
    secondaryCtaLink: '',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200&auto=format&fit=crop',
    calloutNote: 'Real Exam Simulation',
    quote: 'Weekly mock tests helped me eliminate exam fear and manage my time effectively.',
    author: '— R. Vimal, TNPSC Group II Rank 14',
    visible: true
  },
  {
    number: '04',
    icon: 'LineChart',
    title: 'Progress Tracking',
    subtitle: 'Personal performance dashboard to monitor strengths and weaknesses.',
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
    primaryCtaLink: '',
    secondaryCta: 'Learn More',
    secondaryCtaLink: '',
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop',
    calloutNote: 'AI-Powered Insights',
    quote: 'Tracking my weekly scores helped me focus exactly where I was losing marks.',
    author: '— A. Soundarya, Sub-Inspector Exam 2024',
    visible: true
  },
  {
    number: '05',
    icon: 'CalendarCheck',
    title: 'Class Schedule',
    subtitle: 'Flexible batch timings for students, working professionals and rural aspirants.',
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
    primaryCtaLink: '',
    secondaryCta: 'Batch Details',
    secondaryCtaLink: '',
    imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1200&auto=format&fit=crop',
    calloutNote: 'Weekday & Weekend Batches',
    quote: 'As a working professional, the flexible weekend schedule made my preparation possible.',
    author: '— K. Venkatesh, VAO Selected',
    visible: true
  },
  {
    number: '06',
    icon: 'UserCircle',
    title: 'Academic Guidance',
    subtitle: 'One-on-one mentoring sessions with IAS/IPS selected alumni faculty.',
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
    primaryCtaLink: '',
    secondaryCta: 'Our Faculty',
    secondaryCtaLink: '',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop',
    calloutNote: '1-on-1 Officer Guidance',
    quote: 'One-on-one sessions with faculty kept me focused during tough phases of preparation.',
    author: '— P. Divya, TNPSC Group I Mains Aspirant',
    visible: true
  }
]

export default function WhatYouGet() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [featuresConfig, setFeaturesConfig] = useState(DEFAULT_FEATURES_CONFIG)
  const [featureList, setFeatureList] = useState(DEFAULT_FEATURE_DETAILS)

  useEffect(() => {
    const unsub = fbFirestore.onSettingsChanged(s => {
      // 1. Config (Title, Eyebrow, Subtitle, Highlights)
      if (s.homeContent?.featuresConfig) {
        setFeaturesConfig({
          ...DEFAULT_FEATURES_CONFIG,
          ...s.homeContent.featuresConfig,
          highlights: (s.homeContent.featuresConfig.highlights?.length > 0)
            ? s.homeContent.featuresConfig.highlights
            : DEFAULT_FEATURES_CONFIG.highlights
        })
      }

      // 2. Feature Details
      if (s.homeContent?.featureDetails && Array.isArray(s.homeContent.featureDetails) && s.homeContent.featureDetails.length > 0) {
        const visibleList = s.homeContent.featureDetails.filter(f => f.visible !== false)
        setFeatureList(visibleList.length > 0 ? visibleList : s.homeContent.featureDetails)
      } else if (s.homeContent?.features?.length) {
        // Fallback merge from legacy features array
        const merged = DEFAULT_FEATURE_DETAILS.map((def, idx) => {
          const item = s.homeContent.features[idx]
          if (!item) return def
          return {
            ...def,
            title: item.title || def.title,
            subtitle: item.desc || def.subtitle,
            imageUrl: item.imageUrl || def.imageUrl,
            icon: item.icon || def.icon,
            visible: item.visible !== false
          }
        })
        setFeatureList(merged.filter(f => f.visible !== false))
      }
    })
    return () => { if (typeof unsub === 'function') unsub() }
  }, [])

  const activeFeat = featureList[activeIndex] || featureList[0] || DEFAULT_FEATURE_DETAILS[0]

  return (
    <section className="what-section section" style={{ background: 'var(--cream)', overflow: 'hidden' }}>
      <div className="wyg-main-container" style={{ width: '100%', maxWidth: '1680px', margin: '0 auto' }}>
        
        {/* Top Header (100% Customizable) */}
        <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto 3rem' }}>
          {featuresConfig.eyebrow && (
            <span style={{ 
              fontFamily: 'var(--font-body)', 
              fontSize: '0.8rem', 
              fontWeight: 700, 
              letterSpacing: '0.14em', 
              color: 'var(--maroon)', 
              textTransform: 'uppercase', 
              display: 'block', 
              marginBottom: '0.5rem' 
            }}>
              {featuresConfig.eyebrow}
            </span>
          )}

          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: 'clamp(2.25rem, 4vw, 3.4rem)', 
            fontWeight: 700, 
            color: 'var(--ink)', 
            margin: '0 0 0.75rem', 
            lineHeight: 1.15 
          }}>
            {featuresConfig.title}
          </h2>

          {featuresConfig.subtitle && (
            <p style={{ 
              fontSize: 'clamp(1rem, 1.1vw, 1.15rem)', 
              color: 'var(--gray-600)', 
              lineHeight: 1.55, 
              margin: 0 
            }}>
              {featuresConfig.subtitle}
            </p>
          )}
        </div>

        {/* Main 3-Column Interactive Platform Card Showcase */}
        <div 
          className="wyg-platform-card-wrap"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--gray-200)',
            borderRadius: '24px',
            padding: '1.75rem 2.25rem',
            boxShadow: '0 16px 50px rgba(26, 16, 8, 0.05)',
            marginBottom: '3rem'
          }}
        >
          <div className="wyg-platform-grid">
            
            {/* Left Column: 01 to 06 Feature List Selector (2 columns on mobile) */}
            <div className="wyg-feature-selector-list">
              {featureList.map((feat, i) => {
                const isActive = activeIndex === i
                const iconName = FA_TO_LUCIDE_MAP[feat.icon] || feat.icon
                const IconComponent = LucideIcons[iconName] || LucideIcons.BookOpen

                return (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    onPointerDown={() => setActiveIndex(i)}
                    onMouseEnter={() => {
                      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: hover)').matches) {
                        setActiveIndex(i)
                      }
                    }}
                    className={`wyg-feature-selector-item ${isActive ? 'active' : ''}`}
                    type="button"
                    aria-pressed={isActive}
                    aria-label={`Select ${feat.title}`}
                  >
                    <div className="wyg-feat-top-meta">
                      {/* Number */}
                      <span className="wyg-feat-number">
                        {feat.number || String(i + 1).padStart(2, '0')}
                      </span>

                      {/* Icon Circle */}
                      <div className="wyg-feat-icon-circle">
                        <IconComponent size={18} strokeWidth={2.2} />
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <div className="wyg-feat-text-wrap">
                      <div className="wyg-feat-title">
                        {feat.title}
                      </div>
                      <div className="wyg-feat-subtitle">
                        {feat.subtitle}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Middle Column: Active Feature Details */}
            <div 
              key={`detail-${activeIndex}`}
              className="wyg-detail-column"
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                padding: '0 0.75rem',
                animation: 'wygDetailFade 0.25s ease-out'
              }}
            >
              <div>
                <span style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: 800, 
                  letterSpacing: '0.14em', 
                  color: 'var(--saffron-dark)', 
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '0.45rem'
                }}>
                  {activeFeat.tag || `FEATURE 0${activeIndex + 1}`}
                </span>

                <h3 style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontSize: '2.3rem', 
                  fontWeight: 800, 
                  color: 'var(--ink)', 
                  margin: '0 0 0.5rem',
                  lineHeight: 1.15
                }}>
                  {activeFeat.title}
                </h3>

                {activeFeat.caption && (
                  <p style={{ fontSize: '1.12rem', fontWeight: 700, color: 'var(--maroon)', marginBottom: '0.95rem' }}>
                    {activeFeat.caption}
                  </p>
                )}

                <p style={{ fontSize: '1.08rem', color: 'var(--gray-800)', lineHeight: 1.72, marginBottom: '1.4rem', fontWeight: 450 }}>
                  {activeFeat.desc}
                </p>

                {/* Checkpoints */}
                {activeFeat.checkpoints && activeFeat.checkpoints.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
                    {activeFeat.checkpoints.map((point, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.04rem', color: 'var(--ink)', fontWeight: 600 }}>
                        <i className="fa-solid fa-circle-check" style={{ color: 'var(--maroon)', fontSize: '1.05rem' }} />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem', marginTop: '0.75rem' }}>
                <a
                  href={activeFeat.primaryCtaLink || LMS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="btn"
                  style={{
                    background: 'var(--maroon)',
                    color: 'var(--white)',
                    padding: '0.85rem 1.8rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    letterSpacing: '0.04em',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 16px rgba(123, 27, 46, 0.25)'
                  }}
                >
                  {activeFeat.primaryCta || 'EXPLORE CLASSES'} <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.85rem' }} />
                </a>

                {activeFeat.secondaryCta && (
                  <a
                    href={activeFeat.secondaryCtaLink || LMS_URL}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: 'transparent',
                      color: 'var(--ink)',
                      border: '1.5px solid var(--gray-400)',
                      padding: '0.8rem 1.4rem',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <i className="fa-regular fa-circle-play" style={{ color: 'var(--maroon)', fontSize: '1rem' }} />
                    {activeFeat.secondaryCta}
                  </a>
                )}
              </div>
            </div>

            {/* Right Column: Feature Image / Mockup & Testimonial Overlay */}
            <div key={`img-${activeIndex}`} style={{ position: 'relative', animation: 'wygDetailFade 0.25s ease-out' }}>
              <div style={{ 
                borderRadius: '18px', 
                overflow: 'hidden', 
                boxShadow: '0 14px 36px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                height: '380px',
                background: '#1a1008'
              }}>
                <img
                  src={activeFeat.imageUrl || DEFAULT_FEATURE_DETAILS[0].imageUrl}
                  alt={activeFeat.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'opacity 0.3s ease'
                  }}
                />

                {/* Floating Note Overlay */}
                {activeFeat.calloutNote && (
                  <div style={{
                    position: 'absolute',
                    top: '1.1rem',
                    right: '1.1rem',
                    background: 'rgba(253, 246, 236, 0.96)',
                    backdropFilter: 'blur(8px)',
                    padding: '0.6rem 1.15rem',
                    borderRadius: '24px',
                    fontStyle: 'italic',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    color: 'var(--maroon-deep)',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <i className="fa-solid fa-graduation-cap" style={{ fontSize: '0.95rem' }} />
                    "{activeFeat.calloutNote}"
                  </div>
                )}

                {/* Bottom Testimonial Quote Box */}
                {activeFeat.quote && (
                  <div style={{
                    position: 'absolute',
                    bottom: '1rem',
                    right: '1rem',
                    left: '1rem',
                    background: 'rgba(74, 14, 28, 0.95)',
                    backdropFilter: 'blur(12px)',
                    color: 'var(--cream)',
                    padding: '1.1rem 1.4rem',
                    borderRadius: '14px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}>
                    <div style={{ fontSize: '1rem', fontStyle: 'italic', lineHeight: 1.5, marginBottom: '0.45rem', color: '#FFFBF5', fontWeight: 500 }}>
                      "{activeFeat.quote}"
                    </div>
                    {activeFeat.author && (
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--saffron-light)', textAlign: 'right' }}>
                        {activeFeat.author}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Key Highlights Bar */}
        {featuresConfig.highlights && featuresConfig.highlights.length > 0 && (
          <div 
            className="wyg-highlights-wrap"
            style={{
              background: 'var(--white)',
              border: '1px solid var(--gray-200)',
              borderRadius: '20px',
              padding: '1.75rem 2.25rem',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.03)',
              marginBottom: '3.5rem'
            }}
          >
            <div className="wyg-highlights-grid">
              {featuresConfig.highlights.map((item, idx) => {
                const IconComp = LucideIcons[item.icon] || LucideIcons.Tv
                return (
                  <div 
                    key={idx} 
                    className="highlight-col"
                  >
                    <div className="highlight-icon-box">
                      <IconComp size={22} strokeWidth={2.2} />
                    </div>
                    <div className="highlight-text-box">
                      <div className="highlight-title">
                        {item.title}
                      </div>
                      <div className="highlight-sub">
                        {item.sub}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Resources Desk Widget */}
        <div>
          <ResourcesDesk isWidget={true} />
        </div>

      </div>

      <style>{`
        .what-section {
          padding: 4rem 1rem;
        }
        .wyg-main-container {
          padding: 0 clamp(1rem, 2.5vw, 2.5rem);
        }
        .wyg-platform-grid {
          display: grid;
          grid-template-columns: 380px 1fr 500px;
          gap: 2.5rem;
          align-items: center;
        }
        .wyg-highlights-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        .highlight-col {
          display: flex;
          align-items: center;
          gap: 1.1rem;
          padding: 0.4rem 1.25rem;
          border-right: 1px solid var(--gray-200);
        }
        .highlight-col:last-child {
          border-right: none;
        }
        .highlight-icon-box {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: rgba(123, 27, 46, 0.08);
          color: var(--maroon);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .highlight-title {
          font-weight: 800;
          font-size: 1.08rem;
          color: var(--ink);
        }
        .highlight-sub {
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: var(--gray-700);
          text-transform: uppercase;
          margin-top: 0.15rem;
        }

        /* ── Feature List Selector (Desktop) ── */
        .wyg-feature-selector-list {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .wyg-feature-selector-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1.15rem;
          background: transparent;
          border: none;
          border-left: 4px solid transparent;
          border-radius: 0 12px 12px 0;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
        .wyg-feature-selector-item * {
          pointer-events: none;
        }
        .wyg-feature-selector-item.active {
          background: rgba(123, 27, 46, 0.07);
          border-left-color: var(--maroon);
        }
        .wyg-feat-top-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-shrink: 0;
        }
        .wyg-feat-number {
          font-family: var(--font-mono);
          font-size: 1rem;
          font-weight: 800;
          color: var(--gray-500);
          min-width: 24px;
        }
        .wyg-feature-selector-item.active .wyg-feat-number {
          color: var(--maroon);
        }
        .wyg-feat-icon-circle {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: var(--gray-100);
          color: var(--gray-700);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }
        .wyg-feature-selector-item.active .wyg-feat-icon-circle {
          background: var(--maroon);
          color: var(--white);
        }
        .wyg-feat-text-wrap {
          flex: 1;
        }
        .wyg-feat-title {
          font-weight: 700;
          font-size: 1.06rem;
          color: var(--gray-800);
          margin-bottom: 0.15rem;
        }
        .wyg-feature-selector-item.active .wyg-feat-title {
          color: var(--ink);
        }
        .wyg-feat-subtitle {
          font-size: 0.92rem;
          font-weight: 500;
          color: var(--gray-600);
          line-height: 1.4;
        }
        .wyg-feature-selector-item.active .wyg-feat-subtitle {
          color: var(--gray-700);
        }

        @media (max-width: 1380px) {
          .wyg-platform-grid {
            grid-template-columns: 340px 1fr 440px;
            gap: 2rem;
          }
        }
        @media (max-width: 1180px) {
          .wyg-platform-grid {
            grid-template-columns: 320px 1fr;
          }
          .wyg-platform-grid > *:last-child {
            grid-column: span 2;
          }
        }
        @media (max-width: 768px) {
          .what-section {
            padding: 2.25rem 0.5rem !important;
          }
          .wyg-main-container {
            padding: 0 0.2rem !important;
          }
          .wyg-platform-card-wrap {
            padding: 0.95rem 0.65rem !important;
            border-radius: 18px !important;
          }
          .wyg-platform-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
          .wyg-platform-grid > *:last-child {
            grid-column: span 1;
          }

          /* ── 2 COLUMN CARDS ON MOBILE WITH INCREASED READABLE FONT & SIZE ── */
          .wyg-feature-selector-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.65rem;
          }
          .wyg-feature-selector-item {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            padding: 0.85rem 0.8rem 0.8rem;
            border-radius: 14px;
            border: 1.5px solid var(--gray-200);
            border-left: 1.5px solid var(--gray-200);
            background: #FAF7F2;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
            min-height: 124px;
            box-sizing: border-box;
            width: 100%;
          }
          .wyg-feature-selector-item.active {
            background: rgba(123, 27, 46, 0.08);
            border: 1.5px solid var(--maroon);
            border-left: 3.5px solid var(--maroon);
            box-shadow: 0 4px 14px rgba(123, 27, 46, 0.12);
          }
          .wyg-feat-top-meta {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            margin-bottom: 0.45rem;
            gap: 0;
          }
          .wyg-feat-number {
            font-size: 0.95rem;
            font-weight: 800;
            min-width: unset;
          }
          .wyg-feat-icon-circle {
            width: 34px;
            height: 34px;
            border-radius: 8px;
          }
          .wyg-feat-icon-circle svg {
            width: 17px;
            height: 17px;
          }
          .wyg-feat-title {
            font-size: 0.96rem;
            line-height: 1.25;
            margin-bottom: 0.28rem;
            font-weight: 700;
            color: var(--ink);
          }
          /* Clamped to 3 lines for clear readability with good font size */
          .wyg-feat-subtitle {
            font-size: 0.82rem;
            line-height: 1.35;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            color: var(--gray-700);
          }

          /* ── HIGHLIGHTS BAR 2*2 IN MOBILE VIEW ── */
          .wyg-highlights-wrap {
            padding: 0.95rem 0.65rem !important;
            border-radius: 18px !important;
            margin-bottom: 2rem !important;
          }
          .wyg-highlights-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.65rem !important;
          }
          .highlight-col {
            border-right: none !important;
            border-bottom: none !important;
            padding: 0.8rem 0.75rem !important;
            background: #FAF7F2 !important;
            border: 1.5px solid var(--gray-200) !important;
            border-radius: 14px !important;
            gap: 0.7rem !important;
            display: flex !important;
            align-items: center !important;
            box-sizing: border-box !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03) !important;
            min-height: 68px !important;
          }
          .highlight-icon-box {
            width: 38px !important;
            height: 38px !important;
            border-radius: 10px !important;
            flex-shrink: 0 !important;
          }
          .highlight-icon-box svg {
            width: 19px !important;
            height: 19px !important;
          }
          .highlight-title {
            font-size: 0.88rem !important;
            line-height: 1.25 !important;
            font-weight: 750 !important;
          }
          .highlight-sub {
            font-size: 0.68rem !important;
            letter-spacing: 0.04em !important;
            margin-top: 0.15rem !important;
          }
        }

        @media (max-width: 420px) {
          .what-section {
            padding: 1.75rem 0.25rem !important;
          }
          .wyg-main-container {
            padding: 0 !important;
          }
          .wyg-platform-card-wrap {
            padding: 0.85rem 0.45rem !important;
          }
          .wyg-feature-selector-list {
            gap: 0.45rem;
          }
          .wyg-feature-selector-item {
            padding: 0.75rem 0.65rem 0.7rem;
            min-height: 116px;
          }
          .wyg-feat-title {
            font-size: 0.9rem;
          }
          .wyg-feat-subtitle {
            font-size: 0.78rem;
            line-height: 1.3;
          }

          .wyg-highlights-wrap {
            padding: 0.85rem 0.45rem !important;
          }
          .wyg-highlights-grid {
            gap: 0.45rem !important;
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .highlight-col {
            padding: 0.65rem 0.5rem !important;
            gap: 0.45rem !important;
            min-height: 64px !important;
          }
          .highlight-icon-box {
            width: 32px !important;
            height: 32px !important;
          }
          .highlight-icon-box svg {
            width: 16px !important;
            height: 16px !important;
          }
          .highlight-title {
            font-size: 0.82rem !important;
          }
          .highlight-sub {
            font-size: 0.64rem !important;
          }
        }

        @keyframes wygDetailFade {
          from {
            opacity: 0.35;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}
