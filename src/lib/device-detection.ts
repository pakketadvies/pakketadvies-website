/**
 * Device detection utility for performance-optimized animations
 * Detects device capabilities to enable/disable animations accordingly
 */

/**
 * Detect if device is low-end (limited CPU/RAM)
 */
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false

  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 4
  if (cores <= 4) return true

  // Check device memory (if available)
  const memory = (navigator as any).deviceMemory
  if (memory && memory <= 4) return true

  // Check for basic Android devices (often low-end)
  const ua = navigator.userAgent
  if (/Android.*Chrome/.test(ua) && !/Chrome\/[6-9][0-9]/.test(ua)) {
    // Older Chrome versions on Android are often low-end
    return true
  }

  return false
}

/**
 * Detect if device is mid-range
 */
export function isMidRangeDevice(): boolean {
  if (typeof window === 'undefined') return false

  const cores = navigator.hardwareConcurrency || 4
  const memory = (navigator as any).deviceMemory

  // Mid-range: 4-6 cores, 4-6GB RAM
  if (cores >= 4 && cores <= 6) {
    if (!memory || (memory >= 4 && memory <= 6)) {
      return true
    }
  }

  return false
}

/**
 * Detect if device is high-end
 */
export function isHighEndDevice(): boolean {
  if (typeof window === 'undefined') return false

  const cores = navigator.hardwareConcurrency || 4
  const memory = (navigator as any).deviceMemory

  // High-end: 6+ cores, 6+ GB RAM
  if (cores >= 6) {
    if (!memory || memory >= 6) {
      return true
    }
  }

  return false
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get animation settings based on device capabilities
 */
export function getAnimationSettings() {
  const reducedMotion = prefersReducedMotion()
  const lowEnd = isLowEndDevice()
  const midRange = isMidRangeDevice()
  const highEnd = isHighEndDevice()

  if (reducedMotion) {
    return {
      enabled: false,
      duration: 0,
      staggerDelay: 0,
      maxStaggeredItems: 0,
      scrollTriggered: false,
    }
  }

  if (lowEnd) {
    return {
      enabled: true,
      duration: 150, // Shorter animations
      staggerDelay: 0, // No stagger
      maxStaggeredItems: 2, // Very limited
      scrollTriggered: false, // Disable scroll animations
    }
  }

  if (midRange) {
    return {
      enabled: true,
      duration: 250, // Medium duration
      staggerDelay: 75, // Slower stagger
      maxStaggeredItems: 5, // Limited stagger
      scrollTriggered: true, // Enable but sparingly
    }
  }

  if (highEnd) {
    return {
      enabled: true,
      duration: 300, // Normal duration
      staggerDelay: 50, // Normal stagger
      maxStaggeredItems: 8, // More stagger
      scrollTriggered: true, // Full support
    }
  }

  // Default (desktop or unknown)
  return {
    enabled: true,
    duration: 300,
    staggerDelay: 50,
    maxStaggeredItems: 20,
    scrollTriggered: true,
  }
}

/**
 * Add device class to document for CSS-based progressive enhancement
 */
export function initDeviceDetection() {
  if (typeof window === 'undefined') return

  const settings = getAnimationSettings()
  const root = document.documentElement

  // Add classes for CSS targeting
  if (prefersReducedMotion()) {
    root.classList.add('reduced-motion')
  }

  if (isLowEndDevice()) {
    root.classList.add('low-end-device')
  } else if (isMidRangeDevice()) {
    root.classList.add('mid-range-device')
  } else if (isHighEndDevice()) {
    root.classList.add('high-end-device')
  } else {
    root.classList.add('desktop-device')
  }

  // Add data attributes for JavaScript access
  root.setAttribute('data-animations-enabled', settings.enabled.toString())
  root.setAttribute('data-max-staggered-items', settings.maxStaggeredItems.toString())
  root.setAttribute('data-scroll-triggered', settings.scrollTriggered.toString())
}

