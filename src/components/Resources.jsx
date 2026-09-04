import React from 'react'

const RESOURCES = [
  {
    icon: 'fa-solid fa-book',
    title: 'Study Materials',
    desc: 'Download free preparation materials, handouts, and revision notes.',
    link: '#lms-platform'
  },
  {
    icon: 'fa-solid fa-pen-to-square',
    title: 'Free Model Tests',
    desc: 'Practice before the examination with our standard mock tests.',
    link: '#lms-platform'
  },
  {
    icon: 'fa-regular fa-newspaper',
    title: 'Current Affairs',
    desc: 'Daily and weekly current affairs compilations in Tamil and English.',
    link: '#lms-platform'
  },
  {
    icon: 'fa-solid fa-list-check',
    title: 'Syllabus',
    desc: 'Detailed syllabus for UPSC, TNPSC, Police, and Banking exams.',
    link: '#lms-platform'
  },
  {
    icon: 'fa-solid fa-video',
    title: 'Free Classes',
    desc: 'Watch selected free video lessons and strategy sessions.',
    link: '#lms-platform'
  },
  {
    icon: 'fa-solid fa-file-lines',
    title: 'Previous Questions',
    desc: 'Access previous year question papers with answer keys.',
    link: '#lms-platform'
  }
]

export default function Resources() {
  return (
    <section className="resources-section section" id="resources" style={{ backgroundColor: 'var(--gray-50)' }}>
      <div className="container">
        <div className="section-header">
          <span className="eyebrow">FREE RESOURCES</span>
          <h2 className="section-title">Free Training Resources</h2>
          <p className="section-desc">
            Free resources we provide to enhance your preparation.
          </p>
        </div>

        <div className="resources-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
          {RESOURCES.map((res, i) => (
            <a 
              key={i} 
              href={res.link}
              className="resource-card reveal" 
              style={{ 
                display: 'flex', 
                gap: 'var(--space-4)', 
                backgroundColor: 'var(--white)', 
                padding: 'var(--space-5)', 
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--gray-200)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                transitionDelay: `${i * 0.05}s`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--saffron)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--gray-200)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="resource-icon" style={{ 
                width: '48px', height: '48px', flexShrink: 0, 
                backgroundColor: 'rgba(212,175,55,0.12)', color: 'var(--saffron)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                borderRadius: 'var(--radius)', fontSize: '1.25rem' 
              }}>
                <i className={res.icon}></i>
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>{res.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: '8px' }}>{res.desc}</p>
                <span style={{ fontSize: '0.8rem', color: 'var(--saffron)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Access Now <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.7rem' }}></i>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
