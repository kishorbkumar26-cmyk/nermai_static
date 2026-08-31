/**
 * Firestore data layer for NERMAI
 * Collections: hero_slides, notices, toppers, testimonials, settings
 */
import {
  collection, doc, addDoc, getDoc, getDocs, setDoc,
  updateDoc, deleteDoc, onSnapshot, orderBy, query,
  serverTimestamp, limit as fsLimit
} from 'firebase/firestore'
import { db } from './config'

const COLLECTIONS = {
  HERO_SLIDES:       'nermai_hero_slides',
  NOTICES:           'nermai_notices',
  TOPPERS:           'nermai_toppers',
  TESTIMONIALS:      'nermai_testimonials',
  GALLERY:           'nermai_gallery',
  SETTINGS:          'nermai_settings',
  COURSE_CONTENT:    'nermai_course_content',
  RESULT_CATEGORIES: 'nermai_result_categories'
}

const heroCol            = () => collection(db, COLLECTIONS.HERO_SLIDES)
const noticesCol         = () => collection(db, COLLECTIONS.NOTICES)
const toppersCol         = () => collection(db, COLLECTIONS.TOPPERS)
const testimonialsCol    = () => collection(db, COLLECTIONS.TESTIMONIALS)
const galleryCol         = () => collection(db, COLLECTIONS.GALLERY)
const courseContentDoc   = (slug) => doc(db, COLLECTIONS.COURSE_CONTENT, slug)
const resultCategoriesCol = () => collection(db, COLLECTIONS.RESULT_CATEGORIES)
const settingsDoc    = () => doc(db, COLLECTIONS.SETTINGS, 'main')

