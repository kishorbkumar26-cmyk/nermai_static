import React, { useState, useEffect } from 'react'
import { fbFirestore } from '../../firebase/firestore'
import { driveStorage } from '../../services/driveStorage'
import AdminImageUpload from './AdminImageUpload'

/* ── tiny helpers ─────────────────────────────────────────────────────────── */
function Field({ label, value, onChange, type = 'text', placeholder = '', options = [] }) {
  return (
    <div className="ap-form-group">
      <label>{label}</label>
      {type === 'textarea' ? (
        <textarea className="ap-input ap-textarea" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} />
      ) : type === 'select' ? (
        <select className="ap-input" value={value} onChange={e => onChange(e.target.value)}>
          {options.map(opt => <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>)}
        </select>
      ) : (
        <input type={type} className="ap-input" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ cursor: 'pointer' }} />
      {label}
    </label>
  )
}

/* ── Section Visibility Editor ───────────────────────────────────────────── */
function VisibilityEditor({ visibility = {}, onChange }) {
  const update = (key, val) => onChange({ ...visibility, [key]: val })
  
  const SECTIONS = [
    { key: 'stats', label: 'Stats Banner (Orange Numbers)' },
    { key: 'features', label: 'Features Grid (What You Get)' },
    { key: 'courses', label: 'Courses Section' },
    { key: 'about', label: 'About Nermai Section' },
    { key: 'steps', label: 'How It Works (Steps)' },
    { key: 'results', label: 'Results & Marquee' },
    { key: 'toppers', label: 'Toppers Carousel' },
    { key: 'gallery', label: 'Gallery Section' },
    { key: 'testimonials', label: 'Testimonials' },
    { key: 'faq', label: 'FAQ Section' }
  ]

  return (
    <div>
      <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '1.25rem' }}>
        Show or hide entire sections on the public homepage.
      </p>
      <div className="ap-card" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {SECTIONS.map(sec => (
          <Toggle 
            key={sec.key} 
            label={sec.label} 
            checked={visibility[sec.key] !== false} 
            onChange={v => update(sec.key, v)} 
          />
        ))}
      </div>
    </div>
  )
}

/* ── Stats Editor ─────────────────────────────────────────────────────────── */
function StatsEditor({ stats, onChange }) {
  const update = (i, key, val) => {
    const next = stats.map((s, idx) => idx === i ? { ...s, [key]: val } : s)
    onChange(next)
  }
  const add = () => onChange([...stats, { num: '', label: '', sublabel: '' }])
  const remove = (i) => onChange(stats.filter((_, idx) => idx !== i))

  return (
    <div>
      <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '1.25rem' }}>
        Edit the stat numbers shown in the orange banner below the hero image.
      </p>
      {stats.map((stat, i) => (
        <div key={i} className="ap-card" style={{ marginBottom: '0.75rem', padding: '1rem', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--maroon)' }}>
                Stat {i + 1}
              </div>
              <Toggle label="Visible" checked={stat.visible !== false} onChange={v => update(i, 'visible', v)} />
            </div>
            {stats.length > 1 && (
              <button 
                onClick={() => remove(i)} 
                title="Remove Stat"
                className="btn"
                style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px' }}
              >
                <i className="fa-solid fa-trash" style={{ marginRight: '6px' }} />
                Delete
              </button>
            )}
          </div>
          <div className="ap-form-row">
            <Field label="Number (e.g. 2400+)" value={stat.num}      onChange={v => update(i, 'num', v)} placeholder="2400+" />
            <Field label="English Label"        value={stat.label}    onChange={v => update(i, 'label', v)} placeholder="Students" />
          </div>
          <Field label="Tamil Sub-Label" value={stat.sublabel} onChange={v => update(i, 'sublabel', v)} placeholder="Trained people" />
        </div>
      ))}
      <button 
        onClick={add}
        className="btn" 
        style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', background: 'var(--gray-100)', color: 'var(--gray-700)', border: '1px dashed var(--gray-300)' }}
      >
        <i className="fa-solid fa-plus" style={{ marginRight: '8px' }} />
        Add Stat
      </button>
    </div>
  )
}

