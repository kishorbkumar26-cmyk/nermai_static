import React, { useState, useEffect } from 'react'
import { fbFirestore } from '../../firebase/firestore'
import { driveStorage } from '../../services/driveStorage'

export default function ResourceManager({ toast }) {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    title: '', description: '', category: '', 
    url: '', sizeBytes: 0, format: 'PDF', isFeatured: false
  })

  useEffect(() => {
    const unsub = fbFirestore.onResourcesChanged(data => setResources(data || []))
    return () => unsub()
  }, [])

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      // Direct upload
      const result = await driveStorage.processAndUploadFile(file, { subFolderName: 'nermai-resources' })
      if (result && result.url) {
        setForm(f => ({ 
          ...f, 
          url: result.url,
          sizeBytes: file.size,
          title: f.title || file.name.replace(/\.[^/.]+$/, ""), // Use file name as title if empty
          format: file.name.split('.').pop().toUpperCase()
        }))
        toast.success('File uploaded to Google Drive successfully!')
      } else {
        throw new Error('Upload failed. Check Google Apps Script config.')
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.url) {
      return toast.error('Title and URL are required')
    }
    
    setLoading(true)
    try {
      await fbFirestore.addResource({
        ...form,
        date: new Date().toISOString()
      })
      toast.success('Resource added successfully!')
      setForm({ title: '', description: '', category: '', url: '', sizeBytes: 0, format: 'PDF', isFeatured: false })
    } catch (err) {
      toast.error('Failed to add resource')
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return
    try {
      await fbFirestore.deleteResource(id)
      toast.success('Deleted successfully')
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const toggleFeatured = async (res) => {
    try {
      await fbFirestore.updateResource(res.id, { isFeatured: !res.isFeatured })
      toast.success(res.isFeatured ? 'Removed from featured' : 'Marked as featured')
    } catch (err) {
      toast.error('Failed to update')
    }
  }

  return (
    <div className="ap-section">
      <div className="ap-section-header">
        <h2 className="ap-section-title">Resource Desk Manager</h2>
        <p className="ap-section-desc">Manage PDFs, current affairs, and free study materials.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Add Form */}
        <div className="ap-card">
          <h3 className="ap-card-title">Add New Resource</h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="ap-form-group">
                <label>Title</label>
                <input type="text" className="ap-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. September Current Affairs" required />
              </div>
              <div className="ap-form-group">
                <label>Category Tab (e.g. CURRENT AFFAIRS)</label>
                <input type="text" className="ap-input" value={form.category} onChange={e => setForm({...form, category: e.target.value.toUpperCase()})} placeholder="CURRENT AFFAIRS" required />
              </div>
            </div>

            <div className="ap-form-group">
              <label>Description (Optional)</label>
              <input type="text" className="ap-input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Daily important issues for UPSC & TNPSC" />
            </div>

            <div className="ap-form-group">
              <label>Upload File (To Google Drive)</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input type="file" id="res-upload" style={{ display: 'none' }} onChange={handleFileChange} />
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => document.getElementById('res-upload').click()}
                  disabled={uploading}
                >
                  {uploading ? <><i className="fa-solid fa-spinner fa-spin"/> Uploading...</> : <><i className="fa-solid fa-cloud-arrow-up"/> Select File</>}
                </button>
                <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>PDF, DOCX, ZIP</span>
              </div>
            </div>

            <div className="ap-form-group">
              <label>OR Direct Drive Link (Backup Option)</label>
              <input type="url" className="ap-input" value={form.url} onChange={e => setForm({...form, url: e.target.value})} placeholder="https://drive.google.com/..." required />
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '4px', display: 'block' }}>If you already uploaded the file manually, paste the share link here.</span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} />
                Mark as Featured (Appears Larger)
              </label>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
                {loading ? 'Adding...' : 'Add Resource'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: List */}
        <div className="ap-card">
          <h3 className="ap-card-title">Current Resources</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {resources.length === 0 && <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>No resources added yet.</p>}
            {resources.map(res => (
              <div key={res.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--gray-200)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {res.title} {res.isFeatured && <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--saffron)', color: '#fff', borderRadius: '4px' }}>Featured</span>}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '4px' }}>
                    [{res.category}] • {res.format}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '4px', border: '1px solid var(--gray-200)', background: 'var(--white)', cursor: 'pointer' }} onClick={() => toggleFeatured(res)} title="Toggle Featured">
                    <i className="fa-solid fa-star" style={{ color: res.isFeatured ? 'var(--saffron)' : 'var(--gray-400)' }}></i>
                  </button>
                  <a href={res.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '4px', border: '1px solid var(--gray-200)', background: 'var(--white)', color: 'var(--ink)', textDecoration: 'none' }}>
                    <i className="fa-solid fa-eye"></i>
                  </a>
                  <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '4px', border: 'none', background: 'var(--maroon)', color: 'var(--white)', cursor: 'pointer' }} onClick={() => handleDelete(res.id)}>
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
