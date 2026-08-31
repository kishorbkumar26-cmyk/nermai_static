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
  
  const [footerData, setFooterData] = useState(null)

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
      if (s.footer) {
        setFooterData(s.footer)
      }
    })
  }, [])

  // Provide a safe fallback if Firestore footer data is missing during transition
  const f = footerData || {
    cta: {
      heading: "Begin It's first step to success",
      sub: "Contact us for registration, seat availability, feedback or complaints",
      btnText: "Contact Us",
      btnLink: "/contact"
    },
    brand: {
      desc: "An institution run & administered by the volunteers of Nermai Trust & Nermai Samuga Iyakkam, with an objective to empower youths especially from rural & Economically/Socially weaker sections in public employment (Government Recruitments).",
      badge: "Non Profit · Non Commercial"
    },
    contact: {
      address: "No. 156 / 3, (1st & 2nd Floor), Nanbargal Nagar,\nPondy – Villianur Main Road, Oulgaret,\nPuducherry – 605 010",
      phones: CONTACT.phones.join(', '),
      email: CONTACT.email
    },
    usefulLinks: [
      { label: 'Examinations', link: '/#examinations' },
      { label: 'Gallery', link: '/#gallery' },
      { label: 'About Us', link: '/why-nermai' },
      { label: 'Contact Us', link: '/contact' },
      { label: 'All Courses', link: '/courses' }
    ],
    notifications: [
      { label: 'Banking', link: LMS_URL },
      { label: 'Exam Notifications', link: LMS_URL },
      { label: 'Study Material', link: LMS_URL },
      { label: 'Pondicherry Recruitments', link: LMS_URL },
      { label: 'Central Recruitments', link: LMS_URL }
    ],
    coursesLinks: COURSES.slice(0, 4).map(c => ({ label: c.name, link: `/courses/${c.slug}` })),
    bottom: {
      meta: "Non Profit | Non Commercial"
    }
  }


  return (
    <footer className="site-footer" id="contact">

      {/* CTA Banner */}
      <div className="footer-cta-banner">
        <div className="container">
          <div className="footer-cta-inner">
            <div>
              <h3 className="footer-cta-heading">{f.cta.heading}</h3>
              <p className="footer-cta-sub">{f.cta.sub}</p>
            </div>
            <a href={f.cta.btnLink || "/contact"} className="btn btn-primary footer-cta-btn">
              <i className="fa-solid fa-envelope" style={{ marginRight: '8px' }} />
              {f.cta.btnText}
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
              <p className="footer-brand-desc">{f.brand.desc}</p>
              <div className="footer-tagline-badge">{f.brand.badge}</div>
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
                  <span style={{ whiteSpace: 'pre-wrap' }}>
                    {f.contact.address}
                  </span>
                </div>
                {(f.contact.phones || '').split(',').map(ph => ph.trim()).filter(Boolean).map(ph => (
                  <div key={ph} className="footer-contact-item">
                    <i className="fa-solid fa-phone footer-contact-icon" />
                    <a href={`tel:${ph.replace(/\s/g, '')}`} className="footer-link">{ph}</a>
                  </div>
                ))}
                <div className="footer-contact-item">
                  <i className="fa-solid fa-envelope footer-contact-icon" />
                  <a href={`mailto:${f.contact.email}`} className="footer-link">{f.contact.email}</a>
                </div>
              </div>
            </div>

            {/* Useful Links */}
            <div className="footer-col">
              <div className="footer-col-title">Useful Links</div>
              <ul className="footer-links">
                {(f.usefulLinks || []).map((lnk, i) => (
                  <li key={i}>
                    {lnk.link.startsWith('/') || lnk.link.startsWith('#') ? (
                      <Link to={lnk.link} className="footer-link">{lnk.label}</Link>
                    ) : (
                      <a href={lnk.link} target="_blank" rel="noopener noreferrer" className="footer-link">{lnk.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Notifications */}
            <div className="footer-col">
              <div className="footer-col-title">Notifications</div>
              <ul className="footer-links">
                {(f.notifications || []).map((lnk, i) => (
                  <li key={i}>
                    <a href={lnk.link} className="footer-link" target="_blank" rel="noopener noreferrer">{lnk.label}</a>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: '2rem' }}>
                <div className="footer-col-title" style={{ marginBottom: '0.75rem' }}>Courses</div>
                <ul className="footer-links">
                  {(f.coursesLinks || []).map((lnk, i) => (
                    <li key={i}>
                      {lnk.link.startsWith('/') ? (
                        <Link to={lnk.link} className="footer-link">{lnk.label}</Link>
                      ) : (
                        <a href={lnk.link} className="footer-link">{lnk.label}</a>
                      )}
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
              {f.bottom.meta}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
