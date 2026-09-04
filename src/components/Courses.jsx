import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { fbFirestore } from '../firebase/firestore'
import { driveStorage } from '../services/driveStorage'
import { useReveal } from '../hooks/useReveal'
import { ArrowRight, CheckCircle, BookOpen, FileText, UserCircle, Zap, Bookmark, Monitor, GraduationCap, Target, ChevronLeft, ChevronRight } from 'lucide-react'
import './Courses.css'

const ICON_MAP = {
  CheckCircle, BookOpen, FileText, UserCircle, Zap, Bookmark, Monitor, GraduationCap, Target
}

const DEFAULT_COURSES = [
  {
    id: 'upsc-civil-services',
    title: 'UPSC',
    subTitle: 'Civil Services Examination',
    categoryId: 'upsc',
    coverImageUrl: '',
    logoUrl: '',
    badges: ['UPSC', 'OFFLINE', 'ENGLISH & TAMIL'],
    isPopular: true,
    shortDescription: 'Comprehensive coaching for Prelims, Mains & Interview by expert IAS mentors.',
    features: [
      { text: '1000+ hours offline coaching', icon: 'Target' },
      { text: '100+ Prelims/Mains mock tests', icon: 'CheckCircle' },
      { text: 'Comprehensive study materials', icon: 'BookOpen' },
      { text: 'Regular mentor sessions', icon: 'GraduationCap' }
    ],
    price: '₹ 35,000',
    priceLabel: 'Course Price',
    isActive: true,
  },
  {
    id: 'tnpsc-offline',
    title: 'TNPSC',
    subTitle: 'Tamil Nadu Public Service Commission',
    categoryId: 'tnpsc',
    coverImageUrl: '',
    logoUrl: '',
    badges: ['TNPSC', 'OFFLINE', 'TAMIL & ENGLISH'],
    shortDescription: 'Complete preparation for Tamil Nadu Public Service Commission exams.',
    features: [
      { text: 'Subject-wise expert faculty', icon: 'Target' },
      { text: 'Regular test series', icon: 'CheckCircle' },
      { text: 'Current affairs focus', icon: 'BookOpen' },
      { text: 'Interview guidance', icon: 'GraduationCap' }
    ],
    price: '₹ 20,000',
    priceLabel: 'Course Price',
    isActive: true,
  },
  {
    id: 'bank-offline',
    title: 'Banking',
    subTitle: 'Banking & Financial Services',
    categoryId: 'banking',
    coverImageUrl: '',
    logoUrl: '',
    badges: ['BANK', 'OFFLINE', 'TAMIL & ENGLISH'],
    shortDescription: 'Prepare for IBPS, SBI & Insurance exams for all stages with expert faculty.',
    features: [
      { text: 'Covers IBPS, SBI, RRB and more', icon: 'Target' },
      { text: 'Practice tests & previous papers', icon: 'CheckCircle' },
      { text: 'Shortcuts & exam strategies', icon: 'BookOpen' },
      { text: 'Personality development', icon: 'GraduationCap' }
    ],
    price: '₹ 24,000',
    priceLabel: 'Course Price',
    isActive: true,
  },
  {
    id: 'ssc-offline',
    title: 'SSC',
    subTitle: 'Staff Selection Commission',
    categoryId: 'ssc',
    coverImageUrl: '',
    logoUrl: '',
    badges: ['SSC', 'OFFLINE', 'TAMIL & ENGLISH'],
    shortDescription: 'Comprehensive SSC & Central Govt exam preparation with full mock test series.',
    features: [
      { text: 'Complete syllabus coverage', icon: 'Target' },
      { text: 'Topic-wise mock tests', icon: 'CheckCircle' },
      { text: 'Study materials & doubt support', icon: 'BookOpen' },
      { text: 'Exam strategy sessions', icon: 'GraduationCap' }
    ],
    price: '₹ 25,000',
    priceLabel: 'Course Price',
    isActive: true,
  }
]

