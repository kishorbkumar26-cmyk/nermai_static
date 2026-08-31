/**
 * NERMAI IAS Academy — Shared Constants
 * Update LMS_URL once the LMS platform is ready.
 */

/** LMS platform enroll/login URL — replace with the actual URL when ready */
export const LMS_URL = '#'

/** WhatsApp number (include country code, no +) */
export const WHATSAPP_NUMBER = '918903189000'

/** Academy contact details */
export const CONTACT = {
  phones: ['+91 8903 189000', '+91 8903 289000', '+91 9643 553043'],
  email: 'nermaiasacademy@gmail.com',
  address: 'No. 156 / 3, (1st & 2nd Floor), Nanbargal Nagar,\nPondy – Villianur Main Road, Oulgaret,\nPuducherry – 605 010',
  facebook: 'https://facebook.com',
  instagram: 'https://instagram.com',
  youtube: 'https://youtube.com',
  twitter: 'https://twitter.com',
  linkedin: 'https://linkedin.com',
  telegram: 'https://t.me/',
}

/** Hero image recommended dimensions shown in admin panel */
export const HERO_IMAGE_DIMS = {
  desktop: { width: 1920, height: 600, label: 'PC / Desktop Banner' },
  mobile:  { width: 768,  height: 1024, label: 'Mobile Poster' },
}

/** All course categories */
export const COURSES = [
  {
    slug: 'upsc',
    name: 'UPSC Civil Service',
    subName: 'IAS / IPS / IFS',
    icon: '🏛️',
    description: 'India\'s most prestigious exam. Comprehensive coaching for Prelims, Mains & Interview.',
    tags: ['Civil Services', 'IAS', 'IPS', 'IFS'],
  },
  {
    slug: 'tnpsc',
    name: 'TNPSC / Railways',
    subName: 'Group I · II · IV · VAO',
    icon: '📋',
    description: 'Complete preparation for Tamil Nadu Public Service Commission and Railway recruitment exams.',
    tags: ['Group I', 'Group II / IIA', 'Group IV', 'VAO'],
  },
  {
    slug: 'udc-ldc',
    name: 'UDC / LDC / VAO',
    subName: 'Clerical & Revenue Services',
    icon: '📂',
    description: 'Focused coaching for Upper Division Clerk, Lower Division Clerk and Village Administrative Officer.',
    tags: ['UDC', 'LDC', 'VAO'],
  },
  {
    slug: 'banking',
    name: 'Banking',
    subName: 'IBPS · SBI · RBI',
    icon: '🏦',
    description: 'Structured coaching for IBPS PO, Clerk, SBI PO/Clerk, RBI Grade B and other banking exams.',
    tags: ['IBPS PO', 'IBPS Clerk', 'SBI PO', 'RBI Grade B'],
  },
  {
    slug: 'pondicherry',
    name: 'Puducherry Exam',
    subName: 'UDC · LDC · Deputy Tahsildar · SI',
    icon: '🌿',
    description: 'Specialised coaching for Puducherry Government recruitment — Deputy Tahsildar, Sub-Inspector, UDC, LDC.',
    tags: ['Deputy Tahsildar', 'Sub-Inspector', 'UDC', 'LDC'],
  },
  {
    slug: 'ssc',
    name: 'SSC / PC / DT / SI',
    subName: 'Central & State Combined',
    icon: '⚖️',
    description: 'Coaching for SSC CGL, CHSL, Police Constable, Deputy Tahsildar and Sub-Inspector exams.',
    tags: ['SSC CGL', 'SSC CHSL', 'Police Constable', 'Sub-Inspector'],
  },
]
