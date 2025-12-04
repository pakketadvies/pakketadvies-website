'use client'

import { useCallback } from 'react'

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

/**
 * Wait for Facebook Pixel to be loaded
 */
function waitForPixel(maxWait = 2000): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false)
      return
    }

    // If already loaded, resolve immediately
    if (typeof window.fbq === 'function') {
      resolve(true)
      return
    }

    // Wait for Pixel to load
    const startTime = Date.now()
    const checkInterval = setInterval(() => {
      if (typeof window.fbq === 'function') {
        clearInterval(checkInterval)
        resolve(true)
      } else if (Date.now() - startTime > maxWait) {
        clearInterval(checkInterval)
        resolve(false)
      }
    }, 100)
  })
}

/**
 * Hook to track Facebook Pixel events
 */
export function useFacebookPixel() {
  const track = useCallback((eventName: string, data?: Record<string, any>) => {
    if (typeof window === 'undefined') {
      console.warn('[Facebook Pixel] window is undefined')
      return
    }

    // Try to track immediately if Pixel is loaded
    if (typeof window.fbq === 'function') {
      try {
        window.fbq('track', eventName, data)
        console.log('[Facebook Pixel] ✅ Event tracked:', eventName, data)
        return
      } catch (error) {
        console.error('[Facebook Pixel] ❌ Error tracking event:', error, eventName, data)
        return
      }
    }

    // If Pixel not loaded yet, wait and retry
    console.warn('[Facebook Pixel] ⏳ Pixel not loaded yet, waiting... Event:', eventName, data)
    waitForPixel(2000).then((pixelLoaded) => {
      if (pixelLoaded && typeof window.fbq === 'function') {
        try {
          window.fbq('track', eventName, data)
          console.log('[Facebook Pixel] ✅ Event tracked (delayed):', eventName, data)
        } catch (error) {
          console.error('[Facebook Pixel] ❌ Error tracking event (delayed):', error, eventName, data)
        }
      } else {
        console.error('[Facebook Pixel] ❌ fbq not available after waiting. Event not tracked:', eventName, data)
        console.error('[Facebook Pixel] Make sure the Pixel is correctly installed and the Pixel ID is set.')
      }
    })
  }, [])

  const trackCustom = useCallback((eventName: string, data?: Record<string, any>) => {
    if (typeof window === 'undefined') {
      console.warn('[Facebook Pixel] window is undefined')
      return
    }

    if (typeof window.fbq === 'function') {
      try {
        window.fbq('trackCustom', eventName, data)
        console.log('[Facebook Pixel] ✅ Custom event tracked:', eventName, data)
        return
      } catch (error) {
        console.error('[Facebook Pixel] ❌ Error tracking custom event:', error, eventName, data)
        return
      }
    }

    waitForPixel(2000).then((pixelLoaded) => {
      if (pixelLoaded && typeof window.fbq === 'function') {
        try {
          window.fbq('trackCustom', eventName, data)
          console.log('[Facebook Pixel] ✅ Custom event tracked (delayed):', eventName, data)
        } catch (error) {
          console.error('[Facebook Pixel] ❌ Error tracking custom event (delayed):', error, eventName, data)
        }
      } else {
        console.error('[Facebook Pixel] ❌ fbq not available. Custom event not tracked:', eventName, data)
      }
    })
  }, [])

  return {
    track,
    trackCustom,
  }
}

