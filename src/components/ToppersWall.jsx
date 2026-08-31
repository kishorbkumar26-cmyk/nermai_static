import { useState, useEffect } from 'react'
import { fbFirestore } from '../firebase/firestore'
import { driveStorage } from '../services/driveStorage'

export default function ToppersWall() {
  const [toppers, setToppers] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const unsub = fbFirestore.onToppersChanged(items => {
      setToppers(items)
      // Center the active index initially if items exist
      if (items.length > 0) {
        setActiveIndex(Math.floor(items.length / 2))
      }
    })
    return () => unsub()
  }, [])

  if (toppers.length === 0) return null
  
  const visibleToppers = toppers.filter(t => t.visible !== false)
  if (visibleToppers.length === 0) return null

  const handleNext = () => setActiveIndex(prev => (prev + 1) % visibleToppers.length)
  const handlePrev = () => setActiveIndex(prev => (prev - 1 + visibleToppers.length) % visibleToppers.length)

  return (
    <section className="section" style={{ background: 'var(--white)', overflow: 'hidden', padding: 'var(--space-16) 0' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <a href="#toppers-list" className="btn btn-primary" style={{ borderRadius: '50px', padding: '0.75rem 2.5rem', marginBottom: '4rem', fontSize: '1rem', fontWeight: 600 }}>
          Toppers List &rarr;
        </a>

        <div className="toppers-carousel-container" style={{ position: 'relative', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', perspective: '1200px' }}>
          {visibleToppers.map((topper, i) => {
            const photoUrl = driveStorage.formatImageUrl(topper.photo)
            
            // Calculate distance from activeIndex
            let diff = i - activeIndex
            // Handle wrap-around for smooth continuous feeling
            if (diff > Math.floor(visibleToppers.length / 2)) diff -= visibleToppers.length
            if (diff < -Math.floor(visibleToppers.length / 2)) diff += visibleToppers.length

            const absDiff = Math.abs(diff)
            const isActive = diff === 0

            // Base styles
            let translateX = diff * 180 // spacing between cards
            let translateZ = -absDiff * 150 // depth
            let scale = 1
            let zIndex = 100 - absDiff
            let opacity = absDiff > 2 ? 0 : 1

            return (
              <div
                key={topper.id}
                onClick={() => setActiveIndex(i)}
                style={{
                  position: 'absolute',
                  width: '280px',
                  height: '360px',
                  transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) scale(${scale})`,
                  zIndex,
                  opacity,
                  cursor: 'pointer',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: isActive ? '0 20px 40px rgba(0,0,0,0.2)' : '0 10px 20px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#fff'
                }}
              >
                <div style={{ flex: 1, width: '100%', backgroundColor: '#f5f5f5', overflow: 'hidden' }}>
                  {photoUrl ? (
                    <img 
                      src={photoUrl} 
                      alt={topper.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => driveStorage.handleImageError(e, '')}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', color: '#ccc' }}>
                      <i className="fa-solid fa-user-graduate"></i>
                    </div>
                  )}
                </div>
                <div style={{ 
                  background: 'var(--saffron)', 
                  color: 'white', 
                  padding: '1.25rem 1rem', 
                  textAlign: 'center',
                  minHeight: '90px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '6px' }}>{topper.name}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.95, fontWeight: 500 }}>
                    AIR {topper.rank} - {topper.exam} {topper.year}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Carousel controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '3rem' }}>
          <button onClick={handlePrev} style={{ 
            background: 'var(--saffron)', 
            border: 'none', 
            borderRadius: '50%', 
            width: '48px', 
            height: '48px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            transition: 'transform 0.2s',
            color: 'white'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <button onClick={handleNext} style={{ 
            background: 'var(--saffron)', 
            border: 'none', 
            borderRadius: '50%', 
            width: '48px', 
            height: '48px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            transition: 'transform 0.2s',
            color: 'white'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
