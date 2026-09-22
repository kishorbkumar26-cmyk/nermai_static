import { useState, useEffect } from 'react'
import { fbFirestore } from '../../firebase/firestore'
import { CONTACT } from '../../constants'
import AdminImageUpload from './AdminImageUpload'
import { MapPin, Phone, Mail, Send, Plus, Trash2, Eye, EyeOff, Sparkles, Check, Globe, Image as ImageIcon, Award } from 'lucide-react'

const DEFAULT_TOPBAR = {
  visible: true,
  location: 'Puducherry, India',
  locationLink: '',
  showLocation: true,
  contacts: [
    { id: 'c1', value: '+91 8903 189000', label: 'Primary', visible: true }
  ],
  email: 'nermaiasacademy@gmail.com',
  showEmail: true,
  tagline: 'Empowering Aspirants. Strengthening the Nation.',
  showTagline: true,
  socials: {
    youtube: 'https://youtube.com',
    instagram: 'https://instagram.com',
    telegram: 'https://t.me/',
    facebook: 'https://facebook.com'
  },
  socialsVisibility: {
    youtube: true,
    instagram: true,
    telegram: true,
    facebook: true
  }
}

const DEFAULT_BRANDING = {
  logoUrl: '/nermai-logo.png',
  title: 'NERMAI',
  subtitle: 'IAS ACADEMY',
  showMotto: true,
  mottoLine1: 'Learn',
  mottoLine2: 'Compete',
  mottoLine3: 'Serve'
}

