'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState, useRef, ReactNode } from 'react'
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
 * 
 * IMPORTANT: Only transitions on pathname changes, not on children changes.
 * This prevents false transitions when state updates cause re-renders.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [transitionStage, setTransitionStage] = useState<'enter' | 'exit'>('enter')
  const [useFallback, setUseFallback] = useState(true) // Start with true, check on mount
  const prevPathnameRef = useRef<string>(pathname)

  // Check if we should use fallback on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUseFallback(!supportsViewTransitions())
    }
  }, [])

  // Only transition on pathname changes, not on children changes
  // This prevents false transitions when state updates cause re-renders
  useEffect(() => {
    const pathnameChanged = prevPathnameRef.current !== pathname

    if (!useFallback) {
      // View Transitions API handles the transition automatically
      // Just update children when pathname changes
      if (pathnameChanged) {
        setDisplayChildren(children)
        prevPathnameRef.current = pathname
      } else {
        // Pathname didn't change, just update children silently (no transition)
        setDisplayChildren(children)
      }
      return
    }

    // Fallback: Manual transition management
    if (pathnameChanged) {
      // Pathname changed - trigger transition
      setTransitionStage('exit')
      const timer = setTimeout(() => {
        setDisplayChildren(children)
        setTransitionStage('enter')
        prevPathnameRef.current = pathname
      }, 250) // Match exit duration
      return () => clearTimeout(timer)
    } else {
      // Pathname didn't change - just update children silently (no transition)
      setDisplayChildren(children)
    }
  }, [pathname, children, useFallback])

  // If View Transitions API is supported, render children directly
  // The browser will handle the transition automatically via CSS
  // We still use displayChildren to ensure smooth updates, but no manual transition logic
  if (!useFallback) {
    return <>{displayChildren}</>
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
