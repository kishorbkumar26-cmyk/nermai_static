import { useEffect } from 'react'

/**
 * Sets up IntersectionObserver to animate `.reveal` elements
 * as they enter the viewport. Import and call this in every page.
 */
export function useReveal(deps = []) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.06, rootMargin: '0px 0px -40px 0px' }
    )
    
    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    }, 100)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
}
