import React, { useState, useEffect } from 'react'
import { fbFirestore } from '../firebase/firestore'
import { CONTACT } from '../constants'
import './OfficeLocations.css'

export const DEFAULT_MAIN_LOCATION = {
  id: 'loc_main',
  name: 'Main Office – Puducherry',
  tagline: 'MAIN OFFICE',
  addresses: [
    {
      id: 'addr_1',
      title: 'Address 1',
      lines: [
        'No. 156 / 3, (1st & 2nd Floor), Nanbargal Nagar',
        'Pondy – Villianur Main Road, Oulgaret',
        'Puducherry – 605 010'
      ]
    }
  ],
  address: 'No. 156 / 3, (1st & 2nd Floor), Nanbargal Nagar,\nPondy – Villianur Main Road, Oulgaret, Puducherry – 605 010',
  phones: ['+91 8903 108000'],
  phone: '+91 8903 108000',
  phoneLabel: 'Call Us',
  email: 'nermaiiasacademy@gmail.com',
  emailLabel: 'Email Us',
  hoursDays: 'Mon – Sat',
  hoursTime: '9:00 AM – 6:00 PM',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3903.6262799342416!2d79.7997576!3d11.9309786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5361a93fffe92f%3A0x6b449b2513f51175!2sNermai%20IAS%20Academy!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
  directionsUrl: 'https://maps.google.com/maps?daddr=Nermai+IAS+Academy+Puducherry',
  directionsButtonText: 'Get Directions on Google Maps',
  quote: 'A space to learn, grow and achieve together.',
  visible: true
}

// Helper to extract multiple address blocks (e.g. Address 1, Address 2) with lines (Line 1, Line 2, Line 3)
export function getLocationAddresses(loc) {
  if (Array.isArray(loc?.addresses) && loc.addresses.length > 0) {
    return loc.addresses.map((a, idx) => ({
      id: a.id || `addr_${idx + 1}`,
      title: a.title !== undefined && a.title !== '' ? a.title : `Address ${idx + 1}`,
      lines: Array.isArray(a.lines) && a.lines.length > 0
        ? a.lines.map(l => (typeof l === 'string' ? l : ''))
        : (typeof a.address === 'string' && a.address.trim() ? a.address.split('\n').map(l => l.trim()).filter(Boolean) : ['', '', ''])
    }))
  }

  // Fallback 1: addressLines array
  if (Array.isArray(loc?.addressLines) && loc.addressLines.length > 0) {
    return [
      {
        id: 'addr_1',
        title: 'Address 1',
        lines: loc.addressLines.map(l => (typeof l === 'string' ? l : ''))
      }
    ]
  }

  // Fallback 2: address1 / address2
  if (loc?.address1 || loc?.address2) {
    return [
      {
        id: 'addr_1',
        title: 'Address 1',
        lines: [loc.address1 || '', loc.address2 || ''].filter(Boolean)
      }
    ]
  }

  // Fallback 3: multiline string address
  if (typeof loc?.address === 'string' && loc.address.trim()) {
    const lines = loc.address.split('\n').map(l => l.trim()).filter(Boolean)
    return [
      {
        id: 'addr_1',
        title: 'Address 1',
        lines: lines.length > 0 ? lines : ['']
      }
    ]
  }

  return [
    {
      id: 'addr_1',
      title: 'Address 1',
      lines: [
        'No. 156 / 3, (1st & 2nd Floor), Nanbargal Nagar',
        'Pondy – Villianur Main Road, Oulgaret',
        'Puducherry – 605 010'
      ]
    }
  ]
}

