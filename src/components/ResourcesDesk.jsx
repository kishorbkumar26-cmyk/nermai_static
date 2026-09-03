import React, { useState, useEffect, useMemo } from 'react'
import { fbFirestore } from '../firebase/firestore'

export default function ResourcesDesk({ isWidget = false }) {
  const [resources, setResources] = useState([])
  const [activeTab, setActiveTab] = useState('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = fbFirestore.onResourcesChanged(data => {
      setResources(data || [])
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const categories = useMemo(() => {
    const cats = new Set(resources.map(r => r.category))
    return ['ALL', ...Array.from(cats).filter(Boolean).sort()]
  }, [resources])

  const filtered = useMemo(() => {
    let list = resources
    if (activeTab !== 'ALL') {
      list = list.filter(r => r.category === activeTab)
    }
    return [...list].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || new Date(b.date || 0) - new Date(a.date || 0))
  }, [resources, activeTab])

  if (!loading && resources.length === 0) return null

  const Wrapper = isWidget ? 'div' : 'section'

  return (
    <Wrapper className={!isWidget ? "resource-desk-section" : ""} style={{ background: 'var(--ink)', color: 'var(--cream)', padding: isWidget ? '3rem 2rem' : '6rem 1.5rem', fontFamily: 'var(--font-mono)', borderRadius: isWidget ? 'var(--radius-lg)' : '0' }}>
      <div className={!isWidget ? "container-narrow" : ""}>
        
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--cream)' }}>
            FREE LEARNING RESOURCES
          </h2>
          <div style={{ width: '280px', height: '2px', background: 'var(--cream)' }} />
        </div>

        {/* Tabs */}
        {categories.length > 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '4rem' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: activeTab === cat ? 'var(--saffron)' : 'var(--gray-400)',
                  fontWeight: activeTab === cat ? 700 : 400,
                  fontSize: '0.9rem',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  transition: 'color 0.2s'
                }}
              >
                [ {cat} ]
              </button>
            ))}
          </div>
        )}

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {filtered.map(res => (
            <div 
              key={res.id} 
              className="resource-card-terminal reveal"
              style={{
                border: '1px solid var(--gray-600)',
                padding: '1.5rem',
                position: 'relative',
                transition: 'all 0.3s ease',
                display: 'block'
              }}
            >
              {/* Corner markers */}
              <div className="terminal-corner tl" style={{ position: 'absolute', top: -1, left: -1, width: 8, height: 8, borderTop: '2px solid var(--saffron)', borderLeft: '2px solid var(--saffron)' }} />
              <div className="terminal-corner tr" style={{ position: 'absolute', top: -1, right: -1, width: 8, height: 8, borderTop: '2px solid var(--saffron)', borderRight: '2px solid var(--saffron)' }} />
              <div className="terminal-corner bl" style={{ position: 'absolute', bottom: -1, left: -1, width: 8, height: 8, borderBottom: '2px solid var(--saffron)', borderLeft: '2px solid var(--saffron)' }} />
              <div className="terminal-corner br" style={{ position: 'absolute', bottom: -1, right: -1, width: 8, height: 8, borderBottom: '2px solid var(--saffron)', borderRight: '2px solid var(--saffron)' }} />

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: '2px', background: 'var(--gray-600)', alignSelf: 'stretch' }} className="terminal-vertical-line" />
                <div style={{ flex: 1, paddingLeft: '0.5rem' }}>
                  <h3 style={{ fontSize: res.isFeatured ? '1.5rem' : '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--saffron)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                    {res.title}
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--gray-300)', marginBottom: '2rem', lineHeight: 1.6 }}>
                    {res.description}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--gray-400)', fontSize: '0.85rem' }}>
                      <span>[ {res.format || 'PDF'} ]</span>
                      {res.sizeBytes && <span>[ {(res.sizeBytes / 1024 / 1024).toFixed(1)} MB ]</span>}
                      {res.date && <span>[ {new Date(res.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} ]</span>}
                    </div>
                    <a 
                      href={res.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="terminal-download-btn"
                      style={{
                        color: 'var(--cream)',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        letterSpacing: '0.05em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'color 0.2s'
                      }}
                    >
                      VIEW <i className="fa-solid fa-arrow-right" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ color: 'var(--gray-500)', fontStyle: 'italic' }}>
              No resources available in this category.
            </div>
          )}
        </div>

      </div>
    </Wrapper>
  )
}
