'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState, ReactNode } from 'react'
import { supportsViewTransitions } from '@/lib/view-transitions'

/**
 * PageTransition component
 * 
 * Provides smooth page transitions using:
 * 1. CSS View Transitions API (if supported) - zero JS, native browser optimization
 * 2. Custom CSS fallback (for browsers without View Transitions support)
 * 
 * Mobile: Slide from right (native app feel)
 * Desktop: Subtle fade + slide
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [transitionStage, setTransitionStage] = useState<'enter' | 'exit'>('enter')
  const [useFallback, setUseFallback] = useState(true) // Start with true, check on mount

  // Check if we should use fallback on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUseFallback(!supportsViewTransitions())
    }
  }, [])

  // If View Transitions API is supported, let the browser handle it
  // We just need to update children on pathname change
  useEffect(() => {
    if (!useFallback) {
      // View Transitions API handles the transition automatically
      // Just update children immediately
      setDisplayChildren(children)
      return
    }

    // Fallback: Manual transition management
    if (children !== displayChildren) {
      setTransitionStage('exit')
      const timer = setTimeout(() => {
        setDisplayChildren(children)
        setTransitionStage('enter')
      }, 250) // Match exit duration
      return () => clearTimeout(timer)
    }
  }, [children, displayChildren, useFallback, pathname])

  // If View Transitions API is supported, render children directly
  // The browser will handle the transition automatically via CSS
  if (!useFallback) {
    return <>{children}</>
  }

  // Fallback: Custom CSS transitions for browsers without View Transitions support
  return (
    <div className="page-transition-container">
      <div
        className={`page-transition-${transitionStage} ${
          transitionStage === 'enter' ? 'page-transition-enter-active' : 'page-transition-exit-active'
        }`}
      >
        {displayChildren}
      </div>
    </div>
  )
}
