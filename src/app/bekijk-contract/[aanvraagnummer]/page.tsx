import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{ aanvraagnummer: string }>
  searchParams: Promise<{ token?: string }>
}

/**
 * Redirect route voor email links
 * Deze route is minder verdacht voor email clients dan directe contract viewer links
 */
export default async function BekijkContractRedirectPage(props: PageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  const aanvraagnummer = params.aanvraagnummer
  const token = searchParams.token

  // If token is provided, redirect to contract viewer
  if (token) {
    redirect(`/contract/${aanvraagnummer}?token=${token}`)
  }

  // Otherwise, try to find the latest access token for this aanvraagnummer
  const supabase = await createClient()
  
  const { data: aanvraag } = await supabase
    .from('contractaanvragen')
    .select('id')
    .eq('aanvraagnummer', aanvraagnummer)
    .single()

  if (aanvraag) {
    // NULL expires_at = permanent access, or expires_at > now = still valid
    const { data: accessData } = await supabase
      .from('contract_viewer_access')
      .select('access_token')
      .eq('aanvraag_id', aanvraag.id)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (accessData?.access_token) {
      redirect(`/contract/${aanvraagnummer}?token=${accessData.access_token}`)
    }
  }

  // Fallback: redirect to contract page without token (will show error)
  redirect(`/contract/${aanvraagnummer}`)
}

