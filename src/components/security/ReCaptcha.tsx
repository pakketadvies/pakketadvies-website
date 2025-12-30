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
    if (window.grecaptcha && window.grecaptcha.ready) {
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
        if (window.grecaptcha && window.grecaptcha.ready) {
          window.grecaptcha.ready(() => {
            setIsReady(true)
            if (onVerify) {
              onVerify(null) // Signal that reCAPTCHA is ready
            }
          })
        } else {
          if (onError) {
            onError(new Error('reCAPTCHA failed to load'))
          }
        }
      }
      script.onerror = () => {
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

