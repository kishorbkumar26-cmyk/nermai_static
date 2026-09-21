import React from 'react'
import './WhyNermaiCard.css'
import {
  Trophy,
  Users,
  HandCoins,
  Laptop,
  TrendingUp,
  Award,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Star,
  Flame,
  Target
} from 'lucide-react'

const ICON_MAP = {
  Trophy,
  Users,
  HandCoins,
  Laptop,
  TrendingUp,
  Award,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Star,
  Flame,
  Target
}

function getIconComponent(iconName) {
  return ICON_MAP[iconName] || Trophy
}

function renderFormattedText(text) {
  if (!text) return null
  const lines = text.split('\n')

  return lines.map((line, lIdx) => {
    const parts = []
    let lastIndex = 0
    const regex = /(\*\*(.*?)\*\*|<highlight>(.*?)<\/highlight>)/g
    let match

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index))
      }
      const inner = match[2] || match[3]
      parts.push(
        <strong key={`${lIdx}-${match.index}`} className="wn-accent-text">
          {inner}
        </strong>
      )
      lastIndex = regex.lastIndex
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex))
    }

    return (
      <React.Fragment key={lIdx}>
        {parts.length > 0 ? parts : line}
        {lIdx < lines.length - 1 && <br />}
      </React.Fragment>
    )
  })
}

export default function WhyNermaiCard({ data = {} }) {
  const {
    eyebrow = 'OUR STRENGTH',
    titlePrefix = 'Why',
    titleHighlight = 'NermaiIAS?',
    subtitleLine1 = 'Quality mentorship. Accessible learning. Proven results.',
    subtitleLine2 = "That's the Nermai difference.",
    heroImageUrl = '/assets/why-nermai-right-banner.png',
    heroImageFit = 'cover',
    showCustomScript = false,
    topScriptLine1 = 'Same Commitment',
    topScriptLine2 = 'A Brighter India',
    bottomScriptLine1 = 'Students Today',
    bottomScriptLine2 = 'A Stronger Tomorrow',
    mottoWords = ['Learn', 'Prepare', 'Serve', 'Succeed'],
    pillars = []
  } = data

  const displayPillars = Array.isArray(pillars) && pillars.length > 0
    ? pillars
    : []

  const activeHeroImg = heroImageUrl || '/assets/why-nermai-right-banner.png'
  const isDefaultBanner = activeHeroImg.includes('why-nermai-right-banner')

  return (
    <div className="wn-banner-outer">
      <div className="wn-banner-card">
        
        {/* Landmark Monument Watermark in Background */}
        <div className="wn-monument-watermark" aria-hidden="true">
          <svg viewBox="0 0 600 400" fill="none" opacity="0.04" className="wn-monument-svg">
            <path d="M300 40 L310 110 L290 110 Z" fill="#8B1D2C" />
            <circle cx="300" cy="30" r="15" fill="#8B1D2C" />
            <path d="M220 140 C220 100 380 100 380 140 L380 180 L220 180 Z" fill="#8B1D2C" />
            <rect x="180" y="180" width="240" height="20" fill="#8B1D2C" />
            <rect x="190" y="200" width="220" height="80" fill="#8B1D2C" />
            <rect x="160" y="280" width="280" height="30" fill="#8B1D2C" />
          </svg>
        </div>

        {/* Left / Main Content Container */}
        <div className="wn-content-section">
          
          {/* Header */}
          <div className="wn-header-block">
            {eyebrow && (
              <div className="wn-eyebrow-wrap">
                <span className="wn-eyebrow-text">{eyebrow}</span>
                <span className="wn-eyebrow-divider" />
              </div>
            )}

            <h1 className="wn-main-title">
              <span className="wn-title-prefix">{titlePrefix} </span>
              <span className="wn-title-highlight">{titleHighlight}</span>
            </h1>

            <div className="wn-title-underline-wrap">
              <span className="wn-title-underline" />
            </div>

            {(subtitleLine1 || subtitleLine2) && (
              <div className="wn-subtitles">
                {subtitleLine1 && <p className="wn-sub-line">{subtitleLine1}</p>}
                {subtitleLine2 && <p className="wn-sub-line">{subtitleLine2}</p>}
              </div>
            )}
          </div>

          {/* 5 Horizontal Columns / Pillars */}
          <div className="wn-pillars-grid">
            {displayPillars.map((item, idx) => {
              const IconComponent = getIconComponent(item.icon)
              return (
                <div key={item.id || idx} className="wn-pillar-col">
                  
                  {/* Number */}
                  <div className="wn-pillar-num">
                    {item.number || `0${idx + 1}`}
                  </div>

                  {/* Icon Circle */}
                  <div className="wn-pillar-icon-badge">
                    <IconComponent size={26} strokeWidth={1.8} className="wn-pillar-icon" />
                  </div>

                  {/* Title */}
                  <h3 className="wn-pillar-title">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <div className="wn-pillar-desc">
                    {renderFormattedText(item.desc)}
                  </div>

                </div>
              )
            })}
          </div>

          {/* Subtle Bottom-Left Motto */}
          {Array.isArray(mottoWords) && mottoWords.length > 0 && (
            <div className="wn-bottom-motto" aria-hidden="true">
              {mottoWords.map((word, idx) => (
                <span key={idx} className="wn-motto-word">{word}</span>
              ))}
            </div>
          )}

        </div>

        {/* Right Section: Hero Visual (Chess King & Books with Curves) */}
        <div className="wn-hero-section">
          <div className="wn-hero-image-frame">
            <img 
              src={activeHeroImg} 
              alt="Nermai IAS Academy Strategy & Excellence" 
              className={`wn-hero-image wn-fit-${heroImageFit}`}
              crossOrigin="anonymous"
              onError={(e) => { e.target.src = '/assets/why-nermai-right-banner.png' }}
            />
          </div>

          {/* Cursive Overlays (shown only if enabled or if using custom image) */}
          {(showCustomScript || !isDefaultBanner) && (
            <>
              {(topScriptLine1 || topScriptLine2) && (
                <div className="wn-script-box wn-script-top">
                  {topScriptLine1 && <div className="wn-script-line">{topScriptLine1}</div>}
                  {topScriptLine2 && <div className="wn-script-line">{topScriptLine2}</div>}
                  <div className="wn-script-underline" />
                </div>
              )}

              {(bottomScriptLine1 || bottomScriptLine2) && (
                <div className="wn-script-box wn-script-bottom">
                  {bottomScriptLine1 && <div className="wn-script-line">{bottomScriptLine1}</div>}
                  {bottomScriptLine2 && <div className="wn-script-line">{bottomScriptLine2}</div>}
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  )
}
