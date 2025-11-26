'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { X, Download } from '@phosphor-icons/react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const pathname = usePathname()
  const engagementTimer = useRef<NodeJS.Timeout | null>(null)
  const scrollDepth = useRef(0)
  const hasScrolled = useRef(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if already dismissed PERMANENTLY (localStorage)
    const dismissed = localStorage.getItem('pwa-install-dismissed-permanent')
    if (dismissed === 'true') {
      return
    }

    // Check if dismissed temporarily (30 days)
    const dismissedTemporary = localStorage.getItem('pwa-install-dismissed-temporary')
    if (dismissedTemporary) {
      const dismissedDate = parseInt(dismissedTemporary, 10)
      const now = Date.now()
      // If less than 30 days ago, don't show
      if (now - dismissedDate < 30 * 24 * 60 * 60 * 1000) {
        return
      }
      // If more than 30 days, remove the flag and allow showing again
      localStorage.removeItem('pwa-install-dismissed-temporary')
    }

    // Don't show on calculator pages (users are busy filling forms)
    if (pathname?.startsWith('/calculator')) {
      return
    }

    // Track user engagement: scroll depth and time on site
    const handleScroll = () => {
      if (!hasScrolled.current) {
        hasScrolled.current = true
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        scrollDepth.current = Math.max(scrollDepth.current, scrollPercent)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Only show after user has engaged:
      // - At least 30 seconds on the site
      // - AND (scrolled at least 25% OR been on site for 60 seconds)
      let timeOnSite = 0
      const checkEngagement = setInterval(() => {
        timeOnSite += 1
        
        // Check engagement criteria
        const hasEngaged = 
          timeOnSite >= 30 && // At least 30 seconds
          (scrollDepth.current >= 25 || timeOnSite >= 60) // Scrolled 25% OR 60 seconds total
        
        if (hasEngaged && !showPrompt) {
          clearInterval(checkEngagement)
          setShowPrompt(true)
        }
      }, 1000) // Check every second

      // Cleanup after 5 minutes (don't show if user hasn't engaged)
      setTimeout(() => {
        clearInterval(checkEngagement)
      }, 5 * 60 * 1000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('scroll', handleScroll)
      if (engagementTimer.current) {
        clearInterval(engagementTimer.current)
      }
    }
  }, [pathname, showPrompt])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return
    }

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
      setShowPrompt(false)
      setDeferredPrompt(null)
      // Mark as permanently dismissed (user installed it)
      localStorage.setItem('pwa-install-dismissed-permanent', 'true')
    } else {
      console.log('User dismissed the install prompt')
      handleDismiss()
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Store dismissal with timestamp (30 days)
    localStorage.setItem('pwa-install-dismissed-temporary', Date.now().toString())
  }

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-white border-2 border-brand-teal-500 rounded-xl shadow-2xl p-4 flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <div className="w-12 h-12 bg-brand-teal-500 rounded-lg flex items-center justify-center">
            <Download weight="bold" className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-brand-navy-500 text-sm mb-1">
            Installeer PakketAdvies
          </h3>
          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
            Voeg PakketAdvies toe aan je home screen voor snellere toegang en een betere ervaring.
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 px-4 py-2 bg-brand-teal-500 hover:bg-brand-teal-600 text-white rounded-lg font-semibold text-sm transition-colors"
            >
              Installeren
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Sluiten"
            >
              <X weight="bold" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

