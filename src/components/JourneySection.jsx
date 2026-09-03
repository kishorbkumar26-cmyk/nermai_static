import { useEffect, useRef, useState } from 'react'
import './JourneySection.css'
import { driveStorage } from '../services/driveStorage'

const DEFAULT_STEPS = [
  { id: 1, title: 'உங்கள் இலக்கை தேர்வு செய்யுங்கள்', description: 'Choose from TNPSC, UPSC, Police or Banking on our Website.' },
  { id: 2, title: 'பயிற்சியை தேர்வு செய்யுங்கள்', description: 'Find the right batch and course structure for your needs.' },
  { id: 3, title: 'Join Class Platform', description: 'Redirect to our dedicated learning management portal.' },
  { id: 4, title: 'பயிற்சி + தேர்வுகள்', description: 'Attend classes, take mock tests, and track your progress.' },
  { id: 5, title: 'இலக்கை அடையுங்கள்', description: 'Clear the exam and become a Government Officer.' }
]

export default function JourneySection({ steps = DEFAULT_STEPS }) {
  const sectionRef = useRef(null)
  const timelineRef = useRef(null)

  useEffect(() => {
    const timeline = timelineRef.current
    const steps = sectionRef.current?.querySelectorAll('.journey-step')
    const reveals = sectionRef.current?.querySelectorAll('.reveal')

    if (!timeline || !steps || !reveals) return

    /* ================================
       HEADER REVEAL
    ================================ */
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.15 }
    )

    reveals.forEach((element) => {
      revealObserver.observe(element)
    })

    /* ================================
       TIMELINE ACTIVATION
    ================================ */
    const timelineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            timeline.classList.add('animate')

            /* Sequential Step Animation */
            steps.forEach((step, index) => {
              setTimeout(() => {
                step.classList.add('active')
              }, index * 350)
            })

            timelineObserver.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2 }
    )

    timelineObserver.observe(timeline)

    /* ================================
       ACTIVE STEP ON SCROLL
    ================================ */
    const stepObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            steps.forEach((step) => {
              step.classList.remove('current')
            })
            entry.target.classList.add('current')
          }
        })
      },
      { threshold: 0.65 }
    )

    steps.forEach((step) => {
      stepObserver.observe(step)
    })

    return () => {
      revealObserver.disconnect()
      timelineObserver.disconnect()
      stepObserver.disconnect()
    }
  }, [steps])

  const hasAnyImages = steps.some((step) => step.imageUrl && step.imageUrl.trim() !== '')

  // Initial state for image viewer
  const firstAvailableImageIndex = steps.findIndex((step) => step.imageUrl && step.imageUrl.trim() !== '')
  const [activeStepIndex, setActiveStepIndex] = useState(
    firstAvailableImageIndex !== -1 ? firstAvailableImageIndex : null
  )

  const activeImage = activeStepIndex !== null && steps[activeStepIndex] ? steps[activeStepIndex].imageUrl : null
  
  // Provide CSS classes for node colors based on index
  const stepColors = ['step-orange', 'step-outline', 'step-maroon', 'step-outline-dark', 'step-green']

  return (
    <section className={`journey-section ${hasAnyImages ? 'has-images' : 'no-images'}`} id="journey" ref={sectionRef}>
      
      <div className="journey-header reveal">
        <span className="section-label">YOUR JOURNEY</span>
        <h2>Your Journey with Nermai</h2>
        <p>
          How our two platforms work together to guarantee your success.
        </p>
      </div>

      <div className="journey-layout">
        {/* LEFT / CENTER FLOW */}
        <div className="journey-timeline-wrapper">
          <div className="journey-timeline" ref={timelineRef}>

            {/* Animated Background Line */}
            <div className="timeline-line">
              <div className="timeline-progress"></div>
            </div>

            {steps.map((step, index) => {
              const colorClass = stepColors[index % stepColors.length]
              
              return (
                <div
                  key={step.id || index}
                  className={`journey-step ${colorClass} reveal-step`}
                  onMouseEnter={() => {
                    if (step.imageUrl) {
                      setActiveStepIndex(index)
                    }
                  }}
                  onClick={() => {
                    if (step.imageUrl) {
                      setActiveStepIndex(index)
                    }
                  }}
                >
                  <div className="step-node">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="step-content">
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT IMAGE VIEWER */}
        {hasAnyImages && (
          <div className="journey-image-viewer reveal">
            {activeImage && (
              <img
                key={activeImage} // Force re-render for animation on change
                src={driveStorage.formatImageUrl(activeImage)}
                alt="Journey Step"
                className="journey-image"
              />
            )}
          </div>
        )}
      </div>

      <div className="journey-action reveal">
        <a href="#courses" className="journey-btn">
          <span>JOIN NERMAI</span>
          <span className="btn-arrow">→</span>
        </a>
      </div>

    </section>
  )
}
