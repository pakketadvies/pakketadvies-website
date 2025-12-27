import { Suspense } from 'react'
import { ClientRedirect } from './client-redirect'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ aanvraagnummer: string }>
  searchParams: Promise<{ token?: string }>
}

/**
 * Redirect route voor email links
 * Deze route is minder verdacht voor email clients dan directe contract viewer links
 * 
 * MOBIEL FIX: 
 * - Probeer eerst server-side redirect (snel, werkt op desktop)
 * - Als dat niet werkt, gebruik client-side redirect (werkt altijd)
 * - Client-side component gebruikt window.location voor betrouwbare URL parsing
 */
async function BekijkContractRedirectContent(props: PageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  const aanvraagnummer = params.aanvraagnummer
  let token = searchParams.token

  // Clean token if provided
  if (token) {
    token = token.trim().replace(/\s+/g, '')
  }

  // If token is provided, try server-side redirect first (fast, works on desktop)
  if (token) {
    try {
      const encodedToken = encodeURIComponent(token)
      redirect(`/contract/${aanvraagnummer}?token=${encodedToken}`)
    } catch (e) {
      // If redirect fails, fall through to client-side
    }
  }

  // Otherwise, try to find token in database
  const supabase = await createClient()
  const { data: aanvraag } = await supabase
    .from('contractaanvragen')
    .select('id')
    .eq('aanvraagnummer', aanvraagnummer)
    .single()

  if (aanvraag) {
    const { data: accessData } = await supabase
      .from('contract_viewer_access')
      .select('access_token')
      .eq('aanvraag_id', aanvraag.id)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (accessData?.access_token) {
      try {
        const encodedToken = encodeURIComponent(accessData.access_token)
        redirect(`/contract/${aanvraagnummer}?token=${encodedToken}`)
      } catch (e) {
        // If redirect fails, fall through to client-side
      }
    }
  }

  // Fallback: Use client-side redirect (works on all platforms, especially mobile)
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

