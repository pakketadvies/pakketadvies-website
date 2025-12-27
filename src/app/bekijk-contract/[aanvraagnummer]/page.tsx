import { Suspense } from 'react'
import { ClientRedirect } from './client-redirect'

interface PageProps {
  params: Promise<{ aanvraagnummer: string }>
  searchParams: Promise<{ token?: string }>
}

/**
 * Redirect route voor email links
 * Deze route is minder verdacht voor email clients dan directe contract viewer links
 * 
 * MOBIEL FIX: 
 * - Gebruik ALTIJD client-side redirect (werkt op alle platforms)
 * - Client-side component gebruikt window.location voor betrouwbare URL parsing
 * - Werkt op desktop, mobiel, en alle email clients
 */
async function BekijkContractRedirectContent(props: PageProps) {
  // Always use client-side redirect for maximum compatibility
  // Client component uses window.location which works on all platforms
  return <ClientRedirect />
}

export default function BekijkContractRedirectPage(props: PageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Contract laden...</p>
        </div>
      </div>
    }>
      <BekijkContractRedirectContent {...props} />
    </Suspense>
  )
}