// Category Emblem SVGs for fallback rendering
function renderCategoryEmblem(categoryId) {
  const cat = (categoryId || '').toLowerCase()
  if (cat.includes('upsc')) {
    return (
      <svg viewBox="0 0 60 60" fill="none" width="52" height="52">
        <circle cx="30" cy="30" r="26" fill="#FFF8F0" stroke="#B87333" strokeWidth="2" />
        <path d="M30 12 L35 22 H25 Z M20 28 C20 24 40 24 40 28 V38 H20 Z M30 40 V48 H20 V50 H40 V48 H30 Z" fill="#B87333" />
        <circle cx="30" cy="33" r="3" fill="#D4AF37" />
      </svg>
    )
  }
  if (cat.includes('tnpsc')) {
    return (
      <svg viewBox="0 0 60 60" fill="none" width="52" height="52">
        <circle cx="30" cy="30" r="26" fill="#F4FAF6" stroke="#1B6B48" strokeWidth="2" />
        <path d="M30 10 L44 44 H16 Z M30 18 L38 38 H22 Z" fill="#1B6B48" opacity="0.8" />
        <circle cx="30" cy="28" r="4" fill="#D4AF37" />
      </svg>
    )
  }
  if (cat.includes('banking') || cat.includes('bank')) {
    return (
      <svg viewBox="0 0 60 60" fill="none" width="52" height="52">
        <circle cx="30" cy="30" r="26" fill="#F0F4FA" stroke="#1D4ED8" strokeWidth="2" />
        <path d="M15 22 L30 12 L45 22 H15 Z M18 25 H22 V42 H18 Z M28 25 H32 V42 H28 Z M38 25 H42 V42 H38 Z M14 44 H46 V48 H14 Z" fill="#1D4ED8" />
      </svg>
    )
  }
  if (cat.includes('ssc')) {
    return (
      <svg viewBox="0 0 60 60" fill="none" width="52" height="52">
        <circle cx="30" cy="30" r="26" fill="#FAF5EF" stroke="#C85A17" strokeWidth="2" />
        <path d="M30 14 L42 22 V38 L30 46 L18 38 V22 Z" stroke="#C85A17" strokeWidth="2.5" fill="none" />
        <path d="M26 30 L30 34 L36 26" stroke="#C85A17" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  }
  return <GraduationCap size={44} style={{ color: '#7B1B2E' }} />
}

export default function Courses({ hideHeader = false, layout = 'grid' }) {
  const [categories, setCategories] = useState([])
  const [courses, setCourses] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeIdx, setActiveIdx] = useState(0)
  const [perView, setPerView] = useState(4)

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s && s.homeContent) {
        if (s.homeContent.courseCategories && s.homeContent.courseCategories.length > 0) {
          setCategories(s.homeContent.courseCategories)
        }
        if (s.homeContent.courses && s.homeContent.courses.length > 0) {
          setCourses(s.homeContent.courses)
        } else {
          setCourses(DEFAULT_COURSES)
        }
      } else {
        setCourses(DEFAULT_COURSES)
      }
    })
  }, [])

  // Responsive perView logic
  useEffect(() => {
    const updatePerView = () => {
      if (window.innerWidth < 768) {
        setPerView(1)
      } else if (window.innerWidth < 1100) {
        setPerView(2)
      } else {
        setPerView(3)
      }
    }
    updatePerView()
    window.addEventListener('resize', updatePerView)
    return () => window.removeEventListener('resize', updatePerView)
  }, [])

  const displayCourses = courses.length > 0 ? courses : DEFAULT_COURSES

  const filteredCourses = useMemo(() => {
    let filtered = displayCourses.filter(c => c.isActive !== false)
    if (activeCategory !== 'all') {
      filtered = filtered.filter(c => {
        if (!c.categoryId) {
          const titleLower = (c.title || '').toLowerCase()
          return titleLower.includes(activeCategory.toLowerCase())
        }
        const cat = c.categoryId.toLowerCase().trim()
        const active = activeCategory.toLowerCase().trim()
        if (cat === active) return true
        const titleLower = (c.title || '').toLowerCase()
        const badgeLower = (c.badges || []).join(' ').toLowerCase()
        return titleLower.includes(active) || badgeLower.includes(active)
      })
    }
    return filtered
  }, [displayCourses, activeCategory])

  useReveal([activeCategory, filteredCourses])

  const renderIcon = (iconName) => {
    const IconComponent = ICON_MAP[iconName] || Target
    return <IconComponent size={15} className="replicated-course-feature-icon" />
  }

  const total = filteredCourses.length
  const maxOffset = Math.max(0, total - perView)
  const currentOffset = Math.min(activeIdx, maxOffset)

  const handlePrev = () => setActiveIdx(prev => (prev === 0 ? maxOffset : prev - 1))
  const handleNext = () => setActiveIdx(prev => (prev >= maxOffset ? 0 : prev + 1))

  return (
    <section className="replicated-courses-section" id="courses">
      <div className="container" style={{ maxWidth: '1480px' }}>
        
        {/* Section Header */}
        {!hideHeader && (
          <div className="replicated-courses-header">
            <div className="replicated-courses-top-tag">
              <span className="tag-line" />
              <span className="tag-text">OUR COURSES</span>
              <span className="tag-line" />
            </div>
            <h2 className="replicated-courses-main-title">Choose Your Path to a Brighter Future</h2>
            <p className="replicated-courses-subtitle">Structured courses, expert guidance and proven results for every aspirant.</p>
          </div>
        )}

        {/* Content Row with Left Accent, Filter Tabs + Grid, Right Accent */}
        <div className="replicated-courses-content-row">
          
          {/* Far Left Decorative Element */}
          <div className="courses-accent-left" aria-hidden="true">
            <div className="left-handwriting">
              <span>Learn</span>
              <span>Prepare</span>
              <span className="sub">Succeed</span>
            </div>
            <svg className="left-lines-svg" viewBox="0 0 50 20" stroke="#C85A17" strokeWidth="1.5">
              <path d="M5 10 Q25 18 45 10 M10 15 Q25 20 40 15" fill="none" opacity="0.6" />
            </svg>
          </div>

          {/* Center Content Box: Category Filter Pills + Course Cards Grid */}
          <div className="replicated-courses-center-box">
            
            {/* Category Filter Pills */}
            <div className="replicated-filter-pills-row">
              <button
                className={`replicated-filter-pill ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => { setActiveCategory('all'); setActiveIdx(0) }}
              >
                All Courses
              </button>
              {categories.filter(c => c.isVisible && c.id !== 'all').map(cat => (
                <button
                  key={cat.id}
                  className={`replicated-filter-pill ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => { setActiveCategory(cat.id); setActiveIdx(0) }}
                >
                  {cat.shortName || cat.name}
                </button>
              ))}
              {categories.length === 0 && (
                <>
                  <button className={`replicated-filter-pill ${activeCategory === 'upsc' ? 'active' : ''}`} onClick={() => { setActiveCategory('upsc'); setActiveIdx(0) }}>UPSC</button>
                  <button className={`replicated-filter-pill ${activeCategory === 'tnpsc' ? 'active' : ''}`} onClick={() => { setActiveCategory('tnpsc'); setActiveIdx(0) }}>TNPSC</button>
                  <button className={`replicated-filter-pill ${activeCategory === 'banking' ? 'active' : ''}`} onClick={() => { setActiveCategory('banking'); setActiveIdx(0) }}>Banking</button>
                  <button className={`replicated-filter-pill ${activeCategory === 'ssc' ? 'active' : ''}`} onClick={() => { setActiveCategory('ssc'); setActiveIdx(0) }}>SSC</button>
                  <button className={`replicated-filter-pill ${activeCategory === 'puducherry' ? 'active' : ''}`} onClick={() => { setActiveCategory('puducherry'); setActiveIdx(0) }}>Puducherry Govt.</button>
                </>
              )}
            </div>

            {/* Course Cards Carousel / Slider */}
            <div className="replicated-carousel-wrapper">
              
              {/* Left Nav Arrow */}
              {total > perView && (
                <button className="replicated-nav-arrow arrow-left" onClick={handlePrev} aria-label="Previous Courses">
                  <ChevronLeft size={20} />
                </button>
              )}

              {/* Viewport & Track */}
              <div className="replicated-cards-viewport">
                <div 
                  className="replicated-cards-track"
                  style={{
                    transform: perView === 1
                      ? `translateX(-${currentOffset * 100}%)`
                      : `translateX(calc(-${currentOffset} * ((100% - ${(perView - 1) * 1.25}rem) / ${perView} + 1.25rem)))`,
                    transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {filteredCourses.map((course, i) => {
                    const coverImg = driveStorage.formatImageUrl(course.coverImageUrl || course.bannerImage || course.imageUrl)
                    const logoImg = course.logoUrl ? driveStorage.formatImageUrl(course.logoUrl) : null
                    const isPopular = course.isPopular || course.isFeatured || (course.badges && course.badges.some(b => b.toLowerCase().includes('popular'))) || i === 0
                    const isHighlighted = i === activeIdx

                    const courseTitle = course.title || course.name || 'Competitive Exam Course'
                    const courseSub = course.subTitle || (course.categoryId ? `${course.categoryId.toUpperCase()} Preparation` : 'Civil Services Examination')
                    const featuresList = (course.features && course.features.length > 0) ? course.features : [
                      { text: 'Comprehensive offline coaching', icon: 'Target' },
                      { text: 'Prelims & Mains mock test series', icon: 'CheckCircle' },
                      { text: 'Structured study materials & notes', icon: 'BookOpen' },
                      { text: 'Regular mentor guidance sessions', icon: 'GraduationCap' }
                    ]

                    return (
                      <div 
                        key={course.id || i}
                        className={`replicated-course-card ${isHighlighted || isPopular ? 'active-highlight' : ''}`}
                        style={{
                          flex: perView === 1 
                            ? '0 0 100%' 
                            : `0 0 calc((100% - ${(perView - 1) * 1.25}rem) / ${perView})`
                        }}
                        onClick={() => setActiveIdx(i)}
                      >
                        {/* Top Cover Banner */}
                        {/* Top Cover Banner */}
                        <div className="replicated-card-banner">
                          {coverImg ? (
                            <img src={coverImg} alt={courseTitle} className="replicated-banner-img" loading="lazy" />
                          ) : (
                            <div className={`replicated-banner-fallback cat-${(course.categoryId || 'default').toLowerCase()}`}>
                              <span className="banner-fallback-title">{course.categoryId ? course.categoryId.toUpperCase() : 'COURSES'}</span>
                            </div>
                          )}

                          {/* Popular Pill Badge */}
                          {isPopular && (
                            <div className="replicated-popular-badge">
                              ★ Most Popular
                            </div>
                          )}
                        </div>

                        {/* Circular Logo Emblem overlapping boundary */}
                        <div className="replicated-emblem-circle">
                          {logoImg ? (
                            <img src={logoImg} alt={courseTitle} className="replicated-emblem-img" />
                          ) : (
                            renderCategoryEmblem(course.categoryId || course.title)
                          )}
                        </div>

                        {/* Card Body */}
                        <div className="replicated-card-body">
                          
                          <h3 className="replicated-card-title">{courseTitle}</h3>
                          <div className="replicated-card-sub">{courseSub}</div>

                          {/* 4 Feature Items */}
                          <div className="replicated-card-features">
                            {featuresList.slice(0, 4).map((feat, fIdx) => (
                              <div key={fIdx} className="replicated-feature-item">
                                {renderIcon(feat.icon)}
                                <span>{feat.text}</span>
                              </div>
                            ))}
                          </div>

                          {/* Bottom CTA Pill Button */}
                          <div className="replicated-card-cta-row">
                            <Link 
                              to={`/courses/${course.id || course.slug}`} 
                              className={`replicated-details-btn ${isHighlighted || isPopular ? 'btn-solid-maroon' : 'btn-outline-maroon'}`}
                            >
                              <span>View Details</span>
                              <ArrowRight size={14} />
                            </Link>
                          </div>

                        </div>

                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right Nav Arrow */}
              {total > perView && (
                <button className="replicated-nav-arrow arrow-right" onClick={handleNext} aria-label="Next Courses">
                  <ChevronRight size={20} />
                </button>
              )}

            </div>

            {/* Pagination Dots */}
            {total > perView && (
              <div className="replicated-courses-dots">
                {Array.from({ length: maxOffset + 1 }).map((_, idx) => (
                  <button
                    key={idx}
                    className={`courses-dot ${idx === currentOffset ? 'active' : ''}`}
                    onClick={() => setActiveIdx(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}

          </div>

          {/* Far Right Tilted Script Accent */}
          <div className="courses-accent-right" aria-hidden="true">
            <div className="right-script-box">
              <span>Different Aspirations</span>
              <span className="accent-underline">One Destination</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
