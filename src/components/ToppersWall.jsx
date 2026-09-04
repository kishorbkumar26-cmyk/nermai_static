import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fbFirestore } from '../firebase/firestore'
import { driveStorage } from '../services/driveStorage'
import { GraduationCap, Users, Award, Trophy, ChevronLeft, ChevronRight, BookOpen, UserCheck, TrendingUp, Target, X, ArrowRight, SearchX } from 'lucide-react'
import './ToppersWall.css'

const BASE_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'upsc', label: 'UPSC' },
  { id: 'tnpsc', label: 'TNPSC' },
  { id: 'banking', label: 'Banking' },
  { id: 'puducherry', label: 'Puducherry Govt.' },
  { id: 'ssc', label: 'SSC' },
]

const FALLBACK_AVATARS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=800&auto=format&fit=crop'
]

const DEFAULT_TOPPERS = [
  {
    id: 'def-1',
    name: 'S. Priya',
    exam: 'TNPSC Group II',
    year: '2024',
    rank: '12',
    quote: '"Nermai gave me the right direction and the confidence to stay consistent."',
    story: 'From a small town to a big opportunity. Coming from a rural background, Nermai IAS Academy provided comprehensive study materials, daily practice tests, and individual mentoring sessions that helped me secure State Rank 12.',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
    categoryId: 'tnpsc',
    visible: true
  },
  {
    id: 'def-2',
    name: 'R. Karthik',
    exam: 'UPSC CSE',
    year: '2023',
    rank: '45',
    quote: '"The faculty were more than teachers — they were mentors."',
    story: 'A journey of discipline, dedication, and daily practice. The individual mentorship and answer writing evaluation at Nermai played a critical role in clearing the UPSC Civil Services Examination.',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    categoryId: 'upsc',
    visible: true
  },
  {
    id: 'def-3',
    name: 'M. Divya',
    exam: 'Banking (SBI PO)',
    year: '2024',
    rank: '08',
    quote: '"Mock tests at Nermai made me exam-ready and fearless."',
    story: 'Practice today, progress tomorrow. The speed tests and shortcut techniques taught by expert mentors helped me crack both Prelims and Mains on my first attempt.',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    categoryId: 'banking',
    visible: true
  },
  {
    id: 'def-4',
    name: 'V. Anbuselvan',
    exam: 'Puducherry UDC/LDC',
    year: '2024',
    rank: '03',
    quote: '"Focused coaching and structured test series made all the difference."',
    story: 'Clearing Puducherry government exam required thorough coverage of local syllabus and current affairs. Nermai provided the exact roadmap needed.',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
    categoryId: 'puducherry',
    visible: true
  },
  {
    id: 'def-5',
    name: 'K. Balaji',
    exam: 'SSC CGL',
    year: '2023',
    rank: '19',
    quote: '"Constant motivation and regular doubt-clearing sessions."',
    story: 'The quantitative aptitude and reasoning shortcuts helped me achieve top score in Tier 1 and Tier 2 of SSC CGL.',
    photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=800&auto=format&fit=crop',
    categoryId: 'ssc',
    visible: true
  }
]

function getTopperPhoto(topper) {
  if (topper && topper.photo && typeof topper.photo === 'string' && topper.photo.trim().length > 5) {
    return driveStorage.formatImageUrl(topper.photo.trim())
  }
  return null
}

