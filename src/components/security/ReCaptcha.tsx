'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'

/**
 * Google reCAPTCHA v3 TypeScript declarations
 */
declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

interface ReCaptchaProps {
  siteKey: string
  onLoad?: () => void
  onError?: (error: Error) => void
}

/**
 * ReCaptcha Component
 * 
 * Loads Google reCAPTCHA v3 script and provides execute function
 * Similar pattern to FacebookPixel component
 */
export function ReCaptcha({ siteKey, onLoad, onError }: ReCaptchaProps) {
  const isLoadedRef = useRef(false)

  useEffect(() => {
    // Check if grecaptcha is already available
    if (typeof window !== 'undefined' && window.grecaptcha && !isLoadedRef.current) {
      isLoadedRef.current = true
      onLoad?.()
    }
  }, [onLoad])

  const handleScriptLoad = () => {
    if (typeof window !== 'undefined' && window.grecaptcha) {
      isLoadedRef.current = true
      onLoad?.()
    }
  }

  const handleScriptError = () => {
    const error = new Error('Failed to load Google reCAPTCHA script')
    onError?.(error)
  }

  if (!siteKey) {
    // Silently fail if no site key (development mode)
    return null
  }

  return (
    <Script
      src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
      strategy="afterInteractive"
      onLoad={handleScriptLoad}
      onError={handleScriptError}
    />
  )
}

/**
 * Execute reCAPTCHA and get token
 * 
 * @param siteKey - Your reCAPTCHA site key
 * @param action - Action name (e.g., 'submit_contract_application')
 * @returns Promise<string> - reCAPTCHA token
 */
export async function executeReCaptcha(
  siteKey: string,
  action: string = 'submit'
): Promise<string | null> {
  if (typeof window === 'undefined' || !window.grecaptcha) {
    console.warn('[reCAPTCHA] grecaptcha not available')
    return null
  }

  try {
    return new Promise((resolve, reject) => {
      window.grecaptcha!.ready(() => {
        window.grecaptcha!
          .execute(siteKey, { action })
          .then((token) => {
            resolve(token)
          })
          .catch((error) => {
            console.error('[reCAPTCHA] Execute error:', error)
            reject(error)
          })
      })
    })
  } catch (error) {
    console.error('[reCAPTCHA] Error executing:', error)
    return null
  }
}

