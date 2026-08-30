import { useState, useEffect, useRef } from 'react'
import { fbFirestore } from '../../firebase/firestore'
import { driveStorage } from '../../services/driveStorage'

function FileDropZone({ onUpload, uploading, progress }) {
  const [drag, setDrag] = useState(false)
  const ref = useRef(null)
  const handleFile = async f => { if (!f || !f.type.startsWith('image/')) return; await onUpload(f) }
  return (
    <div
      className={`ap-file-drop${drag ? ' drag-over' : ''}`}
      style={{ minHeight: 70 }}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
      onClick={() => ref.current?.click()}
    >
      <i className={`fa-solid ${uploading ? 'fa-spinner fa-spin' : 'fa-cloud-arrow-up'}`} />
      <p style={{ fontSize: '0.82rem' }}>{uploading ? `Uploading... ${progress}%` : 'Click or drag image'}</p>
      <input ref={ref} type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} />
      {uploading && <div className="ap-upload-progress"><div className="ap-upload-progress-bar" style={{ width: `${progress}%` }} /></div>}
    </div>
  )
}

const DEFAULT_COLORS = ['#7b1b2e','#e65c00','#1d4ed8','#047857','#6b21a8','#b45309','#0f766e','#9f1239']

export default function ResultsGallerySection({ toast }) {
  const [categories, setCategories] = useState([])
  const [images, setImages]         = useState([])
  const [activeTab, setActiveTab]   = useState('categories')
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState('#7b1b2e')
  const [selectedCat, setSelectedCat] = useState('all')
  const [uploadCat, setUploadCat]   = useState('')
  const [uploadCaption, setUploadCaption] = useState('')
  const [uploading, setUploading]   = useState(false)
  const [progress, setProgress]     = useState(0)
  const [urlInput, setUrlInput]     = useState('')
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      fbFirestore.getResultCategories(),
      fbFirestore.getGallery(),
    ]).then(([cats, imgs]) => {
      setCategories(cats)
      setImages(imgs)
      if (cats.length > 0 && !uploadCat) setUploadCat(cats[0].slug)
      setLoading(false)
    })
  }, [])

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return
    try {
      await fbFirestore.addResultCategory({ name: newCatName.trim(), color: newCatColor })
      const cats = await fbFirestore.getResultCategories()
      setCategories(cats)
      setNewCatName('')
      toast.success('Category added!')
    } catch (e) { toast.error(e.message) }
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return
    try {
      await fbFirestore.deleteResultCategory(id)
      setCategories(c => c.filter(x => x.id !== id))
      toast.success('Category deleted.')
    } catch (e) { toast.error(e.message) }
  }

  const handleFileUpload = async (file) => {
    if (!uploadCat) { toast.error('Please select a category first.'); return }
    setUploading(true); setProgress(0)
    try {
      const url = await driveStorage.uploadImage(file, { onProgress: p => setProgress(Math.round(p)) })
      await fbFirestore.addGalleryImage({ url, caption: uploadCaption || file.name, category: uploadCat, storageType: 'drive' })
      setImages(await fbFirestore.getGallery())
      setUploadCaption('')
      toast.success('Image uploaded!')
    } catch (e) { toast.error(e.message) }
    finally { setUploading(false); setProgress(0) }
  }

  const handleUrlAdd = async () => {
    if (!urlInput.trim() || !uploadCat) { toast.error('Enter a URL and select a category.'); return }
    try {
      await fbFirestore.addGalleryImage({ url: urlInput.trim(), caption: uploadCaption || '', category: uploadCat, storageType: 'url' })
      setImages(await fbFirestore.getGallery())
      setUrlInput(''); setUploadCaption('')
      toast.success('Image added!')
    } catch (e) { toast.error(e.message) }
  }

  const handleDeleteImage = async (id) => {
    if (!window.confirm('Delete this image?')) return
    try {
      await fbFirestore.deleteGalleryImage(id)
      setImages(imgs => imgs.filter(i => i.id !== id))
      toast.success('Image deleted.')
    } catch (e) { toast.error(e.message) }
  }

  const filteredImages = selectedCat === 'all'
    ? images
    : images.filter(img => img.category === selectedCat)

  if (loading) return <div style={{ padding: '2rem', color: 'var(--gray-400)' }}><i className="fa-solid fa-spinner fa-spin" /> Loading...</div>

  return (
    <div>
      <h2 className="ap-section-title"><i className="fa-solid fa-images" /> Results Gallery</h2>
      <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: '1.25rem' }}>
        Create custom categories (UPSC, UDC, LDC, etc.) and upload result images to each. Categories appear as tabs on the Results page.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem', borderBottom: '2px solid var(--gray-200)', paddingBottom: '0.5rem' }}>
        {[{id: 'categories', label: '🏷️ Manage Categories'}, {id: 'upload', label: '⬆️ Upload Images'}, {id: 'gallery', label: '🖼️ View Gallery'}].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '0.4rem 0.9rem', borderRadius: 0, border: activeTab === t.id ? '2px solid var(--maroon)' : '2px solid var(--gray-200)', background: activeTab === t.id ? 'var(--maroon)' : 'var(--white)', color: activeTab === t.id ? 'var(--white)' : 'var(--gray-600)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div>
          <div className="ap-card" style={{ marginBottom: '1rem', padding: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem' }}>➕ Add New Category</div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="ap-form-group" style={{ flex: 1, minWidth: 160, margin: 0 }}>
                <label>Category Name (e.g. UPSC, UDC, LDC)</label>
                <input className="ap-input" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="UPSC Results" onKeyDown={e => e.key === 'Enter' && handleAddCategory()} />
              </div>
              <div className="ap-form-group" style={{ margin: 0 }}>
                <label>Color</label>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                  {DEFAULT_COLORS.map(c => (
                    <div key={c} onClick={() => setNewCatColor(c)} style={{ width: 24, height: 24, background: c, cursor: 'pointer', border: newCatColor === c ? '3px solid var(--ink)' : '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }} />
                  ))}
                </div>
              </div>
              <button className="ap-btn ap-btn-primary" onClick={handleAddCategory} style={{ marginBottom: '0.1rem', whiteSpace: 'nowrap' }}>
                <i className="fa-solid fa-plus" /> Add
              </button>
            </div>
          </div>

          {categories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)', fontSize: '0.85rem' }}>No categories yet. Add your first category above.</div>
          ) : (
            <div className="ap-card" style={{ padding: '0.5rem' }}>
              {categories.map(cat => (
                <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.75rem', borderBottom: '1px solid var(--gray-100)' }}>
                  <div style={{ width: 14, height: 14, background: cat.color, flexShrink: 0, border: '1px solid rgba(0,0,0,0.1)' }} />
                  <span style={{ flex: 1, fontWeight: 600, fontSize: '0.88rem' }}>{cat.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontFamily: 'var(--font-mono)' }}>{images.filter(i => i.category === cat.slug).length} images</span>
                  <button className="ap-btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', background: 'none', border: '1px solid var(--gray-200)', color: 'var(--gray-400)', cursor: 'pointer' }}
                    onClick={() => handleDeleteCategory(cat.id)}>
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* UPLOAD TAB */}
      {activeTab === 'upload' && (
        <div>
          <div className="ap-card" style={{ padding: '1rem' }}>
            <div className="ap-form-group">
              <label>Category</label>
              <select className="ap-input" value={uploadCat} onChange={e => setUploadCat(e.target.value)} style={{ width: '100%' }}>
                <option value="">— Select Category —</option>
                {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div className="ap-form-group">
              <label>Caption (optional)</label>
              <input className="ap-input" value={uploadCaption} onChange={e => setUploadCaption(e.target.value)} placeholder="e.g. Rank 1 — Kavitha S., UPSC 2024" />
            </div>

            <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.5rem', color: 'var(--gray-600)' }}>📁 Upload from Device</div>
            <FileDropZone onUpload={handleFileUpload} uploading={uploading} progress={progress} />

            <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-300)' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
              <span style={{ fontSize: '0.75rem' }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
            </div>

            <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.5rem', color: 'var(--gray-600)' }}>🔗 Add by URL (Google Drive or web image)</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input className="ap-input" style={{ flex: 1 }} value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="https://drive.google.com/... or https://example.com/img.jpg" />
              <button className="ap-btn ap-btn-primary" onClick={handleUrlAdd} style={{ whiteSpace: 'nowrap' }}>
                <i className="fa-solid fa-plus" /> Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GALLERY TAB */}
      {activeTab === 'gallery' && (
        <div>
          {/* Category filter */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <button onClick={() => setSelectedCat('all')}
              style={{ padding: '0.35rem 0.8rem', borderRadius: 0, border: selectedCat === 'all' ? '2px solid var(--maroon)' : '1px solid var(--gray-200)', background: selectedCat === 'all' ? 'var(--maroon)' : 'var(--white)', color: selectedCat === 'all' ? 'var(--white)' : 'var(--gray-600)', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>
              All ({images.length})
            </button>
            {categories.map(cat => (
              <button key={cat.slug} onClick={() => setSelectedCat(cat.slug)}
                style={{ padding: '0.35rem 0.8rem', borderRadius: 0, border: selectedCat === cat.slug ? `2px solid ${cat.color}` : '1px solid var(--gray-200)', background: selectedCat === cat.slug ? cat.color : 'var(--white)', color: selectedCat === cat.slug ? 'var(--white)' : 'var(--gray-600)', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>
                {cat.name} ({images.filter(i => i.category === cat.slug).length})
              </button>
            ))}
          </div>

          {filteredImages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>
              No images in this category. Upload some images first.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
              {filteredImages.map(img => (
                <div key={img.id} style={{ position: 'relative', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
                  <img src={img.url} alt={img.caption || ''} style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display='none' }} />
                  {img.caption && <div style={{ padding: '0.3rem 0.4rem', fontSize: '0.7rem', color: 'var(--gray-500)', background: 'var(--white)', lineHeight: 1.4 }}>{img.caption}</div>}
                  <div style={{ position: 'absolute', top: '0.35rem', right: '0.35rem' }}>
                    <span style={{ background: categories.find(c => c.slug === img.category)?.color || 'var(--maroon)', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '2px 5px', letterSpacing: '0.06em' }}>
                      {categories.find(c => c.slug === img.category)?.name || img.category}
                    </span>
                  </div>
                  <button onClick={() => handleDeleteImage(img.id)}
                    style={{ position: 'absolute', bottom: '0.35rem', right: '0.35rem', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
