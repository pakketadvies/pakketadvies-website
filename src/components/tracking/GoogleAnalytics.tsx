'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { isCategoryAllowed } from '@/lib/cookies'

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void
    dataLayer?: any[]
  }
}

interface GoogleAnalyticsProps {
  measurementId: string
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname()
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    // Check if analytical cookies are allowed
    if (typeof window !== 'undefined') {
      const allowed = isCategoryAllowed('analytical')
      setShouldLoad(allowed)

      // Listen for cookie preference changes
      const handleCookieChange = () => {
        const nowAllowed = isCategoryAllowed('analytical')
        setShouldLoad(nowAllowed)
      }

      window.addEventListener('cookiePreferencesChanged', handleCookieChange)
      return () => {
        window.removeEventListener('cookiePreferencesChanged', handleCookieChange)
      }
    }
  }, [])

  useEffect(() => {
    // Track page view on route change (only if GA is loaded and allowed)
    if (shouldLoad && typeof window !== 'undefined' && typeof window.gtag === 'function') {
      try {
        window.gtag('config', measurementId, {
          page_path: pathname,
        })
      } catch (error) {
        console.error('Google Analytics tracking error:', error)
      }
    }
  }, [pathname, shouldLoad, measurementId])

  if (!measurementId || !measurementId.trim() || !shouldLoad) {
    return null
  }

  // Validate measurement ID format (G-XXXXXXXXXX)
  // Escape hyphen or place it at the end of character class
  const safeMeasurementId = measurementId.replace(/[^G0-9A-Z-]/gi, '')

  if (!safeMeasurementId || !safeMeasurementId.startsWith('G-')) {
    console.error('Invalid Google Analytics Measurement ID:', measurementId)
    return null
  }

  return (
    <>
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${safeMeasurementId}`}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${safeMeasurementId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}

