import { useState, useEffect } from 'react'
import { fbFirestore } from '../../firebase/firestore'
import { DEFAULT_CONTACT_PAGE_SETTINGS } from '../../pages/ContactPage'

export default function ContactAdminSection({ toast }) {
  const [data, setData] = useState(DEFAULT_CONTACT_PAGE_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('hero')

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s?.contactPage) {
        setData(prev => ({
          ...DEFAULT_CONTACT_PAGE_SETTINGS,
          ...s.contactPage,
          phones: Array.isArray(s.contactPage.phones) && s.contactPage.phones.length > 0 
            ? s.contactPage.phones 
            : DEFAULT_CONTACT_PAGE_SETTINGS.phones,
          subjectOptions: Array.isArray(s.contactPage.subjectOptions) && s.contactPage.subjectOptions.length > 0
            ? s.contactPage.subjectOptions
            : DEFAULT_CONTACT_PAGE_SETTINGS.subjectOptions
        }))
      }
      setLoading(false)
    }).catch(err => {
      console.warn('Failed to load contact settings', err)
      setLoading(false)
    })
  }, [])

  const updateField = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fbFirestore.updateSettings({ contactPage: data })
      toast.success('Contact Page updated successfully! Refresh /contact to view changes.')
    } catch (e) {
      toast.error('Failed to save: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  // Phone number list helpers
  const handlePhoneChange = (index, value) => {
    const list = [...(data.phones || [])]
    list[index] = value
    updateField('phones', list)
  }

  const addPhone = () => {
    updateField('phones', [...(data.phones || []), ''])
  }

  const removePhone = (index) => {
    updateField('phones', (data.phones || []).filter((_, i) => i !== index))
  }

  // Subject options list helpers
  const handleSubjectOptionChange = (index, value) => {
    const list = [...(data.subjectOptions || [])]
    list[index] = value
    updateField('subjectOptions', list)
  }

  const addSubjectOption = () => {
    updateField('subjectOptions', [...(data.subjectOptions || []), 'New Enquiry Option'])
  }

  const removeSubjectOption = (index) => {
    updateField('subjectOptions', (data.subjectOptions || []).filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }} />
        Loading Contact Page settings...
      </div>
    )
  }

  return (
    <div className="ap-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="ap-section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-address-book" /> Contact Page Editor
          </h2>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--gray-500)' }}>
            Customize every headline, badge, subtitle, phone number, email, and form field on the <strong>/contact</strong> page.
          </p>
        </div>
        <button
          type="button"
          className="ap-btn ap-btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ padding: '0.75rem 1.75rem', fontWeight: 700 }}
        >
          {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Saving...</> : <><i className="fa-solid fa-floppy-disk" /> Save Changes</>}
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #EFE5D8', marginBottom: '1.75rem', overflowX: 'auto', paddingBottom: '2px' }}>
        <button
          type="button"
          className={`ap-tab-btn ${activeTab === 'hero' ? 'active' : ''}`}
          onClick={() => setActiveTab('hero')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'hero' ? '3px solid #7B1B2E' : '3px solid transparent',
            color: activeTab === 'hero' ? '#7B1B2E' : '#666',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <i className="fa-solid fa-image" /> 1. Hero Banner
        </button>

        <button
          type="button"
          className={`ap-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'info' ? '3px solid #7B1B2E' : '3px solid transparent',
            color: activeTab === 'info' ? '#7B1B2E' : '#666',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <i className="fa-solid fa-info-circle" /> 2. Get In Touch Info
        </button>

        <button
          type="button"
          className={`ap-tab-btn ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'form' ? '3px solid #7B1B2E' : '3px solid transparent',
            color: activeTab === 'form' ? '#7B1B2E' : '#666',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <i className="fa-solid fa-paper-plane" /> 3. Message Form
        </button>
      </div>

      {/* ── Tab 1: Hero Banner ────────────────────────────────────────────── */}
      {activeTab === 'hero' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="ap-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#7B1B2E', marginBottom: '1.25rem' }}>
              Hero Header & Titles
            </h3>

            <div className="ap-form-group">
              <label className="ap-label">Eyebrow Badge Text</label>
              <input
                className="ap-input"
                value={data.heroEyebrow || ''}
                onChange={e => updateField('heroEyebrow', e.target.value)}
                placeholder="CONTACT US"
              />
            </div>

            <div className="ap-form-row">
              <div className="ap-form-group">
                <label className="ap-label">Hero Title (Prefix / White Text)</label>
                <input
                  className="ap-input"
                  value={data.heroTitlePrefix || ''}
                  onChange={e => updateField('heroTitlePrefix', e.target.value)}
                  placeholder="Begin It's First Step to"
                />
              </div>

              <div className="ap-form-group">
                <label className="ap-label">Hero Title Highlight (Gold Text)</label>
                <input
                  className="ap-input"
                  value={data.heroTitleHighlight || ''}
                  onChange={e => updateField('heroTitleHighlight', e.target.value)}
                  placeholder="Success"
                />
              </div>
            </div>

            <div className="ap-form-group">
              <label className="ap-label">Hero Subtitle Paragraph</label>
              <textarea
                className="ap-input ap-textarea"
                rows={3}
                value={data.heroSubtitle || ''}
                onChange={e => updateField('heroSubtitle', e.target.value)}
                placeholder="Contact us for registration, seat availability, feedback or complaints. We'll respond within one working day."
              />
            </div>
          </div>

          <div className="ap-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#7B1B2E', marginBottom: '1.25rem' }}>
              Handwritten Cursive Script &amp; Right Pillars
            </h3>

            {/* Script Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: '#F8F3EA', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#1A1008', fontSize: '0.92rem' }}>Enable Floating Cursive Script</div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>Toggle off or clear input to hide the cursive accent text in Hero.</div>
              </div>
              <label className="ap-switch">
                <input
                  type="checkbox"
                  checked={data.showHeroScript !== false}
                  onChange={e => updateField('showHeroScript', e.target.checked)}
                />
                <span className="ap-slider" />
              </label>
            </div>

            {data.showHeroScript !== false && (
              <div className="ap-form-group">
                <label className="ap-label">Floating Cursive Script Text</label>
                <input
                  className="ap-input"
                  value={data.heroScriptText || ''}
                  onChange={e => updateField('heroScriptText', e.target.value)}
                  placeholder="Your Civil Services Journey Starts Here"
                />
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid #EFE5D8', margin: '1.5rem 0' }} />

            {/* Pillars Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: '#F8F3EA', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#1A1008', fontSize: '0.92rem' }}>Enable Right Pillar Card (LEARN / PREPARE / SUCCEED)</div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>Toggle off or leave inputs empty to completely remove this card from the Hero banner.</div>
              </div>
              <label className="ap-switch">
                <input
                  type="checkbox"
                  checked={data.showPillars !== false}
                  onChange={e => updateField('showPillars', e.target.checked)}
                />
                <span className="ap-slider" />
              </label>
            </div>

            {data.showPillars !== false && (
              <div className="ap-form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="ap-form-group">
                  <label className="ap-label">Pillar 1</label>
                  <input
                    className="ap-input"
                    value={data.heroPillar1 || ''}
                    onChange={e => updateField('heroPillar1', e.target.value)}
                    placeholder="LEARN"
                  />
                </div>

                <div className="ap-form-group">
                  <label className="ap-label">Pillar 2</label>
                  <input
                    className="ap-input"
                    value={data.heroPillar2 || ''}
                    onChange={e => updateField('heroPillar2', e.target.value)}
                    placeholder="PREPARE"
                  />
                </div>

                <div className="ap-form-group">
                  <label className="ap-label">Pillar 3 (Active / Gold)</label>
                  <input
                    className="ap-input"
                    value={data.heroPillar3 || ''}
                    onChange={e => updateField('heroPillar3', e.target.value)}
                    placeholder="SUCCEED"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab 2: Get in Touch Info ──────────────────────────────────────── */}
      {activeTab === 'info' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="ap-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#7B1B2E', marginBottom: '1.25rem' }}>
              Left Section Header
            </h3>

            <div className="ap-form-group">
              <label className="ap-label">Eyebrow Text</label>
              <input
                className="ap-input"
                value={data.infoEyebrow || ''}
                onChange={e => updateField('infoEyebrow', e.target.value)}
                placeholder="GET IN TOUCH"
              />
            </div>

            <div className="ap-form-row">
              <div className="ap-form-group">
                <label className="ap-label">Heading Prefix (Dark Text)</label>
                <input
                  className="ap-input"
                  value={data.infoTitlePrefix || ''}
                  onChange={e => updateField('infoTitlePrefix', e.target.value)}
                  placeholder="We're Here"
                />
              </div>

              <div className="ap-form-group">
                <label className="ap-label">Heading Highlight (Maroon Text)</label>
                <input
                  className="ap-input"
                  value={data.infoTitleHighlight || ''}
                  onChange={e => updateField('infoTitleHighlight', e.target.value)}
                  placeholder="to Help You"
                />
              </div>
            </div>

            <div className="ap-form-group">
              <label className="ap-label">Description Paragraph</label>
              <textarea
                className="ap-input ap-textarea"
                rows={2}
                value={data.infoDesc || ''}
                onChange={e => updateField('infoDesc', e.target.value)}
                placeholder="Have a question about our courses, admissions or anything else? Reach out to us — we're happy to assist you."
              />
            </div>
          </div>

          <div className="ap-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#7B1B2E', marginBottom: '1.25rem' }}>
              Address, Phone &amp; Email Details
            </h3>

            <div className="ap-form-row">
              <div className="ap-form-group" style={{ flex: 1 }}>
                <label className="ap-label">Address Label</label>
                <input
                  className="ap-input"
                  value={data.addressLabel || ''}
                  onChange={e => updateField('addressLabel', e.target.value)}
                  placeholder="ADDRESS"
                />
              </div>
              <div className="ap-form-group" style={{ flex: 2 }}>
                <label className="ap-label">Full Address (Multi-line supported)</label>
                <textarea
                  className="ap-input ap-textarea"
                  rows={3}
                  value={data.addressText || ''}
                  onChange={e => updateField('addressText', e.target.value)}
                  placeholder="No. 156 / 3, (1st & 2nd Floor), Nanbargal Nagar, Pondy – Villianur Main Road, Oulgaret, Puducherry – 605 010"
                />
              </div>
            </div>

            {/* Multiple Phone Numbers */}
            <div style={{ background: '#FAF7F2', padding: '1.25rem', borderRadius: '12px', border: '1px solid #EAE0D2', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <label className="ap-label" style={{ margin: 0, fontWeight: 700, color: '#7B1B2E' }}>
                  <i className="fa-solid fa-phone" style={{ marginRight: '6px' }} />
                  Phone Numbers List ({data.phones?.length || 0})
                </label>
                <button
                  type="button"
                  className="ap-btn ap-btn-sm"
                  onClick={addPhone}
                  style={{ background: '#7B1B2E', color: '#fff', fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
                >
                  <i className="fa-solid fa-plus" /> Add Number
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(data.phones || []).map((ph, pIdx) => (
                  <div key={pIdx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      className="ap-input"
                      value={ph}
                      onChange={e => handlePhoneChange(pIdx, e.target.value)}
                      placeholder={pIdx === 0 ? '+91 89035 189000 (Primary)' : `+91 98765 43210 (Number #${pIdx + 1})`}
                    />
                    {data.phones.length > 1 && (
                      <button
                        type="button"
                        className="ap-btn ap-btn-danger ap-btn-sm"
                        onClick={() => removePhone(pIdx)}
                        title="Delete Number"
                        style={{ padding: '0.5rem 0.75rem' }}
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Email and WhatsApp */}
            <div className="ap-form-row">
              <div className="ap-form-group">
                <label className="ap-label">Email Label &amp; Address</label>
                <input
                  className="ap-input"
                  value={data.emailText || ''}
                  onChange={e => updateField('emailText', e.target.value)}
                  placeholder="nermaiiasacademy@gmail.com"
                />
              </div>

              <div className="ap-form-group">
                <label className="ap-label">WhatsApp Button Text</label>
                <input
                  className="ap-input"
                  value={data.whatsappBtnText || ''}
                  onChange={e => updateField('whatsappBtnText', e.target.value)}
                  placeholder="CHAT ON WHATSAPP"
                />
              </div>
            </div>

            <div className="ap-form-group">
              <label className="ap-label">WhatsApp Number (with country code, e.g. +91 89035 189000)</label>
              <input
                className="ap-input"
                value={data.whatsappNumber || ''}
                onChange={e => updateField('whatsappNumber', e.target.value)}
                placeholder="+91 89035 189000"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 3: Message Form ──────────────────────────────────────────── */}
      {activeTab === 'form' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="ap-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#7B1B2E', marginBottom: '1.25rem' }}>
              Form Headers &amp; Labels
            </h3>

            <div className="ap-form-row">
              <div className="ap-form-group">
                <label className="ap-label">Form Title</label>
                <input
                  className="ap-input"
                  value={data.formTitle || ''}
                  onChange={e => updateField('formTitle', e.target.value)}
                  placeholder="Send a Message"
                />
              </div>

              <div className="ap-form-group">
                <label className="ap-label">Form Header Right Badge</label>
                <input
                  className="ap-input"
                  value={data.formBadgeText || ''}
                  onChange={e => updateField('formBadgeText', e.target.value)}
                  placeholder="We'll get back to you soon"
                />
              </div>
            </div>

            <div className="ap-form-row">
              <div className="ap-form-group">
                <label className="ap-label">Name Field Label</label>
                <input
                  className="ap-input"
                  value={data.fieldNameLabel || ''}
                  onChange={e => updateField('fieldNameLabel', e.target.value)}
                  placeholder="YOUR NAME *"
                />
              </div>
              <div className="ap-form-group">
                <label className="ap-label">Phone Field Label</label>
                <input
                  className="ap-input"
                  value={data.fieldPhoneLabel || ''}
                  onChange={e => updateField('fieldPhoneLabel', e.target.value)}
                  placeholder="PHONE NUMBER *"
                />
              </div>
            </div>

            <div className="ap-form-row">
              <div className="ap-form-group">
                <label className="ap-label">Email Field Label</label>
                <input
                  className="ap-input"
                  value={data.fieldEmailLabel || ''}
                  onChange={e => updateField('fieldEmailLabel', e.target.value)}
                  placeholder="EMAIL ADDRESS *"
                />
              </div>
              <div className="ap-form-group">
                <label className="ap-label">Subject Field Label</label>
                <input
                  className="ap-input"
                  value={data.fieldSubjectLabel || ''}
                  onChange={e => updateField('fieldSubjectLabel', e.target.value)}
                  placeholder="SUBJECT *"
                />
              </div>
            </div>

            <div className="ap-form-group">
              <label className="ap-label">Message Field Label</label>
              <input
                className="ap-input"
                value={data.fieldMessageLabel || ''}
                onChange={e => updateField('fieldMessageLabel', e.target.value)}
                placeholder="MESSAGE *"
              />
            </div>

            <div className="ap-form-row">
              <div className="ap-form-group">
                <label className="ap-label">Submit Button Text</label>
                <input
                  className="ap-input"
                  value={data.submitBtnText || ''}
                  onChange={e => updateField('submitBtnText', e.target.value)}
                  placeholder="SEND MESSAGE"
                />
              </div>
              <div className="ap-form-group">
                <label className="ap-label">Security &amp; Privacy Notice</label>
                <input
                  className="ap-input"
                  value={data.securityNoteText || ''}
                  onChange={e => updateField('securityNoteText', e.target.value)}
                  placeholder="Your information is safe with us."
                />
              </div>
            </div>
          </div>

          {/* Subject Dropdown Options */}
          <div className="ap-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#7B1B2E', margin: 0 }}>
                Subject Dropdown Options ({data.subjectOptions?.length || 0})
              </h3>
              <button
                type="button"
                className="ap-btn ap-btn-sm"
                onClick={addSubjectOption}
                style={{ background: '#7B1B2E', color: '#fff', fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
              >
                <i className="fa-solid fa-plus" /> Add Subject Option
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(data.subjectOptions || []).map((subj, sIdx) => (
                <div key={sIdx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    className="ap-input"
                    value={subj}
                    onChange={e => handleSubjectOptionChange(sIdx, e.target.value)}
                    placeholder={`Subject Option #${sIdx + 1}`}
                  />
                  {data.subjectOptions.length > 1 && (
                    <button
                      type="button"
                      className="ap-btn ap-btn-danger ap-btn-sm"
                      onClick={() => removeSubjectOption(sIdx)}
                      title="Delete Option"
                      style={{ padding: '0.5rem 0.75rem' }}
                    >
                      <i className="fa-solid fa-trash" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section Visibility Toggles */}
          <div className="ap-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#7B1B2E', marginBottom: '1.25rem' }}>
              Additional Page Sections
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={data.showLocations !== false}
                  onChange={e => updateField('showLocations', e.target.checked)}
                />
                Show Office Locations &amp; Map section on /contact
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={data.showFaq !== false}
                  onChange={e => updateField('showFaq', e.target.checked)}
                />
                Show Frequently Asked Questions (FAQ) on /contact
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Save Button Bottom */}
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          className="ap-btn ap-btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ padding: '0.85rem 2.25rem', fontWeight: 700, fontSize: '0.95rem' }}
        >
          {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Saving Changes...</> : <><i className="fa-solid fa-floppy-disk" /> Save All Changes</>}
        </button>
      </div>
    </div>
  )
}
