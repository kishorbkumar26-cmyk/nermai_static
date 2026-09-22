import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fbFirestore } from '../firebase/firestore'
import { driveStorage } from '../services/driveStorage'
import { 
  GraduationCap, Users, Award, Trophy, Star, Medal, BookOpen, CheckCircle, Target, 
  Flame, Heart, Building, Clock, TrendingUp, ShieldCheck, Zap, Sparkles, UserCheck, 
  ThumbsUp, Crown, Smile, Compass, Briefcase, Bookmark, ChevronLeft, ChevronRight, 
  X, ArrowRight, SearchX 
} from 'lucide-react'
import './ToppersWall.css'
import { checkSectionVersion } from '../utils/imageCacheVersion'
import { invalidateCachedUrls } from '../utils/imageCache'

const STAT_ICONS_MAP = {
  GraduationCap, Users, Award, Trophy, Star, Medal, BookOpen, CheckCircle, Target, 
  Flame, Heart, Building, Clock, TrendingUp, ShieldCheck, Zap, Sparkles, UserCheck, 
  ThumbsUp, Crown, Smile, Compass, Briefcase, Bookmark
}

function renderStatIcon(st, defaultIndex) {
  if (st && st.logoUrl && typeof st.logoUrl === 'string' && st.logoUrl.trim().length > 3) {
    return (
      <img 
        src={driveStorage.formatImageUrl(st.logoUrl.trim(), 200)} 
        alt={st.label || 'Stat logo'} 
        style={{ width: '22px', height: '22px', objectFit: 'contain', borderRadius: '4px', display: 'block' }} 
        onError={(e) => { e.target.style.display = 'none' }}
      />
    )
  }
  const defaultIcons = [GraduationCap, Users, Award, Trophy, Star, Medal, Target, TrendingUp]
  const IconComp = (st && st.icon && STAT_ICONS_MAP[st.icon]) 
    ? STAT_ICONS_MAP[st.icon] 
    : defaultIcons[defaultIndex % defaultIcons.length] || GraduationCap
  return <IconComp size={20} />
}

const BASE_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'upsc', label: 'UPSC' },
  { id: 'tnpsc', label: 'TNPSC' },
  { id: 'banking', label: 'Banking' },
  { id: 'puducherry', label: 'Puducherry Govt.' },
  { id: 'ssc', label: 'SSC' },
]

function getTopperPhoto(topper) {
  if (topper && topper.photo && typeof topper.photo === 'string' && topper.photo.trim().length > 5) {
    if (topper.photo.includes('unsplash.com')) return null
    return driveStorage.formatImageUrl(topper.photo.trim(), 1000)
  }
  return null
}

function getDynamicCategories(toppersList) {
  const catMap = new Map()
  BASE_CATEGORIES.forEach(c => catMap.set(c.id, c.label))

  toppersList.forEach(t => {
    if (t.visible === false) return
    const rawCat = (t.category || t.categoryId || '').trim()
    const rawExam = (t.exam || '').trim()

    if (rawCat) {
      const key = rawCat.toLowerCase()
      if (!catMap.has(key)) {
        catMap.set(key, rawCat)
      }
    }

    if (rawExam) {
      const token = rawExam.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '')
      if (token && token.length >= 2) {
        const key = token.toLowerCase()
        if (!catMap.has(key) && !['all', 'upsc', 'tnpsc', 'banking', 'puducherry', 'ssc', 'others'].includes(key)) {
          catMap.set(key, token.toUpperCase())
        }
      }
    }
  })

  catMap.set('others', 'Others')

  const list = []
  catMap.forEach((label, id) => {
    list.push({ id, label })
  })
  return list
}

