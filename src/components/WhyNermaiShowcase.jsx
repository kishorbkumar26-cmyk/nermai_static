import { Heart, BookOpen, ClipboardCheck, UserCheck, Laptop, Trophy, Users, GraduationCap, TrendingUp, ArrowRight } from 'lucide-react'
import { LMS_URL } from '../constants'
import './WhyNermaiShowcase.css'

const STEPS = [
  {
    num: '01',
    circleStyle: 'circle-maroon',
    icon: Heart,
    title: 'Non Profit Initiative',
    desc: 'Run entirely by volunteers. Our sole mission is to empower rural and economically weaker youth — not to profit from their aspirations.'
  },
  {
    num: '02',
    circleStyle: 'circle-cream',
    icon: BookOpen,
    title: 'Comprehensive Syllabus Coverage',
    desc: 'Every topic from Prelims to Mains is covered systematically. No gaps, no shortcuts — structured preparation from day one.'
  },
  {
    num: '03',
    circleStyle: 'circle-maroon',
    icon: ClipboardCheck,
    title: 'Regular Test Practice',
    desc: 'Frequent mock tests and topic-wise tests that closely mirror the actual exam pattern to build speed and accuracy.'
  },
  {
    num: '04',
    circleStyle: 'circle-cream',
    icon: UserCheck,
    title: 'Personal Guidance & Counseling',
    desc: 'One-on-one mentoring sessions to assess your strengths, address weaknesses, and keep you on the right track.'
  },
  {
    num: '05',
    circleStyle: 'circle-maroon',
    icon: Laptop,
    title: 'Offline & Online',
    desc: 'Attend classes at our Puducherry centre or learn from anywhere via our online platform — flexible learning your way.'
  },
  {
    num: '06',
    circleStyle: 'circle-cream',
    icon: Trophy,
    title: 'Result Driven Learning',
    desc: '187+ successful candidates across UPSC, TNPSC, Police and Puducherry Recruitments prove that our approach works.'
  }
]

