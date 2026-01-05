'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { isCategoryAllowed } from '@/lib/cookies'

declare global {
  interface Window {
    fbq?: (
      action: string,
      event: string,
      data?: Record<string, any>
    ) => void
    _fbq?: typeof window.fbq
  }
}

interface FacebookPixelProps {
  pixelId: string
}

export function FacebookPixel({ pixelId }: FacebookPixelProps) {
  const pathname = usePathname()
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    // Check if marketing cookies are allowed
    // Facebook Pixel is considered a marketing cookie
    // IMPORTANT: Check immediately on mount, don't wait for hydration
    if (typeof window !== 'undefined') {
      // Initial check - don't load if not allowed
      const allowed = isCategoryAllowed('marketing')
      console.log('🔵 [FB PIXEL] Marketing cookies allowed?', allowed)
      console.log('🔵 [FB PIXEL] Pixel ID:', pixelId)
      setShouldLoad(allowed)

      // Listen for cookie preference changes
      const handleCookieChange = () => {
        const nowAllowed = isCategoryAllowed('marketing')
        console.log('🔵 [FB PIXEL] Cookie preferences changed. Marketing allowed?', nowAllowed)
        setShouldLoad(nowAllowed)
        if (nowAllowed && typeof window.fbq === 'function') {
          // Track page view if pixel is already loaded
          try {
            window.fbq('track', 'PageView')
            console.log('🔵 [FB PIXEL] PageView tracked after cookie change')
          } catch (error) {
            console.error('Facebook Pixel tracking error:', error)
          }
        }
      }

      window.addEventListener('cookiePreferencesChanged', handleCookieChange)
      return () => {
        window.removeEventListener('cookiePreferencesChanged', handleCookieChange)
      }
    }
  }, [])

  useEffect(() => {
    // Track page view on route change (only if pixel is loaded and allowed)
    if (shouldLoad && typeof window !== 'undefined' && typeof window.fbq === 'function') {
      try {
        window.fbq('track', 'PageView')
      } catch (error) {
        console.error('Facebook Pixel tracking error:', error)
      }
    }
  }, [pathname, shouldLoad])

  if (!pixelId || !pixelId.trim() || !shouldLoad) {
    if (!pixelId || !pixelId.trim()) {
      console.warn('🔵 [FB PIXEL] No Pixel ID configured')
    }
    if (!shouldLoad) {
      console.warn('🔵 [FB PIXEL] Not loading - marketing cookies not accepted')
    }
    return null
  }

  // Escape pixelId to prevent XSS
  const safePixelId = pixelId.replace(/[^0-9]/g, '')

  if (!safePixelId) {
    console.error('Invalid Facebook Pixel ID:', pixelId)
    return null
  }

  return (
    <>
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('🔵 [FB PIXEL] Script loaded successfully')
          console.log('🔵 [FB PIXEL] window.fbq available?', typeof window.fbq === 'function')
        }}
        onError={(e) => {
          console.error('🔵 [FB PIXEL] Script error:', e)
        }}
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s){
              if(f.fbq)return;
              n=f.fbq=function(){
                n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)
              };
              if(!f._fbq)f._fbq=n;
              n.push=n;
              n.loaded=!0;
              n.version='2.0';
              n.queue=[];
              t=b.createElement(e);
              t.async=!0;
              t.src=v;
              s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)
            }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init','${safePixelId}');
            fbq('track','PageView');
            console.log('🔵 [FB PIXEL] Initialized with ID: ${safePixelId}');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${safePixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}

