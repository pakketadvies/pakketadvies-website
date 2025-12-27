import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

interface PageProps {
  params: Promise<{ aanvraagnummer: string }>
  searchParams: Promise<{ token?: string }>
}

/**
 * Redirect route voor email links
 * Deze route is minder verdacht voor email clients dan directe contract viewer links
 * 
 * MOBIEL FIX: Gebruik encodeURIComponent voor token om URL encoding problemen te voorkomen
 */
export default async function BekijkContractRedirectPage(props: PageProps) {
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

  // Fallback: redirect to contract page without token (will show error)
  redirect(`/contract/${aanvraagnummer}`)
}

