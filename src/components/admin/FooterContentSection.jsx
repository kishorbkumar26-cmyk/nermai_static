import { useState, useEffect } from 'react'
import { fbFirestore } from '../../firebase/firestore'
import AdminImageUpload from './AdminImageUpload'
import AdminFileUpload from './AdminFileUpload'

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
          bottom: { meta: '' },
          contactCard: { heading: '', desc: '', qrImage: '', vcfUrl: '' }
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

  // Social Links Manager
  const renderSocialLinksManager = () => {
    const list = footer?.socialLinks || [
      { name: 'YouTube', link: 'https://youtube.com', iconClass: 'fa-brands fa-youtube', iconUrl: '' },
      { name: 'Instagram', link: 'https://instagram.com', iconClass: 'fa-brands fa-instagram', iconUrl: '' },
      { name: 'Telegram', link: 'https://t.me/', iconClass: 'fa-brands fa-telegram', iconUrl: '' }
    ]
    
    const addLink = () => {
      save({ ...footer, socialLinks: [...list, { name: 'New Social', link: '#', iconUrl: '', iconClass: 'fa-solid fa-link' }] })
    }
    
    const updateLink = (idx, field, value) => {
      const newList = [...list]
      newList[idx][field] = value
      setFooter({ ...footer, socialLinks: newList })
    }
    
    const removeLink = (idx) => {
      const newList = list.filter((_, i) => i !== idx)
      save({ ...footer, socialLinks: newList })
    }

    return (
      <div className="ap-card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="ap-subtitle">Social Media Links</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
          If FontAwesome icons are not showing, you can paste an Image URL for the logo instead. Image URLs will override FontAwesome classes.
        </p>
        {list.map((item, i) => (
          <div key={i} style={{ border: '1px solid var(--gray-200)', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ fontWeight: 600 }}>Social Link {i + 1}</div>
              <button className="ap-btn ap-btn-danger" onClick={() => removeLink(i)} style={{ padding: '0.25rem 0.5rem' }}>
                <i className="fa-solid fa-trash" /> Remove
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
              <div className="ap-form-group" style={{ marginBottom: 0 }}>
                <label className="ap-label" style={{ fontSize: '0.7rem' }}>Platform Name</label>
                <input type="text" className="ap-input" value={item.name} onChange={e => updateLink(i, 'name', e.target.value)} placeholder="YouTube" />
              </div>
              <div className="ap-form-group" style={{ marginBottom: 0 }}>
                <label className="ap-label" style={{ fontSize: '0.7rem' }}>URL</label>
                <input type="text" className="ap-input" value={item.link} onChange={e => updateLink(i, 'link', e.target.value)} placeholder="https://..." />
              </div>
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <AdminImageUpload
                label="Custom Social Icon / Logo Image"
                value={item.iconUrl || ''}
                onChange={val => updateLink(i, 'iconUrl', val)}
                subFolderName="nermai-social-icons"
                maxWidth={300}
                aspectRatio="contain"
                hint="Icon (overrides FontAwesome class)"
                placeholder="Paste Drive URL or custom icon image URL..."
                toast={toast}
              />
              <div className="ap-form-group" style={{ marginBottom: 0 }}>
                <label className="ap-label" style={{ fontSize: '0.7rem' }}>FontAwesome Class (Used if no image uploaded)</label>
                <input type="text" className="ap-input" value={item.iconClass || ''} onChange={e => updateLink(i, 'iconClass', e.target.value)} placeholder="fa-brands fa-youtube" />
              </div>
            </div>
          </div>
        ))}
        <button className="ap-btn ap-btn-secondary" onClick={addLink} style={{ marginTop: '0.5rem' }}>
          + Add Social Link
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
        {renderSocialLinksManager()}
        {renderLinksManager('Useful Links', 'usefulLinks')}
        {renderLinksManager('Notifications', 'notifications')}
        {renderLinksManager('Courses Links', 'coursesLinks')}
      </div>

      <div className="ap-card" style={{ marginTop: '2rem' }}>
        <h2 className="ap-subtitle">Contact Info Card</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
          This card appears in the footer for users to download contact info or scan a QR code.
        </p>
        <div className="ap-form-group">
          <label className="ap-label">Heading</label>
          <input className="ap-input" value={footer.contactCard?.heading || ''} onChange={e => handleUpdate('contactCard', 'heading', e.target.value)} placeholder="e.g. 'NERMAI IAS ACADEMY' is ready — download..." />
        </div>
        <div className="ap-form-group">
          <label className="ap-label">Description</label>
          <textarea className="ap-input" rows="2" value={footer.contactCard?.desc || ''} onChange={e => handleUpdate('contactCard', 'desc', e.target.value)} placeholder="e.g. Scan the QR with..."></textarea>
        </div>
        <AdminImageUpload
          label="Contact Card QR Code Image"
          value={footer.contactCard?.qrImage || ''}
          onChange={val => handleUpdate('contactCard', 'qrImage', val)}
          subFolderName="nermai-qr"
          maxWidth={600}
          aspectRatio="1/1"
          hint="Square 1:1 • QR Code"
          placeholder="Paste Google Drive QR Code link, File ID or image URL..."
          toast={toast}
        />
        <AdminFileUpload
          label="VCF File (Contact Card)"
          value={footer.contactCard?.vcfUrl || ''}
          onChange={val => handleUpdate('contactCard', 'vcfUrl', val)}
          subFolderName="nermai-vcf"
          hint="Upload .vcf file"
          placeholder="Paste Google Drive File ID or Web URL..."
          toast={toast}
        />
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
