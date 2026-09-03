import { useState, useEffect } from 'react'
import { fbFirestore } from '../../firebase/firestore'

const DEFAULT_FAQS = [
  {
    id: 'general',
    topic: 'General',
    items: [
      { q: 'What exams does Nermai provide training for?', a: 'We provide comprehensive training for competitive exams like TNPSC, UPSC Civil Services, TN Police, Banking, Puducherry Government Exams, and SSC.' },
      { q: 'Are the classes online or offline?', a: 'Nermai provides both online and offline learning experiences.' },
    ]
  }
]

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

export default function FaqAdminSection({ toast }) {
  const [topics, setTopics] = useState(DEFAULT_FAQS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedTopic, setExpandedTopic] = useState(null)

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s.faqs && s.faqs.length > 0) setTopics(s.faqs)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const updateTopic = (i, key, val) => setTopics(t => t.map((topic, idx) => idx === i ? { ...topic, [key]: val } : topic))
  const addTopic = () => {
    const newTopics = [...topics, { id: 'topic-' + Date.now(), topic: '', items: [] }]
    setTopics(newTopics)
    setExpandedTopic(newTopics.length - 1)
  }
  const removeTopic = (i) => setTopics(t => t.filter((_, idx) => idx !== i))

  const addItem = (ti) => {
    setTopics(t => t.map((topic, idx) => idx === ti
      ? { ...topic, items: [...(topic.items || []), { q: '', a: '' }] }
      : topic
    ))
  }
  const updateItem = (ti, ii, key, val) => {
    setTopics(t => t.map((topic, idx) => idx !== ti ? topic : {
      ...topic,
      items: topic.items.map((item, iidx) => iidx !== ii ? item : { ...item, [key]: val })
    }))
  }
  const removeItem = (ti, ii) => {
    setTopics(t => t.map((topic, idx) => idx !== ti ? topic : {
      ...topic,
      items: topic.items.filter((_, iidx) => iidx !== ii)
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fbFirestore.updateSettings({ faqs: topics })
      toast.success('FAQ content saved successfully!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ padding: '2rem', color: 'var(--gray-400)' }}><i className="fa-solid fa-spinner fa-spin" /> Loading...</div>

  return (
    <div>
      <h2 className="ap-section-title"><i className="fa-solid fa-circle-question" /> FAQ Manager</h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
        Manage FAQ topics and questions shown on the public <strong>/faq</strong> page. Topics appear as sidebar tabs.
      </p>

      {topics.map((topic, ti) => (
        <div key={topic.id || ti} className="ap-card" style={{ marginBottom: '1rem' }}>
          {/* Topic Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', cursor: 'pointer' }}
            onClick={() => setExpandedTopic(expandedTopic === ti ? null : ti)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <i className={`fa-solid fa-chevron-${expandedTopic === ti ? 'up' : 'down'}`} style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }} />
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--maroon)' }}>
                {topic.topic || `Topic ${ti + 1}`}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                {(topic.items || []).length} question{(topic.items || []).length !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={e => { e.stopPropagation(); removeTopic(ti) }}
              className="btn"
              style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px' }}
            >
              <i className="fa-solid fa-trash" style={{ marginRight: '6px' }} /> Delete Topic
            </button>
          </div>

          {/* Topic Body */}
          {expandedTopic === ti && (
            <div style={{ borderTop: '1px solid var(--gray-200)', padding: '1rem' }}>
              <Field label="Topic Name (Sidebar Label)" value={topic.topic} onChange={v => updateTopic(ti, 'topic', v)} placeholder="e.g. General, Courses, UPSC" />

              <div style={{ marginTop: '1.25rem', marginBottom: '1rem', fontWeight: 700, fontSize: '0.8rem', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Questions ({(topic.items || []).length})
              </div>

              {(topic.items || []).map((item, ii) => (
                <div key={ii} className="ap-card" style={{ marginBottom: '0.75rem', padding: '1rem', border: '1px solid var(--gray-200)', boxShadow: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--maroon)' }}>Q{ii + 1}</span>
                    <button
                      onClick={() => removeItem(ti, ii)}
                      className="btn"
                      style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '4px' }}
                    >
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                  <Field label="Question" value={item.q} onChange={v => updateItem(ti, ii, 'q', v)} placeholder="What is...?" />
                  <Field label="Answer" value={item.a} onChange={v => updateItem(ti, ii, 'a', v)} type="textarea" rows={3} placeholder="The answer..." />
                </div>
              ))}

              <button
                onClick={() => addItem(ti)}
                className="btn"
                style={{ width: '100%', justifyContent: 'center', background: 'var(--gray-100)', color: 'var(--gray-700)', border: '1px dashed var(--gray-300)', padding: '0.75rem', marginTop: '0.5rem' }}
              >
                <i className="fa-solid fa-plus" style={{ marginRight: '8px' }} /> Add Question
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={addTopic}
        className="btn"
        style={{ width: '100%', justifyContent: 'center', background: 'var(--gray-100)', color: 'var(--gray-700)', border: '2px dashed var(--gray-300)', padding: '1rem', marginBottom: '1.5rem', fontWeight: 700 }}
      >
        <i className="fa-solid fa-plus" style={{ marginRight: '8px' }} /> Add New Topic
      </button>

      {/* Save button */}
      <div style={{ position: 'sticky', bottom: '1rem', zIndex: 10 }}>
        <button
          className="ap-btn ap-btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
        >
          {saving
            ? <><i className="fa-solid fa-spinner fa-spin" /> Saving...</>
            : <><i className="fa-solid fa-floppy-disk" /> Save FAQ Changes</>
          }
        </button>
      </div>
    </div>
  )
}
