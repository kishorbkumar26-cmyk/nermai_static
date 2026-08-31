import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fbFirestore } from '../firebase/firestore'
import { LMS_URL } from '../constants'

const DEFAULT_COURSES = [
  { icon: '🏛️', name: 'UPSC Civil Service',  subname: 'IAS / IPS / IFS',                      desc: "India's most prestigious exam. Comprehensive coaching for Prelims, Mains & Interview.", tags: ['CIVIL SERVICES','IAS','IPS','IFS'],                         slug: 'upsc' },
  { icon: '📋', name: 'TNPSC / Railways',    subname: 'GROUP I · II · IV · VAO',               desc: 'Complete preparation for Tamil Nadu Public Service Commission and Railway recruitment exams.', tags: ['GROUP I','GROUP II / IIA','GROUP IV','VAO'],             slug: 'tnpsc' },
  { icon: '📁', name: 'UDC / LDC / VAO',     subname: 'CLERICAL & REVENUE SERVICES',           desc: 'Focused coaching for Upper Division Clerk, Lower Division Clerk and Village Administrative Officer.', tags: ['UDC','LDC','VAO'],                             slug: 'udc-ldc' },
  { icon: '🏦', name: 'Banking',              subname: 'IBPS · SBI · RBI',                      desc: 'Structured coaching for IBPS PO, Clerk, SBI PO/Clerk, RBI Grade B and other banking exams.', tags: ['IBPS PO','IBPS CLERK','SBI PO','RBI GRADE B'],         slug: 'banking' },
  { icon: '🌿', name: 'Puducherry Exam',      subname: 'UDC · LDC · DEPUTY TAHSILDAR · SI',    desc: 'Specialised coaching for Puducherry Government recruitment — Deputy Tahsildar, Sub-Inspector, UDC, LDC.', tags: ['DEPUTY TAHSILDAR','SUB-INSPECTOR','UDC','LDC'], slug: 'puducherry' },
  { icon: '⚖️', name: 'SSC / PC / DT / SI',  subname: 'CENTRAL & STATE COMBINED',              desc: 'Coaching for SSC CGL, CHSL, Police Constable, Deputy Tahsildar and Sub-Inspector exams.', tags: ['SSC CGL','SSC CHSL','POLICE CONSTABLE','SUB-INSPECTOR'], slug: 'ssc' },
]

export default function Courses() {
  const [courses, setCourses] = useState(DEFAULT_COURSES)

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s.homeContent?.courses?.length) setCourses(s.homeContent.courses)
    })
  }, [])

  return (
    <section className="section" id="courses" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="container">
        <div className="section-header text-center" style={{ marginBottom: 'var(--space-12)' }}>
          <span className="eyebrow">OUR COURSES</span>
          <h2 className="section-title reveal">Renowned Coaching Institute for</h2>
          <p className="section-desc reveal">
            Renowned Coaching Institute for UPSC (Civil Services), Puducherry UDC, LDC, Sub-Inspector,
            Deputy Tahsildar, TNPSC Group II and Other Competitive Examinations.
          </p>
        </div>

        <div className="courses-grid">
          {courses.filter(c => c.visible !== false).map((course, i) => (
            <div key={i} className="course-card reveal" style={{ '--reveal-delay': `${i * 80}ms` }}>
              <div className="course-card-num">{String(i + 1).padStart(2, '0')}</div>
              {course.imageUrl ? (
                <img src={course.imageUrl} alt={course.name} className="course-card-image" />
              ) : (
                <div className="course-card-icon">{course.icon}</div>
              )}
              <div className="course-card-body">
                <div className="course-card-name">{course.name}</div>
                <div className="course-card-subname">{course.subname}</div>
                <p className="course-card-desc">{course.desc}</p>
                <div className="course-card-tags">
                  {(course.tags || []).map(tag => (
                    <span key={tag} className="course-tag">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="course-card-actions">
                <Link to={`/courses/${course.slug}`} className="btn btn-outline course-card-details">
                  View Details
                </Link>
                <a href={LMS_URL} className="btn btn-primary course-card-enroll" target="_blank" rel="noopener noreferrer">
                  Enroll
                </a>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
          <Link to="/courses" className="btn btn-outline btn-lg">
            View All Courses <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }} />
          </Link>
        </div>
      </div>
    </section>
  )
}
