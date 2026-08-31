import { useState, useEffect } from 'react'
import { fbFirestore } from '../firebase/firestore'

export default function OfficeLocations() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s.officeLocations) setData(s.officeLocations)
    })
  }, [])

  if (!data || data.visible === false) return null

  const visibleLocations = (data.locations || []).filter(loc => loc.visible !== false)
  if (visibleLocations.length === 0) return null

  return (
    <section className="office-locations-section" id="office-locations">
      <div className="container">
        <div className="ol-header">
          <span className="eyebrow"><i className="fa-solid fa-map-location-dot"></i> LOCATIONS</span>
          <h2 className="ol-title">{data.title || 'Our Office Locations'}</h2>
        </div>

        <div className="ol-grid">
          {visibleLocations.map((loc, i) => (
            <div key={loc.id || i} className="ol-card">
              <div className="ol-card-header">
                <i className="fa-solid fa-location-dot ol-card-icon" />
                <div className="ol-card-name">{loc.name || `Office ${i + 1}`}</div>
              </div>
              {loc.address && (
                <div className="ol-card-address" style={{ whiteSpace: 'pre-line' }}>
                  {loc.address}
                </div>
              )}

              {loc.mapEmbedUrl && (
                <div className="ol-map-wrap">
                  <iframe
                    src={loc.mapEmbedUrl}
                    title={`Map – ${loc.name || 'Office'}`}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="ol-map-iframe"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