function matchCategory(topper, targetCategoryId) {
  if (targetCategoryId === 'all') return true
  if (topper.visible === false) return false

  const catId = (topper.category || topper.categoryId || '').toLowerCase().trim()
  const exam = (topper.exam || '').toLowerCase().trim()
  const target = targetCategoryId.toLowerCase().trim()

  if (catId && (catId === target || catId.includes(target))) {
    return true
  }

  const examClean = exam.replace(/[^a-z0-9\s]/g, '')
  const examWords = examClean.split(/\s+/)
  if (examWords.includes(target) || examClean.startsWith(target)) {
    return true
  }

  if (target === 'upsc') return exam.includes('upsc') || catId === 'upsc'
  if (target === 'tnpsc') return exam.includes('tnpsc') || (exam.includes('group') && !exam.includes('cat')) || catId.startsWith('tnpsc')
  if (target === 'banking') return exam.includes('bank') || exam.includes('sbi') || exam.includes('ibps') || exam.includes('po') || catId === 'banking'
  if (target === 'puducherry') return exam.includes('puducherry') || exam.includes('udc') || exam.includes('ldc') || catId === 'puducherry'
  if (target === 'ssc') return exam.includes('ssc') || exam.includes('cgl') || exam.includes('chsl') || catId === 'ssc'

  if (target === 'others') {
    return !matchCategory(topper, 'upsc') && 
           !matchCategory(topper, 'tnpsc') && 
           !matchCategory(topper, 'banking') && 
           !matchCategory(topper, 'puducherry') && 
           !matchCategory(topper, 'ssc')
  }

  return false
}

export const DEFAULT_TOPPERS_WALL = {
  eyebrow: 'NERMAI SUCCESS STORIES',
  title: 'From Aspirants to Achievers',
  subtitle: 'Real journeys. Real people. Real results. Be inspired by our students who turned their dreams into reality with Nermai.',
  calloutNote: 'Different Backgrounds\nSame Determination\nSuccess with Nermai',
  stats: [
    { num: '187+', label: 'Successful Candidates' },
    { num: '2400+', label: 'Students Trained' },
    { num: '97%', label: 'Recommend Nermai' },
    { num: '14+', label: 'Years of Trust' }
  ],
  quoteText: 'The best investment I made for my future.',
  quoteAuthor: '— Nermai Student',
  defaultBadge: 'Guided by Nermai',
  readStoryBtnText: 'Read Story',
  features: [
    { title: 'Diverse Backgrounds', desc: 'Students from towns, cities and rural areas' },
    { title: 'Expert Guidance', desc: 'By experienced faculty and mentors' },
    { title: 'Consistent Practice', desc: 'Through mock tests and analysis' },
    { title: 'Remarkable Results', desc: 'Across competitive exams' }
  ],
  ctaBtnText: 'View All Success Stories',
  ctaBtnLink: '/results'
}

