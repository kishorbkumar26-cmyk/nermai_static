import { useState, useEffect } from 'react'
import { fbFirestore } from '../../firebase/firestore'
import { DEFAULT_OFFICE_SETTINGS, DEFAULT_MAIN_LOCATION, getLocationAddresses } from '../OfficeLocations'

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
  const [activeSubTab, setActiveSubTab] = useState('locations')
  const [data, setData] = useState(DEFAULT_OFFICE_SETTINGS)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s?.officeLocations) {
        setData(prev => ({
          ...DEFAULT_OFFICE_SETTINGS,
          ...s.officeLocations,
          locations: s.officeLocations.locations && s.officeLocations.locations.length > 0 
            ? s.officeLocations.locations 
            : [DEFAULT_MAIN_LOCATION]
        }))
      }
    })
  }, [])

  const save = async (newData) => {
    try {
      setSaving(true)
      await fbFirestore.updateSettings({ officeLocations: newData })
      setData(newData)
      toast.success('Office locations & texts updated successfully!')
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
    const newLoc = {
      ...DEFAULT_MAIN_LOCATION,
      id,
      name: `Branch Office ${((data.locations || []).length + 1)}`,
      tagline: 'BRANCH OFFICE'
    }
    const locs = [...(data.locations || []), newLoc]
    setData(d => ({ ...d, locations: locs }))
    toast.info('New location added. Click Save to publish!')
  }

  const updateLocation = (idx, field, value) => {
    setData(d => {
      const locs = [...(d.locations || [])]
      locs[idx] = { ...locs[idx], [field]: value }
      return { ...d, locations: locs }
    })
  }

  const updateLocationMultiple = (idx, updatesObj) => {
    setData(d => {
      const locs = [...(d.locations || [])]
      locs[idx] = { ...locs[idx], ...updatesObj }
      return { ...d, locations: locs }
    })
  }

  const deleteLocation = (idx) => {
    if (!window.confirm('Delete this office location?')) return
    const locs = (data.locations || []).filter((_, i) => i !== idx)
    setData(d => ({ ...d, locations: locs }))
    toast.info('Location removed. Click Save to publish changes.')
  }

  const saveAll = () => save(data)

  if (!data) return <div className="ap-empty"><i className="fa-solid fa-spinner fa-spin" /><p>Loading...</p></div>

  const isSectionVisible = data.visible !== false
  const isCardVisible = data.cardVisible !== false
  const isFeaturesVisible = data.featuresVisible !== false
  const isHeaderVisible = data.headerVisible !== false
  const isScriptsVisible = data.scriptsVisible !== false

  return (
    <div className="ap-section">
      <h2 className="ap-section-title">
        <i className="fa-solid fa-map-location-dot" /> Office Locations &amp; Map Management
      </h2>
      <p style={{ color: 'var(--gray-600)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
        Customize every single word, title, script note, location card, button, and bottom feature highlight in the <strong>"Our Office Locations"</strong> homepage section.
      </p>

      {/* ── Prominent Global Visibility Control Banner (Visible across all tabs) ── */}
      <div
        className="ap-card"
        style={{
          marginBottom: '1.5rem',
          padding: '1.25rem 1.5rem',
          borderLeft: isSectionVisible ? '5px solid #10b981' : '5px solid #ef4444',
          background: isSectionVisible ? '#f0fdf4' : '#fef2f2',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.2rem' }}>
                {isSectionVisible ? '🟢' : '🔴'}
              </span>
              <strong style={{ fontSize: '1rem', color: isSectionVisible ? '#065f46' : '#991b1b' }}>
                {isSectionVisible ? 'Section is VISIBLE on Homepage' : 'Section is HIDDEN from Homepage'}
              </strong>
            </div>
            <p style={{ margin: '0.25rem 0 0 1.8rem', fontSize: '0.8rem', color: isSectionVisible ? '#047857' : '#b91c1c' }}>
              {isSectionVisible 
                ? 'The entire Office Locations section is currently active and visible to visitors.'
                : 'The entire Office Locations section is hidden from the public website.'}
            </p>
          </div>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', background: 'white', padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1.5px solid #d1d5db', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', fontWeight: 700, fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={isSectionVisible}
              onChange={e => updateField('visible', e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            {isSectionVisible ? 'Overall Section: ON' : 'Overall Section: OFF'}
          </label>
        </div>

        {/* Detailed Component Visibility Toggles */}
        {isSectionVisible && (
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '0.85rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={isCardVisible}
                onChange={e => updateField('cardVisible', e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              Show Main Map &amp; Office Card
            </label>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={isFeaturesVisible}
                onChange={e => updateField('featuresVisible', e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              Show Bottom Features &amp; Motto Bar
            </label>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={isHeaderVisible}
                onChange={e => updateField('headerVisible', e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              Show Section Header &amp; Titles
            </label>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={isScriptsVisible}
                onChange={e => updateField('scriptsVisible', e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              Show Floating Cursive Accents
            </label>
          </div>
        )}
      </div>

      {/* Sub-tab Navigation */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem', borderBottom: '2px solid var(--gray-200)', paddingBottom: '0.75rem' }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('locations')}
          style={{
            padding: '0.5rem 1.15rem',
            border: activeSubTab === 'locations' ? '2px solid var(--maroon)' : '2px solid var(--gray-200)',
            background: activeSubTab === 'locations' ? 'var(--maroon)' : 'var(--white)',
            color: activeSubTab === 'locations' ? 'var(--white)' : 'var(--gray-600)',
            fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.4rem'
          }}
        >
          <i className="fa-solid fa-building" /> 1. Location Cards &amp; Maps ({(data.locations || []).length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('header')}
          style={{
            padding: '0.5rem 1.15rem',
            border: activeSubTab === 'header' ? '2px solid var(--maroon)' : '2px solid var(--gray-200)',
            background: activeSubTab === 'header' ? 'var(--maroon)' : 'var(--white)',
            color: activeSubTab === 'header' ? 'var(--white)' : 'var(--gray-600)',
            fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.4rem'
          }}
        >
          <i className="fa-solid fa-heading" /> 2. Header &amp; Floating Script Notes
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('features')}
          style={{
            padding: '0.5rem 1.15rem',
            border: activeSubTab === 'features' ? '2px solid var(--maroon)' : '2px solid var(--gray-200)',
            background: activeSubTab === 'features' ? 'var(--maroon)' : 'var(--white)',
            color: activeSubTab === 'features' ? 'var(--white)' : 'var(--gray-600)',
            fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.4rem'
          }}
        >
          <i className="fa-solid fa-cubes-stacked" /> 3. Bottom Features &amp; Motto
        </button>
      </div>

      {/* ────────────────── SUB-TAB 1: Location Branches & Cards ────────────────── */}
      {activeSubTab === 'locations' && (
        <div>
          <div className="ap-card" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, color: 'var(--ink)' }}>
              Total Branches / Locations: {(data.locations || []).length}
            </div>
            <button type="button" className="ap-btn ap-btn-ghost ap-btn-sm" onClick={addLocation}>
              <i className="fa-solid fa-plus" /> Add Branch / Location
            </button>
          </div>

          {(data.locations || []).map((loc, i) => (
            <div key={loc.id || i} className="ap-card" style={{ marginBottom: '2rem', borderLeft: '5px solid var(--maroon)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.75rem' }}>
                <h3 className="ap-subtitle" style={{ margin: 0, fontSize: '1.1rem', color: 'var(--maroon)' }}>
                  <i className="fa-solid fa-location-dot" style={{ marginRight: '8px' }} />
                  Location #{i + 1}: {loc.name || 'Unnamed Office'}
                </h3>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={loc.visible !== false}
                      onChange={e => updateLocation(i, 'visible', e.target.checked)}
                    />
                    Card Visible
                  </label>
                  {(data.locations || []).length > 1 && (
                    <button type="button" className="ap-btn ap-btn-danger ap-btn-sm" onClick={() => deleteLocation(i)}>
                      <i className="fa-solid fa-trash" /> Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Badge */}
              <div className="ap-form-row">
                <div className="ap-form-group">
                  <label className="ap-label">Office Name (e.g. Main Office – Puducherry)</label>
                  <input
                    className="ap-input"
                    value={loc.name || ''}
                    onChange={e => updateLocation(i, 'name', e.target.value)}
                    placeholder="Main Office – Puducherry"
                  />
                </div>

                <div className="ap-form-group">
                  <label className="ap-label">Top Badge Tagline (e.g. MAIN OFFICE / BRANCH 1)</label>
                  <input
                    className="ap-input"
                    value={loc.tagline || ''}
                    onChange={e => updateLocation(i, 'tagline', e.target.value)}
                    placeholder="MAIN OFFICE"
                  />
                </div>
              </div>

              {/* Addresses Section: Address 1 (Lines 1, 2, 3), + Add Address 2, etc. */}
              <div style={{ background: '#FAF8F5', border: '1.5px solid #EFE5D8', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1.5px solid #EFE5D8', paddingBottom: '0.75rem' }}>
                  <div>
                    <label className="ap-label" style={{ margin: 0, fontWeight: 700, color: 'var(--maroon)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.98rem' }}>
                      <i className="fa-solid fa-location-dot" />
                      Office Addresses (Address 1, Address 2, etc.)
                    </label>
                    <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)', display: 'block', marginTop: '2px' }}>
                      Add Address 1 with Line 1, 2, 3 and click "+ Add Address 2" to add another address within this same location tag.
                    </span>
                  </div>

                  <button
                    type="button"
                    className="ap-btn ap-btn-sm"
                    onClick={() => {
                      const currentBlocks = getLocationAddresses(loc)
                      const nextNum = currentBlocks.length + 1
                      const newBlock = {
                        id: 'addr_' + Math.random().toString(36).substr(2, 7),
                        title: `Address ${nextNum}`,
                        lines: ['', '', '']
                      }
                      const updated = [...currentBlocks, newBlock]
                      updateLocationMultiple(i, {
                        addresses: updated,
                        addressLines: updated[0]?.lines || [],
                        address: updated.map(b => (b.lines || []).filter(Boolean).join(', ')).filter(Boolean).join('\n---\n')
                      })
                    }}
                    style={{ 
                      fontSize: '0.82rem', 
                      padding: '0.45rem 1rem', 
                      fontWeight: 700, 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      background: 'var(--maroon, #7b1b2e)', 
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <i className="fa-solid fa-plus" /> + Add Address {(getLocationAddresses(loc).length + 1)}
                  </button>
                </div>

                {(() => {
                  const addressBlocks = getLocationAddresses(loc)

                  return addressBlocks.map((block, bIdx) => (
                    <div 
                      key={block.id || bIdx} 
                      style={{ 
                        background: '#FFFFFF', 
                        border: '1.5px solid #E5DCCE', 
                        borderRadius: '10px', 
                        padding: '1.15rem', 
                        marginBottom: bIdx < addressBlocks.length - 1 ? '1.25rem' : '0.25rem',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                      }}
                    >
                      {/* Block Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ background: '#7B1B2E', color: '#FFFFFF', fontWeight: 800, fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px' }}>
                            Address {bIdx + 1}
                          </span>
                          <input
                            style={{
                              border: '1px solid #D5C9B8',
                              borderRadius: '6px',
                              padding: '0.3rem 0.6rem',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              color: '#7B1B2E',
                              background: '#FAF7F2',
                              width: '210px'
                            }}
                            value={block.title || `Address ${bIdx + 1}`}
                            onChange={e => {
                              const updated = [...addressBlocks]
                              updated[bIdx] = { ...block, title: e.target.value }
                              updateLocationMultiple(i, {
                                addresses: updated,
                                addressLines: updated[0]?.lines || [],
                                address: updated.map(b => (b.lines || []).filter(Boolean).join(', ')).filter(Boolean).join('\n---\n')
                              })
                            }}
                            placeholder={`Address ${bIdx + 1} Label`}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="ap-btn ap-btn-ghost ap-btn-sm"
                            onClick={() => {
                              const updated = [...addressBlocks]
                              updated[bIdx] = { ...block, lines: [...(block.lines || []), ''] }
                              updateLocationMultiple(i, {
                                addresses: updated,
                                addressLines: updated[0]?.lines || [],
                                address: updated.map(b => (b.lines || []).filter(Boolean).join(', ')).filter(Boolean).join('\n---\n')
                              })
                            }}
                            style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
                          >
                            <i className="fa-solid fa-plus" /> + Add Line
                          </button>

                          {addressBlocks.length > 1 && (
                            <button
                              type="button"
                              className="ap-btn ap-btn-danger ap-btn-sm"
                              onClick={() => {
                                const updated = addressBlocks.filter((_, idx) => idx !== bIdx)
                                updateLocationMultiple(i, {
                                  addresses: updated,
                                  addressLines: updated[0]?.lines || [],
                                  address: updated.map(b => (b.lines || []).filter(Boolean).join(', ')).filter(Boolean).join('\n---\n')
                                })
                              }}
                              style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
                            >
                              <i className="fa-solid fa-trash" /> Delete Address {bIdx + 1}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Lines for this Address Block */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {(block.lines || ['']).map((line, lIdx) => (
                          <div key={lIdx} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888', minWidth: '50px' }}>
                              Line {lIdx + 1}:
                            </span>
                            <input
                              className="ap-input"
                              style={{ margin: 0, flex: 1 }}
                              value={line}
                              onChange={e => {
                                const newLines = [...(block.lines || [])]
                                newLines[lIdx] = e.target.value
                                const updated = [...addressBlocks]
                                updated[bIdx] = { ...block, lines: newLines }
                                updateLocationMultiple(i, {
                                  addresses: updated,
                                  addressLines: updated[0]?.lines || [],
                                  address: updated.map(b => (b.lines || []).filter(Boolean).join(', ')).filter(Boolean).join('\n---\n')
                                })
                              }}
                              placeholder={
                                lIdx === 0 
                                  ? 'Line 1: Door No, Building Name, Street / Main Road' 
                                  : lIdx === 1 
                                    ? 'Line 2: Area, Landmark, Main Town' 
                                    : lIdx === 2
                                      ? 'Line 3: City, State – Pincode'
                                      : `Line ${lIdx + 1}`
                              }
                            />
                            {(block.lines || []).length > 1 && (
                              <button
                                type="button"
                                className="ap-btn ap-btn-danger ap-btn-sm"
                                onClick={() => {
                                  const newLines = (block.lines || []).filter((_, idx) => idx !== lIdx)
                                  const updated = [...addressBlocks]
                                  updated[bIdx] = { ...block, lines: newLines }
                                  updateLocationMultiple(i, {
                                    addresses: updated,
                                    addressLines: updated[0]?.lines || [],
                                    address: updated.map(b => (b.lines || []).filter(Boolean).join(', ')).filter(Boolean).join('\n---\n')
                                  })
                                }}
                                title="Remove this line"
                                style={{ padding: '0.4rem 0.65rem' }}
                              >
                                <i className="fa-solid fa-xmark" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                })()}
              </div>

              {/* Contact Pill 1: Phone Numbers (Multiple Allowed) */}
              <div style={{ background: '#FAF8F5', border: '1.5px solid #EFE5D8', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <label className="ap-label" style={{ margin: 0, fontWeight: 700, color: 'var(--maroon)' }}>
                    <i className="fa-solid fa-phone" style={{ marginRight: '6px' }} />
                    Contact Phone Number(s)
                  </label>
                  <button
                    type="button"
                    className="ap-btn ap-btn-sm"
                    onClick={() => {
                      const currentPhones = Array.isArray(loc.phones) && loc.phones.length > 0
                        ? [...loc.phones]
                        : (loc.phone ? loc.phone.split(/[\n,;/]+/).map(p => p.trim()).filter(Boolean) : ['+91 8903 108000'])
                      const newPhones = [...currentPhones, '']
                      updateLocationMultiple(i, {
                        phones: newPhones,
                        phone: newPhones.filter(Boolean).join(', ')
                      })
                    }}
                    style={{ 
                      fontSize: '0.82rem', 
                      padding: '0.4rem 0.9rem', 
                      fontWeight: 700, 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      background: 'var(--maroon, #7b1b2e)', 
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <i className="fa-solid fa-plus" /> + Add Phone Number
                  </button>
                </div>

                <div className="ap-form-row" style={{ alignItems: 'flex-start' }}>
                  <div className="ap-form-group" style={{ flex: 1.6, margin: 0 }}>
                    {(() => {
                      const currentPhones = Array.isArray(loc.phones) && loc.phones.length > 0
                        ? loc.phones
                        : (loc.phone ? loc.phone.split(/[\n,;/]+/).map(p => p.trim()).filter(Boolean) : ['+91 8903 108000'])

                      return currentPhones.map((ph, pIdx) => (
                        <div key={pIdx} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                          <input
                            className="ap-input"
                            value={ph}
                            onChange={e => {
                              const newPhones = [...currentPhones]
                              newPhones[pIdx] = e.target.value
                              updateLocationMultiple(i, {
                                phones: newPhones,
                                phone: newPhones.filter(Boolean).join(', ')
                              })
                            }}
                            placeholder={pIdx === 0 ? '+91 8903 108000 (Main Number)' : `+91 9198765432 (Number #${pIdx + 1})`}
                          />
                          {currentPhones.length > 1 && (
                            <button
                              type="button"
                              className="ap-btn ap-btn-danger ap-btn-sm"
                              onClick={() => {
                                const newPhones = currentPhones.filter((_, idx) => idx !== pIdx)
                                updateLocationMultiple(i, {
                                 phones: newPhones,
                                 phone: newPhones.filter(Boolean).join(', ')
                                })
                              }}
                              title="Delete Phone Number"
                              style={{ padding: '0.5rem 0.75rem' }}
                            >
                              <i className="fa-solid fa-trash" />
                            </button>
                          )}
                        </div>
                      ))
                    })()}
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                      Add all office phone numbers. Each will be clickable on the website card.
                    </span>
                  </div>

                  <div className="ap-form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="ap-label">Phone Box Label</label>
                    <input
                      className="ap-input"
                      value={loc.phoneLabel !== undefined ? loc.phoneLabel : 'Call Us'}
                      onChange={e => updateLocation(i, 'phoneLabel', e.target.value)}
                      placeholder="Call Us"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Pill 2: Email */}
              <div className="ap-form-row">
                <div className="ap-form-group">
                  <label className="ap-label">Contact Email Address</label>
                  <input
                    className="ap-input"
                    value={loc.email || ''}
                    onChange={e => updateLocation(i, 'email', e.target.value)}
                    placeholder="nermaiiasacademy@gmail.com"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-label">Email Label</label>
                  <input
                    className="ap-input"
                    value={loc.emailLabel || ''}
                    onChange={e => updateLocation(i, 'emailLabel', e.target.value)}
                    placeholder="Email Us"
                  />
                </div>
              </div>

              {/* Contact Pill 3: Working Hours */}
              <div className="ap-form-row">
                <div className="ap-form-group">
                  <label className="ap-label">Working Days (e.g. Mon – Sat)</label>
                  <input
                    className="ap-input"
                    value={loc.hoursDays || ''}
                    onChange={e => updateLocation(i, 'hoursDays', e.target.value)}
                    placeholder="Mon – Sat"
                  />
                </div>

                <div className="ap-form-group">
                  <label className="ap-label">Working Hours (e.g. 9:00 AM – 6:00 PM)</label>
                  <input
                    className="ap-input"
                    value={loc.hoursTime || ''}
                    onChange={e => updateLocation(i, 'hoursTime', e.target.value)}
                    placeholder="9:00 AM – 6:00 PM"
                  />
                </div>
              </div>

              {/* Directions CTA Button */}
              <div className="ap-form-row">
                <div className="ap-form-group">
                  <label className="ap-label">Directions Button Text</label>
                  <input
                    className="ap-input"
                    value={loc.directionsButtonText || ''}
                    onChange={e => updateLocation(i, 'directionsButtonText', e.target.value)}
                    placeholder="Get Directions on Google Maps"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-label">Google Maps Link URL</label>
                  <input
                    className="ap-input"
                    value={loc.directionsUrl || ''}
                    onChange={e => updateLocation(i, 'directionsUrl', e.target.value)}
                    placeholder="https://maps.google.com/maps?daddr=..."
                  />
                </div>
              </div>

              {/* Quote */}
              <div className="ap-form-group">
                <label className="ap-label">Location Quote / Message</label>
                <input
                  className="ap-input"
                  value={loc.quote || ''}
                  onChange={e => updateLocation(i, 'quote', e.target.value)}
                  placeholder="A space to learn, grow and achieve together."
                />
              </div>

              {/* Map Embed */}
              <div className="ap-form-group">
                <label className="ap-label">
                  Google Maps Embed URL or <code>&lt;iframe&gt;</code> HTML
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginLeft: '0.5rem', fontWeight: 400 }}>
                    (Paste full iframe or share map URL)
                  </span>
                </label>
                <textarea
                  className="ap-input"
                  rows={2}
                  value={loc.mapEmbedUrl || ''}
                  onChange={e => updateLocation(i, 'mapEmbedUrl', extractMapUrl(e.target.value))}
                  placeholder={'Paste Google Maps iframe src="..." or share URL'}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                />
              </div>

              {/* Live map preview */}
              {loc.mapEmbedUrl && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '0.35rem' }}>
                    Live Map Preview:
                  </div>
                  <div style={{ borderRadius: 12, overflow: 'hidden', border: '1.5px solid var(--maroon)' }}>
                    <iframe
                      src={extractMapUrl(loc.mapEmbedUrl)}
                      title={`Preview – ${loc.name}`}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      style={{ width: '100%', height: 200, border: 0 }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          <button type="button" className="ap-btn ap-btn-ghost" onClick={addLocation} style={{ width: '100%', padding: '0.85rem' }}>
            <i className="fa-solid fa-plus" /> Add Another Office Location Branch
          </button>
        </div>
      )}

      {/* ────────────────── SUB-TAB 2: Header & Floating Script Notes ────────────────── */}
      {activeSubTab === 'header' && (
        <div>
          {/* Main Titles */}
          <div className="ap-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
            <h4 style={{ color: 'var(--maroon)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.5rem' }}>
              <i className="fa-solid fa-heading" style={{ marginRight: '6px' }} /> Main Section Headings
            </h4>
            <div className="ap-form-row">
              <div className="ap-form-group">
                <label className="ap-label">Top Eyebrow Tag (e.g. 📍 OUR LOCATION)</label>
                <input
                  className="ap-input"
                  value={data.eyebrow !== undefined ? data.eyebrow : DEFAULT_OFFICE_SETTINGS.eyebrow}
                  onChange={e => updateField('eyebrow', e.target.value)}
                  placeholder="📍 OUR LOCATION"
                />
              </div>
              <div className="ap-form-group">
                <label className="ap-label">Main Section Title (e.g. Our Office Locations)</label>
                <input
                  className="ap-input"
                  value={data.title !== undefined ? data.title : DEFAULT_OFFICE_SETTINGS.title}
                  onChange={e => updateField('title', e.target.value)}
                  placeholder="Our Office Locations"
                />
              </div>
            </div>
            <div className="ap-form-group">
              <label className="ap-label">Section Subtitle Description</label>
              <textarea
                className="ap-input ap-textarea"
                rows={2}
                value={data.subtitle !== undefined ? data.subtitle : DEFAULT_OFFICE_SETTINGS.subtitle}
                onChange={e => updateField('subtitle', e.target.value)}
                placeholder="Visit our centre to experience a supportive learning environment..."
              />
            </div>
          </div>

          {/* Top-Left Floating Cursive Script */}
          <div className="ap-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
            <h4 style={{ color: 'var(--maroon)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.5rem' }}>
              <i className="fa-solid fa-pen-nib" style={{ marginRight: '6px' }} /> Top-Left Floating Handwritten Note (Cursive)
            </h4>
            <div className="ap-form-row">
              <div className="ap-form-group">
                <label className="ap-label">Line 1</label>
                <input
                  className="ap-input"
                  value={data.leftScriptLine1 !== undefined ? data.leftScriptLine1 : DEFAULT_OFFICE_SETTINGS.leftScriptLine1}
                  onChange={e => updateField('leftScriptLine1', e.target.value)}
                  placeholder="Accessible"
                />
              </div>
              <div className="ap-form-group">
                <label className="ap-label">Line 2</label>
                <input
                  className="ap-input"
                  value={data.leftScriptLine2 !== undefined ? data.leftScriptLine2 : DEFAULT_OFFICE_SETTINGS.leftScriptLine2}
                  onChange={e => updateField('leftScriptLine2', e.target.value)}
                  placeholder="Supportive"
                />
              </div>
              <div className="ap-form-group">
                <label className="ap-label">Line 3</label>
                <input
                  className="ap-input"
                  value={data.leftScriptLine3 !== undefined ? data.leftScriptLine3 : DEFAULT_OFFICE_SETTINGS.leftScriptLine3}
                  onChange={e => updateField('leftScriptLine3', e.target.value)}
                  placeholder="Always Near You"
                />
              </div>
            </div>
          </div>

          {/* Top-Right Floating Cursive Script */}
          <div className="ap-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
            <h4 style={{ color: 'var(--maroon)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.5rem' }}>
              <i className="fa-solid fa-signature" style={{ marginRight: '6px' }} /> Top-Right Floating Handwritten Note (Tilted Cursive)
            </h4>
            <div className="ap-form-row">
              <div className="ap-form-group">
                <label className="ap-label">Line 1</label>
                <input
                  className="ap-input"
                  value={data.rightScriptLine1 !== undefined ? data.rightScriptLine1 : DEFAULT_OFFICE_SETTINGS.rightScriptLine1}
                  onChange={e => updateField('rightScriptLine1', e.target.value)}
                  placeholder="Same City."
                />
              </div>
              <div className="ap-form-group">
                <label className="ap-label">Line 2</label>
                <input
                  className="ap-input"
                  value={data.rightScriptLine2 !== undefined ? data.rightScriptLine2 : DEFAULT_OFFICE_SETTINGS.rightScriptLine2}
                  onChange={e => updateField('rightScriptLine2', e.target.value)}
                  placeholder="Bigger Aspirations."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── SUB-TAB 3: Bottom Features & Motto ────────────────── */}
      {activeSubTab === 'features' && (
        <div>
          {/* Feature 1 */}
          <div className="ap-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
            <h4 style={{ color: 'var(--maroon)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.5rem' }}>
              <i className="fa-solid fa-graduation-cap" style={{ marginRight: '6px' }} /> Feature 1 (Leftmost Highlight)
            </h4>
            <div className="ap-form-row">
              <div className="ap-form-group">
                <label className="ap-label">Title</label>
                <input
                  className="ap-input"
                  value={data.feature1Title !== undefined ? data.feature1Title : DEFAULT_OFFICE_SETTINGS.feature1Title}
                  onChange={e => updateField('feature1Title', e.target.value)}
                  placeholder="Easy Access"
                />
              </div>
              <div className="ap-form-group">
                <label className="ap-label">FontAwesome Icon Class</label>
                <input
                  className="ap-input"
                  value={data.feature1Icon !== undefined ? data.feature1Icon : DEFAULT_OFFICE_SETTINGS.feature1Icon}
                  onChange={e => updateField('feature1Icon', e.target.value)}
                  placeholder="fa-graduation-cap"
                />
              </div>
            </div>
            <div className="ap-form-group">
              <label className="ap-label">Description</label>
              <input
                className="ap-input"
                value={data.feature1Desc !== undefined ? data.feature1Desc : DEFAULT_OFFICE_SETTINGS.feature1Desc}
                onChange={e => updateField('feature1Desc', e.target.value)}
                placeholder="Centrally located with convenient transport options"
              />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="ap-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
            <h4 style={{ color: 'var(--maroon)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.5rem' }}>
              <i className="fa-solid fa-users" style={{ marginRight: '6px' }} /> Feature 2 (Center Highlight)
            </h4>
            <div className="ap-form-row">
              <div className="ap-form-group">
                <label className="ap-label">Title</label>
                <input
                  className="ap-input"
                  value={data.feature2Title !== undefined ? data.feature2Title : DEFAULT_OFFICE_SETTINGS.feature2Title}
                  onChange={e => updateField('feature2Title', e.target.value)}
                  placeholder="Student Friendly"
                />
              </div>
              <div className="ap-form-group">
                <label className="ap-label">FontAwesome Icon Class</label>
                <input
                  className="ap-input"
                  value={data.feature2Icon !== undefined ? data.feature2Icon : DEFAULT_OFFICE_SETTINGS.feature2Icon}
                  onChange={e => updateField('feature2Icon', e.target.value)}
                  placeholder="fa-users"
                />
              </div>
            </div>
            <div className="ap-form-group">
              <label className="ap-label">Description</label>
              <input
                className="ap-input"
                value={data.feature2Desc !== undefined ? data.feature2Desc : DEFAULT_OFFICE_SETTINGS.feature2Desc}
                onChange={e => updateField('feature2Desc', e.target.value)}
                placeholder="A welcoming space designed for aspirants"
              />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="ap-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
            <h4 style={{ color: 'var(--maroon)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.5rem' }}>
              <i className="fa-solid fa-shield-halved" style={{ marginRight: '6px' }} /> Feature 3 (Right Highlight)
            </h4>
            <div className="ap-form-row">
              <div className="ap-form-group">
                <label className="ap-label">Title</label>
                <input
                  className="ap-input"
                  value={data.feature3Title !== undefined ? data.feature3Title : DEFAULT_OFFICE_SETTINGS.feature3Title}
                  onChange={e => updateField('feature3Title', e.target.value)}
                  placeholder="A Supportive Community"
                />
              </div>
              <div className="ap-form-group">
                <label className="ap-label">FontAwesome Icon Class</label>
                <input
                  className="ap-input"
                  value={data.feature3Icon !== undefined ? data.feature3Icon : DEFAULT_OFFICE_SETTINGS.feature3Icon}
                  onChange={e => updateField('feature3Icon', e.target.value)}
                  placeholder="fa-shield-halved"
                />
              </div>
            </div>
            <div className="ap-form-group">
              <label className="ap-label">Description</label>
              <input
                className="ap-input"
                value={data.feature3Desc !== undefined ? data.feature3Desc : DEFAULT_OFFICE_SETTINGS.feature3Desc}
                onChange={e => updateField('feature3Desc', e.target.value)}
                placeholder="More than a coaching centre — a place to grow"
              />
            </div>
          </div>

          {/* Bottom Right Motto Tag */}
          <div className="ap-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
            <h4 style={{ color: 'var(--maroon)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.5rem' }}>
              <i className="fa-solid fa-award" style={{ marginRight: '6px' }} /> Bottom-Right Motto Tag (All Caps)
            </h4>
            <div className="ap-form-row">
              <div className="ap-form-group">
                <label className="ap-label">Motto Line 1</label>
                <input
                  className="ap-input"
                  value={data.mottoLine1 !== undefined ? data.mottoLine1 : DEFAULT_OFFICE_SETTINGS.mottoLine1}
                  onChange={e => updateField('mottoLine1', e.target.value)}
                  placeholder="EMPOWERING ASPIRANTS."
                />
              </div>
              <div className="ap-form-group">
                <label className="ap-label">Motto Line 2</label>
                <input
                  className="ap-input"
                  value={data.mottoLine2 !== undefined ? data.mottoLine2 : DEFAULT_OFFICE_SETTINGS.mottoLine2}
                  onChange={e => updateField('mottoLine2', e.target.value)}
                  placeholder="STRENGTHENING THE NATION."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div style={{ position: 'sticky', bottom: '1rem', zIndex: 10, marginTop: '1.5rem' }}>
        <button
          type="button"
          className="ap-btn ap-btn-primary"
          onClick={saveAll}
          disabled={saving}
          style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
        >
          {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Saving All Changes...</> : <><i className="fa-solid fa-floppy-disk" /> Save All Office &amp; Location Changes</>}
        </button>
      </div>
    </div>
  )
}
