import React, { useState } from 'react'
import { Bell, ChevronLeft, ChevronRight, Pause, Play, Megaphone } from 'lucide-react'

export default function TopTicker({ ticker }) {
  const [isPaused, setIsPaused] = useState(false)
  const [scrollPos, setScrollPos] = useState(0)

  const items = ticker?.items && ticker.items.length > 0 ? ticker.items : [
    { text: 'Admission opened for UDC/LDC 2026', link: '#contact' },
    { text: 'TNPSC Group II – New Batch from 15 Sep 2026', link: '#courses' },
    { text: 'UPSC Foundation Batch – Limited Seats', link: '#courses' },
    { text: 'Free Daily Current Affairs PDF', link: '#resources' }
  ]

  // Quadruple items to create a seamless infinite marquee loop
  const displayItems = [...items, ...items, ...items, ...items]
  const speed = ticker?.speed || 30

  const handlePrev = () => {
    setScrollPos(prev => prev + 200)
  }

  const handleNext = () => {
    setScrollPos(prev => prev - 200)
  }

  return (
    <div className="ticker-strip" aria-label="Latest Updates Ticker">
      <div className="container" style={{ maxWidth: '1560px' }}>
        <div className="ticker-inner">
          
          {/* Left Deep Maroon Tab Badge */}
          <div className="ticker-badge-tab">
            <Megaphone size={14} style={{ color: '#F5D061' }} />
            <span>Latest Updates</span>
          </div>

          {/* Center Scrolling Track */}
          <div 
            className="ticker-content-track"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div 
              className={`ticker-scroll-wrapper ${isPaused ? 'paused' : ''}`}
              style={{ 
                '--ticker-speed': `${speed}s`,
                transform: scrollPos !== 0 ? `translateX(${scrollPos}px)` : undefined,
                transition: scrollPos !== 0 ? 'transform 0.3s ease' : undefined
              }}
            >
              {displayItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  <span className="ticker-item-span">
                    <Bell size={13} className="ticker-item-bell" />
                    {item.link ? (
                      <a href={item.link} className="top-ticker-link">
                        {item.text}
                      </a>
                    ) : (
                      <span>{item.text}</span>
                    )}
                  </span>
                  <span style={{ color: 'rgba(123, 27, 46, 0.25)', fontSize: '0.8rem', margin: '0 4px' }}>|</span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right Navigation Controls */}
          <div className="ticker-controls-group">
            <button 
              className="ticker-ctrl-btn" 
              onClick={handlePrev} 
              title="Previous Update"
              aria-label="Previous Update"
            >
              <ChevronLeft size={14} />
            </button>
            <button 
              className="ticker-ctrl-btn" 
              onClick={() => setIsPaused(!isPaused)} 
              title={isPaused ? "Resume Ticker" : "Pause Ticker"}
              aria-label={isPaused ? "Resume Ticker" : "Pause Ticker"}
            >
              {isPaused ? <Play size={12} /> : <Pause size={12} />}
            </button>
            <button 
              className="ticker-ctrl-btn" 
              onClick={handleNext} 
              title="Next Update"
              aria-label="Next Update"
            >
              <ChevronRight size={14} />
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
