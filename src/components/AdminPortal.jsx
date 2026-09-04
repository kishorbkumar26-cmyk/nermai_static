import { useState, useEffect, useRef } from 'react'
import { fbFirestore } from '../firebase/firestore'
import { driveStorage } from '../services/driveStorage'
import { getGoogleDriveCDNUrl } from '../utils/imageOptimizer'
import HomeContentSection from './admin/HomeContentSection'
import FooterContentSection from './admin/FooterContentSection'
import AdminImageUpload from './admin/AdminImageUpload'
import ResourceManager from './admin/ResourceManager'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'

const richTextModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'clean']
  ],
}

function RichField({ label, value, onChange }) {
  return (
    <div className="ap-form-group">
      <label>{label}</label>
      <div style={{ background: 'white', color: 'black' }}>
        <ReactQuill 
          theme="snow" 
          value={value || ''} 
          onChange={onChange} 
          modules={richTextModules} 
          style={{ height: '200px', marginBottom: '45px' }}
        />
      </div>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([])
  const add = (msg, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }
  return { toasts, success: m => add(m, 'success'), error: m => add(m, 'error'), info: m => add(m, 'info') }
}

// ─── Image upload drop zone ───────────────────────────────────────────────────
function FileDropZone({ onUpload, uploading, progress }) {
  const [drag, setDrag] = useState(false)
  const inputRef = useRef(null)

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    await onUpload(file)
  }

  return (
    <div
      className={`ap-file-drop${drag ? ' drag-over' : ''}`}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
      onClick={() => inputRef.current?.click()}
    >
      <i className={`fa-solid ${uploading ? 'fa-spinner fa-spin' : 'fa-cloud-arrow-up'}`}></i>
      <p>{uploading ? `Uploading... ${progress}%` : 'Drag image here or Click to upload'}</p>
      <p style={{ fontSize: '0.7rem', marginTop: '0.5rem', color: 'var(--gray-400)' }}>PNG, JPG, WebP · max 10MB</p>
      <input ref={inputRef} type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} />
      {uploading && (
        <div className="ap-upload-progress">
          <div className="ap-upload-progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      )}
    </div>
  )
}

// ─── Section: Hero Slides (Dual Image: Desktop + Mobile) ─────────────────────
function HeroSection({ toast }) {
  const [slides, setSlides] = useState([])
  const [form, setForm] = useState({
    urlDesktop: '', urlMobile: '',
    ctaLink: '#', scene: 'none'
  })
  const [uploadingDesk, setUploadingDesk] = useState(false)
  const [progressDesk, setProgressDesk] = useState(0)
  const [uploadingMob, setUploadingMob] = useState(false)
  const [progressMob, setProgressMob] = useState(0)

  useEffect(() => {
    const unsub = fbFirestore.onHeroSlidesChanged(setSlides)
    return () => unsub()
  }, [])

  // Upload DESKTOP image (PC Banner · 1920 × 600 px)
  const handleUploadDesktop = async (file) => {
    setUploadingDesk(true); setProgressDesk(20)
    try {
      const result = await driveStorage.processAndUploadImage(file, {
        subFolderName: 'nermai-hero-desktop',
        maxWidth: 1920,
        quality: 0.88
      })
      setProgressDesk(90)
      setForm(f => ({ ...f, urlDesktop: result.url }))
      toast.success(`🖥️ Desktop image uploaded! (${result.storageType === 'google_drive' ? 'Google Drive' : 'Local'}, ${result.reductionPct}% smaller)`)
    } catch (e) {
      toast.error('Desktop upload failed: ' + e.message)
    } finally {
      setUploadingDesk(false); setProgressDesk(0)
    }
  }

  // Upload MOBILE image (Portrait Poster · 768 × 1024 px)
  const handleUploadMobile = async (file) => {
    setUploadingMob(true); setProgressMob(20)
    try {
      const result = await driveStorage.processAndUploadImage(file, {
        subFolderName: 'nermai-hero-mobile',
        maxWidth: 768,
        quality: 0.85
      })
      setProgressMob(90)
      setForm(f => ({ ...f, urlMobile: result.url }))
      toast.success(`📱 Mobile image uploaded! (${result.storageType === 'google_drive' ? 'Google Drive' : 'Local'}, ${result.reductionPct}% smaller)`)
    } catch (e) {
      toast.error('Mobile upload failed: ' + e.message)
    } finally {
      setUploadingMob(false); setProgressMob(0)
    }
  }

  const handleAdd = async () => {
    if (!form.urlDesktop && !form.urlMobile && !form.title) {
      toast.error('At least one image or title is required')
      return
    }
    try {
      await fbFirestore.addHeroSlide(form)
      setForm({ urlDesktop: '', urlMobile: '', ctaLink: '#', scene: 'none' })
      toast.success('Hero slide added successfully!')
    } catch (e) { toast.error('Error: ' + e.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this slide?')) return
    try { await fbFirestore.deleteHeroSlide(id); toast.success('Slide deleted successfully') }
    catch (e) { toast.error(e.message) }
  }

  const handleMoveSlide = async (id, direction) => {
    const currentIndex = slides.findIndex(s => s.id === id);
    if (currentIndex < 0) return;
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const currentSlide = slides[currentIndex];
    const targetSlide = slides[targetIndex];

    try {
      await Promise.all([
        fbFirestore.updateHeroSlide(currentSlide.id, { order: targetIndex }),
        fbFirestore.updateHeroSlide(targetSlide.id, { order: currentIndex })
      ]);
      toast.success('Slide order updated');
    } catch (e) {
      toast.error('Failed to reorder: ' + e.message);
    }
  }

  return (
    <div>
      <h2 className="ap-section-title"><i className="fa-solid fa-images"></i> Hero Slides</h2>

      <div className="ap-card">
        {/* Dimension guide */}
        <div className="ap-hero-dim-guide">
          <div className="ap-hero-dim-badge ap-hero-dim-badge--desk">
            <i className="fa-solid fa-desktop"></i>
            <div>
              <div className="ap-hero-dim-label">🖥️ PC / Desktop Banner</div>
              <div className="ap-hero-dim-size">Recommended: <strong>1920 × 600 px</strong></div>
              <div className="ap-hero-dim-hint">Wide landscape image • 16:5 ratio • JPG or PNG</div>
            </div>
          </div>
          <div className="ap-hero-dim-badge ap-hero-dim-badge--mob">
            <i className="fa-solid fa-mobile-screen-button"></i>
            <div>
              <div className="ap-hero-dim-label">📱 Mobile Poster</div>
              <div className="ap-hero-dim-size">Recommended: <strong>768 × 1024 px</strong></div>
              <div className="ap-hero-dim-hint">Portrait image • 3:4 ratio • JPG or PNG</div>
            </div>
          </div>
        </div>

        {/* TWO upload zones side by side */}
        <div className="ap-hero-upload-row">
          {/* Desktop upload */}
          <div className="ap-hero-upload-col">
            <AdminImageUpload
              label="Desktop Hero Image"
              value={form.urlDesktop}
              onChange={val => setForm(f => ({ ...f, urlDesktop: val }))}
              subFolderName="nermai-hero-desktop"
              maxWidth={1920}
              aspectRatio="16/5"
              hint="1920 × 600 px • Desktop Banner"
              placeholder="Paste Google Drive URL / ID or Image link for Desktop..."
              toast={toast}
            />
          </div>

          {/* Mobile upload */}
          <div className="ap-hero-upload-col">
            <AdminImageUpload
              label="Mobile Hero Poster"
              value={form.urlMobile}
              onChange={val => setForm(f => ({ ...f, urlMobile: val }))}
              subFolderName="nermai-hero-mobile"
              maxWidth={768}
              aspectRatio="3/4"
              hint="768 × 1024 px • Mobile Poster"
              placeholder="Paste Google Drive URL / ID or Image link for Mobile..."
              toast={toast}
            />
          </div>
        </div>

        {/* Slide metadata */}
        <div style={{ marginTop: '1.25rem' }}>
          <div className="ap-form-row">
            <div className="ap-form-group">
              <label>Destination Link (If user clicks banner)</label>
              <input className="ap-input" placeholder="/courses or https://..." value={form.ctaLink} onChange={e => setForm(f => ({ ...f, ctaLink: e.target.value }))} />
            </div>
            <div className="ap-form-group">
              <label>3D Enhancement Layer</label>
              <select className="ap-input" value={form.scene} onChange={e => setForm(f => ({ ...f, scene: e.target.value }))}>
                <option value="none">None (Pure Image)</option>
                <option value="admissions">Admissions Depth Layer</option>
                <option value="results">Results Depth Layer</option>
              </select>
            </div>
          </div>
          <button className="ap-btn ap-btn-primary" onClick={handleAdd}>
            <i className="fa-solid fa-plus"></i> Add Banner to Carousel
          </button>
        </div>
      </div>

      {/* Current slides list */}
      <div className="ap-card">
        <div style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--ink)' }}>
          Current Slides ({slides.length})
        </div>
        {slides.length === 0 ? (
          <div className="ap-empty"><i className="fa-solid fa-image"></i><p>No slides found — Add a new slide above</p></div>
        ) : (
          <div className="ap-items-list">
            {slides.map((slide, i) => {
              const deskUrl = driveStorage.formatImageUrl(slide.urlDesktop || slide.url)
              const mobUrl  = driveStorage.formatImageUrl(slide.urlMobile)
              return (
                <div key={slide.id} className="ap-item">
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {deskUrl && (
                      <img src={deskUrl} alt="desktop" className="ap-item-thumb" style={{ aspectRatio: '16/5' }}
                        onError={e => { e.target.style.display = 'none' }} />
                    )}
                    {mobUrl && (
                      <img src={mobUrl} alt="mobile" className="ap-item-thumb" style={{ aspectRatio: '3/4', width: '40px' }}
                        onError={e => { e.target.style.display = 'none' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="ap-item-title">Banner {slide.id.substring(0, 5)}</div>
                    <div className="ap-item-sub">
                      3D Layer: {slide.scene || 'none'}
                      {slide.ctaLink && ` | Link: ${slide.ctaLink}`}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--gray-400)', marginTop: '2px' }}>
                      {deskUrl ? '🖥️ Desktop ✓' : '🖥️ No desktop'}&nbsp;&nbsp;
                      {mobUrl  ? '📱 Mobile ✓'  : '📱 No mobile'}
                    </div>
                  </div>
                  <div className="ap-item-actions" style={{ display: 'flex', gap: '0.25rem', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button className="ap-btn ap-btn-sm" onClick={() => handleMoveSlide(slide.id, -1)} disabled={i === 0} title="Move Up">
                        <i className="fa-solid fa-arrow-up"></i>
                      </button>
                      <button className="ap-btn ap-btn-sm" onClick={() => handleMoveSlide(slide.id, 1)} disabled={i === slides.length - 1} title="Move Down">
                        <i className="fa-solid fa-arrow-down"></i>
                      </button>
                    </div>
                    <button className="ap-btn ap-btn-danger ap-btn-sm" onClick={() => handleDelete(slide.id)}>
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Section: Notices ─────────────────────────────────────────────────────────
function NoticesSection({ toast }) {
  const [notices, setNotices] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '', content: '', priority: 'normal', date: new Date().toISOString().split('T')[0] })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsub = fbFirestore.onNoticesChanged(setNotices)
    return () => unsub()
  }, [])

  const handleStartEdit = (n) => {
    setEditingId(n.id)
    setForm({
      title: n.title || '',
      content: n.content || '',
      priority: n.priority || 'normal',
      date: n.date || new Date().toISOString().split('T')[0]
    })
    toast.info(`Editing notice: "${n.title || ''}"`)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm({ title: '', content: '', priority: 'normal', date: new Date().toISOString().split('T')[0] })
  }

  const handleSaveOrAdd = async () => {
    if (!form.title.trim()) { toast.error('Title required'); return }
    setSaving(true)
    try {
      if (editingId) {
        await fbFirestore.updateNotice(editingId, form)
        toast.success('Notice updated successfully!')
        handleCancelEdit()
      } else {
        await fbFirestore.addNotice(form)
        toast.success('Notice added successfully!')
        setForm({ title: '', content: '', priority: 'normal', date: new Date().toISOString().split('T')[0] })
      }
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this notice?')) return
    try {
      await fbFirestore.deleteNotice(id)
      if (editingId === id) handleCancelEdit()
      toast.success('Deleted successfully')
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div>
      <h2 className="ap-section-title"><i className="fa-solid fa-bell"></i> Notices</h2>

      <div className="ap-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: editingId ? 'var(--saffron)' : 'var(--ink)' }}>
            {editingId ? `✏️ Editing Notice: ${form.title}` : '➕ Add New Notice'}
          </div>
          {editingId && (
            <button className="ap-btn ap-btn-ghost ap-btn-sm" onClick={handleCancelEdit}>
              <i className="fa-solid fa-xmark"></i> Cancel Edit
            </button>
          )}
        </div>

        <div className="ap-form-group">
          <label>Title *</label>
          <input className="ap-input" placeholder="TNPSC Group IV Exam 2024" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        </div>
        <RichField label="Detailed Content (Supports bullets, bold, tables, etc.)" value={form.content} onChange={v => setForm(f => ({ ...f, content: v }))} />
        <div className="ap-form-row" style={{ marginTop: '0.75rem' }}>
          <div className="ap-form-group">
            <label>Priority</label>
            <select className="ap-input ap-select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              <option value="normal">Normal</option>
              <option value="high">High Priority</option>
            </select>
          </div>
          <div className="ap-form-group">
            <label>Date</label>
            <input type="date" className="ap-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="ap-btn ap-btn-primary" onClick={handleSaveOrAdd} disabled={saving}>
            {saving ? (
              <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</>
            ) : editingId ? (
              <><i className="fa-solid fa-floppy-disk"></i> Update Notice</>
            ) : (
              <><i className="fa-solid fa-plus"></i> Add Notice</>
            )}
          </button>
          {editingId && (
            <button className="ap-btn ap-btn-ghost" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="ap-card">
        <div style={{ fontWeight: 700, marginBottom: '1rem' }}>Current Notices ({notices.length})</div>
        {notices.length === 0 ? (
          <div className="ap-empty"><i className="fa-solid fa-bell-slash"></i><p>No Notices</p></div>
        ) : (
          <div className="ap-items-list">
            {notices.map(n => (
              <div key={n.id} className="ap-item">
                <div style={{ flex: 1 }}>
                  <div className="ap-item-title">{n.title}</div>
                  <div className="ap-item-sub">{n.date} · <span className={n.priority === 'high' ? 'ap-badge-high' : 'ap-badge-normal'}>{n.priority}</span></div>
                </div>
                <div className="ap-item-actions" style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="ap-btn" style={{ background: '#3b82f6', color: 'white', padding: '0.4rem 0.6rem' }} onClick={() => handleStartEdit(n)} title="Edit Notice">
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button className="ap-btn ap-btn-danger" style={{ padding: '0.4rem 0.6rem' }} onClick={() => handleDelete(n.id)} title="Delete Notice">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Section: Toppers ─────────────────────────────────────────────────────────
function ToppersSection({ toast }) {
  const [toppers, setToppers] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', rank: '', exam: 'TNPSC Group II', customExam: '', year: new Date().getFullYear().toString(), photo: '', quote: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsub = fbFirestore.onToppersChanged(setToppers)
    return () => unsub()
  }, [])

  const handleStartEdit = (t) => {
    setEditingId(t.id)
    const presetExams = ['TNPSC Group I', 'TNPSC Group II', 'TNPSC Group IV', 'UPSC CSE', 'TN Police SI', 'TN Police Constable', 'IBPS PO', 'SBI PO']
    const isPreset = presetExams.includes(t.exam)
    setForm({
      name: t.name || '',
      rank: t.rank || '',
      exam: isPreset ? t.exam : 'Others',
      customExam: isPreset ? '' : t.exam || '',
      year: t.year || new Date().getFullYear().toString(),
      photo: t.photo || '',
      quote: t.quote || ''
    })
    toast.info(`Editing details for ${t.name || 'topper'}. Modify fields and click "Update Topper".`)
    // Scroll smoothly to form
    const formEl = document.querySelector('.ap-topper-form-card')
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm({ name: '', rank: '', exam: 'TNPSC Group II', customExam: '', year: new Date().getFullYear().toString(), photo: '', quote: '' })
  }

  const handleSaveOrAdd = async () => {
    if (!form.name.trim() || !form.rank.toString().trim()) {
      toast.error('Name and rank required')
      return
    }
    
    let finalExam = form.exam
    if (form.exam === 'Others') {
      if (!form.customExam || !form.customExam.trim()) {
        toast.error('Please specify the exam manually')
        return
      }
      finalExam = form.customExam.trim()
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        rank: form.rank.toString().trim(),
        exam: finalExam,
        year: form.year.toString().trim(),
        photo: form.photo || '',
        quote: form.quote || ''
      }

      if (editingId) {
        await fbFirestore.updateTopper(editingId, payload)
        toast.success(`Topper "${payload.name}" updated successfully!`)
        handleCancelEdit()
      } else {
        await fbFirestore.addTopper(payload)
        toast.success(`Topper "${payload.name}" added successfully!`)
        setForm({ name: '', rank: '', exam: 'TNPSC Group II', customExam: '', year: new Date().getFullYear().toString(), photo: '', quote: '' })
      }
    } catch (e) {
      toast.error('Operation failed: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this topper?')) return
    try {
      await fbFirestore.deleteTopper(id)
      if (editingId === id) handleCancelEdit()
      toast.success('Topper deleted successfully')
    } catch (e) {
      toast.error(e.message)
    }
  }

  const handleToggleVisibility = async (t) => {
    try { 
      const newVisible = t.visible === false ? true : false
      await fbFirestore.updateTopper(t.id, { visible: newVisible })
      toast.success(newVisible ? 'Topper made visible' : 'Topper hidden')
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div>
      <h2 className="ap-section-title">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
        Toppers
      </h2>

      {/* Photo Dimension Guide */}
      <div className="ap-hero-dim-guide" style={{ marginBottom: '1.25rem' }}>
        <div className="ap-hero-dim-badge ap-hero-dim-badge--mob" style={{ width: '100%', background: 'rgba(230, 92, 0, 0.06)', border: '1px solid rgba(230, 92, 0, 0.2)' }}>
          <i className="fa-solid fa-ruler-combined" style={{ color: 'var(--saffron)' }}></i>
          <div>
            <div className="ap-hero-dim-label">📸 Recommended Topper Photo Dimensions</div>
            <div className="ap-hero-dim-size">Square 1:1 Aspect Ratio • Recommended: <strong>600 × 600 px</strong> or <strong>800 × 800 px</strong></div>
            <div className="ap-hero-dim-hint">Passport style or square portrait • JPG, PNG, WebP • Center-aligned face for circular avatar and 3D card display</div>
          </div>
        </div>
      </div>

      <div className="ap-card ap-topper-form-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: editingId ? 'var(--saffron)' : 'var(--ink)' }}>
            {editingId ? `✏️ Editing Topper: ${form.name || 'Student'}` : '➕ Add New Topper'}
          </div>
          {editingId && (
            <button className="ap-btn ap-btn-ghost ap-btn-sm" onClick={handleCancelEdit}>
              <i className="fa-solid fa-xmark"></i> Cancel Edit
            </button>
          )}
        </div>

        <div className="ap-form-row">
          <div className="ap-form-group">
            <label>Name *</label>
            <input className="ap-input" placeholder="Kavitha S." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="ap-form-group">
            <label>Rank *</label>
            <input className="ap-input" placeholder="1" value={form.rank} onChange={e => setForm(f => ({ ...f, rank: e.target.value }))} />
          </div>
        </div>
        <div className="ap-form-row">
          <div className="ap-form-group">
            <label>Exam</label>
            <select className="ap-input ap-select" value={form.exam} onChange={e => setForm(f => ({ ...f, exam: e.target.value }))}>
              {['TNPSC Group I', 'TNPSC Group II', 'TNPSC Group IV', 'UPSC CSE', 'TN Police SI', 'TN Police Constable', 'IBPS PO', 'SBI PO', 'Others'].map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
            {form.exam === 'Others' && (
              <input 
                className="ap-input" 
                style={{ marginTop: '0.5rem' }} 
                placeholder="Specify exam manually..." 
                value={form.customExam || ''} 
                onChange={e => setForm(f => ({ ...f, customExam: e.target.value }))} 
              />
            )}
          </div>
          <div className="ap-form-group">
            <label>Year</label>
            <input className="ap-input" placeholder="2024" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} />
          </div>
        </div>
        <AdminImageUpload
          label="Topper Photo"
          value={form.photo}
          onChange={val => setForm(f => ({ ...f, photo: val }))}
          subFolderName="nermai-toppers"
          maxWidth={800}
          aspectRatio="1/1"
          hint="Square 1:1 • 600 × 600 px"
          placeholder="Paste Google Drive URL / ID or Web photo link..."
          toast={toast}
        />
        <div className="ap-form-group">
          <label>Quote</label>
          <textarea className="ap-input ap-textarea" placeholder="Guided by Nermai..." value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="ap-btn ap-btn-primary" onClick={handleSaveOrAdd} disabled={saving}>
            {saving ? (
              <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</>
            ) : editingId ? (
              <><i className="fa-solid fa-floppy-disk" style={{ marginRight: '6px' }}></i> Update Topper</>
            ) : (
              <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M5 12h14"/><path d="M12 5v14"/></svg> Add Topper</>
            )}
          </button>
          {editingId && (
            <button className="ap-btn ap-btn-ghost" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="ap-card">
        <div style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Toppers ({toppers.length})</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 400 }}>Click edit (✏️) to fetch and update any topper</span>
        </div>
        {toppers.length === 0 ? (
          <div className="ap-empty">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            <p style={{ marginTop: '0.5rem' }}>No Toppers</p>
          </div>
        ) : (
          <div className="ap-items-list">
            {toppers.map(t => {
              const photoUrl = driveStorage.formatImageUrl(t.photo)
              const isHidden = t.visible === false
              const isBeingEdited = editingId === t.id
              return (
                <div key={t.id} className="ap-item" style={{ opacity: isHidden ? 0.6 : 1, border: isBeingEdited ? '2px solid var(--saffron)' : '1px solid var(--gray-100)', background: isBeingEdited ? 'rgba(212, 175, 55, 0.06)' : undefined }}>
                  {photoUrl ? (
                    <img src={photoUrl} alt={t.name} className="ap-item-thumb" style={{ borderRadius: '50%', width: 44, height: 44 }} onError={e => { e.target.style.display = 'none' }} />
                  ) : (
                    <div className="ap-item-thumb" style={{ width: 44, height: 44, background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'var(--gray-400)' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div className="ap-item-title">
                      {t.name} — Rank {t.rank}
                      {isHidden && <span style={{ fontSize: '0.7rem', background: 'var(--gray-200)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', color: 'var(--gray-600)' }}>Hidden</span>}
                      {isBeingEdited && <span style={{ fontSize: '0.7rem', background: 'var(--saffron)', color: 'white', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>Editing</span>}
                    </div>
                    <div className="ap-item-sub">{t.exam} · {t.year}</div>
                  </div>
                  <div className="ap-item-actions" style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      className="ap-btn"
                      style={{ background: '#3b82f6', color: 'white', padding: '0.4rem 0.6rem' }}
                      onClick={() => handleStartEdit(t)}
                      title="Edit Topper Details (Fetch data to form)"
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button
                      className="ap-btn"
                      style={{ background: isHidden ? 'var(--gray-200)' : '#10b981', color: isHidden ? 'var(--gray-600)' : 'white', padding: '0.4rem 0.6rem' }}
                      onClick={() => handleToggleVisibility(t)}
                      title={isHidden ? 'Show on Site' : 'Hide from Site'}
                    >
                      {isHidden ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                    <button
                      className="ap-btn ap-btn-danger"
                      style={{ padding: '0.4rem 0.6rem' }}
                      onClick={() => handleDelete(t.id)}
                      title="Delete Topper"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Section: Testimonials ────────────────────────────────────────────────────
function TestimonialsSection({ toast }) {
  const [items, setItems] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', role: '', quote: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsub = fbFirestore.onTestimonialsChanged(setItems)
    return () => unsub()
  }, [])

  const handleStartEdit = (t) => {
    setEditingId(t.id)
    setForm({
      name: t.name || '',
      role: t.role || '',
      quote: t.quote || ''
    })
    toast.info(`Editing review for ${t.name || 'student'}`)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm({ name: '', role: '', quote: '' })
  }

  const handleSaveOrAdd = async () => {
    if (!form.name.trim() || !form.quote.trim()) { toast.error('Name and quote required'); return }
    setSaving(true)
    try {
      if (editingId) {
        await fbFirestore.updateTestimonial(editingId, form)
        toast.success('Testimonial updated successfully!')
        handleCancelEdit()
      } else {
        await fbFirestore.addTestimonial(form)
        toast.success('Testimonial added successfully!')
        setForm({ name: '', role: '', quote: '' })
      }
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return
    try {
      await fbFirestore.deleteTestimonial(id)
      if (editingId === id) handleCancelEdit()
      toast.success('Deleted successfully')
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div>
      <h2 className="ap-section-title"><i className="fa-solid fa-quote-right"></i> Testimonials</h2>

      <div className="ap-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: editingId ? 'var(--saffron)' : 'var(--ink)' }}>
            {editingId ? `✏️ Editing Testimonial: ${form.name}` : '➕ Add New Testimonial'}
          </div>
          {editingId && (
            <button className="ap-btn ap-btn-ghost ap-btn-sm" onClick={handleCancelEdit}>
              <i className="fa-solid fa-xmark"></i> Cancel Edit
            </button>
          )}
        </div>

        <div className="ap-form-group">
          <label>Student Name *</label>
          <input className="ap-input" placeholder="Anitha Devi" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="ap-form-group">
          <label>Role / Exam</label>
          <input className="ap-input" placeholder="TNPSC Group IV Aspirant" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
        </div>
        <div className="ap-form-group">
          <label>Quote *</label>
          <textarea className="ap-input ap-textarea" placeholder="Studying at Nermai..." value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="ap-btn ap-btn-primary" onClick={handleSaveOrAdd} disabled={saving}>
            {saving ? (
              <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</>
            ) : editingId ? (
              <><i className="fa-solid fa-floppy-disk"></i> Update Testimonial</>
            ) : (
              <><i className="fa-solid fa-plus"></i> Add Testimonial</>
            )}
          </button>
          {editingId && (
            <button className="ap-btn ap-btn-ghost" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="ap-card">
        <div style={{ fontWeight: 700, marginBottom: '1rem' }}>Testimonials ({items.length})</div>
        {items.length === 0 ? (
          <div className="ap-empty"><i className="fa-solid fa-comments"></i><p>No Testimonials</p></div>
        ) : (
          <div className="ap-items-list">
            {items.map(t => (
              <div key={t.id} className="ap-item">
                <div style={{ flex: 1 }}>
                  <div className="ap-item-title">{t.name}</div>
                  <div className="ap-item-sub">{t.role}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginTop: '0.25rem', fontStyle: 'italic' }}>"{t.quote?.slice(0, 80)}{t.quote?.length > 80 ? '...' : ''}"</div>
                </div>
                <div className="ap-item-actions" style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="ap-btn" style={{ background: '#3b82f6', color: 'white', padding: '0.4rem 0.6rem' }} onClick={() => handleStartEdit(t)} title="Edit Testimonial">
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button className="ap-btn ap-btn-danger" style={{ padding: '0.4rem 0.6rem' }} onClick={() => handleDelete(t.id)} title="Delete Testimonial">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Section: Gallery ─────────────────────────────────────────────────────────
function GallerySection({ toast }) {
  const [images, setImages] = useState([])
  const [form, setForm] = useState({ url: '', caption: '' })
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const unsub = fbFirestore.onGalleryChanged(setImages)
    return () => unsub()
  }, [])

  const handleUpload = async (file) => {
    setUploading(true); setProgress(20)
    try {
      const result = await driveStorage.processAndUploadImage(file, { subFolderName: 'nermai-gallery' })
      setProgress(90)
      setForm(f => ({ ...f, url: result.url }))
      toast.success('Gallery photo uploaded!')
    } catch (e) { toast.error(e.message) }
    finally { setUploading(false); setProgress(0) }
  }

  const handleAdd = async () => {
    if (!form.url) { toast.error('Image URL is required'); return }
    try {
      await fbFirestore.addGalleryImage(form)
      setForm({ url: '', caption: '' })
      toast.success('Image added successfully!')
    } catch (e) { toast.error(e.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this image?')) return
    try { await fbFirestore.deleteGalleryImage(id); toast.success('Deleted successfully') }
    catch (e) { toast.error(e.message) }
  }

  return (
    <div>
      <h2 className="ap-section-title"><i className="fa-solid fa-images"></i> Gallery</h2>
      
      {/* Dimension guide */}
      <div className="ap-hero-dim-guide" style={{ marginBottom: '1.25rem' }}>
        <div className="ap-hero-dim-badge ap-hero-dim-badge--desk" style={{ width: '100%', background: 'rgba(123,27,46,0.06)', border: '1px solid rgba(123,27,46,0.2)' }}>
          <i className="fa-solid fa-ruler-combined" style={{ color: 'var(--maroon)' }}></i>
          <div>
            <div className="ap-hero-dim-label">📸 Recommended Gallery Photo Dimensions</div>
            <div className="ap-hero-dim-size">Landscape 4:3 or 16:9 Aspect Ratio • Recommended: <strong>1200 × 800 px</strong> (min 800 × 600 px)</div>
            <div className="ap-hero-dim-hint">Event, classroom, campus, or felicitation photos • JPG, PNG, WebP format</div>
          </div>
        </div>
      </div>

      <div className="ap-card">
        <AdminImageUpload
          label="Gallery Photo"
          value={form.url}
          onChange={val => setForm(f => ({ ...f, url: val }))}
          subFolderName="nermai-gallery"
          maxWidth={1600}
          aspectRatio="cover"
          hint="1200 × 800 px • Landscape"
          placeholder="Paste Google Drive share link, Drive ID or image URL..."
          toast={toast}
        />
        <div className="ap-form-group">
          <label>Caption (Optional)</label>
          <input className="ap-input" placeholder="Student Felicitation 2024" value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} />
        </div>
        <button className="ap-btn ap-btn-primary" onClick={handleAdd}>
          <i className="fa-solid fa-plus"></i> Add to Gallery
        </button>
      </div>

      <div className="ap-card">
        <div style={{ fontWeight: 700, marginBottom: '1rem' }}>Photos ({images.length})</div>
        {images.length === 0 ? (
          <div className="ap-empty"><i className="fa-solid fa-image"></i><p>No images</p></div>
        ) : (
          <div className="ap-items-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
            {images.map(img => {
              const url = driveStorage.formatImageUrl(img.url)
              return (
                <div key={img.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--gray-200)', aspectRatio: '1/1' }}>
                  <img src={url} alt={img.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    className="ap-btn ap-btn-danger ap-btn-sm" 
                    onClick={() => handleDelete(img.id)}
                    style={{ position: 'absolute', top: 4, right: 4, padding: '4px 8px' }}
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                  {img.caption && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '0.7rem', padding: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {img.caption}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Section: Drive Config ────────────────────────────────────────────────────
function DriveSection({ toast }) {
  const [config, setConfig] = useState(driveStorage.getConfig())
  const [pastedUrl, setPastedUrl] = useState('')
  const [convertedUrl, setConvertedUrl] = useState('')
  const [passcode, setPasscode] = useState('')

  const [isTesting, setIsTesting] = useState(false)

  const handleSaveDrive = async () => {
    driveStorage.saveConfig(config)
    toast.success('Drive config saved!')
  }

  const handleTestConnection = async () => {
    if (!config.appsScriptUrl) {
      toast.error('Please enter the Apps Script URL first.')
      return
    }
    setIsTesting(true)
    try {
      const res = await fetch(config.appsScriptUrl, {
        method: 'POST',
        body: JSON.stringify({ test: true, folderId: config.folderId })
      })
      const data = await res.json()
      if (data.status === 'success') {
        toast.success(data.message || 'Connection successful!')
      } else {
        toast.error(data.message || 'Connection failed.')
      }
    } catch (e) {
      toast.error('Failed to connect: ' + e.message)
    } finally {
      setIsTesting(false)
    }
  }

  const handleSavePasscode = async () => {
    if (!passcode || passcode.length < 4) { toast.error('Minimum 4 characters required'); return }
    try {
      await fbFirestore.updateSettings({ passcode })
      setPasscode('')
      toast.success('Passcode changed!')
    } catch (e) { toast.error(e.message) }
  }

  return (
    <div>
      <h2 className="ap-section-title"><i className="fa-brands fa-google-drive"></i> Drive & Settings</h2>

      {/* Drive Config */}
      <div className="ap-card">
        <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '1rem' }}>
          <i className="fa-brands fa-google-drive" style={{ color: '#4285F4', marginRight: '8px' }}></i>
          Google Drive Configuration
        </div>
        <div className="ap-form-group">
          <label>Apps Script Web App URL</label>
          <input className="ap-input" placeholder="https://script.google.com/macros/s/..." value={config.appsScriptUrl} onChange={e => setConfig(c => ({ ...c, appsScriptUrl: e.target.value }))} />
          <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginTop: '4px' }}>
            Google Apps Script → Deploy as web app → Paste URL here
          </div>
        </div>
        <div className="ap-form-row">
          <div className="ap-form-group">
            <label>Drive Folder ID</label>
            <input className="ap-input" placeholder="1ABC...xyz" value={config.folderId} onChange={e => setConfig(c => ({ ...c, folderId: e.target.value }))} />
          </div>
          <div className="ap-form-group">
            <label>OAuth Access Token (optional)</label>
            <input type="password" className="ap-input" placeholder="ya29...." value={config.accessToken} onChange={e => setConfig(c => ({ ...c, accessToken: e.target.value }))} />
          </div>
        </div>
        <div
          className={`ap-drive-status ${config.appsScriptUrl ? 'ap-drive-ok' : 'ap-drive-warn'}`}
        >
          <i className={`fa-solid ${config.appsScriptUrl ? 'fa-circle-check' : 'fa-triangle-exclamation'}`}></i>
          {config.appsScriptUrl ? 'Apps Script configured — uploads go to Google Drive' : 'No Apps Script URL — uploads stored as base64 in Firestore'}
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button className="ap-btn ap-btn-primary" onClick={handleSaveDrive}>
            <i className="fa-solid fa-floppy-disk"></i> Save Drive Config
          </button>
          <button className="ap-btn ap-btn-outline" onClick={handleTestConnection} disabled={isTesting}>
            <i className={`fa-solid ${isTesting ? 'fa-spinner fa-spin' : 'fa-network-wired'}`}></i> 
            {isTesting ? ' Testing...' : ' Test Connection'}
          </button>
        </div>
      </div>

      {/* Drive URL Converter */}
      <div className="ap-card">
        <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '0.5rem' }}>Drive URL → CDN Converter</div>
        <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
          Convert any Google Drive share link to a fast CDN URL.
        </p>
        <input
          className="ap-input"
          placeholder="https://drive.google.com/file/d/1qsiYJd.../view"
          value={pastedUrl}
          onChange={e => {
            setPastedUrl(e.target.value)
            const cdn = getGoogleDriveCDNUrl(e.target.value)
            setConvertedUrl(cdn !== e.target.value ? cdn : '')
          }}
        />
        {convertedUrl && (
          <div>
            <div className="ap-url-converter-result">{convertedUrl}</div>
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <img src={convertedUrl} alt="CDN Preview" style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--gray-200)' }} onError={e => { e.target.style.display = 'none' }} />
              <button className="ap-btn ap-btn-ghost" onClick={() => { navigator.clipboard?.writeText(convertedUrl); toast.success('Copied!') }}>
                <i className="fa-solid fa-copy"></i> Copy CDN URL
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Change Passcode */}
      <div className="ap-card">
        <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '1rem' }}>
          <i className="fa-solid fa-lock" style={{ marginRight: '8px' }}></i>
          Change Admin Passcode
        </div>
        <div className="ap-form-group">
          <label>New Passcode</label>
          <input type="password" className="ap-input" placeholder="New passcode..." value={passcode} onChange={e => setPasscode(e.target.value)} style={{ letterSpacing: '0.2em' }} />
        </div>
        <button className="ap-btn ap-btn-primary" onClick={handleSavePasscode}>
          <i className="fa-solid fa-key"></i> Change Passcode
        </button>
      </div>
    </div>
  )
}

// ─── Site Info Section ────────────────────────────────────────────────────────
function SiteInfoSection({ toast }) {
  const [info, setInfo] = useState({
    phone: '', email: '', address: '', whatsapp: '',
    instagram: '', facebook: '', youtube: '', telegram: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s.siteInfo) setInfo(si => ({ ...si, ...s.siteInfo }))
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    try {
      await fbFirestore.updateSettings({ siteInfo: info })
      toast.success('Site info saved!')
    } catch (e) { toast.error(e.message) }
  }

  if (loading) return <div style={{ padding: '2rem', color: 'var(--gray-400)' }}>Loading...</div>

  return (
    <div>
      <h2 className="ap-section-title"><i className="fa-solid fa-circle-info"></i> Site Information</h2>
      <div className="ap-card">
        <div className="ap-form-row">
          <div className="ap-form-group">
            <label>Phone</label>
            <input className="ap-input" placeholder="+91 98765 43210" value={info.phone} onChange={e => setInfo(i => ({ ...i, phone: e.target.value }))} />
          </div>
          <div className="ap-form-group">
            <label>Email</label>
            <input className="ap-input" placeholder="info@nermai.in" value={info.email} onChange={e => setInfo(i => ({ ...i, email: e.target.value }))} />
          </div>
        </div>
        <div className="ap-form-group">
          <label>Address (Tamil)</label>
          <textarea className="ap-input ap-textarea" value={info.address} onChange={e => setInfo(i => ({ ...i, address: e.target.value }))} />
        </div>
        <div className="ap-form-row">
          <div className="ap-form-group">
            <label>WhatsApp Number (with country code, no +)</label>
            <input className="ap-input" placeholder="919876543210" value={info.whatsapp} onChange={e => setInfo(i => ({ ...i, whatsapp: e.target.value }))} />
          </div>
          <div className="ap-form-group">
            <label>Facebook URL</label>
            <input className="ap-input" placeholder="https://facebook.com/..." value={info.facebook} onChange={e => setInfo(i => ({ ...i, facebook: e.target.value }))} />
          </div>
        </div>
        <div className="ap-form-row">
          <div className="ap-form-group">
            <label>YouTube URL</label>
            <input className="ap-input" placeholder="https://youtube.com/..." value={info.youtube} onChange={e => setInfo(i => ({ ...i, youtube: e.target.value }))} />
          </div>
          <div className="ap-form-group">
            <label>Telegram URL</label>
            <input className="ap-input" placeholder="https://t.me/..." value={info.telegram} onChange={e => setInfo(i => ({ ...i, telegram: e.target.value }))} />
          </div>
        </div>
        <div className="ap-form-group">
          <label>Instagram URL</label>
          <input className="ap-input" placeholder="https://instagram.com/..." value={info.instagram} onChange={e => setInfo(i => ({ ...i, instagram: e.target.value }))} />
        </div>
        <button className="ap-btn ap-btn-primary" onClick={handleSave}>
          <i className="fa-solid fa-floppy-disk"></i> Save
        </button>
      </div>
    </div>
  )
}

// ─── Main Admin Portal (floating button — hidden on /admin pages) ─────────────
const SECTIONS = [
  { id: 'homecontent',   label: 'Home Content', icon: 'fa-house' },
  { id: 'hero',          label: 'Hero Slides',  icon: 'fa-images' },
  { id: 'notices',       label: 'Notices',      icon: 'fa-bell' },
  { id: 'resources',     label: 'Resources',    icon: 'fa-book-open' },
  { id: 'toppers',       label: 'Toppers',      icon: 'fa-trophy' },
  { id: 'testimonials',  label: 'Reviews',      icon: 'fa-quote-right' },
  { id: 'gallery',       label: 'Gallery',      icon: 'fa-images' },
  { id: 'siteinfo',      label: 'Site Info',    icon: 'fa-circle-info' },
  { id: 'footer',        label: 'Footer',       icon: 'fa-shoe-prints' },
  { id: 'drive',         label: 'Drive',        icon: 'fa-brands fa-google-drive' }
]

// ─── Named export for AdminDashboard (reuses all section editors) ─────────────
export function AdminPanelContent({ activeSection, toast }) {
  return (
    <>
      {activeSection === 'homecontent'  && <HomeContentSection toast={toast} />}
      {activeSection === 'hero'         && <HeroSection toast={toast} />}
      {activeSection === 'notices'      && <NoticesSection toast={toast} />}
      {activeSection === 'resources'    && <ResourceManager toast={toast} />}
      {activeSection === 'toppers'      && <ToppersSection toast={toast} />}
      {activeSection === 'testimonials' && <TestimonialsSection toast={toast} />}
      {activeSection === 'gallery'      && <GallerySection toast={toast} />}
      {activeSection === 'siteinfo'     && <SiteInfoSection toast={toast} />}
      {activeSection === 'footer'       && <FooterContentSection toast={toast} />}
      {activeSection === 'drive'        && <DriveSection toast={toast} />}
    </>
  )
}

export default function AdminPortal() {
  const [showPasscode, setShowPasscode] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [passcode, setPasscode] = useState('')
  const [passcodeError, setPasscodeError] = useState('')
  const [checking, setChecking] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const { toasts, success, error, info } = useToast()
  const toast = { success, error, info }

  // Check session
  useEffect(() => {
    const stored = sessionStorage.getItem('nermai_admin')
    if (stored === '1') setAuthenticated(true)
  }, [])

  const handlePasscodeSubmit = async () => {
    if (!passcode) return
    setChecking(true)
    try {
      const ok = await fbFirestore.verifyPasscode(passcode)
      if (ok) {
        sessionStorage.setItem('nermai_admin', '1')
        setAuthenticated(true)
        setShowPasscode(false)
        setShowPanel(true)
        setPasscode('')
        setPasscodeError('')
      } else {
        setPasscodeError('Incorrect passcode. Please try again.')
      }
    } catch (e) {
      setPasscodeError('Error: ' + e.message)
    } finally {
      setChecking(false)
    }
  }

  const handleAdminBtnClick = () => {
    if (authenticated) { setShowPanel(true) }
    else { setShowPasscode(true) }
  }

  // Don't show floating button on admin pages
  const isAdminPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')
  if (isAdminPage) return null

  const handleLogout = () => {
    sessionStorage.removeItem('nermai_admin')
    setAuthenticated(false)
    setShowPanel(false)
  }

  return (
    <>
      {/* Corner Admin Button — subtle, doesn't interfere with site */}
      <button
        className="admin-corner-btn"
        onClick={handleAdminBtnClick}
        title="Admin Portal"
        aria-label="Open Admin Portal"
      >
        <i className="fa-solid fa-lock"></i>
      </button>

      {/* Passcode Modal */}
      {showPasscode && (
        <div className="passcode-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowPasscode(false); setPasscode(''); setPasscodeError('') } }}>
          <div className="passcode-modal" role="dialog" aria-modal="true" aria-label="Admin Login">
            <div className="passcode-modal-icon">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h2 className="passcode-modal-title">Nermai Admin</h2>
            <p className="passcode-modal-sub">Enter Admin passcode</p>
            <input
              type="password"
              className={`passcode-input${passcodeError ? ' error' : ''}`}
              placeholder="••••••••"
              value={passcode}
              onChange={e => { setPasscode(e.target.value); setPasscodeError('') }}
              onKeyDown={e => e.key === 'Enter' && handlePasscodeSubmit()}
              autoFocus
            />
            {passcodeError && <div className="passcode-error">{passcodeError}</div>}
            <div className="passcode-actions">
              <button
                className="btn btn-outline"
                onClick={() => { setShowPasscode(false); setPasscode(''); setPasscodeError('') }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handlePasscodeSubmit}
                disabled={checking || !passcode}
              >
                {checking ? <><i className="fa-solid fa-spinner fa-spin"></i> Verifying...</> : <>Login <i className="fa-solid fa-arrow-right"></i></>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {showPanel && (
        <div className="admin-panel-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowPanel(false) }}>
          <div className="admin-panel" role="dialog" aria-modal="true" aria-label="Admin Panel">
            {/* Header */}
            <div className="ap-header">
              <div className="ap-header-title">
                <i className="fa-solid fa-shield-halved" style={{ color: 'var(--gold-light)' }}></i>
                Nermai Admin Portal
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="ap-header-close" onClick={handleLogout} title="Logout">
                  <i className="fa-solid fa-right-from-bracket"></i>
                </button>
                <button className="ap-header-close" onClick={() => setShowPanel(false)} title="Close">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>

            {/* Nav */}
            <div className="ap-nav">
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  className={`ap-nav-btn${activeSection === s.id ? ' active' : ''}`}
                  onClick={() => setActiveSection(s.id)}
                >
                  <i className={`fa-solid ${s.icon.replace('fa-brands ', '')}`}></i>
                  {s.label}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="ap-body">
              {activeSection === 'homecontent'  && <HomeContentSection toast={toast} />}
              {activeSection === 'hero'         && <HeroSection toast={toast} />}
              {activeSection === 'notices'      && <NoticesSection toast={toast} />}
              {activeSection === 'resources'    && <ResourceManager toast={toast} />}
              {activeSection === 'toppers'      && <ToppersSection toast={toast} />}
              {activeSection === 'testimonials' && <TestimonialsSection toast={toast} />}
              {activeSection === 'gallery'      && <GallerySection toast={toast} />}
              {activeSection === 'siteinfo'     && <SiteInfoSection toast={toast} />}
              {activeSection === 'footer'       && <FooterContentSection toast={toast} />}
              {activeSection === 'drive'        && <DriveSection toast={toast} />}
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <div className="toast-container" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <i className={`fa-solid ${t.type === 'success' ? 'fa-circle-check' : t.type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info'}`}></i>
            {t.msg}
          </div>
        ))}
      </div>
    </>
  )
}