export default function ToppersWall({ customConfig }) {
  const [wallConfig, setWallConfig] = useState(customConfig || DEFAULT_TOPPERS_WALL)
  const [toppers, setToppers] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedStory, setSelectedStory] = useState(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      const saved = s?.homeContent?.toppersWall || s?.toppersWall
      if (saved) {
        setWallConfig(prev => ({ ...DEFAULT_TOPPERS_WALL, ...saved }))
      }
    })
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const unsub = fbFirestore.onResultsChanged(items => {
      if (items && Array.isArray(items)) {
        // Clean out any legacy mock unsplash URLs
        const cleaned = items.map(item => ({
          ...item,
          photo: item.photo && item.photo.includes('unsplash.com') ? '' : item.photo
        }))
        setToppers(cleaned)

        // Per-image cache invalidation on DB change
        const versionItems = cleaned
          .filter(t => t.photo && !t.photo.includes('unsplash.com'))
          .map(t => {
            const url = driveStorage.formatImageUrl(t.photo.trim())
            return url ? { url, updatedAt: t.updatedAt?.toMillis?.() || t.updatedAt || '' } : null
          })
          .filter(Boolean)

        const { staleUrls } = checkSectionVersion('toppers', versionItems)
        if (staleUrls.length) invalidateCachedUrls(staleUrls)

        // Preload visible topper photos in background
        driveStorage.preloadImages(
          cleaned.filter(t => t.photo && !t.photo.includes('unsplash.com')).map(t => t.photo)
        )
      } else {
        setToppers([])
      }
    })
    return () => unsub()
  }, [])

  const visibleItems = toppers.filter(t => t.visible !== false)
  const featuredOnly = visibleItems.filter(t => t.isFeatured === true)
  const nonFeatured = visibleItems.filter(t => t.isFeatured !== true)
  // Show featured items first, followed by all other achievers so admin uploads are never hidden
  const displayList = [...featuredOnly, ...nonFeatured]

  const categoriesList = getDynamicCategories(displayList)
  const currentList = displayList.filter(t => matchCategory(t, activeCategory))

  useEffect(() => {
    setActiveIndex(0)
  }, [activeCategory])

  useEffect(() => {
    if (isHovered || currentList.length <= 1) return
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % currentList.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isHovered, currentList.length])

  const handleNext = () => {
    if (currentList.length === 0) return
    setActiveIndex(prev => (prev + 1) % currentList.length)
  }

  const handlePrev = () => {
    if (currentList.length === 0) return
    setActiveIndex(prev => (prev - 1 + currentList.length) % currentList.length)
  }

  const minSwipeDistance = 40
  const handleTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > minSwipeDistance) {
      handleNext()
    } else if (distance < -minSwipeDistance) {
      handlePrev()
    }
  }

  const getVisibleCards = () => {
    const len = currentList.length
    if (len === 0) return []
    const safeActive = activeIndex % len

    if (isMobile) {
      return [{ topper: currentList[safeActive], idx: safeActive, position: 'center' }]
    }

    if (len === 1) return [{ topper: currentList[0], idx: 0, position: 'center' }]
    if (len === 2) {
      return [
        { topper: currentList[safeActive], idx: safeActive, position: 'center' },
        { topper: currentList[(safeActive + 1) % len], idx: (safeActive + 1) % len, position: 'right' }
      ]
    }
    const prevIdx = (safeActive - 1 + len) % len
    const nextIdx = (safeActive + 1) % len
    return [
      { topper: currentList[prevIdx], idx: prevIdx, position: 'left' },
      { topper: currentList[safeActive], idx: safeActive, position: 'center' },
      { topper: currentList[nextIdx], idx: nextIdx, position: 'right' },
    ]
  }

  const activeCategoryLabel = categoriesList.find(c => c.id === activeCategory)?.label || activeCategory

  return (
    <section className="toppers-section" id="success-stories">
      <div className="toppers-bg-pattern" />

      {/* Building Silhouette Watermark */}
      <svg className="toppers-building-watermark" viewBox="0 0 400 300" fill="currentColor" aria-hidden="true">
        <path d="M200 30 C170 30 150 60 140 90 L260 90 C250 60 230 30 200 30 Z" />
        <rect x="195" y="10" width="10" height="20" rx="2" />
        <polygon points="200,2 196,10 204,10" />
        <rect x="130" y="90" width="140" height="15" />
        <rect x="120" y="105" width="160" height="8" />
        <rect x="135" y="113" width="10" height="110" />
        <rect x="160" y="113" width="10" height="110" />
        <rect x="185" y="113" width="10" height="110" />
        <rect x="205" y="113" width="10" height="110" />
        <rect x="230" y="113" width="10" height="110" />
        <rect x="255" y="113" width="10" height="110" />
        <rect x="110" y="223" width="180" height="15" />
        <rect x="90" y="238" width="220" height="20" />
      </svg>

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        
        {/* Header */}
        <div className="toppers-header">
          <div className="toppers-eyebrow">
            {wallConfig.eyebrow || 'NERMAI SUCCESS STORIES'}
          </div>
          <h2 className="toppers-title">
            {wallConfig.title || 'From Aspirants to Achievers'}
          </h2>
          <p className="toppers-subtitle">
            {wallConfig.subtitle || 'Real journeys. Real people. Real results. Be inspired by our students who turned their dreams into reality with Nermai.'}
          </p>

          <div className="toppers-callout-note" style={{ whiteSpace: 'pre-line' }}>
            {wallConfig.calloutNote || 'Different Backgrounds\nSame Determination\nSuccess with Nermai'}
          </div>
        </div>

        {/* Dynamic Category Filter Bar */}
        <div className="toppers-tabs">
          {categoriesList.map(cat => (
            <button
              key={cat.id}
              className={`toppers-tab ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main Grid: Left Stats Column + Center Carousel */}
        <div className="toppers-main-grid">
          
          {/* Left Sidebar Stats Box */}
          <div className="toppers-sidebar">
            {(() => {
              const statsToRender = (wallConfig.stats && wallConfig.stats.length > 0) ? wallConfig.stats : DEFAULT_TOPPERS_WALL.stats
              const count = statsToRender.length
              return (
                <div className={`toppers-stats-list count-${count}`}>
                  {statsToRender.map((st, i) => (
                    <div key={i} className="toppers-stat-item">
                      <div className="toppers-stat-icon">
                        {renderStatIcon(st, i)}
                      </div>
                      <div className="toppers-stat-info">
                        <div className="toppers-stat-number">{st.num}</div>
                        <div className="toppers-stat-label">{st.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}

            {(wallConfig.quoteText || wallConfig.quoteAuthor) && (
              <div className="toppers-quote-box">
                {wallConfig.quoteText && (
                  <div className="toppers-quote-text">
                    “{wallConfig.quoteText}”
                  </div>
                )}
                {wallConfig.quoteAuthor && (
                  <div className="toppers-quote-author">
                    {wallConfig.quoteAuthor}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Center Carousel */}
          <div 
            className="toppers-carousel-wrapper"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {currentList.length > 0 ? (
              <>
                <button className="toppers-arrow-btn" onClick={handlePrev} aria-label="Previous story">
                  <ChevronLeft size={22} />
                </button>

                <div className="toppers-cards-container">
                  {getVisibleCards().map(({ topper, idx, position }) => {
                    const photoUrl = getTopperPhoto(topper)
                    const isCenter = position === 'center'
                    const displayQuote = topper.quote || wallConfig.defaultBadge || 'Guided by Nermai'

                    return (
                      <div
                        key={topper.id || idx}
                        className={`toppers-card ${isCenter ? 'active-card' : ''}`}
                        onClick={() => setActiveIndex(idx)}
                      >
                        {/* Photo / Monogram Box with Speech Bubble */}
                        <div className="toppers-card-photo-wrapper">
                          {photoUrl ? (
                            <img 
                              src={photoUrl} 
                              alt={topper.name} 
                              className="toppers-card-photo" 
                              loading="lazy" 
                              onError={(e) => driveStorage.handleImageError(e)}
                            />
                          ) : (
                            <div className="toppers-card-photo-fallback">
                              <div className="fallback-initial-badge">
                                {(topper.name || 'S')[0].toUpperCase()}
                              </div>
                            </div>
                          )}
                          
                          {displayQuote && (
                            <div className="toppers-card-quote-bubble">
                              "{displayQuote}"
                            </div>
                          )}
                        </div>

                        {/* Card Body */}
                        <div className="toppers-card-body">
                          <div className="toppers-card-name">{topper.name}</div>
                          <div className="toppers-card-exam">
                            {topper.exam} {topper.year ? `(${topper.year})` : ''} • AIR {topper.rank || '1'}
                          </div>

                          <p className="toppers-card-story-snippet">
                            {topper.story ? (topper.story.length > 65 ? `${topper.story.slice(0, 65)}...` : topper.story) : 'A journey of discipline, dedication and daily practice.'}
                          </p>

                          <button 
                            className="toppers-read-story-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedStory(topper)
                            }}
                          >
                            <span>{wallConfig.readStoryBtnText || 'Read Story'}</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <button className="toppers-arrow-btn" onClick={handleNext} aria-label="Next story">
                  <ChevronRight size={22} />
                </button>
              </>
            ) : (
              <div className="toppers-empty-box">
                <SearchX size={38} style={{ color: 'var(--gold-light)', marginBottom: '0.65rem' }} />
                {displayList.length === 0 ? (
                  <>
                    <h4 style={{ color: '#FFFFFF', fontSize: '1.25rem', marginBottom: '0.35rem', fontFamily: 'var(--font-display)' }}>
                      {wallConfig.emptyTitle || 'No Achievers Added Yet'}
                    </h4>
                    <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.88rem', maxWidth: '380px', margin: '0 auto', lineHeight: 1.5 }}>
                      {wallConfig.emptyDesc || 'Achievers and toppers added in the Admin Portal will appear here automatically on the Wall of Fame.'}
                    </p>
                  </>
                ) : (
                  <>
                    <h4 style={{ color: '#FFFFFF', fontSize: '1.2rem', marginBottom: '0.35rem', fontFamily: 'var(--font-display)' }}>
                      No Stories Found in {activeCategoryLabel}
                    </h4>
                    <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.85rem', maxWidth: '360px', margin: '0 auto 1rem auto' }}>
                      There are currently no achievers listed under the {activeCategoryLabel} category.
                    </p>
                    <button 
                      className="toppers-tab active"
                      onClick={() => setActiveCategory('all')}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
                    >
                      {wallConfig.viewAllStoriesBtnText || 'View All Stories'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Carousel Dots */}
        {currentList.length > 1 && (
          <div className="toppers-dots">
            {currentList.map((_, i) => (
              <span
                key={i}
                className={`toppers-dot ${i === (activeIndex % currentList.length) ? 'active' : ''}`}
                onClick={() => setActiveIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Bottom Feature Bar */}
        <div className="toppers-bottom-bar">
          <div className="toppers-features-list">
            {(() => {
              const featureIcons = [BookOpen, UserCheck, TrendingUp, Target]
              const featuresToRender = (wallConfig.features && wallConfig.features.length > 0) ? wallConfig.features : DEFAULT_TOPPERS_WALL.features
              return featuresToRender.map((feat, i) => {
                const IconComp = featureIcons[i % featureIcons.length]
                return (
                  <div key={i} className="toppers-feature-item">
                    <IconComp className="toppers-feature-icon" size={20} />
                    <div>
                      <div className="toppers-feature-title">{feat.title}</div>
                      <div className="toppers-feature-desc">{feat.desc}</div>
                    </div>
                  </div>
                )
              })
            })()}
          </div>

          <Link to={wallConfig.ctaBtnLink || '/results'} className="toppers-view-all-btn">
            <span>{wallConfig.ctaBtnText || 'View All Success Stories'}</span>
            <ArrowRight size={15} />
          </Link>
        </div>

      </div>

      {/* Full Story Modal */}
      {selectedStory && (
        <div className="toppers-modal-overlay" onClick={() => setSelectedStory(null)}>
          <div className="toppers-modal-content" onClick={e => e.stopPropagation()}>
            <button className="toppers-modal-close" onClick={() => setSelectedStory(null)}>
              <X size={18} />
            </button>

            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.25rem' }}>
              {getTopperPhoto(selectedStory) ? (
                <img 
                  src={getTopperPhoto(selectedStory)} 
                  alt={selectedStory.name}
                  crossOrigin="anonymous"
                  style={{ width: '75px', height: '75px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold)' }}
                />
              ) : (
                <div style={{
                  width: '75px', height: '75px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #D4AF37, #996515)',
                  color: '#1A1008', fontSize: '2rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--gold)', fontFamily: 'Georgia, serif'
                }}>
                  {(selectedStory.name || 'S')[0].toUpperCase()}
                </div>
              )}
              <div>
                <h3 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', color: '#fff', marginBottom: '3px' }}>
                  {selectedStory.name}
                </h3>
                <div style={{ color: 'var(--gold-light)', fontWeight: 700, fontSize: '0.95rem' }}>
                  {selectedStory.exam} {selectedStory.year ? `(${selectedStory.year})` : ''} {selectedStory.rank ? `• AIR ${selectedStory.rank}` : ''}
                </div>
              </div>
            </div>

            {selectedStory.quote && (
              <blockquote style={{ 
                fontStyle: 'italic', color: 'var(--gold-light)', fontSize: '1.02rem',
                borderLeft: '3px solid var(--gold)', paddingLeft: '0.85rem', margin: '0.75rem 0 1.25rem 0',
                background: 'rgba(212, 175, 55, 0.1)', padding: '0.75rem 1rem', borderRadius: '0 10px 10px 0'
              }}>
                "{selectedStory.quote}"
              </blockquote>
            )}

            <div style={{ color: 'rgba(255,255,255,0.88)', lineHeight: 1.65, fontSize: '0.94rem' }}>
              <p style={{ margin: 0 }}>
                {selectedStory.story || selectedStory.quote || 'From foundational preparation to mock tests, individual mentoring and answer writing at Nermai IAS Academy proved instrumental in achieving this milestone.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