export const DEFAULT_OFFICE_SETTINGS = {
  visible: true,
  cardVisible: true,
  headerVisible: true,
  scriptsVisible: true,
  featuresVisible: true,
  eyebrow: '📍 OUR LOCATION',
  title: 'Our Office Locations',
  subtitle: 'Visit our centre to experience a supportive learning environment, expert guidance, and a community that believes in your potential.',
  leftScriptLine1: 'Accessible',
  leftScriptLine2: 'Supportive',
  leftScriptLine3: 'Always Near You',
  rightScriptLine1: 'Same City.',
  rightScriptLine2: 'Bigger Aspirations.',
  feature1Icon: 'fa-graduation-cap',
  feature1Title: 'Easy Access',
  feature1Desc: 'Centrally located with convenient transport options',
  feature2Icon: 'fa-users',
  feature2Title: 'Student Friendly',
  feature2Desc: 'A welcoming space designed for aspirants',
  feature3Icon: 'fa-shield-halved',
  feature3Title: 'A Supportive Community',
  feature3Desc: 'More than a coaching centre — a place to grow',
  mottoLine1: 'EMPOWERING ASPIRANTS.',
  mottoLine2: 'STRENGTHENING THE NATION.',
  locations: [DEFAULT_MAIN_LOCATION]
}

