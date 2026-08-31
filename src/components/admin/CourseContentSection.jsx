import { useState, useEffect } from 'react'
import { fbFirestore } from '../../firebase/firestore'

const DEFAULT_COURSES = [
  { slug: 'upsc',       name: 'UPSC Civil Service',  icon: '🏛️', iconType: 'emoji' },
  { slug: 'tnpsc',      name: 'TNPSC / Railways',    icon: '📋', iconType: 'emoji' },
  { slug: 'udc-ldc',    name: 'UDC / LDC / VAO',     icon: '📁', iconType: 'emoji' },
  { slug: 'banking',    name: 'Banking',              icon: '🏦', iconType: 'emoji' },
  { slug: 'puducherry', name: 'Puducherry Exam',      icon: '🌿', iconType: 'emoji' },
  { slug: 'ssc',        name: 'SSC / PC / DT / SI',  icon: '⚖️', iconType: 'emoji' },
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

export default function CourseContentSection({ toast }) {
  const [selectedSlug, setSelectedSlug] = useState('upsc')
  const [courseList, setCourseList] = useState(DEFAULT_COURSES)
  const [content, setContent] = useState(EMPTY_CONTENT)
  const [activeTab, setActiveTab] = useState('content')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [docStatus, setDocStatus] = useState('new') // 'new' | 'draft' | 'published'

  // Load course list from homeContent.courses
  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s.homeContent?.courses?.length) {
        setCourseList(s.homeContent.courses.map(c => ({
          slug: c.slug,
          name: c.name,
          icon: c.icon,
          iconType: c.iconType || 'emoji',
        })))
      }
    })
  }, [])

  // Load content when slug changes
  useEffect(() => {
    if (!selectedSlug) return
    setLoading(true)
    const cObj = courseList.find(c => c.slug === selectedSlug)
    fbFirestore.getCourseContent(selectedSlug).then(data => {
      if (data) {
        setDocStatus(data.isLive ? 'published' : 'draft')
        // Ensure visibility object exists
        setContent({ 
          ...EMPTY_CONTENT, 
          ...data,
          visibility: { ...EMPTY_CONTENT.visibility, ...(data.visibility || {}) }
        })
      } else {
        setDocStatus('new')
        setContent({ ...EMPTY_CONTENT, ...cObj }) // fallback to basic list info
      }
    }).catch(e => {
      console.error('Error fetching course:', e)
      setDocStatus('new')
      setContent({ ...EMPTY_CONTENT, ...cObj })
    }).finally(() => setLoading(false))
  }, [selectedSlug])

  const update = (key, val) => setContent(c => ({ ...c, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await fbFirestore.saveCourseContent(selectedSlug, content)
      setDocStatus(content.isLive ? 'published' : 'draft')
      toast.success(`"${content.name || selectedSlug}" content saved!`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 className="ap-section-title"><i className="fa-solid fa-graduation-cap" /> Course Detail Pages</h2>
      <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
        Edit the full content for each course's detail page. Supports emoji OR image URL for the course icon. Toggle <strong>Published</strong> to make content live.
      </p>

      {/* Course selector */}
      <div className="ap-card" style={{ marginBottom: '1.25rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.08em', color: 'var(--gray-500)', marginBottom: '0.35rem', fontFamily: 'var(--font-mono)' }}>SELECT COURSE</label>
          <select
            className="ap-input"
            value={selectedSlug}
            onChange={e => setSelectedSlug(e.target.value)}
            style={{ width: '100%' }}
          >
            {courseList.map(c => (
              <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1.25rem' }}>
          <div style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', background: docStatus === 'published' ? '#dcfce7' : (docStatus === 'draft' ? '#fef08a' : '#f1f5f9'), color: docStatus === 'published' ? '#166534' : (docStatus === 'draft' ? '#854d0e' : '#475569') }}>
            {docStatus === 'published' ? 'PUBLISHED' : (docStatus === 'draft' ? 'DRAFT' : 'NOT PUBLISHED')}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={!!content.isLive}
              onChange={e => update('isLive', e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--saffron)' }}
            />
            <span style={{ color: content.isLive ? '#16a34a' : 'var(--gray-400)' }}>
              Set as Published
            </span>
          </label>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>
          <i className="fa-solid fa-spinner fa-spin" /> Loading...
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="ap-tabs" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--gray-200)', paddingBottom: '0.5rem' }}>
            <button className={`ap-tab${activeTab === 'content' ? ' active' : ''}`} onClick={() => setActiveTab('content')} style={{ background: 'none', border: 'none', fontWeight: 600, padding: '0.5rem 1rem', cursor: 'pointer', color: activeTab === 'content' ? 'var(--maroon)' : 'var(--gray-500)', borderBottom: activeTab === 'content' ? '3px solid var(--maroon)' : '3px solid transparent', marginBottom: '-0.65rem' }}>
              <i className="fa-solid fa-pen-to-square" style={{ marginRight: '0.5rem' }} /> Content
            </button>
            <button className={`ap-tab${activeTab === 'visibility' ? ' active' : ''}`} onClick={() => setActiveTab('visibility')} style={{ background: 'none', border: 'none', fontWeight: 600, padding: '0.5rem 1rem', cursor: 'pointer', color: activeTab === 'visibility' ? 'var(--maroon)' : 'var(--gray-500)', borderBottom: activeTab === 'visibility' ? '3px solid var(--maroon)' : '3px solid transparent', marginBottom: '-0.65rem' }}>
              <i className="fa-solid fa-eye" style={{ marginRight: '0.5rem' }} /> Visibility
            </button>
          </div>

          {activeTab === 'visibility' ? (
            <div className="ap-card" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {[
                { key: 'overview', label: 'Overview Section' },
                { key: 'syllabus', label: 'Syllabus Section' },
                { key: 'eligibility', label: 'Eligibility Criteria' },
                { key: 'batchInfo', label: 'Batch Information' },
                { key: 'feeInfo', label: 'Fee Structure' }
              ].map(sec => (
                <label key={sec.key} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={content.visibility?.[sec.key] !== false}
                    onChange={e => update('visibility', { ...content.visibility, [sec.key]: e.target.checked })}
                    style={{ cursor: 'pointer', accentColor: 'var(--maroon)' }}
                  />
                  {sec.label}
                </label>
              ))}
            </div>
          ) : (
            <>
          {/* Icon Section */}
          <div className="ap-card" style={{ marginBottom: '1rem', padding: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--maroon)' }}>
              🏷️ Course Icon
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
              {['emoji', 'url'].map(type => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: content.iconType === type ? 700 : 400, color: content.iconType === type ? 'var(--maroon)' : 'var(--gray-500)', fontSize: '0.85rem' }}>
                  <input
                    type="radio"
                    name="iconType"
                    value={type}
                    checked={content.iconType === type}
                    onChange={() => update('iconType', type)}
                    style={{ accentColor: 'var(--maroon)' }}
                  />
                  {type === 'emoji' ? '😀 Emoji' : '🖼️ Image URL'}
                </label>
              ))}
            </div>
            {content.iconType === 'emoji' ? (
              <Field label="Emoji Character" value={content.icon} onChange={v => update('icon', v)} placeholder="🏛️" />
            ) : (
              <>
                <Field label="Image URL (Google Drive share link or direct URL)" value={content.iconUrl} onChange={v => update('iconUrl', v)} placeholder="https://drive.google.com/... or https://example.com/icon.png" />
                {content.iconUrl && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={content.iconUrl.includes('drive.google.com') ? content.iconUrl.replace('/file/d/', '/thumbnail?id=').replace('/view?usp=sharing', '').replace('/view', '') : content.iconUrl}
                      alt="Icon Preview" style={{ width: 48, height: 48, objectFit: 'contain', border: '1px solid var(--gray-200)', borderRadius: 0, background: '#f9f9f9' }}
                      onError={e => e.target.style.display = 'none'} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Icon Preview</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Banner Section */}
          <div className="ap-card" style={{ marginBottom: '1rem', padding: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--maroon)' }}>
              🖼️ Course Banner Image
            </div>
            <Field label="Banner Image URL (shown as hero background)" value={content.bannerUrl || ''} onChange={v => update('bannerUrl', v)} placeholder="https://example.com/banner.jpg" />
            {content.bannerUrl && (
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src={content.bannerUrl.includes('drive.google.com') ? content.bannerUrl.replace('/file/d/', '/thumbnail?id=').replace('/view?usp=sharing', '').replace('/view', '') : content.bannerUrl}
                  alt="Banner Preview" style={{ width: '100%', maxHeight: 150, objectFit: 'cover', border: '1px solid var(--gray-200)', borderRadius: 0, background: '#f9f9f9' }}
                  onError={e => e.target.style.display = 'none'} />
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="ap-card" style={{ marginBottom: '1rem', padding: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--maroon)' }}>📝 Basic Info</div>
            <div className="ap-form-row">
              <Field label="Course Name"    value={content.name}    onChange={v => update('name', v)}    placeholder="UPSC Civil Service" />
              <Field label="Sub Name"       value={content.subname} onChange={v => update('subname', v)} placeholder="IAS / IPS / IFS" />
            </div>
            <Field label="Short Description" value={content.description} onChange={v => update('description', v)} type="textarea" placeholder="Brief description shown on card..." rows={2} />
            <Field
              label="Tags (comma-separated)"
              value={(content.tags || []).join(', ')}
              onChange={v => update('tags', v.split(',').map(t => t.trim()).filter(Boolean))}
              placeholder="IAS, IPS, IFS, CIVIL SERVICES"
            />
            <Field label="CTA Button Text" value={content.ctaText} onChange={v => update('ctaText', v)} placeholder="Enroll Now" />
          </div>

          {/* Full Page Content */}
          <div className="ap-card" style={{ marginBottom: '1rem', padding: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--maroon)' }}>📄 Full Page Content</div>
            <Field label="Overview (shown at top of detail page)" value={content.overview} onChange={v => update('overview', v)} type="textarea" rows={4} placeholder="Full overview of the course, exam pattern, importance..." />
            <Field label="Syllabus (each topic on a new line)" value={content.syllabus} onChange={v => update('syllabus', v)} type="textarea" rows={5} placeholder="General Studies Paper 1&#10;General Studies Paper 2&#10;Optional Subject..." />
            <Field label="Eligibility Criteria (Supports basic HTML like <ul>)" value={content.eligibility} onChange={v => update('eligibility', v)} type="textarea" placeholder="E.g. <ul><li>Age 21-32 years</li><li>Any degree</li></ul>" />
            <Field label="Batch Details" value={content.batchInfo} onChange={v => update('batchInfo', v)} type="textarea" placeholder="Morning / Evening / Weekend batches available..." />
            <Field label="Fee Structure & Offers" value={content.feeInfo} onChange={v => update('feeInfo', v)} type="textarea" placeholder="Total Fee: ₹45,000. Installments available..." />
          </div>

          {/* FAQs */}
          <div className="ap-card" style={{ marginBottom: '1rem', padding: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--maroon)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>❓ Course FAQs</span>
              <button className="ap-btn ap-btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => update('faqs', [...(content.faqs || []), { q: '', a: '' }])}>
                <i className="fa-solid fa-plus" /> Add FAQ
              </button>
            </div>
            {(!content.faqs || content.faqs.length === 0) ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--gray-400)', fontStyle: 'italic' }}>No FAQs added. Section will be hidden.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {content.faqs.map((faq, idx) => (
                  <div key={idx} className="ap-card" style={{ padding: '1rem', border: '1px solid var(--gray-200)', background: 'var(--white)', boxShadow: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--maroon)' }}>
                        FAQ {idx + 1}
                      </div>
                      <button onClick={() => update('faqs', content.faqs.filter((_, i) => i !== idx))} className="btn" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                        <i className="fa-solid fa-trash" style={{ marginRight: '6px' }} /> Delete
                      </button>
                    </div>
                    <Field label="Question" value={faq.q} onChange={v => { const n = [...content.faqs]; n[idx].q = v; update('faqs', n) }} placeholder="Question?" />
                    <Field label="Answer" value={faq.a} onChange={v => { const n = [...content.faqs]; n[idx].a = v; update('faqs', n) }} type="textarea" rows={3} placeholder="Answer text..." />
                  </div>
                ))}
              </div>
            )}
          </div>
            </>
          )}

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button className="ap-btn ap-btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
              {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Saving...</> : <><i className="fa-solid fa-floppy-disk" /> Save Course Content</>}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
