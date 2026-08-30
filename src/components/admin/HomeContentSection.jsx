import { useState, useEffect } from 'react'
import { fbFirestore } from '../../firebase/firestore'

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
          <Field label="Tamil Sub-Label" value={stat.sublabel} onChange={v => update(i, 'sublabel', v)} placeholder="பயிற்சி பெற்றவர்கள்" />
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

/* ── Courses Editor ──────────────────────────────────────────────────────── */
function CoursesEditor({ courses, onChange }) {
  const update = (i, key, val) => onChange(courses.map((c, idx) => idx === i ? { ...c, [key]: val } : c))
  return (
    <div>
      <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '1.25rem' }}>
        Edit the 6 course cards shown on the homepage. Tags are comma-separated. Slug must be URL-safe (no spaces).
      </p>
      {courses.map((course, i) => (
        <div key={i} className="ap-card" style={{ marginBottom: '0.75rem', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--maroon)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{course.icon}</span> Course {i + 1}: {course.name}
              </div>
              <Toggle label="Visible" checked={course.visible !== false} onChange={v => update(i, 'visible', v)} />
            </div>
            {courses.length > 1 && (
              <button onClick={() => remove(i)} className="btn" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px' }}>
                <i className="fa-solid fa-trash" style={{ marginRight: '6px' }} /> Delete
              </button>
            )}
          </div>
          <div className="ap-form-row">
            <Field label="Emoji Icon" value={course.icon}    onChange={v => update(i, 'icon', v)} placeholder="🏛️" />
            <Field label="URL Slug"   value={course.slug}    onChange={v => update(i, 'slug', v)} placeholder="upsc" />
          </div>
          <div className="ap-form-row">
            <Field label="Course Name" value={course.name}    onChange={v => update(i, 'name', v)} placeholder="UPSC Civil Service" />
            <Field label="Sub Name"    value={course.subname} onChange={v => update(i, 'subname', v)} placeholder="IAS / IPS / IFS" />
          </div>
          <Field label="Description" value={course.desc} onChange={v => update(i, 'desc', v)} type="textarea" />
          <Field
            label="Tags (comma-separated)"
            value={(course.tags || []).join(', ')}
            onChange={v => update(i, 'tags', v.split(',').map(t => t.trim()).filter(Boolean))}
            placeholder="IAS, IPS, IFS"
          />
        </div>
      ))}
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

/* ── Steps Editor ────────────────────────────────────────────────────────── */
function StepsEditor({ steps, onChange }) {
  const update = (i, key, val) => onChange(steps.map((s, idx) => idx === i ? { ...s, [key]: val } : s))
  return (
    <div>
      <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '1.25rem' }}>
        Edit the "How Nermai Works" journey steps (shown with numbered circles and connecting line).
      </p>
      {steps.map((step, i) => (
        <div key={i} className="ap-card" style={{ marginBottom: '0.75rem', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--maroon)' }}>
                Step {i + 1}
              </div>
              <Toggle label="Visible" checked={step.visible !== false} onChange={v => update(i, 'visible', v)} />
            </div>
            {steps.length > 1 && (
              <button onClick={() => remove(i)} className="btn" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px' }}>
                <i className="fa-solid fa-trash" style={{ marginRight: '6px' }} /> Delete
              </button>
            )}
          </div>
          <div className="ap-form-row">
            <Field label="Step Number" value={step.num}   onChange={v => update(i, 'num', v)} placeholder="01" />
            <Field label="Title"       value={step.title} onChange={v => update(i, 'title', v)} placeholder="Select your goal..." />
          </div>
          <Field label="Description" value={step.desc} onChange={v => update(i, 'desc', v)} type="textarea" />
        </div>
      ))}
    </div>
  )
}

/* ── Main HomeContentSection ─────────────────────────────────────────────── */
const TABS = [
  { id: 'visibility', icon: 'fa-eye',           label: 'Visibility' },
  { id: 'stats',      icon: 'fa-chart-simple',  label: 'Stats Bar' },
  { id: 'features',   icon: 'fa-bolt',          label: 'Features' },
  { id: 'courses',    icon: 'fa-book-bookmark', label: 'Courses' },
  { id: 'events',     icon: 'fa-calendar-days', label: 'Events' },
  { id: 'about',      icon: 'fa-address-card',  label: 'About' },
  { id: 'steps',      icon: 'fa-stairs',        label: 'How It Works' }
]

