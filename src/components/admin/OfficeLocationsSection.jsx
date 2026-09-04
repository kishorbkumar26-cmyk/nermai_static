import { useState, useEffect } from 'react'
import { fbFirestore } from '../../firebase/firestore'

const DEFAULT_LOC = {
  name: 'Nermai IAS Academy',
  tagline: 'MAIN OFFICE',
  address: 'No. 156 / 3, (1st & 2nd Floor), Nanbargal Nagar,\nPondy – Villianur Main Road, Oulgaret, Puducherry – 605 010',
  phone: '+91 919876543210',
  email: 'info@nermai.in',
  hoursDays: 'Mon – Sat',
  hoursTime: '9:00 AM – 6:00 PM',
  mapEmbedUrl: '',
  directionsUrl: '',
  quote: 'A space to learn, grow and achieve together.',
  visible: true
}

// Auto-extract src URL from a full iframe HTML tag if user pastes it
function extractMapUrl(input) {
  if (!input) return ''
  const srcMatch = input.match(/src=["'](https:\/\/www\.google\.com\/maps\/embed[^"']+)["']/i)
  if (srcMatch) return srcMatch[1]
  
  const urlMatch = input.match(/(https:\/\/www\.google\.com\/maps\/embed[^"'\s]+)/i)
  if (urlMatch) return urlMatch[1]
  
  return input.trim()
}

export default function OfficeLocationsSection({ toast }) {
  const [data, setData] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      setData(s.officeLocations || {
        visible: true,
        title: "We’re Here, Closer to Your Goals",
        subtitle: "Visit our centre to experience a supportive learning environment, expert guidance, and a community that believes in your potential.",
        locations: []
      })
    })
  }, [])

  const save = async (newData) => {
    try {
      setSaving(true)
      await fbFirestore.updateSettings({ officeLocations: newData })
      setData(newData)
      toast.success('Office locations updated successfully!')
    } catch (e) {
      toast.error('Failed to save: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field, value) => {
    setData(d => ({ ...d, [field]: value }))
  }

  const addLocation = () => {
    const id = 'loc_' + Math.random().toString(36).substr(2, 9)
    const locs = [...(data.locations || []), { ...DEFAULT_LOC, id }]
    save({ ...data, locations: locs })
  }

  const updateLocation = (idx, field, value) => {
    const locs = [...(data.locations || [])]
    locs[idx] = { ...locs[idx], [field]: value }
    setData(d => ({ ...d, locations: locs }))
  }

  const deleteLocation = (idx) => {
    if (!window.confirm('Delete this office location?')) return
    const locs = (data.locations || []).filter((_, i) => i !== idx)
    save({ ...data, locations: locs })
  }

  const saveAll = () => save(data)

  if (!data) return <div className="ap-empty"><i className="fa-solid fa-spinner fa-spin" /><p>Loading...</p></div>

  return (
    <div className="ap-section">
      <h2 className="ap-section-title">
        <i className="fa-solid fa-map-location-dot" /> Office Locations Management
      </h2>
      <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Add or edit office locations. When multiple locations are added, the website will automatically display a location branch tab selector for students to view any branch.
      </p>

      {/* Section-level settings */}
      <div className="ap-card">
        <h3 className="ap-subtitle">Section Settings</h3>
        <div className="ap-form-row">
          <div className="ap-form-group">
            <label className="ap-label">Section Title</label>
            <input
              className="ap-input"
              value={data.title || ''}
              onChange={e => updateField('title', e.target.value)}
              placeholder="We’re Here, Closer to Your Goals"
            />
          </div>
          <div className="ap-form-group">
            <label className="ap-label">Section Subtitle</label>
            <input
              className="ap-input"
              value={data.subtitle || ''}
              onChange={e => updateField('subtitle', e.target.value)}
              placeholder="Visit our centre to experience..."
            />
          </div>
        </div>
        <div className="ap-form-group" style={{ marginTop: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={data.visible !== false}
              onChange={e => updateField('visible', e.target.checked)}
            />
            Show Location Section on Homepage
          </label>
        </div>
      </div>

      {/* Office cards */}
      <div style={{ marginTop: '2.5rem' }}>
        {(data.locations || []).map((loc, i) => (
          <div key={loc.id || i} className="ap-card" style={{ marginBottom: '2rem', borderLeft: '5px solid var(--maroon)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 className="ap-subtitle" style={{ margin: 0, fontSize: '1.15rem' }}>
                <i className="fa-solid fa-location-dot" style={{ color: 'var(--maroon)', marginRight: '8px' }} />
                Location #{i + 1}{loc.name ? ` — ${loc.name}` : ''}
              </h3>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={loc.visible !== false}
                    onChange={e => updateLocation(i, 'visible', e.target.checked)}
                  />
                  Visible
                </label>
                <button className="ap-btn ap-btn-danger ap-btn-sm" onClick={() => deleteLocation(i)}>
                  <i className="fa-solid fa-trash" /> Delete Location
                </button>
              </div>
            </div>

            <div className="ap-form-row">
              <div className="ap-form-group">
                <label className="ap-label">Office Name</label>
                <input
                  className="ap-input"
                  value={loc.name || ''}
                  onChange={e => updateLocation(i, 'name', e.target.value)}
                  placeholder="e.g. Nermai IAS Academy"
                />
              </div>

              <div className="ap-form-group">
                <label className="ap-label">Badge Tagline (e.g. MAIN OFFICE, BRANCH OFFICE)</label>
                <input
                  className="ap-input"
                  value={loc.tagline || ''}
                  onChange={e => updateLocation(i, 'tagline', e.target.value)}
                  placeholder="MAIN OFFICE"
                />
              </div>
            </div>

            <div className="ap-form-group">
              <label className="ap-label">Full Address (Line breaks supported)</label>
              <textarea
                className="ap-input"
                rows={3}
                value={loc.address || ''}
                onChange={e => updateLocation(i, 'address', e.target.value)}
                placeholder="No. 156 / 3, (1st & 2nd Floor), Nanbargal Nagar,&#10;Pondy – Villianur Main Road, Oulgaret, Puducherry – 605 010"
              />
            </div>

            <div className="ap-form-row">
              <div className="ap-form-group">
                <label className="ap-label">Contact Phone</label>
                <input
                  className="ap-input"
                  value={loc.phone || ''}
                  onChange={e => updateLocation(i, 'phone', e.target.value)}
                  placeholder="+91 919876543210"
                />
              </div>

              <div className="ap-form-group">
                <label className="ap-label">Contact Email</label>
                <input
                  className="ap-input"
                  value={loc.email || ''}
                  onChange={e => updateLocation(i, 'email', e.target.value)}
                  placeholder="info@nermai.in"
                />
              </div>
            </div>

            <div className="ap-form-row">
              <div className="ap-form-group">
                <label className="ap-label">Working Days</label>
                <input
                  className="ap-input"
                  value={loc.hoursDays || ''}
                  onChange={e => updateLocation(i, 'hoursDays', e.target.value)}
                  placeholder="Mon – Sat"
                />
              </div>

              <div className="ap-form-group">
                <label className="ap-label">Working Hours</label>
                <input
                  className="ap-input"
                  value={loc.hoursTime || ''}
                  onChange={e => updateLocation(i, 'hoursTime', e.target.value)}
                  placeholder="9:00 AM – 6:00 PM"
                />
              </div>
            </div>

            <div className="ap-form-group">
              <label className="ap-label">Location Quote / Banner Message</label>
              <input
                className="ap-input"
                value={loc.quote || ''}
                onChange={e => updateLocation(i, 'quote', e.target.value)}
                placeholder="A space to learn, grow and achieve together."
              />
            </div>

            <div className="ap-form-group">
              <label className="ap-label">Google Maps Directions URL</label>
              <input
                className="ap-input"
                value={loc.directionsUrl || ''}
                onChange={e => updateLocation(i, 'directionsUrl', e.target.value)}
                placeholder="https://maps.google.com/maps?daddr=..."
              />
            </div>

            <div className="ap-form-group">
              <label className="ap-label">
                Google Maps Embed URL or <code>&lt;iframe&gt;</code> HTML
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginLeft: '0.5rem', fontWeight: 400 }}>
                  (Paste the full <code>&lt;iframe&gt;</code> code or map URL)
                </span>
              </label>
              <textarea
                className="ap-input"
                rows={3}
                value={loc.mapEmbedUrl || ''}
                onChange={e => updateLocation(i, 'mapEmbedUrl', extractMapUrl(e.target.value))}
                placeholder={'Paste Google Maps iframe src="..." or share URL'}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
              />
            </div>

            {/* Live map preview */}
            {loc.mapEmbedUrl && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '0.5rem' }}>
                  Live Map Preview
                </div>
                <div style={{ borderRadius: 12, overflow: 'hidden', border: '1.5px solid var(--maroon)' }}>
                  <iframe
                    src={extractMapUrl(loc.mapEmbedUrl)}
                    title={`Preview – ${loc.name}`}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    style={{ width: '100%', height: 220, border: 0 }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new + Save buttons */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
        <button className="ap-btn ap-btn-ghost" onClick={addLocation}>
          <i className="fa-solid fa-plus" /> Add New Location Branch
        </button>
        <button className="ap-btn ap-btn-primary" onClick={saveAll} disabled={saving}>
          {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Saving...</> : <><i className="fa-solid fa-floppy-disk" /> Save All Changes</>}
        </button>
      </div>
    </div>
  )
}
