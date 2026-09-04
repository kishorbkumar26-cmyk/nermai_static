import React, { useState, useEffect } from 'react'
import { fbFirestore } from '../firebase/firestore'
import { CONTACT } from '../constants'
import './OfficeLocations.css'

const DEFAULT_MAIN_LOCATION = {
  id: 'loc_main',
  name: 'Nermai IAS Academy',
  tagline: 'MAIN OFFICE',
  address: 'No. 156 / 3, (1st & 2nd Floor), Nanbargal Nagar,\nPondy – Villianur Main Road, Oulgaret, Puducherry – 605 010',
  phone: '+91 919876543210',
  email: 'info@nermai.in',
  hoursDays: 'Mon – Sat',
  hoursTime: '9:00 AM – 6:00 PM',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3903.6262799342416!2d79.7997576!3d11.9309786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5361a93fffe92f%3A0x6b449b2513f51175!2sNermai%20IAS%20Academy!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
  directionsUrl: 'https://maps.google.com/maps?daddr=Nermai+IAS+Academy+Puducherry',
  quote: 'A space to learn, grow and achieve together.',
  visible: true
}

export default function OfficeLocations() {
  const [data, setData] = useState(null)
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s && s.officeLocations) {
        setData(s.officeLocations)
      }
    }).catch(err => {
      console.warn('Could not fetch settings for locations, using default', err)
    })
  }, [])

  // If section explicitly hidden by admin
  if (data && data.visible === false) return null

  const title = data?.title || "We’re Here, Closer to Your Goals"
  const subtitle = data?.subtitle || "Visit our centre to experience a supportive learning environment, expert guidance, and a community that believes in your potential."
  
  // Clean visible locations list or fallback to default single main office
  const rawLocations = data?.locations && data.locations.length > 0 ? data.locations : [DEFAULT_MAIN_LOCATION]
  const visibleLocations = rawLocations.filter(loc => loc.visible !== false)

  if (visibleLocations.length === 0) return null

  // Ensure active index stays within bounds
  const currentLoc = visibleLocations[activeIdx] || visibleLocations[0] || DEFAULT_MAIN_LOCATION

  // Helper to extract or clean iframe src URL
  const getMapUrl = (urlStr) => {
    if (!urlStr) return DEFAULT_MAIN_LOCATION.mapEmbedUrl
    if (urlStr.includes('src=')) {
      const match = urlStr.match(/src=["']([^"']+)["']/)
      if (match && match[1]) return match[1]
    }
    return urlStr
  }

  const mapSrc = getMapUrl(currentLoc.mapEmbedUrl)
  const phoneVal = currentLoc.phone || (CONTACT.phones && CONTACT.phones[0]) || '+91 919876543210'
  const emailVal = currentLoc.email || CONTACT.email || 'info@nermai.in'
  const directionsUrl = currentLoc.directionsUrl || `https://maps.google.com/maps?q=${encodeURIComponent(currentLoc.name + ' ' + (currentLoc.address || ''))}`

  return (
    <section className="ol-section-wrapper" id="office-locations">
      {/* Translucent background watermark pin */}
      <svg className="ol-bg-pin-watermark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="rgba(200,90,23,0.06)" />
        <circle cx="12" cy="9" r="2.5" fill="rgba(200,90,23,0.12)" />
      </svg>

      <div className="ol-container">
        {/* Section Header with floating cursive accents */}
        <div className="ol-header">
          {/* Top-Left Cursive Accent */}
          <div className="ol-script-accent-left">
            Accessible<br />Supportive<br />Always Near You
          </div>

          {/* Top-Right Cursive Accent */}
          <div className="ol-script-accent-right">
            Same City.<br />Bigger Aspirations.
          </div>

          {/* Centered Eyebrow */}
          <div className="ol-eyebrow-wrap">
            <span className="ol-eyebrow-line"></span>
            <span>📍 OUR LOCATION</span>
            <span className="ol-eyebrow-line"></span>
          </div>

          {/* Title & Subtitle */}
          <h2 className="ol-main-title">{title}</h2>
          <p className="ol-subtitle">{subtitle}</p>
        </div>

        {/* Multi-Location Switcher Tabs (Rendered if > 1 location exists) */}
        {visibleLocations.length > 1 && (
          <div className="ol-location-selector-tabs">
            {visibleLocations.map((loc, idx) => (
              <button
                key={loc.id || idx}
                className={`ol-tab-btn ${activeIdx === idx ? 'active' : ''}`}
                onClick={() => setActiveIdx(idx)}
              >
                <i className="fa-solid fa-location-dot ol-tab-icon" />
                <span>{loc.name || `Location ${idx + 1}`}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main Split Location Card */}
        <div className="ol-main-card">
          {/* Left Column: Interactive Map */}
          <div className="ol-map-container">
            <iframe
              src={mapSrc}
              title={`Map – ${currentLoc.name || 'Nermai IAS Academy'}`}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="ol-map-iframe"
            />
          </div>

          {/* Right Column: Office Details */}
          <div className="ol-details-container">
            <div className="ol-details-top">
              {/* Tagline / Office Badge */}
              <div className="ol-tagline-row">
                <div className="ol-tagline-icon">
                  <i className="fa-solid fa-building-columns" />
                </div>
                <span className="ol-tagline-text">{currentLoc.tagline || 'MAIN OFFICE'}</span>
              </div>

              {/* Office Name */}
              <h3 className="ol-office-name">{currentLoc.name || 'Nermai IAS Academy'}</h3>

              {/* Address */}
              <div className="ol-address-row">
                <i className="fa-solid fa-location-dot ol-address-pin-icon" />
                <div style={{ whiteSpace: 'pre-line' }}>
                  {currentLoc.address || DEFAULT_MAIN_LOCATION.address}
                </div>
              </div>

              {/* 3 Quick Contact Info Pills */}
              <div className="ol-contact-grid">
                {/* Phone Pill */}
                <div className="ol-contact-pill">
                  <div className="ol-pill-icon-circle">
                    <i className="fa-solid fa-phone" />
                  </div>
                  <div className="ol-pill-value">{phoneVal}</div>
                  <div className="ol-pill-label">Call Us</div>
                </div>

                {/* Email Pill */}
                <div className="ol-contact-pill">
                  <div className="ol-pill-icon-circle">
                    <i className="fa-solid fa-envelope" />
                  </div>
                  <div className="ol-pill-value">{emailVal}</div>
                  <div className="ol-pill-label">Email Us</div>
                </div>

                {/* Working Hours Pill */}
                <div className="ol-contact-pill">
                  <div className="ol-pill-icon-circle">
                    <i className="fa-regular fa-clock" />
                  </div>
                  <div className="ol-pill-value">{currentLoc.hoursDays || 'Mon – Sat'}</div>
                  <div className="ol-pill-label">{currentLoc.hoursTime || '9:00 AM – 6:00 PM'}</div>
                </div>
              </div>

              {/* Get Directions CTA Button */}
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ol-directions-cta"
              >
                <i className="fa-solid fa-location-arrow" />
                <span>Get Directions on Google Maps</span>
                <i className="fa-solid fa-arrow-right cta-arrow" />
              </a>
            </div>

            {/* Quote Banner Box */}
            <div className="ol-quote-box">
              <div className="ol-quote-content">
                <span className="ol-quote-icon">“</span>
                <p className="ol-quote-text">
                  {currentLoc.quote || 'A space to learn, grow and achieve together.'}
                </p>
                <div className="ol-quote-underline"></div>
              </div>

              {/* Historic Dome Building Watermark SVG */}
              <svg className="ol-quote-building-watermark" viewBox="0 0 120 100" fill="none" stroke="#C85A17" strokeWidth="1.2">
                {/* Dome Roof */}
                <path d="M 60 15 A 30 30 0 0 1 90 45 L 30 45 A 30 30 0 0 1 60 15 Z" fill="rgba(200,90,23,0.04)" />
                <path d="M 60 5 L 60 15" strokeWidth="1.5" />
                <circle cx="60" cy="5" r="2.5" fill="#C85A17" />
                {/* Main Roof Arch */}
                <path d="M 25 45 L 95 45" />
                <path d="M 30 45 L 30 85 L 90 85 L 90 45" />
                {/* Pillars */}
                <line x1="40" y1="45" x2="40" y2="85" />
                <line x1="53" y1="45" x2="53" y2="85" />
                <line x1="67" y1="45" x2="67" y2="85" />
                <line x1="80" y1="45" x2="80" y2="85" />
                {/* Arch Steps / Base */}
                <line x1="20" y1="85" x2="100" y2="85" strokeWidth="1.8" />
                <line x1="15" y1="90" x2="105" y2="90" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom Highlights Feature Bar */}
        <div className="ol-features-bar">
          {/* Feature 1 */}
          <div className="ol-feature-item">
            <div className="ol-feature-icon-circle">
              <i className="fa-solid fa-graduation-cap" />
            </div>
            <div className="ol-feature-text-wrap">
              <div className="ol-feature-title">Easy Access</div>
              <div className="ol-feature-desc">Centrally located with convenient transport options</div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="ol-feature-item">
            <div className="ol-feature-icon-circle">
              <i className="fa-solid fa-users" />
            </div>
            <div className="ol-feature-text-wrap">
              <div className="ol-feature-title">Student Friendly</div>
              <div className="ol-feature-desc">A welcoming space designed for aspirants</div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="ol-feature-item">
            <div className="ol-feature-icon-circle">
              <i className="fa-solid fa-shield-halved" />
            </div>
            <div className="ol-feature-text-wrap">
              <div className="ol-feature-title">A Supportive Community</div>
              <div className="ol-feature-desc">More than a coaching centre — a place to grow</div>
            </div>
          </div>

          {/* Right Side Motto Tag */}
          <div className="ol-motto-wrap">
            <div className="ol-motto-text">
              Empowering Aspirants.<br />Strengthening the Nation.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
