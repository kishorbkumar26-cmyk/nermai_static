import React from 'react'

export default function About() {
  return (
    <section className="about-section section" id="about">
      <div className="container">
        <div className="about-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)', alignItems: 'center' }}>
          <div className="about-content reveal">
            <span className="eyebrow">ABOUT NERMAI</span>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: 'var(--space-6)' }}>
              Empowering Aspirants with<br />
              <span style={{ color: 'var(--maroon)' }}>Trusted Guidance & Excellence</span>
            </h2>
            <p className="section-desc" style={{ textAlign: 'left', marginLeft: 0, marginBottom: 'var(--space-4)' }}>
              Nermai IAS Academy is committed to providing high-quality, accessible, and exam-focused mentorship for students preparing for competitive government examinations.
            </p>
            <p className="section-desc" style={{ textAlign: 'left', marginLeft: 0, marginBottom: 'var(--space-8)' }}>
              We are a team of dedicated subject experts and experienced civil servants committed to providing affordable, result-oriented education. Whether you are preparing for UPSC, TNPSC, TN Police, or Banking exams, we provide the structured guidance needed to achieve certain victory.
            </p>
            
            <ul className="about-bullets" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
              <li><i className="fa-solid fa-circle-check" style={{ color: 'var(--saffron)', marginRight: '8px' }}></i> Experienced Faculty</li>
              <li><i className="fa-solid fa-circle-check" style={{ color: 'var(--saffron)', marginRight: '8px' }}></i> Result Oriented Training</li>
              <li><i className="fa-solid fa-circle-check" style={{ color: 'var(--saffron)', marginRight: '8px' }}></i> Affordable Education</li>
              <li><i className="fa-solid fa-circle-check" style={{ color: 'var(--saffron)', marginRight: '8px' }}></i> Online + Offline Learning</li>
            </ul>

            <a href="#contact" className="btn btn-outline">
              Talk to Us
            </a>
          </div>

          <div className="about-image reveal" style={{ transitionDelay: '0.2s', position: 'relative' }}>
            <div style={{ aspectRatio: '4/3', backgroundColor: 'var(--gray-200)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative' }}>
              {/* Fallback pattern if no image */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--maroon-light) 0%, var(--maroon-deep) 100%)', opacity: 0.1 }}></div>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)' }}>
                <i className="fa-solid fa-building-columns" style={{ fontSize: '4rem' }}></i>
              </div>
            </div>
            {/* Decorative block */}
            <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', backgroundColor: 'var(--saffron)', padding: 'var(--space-6)', borderRadius: 'var(--radius-md)', color: 'var(--white)', boxShadow: 'var(--shadow-md)' }}>
              <div className="mono" style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>14+</div>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Years of Trust</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
