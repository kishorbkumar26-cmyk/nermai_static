import { useState, useEffect, useRef } from 'react'
import { fbFirestore } from '../firebase/firestore'
import { driveStorage } from '../services/driveStorage'
import { LMS_URL } from '../constants'

const DEFAULT_SLIDES = [
  {
    id: 'default_0',
    urlDesktop: '',
    urlMobile: '',
    url: '',
    title: 'நேர்மையான கல்வி',
    subtitle: 'வெற்றிக்கான உறுதியான பாதை',
    cta: 'Enroll Now'
  }
]

export default function HeroCarousel() {
  const [slides, setSlides] = useState(DEFAULT_SLIDES)
  const [active, setActive] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    const unsub = fbFirestore.onHeroSlidesChanged(items => {
      setSlides(items.length > 0 ? items : DEFAULT_SLIDES)
    })
    return () => unsub()
  }, [])

  const resetTimer = () => {
    clearInterval(timerRef.current)
    if (slides.length <= 1) return
    timerRef.current = setInterval(() => {
      setActive(a => (a + 1) % slides.length)
    }, 5500)
  }

  useEffect(() => {
    resetTimer()
    return () => clearInterval(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length])

  const goTo = (i) => {
    if (isTransitioning || i === active) return
    setIsTransitioning(true)
    setTimeout(() => setIsTransitioning(false), 600)
    setActive(i)
    resetTimer()
  }

  const prev = () => goTo((active - 1 + slides.length) % slides.length)
  const next = () => goTo((active + 1) % slides.length)

  return (
    <section className="hero-carousel-section" id="home" aria-label="Hero slideshow">
      <div className="hero-carousel">
        {/* Slides */}
        {slides.map((slide, i) => {
          const desktopUrl = driveStorage.formatImageUrl(slide.urlDesktop || slide.url)
          const mobileUrl = driveStorage.formatImageUrl(slide.urlMobile || slide.urlDesktop || slide.url)
          const isActive = i === active

          return (
            <div
              key={slide.id}
              className={`hero-slide${isActive ? ' hero-slide--active' : ''}`}
              aria-hidden={!isActive}
            >
              {/* Image: uses <picture> for responsive PC vs Mobile images */}
              {(desktopUrl || mobileUrl) ? (
                <picture className="hero-slide-picture">
                  {mobileUrl && (
                    <source
                      media="(max-width: 768px)"
                      srcSet={mobileUrl}
                    />
                  )}
                  <img
                    src={desktopUrl || mobileUrl}
                    alt={slide.title || `Nermai Academy slide ${i + 1}`}
                    className="hero-slide-img"
                    onError={(e) => driveStorage.handleImageError(e, '')}
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                </picture>
              ) : (
                /* Placeholder when no image uploaded yet */
                <div className="hero-slide-placeholder">
                  <div className="hero-slide-placeholder-inner">
                    <i className="fa-solid fa-image" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.4 }} />
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                      நேர்மை IAS Academy
                    </div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '1rem' }}>
                      Admin panel மூலம் banner படங்கள் சேர்க்கவும்
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.45, lineHeight: 1.6 }}>
                      🖥️ PC: 1920 × 600 px &nbsp;·&nbsp; 📱 Mobile: 768 × 1024 px
                    </div>
                  </div>
                </div>
              )}

              {/* Text overlay */}
              {(slide.title || slide.subtitle || slide.cta) && (
                <div className="hero-slide-overlay">
                  <div className="hero-slide-content container-wide">
                    {slide.title && (
                      <h2 className="hero-slide-title">{slide.title}</h2>
                    )}
                    {slide.subtitle && (
                      <p className="hero-slide-subtitle">{slide.subtitle}</p>
                    )}
                    {slide.cta && (
                      <a
                        href={slide.ctaLink || LMS_URL}
                        className="btn btn-primary hero-slide-cta"
                        target={slide.ctaLink && slide.ctaLink !== '#' ? '_blank' : undefined}
                        rel="noopener noreferrer"
                      >
                        {slide.cta}
                        <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Prev / Next arrows */}
        {slides.length > 1 && (
          <>
            <button
              className="hero-arrow hero-arrow--prev"
              onClick={prev}
              aria-label="Previous slide"
            >
              <i className="fa-solid fa-chevron-left" />
            </button>
            <button
              className="hero-arrow hero-arrow--next"
              onClick={next}
              aria-label="Next slide"
            >
              <i className="fa-solid fa-chevron-right" />
            </button>
          </>
        )}

        {/* Progress bar */}
        {slides.length > 1 && (
          <div className="hero-progress-bar">
            <div
              className="hero-progress-fill"
              key={active}
            />
          </div>
        )}

        {/* Dots */}
        {slides.length > 1 && (
          <div className="hero-dots" role="tablist" aria-label="Slide navigation">
            {slides.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === active}
                className={`hero-dot${i === active ? ' hero-dot--active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Slide counter */}
        {slides.length > 1 && (
          <div className="hero-counter" aria-live="polite">
            <span className="hero-counter-current">{String(active + 1).padStart(2, '0')}</span>
            <span className="hero-counter-sep">/</span>
            <span className="hero-counter-total">{String(slides.length).padStart(2, '0')}</span>
          </div>
        )}
      </div>
    </section>
  )
}
