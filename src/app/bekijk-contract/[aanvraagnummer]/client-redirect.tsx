'use client'

import { useEffect } from 'react'
import { useSearchParams, useParams, useRouter } from 'next/navigation'

/**
 * Client-side fallback voor mobiele email clients
 * Sommige email clients op mobiel kunnen server-side redirects niet goed verwerken
 * Deze component haalt de token uit de URL en redirect direct naar de contract viewer
 */
export function ClientRedirect() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const aanvraagnummer = params?.aanvraagnummer as string
  const token = searchParams?.get('token')

  useEffect(() => {
    if (token && aanvraagnummer) {
      // Clean token (remove whitespace, decode if needed)
      let cleanToken = token.trim().replace(/\s+/g, '')
      try {
        cleanToken = decodeURIComponent(cleanToken)
      } catch (e) {
        // If decoding fails, use original
        cleanToken = token.trim()
      }

      // Redirect to contract viewer with properly encoded token
      const encodedToken = encodeURIComponent(cleanToken)
      router.replace(`/contract/${aanvraagnummer}?token=${encodedToken}`)
    }
  }, [token, aanvraagnummer, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Contract laden...</p>
      </div>
    </div>
  )
}

