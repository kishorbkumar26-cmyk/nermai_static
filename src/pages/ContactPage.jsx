import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import OfficeLocations from '../components/OfficeLocations'
import { fbFirestore } from '../firebase/firestore'
import { CONTACT } from '../constants'
import './ContactPage.css'

export const DEFAULT_CONTACT_PAGE_SETTINGS = {
  // Hero Banner
  heroEyebrow: 'CONTACT US',
  heroTitlePrefix: "Begin It's First Step to",
  heroTitleHighlight: 'Success',
  heroSubtitle: "Contact us for registration, seat availability, feedback or complaints. We'll respond within one working day.",
  heroScriptText: 'Your Civil Services Journey Starts Here',
  heroPillar1: 'LEARN',
  heroPillar2: 'PREPARE',
  heroPillar3: 'SUCCEED',
  showHeroScript: true,
  showPillars: true,

  // Left Column - Get In Touch
  infoEyebrow: 'GET IN TOUCH',
  infoTitlePrefix: "We're Here",
  infoTitleHighlight: 'to Help You',
  infoDesc: "Have a question about our courses, admissions or anything else? Reach out to us — we're happy to assist you.",

  // Contact Info Items
  addressLabel: 'ADDRESS',
  addressText: 'No. 156 / 3, (1st & 2nd Floor),\nNanbargal Nagar, Pondy – Villianur Main Road,\nOulgaret, Puducherry – 605 010',

  phoneLabel: 'PHONE',
  phones: ['+91 89035 189000', '+91 89033 289000', '+91 96435 539043'],

  emailLabel: 'EMAIL',
  emailText: 'nermaiiasacademy@gmail.com',

  // WhatsApp CTA
  whatsappBtnText: 'CHAT ON WHATSAPP',
  whatsappNumber: '+91 89035 189000',

  // Form Card
  formTitle: 'Send a Message',
  formBadgeText: "We'll get back to you soon",
  fieldNameLabel: 'YOUR NAME *',
  fieldNamePlaceholder: 'Enter your name',
  fieldPhoneLabel: 'PHONE NUMBER *',
  fieldPhonePlaceholder: '+91 98765 43210',
  fieldEmailLabel: 'EMAIL ADDRESS *',
  fieldEmailPlaceholder: 'your@email.com',
  fieldSubjectLabel: 'SUBJECT *',
  fieldSubjectPlaceholder: 'Select a subject',
  subjectOptions: [
    'Admissions & Batch Enquiry',
    'UPSC Coaching Information',
    'TNPSC (Group I, II, IV) Enquiry',
    'Puducherry Govt Exams (UDC / LDC)',
    'Test Series & Mentorship Program',
    'General Enquiry / Feedback'
  ],
  fieldMessageLabel: 'MESSAGE *',
  fieldMessagePlaceholder: 'Tell us about the course you\'re interested in, your background, and any questions...',
  submitBtnText: 'SEND MESSAGE',
  securityNoteText: 'Your information is safe with us.',

  showFaq: true,
  showLocations: true
}

const FAQ_ITEMS = [
  { q: 'What exams does Nermai IAS Academy coach for?', a: 'We provide coaching for UPSC Civil Services (IAS/IPS/IFS), TNPSC Group I, II, IV & VAO, TN Police, Banking (IBPS/SBI/RBI), Puducherry Government Exams (UDC, LDC, Deputy Tahsildar, Sub-Inspector), SSC, and more.' },
  { q: 'Are classes available in Tamil medium?', a: 'Yes. Nermai IAS Academy is one of very few institutes that offers comprehensive Tamil-medium coaching for civil services and government exam preparation.' },
  { q: 'Are online classes available?', a: 'Yes. We offer both offline classes at our Puducherry centre and live/recorded online classes through our digital platform.' },
  { q: 'How do I enroll?', a: 'You can contact us directly via phone, WhatsApp, or email. You can also visit our centre at No. 156/3, Nanbargal Nagar, Oulgaret, Puducherry – 605 010.' },
  { q: 'Is Nermai IAS Academy a commercial institution?', a: 'No. Nermai IAS Academy is a non-profit initiative run by volunteers of Nermai Trust and Nermai Samuga Iyakkam. Our sole mission is to empower youth from rural and economically weaker backgrounds.' },
  { q: 'What is the fee structure?', a: 'Our fees are among the most affordable in the region because we operate on a non-profit model. Please contact us directly for the latest batch fees and admission details.' },
  { q: 'Do you provide study materials?', a: 'Yes. Students receive comprehensive study materials, question banks, previous year papers, and access to our online resource library.' },
  { q: 'How can I access free study resources?', a: 'Free current affairs PDFs, previous year question papers, and study notes are available in our Free Learning Resources section on the homepage.' },
]

