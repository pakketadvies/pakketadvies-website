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
 * - Server-side redirect voor desktop/normale browsers
 * - Client-side fallback voor mobiele email clients die redirects niet goed verwerken
 */
async function BekijkContractRedirectContent(props: PageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  const aanvraagnummer = params.aanvraagnummer
  let token = searchParams.token

  // Clean and validate token (remove any whitespace or encoding issues)
  if (token) {
    token = token.trim()
    // If token contains spaces or special characters that shouldn't be there, try to decode
    if (token.includes(' ')) {
      token = token.replace(/\s+/g, '')
    }
  }

  // If token is provided, redirect to contract viewer with properly encoded token
  if (token) {
    // Use encodeURIComponent to ensure proper URL encoding for mobile email clients
    const encodedToken = encodeURIComponent(token)
    redirect(`/contract/${aanvraagnummer}?token=${encodedToken}`)
  }

  // Otherwise, try to find the latest access token for this aanvraagnummer
  const supabase = await createClient()
  
  const { data: aanvraag, error: aanvraagError } = await supabase
    .from('contractaanvragen')
    .select('id')
    .eq('aanvraagnummer', aanvraagnummer)
    .single()

  if (aanvraagError || !aanvraag) {
    // If aanvraag not found, redirect to error page
    redirect('/contract/niet-gevonden')
  }

  if (aanvraag) {
    // NULL expires_at = permanent access, or expires_at > now = still valid
    const { data: accessData, error: accessError } = await supabase
      .from('contract_viewer_access')
      .select('access_token')
      .eq('aanvraag_id', aanvraag.id)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (accessError) {
      console.error('❌ [BekijkContractRedirect] Error fetching access token:', accessError)
      // Continue to fallback
    }

    if (accessData?.access_token) {
      // Properly encode token for redirect
      const encodedToken = encodeURIComponent(accessData.access_token)
      redirect(`/contract/${aanvraagnummer}?token=${encodedToken}`)
    }
  }

  // Fallback: Use client-side redirect for mobile email clients
  // This handles cases where server-side redirects don't work on mobile
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

