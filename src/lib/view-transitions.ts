/**
 * View Transitions API utilities
 * Provides fallback for browsers without View Transitions support
 */

/**
 * Check if the browser supports View Transitions API
 */
export function supportsViewTransitions(): boolean {
  if (typeof document === 'undefined') return false
  return 'startViewTransition' in document
}

/**
 * Start a view transition if supported, otherwise execute callback immediately
 */
export function startViewTransition(callback: () => void): void {
  if (supportsViewTransitions()) {
    ;(document as any).startViewTransition(callback)
  } else {
    // Fallback: execute immediately
    callback()
  }
}

/**
 * Hook to use view transitions with Next.js router
 * Returns a function that navigates with view transition if supported
 */
export function useViewTransition() {
  if (typeof window === 'undefined') {
    return (callback: () => void) => callback()
  }

  return (callback: () => void) => {
    if (supportsViewTransitions()) {
      ;(document as any).startViewTransition(callback)
    } else {
      callback()
    }
  }
}