function getDynamicCategories(toppersList) {
  const catMap = new Map()
  BASE_CATEGORIES.forEach(c => catMap.set(c.id, c.label))

  toppersList.forEach(t => {
    if (t.visible === false) return
    const rawCat = (t.categoryId || '').trim()
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

  const catId = (topper.categoryId || '').toLowerCase().trim()
  const exam = (topper.exam || '').toLowerCase().trim()
  const target = targetCategoryId.toLowerCase().trim()

  // 1. Direct match on categoryId
  if (catId && (catId === target || catId.includes(target))) {
    return true
  }

  // 2. Direct match on exam name / token (e.g. "CAT (2026)" matching "cat", "TN2026 (2026)" matching "tn2026")
  const examClean = exam.replace(/[^a-z0-9\s]/g, '')
  const examWords = examClean.split(/\s+/)
  if (examWords.includes(target) || examClean.startsWith(target)) {
    return true
  }

  // 3. Strict base category matching
  if (target === 'upsc') {
    return exam.includes('upsc') || catId === 'upsc'
  }
  if (target === 'tnpsc') {
    return exam.includes('tnpsc') || (exam.includes('group') && !exam.includes('cat') && !exam.includes('tn2026')) || catId === 'tnpsc'
  }
  if (target === 'banking') {
    return exam.includes('bank') || exam.includes('sbi') || exam.includes('ibps') || exam.includes('po') || catId === 'banking'
  }
  if (target === 'puducherry') {
    return exam.includes('puducherry') || exam.includes('udc') || exam.includes('ldc') || catId === 'puducherry'
  }
  if (target === 'ssc') {
    return exam.includes('ssc') || exam.includes('cgl') || exam.includes('chsl') || catId === 'ssc'
  }

  if (target === 'others') {
    return !matchCategory(topper, 'upsc') && 
           !matchCategory(topper, 'tnpsc') && 
           !matchCategory(topper, 'banking') && 
           !matchCategory(topper, 'puducherry') && 
           !matchCategory(topper, 'ssc') &&
           !matchCategory(topper, 'cat') &&
           !matchCategory(topper, 'tn2026')
  }

  return false
}

export default function ToppersWall() {
  const [toppers, setToppers] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedStory, setSelectedStory] = useState(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const unsub = fbFirestore.onToppersChanged(items => {
      if (items && items.length > 0) {
        setToppers(items)
      } else {
        setToppers(DEFAULT_TOPPERS)
      }
    })
    return () => unsub()
  }, [])

  const displayList = toppers.length > 0 ? toppers : DEFAULT_TOPPERS
  const categoriesList = getDynamicCategories(displayList)
  const currentList = displayList.filter(t => matchCategory(t, activeCategory))

  // Reset active index when category changes
  useEffect(() => {
    setActiveIndex(0)
  }, [activeCategory])

  // Auto-slide interval (5 seconds)
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

  // Get visible cards centered around activeIndex
  const getVisibleCards = () => {
    const len = currentList.length
    if (len === 0) return []
    if (len === 1) return [{ topper: currentList[0], idx: 0, position: 'center' }]
    if (len === 2) {
      const active = activeIndex % len
      return [
        { topper: currentList[active], idx: active, position: 'center' },
        { topper: currentList[(active + 1) % len], idx: (active + 1) % len, position: 'right' }
      ]
    }
    const safeActive = activeIndex % len
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
            NERMAI SUCCESS STORIES
          </div>
          <h2 className="toppers-title">
            From Aspirants to Achievers
          </h2>
          <p className="toppers-subtitle">
            Real journeys. Real people. Real results. Be inspired by our students who turned their dreams into reality with Nermai.
          </p>

          <div className="toppers-callout-note">
            Different Backgrounds<br />Same Determination<br />Success with Nermai
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
            <div className="toppers-stat-item">
              <div className="toppers-stat-icon">
                <GraduationCap size={22} />
              </div>
              <div>
                <div className="toppers-stat-number">187+</div>
                <div className="toppers-stat-label">Successful Candidates</div>
              </div>
            </div>

            <div className="toppers-stat-item">
              <div className="toppers-stat-icon">
                <Users size={22} />
              </div>
              <div>
                <div className="toppers-stat-number">2400+</div>
                <div className="toppers-stat-label">Students Trained</div>
              </div>
            </div>

            <div className="toppers-stat-item">
              <div className="toppers-stat-icon">
                <Award size={22} />
              </div>
              <div>
                <div className="toppers-stat-number">97%</div>
                <div className="toppers-stat-label">Recommend Nermai</div>
              </div>
            </div>

            <div className="toppers-stat-item">
              <div className="toppers-stat-icon">
                <Trophy size={22} />
              </div>
              <div>
                <div className="toppers-stat-number">14+</div>
                <div className="toppers-stat-label">Years of Trust</div>
              </div>
            </div>

            <div className="toppers-quote-box">
              <div className="toppers-quote-text">
                “The best investment I made for my future.”
              </div>
              <div className="toppers-quote-author">
                — Nermai Student
              </div>
            </div>
          </div>

          {/* Center Carousel */}
          <div 
            className="toppers-carousel-wrapper"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {currentList.length > 0 ? (
              <>
                <button className="toppers-arrow-btn" onClick={handlePrev} aria-label="Previous story">
                  <ChevronLeft size={24} />
                </button>

                <div className="toppers-cards-container">
                  {getVisibleCards().map(({ topper, idx, position }) => {
                    const photoUrl = getTopperPhoto(topper)
                    const isCenter = position === 'center'
                    const displayQuote = topper.quote || topper.story || 'Nermai gave me the right direction and confidence.'

                    return (
                      <div
                        key={topper.id || idx}
                        className={`toppers-card ${isCenter ? 'active-card' : ''}`}
                        onClick={() => setActiveIndex(idx)}
                      >
                        {/* Photo & Speech Bubble */}
                        <div className="toppers-card-photo-wrapper">
                          {photoUrl ? (
                            <img 
                              src={photoUrl} 
                              alt={topper.name} 
                              className="toppers-card-photo" 
                              loading="lazy" 
                            />
                          ) : (
                            <div className="toppers-card-photo-fallback">
                              <div className="fallback-initial-badge">{(topper.name || 'S')[0].toUpperCase()}</div>
                            </div>
                          )}
                          
                          {displayQuote && (
                            <div className="toppers-card-quote-bubble">
                              "{displayQuote.length > 55 ? `${displayQuote.slice(0, 55)}...` : displayQuote}"
                            </div>
                          )}
                        </div>

                        {/* Card Body */}
                        <div className="toppers-card-body">
                          <div className="toppers-card-name">{topper.name}</div>
                          <div className="toppers-card-exam">
                            {topper.exam} {topper.year ? `(${topper.year})` : ''} {topper.rank ? `• AIR ${topper.rank}` : ''}
                          </div>

                          <p className="toppers-card-story-snippet">
                            {topper.story ? (topper.story.length > 70 ? `${topper.story.slice(0, 70)}...` : topper.story) : 'A journey of discipline, dedication and daily practice.'}
                          </p>

                          <button 
                            className="toppers-read-story-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedStory(topper)
                            }}
                          >
                            Read Story <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <button className="toppers-arrow-btn" onClick={handleNext} aria-label="Next story">
                  <ChevronRight size={24} />
                </button>
              </>
            ) : (
              /* Clean Empty State when category has no matching items */
              <div className="toppers-empty-box">
                <SearchX size={44} style={{ color: 'var(--gold-light)', marginBottom: '0.85rem' }} />
                <h4 style={{ color: '#FFFFFF', fontSize: '1.25rem', marginBottom: '0.4rem', fontFamily: 'var(--font-display)' }}>
                  No Stories Found in {activeCategoryLabel}
                </h4>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto 1.25rem auto' }}>
                  There are currently no featured achievers listed under the {activeCategoryLabel} category.
                </p>
                <button 
                  className="toppers-tab active"
                  onClick={() => setActiveCategory('all')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  View All Stories
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Carousel Dots */}
        {currentList.length > 0 && (
          <div className="toppers-dots">
            {currentList.map((_, i) => (
              <span
                key={i}
                className={`toppers-dot ${i === activeIndex ? 'active' : ''}`}
                onClick={() => setActiveIndex(i)}
              />
            ))}
          </div>
        )}

        {/* Bottom Feature Bar */}
        <div className="toppers-bottom-bar" style={{ marginTop: '1.75rem' }}>
          <div className="toppers-features-list">
            <div className="toppers-feature-item">
              <BookOpen className="toppers-feature-icon" size={24} />
              <div>
                <div className="toppers-feature-title">Diverse Backgrounds</div>
                <div className="toppers-feature-desc">Students from towns, cities and rural areas</div>
              </div>
            </div>

            <div className="toppers-feature-item">
              <UserCheck className="toppers-feature-icon" size={24} />
              <div>
                <div className="toppers-feature-title">Expert Guidance</div>
                <div className="toppers-feature-desc">By experienced faculty and mentors</div>
              </div>
            </div>

            <div className="toppers-feature-item">
              <TrendingUp className="toppers-feature-icon" size={24} />
              <div>
                <div className="toppers-feature-title">Consistent Practice</div>
                <div className="toppers-feature-desc">Through mock tests and analysis</div>
              </div>
            </div>

            <div className="toppers-feature-item">
              <Target className="toppers-feature-icon" size={24} />
              <div>
                <div className="toppers-feature-title">Remarkable Results</div>
                <div className="toppers-feature-desc">Across competitive exams</div>
              </div>
            </div>
          </div>

          <Link to="/why-nermai" className="toppers-view-all-btn">
            <span>View All Success Stories</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>

      {/* Full Story Modal */}
      {selectedStory && (
        <div className="toppers-modal-overlay" onClick={() => setSelectedStory(null)}>
          <div className="toppers-modal-content" onClick={e => e.stopPropagation()}>
            <button className="toppers-modal-close" onClick={() => setSelectedStory(null)}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              {getTopperPhoto(selectedStory) ? (
                <img 
                  src={getTopperPhoto(selectedStory)} 
                  alt={selectedStory.name}
                  style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold)' }}
                />
              ) : (
                <div style={{
                  width: '90px', height: '90px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #D4AF37, #996515)',
                  color: '#1A1008', fontSize: '2.5rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--gold)', fontFamily: 'Georgia, serif'
                }}>
                  {(selectedStory.name || 'S')[0].toUpperCase()}
                </div>
              )}
              <div>
                <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: '#fff', marginBottom: '4px' }}>
                  {selectedStory.name}
                </h3>
                <div style={{ color: 'var(--gold-light)', fontWeight: 700, fontSize: '1rem' }}>
                  {selectedStory.exam} {selectedStory.year ? `(${selectedStory.year})` : ''} {selectedStory.rank ? `• AIR ${selectedStory.rank}` : ''}
                </div>
              </div>
            </div>

            {selectedStory.quote && (
              <blockquote style={{ 
                fontStyle: 'italic', color: 'var(--gold-light)', fontSize: '1.1rem',
                borderLeft: '3px solid var(--gold)', paddingLeft: '1rem', margin: '1rem 0 1.5rem 0',
                background: 'rgba(212, 175, 55, 0.1)', padding: '1rem', borderRadius: '0 12px 12px 0'
              }}>
                {selectedStory.quote}
              </blockquote>
            )}

            <div style={{ lineHeight: 1.7, opacity: 0.9, fontSize: '0.98rem' }}>
              {selectedStory.story || 'Nermai IAS Academy is proud of our student’s dedication and outstanding result.'}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

