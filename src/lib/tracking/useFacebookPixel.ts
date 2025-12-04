'use client'

import { useCallback } from 'react'

declare global {
  interface Window {
    fbq: (
      action: string,
      event: string,
      data?: Record<string, any>
    ) => void
  }
}

/**
 * Hook to track Facebook Pixel events
 */
export function useFacebookPixel() {
  const track = useCallback((eventName: string, data?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', eventName, data)
    }
  }, [])

  const trackCustom = useCallback((eventName: string, data?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', eventName, data)
    }
  }, [])

  return {
    track,
    trackCustom,
  }
}

