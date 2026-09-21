import React, { useState, useEffect } from 'react'
import { fbFirestore, DEFAULT_WHY_NERMAI } from '../../firebase/firestore'
import AdminImageUpload from './AdminImageUpload'
import WhyNermaiCard from '../WhyNermaiCard'
import { Plus, Trash2, ArrowUp, ArrowDown, RotateCcw, Save, Eye, Sparkles, Image as ImageIcon } from 'lucide-react'

const ICON_CHOICES = [
  { value: 'Trophy', label: 'Trophy (Results)' },
  { value: 'Users', label: 'Users / Faculty' },
  { value: 'HandCoins', label: 'Rupee / Non-Commercial' },
  { value: 'Laptop', label: 'Laptop / Online' },
  { value: 'TrendingUp', label: 'Trending Up / Learning' },
  { value: 'GraduationCap', label: 'Graduation Cap' },
  { value: 'BookOpen', label: 'Book / Syllabus' },
  { value: 'ShieldCheck', label: 'Shield / Quality' },
  { value: 'Star', label: 'Star / Excellence' },
  { value: 'Target', label: 'Target / Focus' }
]

export default function WhyNermaiAdminSection({ toast }) {
  const [data, setData] = useState(DEFAULT_WHY_NERMAI)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  useEffect(() => {
    fbFirestore.getSettings().then((settings) => {
      if (settings?.whyNermai) {
        const storedPillars = Array.isArray(settings.whyNermai.pillars) && settings.whyNermai.pillars.length > 0
          ? settings.whyNermai.pillars
          : (Array.isArray(settings.whyNermai.points) && settings.whyNermai.points.length > 0
              ? settings.whyNermai.points.map(p => ({
                  id: p.id,
                  number: p.number,
                  icon: 'Trophy',
                  title: p.title,
                  desc: p.desc
                }))
              : DEFAULT_WHY_NERMAI.pillars)

        setData({
          ...DEFAULT_WHY_NERMAI,
          ...settings.whyNermai,
          heroImageUrl: settings.whyNermai.heroImageUrl || DEFAULT_WHY_NERMAI.heroImageUrl,
          pillars: storedPillars
        })
      } else {
        setData(DEFAULT_WHY_NERMAI)
      }
      setLoading(false)
    })
  }, [])

  const handleFieldChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePillarChange = (index, field, value) => {
    setData((prev) => {
      const newPillars = [...prev.pillars]
      newPillars[index] = { ...newPillars[index], [field]: value }
      return { ...prev, pillars: newPillars }
    })
  }

  const handleAddPillar = () => {
    setData((prev) => {
      const nextNum = prev.pillars.length + 1
      const numStr = nextNum < 10 ? `0${nextNum}` : `${nextNum}`
      const newPillar = {
        id: `p_${Date.now()}`,
        number: numStr,
        icon: 'Trophy',
        title: 'New Pillar Title',
        desc: 'Enter detailed description with **highlighted keywords** here.'
      }
      return { ...prev, pillars: [...prev.pillars, newPillar] }
    })
    toast?.info('Added new pillar. Edit details below.')
  }

  const handleDeletePillar = (index) => {
    if (data.pillars.length <= 1) {
      toast?.error('You must keep at least one pillar in the card.')
      return
    }
    setData((prev) => ({
      ...prev,
      pillars: prev.pillars.filter((_, idx) => idx !== index)
    }))
  }

  const handleMovePillar = (index, direction) => {
    const targetIdx = index + direction
    if (targetIdx < 0 || targetIdx >= data.pillars.length) return

    setData((prev) => {
      const newPillars = [...prev.pillars]
      const temp = newPillars[index]
      newPillars[index] = newPillars[targetIdx]
      newPillars[targetIdx] = temp
      return { ...prev, pillars: newPillars }
    })
  }

  const handleReset = () => {
    if (window.confirm('Reset all card contents and images to default design?')) {
      setData(DEFAULT_WHY_NERMAI)
      toast?.info('Reset to defaults. Click "Save Changes" to apply.')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fbFirestore.updateSettings({ whyNermai: data })
      toast?.success('Why Nermai section updated successfully!')
    } catch (err) {
      console.error('Error saving Why Nermai card:', err)
      toast?.error(err.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '1.5rem', marginRight: '0.5rem' }} />
        Loading Why Nermai configuration...
      </div>
    )
  }

  return (
    <div className="ap-fade-in" style={{ maxWidth: '1360px', margin: '0 auto' }}>
      
      {/* Title & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="ap-section-title" style={{ margin: 0 }}>
            <i className="fa-solid fa-chess-king" style={{ color: 'var(--maroon)', marginRight: '0.5rem' }} />
            Why Nermai Section Editor
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', margin: '0.35rem 0 0 0' }}>
            Customize all headers, 5 pillar columns, icons, descriptions, hero chess visual, and cursive scripts line-by-line.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            className="ap-btn" 
            style={{ background: '#f3f4f6', color: '#374151' }} 
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye size={16} /> {showPreview ? 'Hide Live Preview' : 'Show Live Preview'}
          </button>
          <button 
            className="ap-btn" 
            style={{ background: '#fee2e2', color: '#991b1b' }} 
            onClick={handleReset}
          >
            <RotateCcw size={16} /> Reset Defaults
          </button>
          <button 
            className="ap-btn ap-btn-primary" 
            onClick={handleSave} 
            disabled={saving}
          >
            {saving ? (
              <><i className="fa-solid fa-spinner fa-spin" /> Saving...</>
            ) : (
              <><Save size={16} /> Save Changes</>
            )}
          </button>
        </div>
      </div>

      {/* Live Preview Box */}
      {showPreview && (
        <div className="ap-card" style={{ marginBottom: '2rem', background: '#F8F6F0', border: '2px dashed #D4AF37', padding: '1rem', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--maroon)' }}>
              <Sparkles size={18} /> Live Section Preview
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
              Rendered in real-time as displayed on /why-nermai
            </span>
          </div>
          <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
            <WhyNermaiCard data={data} />
          </div>
        </div>
      )}

      {/* 1. Header & Titles */}
      <div className="ap-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fa-solid fa-heading" style={{ color: 'var(--maroon)' }} /> 1. Header & Subtitles
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div className="ap-form-group">
            <label style={{ fontWeight: 600 }}>Gold Eyebrow Text</label>
            <input
              type="text"
              className="ap-input"
              value={data.eyebrow || ''}
              onChange={(e) => handleFieldChange('eyebrow', e.target.value)}
              placeholder="OUR STRENGTH"
            />
          </div>

          <div className="ap-form-group">
            <label style={{ fontWeight: 600 }}>Title Prefix (Dark Serif)</label>
            <input
              type="text"
              className="ap-input"
              value={data.titlePrefix || ''}
              onChange={(e) => handleFieldChange('titlePrefix', e.target.value)}
              placeholder="Why"
            />
          </div>

          <div className="ap-form-group">
            <label style={{ fontWeight: 600 }}>Title Highlight (Crimson Maroon)</label>
            <input
              type="text"
              className="ap-input"
              value={data.titleHighlight || ''}
              onChange={(e) => handleFieldChange('titleHighlight', e.target.value)}
              placeholder="NermaiIAS?"
              style={{ fontWeight: 700, color: '#7A1526' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginTop: '0.75rem' }}>
          <div className="ap-form-group">
            <label style={{ fontWeight: 600 }}>Subtitle Line 1</label>
            <input
              type="text"
              className="ap-input"
              value={data.subtitleLine1 || ''}
              onChange={(e) => handleFieldChange('subtitleLine1', e.target.value)}
              placeholder="Quality mentorship. Accessible learning. Proven results."
            />
          </div>

          <div className="ap-form-group">
            <label style={{ fontWeight: 600 }}>Subtitle Line 2</label>
            <input
              type="text"
              className="ap-input"
              value={data.subtitleLine2 || ''}
              onChange={(e) => handleFieldChange('subtitleLine2', e.target.value)}
              placeholder="That's the Nermai difference."
            />
          </div>
        </div>
      </div>

      {/* 2. The 5 Pillars (Horizontal Columns) */}
      <div className="ap-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-table-columns" style={{ color: 'var(--maroon)' }} /> 2. Pillar Columns (Line-by-Line Content)
          </h3>
          <button 
            type="button" 
            className="ap-btn ap-btn-secondary" 
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }} 
            onClick={handleAddPillar}
          >
            <Plus size={14} /> Add Pillar
          </button>
        </div>

        <div style={{ background: '#f9fafb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#4b5563', borderLeft: '4px solid #7A1526' }}>
          <strong>Formatting Tip:</strong> Wrap words in <code>**number or text**</code> to emphasize them in bold maroon.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {data.pillars.map((item, idx) => (
            <div 
              key={item.id || idx} 
              style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: '12px', 
                padding: '1.25rem', 
                background: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)' 
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, color: '#7A1526', fontSize: '0.9rem' }}>
                  Pillar #{idx + 1}
                </span>
                
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button 
                    type="button"
                    className="ap-btn-icon" 
                    title="Move Left/Up"
                    disabled={idx === 0} 
                    onClick={() => handleMovePillar(idx, -1)}
                    style={{ opacity: idx === 0 ? 0.3 : 1 }}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button 
                    type="button"
                    className="ap-btn-icon" 
                    title="Move Right/Down"
                    disabled={idx === data.pillars.length - 1} 
                    onClick={() => handleMovePillar(idx, 1)}
                    style={{ opacity: idx === data.pillars.length - 1 ? 0.3 : 1 }}
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button 
                    type="button"
                    className="ap-btn-icon" 
                    style={{ color: '#dc2626' }} 
                    title="Delete Pillar"
                    onClick={() => handleDeletePillar(idx)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '80px 180px 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                <div className="ap-form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Number</label>
                  <input
                    type="text"
                    className="ap-input"
                    value={item.number || ''}
                    onChange={(e) => handlePillarChange(idx, 'number', e.target.value)}
                    placeholder="01"
                    style={{ textAlign: 'center', fontWeight: 800, color: '#B8860B' }}
                  />
                </div>

                <div className="ap-form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Icon</label>
                  <select
                    className="ap-input"
                    value={item.icon || 'Trophy'}
                    onChange={(e) => handlePillarChange(idx, 'icon', e.target.value)}
                  >
                    {ICON_CHOICES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="ap-form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Pillar Title</label>
                  <input
                    type="text"
                    className="ap-input"
                    value={item.title || ''}
                    onChange={(e) => handlePillarChange(idx, 'title', e.target.value)}
                    placeholder="e.g. Proven Results"
                    style={{ fontWeight: 700, color: '#7A1526' }}
                  />
                </div>
              </div>

              <div className="ap-form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Description Text</label>
                <textarea
                  className="ap-input"
                  rows={3}
                  value={item.desc || ''}
                  onChange={(e) => handlePillarChange(idx, 'desc', e.target.value)}
                  placeholder="Enter pillar description with **highlights**..."
                  style={{ fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Hero Visual Graphic & Image Customizer */}
      <div className="ap-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fa-solid fa-image" style={{ color: 'var(--maroon)' }} /> 3. Right Hero Visual & Image Uploader
        </h3>

        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            className="ap-btn"
            style={{ 
              fontSize: '0.8rem', 
              background: data.heroImageUrl === '/assets/why-nermai-right-banner.png' ? 'var(--maroon)' : '#f3f4f6',
              color: data.heroImageUrl === '/assets/why-nermai-right-banner.png' ? '#ffffff' : '#374151'
            }}
            onClick={() => {
              handleFieldChange('heroImageUrl', '/assets/why-nermai-right-banner.png')
              handleFieldChange('showCustomScript', false)
              toast?.info('Selected Original Chess King & Foundation Books Banner')
            }}
          >
            <ImageIcon size={14} /> Use Original Chess King & Books Banner
          </button>

          <button 
            type="button" 
            className="ap-btn"
            style={{ 
              fontSize: '0.8rem', 
              background: data.heroImageUrl === '/assets/chess-king.jpg' ? 'var(--maroon)' : '#f3f4f6',
              color: data.heroImageUrl === '/assets/chess-king.jpg' ? '#ffffff' : '#374151'
            }}
            onClick={() => {
              handleFieldChange('heroImageUrl', '/assets/chess-king.jpg')
              handleFieldChange('showCustomScript', true)
              toast?.info('Selected Chess King Close-Up Graphic')
            }}
          >
            <ImageIcon size={14} /> Use Chess King Close-Up
          </button>
        </div>

        <div className="ap-form-group">
          <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
            Upload Custom Hero Visual (or enter Web / Google Drive Image URL)
          </label>
          <AdminImageUpload
            value={data.heroImageUrl || ''}
            onChange={(url) => {
              handleFieldChange('heroImageUrl', url)
              if (url && !url.includes('why-nermai-right-banner')) {
                handleFieldChange('showCustomScript', true)
              }
            }}
            label="Hero Visual Image"
            dimensions="1024 × 475 px (Landscape)"
            toast={toast}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
          <div className="ap-form-group">
            <label style={{ fontWeight: 600 }}>Image Fit Mode</label>
            <select
              className="ap-input"
              value={data.heroImageFit || 'cover'}
              onChange={(e) => handleFieldChange('heroImageFit', e.target.value)}
            >
              <option value="cover">Cover (Fill & Stretch Seamlessly)</option>
              <option value="contain">Contain (Show Full Image)</option>
            </select>
          </div>

          <div className="ap-form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <label style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={data.showCustomScript === true} 
                onChange={(e) => handleFieldChange('showCustomScript', e.target.checked)} 
              />
              Show Floating Cursive Script Overlays
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '4px' }}>
              Enable to display "Same Commitment..." & "Students Today..." text overlays over custom uploaded photos.
            </span>
          </div>
        </div>

        {/* Script Overlay Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
          <div style={{ border: '1px solid #f3f4f6', borderRadius: '8px', padding: '1rem', background: '#fafafa' }}>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#7A1526', display: 'block', marginBottom: '0.5rem' }}>
              Top Script Note (Italic Cursive)
            </span>
            <div className="ap-form-group" style={{ marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.78rem' }}>Line 1</label>
              <input
                type="text"
                className="ap-input"
                value={data.topScriptLine1 || ''}
                onChange={(e) => handleFieldChange('topScriptLine1', e.target.value)}
                placeholder="Same Commitment"
              />
            </div>
            <div className="ap-form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.78rem' }}>Line 2</label>
              <input
                type="text"
                className="ap-input"
                value={data.topScriptLine2 || ''}
                onChange={(e) => handleFieldChange('topScriptLine2', e.target.value)}
                placeholder="A Brighter India"
              />
            </div>
          </div>

          <div style={{ border: '1px solid #f3f4f6', borderRadius: '8px', padding: '1rem', background: '#fafafa' }}>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#7A1526', display: 'block', marginBottom: '0.5rem' }}>
              Bottom Script Note (Italic Cursive)
            </span>
            <div className="ap-form-group" style={{ marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.78rem' }}>Line 1</label>
              <input
                type="text"
                className="ap-input"
                value={data.bottomScriptLine1 || ''}
                onChange={(e) => handleFieldChange('bottomScriptLine1', e.target.value)}
                placeholder="Students Today"
              />
            </div>
            <div className="ap-form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.78rem' }}>Line 2</label>
              <input
                type="text"
                className="ap-input"
                value={data.bottomScriptLine2 || ''}
                onChange={(e) => handleFieldChange('bottomScriptLine2', e.target.value)}
                placeholder="A Stronger Tomorrow"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', padding: '1rem 0' }}>
        <button 
          className="ap-btn ap-btn-primary ap-btn-lg" 
          onClick={handleSave} 
          disabled={saving}
          style={{ minWidth: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          {saving ? (
            <><i className="fa-solid fa-spinner fa-spin" /> Saving...</>
          ) : (
            <><Save size={18} /> Save All Changes</>
          )}
        </button>
      </div>

    </div>
  )
}
