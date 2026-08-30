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
          <span className="eyebrow">💬 மாணவர் கருத்துகள்</span>
          <h2 className="section-title">அவர்கள் சொல்வதை கேளுங்கள்</h2>
          <p className="section-desc">
            நேர்மையில் பயிற்சி பெற்று வெற்றி பெற்றவர்களின் நேர்மையான கருத்துகள்.
          </p>
        </div>

        <div className="testimonials-carousel" style={{ overflow: 'hidden' }}>
          <div
            className="testimonials-track"
            ref={trackRef}
            style={{ transform: `translateX(calc(-${offset * (100 / 3 + 2)}%))` }}
          >
            {testimonials.map((t) => (
              <div key={t.id} className="testimonial-card">
                <div className="testimonial-quote-mark">"</div>
                <blockquote className="testimonial-text">{t.quote}</blockquote>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">
                    {(t.name || 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
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
