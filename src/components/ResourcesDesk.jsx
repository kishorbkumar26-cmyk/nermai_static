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
    <Wrapper
      className={!isWidget ? "resource-desk-section" : "resource-desk-widget"}
      style={{
        background: isWidget ? 'var(--white)' : 'var(--cream)',
        color: 'var(--ink)',
        padding: isWidget ? '2rem' : '5rem 1.5rem',
        borderRadius: isWidget ? '16px' : '0',
        border: isWidget ? '1px solid var(--gray-200)' : 'none',
        boxShadow: isWidget ? '0 10px 30px rgba(26, 16, 8, 0.04)' : 'none',
        fontFamily: 'var(--font-body)'
      }}
    >
      <div className={!isWidget ? "container-narrow" : ""}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            letterSpacing: '0.12em', 
            color: 'var(--maroon)', 
            textTransform: 'uppercase', 
            display: 'block', 
            marginBottom: '0.3rem' 
          }}>
            FREE LEARNING RESOURCES
          </span>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: isWidget ? '1.5rem' : '2.25rem', 
            fontWeight: 700, 
            color: 'var(--ink)', 
            margin: '0 0 0.75rem',
            lineHeight: 1.2
          }}>
            Study Notes & Question Banks
          </h2>
          <div style={{ 
            width: '50px', 
            height: '3px', 
            background: 'linear-gradient(90deg, var(--maroon) 0%, var(--saffron) 100%)',
            borderRadius: '2px' 
          }} />
        </div>

        {/* Tabs */}
        {categories.length > 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.75rem' }}>
            {categories.map(cat => {
              const isActive = activeTab === cat
              return (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  style={{
                    background: isActive ? 'var(--maroon)' : 'var(--gray-100)',
                    color: isActive ? 'var(--white)' : 'var(--gray-700)',
                    border: isActive ? '1px solid var(--maroon)' : '1px solid var(--gray-200)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.85rem',
                    letterSpacing: '0.02em',
                    cursor: 'pointer',
                    padding: '0.4rem 1rem',
                    borderRadius: '20px',
                    boxShadow: isActive ? '0 2px 8px rgba(123, 27, 46, 0.2)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        )}

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filtered.map(res => (
            <div 
              key={res.id} 
              className="resource-card-item reveal"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--gray-200)',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                position: 'relative',
                transition: 'all 0.25s ease',
                display: 'block',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                {/* Accent Line */}
                <div style={{ 
                  width: '4px', 
                  borderRadius: '4px', 
                  background: res.isFeatured ? 'var(--saffron)' : 'var(--maroon)', 
                  alignSelf: 'stretch',
                  flexShrink: 0 
                }} />
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <h3 style={{ 
                      fontSize: res.isFeatured ? '1.2rem' : '1.05rem', 
                      fontWeight: 700, 
                      margin: 0, 
                      color: 'var(--ink)', 
                      letterSpacing: '-0.01em',
                      lineHeight: 1.3
                    }}>
                      {res.title}
                    </h3>
                    {res.isFeatured && (
                      <span style={{ 
                        background: 'rgba(230, 92, 0, 0.1)', 
                        color: 'var(--saffron-dark)', 
                        fontSize: '0.7rem', 
                        fontWeight: 700, 
                        padding: '0.15rem 0.5rem', 
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Featured
                      </span>
                    )}
                  </div>

                  {res.description && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', marginBottom: '1rem', lineHeight: 1.5 }}>
                      {res.description}
                    </p>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                      <span style={{ 
                        background: 'rgba(123, 27, 46, 0.08)', 
                        color: 'var(--maroon)', 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '6px', 
                        letterSpacing: '0.05em',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        {res.format || 'PDF'}
                      </span>
                      {res.sizeBytes && (
                        <span style={{ color: 'var(--gray-500)', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <i className="fa-solid fa-file" style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }} />
                          {(res.sizeBytes / 1024 / 1024).toFixed(1)} MB
                        </span>
                      )}
                      {res.date && (
                        <span style={{ color: 'var(--gray-500)', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <i className="fa-regular fa-calendar" style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }} />
                          {new Date(res.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>

                    <a 
                      href={res.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="resource-view-btn"
                      style={{
                        background: 'var(--maroon)',
                        color: 'var(--white)',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        letterSpacing: '0.02em',
                        padding: '0.45rem 1.1rem',
                        borderRadius: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 6px rgba(123, 27, 46, 0.15)'
                      }}
                    >
                      VIEW <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.75rem' }} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ color: 'var(--gray-500)', fontStyle: 'italic', padding: '1rem 0' }}>
              No resources available in this category.
            </div>
          )}
        </div>

      </div>
    </Wrapper>
  )
}

