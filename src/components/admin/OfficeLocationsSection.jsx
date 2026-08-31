import { useState, useEffect } from 'react'
import { fbFirestore } from '../../firebase/firestore'

const DEFAULT_LOC = {
  name: '',
  address: '',
  mapEmbedUrl: '',
  visible: true
}

// Auto-extract src URL from a full iframe HTML tag if user pastes it
function extractMapUrl(input) {
  // 1. Try to find the src attribute if it's an iframe tag
  const srcMatch = input.match(/src=["'](https:\/\/www\.google\.com\/maps\/embed[^"']+)["']/i)
  if (srcMatch) return srcMatch[1]
  
  // 2. Try to find the raw URL if they pasted a large chunk of text containing it
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
        title: 'Our Office Locations',
        locations: []
      })
    })
  }, [])

  const save = async (newData) => {
    try {
      setSaving(true)
      await fbFirestore.updateSettings({ officeLocations: newData })
      setData(newData)
      toast.success('Office locations updated!')
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
        <i className="fa-solid fa-map-location-dot" /> Office Locations
      </h2>

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
              placeholder="Our Office Locations"
            />
          </div>
          <div className="ap-form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.8rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={data.visible !== false}
                onChange={e => updateField('visible', e.target.checked)}
              />
              Show Section on Homepage
            </label>
          </div>
        </div>
      </div>

      {/* Office cards */}
      <div style={{ marginTop: '2.5rem' }}>
        {(data.locations || []).map((loc, i) => (
          <div key={loc.id || i} className="ap-card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--maroon)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="ap-subtitle" style={{ margin: 0 }}>
                <i className="fa-solid fa-location-dot" style={{ color: 'var(--maroon)', marginRight: '8px' }} />
                Office {i + 1}{loc.name ? ` — ${loc.name}` : ''}
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
                  <i className="fa-solid fa-trash" /> Delete
                </button>
              </div>
            </div>

            <div className="ap-form-group">
              <label className="ap-label">Office Name</label>
              <input
                className="ap-input"
                value={loc.name || ''}
                onChange={e => updateLocation(i, 'name', e.target.value)}
                placeholder="e.g. Main Office – Puducherry"
              />
            </div>

            <div className="ap-form-group">
              <label className="ap-label">Address (Line breaks supported)</label>
              <textarea
                className="ap-input"
                rows={3}
                value={loc.address || ''}
                onChange={e => updateLocation(i, 'address', e.target.value)}
                placeholder="No. 156/3, Nanbargal Nagar,&#10;Puducherry – 605 010"
              />
            </div>

            <div className="ap-form-group">
              <label className="ap-label">
                Google Maps Embed URL or iframe
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginLeft: '0.5rem', fontWeight: 400 }}>
                  Paste the full <code>&lt;iframe&gt;</code> tag <strong>or</strong> just the <code>src="..."</code> URL — both work
                </span>
              </label>
              <textarea
                className="ap-input"
                rows={3}
                value={loc.mapEmbedUrl || ''}
                onChange={e => updateLocation(i, 'mapEmbedUrl', extractMapUrl(e.target.value))}
                placeholder={'Paste full iframe src="..." tag or just the URL'}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
              />
              {loc.mapEmbedUrl && !loc.mapEmbedUrl.startsWith('http') && (
                <div style={{ fontSize: '0.75rem', color: '#d97706', marginTop: '0.5rem' }}>
                  ⚠️ Paste the full iframe tag — the src URL will be extracted automatically.
                </div>
              )}
            </div>

            {/* Live map preview */}
            {loc.mapEmbedUrl && (
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '0.5rem' }}>
                  Map Preview
                </div>
                <div className="ol-map-wrap" style={{ borderRadius: 8, overflow: 'hidden', border: '2px solid var(--maroon)' }}>
                  <iframe
                    src={loc.mapEmbedUrl}
                    title={`Preview – ${loc.name}`}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    style={{ width: '100%', height: 250, border: 0 }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new + Save */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
        <button className="ap-btn ap-btn-ghost" onClick={addLocation}>
          <i className="fa-solid fa-plus" /> Add Office Location
        </button>
        <button className="ap-btn ap-btn-primary" onClick={saveAll} disabled={saving}>
          {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Saving...</> : <><i className="fa-solid fa-floppy-disk" /> Save All Changes</>}
        </button>
      </div>
    </div>
  )
}
