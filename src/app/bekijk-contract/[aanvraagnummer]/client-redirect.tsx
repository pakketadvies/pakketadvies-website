'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Helper function om logs naar server te sturen voor debugging
 */
async function sendLog(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any) {
  // Log ook naar console (voor desktop debugging)
  const logMessage = `[ClientRedirect] ${message}`
  if (level === 'error') {
    console.error(logMessage, data)
  } else if (level === 'warn') {
    console.warn(logMessage, data)
  } else {
    console.log(logMessage, data)
  }

  // Stuur ook naar server voor mobiele debugging
  try {
    await fetch('/api/debug-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        level,
        message,
        data: data || {},
        url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        timestamp: new Date().toISOString(),
      }),
    }).catch((err) => {
      // Fail silently - logging is non-critical
      console.warn('[ClientRedirect] Failed to send log to server:', err)
    })
  } catch (err) {
    // Fail silently
  }
}

/**
 * Client-side redirect voor mobiele email clients
 * Gebruikt window.location voor betrouwbare URL parsing op alle platforms
 * Dit werkt altijd, ook op mobiele browsers en email clients
 */
export function ClientRedirect() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Use window.location for reliable URL parsing on all platforms (especially mobile)
    if (typeof window === 'undefined') return

    sendLog('info', 'Starting redirect process', { url: window.location.href })

    const url = new URL(window.location.href)
    const pathParts = url.pathname.split('/')
    const aanvraagnummer = pathParts[pathParts.length - 1] // Last part of path
    const token = url.searchParams.get('token')

    sendLog('info', 'Parsed URL', { aanvraagnummer, hasToken: !!token, pathname: url.pathname, search: url.search })

    if (!aanvraagnummer || aanvraagnummer === 'bekijk-contract') {
      sendLog('error', 'Aanvraagnummer ontbreekt', { pathParts, aanvraagnummer })
      setError('Aanvraagnummer ontbreekt')
      setTimeout(() => {
        window.location.href = '/contract/niet-gevonden'
      }, 2000)
      return
    }

    // If token is provided in URL, redirect immediately
    if (token) {
      sendLog('info', 'Token found in URL, processing...', { tokenLength: token.length })
      setIsRedirecting(true)
      // Clean token (remove whitespace, decode if needed)
      let cleanToken = token.trim().replace(/\s+/g, '')
      try {
        // Try to decode if it was double-encoded
        cleanToken = decodeURIComponent(cleanToken)
        sendLog('info', 'Token decoded successfully', { originalLength: token.length, decodedLength: cleanToken.length })
      } catch (e) {
        // If decoding fails, use original (might already be decoded)
        cleanToken = token.trim()
        sendLog('warn', 'Token decode failed, using original', { error: e instanceof Error ? e.message : String(e) })
      }

      // Use window.location for redirect (more reliable on mobile than router.replace)
      const encodedToken = encodeURIComponent(cleanToken)
      const redirectUrl = `/contract/${aanvraagnummer}?token=${encodedToken}`
      sendLog('info', 'Redirecting with token from URL', { redirectUrl, tokenLength: encodedToken.length })
      window.location.href = redirectUrl
      return
    }

    // If no token, try to fetch from API (fallback)
    sendLog('info', 'No token in URL, fetching from API...', { aanvraagnummer })
    setIsRedirecting(true)
    const fetchToken = async () => {
      try {
        const apiUrl = `/api/contract-viewer-token?aanvraagnummer=${encodeURIComponent(aanvraagnummer)}`
        sendLog('info', 'Fetching token from API', { apiUrl })
        const response = await fetch(apiUrl)
        sendLog('info', 'API response received', { status: response.status, statusText: response.statusText })
        if (response.ok) {
          const data = await response.json()
          sendLog('info', 'API response data', { hasToken: !!data.token, success: data.success })
          if (data.token) {
            const encodedToken = encodeURIComponent(data.token)
            const redirectUrl = `/contract/${aanvraagnummer}?token=${encodedToken}`
            sendLog('info', 'Redirecting with API token', { redirectUrl })
            // Use window.location for redirect (more reliable on mobile)
            window.location.href = redirectUrl
            return
          }
        }
        // If no token found, redirect to error page
        sendLog('error', 'No token found in API response', { status: response.status })
        window.location.href = '/contract/niet-gevonden'
      } catch (err) {
        sendLog('error', 'Error fetching token from API', { error: err instanceof Error ? err.message : String(err) })
        setError('Fout bij ophalen contract token')
        // Redirect to error page after delay
        setTimeout(() => {
          window.location.href = '/contract/niet-gevonden'
        }, 2000)
      }
    }

    fetchToken()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600">Doorverwijzen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Contract laden...</p>
      </div>
    </div>
  )
}

