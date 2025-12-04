'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

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
  
  // Check if we're on an admin route
  const isAdminRoute = pathname?.startsWith('/admin')
  
  if (isAdminRoute) {
    // Admin routes: no header/footer, just children
    return <>{children}</>
  }
  
  // Regular routes: include header and footer
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}

