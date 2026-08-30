import { useEffect } from 'react'

/**
 * Sets up IntersectionObserver to animate `.reveal` elements
 * as they enter the viewport. Import and call this in every page.
 */
export function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.06, rootMargin: '0px 0px -40px 0px' }
    )
    // Observe all .reveal elements currently in DOM
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}