// ─── DEFAULT DATA ─────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  passcode: 'nermai2024',
  pageVisibility: {
    courses: true,
    results: true,
    notices: true,
    gallery: true,
    toppers: true,
    testimonials: true
  },
  driveConfig: {
    appsScriptUrl: '',
    folderId: '',
    accessToken: '',
    maxWidth: 1600,
    quality: 0.85
  },
  siteInfo: {
    phone: '+91 98765 43210',
    email: 'info@nermai.in',
    address: 'நேர்மை பயிற்சி மையம், Chennai - 600001, Tamil Nadu',
    whatsapp: '919876543210',
    instagram: '#',
    facebook: '#',
    youtube: '#',
    telegram: '#'
  },
  homeContent: {
    visibility: {
      stats: true,
      about: true,
      features: true,
      courses: true,
      steps: true,
      results: true,
      gallery: true,
      testimonials: true,
      faq: true,
      events: true
    },
    events: [
      { date: '2026-08-31', title: 'Short NIQ', subtitle: 'for construction of Selfie Point - Last date', url: '', visible: true },
      { date: '2026-08-31', title: 'Short NIQ', subtitle: 'for Toilet repair work - Last date', url: '', visible: true },
      { date: '2026-09-15', title: 'NSPC 2026 - QUIZ', subtitle: 'Students/Scholars/Faculty/Staff can participate in this nationwide online quiz', url: '', visible: true },
      { date: '2026-11-12', title: 'ICAISDA 26', subtitle: 'Two days International Conference organized by CSE', url: '', visible: true }
    ],
    stats: [
      { num: '2400+', label: 'Students',  sublabel: 'பயிற்சி பெற்ற மாணவர்கள்' },
      { num: '14+',   label: 'Years',     sublabel: 'ஆண்டுகள் அனுபவம்' },
      { num: '28+',   label: 'Batches',   sublabel: 'வெற்றிகரமான தொகுதிகள்' },
      { num: '98%',   label: 'Success',   sublabel: 'வெற்றி விகிதம்' }
    ],
    features: [
      { icon: 'GraduationCap', title: 'Structured Classes',  desc: 'Daily scheduled classes with expert faculty in Tamil & English medium.', imageUrl: '', visible: true },
      { icon: 'BookOpen',      title: 'Study Materials',     desc: 'Comprehensive study notes and question banks aligned to exam pattern.', imageUrl: '', visible: true },
      { icon: 'PenTool',       title: 'Mock Tests',          desc: 'Weekly full-length tests and sectional tests with detailed analysis.', imageUrl: '', visible: true },
      { icon: 'LineChart',     title: 'Progress Tracking',   desc: 'Personal performance dashboard to monitor strengths and weaknesses.', imageUrl: '', visible: true },
      { icon: 'CalendarCheck', title: 'Class Schedule',      desc: 'Flexible batch timings for students, working professionals and rural aspirants.', imageUrl: '', visible: true },
      { icon: 'UserCircle',    title: 'Academic Guidance',   desc: 'One-on-one mentoring sessions with IAS/IPS selected alumni faculty.', imageUrl: '', visible: true }
    ],
    courses: [
      { icon: '🏛️', name: 'UPSC Civil Service',  subname: 'IAS / IPS / IFS',                      desc: "India's most prestigious exam. Comprehensive coaching for Prelims, Mains & Interview.", tags: ['CIVIL SERVICES','IAS','IPS','IFS'],                         slug: 'upsc' },
      { icon: '📋', name: 'TNPSC / Railways',    subname: 'GROUP I · II · IV · VAO',               desc: 'Complete preparation for Tamil Nadu Public Service Commission and Railway recruitment exams.', tags: ['GROUP I','GROUP II / IIA','GROUP IV','VAO'],             slug: 'tnpsc' },
      { icon: '📁', name: 'UDC / LDC / VAO',     subname: 'CLERICAL & REVENUE SERVICES',           desc: 'Focused coaching for Upper Division Clerk, Lower Division Clerk and Village Administrative Officer.', tags: ['UDC','LDC','VAO'],                             slug: 'udc-ldc' },
      { icon: '🏦', name: 'Banking',              subname: 'IBPS · SBI · RBI',                      desc: 'Structured coaching for IBPS PO, Clerk, SBI PO/Clerk, RBI Grade B and other banking exams.', tags: ['IBPS PO','IBPS CLERK','SBI PO','RBI GRADE B'],         slug: 'banking' },
      { icon: '🌿', name: 'Puducherry Exam',      subname: 'UDC · LDC · DEPUTY TAHSILDAR · SI',    desc: 'Specialised coaching for Puducherry Government recruitment — Deputy Tahsildar, Sub-Inspector, UDC, LDC.', tags: ['DEPUTY TAHSILDAR','SUB-INSPECTOR','UDC','LDC'], slug: 'puducherry' },
      { icon: '⚖️', name: 'SSC / PC / DT / SI',  subname: 'CENTRAL & STATE COMBINED',              desc: 'Coaching for SSC CGL, CHSL, Police Constable, Deputy Tahsildar and Sub-Inspector exams.', tags: ['SSC CGL','SSC CHSL','POLICE CONSTABLE','SUB-INSPECTOR'], slug: 'ssc' }
    ],
    about: {
      eyebrow: 'About Nermai',
      title: 'Built in Puducherry.\nDriven by purpose.',
      para1: 'Quality coaching should not be a privilege. A handful of youth from Puducherry started NERMAI IAS ACADEMY to change this — making serious civil services preparation accessible to every aspirant, regardless of background.',
      para2: 'The civil services examination is the most prestigious and most demanding exam in the country. Nermai exists to make the path clearer, the preparation more structured, and the journey less lonely.',
      imageUrl: 'https://nermaiiasacademy.in/wp-content/uploads/2024/11/WhatsApp-Image-2024-11-16-at-10.34.22-PM-2-1.jpeg',
      imageLabel: '187+ RESULTS · 2022–25',
      badges: [
        { num: '187+',  label: 'Results' },
        { num: '14+',   label: 'Years' },
        { num: '2400+', label: 'Students' }
      ]
    },
    steps: [
      { num: '01', title: 'உங்கள் இலக்கை தேர்வு செய்யுங்கள்', desc: 'Choose from TNPSC, UPSC, Police or Banking on our Website.' },
      { num: '02', title: 'பயிற்சியை தேர்வு செய்யுங்கள்',        desc: 'Find the right batch and course structure for your needs.' },
      { num: '03', title: 'Join Class Platform',                    desc: 'Redirect to our dedicated learning management portal.' },
      { num: '04', title: 'பயிற்சி + தேர்வுகள்',                   desc: 'Attend classes, take mock tests, and track your progress.' },
      { num: '05', title: 'இலக்கை அடையுங்கள்',                    desc: 'Clear the exam and become a Government Officer.' }
    ],
    ticker: {
      visible: true,
      items: [
        { text: 'Classroom GS PCM 2027 - Admission Open', link: '#' },
        { text: 'Online GS PCM 2027 - Admission Open', link: '#' },
        { text: 'StepUp Mentorship 2027 - Admission Open', link: '#' }
      ]
    }
  },
  footer: {
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
      phones: "919876543210, +91 9999999999",
      email: "info@nermai.in"
    },
    usefulLinks: [
      { label: 'Examinations', link: '/#examinations' },
      { label: 'Gallery', link: '/#gallery' },
      { label: 'About Us', link: '/why-nermai' },
      { label: 'Contact Us', link: '/contact' },
      { label: 'All Courses', link: '/courses' }
    ],
    notifications: [
      { label: 'Banking', link: 'https://lms.nermai.in' },
      { label: 'Exam Notifications', link: 'https://lms.nermai.in' },
      { label: 'Study Material', link: 'https://lms.nermai.in' },
      { label: 'Pondicherry Recruitments', link: 'https://lms.nermai.in' },
      { label: 'Central Recruitments', link: 'https://lms.nermai.in' }
    ],
    coursesLinks: [
      { label: 'UPSC Civil Service', link: '/courses/upsc' },
      { label: 'TNPSC / Railways', link: '/courses/tnpsc' },
      { label: 'UDC / LDC / VAO', link: '/courses/udc-ldc' },
      { label: 'Banking', link: '/courses/banking' }
    ],
    bottom: {
      meta: "Non Profit | Non Commercial"
    }
  }
}

