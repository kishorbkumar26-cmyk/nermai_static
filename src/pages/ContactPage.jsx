import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useReveal } from '../hooks/useReveal'
import { CONTACT, LMS_URL } from '../constants'

export default function ContactPage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  useReveal()
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Compose mailto — will open email client until a server-side form is wired
    const body = encodeURIComponent(
      `Name: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}\n\n${form.message}`
    )
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(form.subject || 'Enquiry from website')}&body=${body}`
    setSent(true)
  }

  return (
    <>
      <Header />
      <main style={{ paddingTop: '80px' }}>

        {/* Page hero */}
        <section className="page-hero" style={{ backgroundColor: 'var(--maroon)', color: 'var(--white)' }}>
          <div className="container">
            <div className="page-hero-inner">
              <span className="eyebrow" style={{ color: 'var(--saffron)', marginBottom: '1rem', display: 'block' }}>
                CONTACT US
              </span>
              <h1 className="display-large" style={{ color: 'var(--white)', marginBottom: '1rem' }}>
                Begin It's First Step to Success
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '540px', lineHeight: 1.8 }}>
                Contact us for registration, seat availability, feedback or complaints.
                We'll respond within one working day.
              </p>
            </div>
          </div>
        </section>

        {/* Contact content */}
        <section className="section" style={{ backgroundColor: 'var(--cream)' }}>
          <div className="container">
            <div className="contact-grid">

              {/* Info column */}
              <div className="contact-info reveal">
                <h2 className="section-title" style={{ marginBottom: '2rem' }}>Get in Touch</h2>

                <div className="contact-info-card">
                  <div className="contact-info-icon">
                    <i className="fa-solid fa-location-dot" />
                  </div>
                  <div>
                    <div className="contact-info-label">Address</div>
                    <div className="contact-info-value">
                      No. 156 / 3, (1st &amp; 2nd Floor),<br />
                      Nanbargal Nagar, Pondy – Villianur Main Road,<br />
                      Oulgaret, Puducherry – 605 010
                    </div>
                  </div>
                </div>

                <div className="contact-info-card">
                  <div className="contact-info-icon">
                    <i className="fa-solid fa-phone" />
                  </div>
                  <div>
                    <div className="contact-info-label">Phone</div>
                    {CONTACT.phones.map(ph => (
                      <div key={ph}>
                        <a href={`tel:${ph.replace(/\s/g, '')}`} className="contact-info-value contact-link">
                          {ph}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="contact-info-card">
                  <div className="contact-info-icon">
                    <i className="fa-solid fa-envelope" />
                  </div>
                  <div>
                    <div className="contact-info-label">Email</div>
                    <a href={`mailto:${CONTACT.email}`} className="contact-info-value contact-link">
                      {CONTACT.email}
                    </a>
                  </div>
                </div>

                {/* WhatsApp CTA */}
                <a
                  href={`https://wa.me/${CONTACT.phones[0].replace(/\D/g, '')}`}
                  className="btn btn-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  id="contact-whatsapp-btn"
                >
                  <i className="fa-brands fa-whatsapp" />
                  Chat on WhatsApp
                </a>

                {/* Enroll CTA */}
                <div style={{ marginTop: '1.5rem', padding: '1.25rem', backgroundColor: 'var(--maroon)', borderRadius: 'var(--radius-md)', color: 'var(--white)' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Ready to Enroll?</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '1rem' }}>
                    Join the LMS platform directly to access all courses, materials and tests.
                  </div>
                  <a href={LMS_URL} className="btn btn-lg" style={{ backgroundColor: 'var(--white)', color: 'var(--maroon)', width: '100%', justifyContent: 'center' }} id="contact-enroll-btn">
                    Enroll / Login
                    <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }} />
                  </a>
                </div>
              </div>

              {/* Form column */}
              <div className="contact-form-wrap reveal">
                {sent ? (
                  <div className="contact-success">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <h3>Message Sent!</h3>
                    <p style={{ color: 'var(--gray-500)' }}>
                      Your email client should have opened with a pre-filled message.
                      We'll get back to you shortly.
                    </p>
                    <button
                      className="btn btn-outline"
                      style={{ marginTop: '1.5rem' }}
                      onClick={() => setSent(false)}
                    >
                      Send Another
                    </button>
                  </div>
                ) : (
                  <form className="contact-form" onSubmit={handleSubmit} noValidate>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--maroon)' }}>Send a Message</h3>

                    <div className="contact-form-row">
                      <div className="ap-form-group">
                        <label htmlFor="cf-name">Your Name *</label>
                        <input
                          id="cf-name"
                          className="ap-input"
                          placeholder="Kavitha S."
                          required
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        />
                      </div>
                      <div className="ap-form-group">
                        <label htmlFor="cf-phone">Phone Number</label>
                        <input
                          id="cf-phone"
                          className="ap-input"
                          placeholder="+91 98765 43210"
                          type="tel"
                          value={form.phone}
                          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="ap-form-group">
                      <label htmlFor="cf-email">Email Address</label>
                      <input
                        id="cf-email"
                        className="ap-input"
                        type="email"
                        placeholder="you@email.com"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      />
                    </div>

                    <div className="ap-form-group">
                      <label htmlFor="cf-subject">Subject</label>
                      <input
                        id="cf-subject"
                        className="ap-input"
                        placeholder="UPSC Coaching Enquiry"
                        value={form.subject}
                        onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      />
                    </div>

                    <div className="ap-form-group">
                      <label htmlFor="cf-message">Message *</label>
                      <textarea
                        id="cf-message"
                        className="ap-input ap-textarea"
                        placeholder="Tell us about the course you're interested in, your background, and any questions..."
                        required
                        rows={5}
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} id="contact-send-btn">
                      <i className="fa-solid fa-paper-plane" style={{ marginRight: '8px' }} />
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Map placeholder */}
        <div className="contact-map-placeholder">
          <i className="fa-solid fa-map-location-dot" style={{ fontSize: '2rem', marginBottom: '0.75rem', color: 'var(--maroon)' }} />
          <div style={{ fontWeight: 600 }}>Nermai IAS Academy, Puducherry</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
            No. 156/3, Nanbargal Nagar, Oulgaret, Puducherry – 605 010
          </div>
          <a
            href="https://maps.google.com/?q=Nanbargal+Nagar+Oulgaret+Puducherry"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
            style={{ marginTop: '1rem', fontSize: '0.875rem' }}
          >
            <i className="fa-solid fa-directions" style={{ marginRight: '6px' }} />
            Get Directions
          </a>
        </div>

      </main>
      <Footer />
    </>
  )
}
