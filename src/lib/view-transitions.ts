/**
 * View Transitions API utilities
 * Provides fallback for browsers without View Transitions support
 */

/**
 * Send log to debug-logs API
 */
async function logToAdmin(level: string, message: string, data?: any) {
  try {
    await fetch('/api/debug-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level,
        message,
        data: {
          ...data,
          component: 'view-transitions',
          timestamp: new Date().toISOString(),
        },
        url: typeof window !== 'undefined' ? window.location.href : 'SSR',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR',
        timestamp: new Date().toISOString(),
      }),
    })
  } catch (error) {
    // Silently fail - logging is non-critical
    console.error('[view-transitions] Failed to send log:', error)
  }
}

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
  const supports = supportsViewTransitions()
  
  logToAdmin('info', 'startViewTransition called', {
    supportsViewTransitions: supports,
    currentPath: typeof window !== 'undefined' ? window.location.pathname : 'SSR',
  })
  
  if (supports) {
    logToAdmin('info', 'startViewTransition: Using View Transitions API', {
      currentPath: typeof window !== 'undefined' ? window.location.pathname : 'SSR',
    })
    ;(document as any).startViewTransition(() => {
      logToAdmin('info', 'startViewTransition: Inside View Transitions API callback', {
        currentPath: typeof window !== 'undefined' ? window.location.pathname : 'SSR',
      })
      callback()
      logToAdmin('info', 'startViewTransition: Callback executed', {
        currentPath: typeof window !== 'undefined' ? window.location.pathname : 'SSR',
      })
    })
  } else {
    // Fallback: execute immediately
    logToAdmin('info', 'startViewTransition: View Transitions not supported, executing callback immediately', {
      currentPath: typeof window !== 'undefined' ? window.location.pathname : 'SSR',
    })
    callback()
    logToAdmin('info', 'startViewTransition: Callback executed (fallback)', {
      currentPath: typeof window !== 'undefined' ? window.location.pathname : 'SSR',
    })
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

