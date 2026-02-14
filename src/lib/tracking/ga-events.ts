'use client'

type AnalyticsValue = string | number | boolean | null | undefined
type EventParams = Record<string, AnalyticsValue>

export function trackGAEvent(eventName: string, params?: EventParams): void {
  if (typeof window === 'undefined') {
    return
  }

  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
  if (typeof gtag !== 'function') {
    return
  }

  try {
    gtag('event', eventName, params)
  } catch (error) {
    console.error('[GA] Failed to track event:', eventName, error)
  }
}
