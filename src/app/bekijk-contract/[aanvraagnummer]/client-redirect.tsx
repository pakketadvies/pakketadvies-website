'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useParams, useRouter } from 'next/navigation'

/**
 * Client-side redirect voor mobiele email clients
 * Sommige email clients op mobiel kunnen server-side redirects niet goed verwerken
 * Deze component haalt de token uit de URL en redirect direct naar de contract viewer
 * 
 * Werkt ook als fallback als server-side redirect faalt
 */
export function ClientRedirect() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const aanvraagnummer = params?.aanvraagnummer as string
  const token = searchParams?.get('token')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!aanvraagnummer) {
      setError('Aanvraagnummer ontbreekt')
      return
    }

    // If token is provided, redirect immediately
    if (token) {
      // Clean token (remove whitespace, decode if needed)
      let cleanToken = token.trim().replace(/\s+/g, '')
      try {
        // Try to decode if it was double-encoded
        cleanToken = decodeURIComponent(cleanToken)
      } catch (e) {
        // If decoding fails, use original (might already be decoded)
        cleanToken = token.trim()
      }

      // Redirect to contract viewer with properly encoded token
      const encodedToken = encodeURIComponent(cleanToken)
      router.replace(`/contract/${aanvraagnummer}?token=${encodedToken}`)
      return
    }

    // If no token, try to fetch from API (fallback)
    const fetchToken = async () => {
      try {
        const response = await fetch(`/api/contract-viewer-token?aanvraagnummer=${encodeURIComponent(aanvraagnummer)}`)
        if (response.ok) {
          const data = await response.json()
          if (data.token) {
            const encodedToken = encodeURIComponent(data.token)
            router.replace(`/contract/${aanvraagnummer}?token=${encodedToken}`)
            return
          }
        }
        // If no token found, redirect to error page
        router.replace('/contract/niet-gevonden')
      } catch (err) {
        console.error('Error fetching token:', err)
        setError('Fout bij ophalen contract token')
        // Redirect to error page after delay
        setTimeout(() => {
          router.replace('/contract/niet-gevonden')
        }, 2000)
      }
    }

    fetchToken()
  }, [token, aanvraagnummer, router])

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

