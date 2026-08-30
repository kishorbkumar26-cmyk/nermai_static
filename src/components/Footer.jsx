import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fbFirestore } from '../firebase/firestore'
import { LMS_URL, CONTACT, COURSES } from '../constants'

export default function Footer() {
  const [socials, setSocials] = useState({
    facebook: CONTACT.facebook,
    instagram: CONTACT.instagram,
    youtube: CONTACT.youtube,
    twitter: CONTACT.twitter,
  })

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s.siteInfo) {
        // Only update social links from Firestore, not critical contact info
        setSocials(prev => ({
          ...prev,
          ...(s.siteInfo.facebook  ? { facebook:  s.siteInfo.facebook }  : {}),
          ...(s.siteInfo.instagram ? { instagram: s.siteInfo.instagram } : {}),
          ...(s.siteInfo.youtube   ? { youtube:   s.siteInfo.youtube }   : {}),
          ...(s.siteInfo.twitter   ? { twitter:   s.siteInfo.twitter }   : {}),
        }))
      }
    })
  }, [])


  return (
    <footer className="site-footer" id="contact">

      {/* CTA Banner */}
      <div className="footer-cta-banner">
        <div className="container">
          <div className="footer-cta-inner">
            <div>
              <h3 className="footer-cta-heading">Begin It's first step to success</h3>
              <p className="footer-cta-sub">
                Contact us for registration, seat availability, feedback or complaints
              </p>
            </div>
            <a href="/contact" className="btn btn-primary footer-cta-btn">
              <i className="fa-solid fa-envelope" style={{ marginRight: '8px' }} />
              Contact Us
            </a>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">

            {/* About */}
            <div className="footer-col">
              <div className="footer-col-brand">
                <div className="header-logo-mark" style={{ width: 40, height: 40, fontSize: '1.1rem' }}>ந</div>
                <span className="footer-brand-name">NERMAI IAS ACADEMY</span>
              </div>
              <p className="footer-brand-desc">
                An institution run & administered by the volunteers of Nermai Trust & Nermai Samuga Iyakkam,
                with an objective to empower youths especially from rural &amp; Economically/Socially weaker
                sections in public employment (Government Recruitments).
              </p>
              <div className="footer-tagline-badge">Non Profit &nbsp;·&nbsp; Non Commercial</div>
              <div className="footer-socials">
                <a href={socials.facebook} className="footer-social-btn" aria-label="Facebook" rel="noopener noreferrer" target="_blank">
                  <i className="fa-brands fa-facebook-f" />
                </a>
                <a href={socials.instagram} className="footer-social-btn" aria-label="Instagram" rel="noopener noreferrer" target="_blank">
                  <i className="fa-brands fa-instagram" />
                </a>
                <a href={socials.youtube || '#'} className="footer-social-btn" aria-label="YouTube" rel="noopener noreferrer" target="_blank">
                  <i className="fa-brands fa-youtube" />
                </a>
                <a href={socials.twitter || '#'} className="footer-social-btn" aria-label="Twitter / X" rel="noopener noreferrer" target="_blank">
                  <i className="fa-brands fa-x-twitter" />
                </a>
                <a href={`https://wa.me/${CONTACT.phones[0].replace(/\D/g, '')}`} className="footer-social-btn" aria-label="WhatsApp" rel="noopener noreferrer" target="_blank">
                  <i className="fa-brands fa-whatsapp" />
                </a>
              </div>
            </div>

            {/* Contact Info */}
            <div className="footer-col">
              <div className="footer-col-title">Contact Information</div>
              <div className="footer-contact-list">
                <div className="footer-contact-item">
                  <i className="fa-solid fa-location-dot footer-contact-icon" />
                  <span>
                    No. 156 / 3, (1st &amp; 2nd Floor), Nanbargal Nagar,<br />
                    Pondy – Villianur Main Road, Oulgaret,<br />
                    Puducherry – 605 010
                  </span>
                </div>
                {CONTACT.phones.map(ph => (
                  <div key={ph} className="footer-contact-item">
                    <i className="fa-solid fa-phone footer-contact-icon" />
                    <a href={`tel:${ph.replace(/\s/g, '')}`} className="footer-link">{ph}</a>
                  </div>
                ))}
                <div className="footer-contact-item">
                  <i className="fa-solid fa-envelope footer-contact-icon" />
                  <a href={`mailto:${CONTACT.email}`} className="footer-link">{CONTACT.email}</a>
                </div>
              </div>
            </div>

            {/* Useful Links */}
            <div className="footer-col">
              <div className="footer-col-title">Useful Links</div>
              <ul className="footer-links">
                <li><Link to="/#examinations" className="footer-link">Examinations</Link></li>
                <li><Link to="/#gallery" className="footer-link">Gallery</Link></li>
                <li><Link to="/why-nermai" className="footer-link">About Us</Link></li>
                <li><Link to="/contact" className="footer-link">Contact Us</Link></li>
                <li><Link to="/courses" className="footer-link">All Courses</Link></li>
              </ul>
            </div>

            {/* Notifications */}
            <div className="footer-col">
              <div className="footer-col-title">Notifications</div>
              <ul className="footer-links">
                <li><a href={LMS_URL} className="footer-link">Banking</a></li>
                <li><a href={LMS_URL} className="footer-link">Exam Notifications</a></li>
                <li><a href={LMS_URL} className="footer-link">Study Material</a></li>
                <li><a href={LMS_URL} className="footer-link">Pondicherry Recruitments</a></li>
                <li><a href={LMS_URL} className="footer-link">Central Recruitments</a></li>
              </ul>

              <div style={{ marginTop: '2rem' }}>
                <div className="footer-col-title" style={{ marginBottom: '0.75rem' }}>Courses</div>
                <ul className="footer-links">
                  {COURSES.slice(0, 4).map(c => (
                    <li key={c.slug}>
                      <Link to={`/courses/${c.slug}`} className="footer-link">{c.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-inner">
            <span className="footer-copyright">
              © {new Date().getFullYear()} Nermai IAS Academy. All rights reserved.
            </span>
            <span className="footer-bottom-meta">
              Non Profit &nbsp;|&nbsp; Non Commercial
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
