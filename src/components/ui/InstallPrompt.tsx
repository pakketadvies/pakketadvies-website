'use client'

import { useState, useEffect } from 'react'
import { X, Download } from '@phosphor-icons/react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if already dismissed (localStorage)
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      return
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show prompt after a delay (better UX)
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

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
    } else {
      console.log('User dismissed the install prompt')
      handleDismiss()
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
    // Reset after 7 days
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed')
    }, 7 * 24 * 60 * 60 * 1000)
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