const DEFAULT_NOTICES = [
  { title: 'TNPSC Group IV தேர்வு அறிவிப்பு 2024', content: 'TNPSC Group IV தேர்வுக்கான விண்ணப்பங்கள் ஏற்கப்படுகின்றன. கடைசி தேதி: 30 செப்டம்பர் 2024.', priority: 'high', date: new Date().toISOString().split('T')[0] },
  { title: 'புதிய தொகுதி ஆரம்பம் — அக்டோபர் 2024', content: 'UPSC Prelims 2025-க்கான புதிய batch அக்டோபர் 1 முதல் ஆரம்பிக்கிறது. இடங்கள் குறைவு.', priority: 'normal', date: new Date().toISOString().split('T')[0] },
  { title: 'TN Police SI தேர்வு விண்ணப்பம்', content: 'தமிழ்நாடு காவல்துறை Sub-Inspector தேர்வுக்கான மாதிரி வினாக்கள் கிடைக்கும்.', priority: 'normal', date: new Date().toISOString().split('T')[0] }
]

const DEFAULT_TOPPERS = [
  { name: 'Kavitha S.', rank: '1', exam: 'TNPSC Group II', year: '2024', photo: '', quote: 'நேர்மையின் வழிகாட்டுதலால் மட்டுமே இந்த வெற்றி சாத்தியமானது.' },
  { name: 'Murugan R.', rank: '3', exam: 'TNPSC Group I', year: '2023', photo: '', quote: 'தினமும் 8 மணி நேரம் படித்தேன். நேர்மை அகாடமி என் தன்னம்பிக்கையை வளர்த்தது.' },
  { name: 'Priya M.', rank: '7', exam: 'UPSC CSE', year: '2023', photo: '', quote: 'Current affairs and Tamil medium materials were exceptional here.' },
  { name: 'Selvam K.', rank: '2', exam: 'TN Police SI', year: '2024', photo: '', quote: 'Physical training guidance along with academics made the difference.' }
]

