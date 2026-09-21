import { useState, useEffect } from 'react'
import { fbFirestore } from '../../firebase/firestore'
import { DEFAULT_COURSES_HERO } from '../CoursesHero'
import AdminImageUpload from './AdminImageUpload'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'

const DEFAULT_COURSES = [
  { id: 'bank-offline', title: 'Bank Offline Course' },
  { id: 'ssc-offline', title: 'SSC Offline Course' },
  { id: 'railways-offline', title: 'Railways Offline Course' },
  { id: 'tnpsc-offline', title: 'TNPSC Offline Course' },
  { id: 'tnusrb-offline', title: 'TNUSRB SI/PC Offline Course' },
  { id: 'tntet-hybrid', title: 'TNTET Online Hybrid Coaching Course' },
]

const EMPTY_CONTENT = {
  name: '', subname: '', description: '',
  iconType: 'emoji',   // 'emoji' | 'url'
  icon: '',            // emoji char when iconType=emoji
  iconUrl: '',         // image URL when iconType=url
  isLive: false,
  tags: [],
  overview: '',
  syllabus: '',
  eligibility: '',
  batchInfo: '',
  feeInfo: '',
  bannerUrl: '',
  faqs: [],
  ctaText: 'Enroll Now',
  visibility: {
    overview: true,
    syllabus: true,
    eligibility: true,
    batchInfo: true,
    feeInfo: true
  }
}

function Field({ label, value, onChange, type = 'text', placeholder = '', rows = 3 }) {
  return (
    <div className="ap-form-group">
      <label>{label}</label>
      {type === 'textarea'
        ? <textarea className="ap-input ap-textarea" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} />
        : <input type={type} className="ap-input" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      }
    </div>
  )
}

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