export default function TopBarAdminSection({ toast }) {
  const [topBar, setTopBar] = useState(DEFAULT_TOPBAR)
  const [branding, setBranding] = useState(DEFAULT_BRANDING)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s.topBar) {
        // Normalize contacts array if legacy format exists
        const formattedContacts = Array.isArray(s.topBar.contacts)
          ? s.topBar.contacts.map((c, idx) => typeof c === 'string' ? { id: `c_${idx}`, value: c, label: '', visible: true } : c)
          : DEFAULT_TOPBAR.contacts

        setTopBar({
          ...DEFAULT_TOPBAR,
          ...s.topBar,
          contacts: formattedContacts.length > 0 ? formattedContacts : DEFAULT_TOPBAR.contacts,
          socials: { ...DEFAULT_TOPBAR.socials, ...(s.topBar.socials || (s.siteInfo ? {
            youtube: s.siteInfo.youtube || '',
            instagram: s.siteInfo.instagram || '',
            telegram: s.siteInfo.telegram || '',
            facebook: s.siteInfo.facebook || ''
          } : {})) },
          socialsVisibility: { ...DEFAULT_TOPBAR.socialsVisibility, ...(s.topBar.socialsVisibility || {}) }
        })
      } else if (s.siteInfo) {
        // Fallback from siteInfo
        setTopBar(prev => ({
          ...prev,
          email: s.siteInfo.email || prev.email,
          contacts: [{ id: 'c1', value: s.siteInfo.phone || CONTACT.phones[0], label: 'Primary', visible: true }],
          socials: {
            youtube: s.siteInfo.youtube || prev.socials.youtube,
            instagram: s.siteInfo.instagram || prev.socials.instagram,
            telegram: s.siteInfo.telegram || prev.socials.telegram,
            facebook: s.siteInfo.facebook || prev.socials.facebook
          }
        }))
      }

      if (s.branding) {
        setBranding({ ...DEFAULT_BRANDING, ...s.branding })
      }

      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await fbFirestore.updateSettings({
        topBar: topBar,
        branding: branding,
        // Also keep siteInfo in sync for backwards compatibility
        siteInfo: {
          phone: topBar.contacts[0]?.value || '+91 8903 189000',
          email: topBar.email || 'nermaiasacademy@gmail.com',
          youtube: topBar.socials?.youtube || '#',
          instagram: topBar.socials?.instagram || '#',
          telegram: topBar.socials?.telegram || '#',
          facebook: topBar.socials?.facebook || '#'
        }
      })
      toast.success('Top Bar & Logo Header settings saved successfully!')
    } catch (e) {
      toast.error('Failed to save settings: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  // Contact numbers helper
  const addContactNumber = () => {
    setTopBar(prev => ({
      ...prev,
      contacts: [
        ...prev.contacts,
        { id: `c_${Date.now()}`, value: '', label: '', visible: true }
      ]
    }))
  }

  const updateContact = (id, field, value) => {
    setTopBar(prev => ({
      ...prev,
      contacts: prev.contacts.map(c => c.id === id ? { ...c, [field]: value } : c)
    }))
  }

  const removeContact = (id) => {
    setTopBar(prev => ({
      ...prev,
      contacts: prev.contacts.filter(c => c.id !== id)
    }))
  }

  const updateSocialUrl = (platform, url) => {
    setTopBar(prev => ({
      ...prev,
      socials: { ...prev.socials, [platform]: url }
    }))
  }

  const toggleSocialVisibility = (platform) => {
    setTopBar(prev => ({
      ...prev,
      socialsVisibility: {
        ...prev.socialsVisibility,
        [platform]: prev.socialsVisibility?.[platform] === false ? true : false
      }
    }))
  }

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--gray-400)' }}><i className="fa-solid fa-spinner fa-spin" /> Loading settings...</div>
  }

  return (
    <div className="topbar-admin-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="ap-section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <i className="fa-solid fa-heading" /> Top Bar & Header Branding
          </h2>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--gray-500)' }}>
            Customize contacts, tagline, social icons, and the main logo card (logo emblem, title, subtitle with bold Arial font, and motto).
          </p>
        </div>
        <button className="ap-btn ap-btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '0.75rem 1.6rem', fontSize: '0.9rem', fontWeight: 700 }}>
          {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Saving...</> : <><i className="fa-solid fa-floppy-disk" /> Save Changes</>}
        </button>
      </div>

      {/* ─── LIVE PREVIEW ────────────────────────────────────────── */}
      <div className="ap-card" style={{ marginBottom: '2rem', background: '#1A0408', border: '1px solid #D4AF37', padding: '1.25rem', borderRadius: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#D4AF37', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} /> Real-Time Live Preview (Top Strip & Header Logo Card)
          </span>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>Updates as you edit</span>
        </div>

        {/* Tier 1 Preview: Maroon Strip */}
        <div style={{
          background: 'linear-gradient(90deg, #5C0F1E 0%, #4A0E1C 50%, #5C0F1E 100%)',
          color: '#FFFFFF',
          padding: '0.55rem 1rem',
          borderRadius: '8px 8px 0 0',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          borderBottom: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.78rem'
        }}>
          {/* Left Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {topBar.showLocation && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#FFFFFF' }}>
                <MapPin size={13} style={{ color: '#F5D061' }} /> {topBar.location || 'Location not set'}
              </span>
            )}
            
            {topBar.contacts?.filter(c => c.visible !== false && c.value).map((contact, idx) => (
              <span key={contact.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#FFFFFF' }}>
                <span style={{ color: 'rgba(255,255,255,0.3)', marginRight: '2px' }}>|</span>
                <Phone size={13} style={{ color: '#F5D061' }} />
                <span>{contact.value} {contact.label ? <small style={{ color: '#F5D061', opacity: 0.85 }}>({contact.label})</small> : null}</span>
              </span>
            ))}

            {topBar.showEmail && topBar.email && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#FFFFFF' }}>
                <span style={{ color: 'rgba(255,255,255,0.3)', marginRight: '2px' }}>|</span>
                <Mail size={13} style={{ color: '#F5D061' }} /> {topBar.email}
              </span>
            )}
          </div>

          {/* Right Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {topBar.showTagline && (
              <div style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif', color: '#FDF6EC', fontSize: '0.8rem' }}>
                {topBar.tagline || 'Tagline text'}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {topBar.socialsVisibility?.youtube !== false && (
                <span title="YouTube" style={{ color: 'rgba(255,255,255,0.85)' }}><i className="fa-brands fa-youtube" /></span>
              )}
              {topBar.socialsVisibility?.instagram !== false && (
                <span title="Instagram" style={{ color: 'rgba(255,255,255,0.85)' }}><i className="fa-brands fa-instagram" /></span>
              )}
              {topBar.socialsVisibility?.telegram !== false && (
                <span title="Telegram" style={{ color: 'rgba(255,255,255,0.85)' }}><Send size={13} /></span>
              )}
              {topBar.socialsVisibility?.facebook !== false && (
                <span title="Facebook" style={{ color: 'rgba(255,255,255,0.85)' }}><i className="fa-brands fa-facebook" /></span>
              )}
            </div>
          </div>
        </div>

        {/* Tier 2 Preview: Logo & Navigation Bar */}
        <div style={{
          background: '#FAF6EE',
          padding: '0.75rem 1.25rem',
          borderRadius: '0 0 8px 8px',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          {/* Logo Card Live Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <img
                src={branding.logoUrl || '/nermai-logo.png'}
                alt="Nermai Logo"
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  boxShadow: '0 3px 10px rgba(123, 27, 46, 0.25)',
                  border: '1px solid rgba(212, 175, 55, 0.4)'
                }}
                onError={(e) => { e.target.src = '/nermai-logo.png' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{
                  fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#7B1B2E',
                  letterSpacing: '0.315em',
                  marginRight: '-0.315em',
                  lineHeight: 1
                }}>
                  {branding.title || 'NERMAI'}
                </span>
                <span style={{
                  fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.16em',
                  color: '#996515',
                  textTransform: 'uppercase',
                  marginTop: '3px'
                }}>
                  {branding.subtitle || 'IAS ACADEMY'}
                </span>
              </div>
            </div>

            {branding.showMotto && (
              <>
                <div style={{ width: '1px', height: '34px', background: 'rgba(212, 175, 55, 0.4)', margin: '0 0.25rem' }} />
                <div style={{
                  fontFamily: 'Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: '0.74rem',
                  color: '#635345',
                  lineHeight: 1.25,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <span>{branding.mottoLine1 || 'Learn'}</span>
                  <span>{branding.mottoLine2 || 'Compete'}</span>
                  <span>{branding.mottoLine3 || 'Serve'}</span>
                </div>
              </>
            )}
          </div>

          <div style={{ fontSize: '0.78rem', color: '#996515', fontWeight: 600 }}>
            Header Logo Card Preview
          </div>
        </div>

      </div>

      {/* ─── CARD: LOGO & BRANDING CUSTOMIZER ─── */}
      <div className="ap-card" style={{ marginBottom: '2rem', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 className="ap-subtitle" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} style={{ color: '#7B1B2E' }} /> Header Logo Card & Brand Styling
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--gray-500)' }}>
              Customize the logo emblem, main title, subtitle (Bold Arial font), and the 3-line motto on the left side of the navigation bar.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          
          {/* Logo Uploader */}
          <div>
            <label style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '6px', display: 'block' }}>
              Logo Image (Emblem)
            </label>
            <AdminImageUpload
              value={branding.logoUrl || '/nermai-logo.png'}
              onChange={url => setBranding(prev => ({ ...prev, logoUrl: url }))}
              label="Logo Emblem Image"
              subFolderName="nermai-logo"
              previewHeight={110}
              aspectRatio="1/1"
              hint="Recommended: Circular / square PNG or WebP with transparent or deep maroon background."
              toast={toast}
            />
            {branding.logoUrl !== '/nermai-logo.png' && (
              <button
                type="button"
                className="ap-btn ap-btn-secondary"
                onClick={() => setBranding(prev => ({ ...prev, logoUrl: '/nermai-logo.png' }))}
                style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}
              >
                Reset to Default Logo
              </button>
            )}
          </div>

          {/* Titles & Subtitle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="ap-form-group">
              <label style={{ fontWeight: 700, fontSize: '0.82rem' }}>Brand Main Title</label>
              <input
                type="text"
                className="ap-input"
                value={branding.title || ''}
                onChange={e => setBranding(prev => ({ ...prev, title: e.target.value }))}
                placeholder="NERMAI"
                style={{ fontSize: '1rem', fontWeight: 800, color: '#7B1B2E' }}
              />
              <small style={{ color: 'var(--gray-400)', fontSize: '0.75rem', marginTop: '3px', display: 'block' }}>
                Main academy name (e.g. NERMAI).
              </small>
            </div>

            <div className="ap-form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                <label style={{ fontWeight: 700, fontSize: '0.82rem', margin: 0 }}>Brand Subtitle</label>
                <span style={{ fontSize: '0.7rem', color: '#B45309', fontWeight: 700, background: '#FEF3C7', padding: '1px 6px', borderRadius: '4px' }}>
                  Bold Arial Font
                </span>
              </div>
              <input
                type="text"
                className="ap-input"
                value={branding.subtitle || ''}
                onChange={e => setBranding(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="IAS ACADEMY"
                style={{
                  fontSize: '0.92rem',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  color: '#996515'
                }}
              />
              <small style={{ color: 'var(--gray-400)', fontSize: '0.75rem', marginTop: '3px', display: 'block' }}>
                Formatted in bold Arial font and uppercase styling.
              </small>
            </div>
          </div>

          {/* 3-Line Motto */}
          <div style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid var(--gray-200)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <label style={{ fontWeight: 700, fontSize: '0.82rem', margin: 0 }}>3-Line Motto Phrase</label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={branding.showMotto !== false}
                  onChange={e => setBranding(prev => ({ ...prev, showMotto: e.target.checked }))}
                />
                Show Motto
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--gray-500)', fontWeight: 600 }}>Line 1</label>
                <input
                  type="text"
                  className="ap-input"
                  value={branding.mottoLine1 || ''}
                  onChange={e => setBranding(prev => ({ ...prev, mottoLine1: e.target.value }))}
                  placeholder="Learn"
                  disabled={branding.showMotto === false}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--gray-500)', fontWeight: 600 }}>Line 2</label>
                <input
                  type="text"
                  className="ap-input"
                  value={branding.mottoLine2 || ''}
                  onChange={e => setBranding(prev => ({ ...prev, mottoLine2: e.target.value }))}
                  placeholder="Compete"
                  disabled={branding.showMotto === false}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--gray-500)', fontWeight: 600 }}>Line 3</label>
                <input
                  type="text"
                  className="ap-input"
                  value={branding.mottoLine3 || ''}
                  onChange={e => setBranding(prev => ({ ...prev, mottoLine3: e.target.value }))}
                  placeholder="Serve"
                  disabled={branding.showMotto === false}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* ─── CARD 1: CONTACT NUMBERS (MULTIPLE) ─── */}
        <div className="ap-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 className="ap-subtitle" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={18} style={{ color: '#B91C1C' }} /> Contact Phone Numbers
              </h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                Add one or multiple phone numbers. They will appear on the top bar and be clickable to dial.
              </p>
            </div>
            <button className="ap-btn ap-btn-secondary" onClick={addContactNumber} style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Plus size={14} /> Add Phone
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {topBar.contacts?.map((contact, idx) => (
              <div key={contact.id || idx} style={{
                background: 'rgba(0,0,0,0.02)',
                border: '1px solid var(--gray-200, #e5e7eb)',
                padding: '0.75rem',
                borderRadius: '10px',
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr auto auto',
                gap: '0.5rem',
                alignItems: 'center'
              }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--gray-500)', display: 'block', marginBottom: '2px' }}>
                    Phone Number {idx + 1}
                  </label>
                  <input
                    type="text"
                    className="ap-input"
                    value={contact.value}
                    onChange={e => updateContact(contact.id, 'value', e.target.value)}
                    placeholder="+91 8903 189000"
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--gray-500)', display: 'block', marginBottom: '2px' }}>
                    Label (Optional)
                  </label>
                  <input
                    type="text"
                    className="ap-input"
                    value={contact.label || ''}
                    onChange={e => updateContact(contact.id, 'label', e.target.value)}
                    placeholder="e.g. Admission, Office"
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '4px' }}>
                    Visible
                  </label>
                  <button
                    type="button"
                    className="ap-btn"
                    onClick={() => updateContact(contact.id, 'visible', contact.visible === false ? true : false)}
                    title={contact.visible === false ? 'Hidden' : 'Visible'}
                    style={{
                      padding: '0.45rem',
                      background: contact.visible !== false ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: contact.visible !== false ? '#16a34a' : '#dc2626',
                      border: 'none',
                      borderRadius: '6px'
                    }}
                  >
                    {contact.visible !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '4px' }}>
                    Delete
                  </label>
                  <button
                    type="button"
                    className="ap-btn ap-btn-danger"
                    onClick={() => removeContact(contact.id)}
                    title="Remove phone number"
                    style={{ padding: '0.45rem', borderRadius: '6px' }}
                    disabled={topBar.contacts.length <= 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── CARD 2: TAGLINE / WORDING BEFORE SOCIAL ICONS ─── */}
        <div className="ap-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 className="ap-subtitle" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} style={{ color: '#D97706' }} /> Tagline / Wording Before Social Icons
              </h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                Customize the motto or message that appears directly to the left of the social media icons.
              </p>
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={topBar.showTagline !== false}
                onChange={e => setTopBar(prev => ({ ...prev, showTagline: e.target.checked }))}
              />
              Show Tagline
            </label>
          </div>

          <div className="ap-form-group">
            <label style={{ fontWeight: 600, fontSize: '0.82rem' }}>Tagline Text</label>
            <input
              type="text"
              className="ap-input"
              value={topBar.tagline || ''}
              onChange={e => setTopBar(prev => ({ ...prev, tagline: e.target.value }))}
              placeholder="e.g. Empowering Aspirants. Strengthening the Nation."
              style={{ fontSize: '0.92rem', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
            />
            <small style={{ color: 'var(--gray-400)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
              Displayed on the right side before YouTube, Instagram, Telegram, and Facebook icons.
            </small>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.5rem' }}>Quick Suggestion Presets:</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                'Empowering Aspirants. Strengthening the Nation.',
                'Learn. Compete. Serve.',
                'Dedicated to Youth Empowerment & Public Service.',
                'Puducherry\'s Premier Civil Services Training.'
              ].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTopBar(prev => ({ ...prev, tagline: preset }))}
                  className="ap-btn ap-btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* ─── CARD 3: LOCATION & EMAIL ─── */}
        <div className="ap-card">
          <h3 className="ap-subtitle" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} style={{ color: '#2563EB' }} /> Location & Email Information
          </h3>

          <div className="ap-form-group" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontWeight: 600, fontSize: '0.82rem', margin: 0 }}>Location Text</label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={topBar.showLocation !== false}
                  onChange={e => setTopBar(prev => ({ ...prev, showLocation: e.target.checked }))}
                />
                Show Location
              </label>
            </div>
            <input
              type="text"
              className="ap-input"
              value={topBar.location || ''}
              onChange={e => setTopBar(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Puducherry, India"
            />
          </div>

          <div className="ap-form-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.82rem' }}>Location Link (Optional Google Maps or Page URL)</label>
            <input
              type="text"
              className="ap-input"
              value={topBar.locationLink || ''}
              onChange={e => setTopBar(prev => ({ ...prev, locationLink: e.target.value }))}
              placeholder="https://maps.google.com/?q=..."
            />
          </div>

          <div className="ap-form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontWeight: 600, fontSize: '0.82rem', margin: 0 }}>Contact Email</label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={topBar.showEmail !== false}
                  onChange={e => setTopBar(prev => ({ ...prev, showEmail: e.target.checked }))}
                />
                Show Email
              </label>
            </div>
            <input
              type="email"
              className="ap-input"
              value={topBar.email || ''}
              onChange={e => setTopBar(prev => ({ ...prev, email: e.target.value }))}
              placeholder="nermaiasacademy@gmail.com"
            />
          </div>
        </div>

        {/* ─── CARD 4: SOCIAL MEDIA ICONS & LINKS ─── */}
        <div className="ap-card">
          <h3 className="ap-subtitle" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} style={{ color: '#059669' }} /> Social Media Links & Icons
          </h3>
          <p style={{ margin: '0 0 1rem', fontSize: '0.78rem', color: 'var(--gray-500)' }}>
            Enter full URLs for your social accounts and toggle individual icon visibility in the header.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* YouTube */}
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ width: '28px', color: '#EF4444', textAlign: 'center', fontSize: '1.1rem' }}><i className="fa-brands fa-youtube" /></span>
              <input
                type="text"
                className="ap-input"
                placeholder="https://youtube.com/@nermai"
                value={topBar.socials?.youtube || ''}
                onChange={e => updateSocialUrl('youtube', e.target.value)}
              />
              <button
                type="button"
                className="ap-btn"
                onClick={() => toggleSocialVisibility('youtube')}
                title={topBar.socialsVisibility?.youtube === false ? 'Hidden' : 'Visible'}
                style={{
                  padding: '0.5rem',
                  background: topBar.socialsVisibility?.youtube !== false ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: topBar.socialsVisibility?.youtube !== false ? '#16a34a' : '#dc2626',
                  border: 'none',
                  borderRadius: '6px'
                }}
              >
                {topBar.socialsVisibility?.youtube !== false ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>

            {/* Instagram */}
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ width: '28px', color: '#EC4899', textAlign: 'center', fontSize: '1.1rem' }}><i className="fa-brands fa-instagram" /></span>
              <input
                type="text"
                className="ap-input"
                placeholder="https://instagram.com/nermaiiasacademy"
                value={topBar.socials?.instagram || ''}
                onChange={e => updateSocialUrl('instagram', e.target.value)}
              />
              <button
                type="button"
                className="ap-btn"
                onClick={() => toggleSocialVisibility('instagram')}
                title={topBar.socialsVisibility?.instagram === false ? 'Hidden' : 'Visible'}
                style={{
                  padding: '0.5rem',
                  background: topBar.socialsVisibility?.instagram !== false ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: topBar.socialsVisibility?.instagram !== false ? '#16a34a' : '#dc2626',
                  border: 'none',
                  borderRadius: '6px'
                }}
              >
                {topBar.socialsVisibility?.instagram !== false ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>

            {/* Telegram */}
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ width: '28px', color: '#0284C7', textAlign: 'center', fontSize: '1.1rem' }}><Send size={16} /></span>
              <input
                type="text"
                className="ap-input"
                placeholder="https://t.me/nermaiias"
                value={topBar.socials?.telegram || ''}
                onChange={e => updateSocialUrl('telegram', e.target.value)}
              />
              <button
                type="button"
                className="ap-btn"
                onClick={() => toggleSocialVisibility('telegram')}
                title={topBar.socialsVisibility?.telegram === false ? 'Hidden' : 'Visible'}
                style={{
                  padding: '0.5rem',
                  background: topBar.socialsVisibility?.telegram !== false ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: topBar.socialsVisibility?.telegram !== false ? '#16a34a' : '#dc2626',
                  border: 'none',
                  borderRadius: '6px'
                }}
              >
                {topBar.socialsVisibility?.telegram !== false ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>

            {/* Facebook */}
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ width: '28px', color: '#1877F2', textAlign: 'center', fontSize: '1.1rem' }}><i className="fa-brands fa-facebook" /></span>
              <input
                type="text"
                className="ap-input"
                placeholder="https://facebook.com/nermaiiasacademy"
                value={topBar.socials?.facebook || ''}
                onChange={e => updateSocialUrl('facebook', e.target.value)}
              />
              <button
                type="button"
                className="ap-btn"
                onClick={() => toggleSocialVisibility('facebook')}
                title={topBar.socialsVisibility?.facebook === false ? 'Hidden' : 'Visible'}
                style={{
                  padding: '0.5rem',
                  background: topBar.socialsVisibility?.facebook !== false ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: topBar.socialsVisibility?.facebook !== false ? '#16a34a' : '#dc2626',
                  border: 'none',
                  borderRadius: '6px'
                }}
              >
                {topBar.socialsVisibility?.facebook !== false ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>

          </div>
        </div>

      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button className="ap-btn ap-btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '0.85rem 2.2rem', fontSize: '0.95rem', fontWeight: 700 }}>
          {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Saving Changes...</> : <><Check size={18} /> Save All Header & Logo Settings</>}
        </button>
      </div>

    </div>
  )
}
