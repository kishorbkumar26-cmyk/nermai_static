import React from 'react'

export default function WhyNermai() {
  return (
    <section className="why-section section" id="about" style={{ backgroundColor: 'var(--maroon-deep)', color: 'var(--cream)' }}>
      <div className="container-narrow">
        <div className="section-header" style={{ textAlign: 'left', marginBottom: 'var(--space-16)' }}>
          <span className="eyebrow" style={{ color: 'var(--saffron)' }}>DIFFERENCE</span>
          <h2 className="section-title" style={{ color: 'var(--white)', fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
            ஏன் நேர்மையை<br />தேர்ந்தெடுக்க வேண்டும்?
          </h2>
        </div>

        <div className="why-editorial-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
          
          <div className="why-item reveal" style={{ borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: 'var(--space-6)' }}>
            <div className="mono" style={{ color: 'var(--saffron)', fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>01</div>
            <h3 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-3)' }}>தமிழ் வழி பயிற்சி</h3>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: '600px' }}>
              Competitive exam preparation uniquely designed and delivered for Tamil-medium aspirants to ensure crystal-clear conceptual understanding.
            </p>
          </div>

          <div className="why-item reveal" style={{ borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: 'var(--space-6)' }}>
            <div className="mono" style={{ color: 'var(--saffron)', fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>02</div>
            <h3 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-3)' }}>முறையான பாடத்திட்டம்</h3>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: '600px' }}>
              Highly structured learning modules strictly based on the latest examination requirements and syllabus updates.
            </p>
          </div>

          <div className="why-item reveal" style={{ borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: 'var(--space-6)' }}>
            <div className="mono" style={{ color: 'var(--saffron)', fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>03</div>
            <h3 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-3)' }}>தேர்வு பயிற்சி</h3>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: '600px' }}>
              Rigorous regular mock tests, daily practice sets, and detailed evaluations to consistently measure and improve your preparation.
            </p>
          </div>

          <div className="why-item reveal" style={{ borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: 'var(--space-6)' }}>
            <div className="mono" style={{ color: 'var(--saffron)', fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>04</div>
            <h3 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-3)' }}>தொடர்ச்சியான வழிகாட்டுதல்</h3>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: '600px' }}>
              Consistent academic guidance, personal mentorship, and psychological support throughout your demanding preparation journey.
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
