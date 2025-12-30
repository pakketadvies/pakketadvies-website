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

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

    if (!siteKey) {
      // reCAPTCHA not configured, that's okay (graceful degradation)
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
      
      // Suppress console errors from reCAPTCHA script
      const originalError = console.error
      const suppressRecaptchaErrors = (...args: any[]) => {
        const message = args[0]?.toString() || ''
        // Suppress known reCAPTCHA errors that don't affect functionality
        if (
          message.includes('Unrecognized feature') ||
          message.includes('private-token') ||
          message.includes('401') ||
          message.includes('Unauthorized')
        ) {
          return // Suppress these errors
        }
        originalError.apply(console, args)
      }
      
      script.onload = () => {
        // Restore original console.error
        console.error = originalError
        
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
            if (onError) {
              onError(new Error('reCAPTCHA failed to initialize'))
            }
          }
        }, 100)
      }
      
      script.onerror = () => {
        // Restore original console.error
        console.error = originalError
        if (onError) {
          onError(new Error('Failed to load reCAPTCHA script'))
        }
      }
      
      // Temporarily suppress errors while loading
      console.error = suppressRecaptchaErrors
      document.body.appendChild(script)
    }
  }, [onVerify, onError])

  // This component doesn't render anything visible (invisible reCAPTCHA)
  return null
}