const DEFAULT_TESTIMONIALS = [
  { name: 'Anitha Devi', role: 'TNPSC Group IV தேர்வாளர்', quote: 'நேர்மையில் படித்ததால் முதல் முயற்சியிலேயே வெற்றி பெற்றேன். ஆசிரியர்களின் அர்ப்பணிப்பு மிகவும் சிறப்பானது.' },
  { name: 'Rajkumar P.', role: 'TN Police Constable', quote: 'The study materials and mock tests were exactly aligned with the exam pattern. Highly recommend!' },
  { name: 'Lakshmi N.', role: 'UPSC Aspirant', quote: 'தமிழ் வழியில் UPSC பயிற்சி கிடைப்பது மிகவும் அரிது. நேர்மை அதை சாத்தியமாக்கியது.' },
  { name: 'Vikram S.', role: 'TNPSC Group II', quote: 'Excellent current affairs coverage and daily tests kept me on track throughout my preparation.' }
]

// ─── FIRESTORE OPERATIONS ───────────────────────────────────────────────────

export const fbFirestore = {

  // ── SETTINGS ──
  async getSettings() {
    try {
      const snap = await getDoc(settingsDoc())
      if (!snap.exists()) {
        await setDoc(settingsDoc(), DEFAULT_SETTINGS, { merge: true })
        return DEFAULT_SETTINGS
      }
      return { ...DEFAULT_SETTINGS, ...snap.data() }
    } catch {
      return DEFAULT_SETTINGS
    }
  },

  async updateSettings(data) {
    try {
      await setDoc(settingsDoc(), data, { merge: true })
    } catch (e) { console.error('updateSettings error', e) }
  },

  onSettingsChanged(callback) {
    return onSnapshot(settingsDoc(), (snap) => {
      if (snap.exists()) callback({ ...DEFAULT_SETTINGS, ...snap.data() })
      else callback(DEFAULT_SETTINGS)
    }, () => callback(DEFAULT_SETTINGS))
  },

  // Verify admin passcode against Firestore
  async verifyPasscode(inputCode) {
    try {
      const settings = await this.getSettings()
      return (settings.passcode || DEFAULT_SETTINGS.passcode) === inputCode.trim()
    } catch {
      return inputCode.trim() === DEFAULT_SETTINGS.passcode
    }
  },

  // ── HERO SLIDES ──
  async getHeroSlides() {
    try {
      const q = query(heroCol(), orderBy('order', 'asc'))
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch {
      return []
    }
  },

  onHeroSlidesChanged(callback) {
    const q = query(heroCol(), orderBy('order', 'asc'))
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }, () => callback([]))
  },

  async addHeroSlide(data) {
    const slides = await this.getHeroSlides()
    const desktopUrl = data.urlDesktop || data.url || ''
    return await addDoc(heroCol(), {
      // Legacy field for backward compat — mirrors urlDesktop
      url: desktopUrl,
      // Responsive image fields
      urlDesktop: desktopUrl,                   // PC banner: 1920 × 600 px
      urlMobile:  data.urlMobile || '',          // Mobile poster: 768 × 1024 px
      title:      data.title    || '',
      subtitle:   data.subtitle || '',
      cta:        data.cta      || '',
      ctaLink:    data.ctaLink  || '#',
      order:      slides.length,
      storageType: data.storageType || 'url',
      createdAt:  serverTimestamp()
    })
  },

  async updateHeroSlide(id, data) {
    await updateDoc(doc(db, COLLECTIONS.HERO_SLIDES, id), data)
  },

  async deleteHeroSlide(id) {
    await deleteDoc(doc(db, COLLECTIONS.HERO_SLIDES, id))
  },

  // ── NOTICES ──
  async getNotices() {
    try {
      const q = query(noticesCol(), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch {
      return DEFAULT_NOTICES.map((n, i) => ({ id: `default_${i}`, ...n }))
    }
  },

  onNoticesChanged(callback) {
    const q = query(noticesCol(), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      callback(items.length > 0 ? items : DEFAULT_NOTICES.map((n, i) => ({ id: `default_${i}`, ...n })))
    }, () => callback(DEFAULT_NOTICES.map((n, i) => ({ id: `default_${i}`, ...n }))))
  },

  async addNotice(data) {
    return await addDoc(noticesCol(), {
      title: data.title || '',
      content: data.content || '',
      priority: data.priority || 'normal',
      date: data.date || new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp()
    })
  },

  async updateNotice(id, data) {
    await updateDoc(doc(db, COLLECTIONS.NOTICES, id), data)
  },

  async deleteNotice(id) {
    await deleteDoc(doc(db, COLLECTIONS.NOTICES, id))
  },

  // ── TOPPERS ──
  async getToppers() {
    try {
      const q = query(toppersCol(), orderBy('createdAt', 'asc'))
      const snap = await getDocs(q)
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      return items.length > 0 ? items : DEFAULT_TOPPERS.map((t, i) => ({ id: `default_${i}`, ...t }))
    } catch {
      return DEFAULT_TOPPERS.map((t, i) => ({ id: `default_${i}`, ...t }))
    }
  },

  onToppersChanged(callback) {
    const q = query(toppersCol(), orderBy('createdAt', 'asc'))
    return onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      callback(items.length > 0 ? items : DEFAULT_TOPPERS.map((t, i) => ({ id: `default_${i}`, ...t })))
    }, () => callback(DEFAULT_TOPPERS.map((t, i) => ({ id: `default_${i}`, ...t }))))
  },

  async addTopper(data) {
    return await addDoc(toppersCol(), {
      name: data.name || '',
      rank: data.rank || '',
      exam: data.exam || '',
      year: data.year || new Date().getFullYear().toString(),
      photo: data.photo || '',
      quote: data.quote || '',
      storageType: data.storageType || 'url',
      createdAt: serverTimestamp()
    })
  },

  async updateTopper(id, data) {
    await updateDoc(doc(db, COLLECTIONS.TOPPERS, id), data)
  },

  async deleteTopper(id) {
    await deleteDoc(doc(db, COLLECTIONS.TOPPERS, id))
  },

  // ── TESTIMONIALS ──
  async getTestimonials() {
    try {
      const q = query(testimonialsCol(), orderBy('createdAt', 'asc'))
      const snap = await getDocs(q)
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      return items.length > 0 ? items : DEFAULT_TESTIMONIALS.map((t, i) => ({ id: `default_${i}`, ...t }))
    } catch {
      return DEFAULT_TESTIMONIALS.map((t, i) => ({ id: `default_${i}`, ...t }))
    }
  },

  onTestimonialsChanged(callback) {
    const q = query(testimonialsCol(), orderBy('createdAt', 'asc'))
    return onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      callback(items.length > 0 ? items : DEFAULT_TESTIMONIALS.map((t, i) => ({ id: `default_${i}`, ...t })))
    }, () => callback(DEFAULT_TESTIMONIALS.map((t, i) => ({ id: `default_${i}`, ...t }))))
  },

  async addTestimonial(data) {
    return await addDoc(testimonialsCol(), {
      name: data.name || '',
      role: data.role || '',
      quote: data.quote || '',
      createdAt: serverTimestamp()
    })
  },

  async updateTestimonial(id, data) {
    await updateDoc(doc(db, COLLECTIONS.TESTIMONIALS, id), data)
  },

  async deleteTestimonial(id) {
    await deleteDoc(doc(db, COLLECTIONS.TESTIMONIALS, id))
  },

  // ── GALLERY ──
  async getGallery() {
    try {
      const q = query(galleryCol(), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch {
      return []
    }
  },

  onGalleryChanged(callback) {
    const q = query(galleryCol(), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }, () => callback([]))
  },

  async addGalleryImage(data) {
    return await addDoc(galleryCol(), {
      url: data.url || '',
      caption: data.caption || '',
      storageType: data.storageType || 'url',
      createdAt: serverTimestamp()
    })
  },

  async updateGalleryImage(id, data) {
    await updateDoc(doc(db, COLLECTIONS.GALLERY, id), data)
  },

  async deleteGalleryImage(id) {
    await deleteDoc(doc(db, COLLECTIONS.GALLERY, id))
  },

  // ── COURSE CONTENT (per-course detail pages) ──
  async getCourseContent(slug) {
    try {
      const snap = await getDoc(courseContentDoc(slug))
      if (!snap.exists()) return null
      return { slug, ...snap.data() }
    } catch { return null }
  },

  async saveCourseContent(slug, data) {
    await setDoc(courseContentDoc(slug), {
      ...data,
      slug,
      updatedAt: serverTimestamp()
    }, { merge: true })
  },

  async getAllCourseContent() {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.COURSE_CONTENT))
      return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch { return [] }
  },

  // ── RESULT CATEGORIES ──
  async getResultCategories() {
    try {
      const q = query(resultCategoriesCol(), orderBy('order', 'asc'))
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch { return [] }
  },

  onResultCategoriesChanged(callback) {
    const q = query(resultCategoriesCol(), orderBy('order', 'asc'))
    return onSnapshot(q, snap => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }, () => callback([]))
  },

  async addResultCategory(data) {
    const existing = await this.getResultCategories()
    return await addDoc(resultCategoriesCol(), {
      name:  data.name  || 'New Category',
      slug:  data.slug  || data.name?.toLowerCase().replace(/\s+/g, '-') || 'category',
      color: data.color || '#7b1b2e',
      order: existing.length,
      createdAt: serverTimestamp()
    })
  },

  async updateResultCategory(id, data) {
    await updateDoc(doc(db, COLLECTIONS.RESULT_CATEGORIES, id), data)
  },

  async deleteResultCategory(id) {
    await deleteDoc(doc(db, COLLECTIONS.RESULT_CATEGORIES, id))
  },

  // Gallery images with category support
  async getGalleryByCategory(category) {
    try {
      const snap = await getDocs(galleryCol())
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      if (!category || category === 'all') return all
      return all.filter(img => img.category === category)
    } catch { return [] }
  },

  COLLECTIONS
}

