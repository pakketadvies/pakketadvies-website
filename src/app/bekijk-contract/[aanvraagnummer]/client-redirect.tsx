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

    console.log('🔍 [ClientRedirect] Starting redirect process...')
    console.log('🔍 [ClientRedirect] Current URL:', window.location.href)

    const url = new URL(window.location.href)
    const pathParts = url.pathname.split('/')
    const aanvraagnummer = pathParts[pathParts.length - 1] // Last part of path
    const token = url.searchParams.get('token')

    console.log('🔍 [ClientRedirect] Aanvraagnummer:', aanvraagnummer)
    console.log('🔍 [ClientRedirect] Token from URL:', token ? 'present' : 'missing')

    if (!aanvraagnummer || aanvraagnummer === 'bekijk-contract') {
      console.error('❌ [ClientRedirect] Aanvraagnummer ontbreekt')
      setError('Aanvraagnummer ontbreekt')
      setTimeout(() => {
        window.location.href = '/contract/niet-gevonden'
      }, 2000)
      return
    }

    // If token is provided in URL, redirect immediately
    if (token) {
      console.log('✅ [ClientRedirect] Token found in URL, redirecting...')
      setIsRedirecting(true)
      // Clean token (remove whitespace, decode if needed)
      let cleanToken = token.trim().replace(/\s+/g, '')
      try {
        // Try to decode if it was double-encoded
        cleanToken = decodeURIComponent(cleanToken)
        console.log('✅ [ClientRedirect] Token decoded successfully')
      } catch (e) {
        // If decoding fails, use original (might already be decoded)
        cleanToken = token.trim()
        console.log('⚠️ [ClientRedirect] Token decode failed, using original')
      }

      // Use window.location for redirect (more reliable on mobile than router.replace)
      const encodedToken = encodeURIComponent(cleanToken)
      const redirectUrl = `/contract/${aanvraagnummer}?token=${encodedToken}`
      console.log('🔄 [ClientRedirect] Redirecting to:', redirectUrl)
      window.location.href = redirectUrl
      return
    }

    // If no token, try to fetch from API (fallback)
    console.log('📡 [ClientRedirect] No token in URL, fetching from API...')
    setIsRedirecting(true)
    const fetchToken = async () => {
      try {
        const apiUrl = `/api/contract-viewer-token?aanvraagnummer=${encodeURIComponent(aanvraagnummer)}`
        console.log('📡 [ClientRedirect] Fetching token from:', apiUrl)
        const response = await fetch(apiUrl)
        console.log('📡 [ClientRedirect] API response status:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('📡 [ClientRedirect] API response data:', data)
          if (data.token) {
            const encodedToken = encodeURIComponent(data.token)
            const redirectUrl = `/contract/${aanvraagnummer}?token=${encodedToken}`
            console.log('🔄 [ClientRedirect] Redirecting with API token to:', redirectUrl)
            // Use window.location for redirect (more reliable on mobile)
            window.location.href = redirectUrl
            return
          }
        }
        // If no token found, redirect to error page
        console.error('❌ [ClientRedirect] No token found in API response')
        window.location.href = '/contract/niet-gevonden'
      } catch (err) {
        console.error('❌ [ClientRedirect] Error fetching token:', err)
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

