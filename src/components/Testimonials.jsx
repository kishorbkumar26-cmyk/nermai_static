import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { fbFirestore } from '../firebase/firestore'
import { driveStorage } from '../services/driveStorage'
import './Testimonials.css'
import { checkSectionVersion } from '../utils/imageCacheVersion'
import { invalidateCachedUrls } from '../utils/imageCache'

export const DEFAULT_TESTIMONIALS_CONFIG = {
  eyebrow: 'STUDENT REVIEWS',
  title: 'Hear What They Say',
  subtitle: 'Honest feedback from successful Nermai students.',
  leftNoteLine1: 'Same Dedication.',
  leftNoteLine2: 'A Brighter Tomorrow.',
  rightScriptLine1: 'Real Aspirants',
  rightScriptLine2: 'Real Stories',
  rightScriptLine3: 'Real Success',
  bottomTagline: 'THOUSANDS OF DREAMS. A STRONGER INDIA.'
}

export default function Testimonials({ customConfig }) {
  const [testimonials, setTestimonials] = useState([])
  const [config, setConfig] = useState(customConfig || DEFAULT_TESTIMONIALS_CONFIG)
  const [activeIdx, setActiveIdx] = useState(0)
  const [perView, setPerView] = useState(3)

  useEffect(() => {
    const unsub = fbFirestore.onTestimonialsChanged(items => {
      if (items && items.length > 0) {
        setTestimonials(items)

        // Per-image cache invalidation on DB change
        const versionItems = items
          .map(t => {
            const raw = t.imageUrl || t.avatar || t.photo
            const url = raw ? driveStorage.formatImageUrl(raw) : null
            return url ? { url, updatedAt: t.updatedAt?.toMillis?.() || t.updatedAt || '' } : null
          })
          .filter(Boolean)

        const { staleUrls } = checkSectionVersion('testimonials', versionItems)
        if (staleUrls.length) invalidateCachedUrls(staleUrls)

        // Preload avatar images in the background
        driveStorage.preloadImages(
          items.map(t => t.imageUrl || t.avatar || t.photo).filter(Boolean)
        )
      } else {
        fbFirestore.getTestimonials().then(res => setTestimonials(res || []))
      }
    })

    fbFirestore.getSettings().then(s => {
      if (s?.homeContent?.testimonialsConfig) {
        setConfig(prev => ({ ...DEFAULT_TESTIMONIALS_CONFIG, ...s.homeContent.testimonialsConfig }))
      }
    })

    const unsubSettings = fbFirestore.onSettingsChanged?.(s => {
      if (s?.homeContent?.testimonialsConfig) {
        setConfig(prev => ({ ...DEFAULT_TESTIMONIALS_CONFIG, ...s.homeContent.testimonialsConfig }))
      }
    })

    return () => {
      unsub && unsub()
      unsubSettings && unsubSettings()
    }
  }, [])

  // Handle responsive perView calculation
  useEffect(() => {
    const updatePerView = () => {
      if (window.innerWidth < 768) {
        setPerView(1)
      } else if (window.innerWidth < 1200) {
        setPerView(2)
      } else {
        setPerView(3)
      }
    }
    updatePerView()
    window.addEventListener('resize', updatePerView)
    return () => window.removeEventListener('resize', updatePerView)
  }, [])

  if (!testimonials || testimonials.length === 0) {
    return null
  }

  const items = testimonials
  const total = items.length
  const maxOffset = Math.max(0, total - perView)
  const currentOffset = Math.min(activeIdx, maxOffset)

  const handlePrev = () => {
    setActiveIdx(prev => (prev === 0 ? maxOffset : prev - 1))
  }

  const handleNext = () => {
    setActiveIdx(prev => (prev >= maxOffset ? 0 : prev + 1))
  }

  const renderCard = (t, idx, highlighted) => {
    const avatarUrl = t.imageUrl || t.avatar || t.photo
      ? driveStorage.formatImageUrl(t.imageUrl || t.avatar || t.photo)
      : null

    return (
      <div
        key={t.id || idx}
        className={`testimonial-card-item ${highlighted ? 'active-highlight' : ''}`}
        onClick={() => setActiveIdx(idx)}
      >
        <div className="card-top-quote">"</div>
        <p className="card-quote-text">{t.quote || t.text || t.content}</p>
        <div className="card-author-row">
          {avatarUrl ? (
            <img src={avatarUrl} alt={t.name} crossOrigin="anonymous" className="card-avatar-img" />
          ) : (
            <div className="card-avatar-fallback">
              {(t.name || 'A')[0].toUpperCase()}
            </div>
          )}
          <div className="card-author-meta">
            <h4 className="card-author-name">{t.name}</h4>
            <span className="card-author-role">{t.role || t.exam || t.designation || 'Nermai Student'}</span>
          </div>
        </div>
        <div className="card-bg-close-quote" aria-hidden="true">"</div>
      </div>
    )
  }

  const hasLeftNote = Boolean((config.leftNoteLine1 ?? '').trim() || (config.leftNoteLine2 ?? '').trim())
  const hasRightScript = Boolean((config.rightScriptLine1 ?? '').trim() || (config.rightScriptLine2 ?? '').trim() || (config.rightScriptLine3 ?? '').trim())

  // ── Mobile (perView === 1): Simple single-card display ───────────────────
  if (perView === 1) {
    const currentItem = items[currentOffset]
    return (
      <section className="testimonials-section-wrap" id="testimonials" aria-label="Student Reviews">
        <div className="container" style={{ maxWidth: '1480px' }}>

          {/* Section Header */}
          <div className="testimonials-header-box">
            {Boolean((config.eyebrow ?? '').trim()) && (
              <div className="testimonials-top-tag">
                <span className="tag-line" />
                <span className="tag-text">{config.eyebrow}</span>
                <span className="tag-line" />
              </div>
            )}
            {Boolean((config.title ?? '').trim()) && (
              <h2 className="testimonials-main-title">{config.title}</h2>
            )}
            {Boolean((config.subtitle ?? '').trim()) && (
              <p className="testimonials-subtitle">{config.subtitle}</p>
            )}
          </div>

          {/* Single Card */}
          <div className="testimonials-mobile-single">
            {currentItem && renderCard(currentItem, currentOffset, true)}

            {/* Mobile Arrow Controls */}
            {total > 1 && (
              <div className="testimonials-mobile-controls">
                <button
                  className="testimonials-nav-arrow arrow-left"
                  onClick={handlePrev}
                  aria-label="Previous Review"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="testimonials-dots-group">
                  {items.map((_, i) => (
                    <button
                      key={i}
                      className={`testimonial-dot ${i === currentOffset ? 'active' : ''}`}
                      onClick={() => setActiveIdx(i)}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  className="testimonials-nav-arrow arrow-right"
                  onClick={handleNext}
                  aria-label="Next Review"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>

          {Boolean((config.bottomTagline ?? '').trim()) && (
            <div className="testimonials-bottom-tagline" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              {config.bottomTagline}
            </div>
          )}

        </div>
      </section>
    )
  }

  // ── Desktop / Tablet (perView >= 2): Full track carousel ─────────────────
  return (
    <section className="testimonials-section-wrap" id="testimonials" aria-label="Student Reviews">
      <div className="container" style={{ maxWidth: '1480px' }}>

        {/* Section Header */}
        <div className="testimonials-header-box">
          {Boolean((config.eyebrow ?? '').trim()) && (
            <div className="testimonials-top-tag">
              <span className="tag-line" />
              <span className="tag-text">{config.eyebrow}</span>
              <span className="tag-line" />
            </div>
          )}
          {Boolean((config.title ?? '').trim()) && (
            <h2 className="testimonials-main-title">{config.title}</h2>
          )}
          {Boolean((config.subtitle ?? '').trim()) && (
            <p className="testimonials-subtitle">{config.subtitle}</p>
          )}
        </div>

        {/* Content Row with Left Accent, Center Cards Track, Right Accent */}
        <div className="testimonials-content-grid">

          {/* Far Left Decorative Element */}
          {hasLeftNote ? (
            <div className="testimonials-accent-left" aria-hidden="true">
              <div className="giant-quote-mark">"</div>
              <div className="left-handwriting">
                {Boolean((config.leftNoteLine1 ?? '').trim()) && <span>{config.leftNoteLine1}</span>}
                {Boolean((config.leftNoteLine2 ?? '').trim()) && <span className="sub">{config.leftNoteLine2}</span>}
              </div>
              <svg className="left-dome-svg" viewBox="0 0 100 60" fill="none" stroke="#C85A17" strokeWidth="1">
                <path d="M20 55 V35 L50 15 L80 35 V55 H20 Z M50 15 V5 M35 35 H65 M40 55 V42 H60 V55" opacity="0.3" />
                <circle cx="50" cy="25" r="5" stroke="#C85A17" opacity="0.3" />
              </svg>
            </div>
          ) : (
            <div className="testimonials-accent-left-spacer" aria-hidden="true" />
          )}

          {/* Center Carousel Slider */}
          <div className="testimonials-carousel-box">

            {/* Left Arrow */}
            <button
              className="testimonials-nav-arrow arrow-left"
              onClick={handlePrev}
              disabled={maxOffset === 0}
              aria-label="Previous Review"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Viewport for Cards */}
            <div className="testimonials-cards-viewport">
              <div
                className="testimonials-cards-track"
                style={{
                  transform: `translateX(calc(-${currentOffset} * ((100% - ${(perView - 1) * 1.25}rem) / ${perView} + 1.25rem)))`,
                  transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {items.map((t, idx) =>
                  renderCard(t, idx, idx === activeIdx)
                )}
              </div>
            </div>

            {/* Right Arrow */}
            <button
              className="testimonials-nav-arrow arrow-right"
              onClick={handleNext}
              disabled={maxOffset === 0}
              aria-label="Next Review"
            >
              <ChevronRight size={20} />
            </button>

          </div>

          {/* Far Right Tilted Script Accent */}
          {hasRightScript ? (
            <div className="testimonials-accent-right" aria-hidden="true">
              <div className="right-script-box">
                {Boolean((config.rightScriptLine1 ?? '').trim()) && <span>{config.rightScriptLine1}</span>}
                {Boolean((config.rightScriptLine2 ?? '').trim()) && <span>{config.rightScriptLine2}</span>}
                {Boolean((config.rightScriptLine3 ?? '').trim()) && <span className="accent-underline">{config.rightScriptLine3}</span>}
              </div>
            </div>
          ) : (
            <div className="testimonials-accent-right-spacer" aria-hidden="true" />
          )}

        </div>

        {/* Footer Bar: Dots & Tagline */}
        <div className="testimonials-footer-bar">
          <div className="testimonials-dots-group">
            {Array.from({ length: maxOffset + 1 }).map((_, i) => (
              <button
                key={i}
                className={`testimonial-dot ${i === currentOffset ? 'active' : ''}`}
                onClick={() => setActiveIdx(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          {Boolean((config.bottomTagline ?? '').trim()) && (
            <div className="testimonials-bottom-tagline">
              {config.bottomTagline}
            </div>
          )}
        </div>

      </div>
    </section>
  )
}
