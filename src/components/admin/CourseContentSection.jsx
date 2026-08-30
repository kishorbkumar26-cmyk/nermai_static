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
  ctaText: 'Enroll Now',
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
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

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
    fbFirestore.getCourseContent(selectedSlug).then(data => {
      setContent(data ? { ...EMPTY_CONTENT, ...data } : { ...EMPTY_CONTENT })
      setLoading(false)
    })
  }, [selectedSlug])

  const update = (key, val) => setContent(c => ({ ...c, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await fbFirestore.saveCourseContent(selectedSlug, content)
      toast.success(`"${content.name || selectedSlug}" content சேமிக்கப்பட்டது!`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const selectedCourse = courseList.find(c => c.slug === selectedSlug)

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1.25rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={!!content.isLive}
              onChange={e => update('isLive', e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--saffron)' }}
            />
            <span style={{ color: content.isLive ? '#16a34a' : 'var(--gray-400)' }}>
              {content.isLive ? '✓ Published' : 'Draft (Coming Soon)'}
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
            <Field label="Eligibility" value={content.eligibility} onChange={v => update('eligibility', v)} type="textarea" rows={3} placeholder="Age: 21-32 years, Educational Qualification: Any Degree..." />
            <Field label="Batch Info" value={content.batchInfo} onChange={v => update('batchInfo', v)} type="textarea" rows={3} placeholder="Next batch starting: October 2025, Duration: 12 months..." />
            <Field label="Fee Info" value={content.feeInfo} onChange={v => update('feeInfo', v)} type="textarea" rows={2} placeholder="Fee: Affordable rates, Scholarship available for rural students..." />
          </div>

          {/* Save */}
          <div style={{ position: 'sticky', bottom: '1rem', zIndex: 10 }}>
            <button
              className="ap-btn ap-btn-primary"
              onClick={handleSave}
              disabled={saving}
              style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
            >
              {saving
                ? <><i className="fa-solid fa-spinner fa-spin" /> Saving...</>
                : <><i className="fa-solid fa-floppy-disk" /> Save Course Content</>
              }
            </button>
          </div>
        </>
      )}
    </div>
  )
}
