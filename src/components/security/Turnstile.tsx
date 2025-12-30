'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string
          callback?: (token: string) => void
          'error-callback'?: () => void
          'expired-callback'?: () => void
          theme?: 'light' | 'dark' | 'auto'
          size?: 'normal' | 'compact'
          language?: string
        }
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
      getResponse: (widgetId: string) => string | null
    }
  }
}

interface TurnstileProps {
  siteKey: string
  onSuccess: (token: string) => void
  onError?: () => void
  onExpire?: () => void
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
  language?: string
}

export function Turnstile({
  siteKey,
  onSuccess,
  onError,
  onExpire,
  theme = 'light',
  size = 'normal',
  language = 'nl',
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load Turnstile script
  useEffect(() => {
    // Check if already loaded
    if (window.turnstile) {
      console.log('[Turnstile] Script already loaded')
      setIsLoaded(true)
      return
    }

    console.log('[Turnstile] Loading script...')
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    script.onload = () => {
      console.log('[Turnstile] Script loaded successfully')
      setIsLoaded(true)
      setError(null)
    }
    script.onerror = (err) => {
      console.error('[Turnstile] Script load error:', err)
      setError('Kon Turnstile niet laden')
      setIsLoaded(false)
    }

    document.body.appendChild(script)

    return () => {
      // Cleanup: remove script and widget
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch (e) {
          console.error('Error removing Turnstile widget:', e)
        }
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  // Render widget when script is loaded
  useEffect(() => {
    // Trim siteKey to remove any whitespace/newlines
    const trimmedSiteKey = siteKey?.trim()
    
    if (!isLoaded || !window.turnstile || !containerRef.current || !trimmedSiteKey) {
      return
    }

    // Clean up existing widget if any
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current)
      } catch (e) {
        // Ignore errors during cleanup
      }
      widgetIdRef.current = null
    }

    // Clear container
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
    }

    try {
      console.log('[Turnstile] Rendering widget with site key:', trimmedSiteKey?.substring(0, 10) + '...')
      console.log('[Turnstile] Container element:', containerRef.current)
      console.log('[Turnstile] Window.turnstile available:', !!window.turnstile)
      console.log('[Turnstile] Current URL:', window.location.href)
      
      const widgetId = window.turnstile.render(containerRef.current, {
        sitekey: trimmedSiteKey,
        callback: (token: string) => {
          console.log('[Turnstile] Success! Token received:', token?.substring(0, 20) + '...')
          onSuccess(token)
        },
        'error-callback': (error?: any) => {
          console.error('[Turnstile] Error callback triggered:', error)
          console.error('[Turnstile] Site key used:', trimmedSiteKey?.substring(0, 10) + '...')
          console.error('[Turnstile] Container:', containerRef.current)
          console.error('[Turnstile] Current URL:', window.location.href)
          setError('Turnstile verificatie mislukt')
          if (onError) {
            onError()
          }
        },
        'expired-callback': () => {
          console.warn('[Turnstile] Token expired')
          setError('Turnstile verificatie verlopen')
          if (onExpire) {
            onExpire()
          }
        },
        theme,
        size,
        language,
      })

      console.log('[Turnstile] Widget rendered with ID:', widgetId)
      widgetIdRef.current = widgetId
    } catch (err) {
      console.error('[Turnstile] Error rendering widget:', err)
      setError('Kon Turnstile widget niet renderen')
    }
  }, [isLoaded, siteKey, theme, size, language, onSuccess, onError, onExpire])

  // Trim siteKey to remove any whitespace/newlines
  const trimmedSiteKey = siteKey?.trim()
  
  if (!trimmedSiteKey) {
    return null
  }

  return (
    <div className="turnstile-container">
      <div ref={containerRef} className="flex justify-center" />
      {error && (
        <p className="text-xs text-red-600 mt-2 text-center">{error}</p>
      )}
    </div>
  )
}

/**
 * Execute Turnstile and get token
 * This is a helper function for programmatic token generation
 * Note: This function is not currently used, but kept for future reference
 */
export async function executeTurnstile(siteKey: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.turnstile) {
      reject(new Error('Turnstile not loaded'))
      return
    }

    // Create a temporary container (hidden)
    const container = document.createElement('div')
    container.style.display = 'none'
    document.body.appendChild(container)

    try {
      const widgetId = window.turnstile.render(container, {
        sitekey: siteKey,
        callback: (token: string) => {
          // Clean up
          if (window.turnstile) {
            window.turnstile.remove(widgetId)
          }
          document.body.removeChild(container)
          resolve(token)
        },
        'error-callback': () => {
          // Clean up
          if (window.turnstile) {
            window.turnstile.remove(widgetId)
          }
          document.body.removeChild(container)
          reject(new Error('Turnstile verification failed'))
        },
        size: 'normal', // Use normal size (container is hidden anyway)
      })
    } catch (error) {
      document.body.removeChild(container)
      reject(error)
    }
  })
}

