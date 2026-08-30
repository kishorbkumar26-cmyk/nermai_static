import { useState, useEffect } from 'react'
import { fbFirestore } from '../firebase/firestore'
import { driveStorage } from '../services/driveStorage'

export default function ToppersWall() {
  const [toppers, setToppers] = useState([])

  useEffect(() => {
    const unsub = fbFirestore.onToppersChanged(items => setToppers(items))
    return () => unsub()
  }, [])

  return (
    <section className="toppers-section section" id="toppers">
      <div className="container">
        <div className="section-header">
          <span className="eyebrow">🏆 வெற்றியாளர்கள்</span>
          <h2 className="section-title">
            நேர்மை படித்தவர்களின்<br />
            <span style={{ color: 'var(--saffron)' }}>பொன்விழா</span>
          </h2>
          <p className="section-desc">
            இந்த வெற்றிகளே எங்கள் பலம். உங்கள் பெயரும் இங்கே இடம் பெறும்.
          </p>
        </div>

        <div className="toppers-grid">
          {toppers.map((topper, i) => {
            const photoUrl = driveStorage.formatImageUrl(topper.photo)
            const initial = topper.name ? topper.name[0].toUpperCase() : '?'

            return (
              <article
                key={topper.id}
                className="topper-card reveal"
                style={{ transitionDelay: `${i * 0.08}s` }}
              >
                {/* Rank Badge */}
                <div className="topper-rank-badge">
                  🥇 Rank {topper.rank}
                </div>

                {/* Photo */}
                <div className="topper-photo">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={topper.name}
                      onError={(e) => driveStorage.handleImageError(e, '')}
                      loading="lazy"
                    />
                  ) : (
                    <div className="topper-photo-placeholder">
                      <i className="fa-solid fa-user-graduate"></i>
                    </div>
                  )}
                  <div className="topper-photo-overlay"></div>
                </div>

                {/* Body */}
                <div className="topper-body">
                  <div className="topper-name">{topper.name}</div>
                  <div className="topper-exam">{topper.exam}</div>
                  <div className="topper-year">
                    <i className="fa-regular fa-calendar" style={{ marginRight: '4px' }}></i>
                    {topper.year}
                  </div>
                  {topper.quote && (
                    <blockquote className="topper-quote">{topper.quote}</blockquote>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
