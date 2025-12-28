/**
 * Scroll-triggered animations using Intersection Observer
 * Performance-optimized with device detection
 */

import { getAnimationSettings } from './device-detection'

/**
 * Initialize scroll-triggered animations for elements with .scroll-animate class
 * Only runs if device supports it and user hasn't disabled animations
 */
export function initScrollAnimations() {
  if (typeof window === 'undefined') return

  const settings = getAnimationSettings()
  
  // Don't initialize if animations are disabled or scroll-triggered is disabled
  if (!settings.enabled || !settings.scrollTriggered) {
    return
  }

  // Check if Intersection Observer is supported
  if (!('IntersectionObserver' in window)) {
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
          // Unobserve after animation to improve performance
          observer.unobserve(entry.target)
        }
      })
    },
    {
      threshold: 0.1, // Trigger when 10% of element is visible
      rootMargin: '0px 0px -50px 0px', // Start animation slightly before element enters viewport
    }
  )

  // Observe all elements with .scroll-animate class
  const elements = document.querySelectorAll('.scroll-animate')
  elements.forEach((el) => observer.observe(el))

  // Return cleanup function
  return () => {
    observer.disconnect()
  }
}

/**
 * Initialize scroll animations on page load
 * Call this in a useEffect or component mount
 */
export function useScrollAnimations() {
  if (typeof window === 'undefined') return () => {}

  // Initialize on mount with a small delay to ensure DOM is ready
  let cleanupFn: (() => void) | undefined
  const timeoutId = setTimeout(() => {
    cleanupFn = initScrollAnimations()
  }, 100)

  // Cleanup on unmount
  return () => {
    clearTimeout(timeoutId)
    if (cleanupFn) {
      cleanupFn()
    }
  }
}