import { firebaseConfig } from './config'
const isDemo = firebaseConfig.projectId === 'nermai-demo' || !firebaseConfig.projectId

if (isDemo) {
  console.log('Firebase not configured. Using LocalStorage fallback.')
  
  const ls = {
    get: (k, def) => { try { return JSON.parse(localStorage.getItem('nermai_' + k)) || def } catch { return def } },
    set: (k, v) => localStorage.setItem('nermai_' + k, JSON.stringify(v)),
    genId: () => Math.random().toString(36).substr(2, 9)
  }

  const mockCol = (key, defaultData = []) => {
    const getEv = () => 'nermai_db_' + key
    return {
      get: async () => ls.get(key, defaultData),
      on: (cb) => {
        const trig = () => cb(ls.get(key, defaultData))
        trig()
        window.addEventListener(getEv(), trig)
        return () => window.removeEventListener(getEv(), trig)
      },
      add: async (data) => {
        const items = ls.get(key, defaultData)
        const id = ls.genId()
        items.push({ id, ...data, createdAt: new Date().toISOString() })
        ls.set(key, items)
        window.dispatchEvent(new Event(getEv()))
        return { id }
      },
      update: async (id, data) => {
        const items = ls.get(key, defaultData)
        const idx = items.findIndex(x => x.id === id)
        if (idx >= 0) {
          items[idx] = { ...items[idx], ...data }
          ls.set(key, items)
          window.dispatchEvent(new Event(getEv()))
        }
      },
      del: async (id) => {
        const items = ls.get(key, defaultData)
        ls.set(key, items.filter(x => x.id !== id))
        window.dispatchEvent(new Event(getEv()))
      }
    }
  }

  const heroes = mockCol('hero', [])
  const notices = mockCol('notices', DEFAULT_NOTICES.map((n,i) => ({id:`def_${i}`, ...n})))
  const toppers = mockCol('toppers', DEFAULT_TOPPERS.map((t,i) => ({id:`def_${i}`, ...t})))
  const testimonials = mockCol('testimonials', DEFAULT_TESTIMONIALS.map((t,i) => ({id:`def_${i}`, ...t})))
  const gallery = mockCol('gallery', [])
  const resultCats = mockCol('resultCats', [])

  Object.assign(fbFirestore, {
    async getSettings() { return ls.get('settings', DEFAULT_SETTINGS) },
    async updateSettings(data) {
      const cur = await this.getSettings()
      ls.set('settings', { ...cur, ...data })
      window.dispatchEvent(new Event('nermai_db_settings'))
    },
    onSettingsChanged(cb) {
      const trig = () => cb(ls.get('settings', DEFAULT_SETTINGS))
      trig()
      window.addEventListener('nermai_db_settings', trig)
      return () => window.removeEventListener('nermai_db_settings', trig)
    },
    async verifyPasscode(code) {
      const s = await this.getSettings()
      return (s.passcode || DEFAULT_SETTINGS.passcode) === code.trim()
    },

    getHeroSlides: heroes.get, onHeroSlidesChanged: heroes.on,
    addHeroSlide: async (data) => {
      const all = await heroes.get()
      return heroes.add({ ...data, urlDesktop: data.urlDesktop || data.url || '', urlMobile: data.urlMobile || '', order: all.length })
    },
    updateHeroSlide: heroes.update, deleteHeroSlide: heroes.del,

    getNotices: notices.get, onNoticesChanged: notices.on, addNotice: notices.add, updateNotice: notices.update, deleteNotice: notices.del,
    
    getToppers: toppers.get, onToppersChanged: toppers.on, addTopper: toppers.add, updateTopper: toppers.update, deleteTopper: toppers.del,
    
    getTestimonials: testimonials.get, onTestimonialsChanged: testimonials.on, addTestimonial: testimonials.add, updateTestimonial: testimonials.update, deleteTestimonial: testimonials.del,
    
    getGallery: gallery.get, onGalleryChanged: gallery.on, addGalleryImage: gallery.add, updateGalleryImage: gallery.update, deleteGalleryImage: gallery.del,
    async getGalleryByCategory(cat) {
      const all = await gallery.get()
      return (!cat || cat === 'all') ? all : all.filter(img => img.category === cat)
    },

    getResultCategories: resultCats.get, onResultCategoriesChanged: resultCats.on, updateResultCategory: resultCats.update, deleteResultCategory: resultCats.del,
    addResultCategory: async (data) => {
      const all = await resultCats.get()
      return resultCats.add({ name: data.name || 'Category', slug: data.slug || data.name?.toLowerCase().replace(/\s+/g,'-') || 'cat', color: data.color || '#7b1b2e', order: all.length })
    },

    async getCourseContent(slug) {
      const map = ls.get('courses', {})
      return map[slug] || null
    },
    async saveCourseContent(slug, data) {
      const map = ls.get('courses', {})
      map[slug] = { ...data, slug, updatedAt: new Date().toISOString() }
      ls.set('courses', map)
    },
    async getAllCourseContent() {
      const map = ls.get('courses', {})
      return Object.values(map)
    }
  })
}