/* ── Features Editor ─────────────────────────────────────────────────────── */
function FeaturesEditor({ features, onChange }) {
  const update = (i, key, val) => onChange(features.map((f, idx) => idx === i ? { ...f, [key]: val } : f))
  const add = () => onChange([...features, { icon: 'Star', title: '', desc: '', imageUrl: '', visible: true }])
  const remove = (i) => onChange(features.filter((_, idx) => idx !== i))

  return (
    <div>
      <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '1.25rem' }}>
        Edit the 6 feature cards. Provide either an Icon Name or an Image URL.
      </p>
      {features.map((feat, i) => (
        <div key={i} className="ap-card" style={{ marginBottom: '0.75rem', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--maroon)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Feature {i + 1}
              </div>
              <Toggle label="Visible" checked={feat.visible !== false} onChange={v => update(i, 'visible', v)} />
            </div>
            {features.length > 1 && (
              <button onClick={() => remove(i)} className="btn" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px' }}>
                <i className="fa-solid fa-trash" style={{ marginRight: '6px' }} /> Delete
              </button>
            )}
          </div>
          <div className="ap-form-row">
            <Field 
              label="Select Icon" 
              type="select" 
              value={feat.icon} 
              onChange={v => update(i, 'icon', v)} 
              options={[
                'GraduationCap', 'BookOpen', 'PenTool', 'LineChart', 
                'CalendarCheck', 'UserCircle', 'Star', 'Trophy', 
                'Users', 'Shield', 'Target', 'Lightbulb', 
                'Zap', 'Rocket', 'CheckCircle', 'FileText', 
                'Monitor', 'Bookmark'
              ]} 
            />
            <Field label="Image URL (Overrides Icon)" value={feat.imageUrl} onChange={v => update(i, 'imageUrl', v)} placeholder="https://..." />
          </div>
          <Field label="Title" value={feat.title} onChange={v => update(i, 'title', v)} placeholder="Structured Classes" />
          <Field label="Description" value={feat.desc} onChange={v => update(i, 'desc', v)} type="textarea" placeholder="Daily scheduled classes with expert faculty..." />
        </div>
      ))}
      <button onClick={add} className="btn" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', background: 'var(--gray-100)', color: 'var(--gray-700)', border: '1px dashed var(--gray-300)' }}>
        <i className="fa-solid fa-plus" style={{ marginRight: '8px' }} /> Add Feature
      </button>
    </div>
  )
}

/* ── Course Categories Editor ────────────────────────────────────────────── */
function CourseCategoriesEditor({ categories = [], onChange }) {
  const update = (i, key, val) => onChange(categories.map((c, idx) => idx === i ? { ...c, [key]: val } : c))
  const add = () => onChange([...categories, { id: 'cat-' + Date.now(), name: '', shortName: '', iconUrl: '', isVisible: true }])
  const remove = (i) => onChange(categories.filter((_, idx) => idx !== i))

  return (
    <div>
      <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '1.25rem' }}>
        Manage the category filter tabs (e.g., UPSC, TNPSC) shown above the courses.
      </p>
      {categories.map((cat, i) => (
        <div key={cat.id || i} className="ap-card" style={{ marginBottom: '1rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary, var(--maroon))' }}>
                Category {i + 1}
              </div>
              <Toggle label="Visible" checked={cat.isVisible !== false} onChange={v => update(i, 'isVisible', v)} />
            </div>
            {categories.length > 1 && (
              <button onClick={() => remove(i)} className="btn" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px' }}>
                <i className="fa-solid fa-trash" style={{ marginRight: '6px' }} /> Delete
              </button>
            )}
          </div>
          <div className="ap-form-row">
            <Field label="Full Name" value={cat.name} onChange={v => update(i, 'name', v)} placeholder="e.g. UPSC & Civil Services" />
            <Field label="Short Name (Filter Label)" value={cat.shortName} onChange={v => update(i, 'shortName', v)} placeholder="e.g. UPSC" />
          </div>
          <div style={{ width: '100%', maxWidth: '300px', marginTop: '0.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.8rem', color: 'var(--gray-700)' }}>
              Category Icon (Circle)
            </label>
            <AdminImageUpload
              value={cat.iconUrl}
              onChange={(url) => update(i, 'iconUrl', url)}
              subFolderName="categories"
              hint="Recommended: 120x120px (1:1 Ratio)"
              aspectRatio="1/1"
              previewHeight={80}
            />
          </div>
        </div>
      ))}
      <button onClick={add} className="btn" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', background: 'var(--gray-100)', color: 'var(--gray-700)', border: '1px dashed var(--gray-300)' }}>
        <i className="fa-solid fa-plus" style={{ marginRight: '8px' }} /> Add Category
      </button>
    </div>
  )
}

