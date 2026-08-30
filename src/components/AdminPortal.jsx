import { useState, useEffect, useRef } from 'react'
import { fbFirestore } from '../firebase/firestore'
import { driveStorage } from '../services/driveStorage'
import { getGoogleDriveCDNUrl } from '../utils/imageOptimizer'
import HomeContentSection from './admin/HomeContentSection'

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
      <p>{uploading ? `Uploading... ${progress}%` : 'படத்தை இங்கே இழுக்கவும் அல்லது Click செய்யவும்'}</p>
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
      toast.error('குறைந்தது ஒரு image அல்லது title தேவை')
      return
    }
    try {
      await fbFirestore.addHeroSlide(form)
      setForm({ urlDesktop: '', urlMobile: '', ctaLink: '#', scene: 'none' })
      toast.success('Hero slide சேர்க்கப்பட்டது!')
    } catch (e) { toast.error('Error: ' + e.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('இந்த slide ஐ நீக்கவா?')) return
    try { await fbFirestore.deleteHeroSlide(id); toast.success('Slide நீக்கப்பட்டது') }
    catch (e) { toast.error(e.message) }
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
            <div className="ap-hero-upload-heading">
              <i className="fa-solid fa-desktop" style={{ color: 'var(--maroon)', marginRight: '6px' }}></i>
              <strong>Desktop Image</strong>
              <span className="ap-hero-dim-chip">1920 × 600 px</span>
            </div>
            <FileDropZone onUpload={handleUploadDesktop} uploading={uploadingDesk} progress={progressDesk} />
            {form.urlDesktop && (
              <div style={{ marginTop: '0.75rem' }}>
                <img
                  src={driveStorage.formatImageUrl(form.urlDesktop) || form.urlDesktop}
                  alt="Desktop preview"
                  style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 6, border: '2px solid var(--maroon)' }}
                  onError={e => { e.target.style.display = 'none' }}
                />
                <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginTop: '0.25rem' }}>✅ Desktop image ready</div>
              </div>
            )}
            <div className="ap-form-group" style={{ marginTop: '0.75rem' }}>
              <label>Or paste Drive URL (Desktop)</label>
              <input
                className="ap-input"
                placeholder="https://drive.google.com/file/d/... (PC image)"
                value={form.urlDesktop}
                onChange={e => setForm(f => ({ ...f, urlDesktop: e.target.value }))}
              />
            </div>
          </div>

          {/* Mobile upload */}
          <div className="ap-hero-upload-col">
            <div className="ap-hero-upload-heading">
              <i className="fa-solid fa-mobile-screen-button" style={{ color: 'var(--saffron)', marginRight: '6px' }}></i>
              <strong>Mobile Image</strong>
              <span className="ap-hero-dim-chip ap-hero-dim-chip--mob">768 × 1024 px</span>
            </div>
            <FileDropZone onUpload={handleUploadMobile} uploading={uploadingMob} progress={progressMob} />
            {form.urlMobile && (
              <div style={{ marginTop: '0.75rem' }}>
                <img
                  src={driveStorage.formatImageUrl(form.urlMobile) || form.urlMobile}
                  alt="Mobile preview"
                  style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 6, border: '2px solid var(--saffron)' }}
                  onError={e => { e.target.style.display = 'none' }}
                />
                <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginTop: '0.25rem' }}>✅ Mobile image ready</div>
              </div>
            )}
            <div className="ap-form-group" style={{ marginTop: '0.75rem' }}>
              <label>Or paste Drive URL (Mobile)</label>
              <input
                className="ap-input"
                placeholder="https://drive.google.com/file/d/... (Mobile image)"
                value={form.urlMobile}
                onChange={e => setForm(f => ({ ...f, urlMobile: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Slide metadata */}
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
          தற்போதைய Slides ({slides.length})
        </div>
        {slides.length === 0 ? (
          <div className="ap-empty"><i className="fa-solid fa-image"></i><p>Slides இல்லை — மேலே add செய்யவும்</p></div>
        ) : (
          <div className="ap-items-list">
            {slides.map(slide => {
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
                  <div className="ap-item-actions">
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
  const [form, setForm] = useState({ title: '', content: '', priority: 'normal', date: new Date().toISOString().split('T')[0] })

  useEffect(() => {
    const unsub = fbFirestore.onNoticesChanged(setNotices)
    return () => unsub()
  }, [])

  const handleAdd = async () => {
    if (!form.title) { toast.error('தலைப்பு தேவை'); return }
    try {
      await fbFirestore.addNotice(form)
      setForm({ title: '', content: '', priority: 'normal', date: new Date().toISOString().split('T')[0] })
      toast.success('அறிவிப்பு சேர்க்கப்பட்டது!')
    } catch (e) { toast.error(e.message) }
  }

  const handleDelete = async (id) => {
    if (id.startsWith('default_')) { toast.info('Default notices cannot be deleted'); return }
    if (!confirm('இந்த அறிவிப்பை நீக்கவா?')) return
    try { await fbFirestore.deleteNotice(id); toast.success('நீக்கப்பட்டது') }
    catch (e) { toast.error(e.message) }
  }

  return (
    <div>
      <h2 className="ap-section-title"><i className="fa-solid fa-bell"></i> அறிவிப்புகள் (Notices)</h2>

      <div className="ap-card">
        <div className="ap-form-group">
          <label>தலைப்பு *</label>
          <input className="ap-input" placeholder="TNPSC Group IV தேர்வு அறிவிப்பு 2024" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        </div>
        <div className="ap-form-group">
          <label>விவரம் (Content)</label>
          <textarea className="ap-input ap-textarea" placeholder="முழு விவரங்களை இங்கே எழுதவும்..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
        </div>
        <div className="ap-form-row">
          <div className="ap-form-group">
            <label>முன்னுரிமை (Priority)</label>
            <select className="ap-input ap-select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              <option value="normal">சாதாரண (Normal)</option>
              <option value="high">உயர் முன்னுரிமை (High)</option>
            </select>
          </div>
          <div className="ap-form-group">
            <label>தேதி (Date)</label>
            <input type="date" className="ap-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
        </div>
        <button className="ap-btn ap-btn-primary" onClick={handleAdd}>
          <i className="fa-solid fa-plus"></i> அறிவிப்பு சேர்
        </button>
      </div>

      <div className="ap-card">
        <div style={{ fontWeight: 700, marginBottom: '1rem' }}>தற்போதைய அறிவிப்புகள் ({notices.length})</div>
        {notices.length === 0 ? (
          <div className="ap-empty"><i className="fa-solid fa-bell-slash"></i><p>அறிவிப்புகள் இல்லை</p></div>
        ) : (
          <div className="ap-items-list">
            {notices.map(n => (
              <div key={n.id} className="ap-item">
                <div style={{ flex: 1 }}>
                  <div className="ap-item-title">{n.title}</div>
                  <div className="ap-item-sub">{n.date} · <span className={n.priority === 'high' ? 'ap-badge-high' : 'ap-badge-normal'}>{n.priority}</span></div>
                </div>
                <div className="ap-item-actions">
                  <button className="ap-btn ap-btn-danger" onClick={() => handleDelete(n.id)}>
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
  const [form, setForm] = useState({ name: '', rank: '', exam: 'TNPSC Group II', year: new Date().getFullYear().toString(), photo: '', quote: '' })
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const unsub = fbFirestore.onToppersChanged(setToppers)
    return () => unsub()
  }, [])

  const handlePhotoUpload = async (file) => {
    setUploading(true); setProgress(20)
    try {
      const result = await driveStorage.processAndUploadImage(file, { subFolderName: 'nermai-toppers' })
      setProgress(90)
      setForm(f => ({ ...f, photo: result.url }))
      toast.success('Photo upload ஆனது!')
    } catch (e) { toast.error(e.message) }
    finally { setUploading(false); setProgress(0) }
  }

  const handleAdd = async () => {
    if (!form.name || !form.rank) { toast.error('பெயர் மற்றும் rank தேவை'); return }
    try {
      await fbFirestore.addTopper(form)
      setForm({ name: '', rank: '', exam: 'TNPSC Group II', year: new Date().getFullYear().toString(), photo: '', quote: '' })
      toast.success('Topper சேர்க்கப்பட்டது!')
    } catch (e) { toast.error(e.message) }
  }

  const handleDelete = async (id) => {
    if (id.startsWith('default_')) { toast.info('Default data cannot be deleted'); return }
    if (!confirm('நீக்கவா?')) return
    try { await fbFirestore.deleteTopper(id); toast.success('நீக்கப்பட்டது') }
    catch (e) { toast.error(e.message) }
  }

  return (
    <div>
      <h2 className="ap-section-title"><i className="fa-solid fa-trophy"></i> வெற்றியாளர்கள் (Toppers)</h2>

      <div className="ap-card">
        <div className="ap-form-row">
          <div className="ap-form-group">
            <label>பெயர் *</label>
            <input className="ap-input" placeholder="Kavitha S." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="ap-form-group">
            <label>Rank *</label>
            <input className="ap-input" placeholder="1" value={form.rank} onChange={e => setForm(f => ({ ...f, rank: e.target.value }))} />
          </div>
        </div>
        <div className="ap-form-row">
          <div className="ap-form-group">
            <label>தேர்வு (Exam)</label>
            <select className="ap-input ap-select" value={form.exam} onChange={e => setForm(f => ({ ...f, exam: e.target.value }))}>
              {['TNPSC Group I', 'TNPSC Group II', 'TNPSC Group IV', 'UPSC CSE', 'TN Police SI', 'TN Police Constable', 'IBPS PO', 'SBI PO'].map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div className="ap-form-group">
            <label>ஆண்டு (Year)</label>
            <input className="ap-input" placeholder="2024" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} />
          </div>
        </div>
        <div className="ap-form-group">
          <label>Photo</label>
          <FileDropZone onUpload={handlePhotoUpload} uploading={uploading} progress={progress} />
          {form.photo && (
            <div style={{ marginTop: '0.5rem' }}>
              <img src={driveStorage.formatImageUrl(form.photo) || form.photo} alt="Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%', border: '3px solid var(--saffron)' }} onError={e => { e.target.style.display = 'none' }} />
            </div>
          )}
        </div>
        <div className="ap-form-group">
          <label>கருத்து (Quote)</label>
          <textarea className="ap-input ap-textarea" placeholder="நேர்மையின் வழிகாட்டுதலால்..." value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} />
        </div>
        <button className="ap-btn ap-btn-primary" onClick={handleAdd}>
          <i className="fa-solid fa-plus"></i> Topper சேர்
        </button>
      </div>

      <div className="ap-card">
        <div style={{ fontWeight: 700, marginBottom: '1rem' }}>வெற்றியாளர்கள் ({toppers.length})</div>
        {toppers.length === 0 ? (
          <div className="ap-empty"><i className="fa-solid fa-trophy"></i><p>Toppers இல்லை</p></div>
        ) : (
          <div className="ap-items-list">
            {toppers.map(t => {
              const photoUrl = driveStorage.formatImageUrl(t.photo)
              return (
                <div key={t.id} className="ap-item">
                  {photoUrl ? (
                    <img src={photoUrl} alt={t.name} className="ap-item-thumb" style={{ borderRadius: '50%' }} onError={e => { e.target.style.display = 'none' }} />
                  ) : (
                    <div className="ap-item-thumb" style={{ background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'var(--gray-400)' }}>
                      <i className="fa-solid fa-user"></i>
                    </div>
                  )}
                  <div>
                    <div className="ap-item-title">{t.name} — Rank {t.rank}</div>
                    <div className="ap-item-sub">{t.exam} · {t.year}</div>
                  </div>
                  <div className="ap-item-actions">
                    <button className="ap-btn ap-btn-danger" onClick={() => handleDelete(t.id)}>
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

// ─── Section: Testimonials ────────────────────────────────────────────────────
function TestimonialsSection({ toast }) {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name: '', role: '', quote: '' })

  useEffect(() => {
    const unsub = fbFirestore.onTestimonialsChanged(setItems)
    return () => unsub()
  }, [])

  const handleAdd = async () => {
    if (!form.name || !form.quote) { toast.error('பெயர் மற்றும் கருத்து தேவை'); return }
    try {
      await fbFirestore.addTestimonial(form)
      setForm({ name: '', role: '', quote: '' })
      toast.success('கருத்து சேர்க்கப்பட்டது!')
    } catch (e) { toast.error(e.message) }
  }

  const handleDelete = async (id) => {
    if (id.startsWith('default_')) { toast.info('Default data cannot be deleted'); return }
    if (!confirm('நீக்கவா?')) return
    try { await fbFirestore.deleteTestimonial(id); toast.success('நீக்கப்பட்டது') }
    catch (e) { toast.error(e.message) }
  }

  return (
    <div>
      <h2 className="ap-section-title"><i className="fa-solid fa-quote-right"></i> கருத்துகள் (Testimonials)</h2>
      <div className="ap-card">
        <div className="ap-form-group">
          <label>மாணவர் பெயர் *</label>
          <input className="ap-input" placeholder="Anitha Devi" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="ap-form-group">
          <label>பதவி / தேர்வு</label>
          <input className="ap-input" placeholder="TNPSC Group IV தேர்வாளர்" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
        </div>
        <div className="ap-form-group">
          <label>கருத்து *</label>
          <textarea className="ap-input ap-textarea" placeholder="நேர்மையில் படித்ததால்..." value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} />
        </div>
        <button className="ap-btn ap-btn-primary" onClick={handleAdd}>
          <i className="fa-solid fa-plus"></i> கருத்து சேர்
        </button>
      </div>
      <div className="ap-card">
        <div style={{ fontWeight: 700, marginBottom: '1rem' }}>கருத்துகள் ({items.length})</div>
        {items.length === 0 ? (
          <div className="ap-empty"><i className="fa-solid fa-comments"></i><p>கருத்துகள் இல்லை</p></div>
        ) : (
          <div className="ap-items-list">
            {items.map(t => (
              <div key={t.id} className="ap-item">
                <div style={{ flex: 1 }}>
                  <div className="ap-item-title">{t.name}</div>
                  <div className="ap-item-sub">{t.role}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginTop: '0.25rem', fontStyle: 'italic' }}>"{t.quote?.slice(0, 80)}{t.quote?.length > 80 ? '...' : ''}"</div>
                </div>
                <div className="ap-item-actions">
                  <button className="ap-btn ap-btn-danger" onClick={() => handleDelete(t.id)}>
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
    if (!form.url) { toast.error('படம் தேவை (URL missing)'); return }
    try {
      await fbFirestore.addGalleryImage(form)
      setForm({ url: '', caption: '' })
      toast.success('படம் சேர்க்கப்பட்டது!')
    } catch (e) { toast.error(e.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('இந்த படத்தை நீக்கவா?')) return
    try { await fbFirestore.deleteGalleryImage(id); toast.success('நீக்கப்பட்டது') }
    catch (e) { toast.error(e.message) }
  }

  return (
    <div>
      <h2 className="ap-section-title"><i className="fa-solid fa-images"></i> கேலரி (Gallery)</h2>
      
      <div className="ap-card">
        <div className="ap-form-group">
          <label>Photo</label>
          <FileDropZone onUpload={handleUpload} uploading={uploading} progress={progress} />
          {form.url && (
            <div style={{ marginTop: '0.5rem' }}>
              <img src={driveStorage.formatImageUrl(form.url) || form.url} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 'var(--radius)' }} onError={e => { e.target.style.display = 'none' }} />
            </div>
          )}
        </div>
        <div className="ap-form-group">
          <label>தலைப்பு / விவரம் (Caption - Optional)</label>
          <input className="ap-input" placeholder="மாணவர் பாராட்டு விழா 2024" value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} />
        </div>
        <button className="ap-btn ap-btn-primary" onClick={handleAdd}>
          <i className="fa-solid fa-plus"></i> கேலரியில் சேர்
        </button>
      </div>

      <div className="ap-card">
        <div style={{ fontWeight: 700, marginBottom: '1rem' }}>புகைப்படங்கள் ({images.length})</div>
        {images.length === 0 ? (
          <div className="ap-empty"><i className="fa-solid fa-image"></i><p>படங்கள் இல்லை</p></div>
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

  const handleSaveDrive = async () => {
    driveStorage.saveConfig(config)
    toast.success('Drive config சேமிக்கப்பட்டது!')
  }

  const handleSavePasscode = async () => {
    if (!passcode || passcode.length < 4) { toast.error('குறைந்தது 4 characters தேவை'); return }
    try {
      await fbFirestore.updateSettings({ passcode })
      setPasscode('')
      toast.success('Passcode மாற்றப்பட்டது!')
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
        <button className="ap-btn ap-btn-primary" onClick={handleSaveDrive}>
          <i className="fa-solid fa-floppy-disk"></i> Save Drive Config
        </button>
      </div>

      {/* Drive URL Converter */}
      <div className="ap-card">
        <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '0.5rem' }}>Drive URL → CDN Converter</div>
        <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
          எந்த Google Drive share link-ஐயும் fast CDN URL-ஆக மாற்றவும்.
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
          Admin Passcode மாற்று
        </div>
        <div className="ap-form-group">
          <label>புதிய Passcode</label>
          <input type="password" className="ap-input" placeholder="புதிய passcode..." value={passcode} onChange={e => setPasscode(e.target.value)} style={{ letterSpacing: '0.2em' }} />
        </div>
        <button className="ap-btn ap-btn-primary" onClick={handleSavePasscode}>
          <i className="fa-solid fa-key"></i> Passcode மாற்று
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
      toast.success('Site info சேமிக்கப்பட்டது!')
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
          <i className="fa-solid fa-floppy-disk"></i> சேமி (Save)
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
  { id: 'toppers',       label: 'Toppers',      icon: 'fa-trophy' },
  { id: 'testimonials',  label: 'Reviews',      icon: 'fa-quote-right' },
  { id: 'gallery',       label: 'Gallery',      icon: 'fa-images' },
  { id: 'siteinfo',      label: 'Site Info',    icon: 'fa-circle-info' },
  { id: 'drive',         label: 'Drive',        icon: 'fa-brands fa-google-drive' }
]

// ─── Named export for AdminDashboard (reuses all section editors) ─────────────
export function AdminPanelContent({ activeSection, toast }) {
  return (
    <>
      {activeSection === 'homecontent'  && <HomeContentSection toast={toast} />}
      {activeSection === 'hero'         && <HeroSection toast={toast} />}
      {activeSection === 'notices'      && <NoticesSection toast={toast} />}
      {activeSection === 'toppers'      && <ToppersSection toast={toast} />}
      {activeSection === 'testimonials' && <TestimonialsSection toast={toast} />}
      {activeSection === 'gallery'      && <GallerySection toast={toast} />}
      {activeSection === 'siteinfo'     && <SiteInfoSection toast={toast} />}
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
        setPasscodeError('தவறான passcode. மீண்டும் முயற்சி செய்யுங்கள்.')
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
            <h2 className="passcode-modal-title">நேர்மை Admin</h2>
            <p className="passcode-modal-sub">Admin passcode உள்ளிடவும்</p>
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
                ரத்து செய்
              </button>
              <button
                className="btn btn-primary"
                onClick={handlePasscodeSubmit}
                disabled={checking || !passcode}
              >
                {checking ? <><i className="fa-solid fa-spinner fa-spin"></i> சரிபார்க்கிறது...</> : <>உள்நுழை <i className="fa-solid fa-arrow-right"></i></>}
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
                நேர்மை Admin Portal
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
              {activeSection === 'toppers'      && <ToppersSection toast={toast} />}
              {activeSection === 'testimonials' && <TestimonialsSection toast={toast} />}
              {activeSection === 'gallery'      && <GallerySection toast={toast} />}
              {activeSection === 'siteinfo'     && <SiteInfoSection toast={toast} />}
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