const DEFAULTS = {
  visibility: { stats: true, about: true, features: true, courses: true, steps: true, results: true, gallery: true, testimonials: true, faq: true, events: true },
  events: [
    { date: '2026-08-31', title: 'Short NIQ', subtitle: 'for construction of Selfie Point - Last date', url: '', visible: true },
  ],
  stats: [
    { num: '2400+', label: 'Students',  sublabel: 'பயிற்சி பெற்ற மாணவர்கள்' },
    { num: '14+',   label: 'Years',     sublabel: 'ஆண்டுகள் அனுபவம்' },
    { num: '28+',   label: 'Batches',   sublabel: 'வெற்றிகரமான தொகுதிகள்' },
    { num: '98%',   label: 'Success',   sublabel: 'வெற்றி விகிதம்' },
  ],
  features: [
    { icon: 'fa-solid fa-graduation-cap', title: 'Structured Classes',  desc: 'Daily scheduled classes with expert faculty.' },
    { icon: 'fa-solid fa-book-open',      title: 'Study Materials',     desc: 'Comprehensive notes and question banks.' },
    { icon: 'fa-solid fa-file-pen',       title: 'Mock Tests',          desc: 'Weekly full-length tests with analysis.' },
    { icon: 'fa-solid fa-chart-line',     title: 'Progress Tracking',   desc: 'Personal performance dashboard.' },
    { icon: 'fa-regular fa-calendar-check', title: 'Class Schedule',    desc: 'Flexible batch timings.' },
    { icon: 'fa-solid fa-user-tie',       title: 'Academic Guidance',   desc: 'One-on-one mentoring sessions.' },
  ],
  courses: [
    { icon: '🏛️', name: 'UPSC Civil Service',  subname: 'IAS / IPS / IFS',               desc: "India's most prestigious exam.", tags: ['CIVIL SERVICES','IAS','IPS','IFS'],           slug: 'upsc' },
    { icon: '📋', name: 'TNPSC / Railways',    subname: 'GROUP I · II · IV · VAO',         desc: 'Tamil Nadu Public Service Commission.', tags: ['GROUP I','GROUP II / IIA','GROUP IV','VAO'], slug: 'tnpsc' },
    { icon: '📁', name: 'UDC / LDC / VAO',     subname: 'CLERICAL & REVENUE SERVICES',     desc: 'Upper Division Clerk, LDC, VAO.', tags: ['UDC','LDC','VAO'],                            slug: 'udc-ldc' },
    { icon: '🏦', name: 'Banking',              subname: 'IBPS · SBI · RBI',                desc: 'Banking exams coaching.', tags: ['IBPS PO','IBPS CLERK','SBI PO','RBI GRADE B'],     slug: 'banking' },
    { icon: '🌿', name: 'Puducherry Exam',      subname: 'UDC · LDC · DT · SI',             desc: 'Puducherry Government recruitment.', tags: ['DEPUTY TAHSILDAR','SUB-INSPECTOR','UDC','LDC'], slug: 'puducherry' },
    { icon: '⚖️', name: 'SSC / PC / DT / SI',  subname: 'CENTRAL & STATE COMBINED',        desc: 'SSC CGL, CHSL, Police exams.', tags: ['SSC CGL','SSC CHSL','POLICE CONSTABLE','SUB-INSPECTOR'], slug: 'ssc' },
  ],
  about: {
    eyebrow: 'About Nermai', title: 'Introduction to Nermai IAS',
    para1: 'The very basic purpose of starting this academy is that the civil services exam is considered to be the highest and most prestigious job of the country.',
    para2: 'A handful of youth from Puducherry started NERMAI IAS ACADEMY to make quality coaching accessible to all aspirants.',
    imageUrl: '', imageLabel: '187+ RESULTS · 2022–25',
    badges: [{ num: '187+', label: 'Results' }, { num: '14+', label: 'Years' }, { num: '2400+', label: 'Students' }]
  },
  steps: [
    { num: '01', title: 'உங்கள் இலக்கை தேர்வு செய்யுங்கள்', desc: 'Choose from TNPSC, UPSC, Police or Banking.' },
    { num: '02', title: 'பயிற்சியை தேர்வு செய்யுங்கள்',        desc: 'Find the right batch and course structure.' },
    { num: '03', title: 'Join Class Platform',                    desc: 'Redirect to our LMS portal.' },
    { num: '04', title: 'பயிற்சி + தேர்வுகள்',                   desc: 'Classes, mock tests, progress tracking.' },
    { num: '05', title: 'இலக்கை அடையுங்கள்',                    desc: 'Clear the exam and become a Government Officer.' },
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
          events:   s.homeContent.events   || prev.events,
          stats:    s.homeContent.stats    || prev.stats,
          features: s.homeContent.features || prev.features,
          courses:  s.homeContent.courses  || prev.courses,
          about:    { ...prev.about, ...s.homeContent.about },
          steps:    s.homeContent.steps    || prev.steps,
        }))
      }
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await fbFirestore.updateSettings({ homeContent: content })
      toast.success('Home content சேமிக்கப்பட்டது! Page refresh செய்யவும்.')
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
      {activeTab === 'stats'    && <StatsEditor    stats={content.stats}       onChange={v => setContent(c => ({ ...c, stats: v }))} />}
      {activeTab === 'features' && <FeaturesEditor features={content.features} onChange={v => setContent(c => ({ ...c, features: v }))} />}
      {activeTab === 'courses'  && <CoursesEditor  courses={content.courses}   onChange={v => setContent(c => ({ ...c, courses: v }))} />}
      {activeTab === 'events'   && <EventsEditor   events={content.events}     onChange={v => setContent(c => ({ ...c, events: v }))} />}
      {activeTab === 'about'    && <AboutEditor    about={content.about}       onChange={v => setContent(c => ({ ...c, about: v }))} />}
      {activeTab === 'steps'    && <StepsEditor    steps={content.steps}       onChange={v => setContent(c => ({ ...c, steps: v }))} />}

      {/* Save button */}
      <div style={{ position: 'sticky', bottom: '1rem', zIndex: 10, marginTop: '1.5rem' }}>
        <button
          className="ap-btn ap-btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
        >
          {saving
            ? <><i className="fa-solid fa-spinner fa-spin" /> சேமிக்கிறது...</>
            : <><i className="fa-solid fa-floppy-disk" /> Save All Changes</>
          }
        </button>
      </div>
    </div>
  )
}
