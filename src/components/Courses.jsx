import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { fbFirestore } from '../firebase/firestore'
import { driveStorage } from '../services/driveStorage'
import { ArrowRight, CheckCircle, BookOpen, FileText, UserCircle, Zap, Bookmark, Monitor, GraduationCap } from 'lucide-react'
import './Courses.css'

const ICON_MAP = {
  CheckCircle, BookOpen, FileText, UserCircle, Zap, Bookmark, Monitor, GraduationCap
}

export default function Courses({ hideHeader = false }) {
  const [categories, setCategories] = useState([])
  const [courses, setCourses] = useState([])
  const [config, setConfig] = useState({
    sectionHeading: 'Courses at NERMAI',
    highlightedWord: 'NERMAI',
    subHeading: 'Expert guidance for every stage of preparation'
  })
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s.homeContent) {
        if (s.homeContent.courseCategories) setCategories(s.homeContent.courseCategories)
        if (s.homeContent.courses) setCourses(s.homeContent.courses)
        if (s.homeContent.coursesConfig) setConfig(s.homeContent.coursesConfig)
      }
    })
  }, [])

  const filteredCourses = useMemo(() => {
    let filtered = courses.filter(c => c.isActive !== false) // treat undefined as active
    if (activeCategory !== 'all') {
      filtered = filtered.filter(c => c.categoryId === activeCategory)
    }
    return filtered
  }, [courses, activeCategory])

  const renderIcon = (iconName) => {
    const IconComponent = ICON_MAP[iconName] || CheckCircle
    return <IconComponent size={16} className="new-course-feature-icon" />
  }

  const renderSectionTitle = () => {
    const text = config.sectionHeading || 'Courses at NERMAI'
    const word = config.highlightedWord || 'NERMAI'
    if (!text.includes(word)) return text
    const parts = text.split(word)
    return (
      <>
        {parts[0]}<span style={{ color: 'var(--color-primary)' }}>{word}</span>{parts[1]}
      </>
    )
  }

  return (
    <section className="section" id="courses" style={{ backgroundColor: 'var(--color-background, #FAF9F7)' }}>
      <div className="container">
        {!hideHeader && (
          <div className="section-header text-center" style={{ marginBottom: '3rem' }}>
            <span className="section-label" style={{ display: 'inline-block', marginBottom: '1rem', color: 'var(--color-primary, #A00001)', fontWeight: 600, letterSpacing: '0.1em', fontSize: '0.85rem' }}>OUR PROGRAMS</span>
            <h2 className="display-large" style={{ marginBottom: '1rem' }}>
              {renderSectionTitle()}
            </h2>
            <p className="section-subtitle" style={{ color: 'var(--color-muted, #777777)', maxWidth: '600px', margin: '0 auto' }}>
              {config.subHeading || 'Expert guidance for every stage of preparation'}
            </p>
          </div>
        )}

        <div className="new-courses-tabs-wrapper">
          <div className="new-courses-tabs">
            <button
              className={`new-courses-tab ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All Courses
            </button>
            {categories.filter(c => c.isVisible && c.id !== 'all').map(cat => (
              <button
                key={cat.id}
                className={`new-courses-tab ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.shortName || cat.name}
              </button>
            ))}
            {!categories.find(c => c.id === 'others') && courses.some(c => c.categoryId === 'others' && c.isActive !== false) && (
              <button
                className={`new-courses-tab ${activeCategory === 'others' ? 'active' : ''}`}
                onClick={() => setActiveCategory('others')}
              >
                Others
              </button>
            )}
          </div>
        </div>

        <div className="courses-grid-wrapper">
          <div className="new-courses-grid">
            {filteredCourses.map((course, i) => {
              const coverImg = driveStorage.formatImageUrl(course.coverImageUrl)
              const logoImg = driveStorage.formatImageUrl(course.logoUrl)
              
              return (
                <div key={course.id || i} className="new-course-card reveal" style={{ '--reveal-delay': `${i * 100}ms` }}>
                  
                  {/* Cover Image — no logo overlay */}
                  <div className="new-course-image-wrapper">
                    {coverImg ? (
                      <>
                        <img src={coverImg} alt={course.title} className="new-course-image" loading="lazy" />
                        <div className="new-course-image-overlay" />
                      </>
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-secondary-bg)' }}>
                        <span style={{ color: 'var(--color-muted)', opacity: 0.5 }}>No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="new-course-body">
                    {course.badges && course.badges.length > 0 && (
                      <div className="new-course-badges">
                        {course.badges.join(' • ')}
                      </div>
                    )}
                    <h3 className="new-course-title">{course.title}</h3>
                    {course.shortDescription && (
                      <p className="new-course-desc">{course.shortDescription}</p>
                    )}
                    
                    {course.features && course.features.length > 0 && (
                      <ul className="new-course-features">
                        {course.features.map((feat, fIdx) => (
                          <li key={fIdx} className="new-course-feature-item">
                            {renderIcon(feat.icon)}
                            <span>{feat.text}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="new-course-footer">
                    <Link to={`/courses/${course.id || course.slug}`} className="new-course-enroll-btn">
                      View Details <ArrowRight size={16} className="btn-arrow" />
                    </Link>
                  </div>

                </div>
              )
            })}
          </div>

          {filteredCourses.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-muted)' }}>
              No courses found for this category.
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <Link to="/courses" className="btn btn-outline btn-lg" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
            View All Courses <ArrowRight size={16} style={{ marginLeft: '8px' }} />
          </Link>
        </div>
      </div>
    </section>
  )
}
