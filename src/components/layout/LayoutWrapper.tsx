'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { CookieBanner } from './CookieBanner'
import { clearBodyScrollLocks, getScrollLockDebugState } from '@/lib/scroll-lock'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const lastScrollYRef = useRef(0)
  const lastWheelAtRef = useRef(0)
  
  // Configure scroll restoration to prevent conflicts with smooth scroll
  useEffect(() => {
    // Disable automatic scroll restoration on navigation
    // This prevents Next.js from trying to restore scroll position
    // which can conflict with user scroll input
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])
  
  // Prevent overscroll (white space above page)
  useEffect(() => {
    // Prevent negative scroll position
    const handleScroll = () => {
      if (window.scrollY < 0) {
        window.scrollTo(0, 0)
      }
      if (document.documentElement.scrollTop < 0) {
        document.documentElement.scrollTop = 0
      }
      if (document.body.scrollTop < 0) {
        document.body.scrollTop = 0
      }
    }

    // Apply overscroll-behavior via JavaScript for better browser support
    document.documentElement.style.overscrollBehavior = 'none'
    document.documentElement.style.overscrollBehaviorY = 'none'
    document.body.style.overscrollBehavior = 'none'
    document.body.style.overscrollBehaviorY = 'none'

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('wheel', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('wheel', handleScroll)
    }
  }, [])
  
  // Scroll naar top bij route change (zonder animatie)
  useEffect(() => {
    // Defensive reset: if an overlay unmounted unexpectedly, ensure scroll is not stuck.
    clearBodyScrollLocks()
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  // Temporary debug logging for homepage scroll issues.
  useEffect(() => {
    if (pathname !== '/') return

    const logState = (reason: string) => {
      const debug = getScrollLockDebugState()
      console.log('[ScrollDebug][Homepage]', {
        reason,
        path: window.location.pathname,
        scrollY: window.scrollY,
        bodyOverflow: document.body.style.overflow || '(empty)',
        htmlOverflow: document.documentElement.style.overflow || '(empty)',
        bodyPosition: document.body.style.position || '(empty)',
        locks: debug,
      })
    }

    const handleWheel = () => {
      lastWheelAtRef.current = Date.now()
      logState('wheel')
    }
    const handleTouchMove = () => {
      lastWheelAtRef.current = Date.now()
      logState('touchmove')
    }
    const handleScroll = () => {
      lastScrollYRef.current = window.scrollY
      logState('scroll')
    }

    logState('mount')
    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })

    const interval = window.setInterval(() => {
      const now = Date.now()
      const recentlyTriedToScroll = now - lastWheelAtRef.current < 2000
      const scrollStuck = recentlyTriedToScroll && window.scrollY === lastScrollYRef.current
      if (scrollStuck) {
        logState('possible-stuck-scroll')
      }
    }, 1000)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('scroll', handleScroll)
      window.clearInterval(interval)
    }
  }, [pathname])
  
  // Check if we're on an admin route
  const isAdminRoute = pathname?.startsWith('/admin')
  
  if (isAdminRoute) {
    // Admin routes: no header/footer, just children
    return <>{children}</>
  }
  
  // Regular routes: include header and footer, no page transitions
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <CookieBanner />
    </>
  )
}

