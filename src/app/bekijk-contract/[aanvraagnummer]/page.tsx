import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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
 * - Client-side component haalt token uit URL of via API
 * - Server-side redirects kunnen problemen geven op mobiele email clients
 */
async function BekijkContractRedirectContent(props: PageProps) {
  // Always use client-side redirect for maximum compatibility
  // This works on both desktop and mobile, and handles all edge cases
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

