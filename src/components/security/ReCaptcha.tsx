'use client'

import { useEffect, useRef, useState } from 'react'

interface ReCaptchaProps {
  onVerify?: (token: string | null) => void
  onError?: (error: Error) => void
}

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

export function ReCaptcha({ onVerify, onError }: ReCaptchaProps) {
  const [isReady, setIsReady] = useState(false)
  const scriptLoaded = useRef(false)
  const readyCallback = useRef<(() => void) | null>(null)

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

    if (!siteKey) {
      // reCAPTCHA not configured, that's okay (graceful degradation)
      console.warn('reCAPTCHA site key not configured')
      return
    }

    // Check if script is already loaded
    if (typeof window !== 'undefined' && window.grecaptcha && typeof window.grecaptcha.ready === 'function') {
      setIsReady(true)
      if (onVerify) {
        onVerify(null) // Signal that reCAPTCHA is ready
      }
      return
    }

    // Load reCAPTCHA script
    if (!scriptLoaded.current) {
      scriptLoaded.current = true
      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
      script.async = true
      script.defer = true
      script.onload = () => {
        // Wait a bit for grecaptcha to be fully initialized
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.grecaptcha && typeof window.grecaptcha.ready === 'function') {
            window.grecaptcha.ready(() => {
              setIsReady(true)
              if (onVerify) {
                onVerify(null) // Signal that reCAPTCHA is ready
              }
            })
          } else {
            console.error('reCAPTCHA script loaded but grecaptcha object not available')
            if (onError) {
              onError(new Error('reCAPTCHA failed to initialize'))
            }
          }
        }, 100)
      }
      script.onerror = () => {
        console.error('Failed to load reCAPTCHA script')
        if (onError) {
          onError(new Error('Failed to load reCAPTCHA script'))
        }
      }
      document.body.appendChild(script)
    }
  }, [onVerify, onError])

  // This component doesn't render anything visible (invisible reCAPTCHA)
  return null
}