export default function CourseContentSection({ toast }) {
  const [mainTab, setMainTab] = useState('hero') // 'hero' | 'detailPages'

  // ── Hero Banner State ──
  const [heroConfig, setHeroConfig] = useState(DEFAULT_COURSES_HERO)
  const [savingHero, setSavingHero] = useState(false)

  // ── Detail Pages State ──
  const [selectedSlug, setSelectedSlug] = useState('upsc')
  const [courseList, setCourseList] = useState(DEFAULT_COURSES)
  const [content, setContent] = useState(EMPTY_CONTENT)
  const [activeTab, setActiveTab] = useState('content')
  const [loading, setLoading] = useState(false)
  const [savingDetail, setSavingDetail] = useState(false)
  const [docStatus, setDocStatus] = useState('new') // 'new' | 'draft' | 'published'

  // Load hero and course list from settings
  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s?.coursesHero) {
        setHeroConfig(prev => ({ ...DEFAULT_COURSES_HERO, ...s.coursesHero }))
      }
      const courses = s?.homeContent?.courses || DEFAULT_COURSES
      setCourseList(courses)
      if (courses.length > 0) {
        setSelectedSlug(courses[0].id || courses[0].slug)
      }
    })
  }, [])

  // Load content when slug changes
  useEffect(() => {
    if (!selectedSlug) return
    setLoading(true)
    const cObj = courseList.find(c => (c.id || c.slug) === selectedSlug) || {}
    fbFirestore.getCourseContent(selectedSlug).then(data => {
      if (data) {
        setDocStatus(data.isLive ? 'published' : 'draft')
        setContent({ 
          ...EMPTY_CONTENT, 
          ...data,
          visibility: { ...EMPTY_CONTENT.visibility, ...(data.visibility || {}) }
        })
      } else {
        setDocStatus('new')
        setContent({ ...EMPTY_CONTENT, ...cObj })
      }
    }).catch(e => {
      console.error('Error fetching course:', e)
      setDocStatus('new')
      setContent({ ...EMPTY_CONTENT, ...cObj })
    }).finally(() => setLoading(false))
  }, [selectedSlug])

  const updateHero = (key, val) => setHeroConfig(c => ({ ...c, [key]: val }))
  const updateDetail = (key, val) => setContent(c => ({ ...c, [key]: val }))

  const handleSaveHero = async () => {
    setSavingHero(true)
    try {
      await fbFirestore.updateSettings({ coursesHero: heroConfig })
      toast.success('Courses Hero banner texts & options saved successfully!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSavingHero(false)
    }
  }

  const handleSaveDetail = async () => {
    setSavingDetail(true)
    try {
      await fbFirestore.saveCourseContent(selectedSlug, content)
      setDocStatus(content.isLive ? 'published' : 'draft')
      toast.success(`"${content.title || content.name || selectedSlug}" detail page saved!`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSavingDetail(false)
    }
  }

  const isHeroVisible = heroConfig.visible !== false

  return (
    <div className="ap-section">
      <h2 className="ap-section-title">
        <i className="fa-solid fa-graduation-cap" /> Courses &amp; Programs Management
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
        Customize every single word of the <strong>Courses Page Hero Banner</strong>, floating cursive notes, credential pills, stacked leather books artwork, or manage individual <strong>Course Detail Pages</strong>.
      </p>

      {/* Main Sub-Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--gray-200)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setMainTab('hero')}
          style={{
            padding: '0.55rem 1.35rem',
            border: mainTab === 'hero' ? '2px solid var(--maroon)' : '2px solid var(--gray-200)',
            background: mainTab === 'hero' ? 'var(--maroon)' : 'var(--white)',
            color: mainTab === 'hero' ? 'var(--white)' : 'var(--gray-600)',
            fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <i className="fa-solid fa-palette" /> 1. Courses Page Hero Banner (Every Word)
        </button>

        <button
          type="button"
          onClick={() => setMainTab('detailPages')}
          style={{
            padding: '0.55rem 1.35rem',
            border: mainTab === 'detailPages' ? '2px solid var(--maroon)' : '2px solid var(--gray-200)',
            background: mainTab === 'detailPages' ? 'var(--maroon)' : 'var(--white)',
            color: mainTab === 'detailPages' ? 'var(--white)' : 'var(--gray-600)',
            fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <i className="fa-solid fa-book-open" /> 2. Course Detail Pages ({courseList.length})
        </button>
      </div>

      {/* ────────────────── SUB-TAB 1: COURSES HERO BANNER & TEXTS ────────────────── */}
      {mainTab === 'hero' && (
        <div>
          {/* Top Visibility Card */}
          <div
            className="ap-card"
            style={{
              marginBottom: '1.5rem',
              padding: '1.25rem 1.5rem',
              borderLeft: isHeroVisible ? '5px solid #10b981' : '5px solid #ef4444',
              background: isHeroVisible ? '#f0fdf4' : '#fef2f2',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{isHeroVisible ? '🟢' : '🔴'}</span>
                  <strong style={{ fontSize: '1rem', color: isHeroVisible ? '#065f46' : '#991b1b' }}>
                    {isHeroVisible ? 'Courses Hero Banner is VISIBLE' : 'Courses Hero Banner is HIDDEN'}
                  </strong>
                </div>
                <p style={{ margin: '0.25rem 0 0 1.8rem', fontSize: '0.8rem', color: isHeroVisible ? '#047857' : '#b91c1c' }}>
                  Controls the top maroon hero banner on the <code>/courses</code> page.
                </p>
              </div>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', background: 'white', padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1.5px solid #d1d5db', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', fontWeight: 700, fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={isHeroVisible}
                  onChange={e => updateHero('visible', e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                {isHeroVisible ? 'Banner: ON' : 'Banner: OFF'}
              </label>
            </div>

            {isHeroVisible && (
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '0.85rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={heroConfig.showScripts !== false}
                    onChange={e => updateHero('showScripts', e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  Show Floating Cursive Notes
                </label>

                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={heroConfig.showFeatures !== false}
                    onChange={e => updateHero('showFeatures', e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  Show 3 Feature Pills (Faculty, Structured, Results)
                </label>

                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={heroConfig.showArtwork !== false}
                    onChange={e => updateHero('showArtwork', e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  Show Stacked Leather Books &amp; Chess Artwork
                </label>
              </div>
            )}
          </div>

          {/* 1. Main Titles & Eyebrow */}
          <div className="ap-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
            <h4 style={{ color: 'var(--maroon)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.5rem' }}>
              <i className="fa-solid fa-heading" style={{ marginRight: '6px' }} /> 1. Section Header &amp; Top Eyebrow
            </h4>
            <div className="ap-form-row">
              <div className="ap-form-group">
                <label className="ap-label">Top Eyebrow Text (e.g. ACADEMIC PROGRAMS &amp; COURSES)</label>
                <input
                  className="ap-input"
                  value={heroConfig.eyebrow !== undefined ? heroConfig.eyebrow : DEFAULT_COURSES_HERO.eyebrow}
                  onChange={e => updateHero('eyebrow', e.target.value)}
                  placeholder="ACADEMIC PROGRAMS & COURSES"
                />
              </div>
              <div className="ap-form-group">
                <label className="ap-label">Eyebrow Icon Class</label>
                <input
                  className="ap-input"
                  value={heroConfig.eyebrowIcon || ''}
                  onChange={e => updateHero('eyebrowIcon', e.target.value)}
                  placeholder="fa-building-columns"
                />
              </div>
            </div>

            <div className="ap-form-row">
              <div className="ap-form-group">
                <label className="ap-label">Title Line 1 (White Text, e.g. Choose Your Path to)</label>
                <input
                  className="ap-input"
                  value={heroConfig.titleLine1 !== undefined ? heroConfig.titleLine1 : DEFAULT_COURSES_HERO.titleLine1}
                  onChange={e => updateHero('titleLine1', e.target.value)}
                  placeholder="Choose Your Path to"
                />
              </div>
              <div className="ap-form-group">
                <label className="ap-label">Title Line 2 (Gold Accent, e.g. Government Service)</label>
                <input
                  className="ap-input"
                  value={heroConfig.titleLine2 !== undefined ? heroConfig.titleLine2 : DEFAULT_COURSES_HERO.titleLine2}
                  onChange={e => updateHero('titleLine2', e.target.value)}
                  placeholder="Government Service"
                />
              </div>
            </div>

            <div className="ap-form-group">
              <label className="ap-label">Subtitle Description</label>
              <textarea
                className="ap-input ap-textarea"
                rows={3}
                value={heroConfig.subtitle !== undefined ? heroConfig.subtitle : DEFAULT_COURSES_HERO.subtitle}
                onChange={e => updateHero('subtitle', e.target.value)}
                placeholder="Renowned coaching for UPSC (Civil Services), Puducherry UDC, LDC, Sub-Inspector..."
              />
            </div>
          </div>

          {/* 2. Floating Cursive Handwritten Script Notes */}
          <div className="ap-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
            <h4 style={{ color: 'var(--maroon)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.5rem' }}>
              <i className="fa-solid fa-pen-nib" style={{ marginRight: '6px' }} /> 2. Floating Handwritten Script Notes
            </h4>
            
            {/* Left Script */}
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--ink)' }}>Left Side Floating Cursive (Tilted)</strong>
              <div className="ap-form-row" style={{ marginTop: '0.4rem' }}>
                <div className="ap-form-group">
                  <label className="ap-label">Line 1</label>
                  <input
                    className="ap-input"
                    value={heroConfig.leftScriptLine1 !== undefined ? heroConfig.leftScriptLine1 : DEFAULT_COURSES_HERO.leftScriptLine1}
                    onChange={e => updateHero('leftScriptLine1', e.target.value)}
                    placeholder="Learn"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-label">Line 2</label>
                  <input
                    className="ap-input"
                    value={heroConfig.leftScriptLine2 !== undefined ? heroConfig.leftScriptLine2 : DEFAULT_COURSES_HERO.leftScriptLine2}
                    onChange={e => updateHero('leftScriptLine2', e.target.value)}
                    placeholder="Prepare"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-label">Line 3 (Underlined)</label>
                  <input
                    className="ap-input"
                    value={heroConfig.leftScriptLine3 !== undefined ? heroConfig.leftScriptLine3 : DEFAULT_COURSES_HERO.leftScriptLine3}
                    onChange={e => updateHero('leftScriptLine3', e.target.value)}
                    placeholder="Succeed"
                  />
                </div>
              </div>
            </div>

            {/* Right Script */}
            <div>
              <strong style={{ fontSize: '0.85rem', color: 'var(--ink)' }}>Right Side Floating Cursive (Above Stacked Books)</strong>
              <div className="ap-form-row" style={{ marginTop: '0.4rem' }}>
                <div className="ap-form-group">
                  <label className="ap-label">Line 1</label>
                  <input
                    className="ap-input"
                    value={heroConfig.rightScriptLine1 !== undefined ? heroConfig.rightScriptLine1 : DEFAULT_COURSES_HERO.rightScriptLine1}
                    onChange={e => updateHero('rightScriptLine1', e.target.value)}
                    placeholder="Different"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-label">Line 2</label>
                  <input
                    className="ap-input"
                    value={heroConfig.rightScriptLine2 !== undefined ? heroConfig.rightScriptLine2 : DEFAULT_COURSES_HERO.rightScriptLine2}
                    onChange={e => updateHero('rightScriptLine2', e.target.value)}
                    placeholder="Aspirations"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-label">Line 3</label>
                  <input
                    className="ap-input"
                    value={heroConfig.rightScriptLine3 !== undefined ? heroConfig.rightScriptLine3 : DEFAULT_COURSES_HERO.rightScriptLine3}
                    onChange={e => updateHero('rightScriptLine3', e.target.value)}
                    placeholder="One"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-label">Line 4 (Underlined)</label>
                  <input
                    className="ap-input"
                    value={heroConfig.rightScriptLine4 !== undefined ? heroConfig.rightScriptLine4 : DEFAULT_COURSES_HERO.rightScriptLine4}
                    onChange={e => updateHero('rightScriptLine4', e.target.value)}
                    placeholder="Destination"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Feature Highlight Pills */}
          <div className="ap-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
            <h4 style={{ color: 'var(--maroon)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.5rem' }}>
              <i className="fa-solid fa-award" style={{ marginRight: '6px' }} /> 3. Three Feature Highlight Pills
            </h4>

            {/* Pill 1 */}
            <div style={{ marginBottom: '1rem', background: '#FAF8F5', padding: '1rem', borderRadius: '10px', border: '1px solid #EFE5D8' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--maroon)' }}>Feature 1 (Leftmost Pill)</strong>
              <div className="ap-form-row" style={{ marginTop: '0.4rem' }}>
                <div className="ap-form-group">
                  <label className="ap-label">Title</label>
                  <input
                    className="ap-input"
                    value={heroConfig.feature1Title !== undefined ? heroConfig.feature1Title : DEFAULT_COURSES_HERO.feature1Title}
                    onChange={e => updateHero('feature1Title', e.target.value)}
                    placeholder="Expert Faculty"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-label">Subtext / Experience</label>
                  <input
                    className="ap-input"
                    value={heroConfig.feature1Sub !== undefined ? heroConfig.feature1Sub : DEFAULT_COURSES_HERO.feature1Sub}
                    onChange={e => updateHero('feature1Sub', e.target.value)}
                    placeholder="15+ Years of Experience"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-label">Icon Class</label>
                  <input
                    className="ap-input"
                    value={heroConfig.feature1Icon || ''}
                    onChange={e => updateHero('feature1Icon', e.target.value)}
                    placeholder="fa-graduation-cap"
                  />
                </div>
              </div>
            </div>

            {/* Pill 2 */}
            <div style={{ marginBottom: '1rem', background: '#FAF8F5', padding: '1rem', borderRadius: '10px', border: '1px solid #EFE5D8' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--maroon)' }}>Feature 2 (Center Pill)</strong>
              <div className="ap-form-row" style={{ marginTop: '0.4rem' }}>
                <div className="ap-form-group">
                  <label className="ap-label">Title</label>
                  <input
                    className="ap-input"
                    value={heroConfig.feature2Title !== undefined ? heroConfig.feature2Title : DEFAULT_COURSES_HERO.feature2Title}
                    onChange={e => updateHero('feature2Title', e.target.value)}
                    placeholder="Structured Learning"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-label">Subtext</label>
                  <input
                    className="ap-input"
                    value={heroConfig.feature2Sub !== undefined ? heroConfig.feature2Sub : DEFAULT_COURSES_HERO.feature2Sub}
                    onChange={e => updateHero('feature2Sub', e.target.value)}
                    placeholder="From Basics to Advanced"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-label">Icon Class</label>
                  <input
                    className="ap-input"
                    value={heroConfig.feature2Icon || ''}
                    onChange={e => updateHero('feature2Icon', e.target.value)}
                    placeholder="fa-file-lines"
                  />
                </div>
              </div>
            </div>

            {/* Pill 3 */}
            <div style={{ background: '#FAF8F5', padding: '1rem', borderRadius: '10px', border: '1px solid #EFE5D8' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--maroon)' }}>Feature 3 (Rightmost Pill)</strong>
              <div className="ap-form-row" style={{ marginTop: '0.4rem' }}>
                <div className="ap-form-group">
                  <label className="ap-label">Title</label>
                  <input
                    className="ap-input"
                    value={heroConfig.feature3Title !== undefined ? heroConfig.feature3Title : DEFAULT_COURSES_HERO.feature3Title}
                    onChange={e => updateHero('feature3Title', e.target.value)}
                    placeholder="Proven Results"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-label">Subtext</label>
                  <input
                    className="ap-input"
                    value={heroConfig.feature3Sub !== undefined ? heroConfig.feature3Sub : DEFAULT_COURSES_HERO.feature3Sub}
                    onChange={e => updateHero('feature3Sub', e.target.value)}
                    placeholder="Guiding Aspirants to Success"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-label">Icon Class</label>
                  <input
                    className="ap-input"
                    value={heroConfig.feature3Icon || ''}
                    onChange={e => updateHero('feature3Icon', e.target.value)}
                    placeholder="fa-chart-column"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Stacked Leather Books Artwork */}
          <div className="ap-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
            <h4 style={{ color: 'var(--maroon)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.5rem' }}>
              <i className="fa-solid fa-book" style={{ marginRight: '6px' }} /> 4. Stacked Leather Hardcover Books Artwork (Right Side)
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
              Customize the gold embossed spine title for each stacked book.
            </p>
            <div className="ap-form-row">
              <div className="ap-form-group">
                <label className="ap-label">Book 1 (Top Spine, e.g. DISCIPLINE)</label>
                <input
                  className="ap-input"
                  value={heroConfig.book1Title !== undefined ? heroConfig.book1Title : DEFAULT_COURSES_HERO.book1Title}
                  onChange={e => updateHero('book1Title', e.target.value)}
                  placeholder="DISCIPLINE"
                />
              </div>
              <div className="ap-form-group">
                <label className="ap-label">Book 2 (Second Spine, e.g. KNOWLEDGE)</label>
                <input
                  className="ap-input"
                  value={heroConfig.book2Title !== undefined ? heroConfig.book2Title : DEFAULT_COURSES_HERO.book2Title}
                  onChange={e => updateHero('book2Title', e.target.value)}
                  placeholder="KNOWLEDGE"
                />
              </div>
            </div>
            <div className="ap-form-row">
              <div className="ap-form-group">
                <label className="ap-label">Book 3 (Third Spine, e.g. SERVICE)</label>
                <input
                  className="ap-input"
                  value={heroConfig.book3Title !== undefined ? heroConfig.book3Title : DEFAULT_COURSES_HERO.book3Title}
                  onChange={e => updateHero('book3Title', e.target.value)}
                  placeholder="SERVICE"
                />
              </div>
              <div className="ap-form-group">
                <label className="ap-label">Book 4 (Bottom Spine, e.g. A BETTER TOMORROW)</label>
                <input
                  className="ap-input"
                  value={heroConfig.book4Title !== undefined ? heroConfig.book4Title : DEFAULT_COURSES_HERO.book4Title}
                  onChange={e => updateHero('book4Title', e.target.value)}
                  placeholder="A BETTER TOMORROW"
                />
              </div>
            </div>
          </div>

          {/* Save Button for Hero */}
          <div style={{ position: 'sticky', bottom: '1rem', zIndex: 10, marginTop: '1.5rem' }}>
            <button
              type="button"
              className="ap-btn ap-btn-primary"
              onClick={handleSaveHero}
              disabled={savingHero}
              style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
            >
              {savingHero ? <><i className="fa-solid fa-spinner fa-spin" /> Saving Courses Hero...</> : <><i className="fa-solid fa-floppy-disk" /> Save Courses Page Hero Banner &amp; All Texts</>}
            </button>
          </div>
        </div>
      )}

      {/* ────────────────── SUB-TAB 2: COURSE DETAIL PAGES ────────────────── */}
      {mainTab === 'detailPages' && (
        <div>
          {/* Course selector */}
          <div className="ap-card" style={{ marginBottom: '1.25rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.08em', color: 'var(--gray-500)', marginBottom: '0.35rem', fontFamily: 'var(--font-mono)' }}>SELECT COURSE</label>
              <select
                className="ap-input"
                value={selectedSlug}
                onChange={e => setSelectedSlug(e.target.value)}
              >
                {courseList.map(c => (
                  <option key={c.id || c.slug} value={c.id || c.slug}>
                    {c.title || c.name || c.id}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={`ap-badge ap-badge-${docStatus === 'published' ? 'published' : docStatus === 'draft' ? 'draft' : 'neutral'}`}>
                {docStatus === 'published' ? '🟢 Published' : docStatus === 'draft' ? '🟡 Draft' : '⚪ New'}
              </span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={content.isLive}
                  onChange={e => update('isLive', e.target.checked)}
                />
                Published Live
              </label>
            </div>
          </div>

          {/* Sub-tabs for detail page */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem', borderBottom: '2px solid var(--gray-200)', paddingBottom: '0.5rem' }}>
            {['content', 'overview', 'curriculum', 'faqs'].map(tab => (
              <button
                key={tab}
                className={`ap-tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
                style={{ textTransform: 'capitalize' }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Detail Tab Contents */}
          {loading ? (
            <div className="ap-empty"><i className="fa-solid fa-spinner fa-spin" /><p>Loading course content...</p></div>
          ) : (
            <div className="ap-card" style={{ marginBottom: '1.5rem' }}>
              {activeTab === 'content' && (
                <div>
                  <div className="ap-form-row">
                    <Field label="Display Name / Heading" value={content.name || content.title} onChange={v => update('name', v)} placeholder="Bank Offline Course" />
                    <Field label="Subtitle / Tagline" value={content.subname} onChange={v => update('subname', v)} placeholder="Comprehensive coaching for IBPS, SBI, RRB" />
                  </div>
                  <Field label="Short Description" value={content.description} onChange={v => update('description', v)} type="textarea" rows={2} />
                  <div className="ap-form-row">
                    <Field label="Enroll Button CTA Text" value={content.ctaText} onChange={v => update('ctaText', v)} placeholder="Enroll Now" />
                    <Field label="Eligibility Summary" value={content.eligibility} onChange={v => update('eligibility', v)} placeholder="Any Graduate" />
                  </div>
                </div>
              )}

              {activeTab === 'overview' && (
                <div>
                  <RichField label="Course Overview (Rich HTML)" value={content.overview} onChange={v => update('overview', v)} />
                  <div style={{ marginTop: '1.5rem' }}>
                    <Field label="Batch & Timing Info" value={content.batchInfo} onChange={v => update('batchInfo', v)} type="textarea" rows={3} />
                    <Field label="Fee Structure" value={content.feeInfo} onChange={v => update('feeInfo', v)} type="textarea" rows={2} />
                  </div>
                </div>
              )}

              {activeTab === 'curriculum' && (
                <div>
                  <RichField label="Syllabus & Curriculum Details" value={content.syllabus} onChange={v => update('syllabus', v)} />
                </div>
              )}

              {activeTab === 'faqs' && (
                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
                    Add FAQs specific to this course.
                  </p>
                  {(content.faqs || []).map((faq, idx) => (
                    <div key={idx} style={{ background: '#FAF8F5', padding: '1rem', borderRadius: '8px', marginBottom: '0.75rem', border: '1px solid #EFE5D8' }}>
                      <div className="ap-form-group">
                        <label>Question #{idx + 1}</label>
                        <input className="ap-input" value={faq.q || ''} onChange={e => {
                          const f = [...(content.faqs || [])]
                          f[idx] = { ...f[idx], q: e.target.value }
                          update('faqs', f)
                        }} />
                      </div>
                      <div className="ap-form-group">
                        <label>Answer</label>
                        <textarea className="ap-input ap-textarea" rows={2} value={faq.a || ''} onChange={e => {
                          const f = [...(content.faqs || [])]
                          f[idx] = { ...f[idx], a: e.target.value }
                          update('faqs', f)
                        }} />
                      </div>
                      <button type="button" className="ap-btn ap-btn-danger ap-btn-sm" onClick={() => {
                        const f = (content.faqs || []).filter((_, i) => i !== idx)
                        update('faqs', f)
                      }}>
                        <i className="fa-solid fa-trash" /> Delete FAQ
                      </button>
                    </div>
                  ))}
                  <button type="button" className="ap-btn ap-btn-ghost" onClick={() => {
                    update('faqs', [...(content.faqs || []), { q: '', a: '' }])
                  }}>
                    <i className="fa-solid fa-plus" /> Add FAQ
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Save Button for Detail Page */}
          <div style={{ position: 'sticky', bottom: '1rem', zIndex: 10, marginTop: '1.5rem' }}>
            <button
              type="button"
              className="ap-btn ap-btn-primary"
              onClick={handleSaveDetail}
              disabled={savingDetail}
              style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
            >
              {savingDetail ? <><i className="fa-solid fa-spinner fa-spin" /> Saving...</> : <><i className="fa-solid fa-floppy-disk" /> Save Course Detail Page</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
