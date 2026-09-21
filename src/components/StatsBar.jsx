import { useState, useEffect, useRef } from 'react'
import { Users, Calendar, GraduationCap, Trophy, ChevronRight, Star, Award, Target, TrendingUp } from 'lucide-react'
import { fbFirestore } from '../firebase/firestore'
import './StatsBar.css'

function animateCounter(el, numStr) {
  if (!el || !numStr) return
  const str = String(numStr).trim()
  const match = str.match(/^(\d+)(.*)$/)
  if (!match) {
    el.textContent = str
    return
  }
  const target = parseInt(match[1], 10)
  const suffix = match[2]
  const duration = 1800
  const start = performance.now()
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1)
    const ease = 1 - Math.pow(1 - progress, 3)
    el.textContent = Math.round(ease * target) + suffix
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

const DEFAULT_ITEMS = [
  {
    num: '5000+',
    label: 'STUDENTS',
    sublabel: 'From towns, cities and rural communities',
    icon: Users
  },
  {
    num: '15+',
    label: 'YEARS',
    sublabel: 'Of academic excellence and trust',
    icon: Calendar
  },
  {
    num: '28+',
    label: 'BATCHES',
    sublabel: 'Across competitive examinations',
    icon: GraduationCap
  },
  {
    num: 'Highest',
    label: 'SUCCESS',
    sublabel: 'Consistent results, brighter futures',
    icon: Trophy
  }
]

const ICONS_POOL = [Users, Calendar, GraduationCap, Trophy, Award, Target, TrendingUp, Star]

export default function StatsBar() {
  const [statsData, setStatsData] = useState(DEFAULT_ITEMS)
  const refs = useRef([])
  const animated = useRef(false)

  // Real-time Firestore settings subscription
  useEffect(() => {
    const unsub = fbFirestore.onSettingsChanged(s => {
      if (s.homeContent?.stats && Array.isArray(s.homeContent.stats) && s.homeContent.stats.length > 0) {
        const visibleList = s.homeContent.stats.filter(st => st.visible !== false)
        const formatted = (visibleList.length > 0 ? visibleList : s.homeContent.stats).map((st, i) => {
          let fallback = DEFAULT_ITEMS[i % DEFAULT_ITEMS.length]
          let numVal = st.num || fallback?.num || '0'
          // If legacy 99% or 98% is present and not explicitly customized, prefer "Highest" for success
          if (st.label?.toLowerCase().includes('success') && (numVal === '99%' || numVal === '98%')) {
            numVal = 'Highest'
          }

          return {
            num: numVal,
            label: (st.label || fallback?.label || 'STAT').toUpperCase(),
            sublabel: st.sublabel || fallback?.sublabel || '',
            icon: ICONS_POOL[i % ICONS_POOL.length]
          }
        })
        setStatsData(formatted)
        animated.current = false // allow counter animation to re-run on fresh data
      }
    })
    return () => { if (typeof unsub === 'function') unsub() }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true
          statsData.forEach((item, i) => {
            if (refs.current[i]) animateCounter(refs.current[i], item.num)
          })
        }
      },
      { threshold: 0.2 }
    )
    const el = document.querySelector('.stats-maroon-card')
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [statsData])

  return (
    <section className="stats-section" id="impact">
      <div className="container">
        
        {/* Top Header Row */}
        <div className="stats-header-row reveal visible">
          <div className="stats-header-left">
            <div className="stats-eyebrow">OUR IMPACT</div>
            <h2 className="stats-title">Numbers that Inspire</h2>
            <div className="stats-subtitle">Real people. Real dedication. Real results.</div>
          </div>

          <div className="stats-header-divider" />

          <div className="stats-header-center">
            More than just numbers — a growing community of future leaders.
          </div>

          <div className="stats-header-right">
            <svg className="stats-header-building" viewBox="0 0 400 300" fill="currentColor">
              <path d="M200 30 C170 30 150 60 140 90 L260 90 C250 60 230 30 200 30 Z" />
              <rect x="195" y="10" width="10" height="20" rx="2" />
              <polygon points="200,2 196,10 204,10" />
              <rect x="130" y="90" width="140" height="15" />
              <rect x="120" y="105" width="160" height="8" />
              <rect x="135" y="113" width="10" height="110" />
              <rect x="160" y="113" width="10" height="110" />
              <rect x="185" y="113" width="10" height="110" />
              <rect x="205" y="113" width="10" height="110" />
              <rect x="230" y="113" width="10" height="110" />
              <rect x="255" y="113" width="10" height="110" />
              <rect x="110" y="223" width="180" height="15" />
              <rect x="90" y="238" width="220" height="20" />
            </svg>

            <div className="stats-cursive-wrap">
              <div className="stats-cursive-text">
                Same Dedication.<br />A Brighter Tomorrow.
              </div>
              <svg className="stats-cursive-line" viewBox="0 0 160 16">
                <path d="M 5,10 Q 80,15 155,5" fill="none" stroke="#7B1B2E" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Deep Maroon Card Container */}
        <div className="stats-maroon-card reveal visible">
          <div className="stats-bg-watermark">N E R M A I</div>

          <div className="stats-card-inner">
            <div className="stats-items-2x2">
              {statsData.map((item, i) => {
                const IconComponent = item.icon || Trophy
                return (
                  <div key={i} className="stats-col-item">
                    <div className="stats-icon-badge">
                      <IconComponent size={22} />
                    </div>
                    <div className="stats-num-bold" ref={el => refs.current[i] = el}>
                      {item.num}
                    </div>
                    <div className="stats-item-label">{item.label}</div>
                    <div className="stats-item-sub">{item.sublabel}</div>

                    <div className="stats-arrow-circle" title="Learn More">
                      <ChevronRight size={14} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 5th Column - Quote & Since 2017 Badge */}
            <div className="stats-quote-col">
              <div>
                <div className="stats-quote-mark">“</div>
                <div className="stats-quote-body">
                  “A stronger tomorrow, built by your success today.”
                </div>
                <div className="stats-quote-author">— NERMAI</div>
              </div>

              <div className="stats-since-badge">
                <Star size={13} className="stats-star-icon" /> SINCE 2017
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tagline Row */}
        <div className="stats-bottom-tagline reveal visible">
          <div className="stats-tagline-line" />
          <div className="stats-tagline-text">
            LEARN &nbsp;•&nbsp; PRACTICE &nbsp;•&nbsp; IMPROVE &nbsp;•&nbsp; SUCCEED
          </div>
          <div className="stats-tagline-line" />
        </div>

      </div>
    </section>
  )
}
