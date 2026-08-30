import React, { useState, useEffect } from 'react'
import { fbFirestore } from '../firebase/firestore'
import { driveStorage } from '../services/driveStorage'

export default function Gallery() {
  const [images, setImages] = useState([])

  useEffect(() => {
    const unsub = fbFirestore.onGalleryChanged(items => setImages(items))
    return () => unsub()
  }, [])

  if (images.length === 0) return null

  return (
    <section className="gallery-section section" id="gallery" style={{ backgroundColor: 'var(--white)' }}>
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <span className="eyebrow">GALLERY</span>
          <h2 className="section-title">வகுப்பறை தருணங்கள்</h2>
          <p className="section-desc">
            நேர்மை அகாடமியின் நேரடி வகுப்பறை மற்றும் நிகழ்வுகளின் புகைப்படங்கள்.
          </p>
        </div>

        <div className="gallery-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 'var(--space-4)',
          gridAutoRows: '250px'
        }}>
          {images.map((img, i) => {
            const photoUrl = driveStorage.formatImageUrl(img.url)
            return (
              <div 
                key={img.id} 
                className="gallery-item reveal" 
                style={{ 
                  borderRadius: 'var(--radius)', 
                  overflow: 'hidden',
                  position: 'relative',
                  transitionDelay: `${(i % 5) * 0.1}s`
                }}
              >
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={img.caption || 'Nermai Gallery Image'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
                    onError={(e) => driveStorage.handleImageError(e, '')}
                    loading="lazy"
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--gray-200)' }}></div>
                )}
                {img.caption && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    padding: 'var(--space-6) var(--space-4) var(--space-4)',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                    color: 'var(--white)',
                    fontSize: '0.9rem',
                    pointerEvents: 'none'
                  }}>
                    {img.caption}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
