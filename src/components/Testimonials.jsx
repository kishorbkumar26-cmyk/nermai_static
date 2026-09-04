import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { fbFirestore } from '../firebase/firestore'
import { driveStorage } from '../services/driveStorage'
import './Testimonials.css'

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [perView, setPerView] = useState(3)

  useEffect(() => {
    const unsub = fbFirestore.onTestimonialsChanged(items => {
      if (items && items.length > 0) {
        setTestimonials(items)
      } else {
        fbFirestore.getTestimonials().then(res => setTestimonials(res || []))
      }
    })
    return () => unsub && unsub()
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
            <img src={avatarUrl} alt={t.name} className="card-avatar-img" />
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

  // ── Mobile (perView === 1): Simple single-card display ───────────────────
  if (perView === 1) {
    const currentItem = items[currentOffset]
    return (
      <section className="testimonials-section-wrap" id="testimonials" aria-label="Student Reviews">
        <div className="container" style={{ maxWidth: '1480px' }}>

          {/* Section Header */}
          <div className="testimonials-header-box">
            <div className="testimonials-top-tag">
              <span className="tag-line" />
              <span className="tag-text">STUDENT REVIEWS</span>
              <span className="tag-line" />
            </div>
            <h2 className="testimonials-main-title">Hear What They Say</h2>
            <p className="testimonials-subtitle">Honest feedback from successful Nermai students.</p>
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

          <div className="testimonials-bottom-tagline" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            THOUSANDS OF DREAMS. A STRONGER INDIA.
          </div>

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
          <div className="testimonials-top-tag">
            <span className="tag-line" />
            <span className="tag-text">STUDENT REVIEWS</span>
            <span className="tag-line" />
          </div>
          <h2 className="testimonials-main-title">Hear What They Say</h2>
          <p className="testimonials-subtitle">Honest feedback from successful Nermai students.</p>
        </div>

        {/* Content Row with Left Accent, Center Cards Track, Right Accent */}
        <div className="testimonials-content-grid">

          {/* Far Left Decorative Element */}
          <div className="testimonials-accent-left" aria-hidden="true">
            <div className="giant-quote-mark">"</div>
            <div className="left-handwriting">
              <span>Same Dedication.</span>
              <span className="sub">A Brighter Tomorrow.</span>
            </div>
            <svg className="left-dome-svg" viewBox="0 0 100 60" fill="none" stroke="#C85A17" strokeWidth="1">
              <path d="M20 55 V35 L50 15 L80 35 V55 H20 Z M50 15 V5 M35 35 H65 M40 55 V42 H60 V55" opacity="0.3" />
              <circle cx="50" cy="25" r="5" stroke="#C85A17" opacity="0.3" />
            </svg>
          </div>

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
          <div className="testimonials-accent-right" aria-hidden="true">
            <div className="right-script-box">
              <span>Real Aspirants</span>
              <span>Real Stories</span>
              <span className="accent-underline">Real Success</span>
            </div>
          </div>

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
          <div className="testimonials-bottom-tagline">
            THOUSANDS OF DREAMS. A STRONGER INDIA.
          </div>
        </div>

      </div>
    </section>
  )
}
