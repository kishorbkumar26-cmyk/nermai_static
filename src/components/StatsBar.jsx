import { useState, useEffect, useRef } from 'react'
import { fbFirestore } from '../firebase/firestore'

function animateCounter(el, numStr) {
  const match = numStr.match(/^(\d+)(.*)$/)
  if (!match) { el.textContent = numStr; return }
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

const DEFAULT_STATS = [
  { num: '2400+', label: 'Students',  sublabel: 'பயிற்சி பெற்ற மாணவர்கள்' },
  { num: '14+',   label: 'Years',     sublabel: 'ஆண்டுகள் அனுபவம்' },
  { num: '28+',   label: 'Batches',   sublabel: 'வெற்றிகரமான தொகுதிகள்' },
  { num: '98%',   label: 'Success',   sublabel: 'வெற்றி விகிதம்' },
]

export default function StatsBar() {
  const [stats, setStats] = useState(DEFAULT_STATS)
  const refs = useRef([])
  const animated = useRef(false)

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s.homeContent?.stats?.length) setStats(s.homeContent.stats)
    })
  }, [])

  useEffect(() => {
    animated.current = false // reset when stats change
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true
          stats.forEach((stat, i) => {
            if (refs.current[i]) animateCounter(refs.current[i], stat.num)
          })
        }
      },
      { threshold: 0.3 }
    )
    const el = document.querySelector('.stats-bar')
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [stats])

  return (
    <div className="stats-bar">
      <div className="container">
        <div className="stats-bar-inner">
          {stats.map((stat, i) => (
            <div key={i} className="stat-item">
              <span className="stat-number mono" ref={el => refs.current[i] = el}>
                {stat.num}
              </span>
              <span className="stat-label-en">{stat.label}</span>
              <span className="stat-label">{stat.sublabel}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
