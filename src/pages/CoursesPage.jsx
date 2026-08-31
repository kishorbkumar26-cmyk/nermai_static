import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useReveal } from '../hooks/useReveal'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { COURSES, LMS_URL } from '../constants'
import { fbFirestore } from '../firebase/firestore'

export default function CoursesPage() {
  const [courses, setCourses] = useState(COURSES)

  useEffect(() => {
    window.scrollTo(0, 0)
    fbFirestore.getSettings().then(s => {
      if (s.homeContent?.courses?.length) {
        setCourses(s.homeContent.courses)
      }
    })
  }, [])

  useReveal([courses])

  return (
    <>
      <Header />
      <main style={{ paddingTop: '80px' }}>

        {/* Page Hero */}
        <section className="page-hero" style={{ backgroundColor: 'var(--maroon)', color: 'var(--white)' }}>
          <div className="container">
            <div className="page-hero-inner">
              <span className="eyebrow" style={{ color: 'var(--saffron)', marginBottom: '1rem', display: 'block' }}>
                ALL COURSES
              </span>
              <h1 className="display-large" style={{ color: 'var(--white)', marginBottom: '1rem' }}>
                Choose Your Path to Government Service
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '580px', lineHeight: 1.8 }}>
                Renowned coaching for UPSC (Civil Services), Puducherry UDC, LDC, Sub-Inspector,
                Deputy Tahsildar, TNPSC Group II and other competitive examinations.
              </p>
            </div>
          </div>
        </section>

        {/* Courses list */}
        <section className="section" style={{ backgroundColor: 'var(--cream)' }}>
          <div className="container">
            <div className="courses-page-list">
              {courses.filter(c => c.visible !== false).map((course, idx) => (
                <div key={course.slug} className="courses-page-row reveal">
                  <div className="courses-page-num" aria-hidden="true">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  {course.imageUrl ? (
                    <div className="courses-page-image-wrap">
                      <img src={course.imageUrl} alt={course.name} style={{ width: '100%', maxHeight: '120px', objectFit: 'contain' }} />
                    </div>
                  ) : (
                    <div className="courses-page-icon-wrap">
                      <span style={{ fontSize: '2.5rem' }}>{course.icon}</span>
                    </div>
                  )}
                  <div className="courses-page-body">
                    <h2 className="courses-page-name">{course.name}</h2>
                    <div className="courses-page-subname">{course.subname || course.subName}</div>
                    <p className="courses-page-desc">{course.desc || course.description}</p>
                    <div className="course-card-tags" style={{ marginTop: '0.75rem' }}>
                      {course.tags.map(tag => (
                        <span key={tag} className="course-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="courses-page-actions">
                    <Link
                      to={`/courses/${course.slug}`}
                      className="btn btn-outline"
                      id={`courses-page-details-${course.slug}`}
                    >
                      View Details
                    </Link>
                    <a
                      href={LMS_URL}
                      className="btn btn-primary"
                      id={`courses-page-enroll-${course.slug}`}
                    >
                      Enroll
                      <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }} />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Enroll CTA */}
            <div className="courses-page-cta reveal">
              <div className="courses-page-cta-inner">
                <div>
                  <h3 style={{ marginBottom: '0.5rem' }}>Not sure which course to pick?</h3>
                  <p style={{ color: 'var(--gray-500)', margin: 0 }}>
                    Contact us and our counselors will guide you to the right programme.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <a href={LMS_URL} className="btn btn-primary" id="courses-page-enroll-all">
                    Enroll Now
                  </a>
                  <Link to="/contact" className="btn btn-outline">Contact Us</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