export default function OfficeLocations() {
  const [data, setData] = useState(DEFAULT_OFFICE_SETTINGS)
  const [activeIdx, setActiveIdx] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s?.officeLocations) {
        setData(prev => ({ ...prev, ...s.officeLocations }))
      }
    }).catch(err => {
      console.warn('Could not fetch settings for locations, using default', err)
    })

    const unsub = fbFirestore.onSettingsChanged?.(s => {
      if (s?.officeLocations) {
        setData(prev => ({ ...prev, ...s.officeLocations }))
      }
    })

    return () => unsub && unsub()
  }, [])

  // Clean visible locations list or fallback to default single main office
  const rawLocations = data?.locations && data.locations.length > 0 ? data.locations : [DEFAULT_MAIN_LOCATION]
  const visibleLocations = rawLocations.filter(loc => loc.visible !== false)

  // ── Auto-switch location every 8 seconds if > 1 location ──
  useEffect(() => {
    if (visibleLocations.length <= 1 || isPaused) return

    const interval = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % visibleLocations.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [visibleLocations.length, isPaused])

  // If section explicitly hidden by admin
  if (data && data.visible === false) return null

  const showHeader = data.headerVisible !== false
  const showScripts = data.scriptsVisible !== false
  const showCard = data.cardVisible !== false
  const showFeaturesBar = data.featuresVisible !== false

  const eyebrow = data.eyebrow !== undefined ? data.eyebrow : DEFAULT_OFFICE_SETTINGS.eyebrow
  const title = data.title !== undefined ? data.title : DEFAULT_OFFICE_SETTINGS.title
  const subtitle = data.subtitle !== undefined ? data.subtitle : DEFAULT_OFFICE_SETTINGS.subtitle

  const leftScriptLine1 = data.leftScriptLine1 !== undefined ? data.leftScriptLine1 : DEFAULT_OFFICE_SETTINGS.leftScriptLine1
  const leftScriptLine2 = data.leftScriptLine2 !== undefined ? data.leftScriptLine2 : DEFAULT_OFFICE_SETTINGS.leftScriptLine2
  const leftScriptLine3 = data.leftScriptLine3 !== undefined ? data.leftScriptLine3 : DEFAULT_OFFICE_SETTINGS.leftScriptLine3

  const rightScriptLine1 = data.rightScriptLine1 !== undefined ? data.rightScriptLine1 : DEFAULT_OFFICE_SETTINGS.rightScriptLine1
  const rightScriptLine2 = data.rightScriptLine2 !== undefined ? data.rightScriptLine2 : DEFAULT_OFFICE_SETTINGS.rightScriptLine2

  const hasLeftScript = showScripts && Boolean((leftScriptLine1 ?? '').trim() || (leftScriptLine2 ?? '').trim() || (leftScriptLine3 ?? '').trim())
  const hasRightScript = showScripts && Boolean((rightScriptLine1 ?? '').trim() || (rightScriptLine2 ?? '').trim())

  // Ensure active index stays within bounds
  const currentLoc = visibleLocations[activeIdx] || visibleLocations[0] || DEFAULT_MAIN_LOCATION

  const handlePrev = () => {
    setActiveIdx(prev => (prev - 1 + visibleLocations.length) % visibleLocations.length)
  }

  const handleNext = () => {
    setActiveIdx(prev => (prev + 1) % visibleLocations.length)
  }

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

  // Extract multiple phone numbers safely
  const getPhoneList = (loc) => {
    if (Array.isArray(loc.phones) && loc.phones.length > 0) {
      const list = loc.phones.map(p => (typeof p === 'string' ? p : (p?.number || '')).trim()).filter(Boolean)
      if (list.length > 0) return list
    }
    if (typeof loc.phone === 'string' && loc.phone.trim()) {
      const list = loc.phone.split(/[\n,;/]+/).map(p => p.trim()).filter(Boolean)
      if (list.length > 0) return list
    }
    if (Array.isArray(CONTACT.phones) && CONTACT.phones.length > 0) {
      return CONTACT.phones
    }
    return ['+91 8903 108000']
  }

  const phoneList = getPhoneList(currentLoc)
  const phoneLabel = currentLoc.phoneLabel !== undefined ? currentLoc.phoneLabel : 'Call Us'
  const emailVal = currentLoc.email !== undefined ? currentLoc.email : CONTACT.email || 'nermaiiasacademy@gmail.com'
  const emailLabel = currentLoc.emailLabel !== undefined ? currentLoc.emailLabel : 'Email Us'
  const hoursDays = currentLoc.hoursDays !== undefined ? currentLoc.hoursDays : 'Mon – Sat'
  const hoursTime = currentLoc.hoursTime !== undefined ? currentLoc.hoursTime : '9:00 AM – 6:00 PM'
  const btnText = currentLoc.directionsButtonText !== undefined ? currentLoc.directionsButtonText : 'Get Directions on Google Maps'
  const directionsUrl = currentLoc.directionsUrl || `https://maps.google.com/maps?q=${encodeURIComponent(currentLoc.name + ' ' + (currentLoc.address || ''))}`

  // Bottom Features Bar
  const f1Title = data.feature1Title !== undefined ? data.feature1Title : DEFAULT_OFFICE_SETTINGS.feature1Title
  const f1Desc = data.feature1Desc !== undefined ? data.feature1Desc : DEFAULT_OFFICE_SETTINGS.feature1Desc
  const f1Icon = data.feature1Icon !== undefined ? data.feature1Icon : DEFAULT_OFFICE_SETTINGS.feature1Icon

  const f2Title = data.feature2Title !== undefined ? data.feature2Title : DEFAULT_OFFICE_SETTINGS.feature2Title
  const f2Desc = data.feature2Desc !== undefined ? data.feature2Desc : DEFAULT_OFFICE_SETTINGS.feature2Desc
  const f2Icon = data.feature2Icon !== undefined ? data.feature2Icon : DEFAULT_OFFICE_SETTINGS.feature2Icon

  const f3Title = data.feature3Title !== undefined ? data.feature3Title : DEFAULT_OFFICE_SETTINGS.feature3Title
  const f3Desc = data.feature3Desc !== undefined ? data.feature3Desc : DEFAULT_OFFICE_SETTINGS.feature3Desc
  const f3Icon = data.feature3Icon !== undefined ? data.feature3Icon : DEFAULT_OFFICE_SETTINGS.feature3Icon

  const motto1 = data.mottoLine1 !== undefined ? data.mottoLine1 : DEFAULT_OFFICE_SETTINGS.mottoLine1
  const motto2 = data.mottoLine2 !== undefined ? data.mottoLine2 : DEFAULT_OFFICE_SETTINGS.mottoLine2

  const hasF1 = Boolean((f1Title ?? '').trim() || (f1Desc ?? '').trim())
  const hasF2 = Boolean((f2Title ?? '').trim() || (f2Desc ?? '').trim())
  const hasF3 = Boolean((f3Title ?? '').trim() || (f3Desc ?? '').trim())
  const hasMotto = Boolean((motto1 ?? '').trim() || (motto2 ?? '').trim())
  const hasBottomBar = showFeaturesBar && (hasF1 || hasF2 || hasF3 || hasMotto)

  return (
    <section className="ol-section-wrapper" id="office-locations">
      {/* Translucent background watermark pin */}
      <svg className="ol-bg-pin-watermark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="rgba(200,90,23,0.06)" />
        <circle cx="12" cy="9" r="2.5" fill="rgba(200,90,23,0.12)" />
      </svg>

      <div className="ol-container">
        {/* Section Header with floating cursive accents */}
        {showHeader && (
          <div className="ol-header">
            {/* Top-Left Cursive Accent */}
            {hasLeftScript && (
              <div className="ol-script-accent-left">
                {Boolean((leftScriptLine1 ?? '').trim()) && <>{leftScriptLine1}<br /></>}
                {Boolean((leftScriptLine2 ?? '').trim()) && <>{leftScriptLine2}<br /></>}
                {Boolean((leftScriptLine3 ?? '').trim()) && <>{leftScriptLine3}</>}
              </div>
            )}

            {/* Top-Right Cursive Accent */}
            {hasRightScript && (
              <div className="ol-script-accent-right">
                {Boolean((rightScriptLine1 ?? '').trim()) && <>{rightScriptLine1}<br /></>}
                {Boolean((rightScriptLine2 ?? '').trim()) && <>{rightScriptLine2}</>}
              </div>
            )}

            {/* Centered Eyebrow */}
            {Boolean((eyebrow ?? '').trim()) && (
              <div className="ol-eyebrow-wrap">
                <span className="ol-eyebrow-line"></span>
                <span>{eyebrow}</span>
                <span className="ol-eyebrow-line"></span>
              </div>
            )}

            {/* Title & Subtitle */}
            {Boolean((title ?? '').trim()) && <h2 className="ol-main-title">{title}</h2>}
            {Boolean((subtitle ?? '').trim()) && <p className="ol-subtitle">{subtitle}</p>}
          </div>
        )}

        {/* Multi-Location Switcher Tabs (Rendered if > 1 location exists and card is visible) */}
        {showCard && visibleLocations.length > 1 && (
          <div 
            className="ol-location-selector-tabs"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <button 
              type="button" 
              className="ol-nav-arrow-btn" 
              onClick={handlePrev}
              title="Previous location"
              aria-label="Previous location"
            >
              <i className="fa-solid fa-chevron-left" />
            </button>

            {visibleLocations.map((loc, idx) => (
              <button
                key={loc.id || idx}
                className={`ol-tab-btn ${activeIdx === idx ? 'active' : ''}`}
                onClick={() => setActiveIdx(idx)}
                type="button"
              >
                <i className="fa-solid fa-location-dot ol-tab-icon" />
                <span>{loc.name || `Location ${idx + 1}`}</span>
              </button>
            ))}

            <button 
              type="button" 
              className="ol-nav-arrow-btn" 
              onClick={handleNext}
              title="Next location"
              aria-label="Next location"
            >
              <i className="fa-solid fa-chevron-right" />
            </button>
          </div>
        )}

        {/* Main Split Location Card */}
        {showCard && visibleLocations.length > 0 && (
          <div 
            key={currentLoc.id || activeIdx}
            className="ol-main-card ol-card-fade"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
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
                {Boolean((currentLoc.tagline ?? '').trim()) && (
                  <div className="ol-tagline-row">
                    <div className="ol-tagline-icon">
                      <i className="fa-solid fa-building-columns" />
                    </div>
                    <span className="ol-tagline-text">{currentLoc.tagline}</span>
                  </div>
                )}

                {/* Office Name */}
                {Boolean((currentLoc.name ?? '').trim()) && (
                  <h3 className="ol-office-name">{currentLoc.name}</h3>
                )}

                {/* Addresses (Supports Address 1, Address 2, etc. each with Line 1, 2, 3...) */}
                {(() => {
                  const addressBlocks = getLocationAddresses(currentLoc)
                  const validBlocks = addressBlocks.filter(b => (b.lines || []).some(l => (l ?? '').trim()))
                  if (validBlocks.length === 0) return null

                  return (
                    <div className="ol-addresses-container" style={{ display: 'flex', flexDirection: 'column', gap: validBlocks.length > 1 ? '0.85rem' : '0.4rem', margin: '0.25rem 0' }}>
                      {validBlocks.map((block, bIdx) => {
                        const activeLines = (block.lines || []).map(l => (typeof l === 'string' ? l : '').trim()).filter(Boolean)
                        if (activeLines.length === 0) return null

                        return (
                          <div key={block.id || bIdx} className="ol-address-block" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                            <div className="ol-address-icon-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '0.2rem' }}>
                              <i className="fa-solid fa-location-dot ol-address-pin-icon" />
                              {validBlocks.length > 1 && (
                                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#7B1B2E', background: '#F8E8EB', padding: '1px 5px', borderRadius: '4px', marginTop: '3px' }}>
                                  #{bIdx + 1}
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                              {validBlocks.length > 1 && Boolean((block.title ?? '').trim()) && (
                                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#7B1B2E', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '2px' }}>
                                  {block.title}
                                </div>
                              )}
                              {activeLines.map((line, lIdx) => (
                                <div key={lIdx} className={`ol-address-line ${lIdx === 0 ? 'ol-address-line-primary' : 'ol-address-line-sub'}`} style={{ lineHeight: '1.45' }}>
                                  {line}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}

                {/* 3 Quick Contact Info Pills */}
                <div className="ol-contact-grid">
                  {/* Phone Pill - Supports Single or Multiple Phone Numbers */}
                  {Boolean(phoneList.length > 0 || (phoneLabel ?? '').trim()) && (
                    <div className="ol-contact-pill">
                      <div className="ol-pill-icon-circle">
                        <i className="fa-solid fa-phone" />
                      </div>
                      {phoneList.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          {phoneList.map((ph, pIdx) => (
                            <a
                              key={pIdx}
                              href={`tel:${ph.replace(/\s+/g, '')}`}
                              className="ol-pill-value"
                              style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                              {ph}
                            </a>
                          ))}
                        </div>
                      )}
                      {Boolean((phoneLabel ?? '').trim()) && (
                        <div className="ol-pill-label">{phoneLabel}</div>
                      )}
                    </div>
                  )}

                  {/* Email Pill */}
                  {Boolean((emailVal ?? '').trim() || (emailLabel ?? '').trim()) && (
                    <div className="ol-contact-pill">
                      <div className="ol-pill-icon-circle">
                        <i className="fa-solid fa-envelope" />
                      </div>
                      {Boolean((emailVal ?? '').trim()) && (
                        <a href={`mailto:${emailVal}`} className="ol-pill-value" style={{ textDecoration: 'none', color: 'inherit', wordBreak: 'break-all' }}>
                          {emailVal}
                        </a>
                      )}
                      {Boolean((emailLabel ?? '').trim()) && (
                        <div className="ol-pill-label">{emailLabel}</div>
                      )}
                    </div>
                  )}

                  {/* Working Hours Pill */}
                  {Boolean((hoursDays ?? '').trim() || (hoursTime ?? '').trim()) && (
                    <div className="ol-contact-pill">
                      <div className="ol-pill-icon-circle">
                        <i className="fa-regular fa-clock" />
                      </div>
                      {Boolean((hoursDays ?? '').trim()) && (
                        <div className="ol-pill-value">{hoursDays}</div>
                      )}
                      {Boolean((hoursTime ?? '').trim()) && (
                        <div className="ol-pill-label">{hoursTime}</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Get Directions CTA Button */}
                {Boolean((btnText ?? '').trim()) && (
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ol-directions-cta"
                  >
                    <i className="fa-solid fa-location-arrow" />
                    <span>{btnText}</span>
                    <i className="fa-solid fa-arrow-right cta-arrow" />
                  </a>
                )}
              </div>

              {/* Quote Banner Box */}
              {Boolean((currentLoc.quote ?? '').trim()) && (
                <div className="ol-quote-box">
                  <div className="ol-quote-content">
                    <span className="ol-quote-icon">“</span>
                    <p className="ol-quote-text">
                      {currentLoc.quote}
                    </p>
                    <div className="ol-quote-underline"></div>
                  </div>

                  {/* Historic Dome Building Watermark SVG */}
                  <svg className="ol-quote-building-watermark" viewBox="0 0 120 100" fill="none" stroke="#C85A17" strokeWidth="1.2">
                    <path d="M 60 15 A 30 30 0 0 1 90 45 L 30 45 A 30 30 0 0 1 60 15 Z" fill="rgba(200,90,23,0.04)" />
                    <path d="M 60 5 L 60 15" strokeWidth="1.5" />
                    <circle cx="60" cy="5" r="2.5" fill="#C85A17" />
                    <path d="M 25 45 L 95 45" />
                    <path d="M 30 45 L 30 85 L 90 85 L 90 45" />
                    <line x1="40" y1="45" x2="40" y2="85" />
                    <line x1="53" y1="45" x2="53" y2="85" />
                    <line x1="67" y1="45" x2="67" y2="85" />
                    <line x1="80" y1="45" x2="80" y2="85" />
                    <line x1="20" y1="85" x2="100" y2="85" strokeWidth="1.8" />
                    <line x1="15" y1="90" x2="105" y2="90" strokeWidth="2" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Highlights Feature Bar */}
        {hasBottomBar && (
          <div className="ol-features-bar">
            {/* Feature 1 */}
            {hasF1 && (
              <div className="ol-feature-item">
                <div className="ol-feature-icon-circle">
                  <i className={`fa-solid ${f1Icon || 'fa-graduation-cap'}`} />
                </div>
                <div className="ol-feature-text-wrap">
                  {Boolean((f1Title ?? '').trim()) && <div className="ol-feature-title">{f1Title}</div>}
                  {Boolean((f1Desc ?? '').trim()) && <div className="ol-feature-desc">{f1Desc}</div>}
                </div>
              </div>
            )}

            {/* Feature 2 */}
            {hasF2 && (
              <div className="ol-feature-item">
                <div className="ol-feature-icon-circle">
                  <i className={`fa-solid ${f2Icon || 'fa-users'}`} />
                </div>
                <div className="ol-feature-text-wrap">
                  {Boolean((f2Title ?? '').trim()) && <div className="ol-feature-title">{f2Title}</div>}
                  {Boolean((f2Desc ?? '').trim()) && <div className="ol-feature-desc">{f2Desc}</div>}
                </div>
              </div>
            )}

            {/* Feature 3 */}
            {hasF3 && (
              <div className="ol-feature-item">
                <div className="ol-feature-icon-circle">
                  <i className={`fa-solid ${f3Icon || 'fa-shield-halved'}`} />
                </div>
                <div className="ol-feature-text-wrap">
                  {Boolean((f3Title ?? '').trim()) && <div className="ol-feature-title">{f3Title}</div>}
                  {Boolean((f3Desc ?? '').trim()) && <div className="ol-feature-desc">{f3Desc}</div>}
                </div>
              </div>
            )}

            {/* Right Side Motto Tag */}
            {hasMotto && (
              <div className="ol-motto-wrap">
                <div className="ol-motto-text">
                  {Boolean((motto1 ?? '').trim()) && <>{motto1}<br /></>}
                  {Boolean((motto2 ?? '').trim()) && <>{motto2}</>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