function FaqAccordion() {
  const [open, setOpen] = useState(null)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} style={{ border: '1px solid #E5DCCE', borderRadius: '10px', overflow: 'hidden', background: '#FFFFFF' }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: '100%', textAlign: 'left', padding: '1.15rem 1.35rem',
              background: open === i ? '#FDF8F0' : '#FFFFFF',
              border: 'none', cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontWeight: 700, fontSize: '0.98rem', color: '#1A1008',
              gap: '1rem',
            }}
          >
            <span>{item.q}</span>
            <i className={`fa-solid fa-chevron-${open === i ? 'up' : 'down'}`} style={{ flexShrink: 0, color: '#7B1B2E', fontSize: '0.85rem' }} />
          </button>
          {open === i && (
            <div style={{ padding: '0.85rem 1.35rem 1.15rem', fontSize: '0.95rem', color: '#4E4034', lineHeight: 1.7, borderTop: '1px solid #F0E6D8' }}>
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function ContactPage() {
  const [settings, setSettings] = useState(DEFAULT_CONTACT_PAGE_SETTINGS)
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' })

  useEffect(() => {
    window.scrollTo(0, 0)
    if (window.location.hash === '#faq') {
      setTimeout(() => {
        document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    }

    // Fetch live settings from Firestore
    fbFirestore.getSettings().then(s => {
      if (s?.contactPage) {
        setSettings(prev => ({ ...prev, ...s.contactPage }))
      }
    }).catch(err => {
      console.warn('Could not fetch contactPage settings, using defaults', err)
    })

    const unsub = fbFirestore.onSettingsChanged?.(s => {
      if (s?.contactPage) {
        setSettings(prev => ({ ...prev, ...s.contactPage }))
      }
    })

    return () => unsub && unsub()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.message.trim()) {
      alert('Please enter your name and message.')
      return
    }

    setSubmitting(true)
    const targetEmail = settings.emailText || CONTACT.email || 'nermaiiasacademy@gmail.com'
    const emailSubject = encodeURIComponent(form.subject || 'Enquiry from Nermai Website')
    const emailBody = encodeURIComponent(
      `Name: ${form.name}\nPhone: ${form.phone || 'N/A'}\nEmail: ${form.email || 'N/A'}\nSubject: ${form.subject || 'General'}\n\nMessage:\n${form.message}`
    )

    // Trigger user's default email client
    window.location.href = `mailto:${targetEmail}?subject=${emailSubject}&body=${emailBody}`
    setSubmitting(false)
    setSent(true)
  }

  // Extract values with strict nullish checks so empty string "" correctly removes/hides the element
  const heroEyebrow = settings.heroEyebrow !== undefined ? settings.heroEyebrow : DEFAULT_CONTACT_PAGE_SETTINGS.heroEyebrow
  const heroTitlePrefix = settings.heroTitlePrefix !== undefined ? settings.heroTitlePrefix : DEFAULT_CONTACT_PAGE_SETTINGS.heroTitlePrefix
  const heroTitleHighlight = settings.heroTitleHighlight !== undefined ? settings.heroTitleHighlight : DEFAULT_CONTACT_PAGE_SETTINGS.heroTitleHighlight
  const heroSubtitle = settings.heroSubtitle !== undefined ? settings.heroSubtitle : DEFAULT_CONTACT_PAGE_SETTINGS.heroSubtitle
  const showHeroScript = settings.showHeroScript !== false
  const heroScriptText = settings.heroScriptText !== undefined ? settings.heroScriptText : DEFAULT_CONTACT_PAGE_SETTINGS.heroScriptText
  const hasHeroScript = showHeroScript && Boolean((heroScriptText ?? '').trim())

  const showPillars = settings.showPillars !== false
  const p1 = settings.heroPillar1 !== undefined ? settings.heroPillar1 : DEFAULT_CONTACT_PAGE_SETTINGS.heroPillar1
  const p2 = settings.heroPillar2 !== undefined ? settings.heroPillar2 : DEFAULT_CONTACT_PAGE_SETTINGS.heroPillar2
  const p3 = settings.heroPillar3 !== undefined ? settings.heroPillar3 : DEFAULT_CONTACT_PAGE_SETTINGS.heroPillar3
  const hasPillars = showPillars && Boolean((p1 ?? '').trim() || (p2 ?? '').trim() || (p3 ?? '').trim())

  const infoEyebrow = settings.infoEyebrow !== undefined ? settings.infoEyebrow : DEFAULT_CONTACT_PAGE_SETTINGS.infoEyebrow
  const infoTitlePrefix = settings.infoTitlePrefix !== undefined ? settings.infoTitlePrefix : DEFAULT_CONTACT_PAGE_SETTINGS.infoTitlePrefix
  const infoTitleHighlight = settings.infoTitleHighlight !== undefined ? settings.infoTitleHighlight : DEFAULT_CONTACT_PAGE_SETTINGS.infoTitleHighlight
  const infoDesc = settings.infoDesc !== undefined ? settings.infoDesc : DEFAULT_CONTACT_PAGE_SETTINGS.infoDesc

  const addressLabel = settings.addressLabel !== undefined ? settings.addressLabel : DEFAULT_CONTACT_PAGE_SETTINGS.addressLabel
  const addressText = settings.addressText !== undefined ? settings.addressText : DEFAULT_CONTACT_PAGE_SETTINGS.addressText

  const phoneLabel = settings.phoneLabel !== undefined ? settings.phoneLabel : DEFAULT_CONTACT_PAGE_SETTINGS.phoneLabel
  const emailLabel = settings.emailLabel !== undefined ? settings.emailLabel : DEFAULT_CONTACT_PAGE_SETTINGS.emailLabel
  const emailText = settings.emailText !== undefined ? settings.emailText : DEFAULT_CONTACT_PAGE_SETTINGS.emailText

  const whatsappBtnText = settings.whatsappBtnText !== undefined ? settings.whatsappBtnText : DEFAULT_CONTACT_PAGE_SETTINGS.whatsappBtnText
  const formTitle = settings.formTitle !== undefined ? settings.formTitle : DEFAULT_CONTACT_PAGE_SETTINGS.formTitle
  const formBadgeText = settings.formBadgeText !== undefined ? settings.formBadgeText : DEFAULT_CONTACT_PAGE_SETTINGS.formBadgeText

  // Helper to extract phone numbers array
  const phoneList = Array.isArray(settings.phones)
    ? settings.phones.map(p => (typeof p === 'string' ? p : '').trim()).filter(Boolean)
    : (typeof settings.phones === 'string' && settings.phones.trim() ? settings.phones.split(/[\n,;]+/).map(p => p.trim()).filter(Boolean) : (settings.phones === undefined ? DEFAULT_CONTACT_PAGE_SETTINGS.phones : []))

  const whatsappCleanNumber = (settings.whatsappNumber || phoneList[0] || '+91 89035 189000').replace(/\D/g, '')

  return (
    <div className="cp-page-wrapper">
      <Header activePath="/contact" />
      <main style={{ paddingTop: '72px' }}>

        {/* ── 1. Hero Banner ──────────────────────────────────────────────── */}
        <section className="cp-hero">
          <div className="cp-hero-bg-overlay" aria-hidden="true" />

          <div className="cp-hero-container">
            <div className="cp-hero-grid">
              {/* Left Column: Eyebrow, Main Title, Subtitle */}
              <div className="cp-hero-left">
                {Boolean((heroEyebrow ?? '').trim()) && (
                  <div className="cp-eyebrow-wrap">
                    <span>{heroEyebrow}</span>
                    <span className="cp-eyebrow-line" />
                  </div>
                )}

                {(Boolean((heroTitlePrefix ?? '').trim()) || Boolean((heroTitleHighlight ?? '').trim())) && (
                  <h1 className="cp-hero-title">
                    {Boolean((heroTitlePrefix ?? '').trim()) && <>{heroTitlePrefix} </>}
                    {Boolean((heroTitleHighlight ?? '').trim()) && <span className="cp-title-gold">{heroTitleHighlight}</span>}
                  </h1>
                )}

                {Boolean((heroSubtitle ?? '').trim()) && (
                  <p className="cp-hero-sub" style={{ color: '#FFFFFF' }}>
                    {heroSubtitle}
                  </p>
                )}
              </div>

              {/* Middle Column: Handwritten Cursive Accent */}
              {hasHeroScript && (
                <div className="cp-hero-script-wrap">
                  <div className="cp-hero-script">
                    {heroScriptText}
                    <span className="cp-hero-script-line" />
                  </div>
                </div>
              )}

              {/* Right Column: Pillar Tags (Hidden completely if toggled off or kept empty) */}
              {hasPillars && (
                <div className="cp-pillar-wrap">
                  {Boolean((p1 ?? '').trim()) && <span className="cp-pillar-item">{p1}</span>}
                  {Boolean((p2 ?? '').trim()) && <span className="cp-pillar-item">{p2}</span>}
                  {Boolean((p3 ?? '').trim()) && <span className="cp-pillar-item active">{p3}</span>}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── 2. Main Content (Get in Touch & Send a Message Card) ─────────── */}
        <section className="cp-main-section">
          <div className="cp-container">
            <div className="cp-layout-grid">

              {/* Left Column: Get In Touch Info */}
              <div className="cp-info-col">
                <div>
                  {Boolean((infoEyebrow ?? '').trim()) && (
                    <div className="cp-info-eyebrow">
                      <span>{infoEyebrow}</span>
                      <span className="cp-info-eyebrow-line" />
                    </div>
                  )}

                  {(Boolean((infoTitlePrefix ?? '').trim()) || Boolean((infoTitleHighlight ?? '').trim())) && (
                    <h2 className="cp-info-title">
                      {Boolean((infoTitlePrefix ?? '').trim()) && <>{infoTitlePrefix} </>}
                      {Boolean((infoTitleHighlight ?? '').trim()) && <span className="cp-title-maroon">{infoTitleHighlight}</span>}
                    </h2>
                  )}

                  {Boolean((infoDesc ?? '').trim()) && (
                    <p className="cp-info-desc" style={{ marginTop: '0.85rem' }}>
                      {infoDesc}
                    </p>
                  )}
                </div>

                <div className="cp-info-list">
                  {/* Address */}
                  {Boolean((addressText ?? '').trim()) && (
                    <div className="cp-info-item">
                      <div className="cp-info-icon-box">
                        <i className="fa-solid fa-location-dot" />
                      </div>
                      <div className="cp-info-text-wrap">
                        {Boolean((addressLabel ?? '').trim()) && <div className="cp-info-label">{addressLabel}</div>}
                        <div className="cp-info-value" style={{ whiteSpace: 'pre-line' }}>
                          {addressText}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Phone(s) */}
                  {phoneList.length > 0 && (
                    <div className="cp-info-item">
                      <div className="cp-info-icon-box">
                        <i className="fa-solid fa-phone" />
                      </div>
                      <div className="cp-info-text-wrap">
                        {Boolean((phoneLabel ?? '').trim()) && <div className="cp-info-label">{phoneLabel}</div>}
                        <div className="cp-info-value">
                          {phoneList.map((ph, idx) => (
                            <a key={idx} href={`tel:${ph.replace(/\s+/g, '')}`} className="cp-info-link">
                              {ph}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {Boolean((emailText ?? '').trim()) && (
                    <div className="cp-info-item">
                      <div className="cp-info-icon-box">
                        <i className="fa-solid fa-envelope" />
                      </div>
                      <div className="cp-info-text-wrap">
                        {Boolean((emailLabel ?? '').trim()) && <div className="cp-info-label">{emailLabel}</div>}
                        <div className="cp-info-value">
                          <a href={`mailto:${emailText}`} className="cp-info-link">
                            {emailText}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* WhatsApp Action Button */}
                {Boolean((whatsappBtnText ?? '').trim()) && (
                  <a
                    href={`https://wa.me/${whatsappCleanNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cp-whatsapp-btn"
                  >
                    <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.25rem' }} />
                    <span>{whatsappBtnText}</span>
                    <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.85rem' }} />
                  </a>
                )}
              </div>

              {/* Right Column: Send a Message Form Card */}
              <div className="cp-form-card">
                <div className="cp-form-header">
                  <h3 className="cp-form-title">{formTitle || 'Send a Message'}</h3>
                  {Boolean((formBadgeText ?? '').trim()) && (
                    <div className="cp-form-badge">
                      <span className="cp-form-badge-line" />
                      <span>{formBadgeText}</span>
                    </div>
                  )}
                </div>

                {sent ? (
                  <div className="cp-success-box">
                    <div className="cp-success-icon">
                      <i className="fa-solid fa-check" />
                    </div>
                    <h4 className="cp-success-title">Thank you for reaching out!</h4>
                    <p className="cp-success-desc">
                      Your message has been initiated in your email client. Our academic counselling team will respond within 24 hours.
                    </p>
                    <button
                      type="button"
                      className="cp-reset-btn"
                      onClick={() => {
                        setSent(false)
                        setForm({ name: '', phone: '', email: '', subject: '', message: '' })
                      }}
                    >
                      <i className="fa-solid fa-arrow-rotate-left" style={{ marginRight: '6px' }} />
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form className="cp-form" onSubmit={handleSubmit}>
                    {/* Row 1: Name & Phone */}
                    <div className="cp-form-row">
                      <div className="cp-field-group">
                        <label className="cp-field-label">
                          {settings.fieldNameLabel || 'YOUR NAME *'}
                        </label>
                        <div className="cp-input-wrap">
                          <i className="fa-regular fa-user cp-input-icon" />
                          <input
                            type="text"
                            className="cp-input"
                            placeholder={settings.fieldNamePlaceholder || 'Enter your name'}
                            required
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="cp-field-group">
                        <label className="cp-field-label">
                          {settings.fieldPhoneLabel || 'PHONE NUMBER *'}
                        </label>
                        <div className="cp-input-wrap">
                          <i className="fa-solid fa-phone cp-input-icon" />
                          <input
                            type="tel"
                            className="cp-input"
                            placeholder={settings.fieldPhonePlaceholder || '+91 98765 43210'}
                            value={form.phone}
                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Email */}
                    <div className="cp-field-group">
                      <label className="cp-field-label">
                        {settings.fieldEmailLabel || 'EMAIL ADDRESS *'}
                      </label>
                      <div className="cp-input-wrap">
                        <i className="fa-regular fa-envelope cp-input-icon" />
                        <input
                          type="email"
                          className="cp-input"
                          placeholder={settings.fieldEmailPlaceholder || 'your@email.com'}
                          value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Row 3: Subject Dropdown */}
                    <div className="cp-field-group">
                      <label className="cp-field-label">
                        {settings.fieldSubjectLabel || 'SUBJECT *'}
                      </label>
                      <div className="cp-input-wrap">
                        <i className="fa-regular fa-folder cp-input-icon" />
                        <select
                          className="cp-select"
                          value={form.subject}
                          onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                        >
                          <option value="">{settings.fieldSubjectPlaceholder || 'Select a subject'}</option>
                          {(settings.subjectOptions || DEFAULT_CONTACT_PAGE_SETTINGS.subjectOptions).map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Row 4: Message */}
                    <div className="cp-field-group">
                      <label className="cp-field-label">
                        {settings.fieldMessageLabel || 'MESSAGE *'}
                      </label>
                      <div className="cp-input-wrap">
                        <i className="fa-regular fa-comment-dots cp-input-icon cp-textarea-icon" />
                        <textarea
                          className="cp-textarea"
                          rows={4}
                          placeholder={settings.fieldMessagePlaceholder || 'Tell us about the course you\'re interested in, your background, and any questions...'}
                          required
                          value={form.message}
                          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Submit Row */}
                    <div className="cp-form-footer">
                      <button
                        type="submit"
                        className="cp-submit-btn"
                        disabled={submitting}
                      >
                        <span>{settings.submitBtnText || 'SEND MESSAGE'}</span>
                        <i className="fa-solid fa-arrow-right" />
                      </button>

                      <div className="cp-security-note">
                        <i className="fa-solid fa-lock" />
                        <span>{settings.securityNoteText || 'Your information is safe with us.'}</span>
                      </div>
                    </div>
                  </form>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* ── 3. Office Locations Component ────────────────────────────────── */}
        {settings.showLocations !== false && (
          <OfficeLocations />
        )}

        {/* ── 4. Frequently Asked Questions ────────────────────────────────── */}
        {settings.showFaq !== false && (
          <section id="faq" style={{ padding: '4.5rem 0', backgroundColor: '#FFFFFF', borderTop: '1px solid #EFE8DE' }}>
            <div className="cp-container" style={{ maxWidth: '840px' }}>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <span className="cp-info-eyebrow" style={{ justifyContent: 'center' }}>
                  <span>FREQUENTLY ASKED QUESTIONS</span>
                </span>
                <h2 style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '2.25rem', fontWeight: 700, color: '#1A1008', margin: '0.5rem 0 0' }}>
                  Everything you need to know about Nermai IAS Academy
                </h2>
              </div>
              <FaqAccordion />
            </div>
          </section>
        )}

      </main>
      <Footer />
    </div>
  )
}
