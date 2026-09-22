import React, { useState, useEffect } from 'react'
import { 
  Heart, BookOpen, ClipboardCheck, UserCheck, Laptop, Trophy, 
  Users, GraduationCap, TrendingUp, ArrowRight, ShieldCheck, 
  Target, Award, Sparkles, Star, CheckCircle, Flame, Compass, Zap
} from 'lucide-react'
import { fbFirestore, DEFAULT_WHY_NERMAI_SHOWCASE } from '../firebase/firestore'
import { LMS_URL } from '../constants'
import './WhyNermaiShowcase.css'

const ICON_MAP = {
  Heart,
  BookOpen,
  ClipboardCheck,
  UserCheck,
  Laptop,
  Trophy,
  Users,
  GraduationCap,
  TrendingUp,
  ShieldCheck,
  Target,
  Award,
  Sparkles,
  Star,
  CheckCircle,
  Flame,
  Compass,
  Zap
}

export default function WhyNermaiShowcase({ data: propData }) {
  const [data, setData] = useState(propData || DEFAULT_WHY_NERMAI_SHOWCASE)
  const [flippedCards, setFlippedCards] = useState({})

  useEffect(() => {
    if (propData) {
      setData({
        ...DEFAULT_WHY_NERMAI_SHOWCASE,
        ...propData,
        steps: Array.isArray(propData.steps) && propData.steps.length > 0
          ? propData.steps
          : DEFAULT_WHY_NERMAI_SHOWCASE.steps
      })
      return
    }

    const unsub = fbFirestore.onSettingsChanged((settings) => {
      if (settings?.whyNermaiShowcase) {
        setData({
          ...DEFAULT_WHY_NERMAI_SHOWCASE,
          ...settings.whyNermaiShowcase,
          steps: Array.isArray(settings.whyNermaiShowcase.steps) && settings.whyNermaiShowcase.steps.length > 0
            ? settings.whyNermaiShowcase.steps
            : DEFAULT_WHY_NERMAI_SHOWCASE.steps
        })
      }
    })
    return () => unsub()
  }, [propData])

  const handleCardClick = (num) => {
    // Only toggle flip on mobile screens <= 768px
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setFlippedCards(prev => ({
        ...prev,
        [num]: !prev[num]
      }))
    }
  }

  const steps = data.steps || DEFAULT_WHY_NERMAI_SHOWCASE.steps

  return (
    <section className="why-showcase-section" id="features">
      {/* Background Building Watermark */}
      <div className="why-building-watermark" aria-hidden="true">
        <svg viewBox="0 0 400 300" fill="currentColor">
          {/* Dome & Pillars Heritage Silhouette */}
          <path d="M200 30 C170 30 150 60 140 90 L260 90 C250 60 230 30 200 30 Z" />
          <rect x="195" y="10" width="10" height="20" rx="2" />
          <polygon points="200,2 196,10 204,10" />
          <rect x="130" y="90" width="140" height="15" />
          <rect x="120" y="105" width="160" height="8" />
          {/* Columns */}
          <rect x="135" y="113" width="10" height="110" />
          <rect x="160" y="113" width="10" height="110" />
          <rect x="185" y="113" width="10" height="110" />
          <rect x="205" y="113" width="10" height="110" />
          <rect x="230" y="113" width="10" height="110" />
          <rect x="255" y="113" width="10" height="110" />
          {/* Base */}
          <rect x="110" y="223" width="180" height="15" />
          <rect x="90" y="238" width="220" height="20" />
          {/* Side Wings */}
          <rect x="40" y="140" width="80" height="83" />
          <rect x="280" y="140" width="80" height="83" />
          <rect x="50" y="160" width="18" height="35" rx="9" fill="#FAF6EE" />
          <rect x="82" y="160" width="18" height="35" rx="9" fill="#FAF6EE" />
          <rect x="295" y="160" width="18" height="35" rx="9" fill="#FAF6EE" />
          <rect x="327" y="160" width="18" height="35" rx="9" fill="#FAF6EE" />
        </svg>
      </div>

      <div className="container-wide" style={{ maxWidth: '1540px', width: '100%', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 2 }}>
        
        {/* Header */}
        <div className="why-showcase-header">
          <div className="why-showcase-eyebrow">
            {data.eyebrow || 'OUR FEATURES'}
          </div>
          <h2 className="why-showcase-title">
            {data.title || 'What Makes Nermai Different'}
          </h2>
          <p className="why-showcase-subtitle">
            {data.subtitle || 'Every aspect of our academy is designed around one purpose — your success.'}
          </p>
        </div>

        {/* 6-Step Wavy Flow */}
        <div className="why-flow-container">
          
          {/* SVG Sine Wave Path with Gold Connector Dots */}
          <svg className="why-wave-svg" viewBox="0 0 1200 80" preserveAspectRatio="none">
            <path 
              d="M 10,40 C 40,65 70,65 100,40 C 150,15 250,15 300,40 C 350,65 450,65 500,40 C 550,15 650,15 700,40 C 750,65 850,65 900,40 C 950,15 1050,15 1100,40 C 1130,65 1170,65 1190,40" 
              fill="none" 
              stroke="#D4AF37" 
              strokeWidth="2.5" 
              strokeDasharray="6,6" 
              opacity="0.75"
            />
            {/* Connector Gold Dots */}
            <circle cx="20" cy="40" r="5" fill="#D4AF37" />
            <circle cx="200" cy="22" r="5" fill="#996515" />
            <circle cx="400" cy="58" r="5" fill="#996515" />
            <circle cx="600" cy="22" r="5" fill="#996515" />
            <circle cx="800" cy="58" r="5" fill="#996515" />
            <circle cx="1000" cy="22" r="5" fill="#996515" />
            <circle cx="1180" cy="40" r="5" fill="#D4AF37" />
          </svg>

          {/* 6 Step Columns */}
          <div className="why-steps-grid">
            {steps.map((step, idx) => {
              const IconComp = ICON_MAP[step.icon] || Trophy
              const isFlipped = !!flippedCards[step.num || idx]
              const circleClass = step.circleStyle || (idx % 2 === 0 ? 'circle-maroon' : 'circle-cream')

              return (
                <div 
                  key={step.id || step.num || idx} 
                  className={`why-step-col reveal visible ${isFlipped ? 'is-flipped' : ''}`}
                  onClick={() => handleCardClick(step.num || idx)}
                >
                  <div className="why-card-flip-inner">
                    {/* Front Face: Logo and Topic Alone (Mobile default, Desktop full) */}
                    <div className="why-card-front">
                      <div className="why-step-number">{step.num || `0${idx + 1}`}</div>
                      <div className={`why-step-circle ${circleClass}`}>
                        <IconComp size={28} />
                      </div>
                      <h3 className="why-step-title">{step.title}</h3>
                      <div className="why-title-underline" />
                      {/* Desktop displays description directly here */}
                      <p className="why-step-desc why-desktop-desc">{step.desc}</p>
                      {/* Mobile hint */}
                      <div className="why-card-tap-hint why-mobile-hint">
                        <span>Tap for details</span>
                        <i className="fa-solid fa-arrow-right-arrow-left" style={{ fontSize: '0.62rem' }} />
                      </div>
                    </div>

                    {/* Back Face: Content of the Card (Mobile only) */}
                    <div className="why-card-back why-mobile-back">
                      <div className="why-back-top-row">
                        <span className="why-back-num">{step.num || `0${idx + 1}`}</span>
                        <h4 className="why-back-topic">{step.title}</h4>
                      </div>
                      <div className="why-title-underline" style={{ margin: '0.25rem 0 0.55rem 0', width: '28px' }} />
                      <p className="why-step-desc why-mobile-desc">{step.desc}</p>
                      <div className="why-card-tap-hint why-back-hint">
                        <span>Tap to flip back</span>
                        <i className="fa-solid fa-rotate-left" style={{ fontSize: '0.62rem' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

        </div>

        {/* Bottom Bar: Quote + 3 Metrics + Cursive Note */}
        {data.showBottomBar !== false && (
          <div className="why-bottom-bar reveal visible">
            
            {/* Quote Block */}
            {data.showQuote !== false && data.bottomQuote && (
              <>
                <div className="why-quote-block">
                  <div className="why-quote-text">
                    “{data.bottomQuote}”
                  </div>
                  {data.bottomAuthor && (
                    <div className="why-quote-author">
                      {data.bottomAuthor}
                    </div>
                  )}
                </div>
                {(
                  (data.showMetric1 !== false && (data.stat1Num || data.stat1Label)) ||
                  (data.showMetric2 !== false && (data.stat2Num || data.stat2Label)) ||
                  (data.showMetric3 !== false && (data.stat3Num || data.stat3Label)) ||
                  (data.showCursive !== false && (data.cursiveLine1 || data.cursiveLine2))
                ) && <div className="why-bar-divider" />}
              </>
            )}

            {/* Metric 1 */}
            {data.showMetric1 !== false && (data.stat1Num || data.stat1Label) && (
              <>
                <div className="why-metric-item">
                  <div className="why-metric-icon">
                    <Users size={22} />
                  </div>
                  <div className="why-metric-content">
                    <div className="why-metric-num">{data.stat1Num || '187+'}</div>
                    <div className="why-metric-label">{data.stat1Label || 'Successful Candidates'}</div>
                  </div>
                </div>
                {(
                  (data.showMetric2 !== false && (data.stat2Num || data.stat2Label)) ||
                  (data.showMetric3 !== false && (data.stat3Num || data.stat3Label)) ||
                  (data.showCursive !== false && (data.cursiveLine1 || data.cursiveLine2))
                ) && <div className="why-bar-divider" />}
              </>
            )}

            {/* Metric 2 */}
            {data.showMetric2 !== false && (data.stat2Num || data.stat2Label) && (
              <>
                <div className="why-metric-item">
                  <div className="why-metric-icon">
                    <GraduationCap size={22} />
                  </div>
                  <div className="why-metric-content">
                    <div className="why-metric-num">{data.stat2Num || '14+'}</div>
                    <div className="why-metric-label">{data.stat2Label || 'Years of Impact'}</div>
                  </div>
                </div>
                {(
                  (data.showMetric3 !== false && (data.stat3Num || data.stat3Label)) ||
                  (data.showCursive !== false && (data.cursiveLine1 || data.cursiveLine2))
                ) && <div className="why-bar-divider" />}
              </>
            )}

            {/* Metric 3 */}
            {data.showMetric3 !== false && (data.stat3Num || data.stat3Label) && (
              <>
                <div className="why-metric-item">
                  <div className="why-metric-icon">
                    <TrendingUp size={22} />
                  </div>
                  <div className="why-metric-content">
                    <div className="why-metric-num">{data.stat3Num || 'Stronger'}</div>
                    <div className="why-metric-label">{data.stat3Label || 'Rural Youth, Brighter India'}</div>
                  </div>
                </div>
                {data.showCursive !== false && (data.cursiveLine1 || data.cursiveLine2) && (
                  <div className="why-bar-divider" />
                )}
              </>
            )}

            {/* Handwritten Cursive Note */}
            {data.showCursive !== false && (data.cursiveLine1 || data.cursiveLine2) && (
              <div className="why-cursive-block">
                <div className="why-cursive-note">
                  {data.cursiveLine1 && <>{data.cursiveLine1}<br /></>}
                  {data.cursiveLine2 && <>{data.cursiveLine2}</>}
                </div>
                <svg className="why-cursive-underline" viewBox="0 0 160 16">
                  <path d="M 5,10 Q 80,15 155,5" fill="none" stroke="#7B1B2E" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            )}

          </div>
        )}

        {/* Action CTA Button */}
        {data.showCta !== false && data.ctaText && (
          <div className="why-cta-row reveal visible">
            <a href={data.ctaLink || LMS_URL} className="why-join-btn">
              {data.ctaText} <ArrowRight size={18} />
            </a>
          </div>
        )}

      </div>
    </section>
  )
}

