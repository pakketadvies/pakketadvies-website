'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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

    const url = new URL(window.location.href)
    const pathParts = url.pathname.split('/')
    const aanvraagnummer = pathParts[pathParts.length - 1] // Last part of path
    const token = url.searchParams.get('token')

    if (!aanvraagnummer || aanvraagnummer === 'bekijk-contract') {
      setError('Aanvraagnummer ontbreekt')
      setTimeout(() => {
        router.replace('/contract/niet-gevonden')
      }, 2000)
      return
    }

    // If token is provided in URL, redirect immediately
    if (token) {
      setIsRedirecting(true)
      // Clean token (remove whitespace, decode if needed)
      let cleanToken = token.trim().replace(/\s+/g, '')
      try {
        // Try to decode if it was double-encoded
        cleanToken = decodeURIComponent(cleanToken)
      } catch (e) {
        // If decoding fails, use original (might already be decoded)
        cleanToken = token.trim()
      }

      // Use window.location for redirect (more reliable on mobile than router.replace)
      const encodedToken = encodeURIComponent(cleanToken)
      window.location.href = `/contract/${aanvraagnummer}?token=${encodedToken}`
      return
    }

    // If no token, try to fetch from API (fallback)
    setIsRedirecting(true)
    const fetchToken = async () => {
      try {
        const response = await fetch(`/api/contract-viewer-token?aanvraagnummer=${encodeURIComponent(aanvraagnummer)}`)
        if (response.ok) {
          const data = await response.json()
          if (data.token) {
            const encodedToken = encodeURIComponent(data.token)
            // Use window.location for redirect (more reliable on mobile)
            window.location.href = `/contract/${aanvraagnummer}?token=${encodedToken}`
            return
          }
        }
        // If no token found, redirect to error page
        window.location.href = '/contract/niet-gevonden'
      } catch (err) {
        console.error('Error fetching token:', err)
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

