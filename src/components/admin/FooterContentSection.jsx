import { useState, useEffect } from 'react'
import { fbFirestore } from '../../firebase/firestore'

export default function FooterContentSection({ toast }) {
  const [footer, setFooter] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s.footer) {
        setFooter(s.footer)
      } else {
        // Load default if missing
        setFooter({
          cta: { heading: '', sub: '', btnText: '', btnLink: '' },
          brand: { desc: '', badge: '' },
          contact: { address: '', phones: '', email: '' },
          usefulLinks: [],
          notifications: [],
          coursesLinks: [],
          bottom: { meta: '' }
        })
      }
    })
  }, [])

  const save = async (newData) => {
    try {
      setSaving(true)
      await fbFirestore.updateSettings({ footer: newData })
      setFooter(newData)
      toast.success('Footer updated successfully!')
    } catch (e) {
      toast.error('Failed to update footer: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = (section, field, value) => {
    const updated = { ...footer }
    if (section === 'bottom') {
      updated.bottom = { ...updated.bottom, [field]: value }
    } else {
      updated[section] = { ...updated[section], [field]: value }
    }
    setFooter(updated)
  }

  // Generic List Manager for links
  const renderLinksManager = (title, listKey) => {
    const list = footer?.[listKey] || []
    
    const addLink = () => {
      save({ ...footer, [listKey]: [...list, { label: 'New Link', link: '#' }] })
    }
    
    const updateLink = (idx, field, value) => {
      const newList = [...list]
      newList[idx][field] = value
      setFooter({ ...footer, [listKey]: newList })
    }
    
    const removeLink = (idx) => {
      const newList = list.filter((_, i) => i !== idx)
      save({ ...footer, [listKey]: newList })
    }

    return (
      <div className="ap-card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="ap-subtitle">{title}</h3>
        {list.map((item, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input 
              type="text" 
              className="ap-input" 
              value={item.label} 
              onChange={e => updateLink(i, 'label', e.target.value)} 
              placeholder="Label" 
            />
            <input 
              type="text" 
              className="ap-input" 
              value={item.link} 
              onChange={e => updateLink(i, 'link', e.target.value)} 
              placeholder="URL (e.g. /courses or https://...)" 
            />
            <button className="ap-btn ap-btn-danger" onClick={() => removeLink(i)}>
              <i className="fa-solid fa-trash" />
            </button>
          </div>
        ))}
        <button className="ap-btn ap-btn-secondary" onClick={addLink} style={{ marginTop: '0.5rem' }}>
          + Add Link
        </button>
      </div>
    )
  }

  if (!footer) return <p>Loading footer config...</p>

  return (
    <div className="ap-section">
      <div className="ap-card">
        <h2 className="ap-subtitle">Call To Action (CTA) Banner</h2>
        <div className="ap-form-group">
          <label className="ap-label">Heading</label>
          <input className="ap-input" value={footer.cta?.heading || ''} onChange={e => handleUpdate('cta', 'heading', e.target.value)} />
        </div>
        <div className="ap-form-group">
          <label className="ap-label">Subtitle</label>
          <input className="ap-input" value={footer.cta?.sub || ''} onChange={e => handleUpdate('cta', 'sub', e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="ap-form-group">
            <label className="ap-label">Button Text</label>
            <input className="ap-input" value={footer.cta?.btnText || ''} onChange={e => handleUpdate('cta', 'btnText', e.target.value)} />
          </div>
          <div className="ap-form-group">
            <label className="ap-label">Button Link</label>
            <input className="ap-input" value={footer.cta?.btnLink || ''} onChange={e => handleUpdate('cta', 'btnLink', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="ap-card" style={{ marginTop: '2rem' }}>
        <h2 className="ap-subtitle">Brand Info</h2>
        <div className="ap-form-group">
          <label className="ap-label">Description</label>
          <textarea className="ap-input" rows="3" value={footer.brand?.desc || ''} onChange={e => handleUpdate('brand', 'desc', e.target.value)}></textarea>
        </div>
        <div className="ap-form-group">
          <label className="ap-label">Badge Text</label>
          <input className="ap-input" value={footer.brand?.badge || ''} onChange={e => handleUpdate('brand', 'badge', e.target.value)} placeholder="e.g. Non Profit · Non Commercial" />
        </div>
      </div>

      <div className="ap-card" style={{ marginTop: '2rem' }}>
        <h2 className="ap-subtitle">Contact Info</h2>
        <div className="ap-form-group">
          <label className="ap-label">Address (Line breaks supported)</label>
          <textarea className="ap-input" rows="3" value={footer.contact?.address || ''} onChange={e => handleUpdate('contact', 'address', e.target.value)}></textarea>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="ap-form-group">
            <label className="ap-label">Phone Numbers (comma separated)</label>
            <input className="ap-input" value={footer.contact?.phones || ''} onChange={e => handleUpdate('contact', 'phones', e.target.value)} placeholder="+91 999, +91 888" />
          </div>
          <div className="ap-form-group">
            <label className="ap-label">Email Address</label>
            <input className="ap-input" value={footer.contact?.email || ''} onChange={e => handleUpdate('contact', 'email', e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        {renderLinksManager('Useful Links', 'usefulLinks')}
        {renderLinksManager('Notifications', 'notifications')}
        {renderLinksManager('Courses Links', 'coursesLinks')}
      </div>

      <div className="ap-card" style={{ marginTop: '2rem' }}>
        <h2 className="ap-subtitle">Bottom Bar</h2>
        <div className="ap-form-group">
          <label className="ap-label">Meta Text</label>
          <input className="ap-input" value={footer.bottom?.meta || ''} onChange={e => handleUpdate('bottom', 'meta', e.target.value)} placeholder="Non Profit | Non Commercial" />
        </div>
      </div>

      <div className="ap-actions" style={{ marginTop: '2rem', justifyContent: 'flex-start' }}>
        <button className="ap-btn ap-btn-primary" onClick={() => save(footer)} disabled={saving}>
          {saving ? 'Saving...' : 'Save Footer Settings'}
        </button>
      </div>
    </div>
  )
}