/* ── Courses Editor ──────────────────────────────────────────────────────── */
function CoursesEditor({ courses = [], config = {}, categories = [], onChangeCourses, onChangeConfig, onChangeCategories }) {
  const update = (i, key, val) => onChangeCourses(courses.map((c, idx) => idx === i ? { ...c, [key]: val } : c))
  const add = () => onChangeCourses([...courses, { id: 'course-' + Date.now(), title: '', categoryId: 'all', coverImageUrl: '', logoUrl: '', badges: [], shortDescription: '', features: [], price: '', priceLabel: 'Course Price', isActive: true }])
  const remove = (i) => onChangeCourses(courses.filter((_, idx) => idx !== i))
  const [showCats, setShowCats] = React.useState(false)

  const updateConfig = (key, val) => onChangeConfig({ ...config, [key]: val })
  const updateCat = (i, key, val) => onChangeCategories(categories.map((c, idx) => idx === i ? { ...c, [key]: val } : c))
  const addCat = () => onChangeCategories([...categories, { id: 'cat-' + Date.now(), name: '', shortName: '', iconUrl: '', isVisible: true }])
  const removeCat = (i) => onChangeCategories(categories.filter((_, idx) => idx !== i))

  const updateFeature = (courseIdx, featIdx, key, val) => {
    const nextFeatures = [...(courses[courseIdx].features || [])]
    nextFeatures[featIdx] = { ...nextFeatures[featIdx], [key]: val }
    update(courseIdx, 'features', nextFeatures)
  }
  const addFeature = (courseIdx) => {
    const nextFeatures = [...(courses[courseIdx].features || []), { text: '', icon: 'CheckCircle' }]
    update(courseIdx, 'features', nextFeatures)
  }
  const removeFeature = (courseIdx, featIdx) => {
    const nextFeatures = (courses[courseIdx].features || []).filter((_, idx) => idx !== featIdx)
    update(courseIdx, 'features', nextFeatures)
  }

  return (
    <div>
      <div className="ap-card" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--gray-50)' }}>
        <div style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--color-primary)' }}>Courses Section Header</div>
        <div className="ap-form-row">
          <Field label="Section Heading" value={config.sectionHeading} onChange={v => updateConfig('sectionHeading', v)} placeholder="Courses at NERMAI" />
          <Field label="Highlighted Word" value={config.highlightedWord} onChange={v => updateConfig('highlightedWord', v)} placeholder="NERMAI" />
        </div>
        <Field label="Sub Heading" value={config.subHeading} onChange={v => updateConfig('subHeading', v)} placeholder="Expert guidance for every stage of preparation" />
      </div>

      <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '1.25rem' }}>
        Manage the individual course cards. Assign them to categories to make the filtering work.
      </p>
      {courses.map((course, i) => (
        <div key={course.id || i} className="ap-card" style={{ marginBottom: '1.5rem', padding: '1.5rem', borderLeft: '4px solid var(--color-primary, var(--maroon))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary, var(--maroon))' }}>
                Course: {course.title || `Item ${i + 1}`}
              </div>
              <Toggle label="Active" checked={course.isActive !== false} onChange={v => update(i, 'isActive', v)} />
            </div>
            <button onClick={() => remove(i)} className="btn" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px' }}>
              <i className="fa-solid fa-trash" style={{ marginRight: '6px' }} /> Delete Course
            </button>
          </div>

          <div className="ap-form-row">
            <Field label="Course Title" value={course.title} onChange={v => update(i, 'title', v)} placeholder="e.g. UPSC Offline Course" />
            <Field 
              label="Category" 
              type="select" 
              value={course.categoryId || 'all'} 
              onChange={v => update(i, 'categoryId', v)} 
              options={[ 
                { value: 'all', label: 'All Courses (Default)' }, 
                ...categories.map(c => ({ value: c.id, label: c.name || c.shortName })),
                ...(categories.some(c => c.id === 'others') ? [] : [{ value: 'others', label: 'Other Courses' }])
              ]} 
            />
          </div>

          <div className="ap-form-row" style={{ marginTop: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.8rem', color: 'var(--gray-700)' }}>
                Cover Image (Top Banner)
              </label>
              <AdminImageUpload value={course.coverImageUrl} onChange={(url) => update(i, 'coverImageUrl', url)} subFolderName="courses" hint="16:9 Ratio (e.g. 800x450px)" aspectRatio="16/9" previewHeight={120} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.8rem', color: 'var(--gray-700)' }}>
                Inset Logo (Optional Circle)
              </label>
              <AdminImageUpload value={course.logoUrl} onChange={(url) => update(i, 'logoUrl', url)} subFolderName="courses" hint="1:1 Ratio (e.g. 150x150px)" aspectRatio="1/1" previewHeight={120} />
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <Field
              label="Badges (comma-separated, e.g. UPSC, OFFLINE, TAMIL)"
              value={(course.badges || []).join(', ')}
              onChange={v => update(i, 'badges', v.split(',').map(t => t.trim()).filter(Boolean))}
            />
            <Field label="Short Description (160-220 chars)" value={course.shortDescription} onChange={v => update(i, 'shortDescription', v)} type="textarea" placeholder="Comprehensive preparation..." />
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
            <div style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.85rem' }}>Features List (Max 5 recommended)</div>
            {(course.features || []).map((feat, fIdx) => (
              <div key={fIdx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                <div style={{ width: '140px' }}>
                  <select className="ap-input" value={feat.icon || 'CheckCircle'} onChange={e => updateFeature(i, fIdx, 'icon', e.target.value)}>
                    <option value="CheckCircle">Check (Default)</option>
                    <option value="BookOpen">Book</option>
                    <option value="FileText">Document</option>
                    <option value="UserCircle">Mentor</option>
                    <option value="Zap">Zap/Speed</option>
                    <option value="Bookmark">Bookmark</option>
                    <option value="Monitor">Monitor</option>
                    <option value="GraduationCap">Graduation</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <input className="ap-input" value={feat.text} onChange={e => updateFeature(i, fIdx, 'text', e.target.value)} placeholder="Feature text..." />
                </div>
                <button onClick={() => removeFeature(i, fIdx)} className="btn" style={{ padding: '0.5rem', color: '#dc2626', background: 'none' }} title="Remove Feature">
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
            ))}
            <button onClick={() => addFeature(i)} className="btn" style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.4rem 0.75rem', background: 'var(--white)', border: '1px solid var(--gray-300)' }}>
              <i className="fa-solid fa-plus" style={{ marginRight: '6px' }} /> Add Feature
            </button>
          </div>

          <div className="ap-form-row" style={{ marginTop: '1.5rem' }}>
            <Field label="Price (e.g. ₹ 25,000)" value={course.price} onChange={v => update(i, 'price', v)} placeholder="₹ 25,000" />
            <Field label="Price Label" value={course.priceLabel} onChange={v => update(i, 'priceLabel', v)} placeholder="Course Price" />
          </div>
        </div>
      ))}
      <button onClick={add} className="btn" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', background: 'var(--gray-100)', color: 'var(--gray-700)', border: '1px dashed var(--gray-300)', padding: '1rem' }}>
        <i className="fa-solid fa-plus" style={{ marginRight: '8px' }} /> Add Course
      </button>
    </div>
  )
}

/* ── About Editor ────────────────────────────────────────────────────────── */
function AboutEditor({ about, onChange }) {
  const update = (key, val) => onChange({ ...about, [key]: val })
  const updateBadge = (i, key, val) => {
    const badges = (about.badges || []).map((b, idx) => idx === i ? { ...b, [key]: val } : b)
    onChange({ ...about, badges })
  }
  return (
    <div>
      <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '1.25rem' }}>
        Edit the About / Introduction section on the homepage with image, text and badge numbers.
      </p>
      <div className="ap-card" style={{ marginBottom: '0.75rem', padding: '1rem' }}>
        <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.85rem' }}>📝 Text Content</div>
        <div className="ap-form-row">
          <Field label="Eyebrow Label" value={about.eyebrow || ''} onChange={v => update('eyebrow', v)} placeholder="About Nermai" />
          <Field label="Section Title"  value={about.title   || ''} onChange={v => update('title', v)} placeholder="Introduction to Nermai IAS" />
        </div>
        <Field label="Paragraph 1" value={about.para1 || ''} onChange={v => update('para1', v)} type="textarea" />
        <Field label="Paragraph 2" value={about.para2 || ''} onChange={v => update('para2', v)} type="textarea" />
      </div>
      <div className="ap-card" style={{ marginBottom: '0.75rem', padding: '1rem' }}>
        <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.85rem' }}>🖼️ Image</div>
        <Field label="Image URL" value={about.imageUrl || ''} onChange={v => update('imageUrl', v)} placeholder="https://..." />
        <Field label="Image Label (shown as overlay)" value={about.imageLabel || ''} onChange={v => update('imageLabel', v)} placeholder="187+ RESULTS · 2022–25" />
        {about.imageUrl && (
          <img src={about.imageUrl} alt="preview" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', marginTop: '0.75rem', border: '1px solid var(--gray-200)' }} onError={e => e.target.style.display='none'} />
        )}
      </div>
      <div className="ap-card" style={{ padding: '1rem' }}>
        <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.85rem' }}>🏅 Badge Numbers (e.g. 187+ Results)</div>
        {(about.badges || []).map((badge, i) => (
          <div key={i} className="ap-form-row" style={{ marginBottom: '0.5rem' }}>
            <Field label={`Badge ${i+1} Number`} value={badge.num}   onChange={v => updateBadge(i, 'num', v)} placeholder="187+" />
            <Field label={`Badge ${i+1} Label`}  value={badge.label} onChange={v => updateBadge(i, 'label', v)} placeholder="Results" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Events Editor ───────────────────────────────────────────────────────── */
function EventsEditor({ events = [], onChange }) {
  const update = (i, key, val) => onChange(events.map((e, idx) => idx === i ? { ...e, [key]: val } : e))
  const add = () => onChange([...events, { date: new Date().toISOString().split('T')[0], title: '', subtitle: '', url: '', visible: true }])
  const remove = (i) => onChange(events.filter((_, idx) => idx !== i))

  return (
    <div>
      <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '1.25rem' }}>
        Edit the Upcoming Events calendar displayed on the homepage.
      </p>
      {events.map((ev, i) => (
        <div key={i} className="ap-card" style={{ marginBottom: '0.75rem', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--maroon)' }}>
                Event {i + 1}
              </div>
              <Toggle label="Visible" checked={ev.visible !== false} onChange={v => update(i, 'visible', v)} />
            </div>
            <button onClick={() => remove(i)} className="btn" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px' }}>
              <i className="fa-solid fa-trash" style={{ marginRight: '6px' }} /> Delete
            </button>
          </div>
          <div className="ap-form-row">
            <Field label="Event Date" type="date" value={ev.date} onChange={v => update(i, 'date', v)} />
          </div>
          <Field label="Title" value={ev.title} onChange={v => update(i, 'title', v)} placeholder="Short NIQ" />
          <Field label="URL (Optional, turns title into a link)" value={ev.url} onChange={v => update(i, 'url', v)} placeholder="https://..." />
          <Field label="Subtitle / Description" value={ev.subtitle} onChange={v => update(i, 'subtitle', v)} type="textarea" placeholder="for construction of Selfie Point - Last date" />
        </div>
      ))}
      <button onClick={add} className="btn" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', background: 'var(--gray-100)', color: 'var(--gray-700)', border: '1px dashed var(--gray-300)' }}>
        <i className="fa-solid fa-plus" style={{ marginRight: '8px' }} /> Add Event
      </button>
    </div>
  )
}

/* ── Journey Steps Editor ────────────────────────────────────────────────── */
function JourneyStepsEditor({ steps = [], onChange }) {
  const update = (i, key, val) => onChange(steps.map((s, idx) => idx === i ? { ...s, [key]: val } : s))
  const add = () => onChange([...steps, { id: Date.now(), title: '', description: '', imageUrl: '' }])
  const remove = (i) => onChange(steps.filter((_, idx) => idx !== i))

  return (
    <div>
      <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '1.25rem' }}>
        Edit the "Your Journey with Nermai" flow diagram steps. You can upload an image for each step which will be shown on hover.
      </p>
      {steps.map((step, i) => (
        <div key={step.id || i} className="ap-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--gray-200)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--maroon)' }}>
              Flow Step {i + 1}
            </div>
            {steps.length > 1 && (
              <button onClick={() => remove(i)} className="btn" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px' }}>
                <i className="fa-solid fa-trash" style={{ marginRight: '6px' }} /> Delete
              </button>
            )}
          </div>
          <div className="ap-form-row">
            <div style={{ flex: 1 }}>
              <Field label="Title" value={step.title} onChange={v => update(i, 'title', v)} placeholder="e.g. உங்கள் இலக்கை தேர்வு செய்யுங்கள்" />
              <Field label="Description" value={step.description} onChange={v => update(i, 'description', v)} type="textarea" placeholder="e.g. Choose from TNPSC, UPSC..." />
            </div>
            <div style={{ width: '320px', flexShrink: 0 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.8rem', color: 'var(--gray-700)' }}>
                Step Image (Hover Reveal)
              </label>
              <AdminImageUpload
                value={step.imageUrl || ''}
                onChange={(url) => update(i, 'imageUrl', url)}
                subFolderName="journey_steps"
                hint="Recommended: 800x600px (Desktop/Mobile). 4:3 Ratio."
                aspectRatio="4/3"
                previewHeight={180}
              />
            </div>
          </div>
        </div>
      ))}
      {steps.length < 5 && (
        <button onClick={add} className="btn" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', background: 'var(--gray-100)', color: 'var(--gray-700)', border: '1px dashed var(--gray-300)' }}>
          <i className="fa-solid fa-plus" style={{ marginRight: '8px' }} /> Add Step
        </button>
      )}
    </div>
  )
}

/* ── Ticker Editor ───────────────────────────────────────────────────────── */
function TickerEditor({ ticker = { visible: true, items: [] }, onChange }) {
  const updateItems = (newItems) => onChange({ ...ticker, items: newItems })
  const updateVis = (v) => onChange({ ...ticker, visible: v })
  
  const updateItem = (i, key, val) => {
    const next = ticker.items.map((it, idx) => idx === i ? { ...it, [key]: val } : it)
    updateItems(next)
  }
  const add = () => updateItems([...ticker.items, { text: '', link: '' }])
  const remove = (i) => updateItems(ticker.items.filter((_, idx) => idx !== i))

  const updateSpeed = (v) => onChange({ ...ticker, speed: Number(v) || 35 })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', margin: 0 }}>
          Manage the running ticker that appears above the Hero banner.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-600)' }}>Speed (Seconds):</label>
            <input 
              type="number" 
              className="ap-input" 
              style={{ width: '80px', padding: '0.25rem 0.5rem', height: 'auto' }} 
              value={ticker.speed || 35} 
              onChange={e => updateSpeed(e.target.value)} 
              min="5" 
              max="150" 
            />
          </div>
          <Toggle label="Enable Ticker on Homepage" checked={ticker.visible !== false} onChange={updateVis} />
        </div>
      </div>
      
      {ticker.items.map((item, i) => (
        <div key={i} className="ap-card" style={{ marginBottom: '0.75rem', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--maroon)' }}>
              Message {i + 1}
            </div>
            <button onClick={() => remove(i)} className="btn" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px' }}>
              <i className="fa-solid fa-trash" style={{ marginRight: '6px' }} /> Delete
            </button>
          </div>
          <div className="ap-form-row">
            <Field label="Scrolling Text" value={item.text} onChange={v => updateItem(i, 'text', v)} placeholder="e.g. Admission Open for GS 2027" />
            <Field label="Link URL (Optional)" value={item.link} onChange={v => updateItem(i, 'link', v)} placeholder="https://... or /contact" />
          </div>
        </div>
      ))}
      <button onClick={add} className="btn" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', background: 'var(--gray-100)', color: 'var(--gray-700)', border: '1px dashed var(--gray-300)' }}>
        <i className="fa-solid fa-plus" style={{ marginRight: '8px' }} /> Add Message
      </button>
    </div>
  )
}


/* ── Main HomeContentSection ─────────────────────────────────────────────── */
const TABS = [
  { id: 'visibility', icon: 'fa-eye',           label: 'Visibility' },
  { id: 'ticker',     icon: 'fa-bullhorn',      label: 'Top Ticker' },
  { id: 'stats',      icon: 'fa-chart-simple',  label: 'Stats Bar' },
  { id: 'features',   icon: 'fa-bolt',          label: 'Features' },
  { id: 'courses',    icon: 'fa-book-bookmark', label: 'Courses' },
  { id: 'events',     icon: 'fa-calendar-days', label: 'Events' },
  { id: 'about',      icon: 'fa-address-card',  label: 'About' },
  { id: 'journeySteps', icon: 'fa-stairs',      label: 'Your Journey' }
]

const DEFAULTS = {
  visibility: { stats: true, about: true, features: true, courses: true, steps: true, results: true, gallery: true, testimonials: true, faq: true, events: true, toppers: true },
  ticker: { visible: true, speed: 35, items: [] },
  events: [
    { date: '2026-08-31', title: 'Short NIQ', subtitle: 'for construction of Selfie Point - Last date', url: '', visible: true },
  ],
  stats: [
    { num: '2400+', label: 'Students',  sublabel: 'Trained Students' },
    { num: '14+',   label: 'Years',     sublabel: 'Years of Experience' },
    { num: '28+',   label: 'Batches',   sublabel: 'Successful Batches' },
    { num: '98%',   label: 'Success',   sublabel: 'Success Rate' },
  ],
  features: [
    { icon: 'fa-solid fa-graduation-cap', title: 'Structured Classes',  desc: 'Daily scheduled classes with expert faculty.' },
    { icon: 'fa-solid fa-book-open',      title: 'Study Materials',     desc: 'Comprehensive notes and question banks.' },
    { icon: 'fa-solid fa-file-pen',       title: 'Mock Tests',          desc: 'Weekly full-length tests with analysis.' },
    { icon: 'fa-solid fa-chart-line',     title: 'Progress Tracking',   desc: 'Personal performance dashboard.' },
    { icon: 'fa-regular fa-calendar-check', title: 'Class Schedule',    desc: 'Flexible batch timings.' },
    { icon: 'fa-solid fa-user-tie',       title: 'Academic Guidance',   desc: 'One-on-one mentoring sessions.' },
  ],
  courseCategories: [
    { id: 'all', name: 'All Courses', shortName: 'ALL', iconUrl: '', isVisible: true },
    { id: 'upsc', name: 'UPSC & Civil Services', shortName: 'UPSC', iconUrl: '', isVisible: true },
    { id: 'tnpsc', name: 'TNPSC & State Exams', shortName: 'TNPSC', iconUrl: '', isVisible: true },
    { id: 'banking', name: 'Banking Exams', shortName: 'Banking', iconUrl: '', isVisible: true },
    { id: 'ssc', name: 'SSC & Central Govt.', shortName: 'SSC', iconUrl: '', isVisible: true },
    { id: 'others', name: 'Other Courses', shortName: 'Others', iconUrl: '', isVisible: true },
  ],
  coursesConfig: {
    sectionHeading: 'Courses in NERMAI IAS Puducherry',
    highlightedWord: 'NERMAI IAS Puducherry',
    subHeading: 'Get expert coaching for Bank, Insurance, SSC and Railways exams at the best coaching institute in Puducherry from expert faculty and regular mentor sessions'
  },
  courses: [
    {
      id: 'bank-offline',
      title: 'Bank Offline Course',
      categoryId: 'banking',
      coverImageUrl: '',
      logoUrl: '',
      badges: ['BANK', 'OFFLINE', 'TAMIL'],
      shortDescription: 'Prepare for major Bank/Insurance exams for all stages of exam from our expert faculty & mentors',
      features: [
        { text: '1000+ hours offline coaching', icon: 'Monitor' },
        { text: '100+ Prelims/Mains mock tests', icon: 'CheckCircle' },
        { text: '5+ Bank Preparatory Books', icon: 'BookOpen' },
        { text: 'Regular mentor sessions', icon: 'GraduationCap' }
      ],
      price: '₹ 24,000',
      priceLabel: 'Course Price',
      isActive: true,
    },
    {
      id: 'ssc-offline',
      title: 'SSC Offline Course',
      categoryId: 'ssc',
      coverImageUrl: '',
      logoUrl: '',
      badges: ['SSC', 'OFFLINE', 'TAMIL'],
      shortDescription: 'Prepare for major SSC & Central Govt. exams for all stages of exam from our expert faculty & mentors',
      features: [
        { text: '1000+ hours offline coaching', icon: 'Monitor' },
        { text: '100+ Prelims/Mains mock tests', icon: 'CheckCircle' },
        { text: '5+ Bank Preparatory Books', icon: 'BookOpen' },
        { text: 'Regular mentor sessions', icon: 'GraduationCap' }
      ],
      price: '₹ 25,000',
      priceLabel: 'Course Price',
      isActive: true,
    },
    {
      id: 'railways-offline',
      title: 'Railways Offline Course',
      categoryId: 'all',
      coverImageUrl: '',
      logoUrl: '',
      badges: ['RAILWAYS', 'OFFLINE', 'TAMIL'],
      shortDescription: 'Prepare for major Railways & State Govt. exams for all stages of exam from our expert faculty & mentors',
      features: [
        { text: '1000+ hours offline coaching', icon: 'Monitor' },
        { text: '30+ RRB exam full mock tests', icon: 'CheckCircle' },
        { text: 'RRB exam study materials', icon: 'BookOpen' },
        { text: 'Regular mentor sessions', icon: 'GraduationCap' }
      ],
      price: '₹ 23,000',
      priceLabel: 'Course Price',
      isActive: true,
    },
    {
      id: 'tnpsc-offline',
      title: 'TNPSC Offline Course',
      categoryId: 'tnpsc',
      coverImageUrl: '',
      logoUrl: '',
      badges: ['TNPSC', 'OFFLINE', 'TAMIL'],
      shortDescription: 'Complete preparation for Tamil Nadu Public Service Commission exams.',
      features: [
        { text: '800+ hours offline coaching', icon: 'Monitor' },
        { text: 'Weekly mock tests', icon: 'CheckCircle' },
        { text: 'Tamil medium materials', icon: 'BookOpen' },
        { text: 'Regular mentor sessions', icon: 'GraduationCap' }
      ],
      price: '₹ 20,000',
      priceLabel: 'Course Price',
      isActive: true,
    },
    {
      id: 'tnusrb-offline',
      title: 'TNUSRB SI/PC Offline Course',
      categoryId: 'tnpsc',
      coverImageUrl: '',
      logoUrl: '',
      badges: ['TNUSRB SI PC', 'OFFLINE', 'TAMIL'],
      shortDescription: 'Prepare for major Police & State Govt. exams for all stages of exam from our expert faculty & mentors',
      features: [
        { text: '800+ hours offline coaching', icon: 'Monitor' },
        { text: 'Weekly mock tests', icon: 'CheckCircle' },
        { text: 'Study materials', icon: 'BookOpen' },
        { text: 'Regular mentor sessions', icon: 'GraduationCap' }
      ],
      price: '₹ 18,000',
      priceLabel: 'Course Price',
      isActive: true,
    },
    {
      id: 'tntet-hybrid',
      title: 'TNTET Online Hybrid Coaching Course',
      categoryId: 'all',
      coverImageUrl: '',
      logoUrl: '',
      badges: ['TN TET', 'HYBRID', 'TAMIL'],
      shortDescription: 'Prepare for TNTET exams for all stages of exam from our expert faculty & mentors',
      features: [
        { text: '500+ hours coaching', icon: 'Monitor' },
        { text: 'Weekly mock tests', icon: 'CheckCircle' },
        { text: 'Study materials', icon: 'BookOpen' },
        { text: 'Regular mentor sessions', icon: 'GraduationCap' }
      ],
      price: '₹ 15,000',
      priceLabel: 'Course Price',
      isActive: true,
    }
  ],
  about: {
    eyebrow: 'About Nermai', title: 'Introduction to Nermai IAS',
    para1: 'The very basic purpose of starting this academy is that the civil services exam is considered to be the highest and most prestigious job of the country.',
    para2: 'A handful of youth from Puducherry started NERMAI IAS ACADEMY to make quality coaching accessible to all aspirants.',
    imageUrl: '', imageLabel: '187+ RESULTS · 2022–25',
    badges: [{ num: '187+', label: 'Results' }, { num: '14+', label: 'Years' }, { num: '2400+', label: 'Students' }]
  },
  journeySteps: [
    { id: 1, title: 'உங்கள் இலக்கை தேர்வு செய்யுங்கள்', description: 'Choose from TNPSC, UPSC, Police or Banking on our Website.', imageUrl: '' },
    { id: 2, title: 'பயிற்சியை தேர்வு செய்யுங்கள்', description: 'Find the right batch and course structure for your needs.', imageUrl: '' },
    { id: 3, title: 'Join Class Platform', description: 'Redirect to our dedicated learning management portal.', imageUrl: '' },
    { id: 4, title: 'பயிற்சி + தேர்வுகள்', description: 'Attend classes, take mock tests, and track your progress.', imageUrl: '' },
    { id: 5, title: 'இலக்கை அடையுங்கள்', description: 'Clear the exam and become a Government Officer.', imageUrl: '' },
  ]
}

export default function HomeContentSection({ toast }) {
  const [activeTab, setActiveTab] = useState('visibility')
  const [content, setContent] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s.homeContent) {
        setContent(prev => ({
          visibility: s.homeContent.visibility || prev.visibility,
          ticker:     s.homeContent.ticker     || prev.ticker,
          events:     s.homeContent.events     || prev.events,
          stats:      s.homeContent.stats      || prev.stats,
          features:   s.homeContent.features   || prev.features,
          courseCategories: s.homeContent.courseCategories || prev.courseCategories,
          coursesConfig: s.homeContent.coursesConfig || prev.coursesConfig,
          courses:    s.homeContent.courses    || prev.courses,
          about:      { ...prev.about, ...s.homeContent.about },
          journeySteps: s.homeContent.journeySteps || prev.journeySteps,
        }))
      }
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await fbFirestore.updateSettings({ homeContent: content })
      toast.success('Home content saved! Please refresh the page.')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ padding: '2rem', color: 'var(--gray-400)' }}><i className="fa-solid fa-spinner fa-spin" /> Loading...</div>

  return (
    <div>
      <h2 className="ap-section-title">
        <i className="fa-solid fa-house" /> Home Page Content
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
        Edit all homepage sections. Click <strong>Save Changes</strong> to publish — changes appear live after page refresh.
      </p>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1.5rem', borderBottom: '2px solid var(--gray-200)', paddingBottom: '0.75rem' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 0,
              border: activeTab === tab.id ? '2px solid var(--maroon)' : '2px solid var(--gray-200)',
              background: activeTab === tab.id ? 'var(--maroon)' : 'var(--white)',
              color: activeTab === tab.id ? 'var(--white)' : 'var(--gray-600)',
              fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              transition: 'all 0.15s'
            }}
          >
            <i className={`fa-solid ${tab.icon}`} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'visibility' && <VisibilityEditor visibility={content.visibility} onChange={v => setContent(c => ({ ...c, visibility: v }))} />}
      {activeTab === 'ticker'   && <TickerEditor   ticker={content.ticker}       onChange={v => setContent(c => ({ ...c, ticker: v }))} />}
      {activeTab === 'stats'    && <StatsEditor    stats={content.stats}         onChange={v => setContent(c => ({ ...c, stats: v }))} />}
      {activeTab === 'features' && <FeaturesEditor features={content.features}   onChange={v => setContent(c => ({ ...c, features: v }))} />}
      {activeTab === 'courseCategories' && <CourseCategoriesEditor categories={content.courseCategories} onChange={v => setContent(c => ({ ...c, courseCategories: v }))} />}
      {activeTab === 'courses'  && <CoursesEditor  courses={content.courses} config={content.coursesConfig} categories={content.courseCategories} onChangeCourses={v => setContent(c => ({ ...c, courses: v }))} onChangeConfig={v => setContent(c => ({ ...c, coursesConfig: v }))} onChangeCategories={v => setContent(c => ({ ...c, courseCategories: v }))} />}
      {activeTab === 'events'   && <EventsEditor   events={content.events}       onChange={v => setContent(c => ({ ...c, events: v }))} />}
      {activeTab === 'about'    && <AboutEditor    about={content.about}         onChange={v => setContent(c => ({ ...c, about: v }))} />}
      {activeTab === 'journeySteps' && <JourneyStepsEditor steps={content.journeySteps} onChange={v => setContent(c => ({ ...c, journeySteps: v }))} />}

      {/* Save button */}
      <div style={{ position: 'sticky', bottom: '1rem', zIndex: 10, marginTop: '1.5rem' }}>
        <button
          className="ap-btn ap-btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
        >
          {saving
            ? <><i className="fa-solid fa-spinner fa-spin" /> Saving...</>
            : <><i className="fa-solid fa-floppy-disk" /> Save All Changes</>
          }
        </button>
      </div>
    </div>
  )
}
