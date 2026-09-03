import { useState, useEffect, useRef } from 'react'
import { fbFirestore } from '../firebase/firestore'

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [offset, setOffset] = useState(0)
  const trackRef = useRef(null)

  useEffect(() => {
    const unsub = fbFirestore.onTestimonialsChanged(items => setTestimonials(items))
    return () => unsub()
  }, [])

  const perView = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3
  const maxOffset = Math.max(0, testimonials.length - perView)

  const prev = () => setOffset(o => Math.max(0, o - 1))
  const next = () => setOffset(o => Math.min(maxOffset, o + 1))

  return (
    <section className="testimonials-section section" id="testimonials">
      <div className="container">
        <div className="section-header">
          <span className="eyebrow">💬 Student Reviews</span>
          <h2 className="section-title">Hear What They Say</h2>
          <p className="section-desc">
            Honest feedback from successful Nermai students.
          </p>
        </div>

        <div className="testimonials-carousel" style={{ overflow: 'hidden' }}>
          <div
            className="testimonials-track"
            ref={trackRef}
            style={{ transform: `translateX(calc(-${offset * (100 / 3 + 2)}%))` }}
          >
            {testimonials.map((t) => (
              <div key={t.id} className="testimonial-card" style={{ border: 'none', boxShadow: 'none', background: 'transparent', padding: '0 1rem' }}>
                <div style={{ fontSize: '6rem', color: 'rgba(123,27,46,0.1)', lineHeight: 0.8, fontFamily: 'var(--font-display)' }}>"</div>
                <blockquote style={{ fontSize: 'clamp(1.1rem, 2vw, 1.35rem)', fontStyle: 'italic', lineHeight: 1.6, color: 'var(--ink)', marginBottom: '2rem' }}>
                  {t.quote}
                </blockquote>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--maroon)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem' }}>
                    {(t.name || 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--ink)' }}>{t.name}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {testimonials.length > 3 && (
          <div className="testimonials-controls">
            <button
              className="testimonials-btn"
              onClick={prev}
              disabled={offset === 0}
              aria-label="Previous"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button
              className="testimonials-btn"
              onClick={next}
              disabled={offset >= maxOffset}
              aria-label="Next"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
