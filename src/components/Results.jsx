import { useState, useEffect } from 'react'
import { fbFirestore } from '../firebase/firestore'

const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'All Results', slug: 'all', color: '#7b1b2e' }
]

function CategoryTabs({ categories, active, onChange }) {
  return (
    <div className="results-tabs" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', borderBottom: '2px solid var(--gray-200)', paddingBottom: '1rem' }}>
      <button
        onClick={() => onChange('all')}
        className={`results-tab${active === 'all' ? ' active' : ''}`}
        style={{
          padding: '0.5rem 1.25rem',
          border: active === 'all' ? '2px solid var(--maroon)' : '1px solid var(--gray-200)',
          background: active === 'all' ? 'var(--maroon)' : 'var(--white)',
          color: active === 'all' ? 'var(--white)' : 'var(--gray-600)',
          fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', borderRadius: 0,
          fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
          transition: 'all 0.15s'
        }}
      >
        ALL RESULTS
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.slug)}
          className={`results-tab${active === cat.slug ? ' active' : ''}`}
          style={{
            padding: '0.5rem 1.25rem',
            border: active === cat.slug ? `2px solid ${cat.color}` : '1px solid var(--gray-200)',
            background: active === cat.slug ? cat.color : 'var(--white)',
            color: active === cat.slug ? 'var(--white)' : 'var(--gray-600)',
            fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', borderRadius: 0,
            fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
            transition: 'all 0.15s'
          }}
        >
          {cat.name.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

function ImageCard({ img }) {
  const [err, setErr] = useState(false)
  if (err) return null
  return (
    <div className="results-img-card reveal" style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/3', background: 'var(--gray-100)', borderRadius: '4px' }}>
      <img
        src={img.url}
        alt={img.caption || 'Result'}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }}
        onError={() => setErr(true)}
        className="results-img"
      />
      {img.caption && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(10,0,0,0.75)', color: '#fff', fontSize: '0.72rem', padding: '0.4rem 0.6rem', lineHeight: 1.4 }}>
          {img.caption}
        </div>
      )}
    </div>
  )
}

export default function Results() {
  const [categories, setCategories] = useState([])
  const [images, setImages]         = useState([])
  const [activeTab, setActiveTab]   = useState('all')
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      fbFirestore.getResultCategories(),
      fbFirestore.getGallery()
    ]).then(([cats, imgs]) => {
      setCategories(cats)
      setImages(imgs)
      setLoading(false)
    })
  }, [])

  const filtered = activeTab === 'all' ? images : images.filter(img => img.category === activeTab)

  if (loading) return null

  // No images uploaded yet — don't render the section
  if (images.length === 0) return null

  return (
    <section className="section" id="results" style={{ background: 'var(--cream)' }}>
      <div className="container">
        <div className="section-header reveal" style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <span className="eyebrow">OUR RESULTS</span>
          <h2 className="section-title">Success Stories & Results</h2>
          <p className="section-desc">
            Nermai IAS Academy-ல் படித்து வெற்றி பெற்ற மாணவர்களின் சான்றுகள்.
          </p>
        </div>

        {/* Category tabs — shown only if there are categories */}
        {categories.length > 0 && (
          <CategoryTabs categories={categories} active={activeTab} onChange={setActiveTab} />
        )}

        {/* Count badge */}
        <div style={{ marginBottom: '1.25rem', fontSize: '0.78rem', color: 'var(--gray-400)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
          SHOWING {filtered.length} RESULT{filtered.length !== 1 ? 'S' : ''}
          {activeTab !== 'all' && ` · ${categories.find(c => c.slug === activeTab)?.name?.toUpperCase() || activeTab.toUpperCase()}`}
        </div>

        {/* Gallery grid */}
        {filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {filtered.map(img => <ImageCard key={img.id} img={img} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>
            No results in this category yet.
          </div>
        )}
      </div>

      <style>{`
        .results-img-card:hover .results-img { transform: scale(1.04); }
      `}</style>
    </section>
  )
}
