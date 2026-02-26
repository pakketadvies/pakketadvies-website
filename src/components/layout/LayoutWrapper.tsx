'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { CookieBanner } from './CookieBanner'
import { clearBodyScrollLocks } from '@/lib/scroll-lock'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Configure scroll restoration to prevent conflicts with smooth scroll
  useEffect(() => {
    // Disable automatic scroll restoration on navigation
    // This prevents Next.js from trying to restore scroll position
    // which can conflict with user scroll input
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])
  
  // Scroll naar top bij route change (zonder animatie)
  useEffect(() => {
    // Defensive reset: if an overlay unmounted unexpectedly, ensure scroll is not stuck.
    clearBodyScrollLocks()
    window.scrollTo({ top: 0, behavior: 'auto' })
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

