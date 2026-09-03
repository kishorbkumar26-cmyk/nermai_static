import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fbFirestore } from '../firebase/firestore'
import { LMS_URL, CONTACT, COURSES } from '../constants'

export default function Footer() {
  const [footerData, setFooterData] = useState(null)

  useEffect(() => {
    fbFirestore.getSettings().then(s => {
      if (s.footer) {
        setFooterData(s.footer)
      }
    })
  }, [])

  // Provide a safe fallback if Firestore footer data is missing during transition
  const defaultFooter = {
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
    },
    contactCard: {
      heading: '"NERMAI IAS ACADEMY" is ready — download the file or scan the QR code.',
      desc: "Scan the QR with the iPhone Camera app, or Android's Camera/Google Lens — it'll offer to add the contact directly. Or share the downloaded .vcf file instead.",
      qrImage: '/media_1787746745912.png', // Using one of the uploaded pngs as fallback if it's the QR, or just empty
      vcfUrl: '/NERMAI_IAS_ACADEMY.vcf'
    },
    socialLinks: [
      { name: 'YouTube', link: CONTACT.youtube || '#', iconClass: 'fa-brands fa-youtube', iconUrl: '' },
      { name: 'Instagram', link: CONTACT.instagram || '#', iconClass: 'fa-brands fa-instagram', iconUrl: '' },
      { name: 'Telegram', link: CONTACT.telegram || '#', iconClass: 'fa-brands fa-telegram', iconUrl: '' }
    ]
  }

  const f = footerData ? { ...defaultFooter, ...footerData, contactCard: footerData.contactCard || defaultFooter.contactCard } : defaultFooter;


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
                {(f.socialLinks || []).map((social, i) => (
                  <a key={i} href={social.link || '#'} className="footer-social-btn" aria-label={social.name} rel="noopener noreferrer" target="_blank">
                    {social.iconUrl ? (
                      <img src={social.iconUrl} alt={social.name} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                    ) : (
                      <i className={social.iconClass || "fa-solid fa-link"} />
                    )}
                  </a>
                ))}
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
            {/* Contact QR Code Column */}
            {f.contactCard && (f.contactCard.heading || f.contactCard.qrImage) && (
              <div className="footer-col" style={{ alignItems: 'flex-start' }}>
                <div className="footer-col-title" style={{ marginBottom: '1.25rem', lineHeight: '1.4' }}>
                  {f.contactCard.heading}
                </div>
                {f.contactCard.qrImage && (
                  <div style={{ background: '#fff', padding: '10px', borderRadius: '10px', display: 'inline-block', marginBottom: '1rem' }}>
                    <img src={f.contactCard.qrImage} alt="QR Code" style={{ width: '130px', height: '130px', objectFit: 'contain', display: 'block' }} />
                  </div>
                )}
                <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.65)', marginBottom: '1.25rem' }}>
                  {f.contactCard.desc}
                </p>
                <a href={f.contactCard.vcfUrl || '#'} download className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', borderRadius: '100px', fontSize: '0.85rem' }}>
                  <i className="fa-solid fa-address-book" style={{ marginRight: '6px' }} />
                  Save Contact
                </a>
              </div>
            )}
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