export default function WhyNermaiShowcase() {
  return (
    <section className="why-showcase-section" id="features">
      {/* Background Building Watermark */}
      <div className="why-building-watermark" aria-hidden="true">
        <svg viewBox="0 0 400 300" fill="currentColor">
          {/* Dome & Pillars Heritage Silhouette */}
          <path d="M200 30 C170 30 150 60 140 90 L260 90 C250 60 230 30 200 30 Z" />
          <rect x="195" y="10" width="10" height="20" rx="2" />
          <polygon points="200,2 196,10 204,10" />
          <rect x="130" y="90" width="140" height="15" />
          <rect x="120" y="105" width="160" height="8" />
          {/* Columns */}
          <rect x="135" y="113" width="10" height="110" />
          <rect x="160" y="113" width="10" height="110" />
          <rect x="185" y="113" width="10" height="110" />
          <rect x="205" y="113" width="10" height="110" />
          <rect x="230" y="113" width="10" height="110" />
          <rect x="255" y="113" width="10" height="110" />
          {/* Base */}
          <rect x="110" y="223" width="180" height="15" />
          <rect x="90" y="238" width="220" height="20" />
          {/* Side Wings */}
          <rect x="40" y="140" width="80" height="83" />
          <rect x="280" y="140" width="80" height="83" />
          <rect x="50" y="160" width="18" height="35" rx="9" fill="#FAF6EE" />
          <rect x="82" y="160" width="18" height="35" rx="9" fill="#FAF6EE" />
          <rect x="295" y="160" width="18" height="35" rx="9" fill="#FAF6EE" />
          <rect x="327" y="160" width="18" height="35" rx="9" fill="#FAF6EE" />
        </svg>
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        
        {/* Header */}
        <div className="why-showcase-header">
          <div className="why-showcase-eyebrow">
            OUR FEATURES
          </div>
          <h2 className="why-showcase-title">
            What Makes Nermai Different
          </h2>
          <p className="why-showcase-subtitle">
            Every aspect of our academy is designed around one purpose — your success.
          </p>
        </div>

        {/* 6-Step Wavy Flow */}
        <div className="why-flow-container">
          
          {/* SVG Sine Wave Path with Gold Connector Dots */}
          <svg className="why-wave-svg" viewBox="0 0 1200 80" preserveAspectRatio="none">
            <path 
              d="M 10,40 C 40,65 70,65 100,40 C 150,15 250,15 300,40 C 350,65 450,65 500,40 C 550,15 650,15 700,40 C 750,65 850,65 900,40 C 950,15 1050,15 1100,40 C 1130,65 1170,65 1190,40" 
              fill="none" 
              stroke="#D4AF37" 
              strokeWidth="2.5" 
              strokeDasharray="6,6" 
              opacity="0.75"
            />
            {/* Connector Gold Dots */}
            <circle cx="20" cy="40" r="5" fill="#D4AF37" />
            <circle cx="200" cy="22" r="5" fill="#996515" />
            <circle cx="400" cy="58" r="5" fill="#996515" />
            <circle cx="600" cy="22" r="5" fill="#996515" />
            <circle cx="800" cy="58" r="5" fill="#996515" />
            <circle cx="1000" cy="22" r="5" fill="#996515" />
            <circle cx="1180" cy="40" r="5" fill="#D4AF37" />
          </svg>

          {/* 6 Step Columns */}
          <div className="why-steps-grid">
            {STEPS.map((step) => {
              const IconComp = step.icon
              return (
                <div key={step.num} className="why-step-col reveal visible">
                  <div className="why-step-number">{step.num}</div>
                  <div className={`why-step-circle ${step.circleStyle}`}>
                    <IconComp size={28} />
                  </div>
                  <h3 className="why-step-title">{step.title}</h3>
                  <div className="why-title-underline" />
                  <p className="why-step-desc">{step.desc}</p>
                </div>
              )
            })}
          </div>

        </div>

        {/* Bottom Bar: Quote + 3 Metrics + Cursive Note */}
        <div className="why-bottom-bar reveal visible">
          
          {/* Quote Block */}
          <div className="why-quote-block">
            <div className="why-quote-text">
              “Education is not a business for us, it's a responsibility.”
            </div>
            <div className="why-quote-author">
              NERMAI
            </div>
          </div>

          <div className="why-bar-divider" />

          {/* Metric 1 */}
          <div className="why-metric-item">
            <div className="why-metric-icon">
              <Users size={22} />
            </div>
            <div className="why-metric-content">
              <div className="why-metric-num">187+</div>
              <div className="why-metric-label">Successful Candidates</div>
            </div>
          </div>

          <div className="why-bar-divider" />

          {/* Metric 2 */}
          <div className="why-metric-item">
            <div className="why-metric-icon">
              <GraduationCap size={22} />
            </div>
            <div className="why-metric-content">
              <div className="why-metric-num">14+</div>
              <div className="why-metric-label">Years of Impact</div>
            </div>
          </div>

          <div className="why-bar-divider" />

          {/* Metric 3 */}
          <div className="why-metric-item">
            <div className="why-metric-icon">
              <TrendingUp size={22} />
            </div>
            <div className="why-metric-content">
              <div className="why-metric-num">Stronger</div>
              <div className="why-metric-label">Rural Youth, Brighter India</div>
            </div>
          </div>

          <div className="why-bar-divider" />

          {/* Handwritten Cursive Note */}
          <div className="why-cursive-block">
            <div className="why-cursive-note">
              Same Dedication.<br />A Brighter Tomorrow.
            </div>
            <svg className="why-cursive-underline" viewBox="0 0 160 16">
              <path d="M 5,10 Q 80,15 155,5" fill="none" stroke="#7B1B2E" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

        </div>

        {/* Action CTA Button */}
        <div className="why-cta-row reveal visible">
          <a href={LMS_URL} className="why-join-btn">
            JOIN NERMAI TODAY <ArrowRight size={18} />
          </a>
        </div>

      </div>
    </section>
  )
}

