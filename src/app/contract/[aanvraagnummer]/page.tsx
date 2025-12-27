import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ContractViewer from '@/components/contract/ContractViewer'

interface PageProps {
  params: Promise<{ aanvraagnummer: string }>
  searchParams: Promise<{ token?: string }>
}

async function ContractViewerContent({ aanvraagnummer, token }: { aanvraagnummer: string; token?: string }) {
  const supabase = await createClient()

  // Log start of contract viewer (server-side)
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://pakketadvies.nl'}/api/debug-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level: 'info',
        message: '[ContractViewer] Server-side: Starting contract viewer',
        data: { aanvraagnummer, hasToken: !!token, tokenLength: token?.length },
        url: typeof window !== 'undefined' ? window.location.href : 'server-side',
        userAgent: 'server-side',
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {}) // Fail silently
  } catch {}

  // Clean and validate token (mobile email clients sometimes add extra characters)
  let cleanToken = token
  if (token) {
    cleanToken = token.trim()
    // Remove any whitespace that might have been added by email clients
    cleanToken = cleanToken.replace(/\s+/g, '')
    // Decode if it was double-encoded
    try {
      cleanToken = decodeURIComponent(cleanToken)
    } catch (e) {
      // If decoding fails, use original token
      cleanToken = token.trim()
    }
  }

  // Fetch aanvraag by aanvraagnummer first
  const { data: aanvraag, error: aanvraagError } = await supabase
    .from('contractaanvragen')
    .select(`
      *,
      contract:contracten(
        id,
        naam,
        type,
        leverancier:leveranciers(
          id,
          naam,
          logo_url,
          website,
          over_leverancier
        )
      )
    `)
    .eq('aanvraagnummer', aanvraagnummer)
    .single()

  if (aanvraagError || !aanvraag) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://pakketadvies.nl'}/api/debug-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: 'error',
          message: '[ContractViewer] Server-side: Aanvraag not found',
          data: { aanvraagnummer, error: aanvraagError?.message },
          url: typeof window !== 'undefined' ? window.location.href : 'server-side',
          userAgent: 'server-side',
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {})
    } catch {}
    redirect('/contract/niet-gevonden')
  }

  // Verify access token if provided (after fetching aanvraag to get aanvraag_id)
  if (cleanToken) {
    const { data: accessData, error: tokenError } = await supabase
      .from('contract_viewer_access')
      .select('aanvraag_id, accessed_at, expires_at')
      .eq('access_token', cleanToken)
      .eq('aanvraag_id', aanvraag.id)
      .single()

    // Check if token is valid and not expired
    if (!accessData || tokenError) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://pakketadvies.nl'}/api/debug-logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level: 'warn',
            message: '[ContractViewer] Server-side: Token verification failed, trying fallback',
            data: { 
              tokenError: tokenError?.message,
              hasAccessData: !!accessData,
              aanvraagId: aanvraag.id,
              cleanTokenLength: cleanToken.length
            },
            url: typeof window !== 'undefined' ? window.location.href : 'server-side',
            userAgent: 'server-side',
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {})
      } catch {}

      // Token invalid or not found - try to find valid token in database as fallback
      const { data: fallbackAccessData } = await supabase
        .from('contract_viewer_access')
        .select('access_token, expires_at')
        .eq('aanvraag_id', aanvraag.id)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (fallbackAccessData?.access_token) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://pakketadvies.nl'}/api/debug-logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              level: 'info',
              message: '[ContractViewer] Server-side: Using fallback token',
              data: { fallbackTokenLength: fallbackAccessData.access_token.length },
              url: typeof window !== 'undefined' ? window.location.href : 'server-side',
              userAgent: 'server-side',
              timestamp: new Date().toISOString(),
            }),
          }).catch(() => {})
        } catch {}
        // Redirect with valid token from database
        const encodedToken = encodeURIComponent(fallbackAccessData.access_token)
        redirect(`/contract/${aanvraagnummer}?token=${encodedToken}`)
      }
      
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://pakketadvies.nl'}/api/debug-logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level: 'error',
            message: '[ContractViewer] Server-side: No valid token found, redirecting to error page',
            data: { aanvraagId: aanvraag.id },
            url: typeof window !== 'undefined' ? window.location.href : 'server-side',
            userAgent: 'server-side',
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {})
      } catch {}
      // No valid token found - redirect to error page
      redirect('/contract/niet-gevonden')
    }

    // Check if token is expired
    // NULL expires_at = permanent access (no expiration)
    if (accessData.expires_at && new Date(accessData.expires_at) < new Date()) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://pakketadvies.nl'}/api/debug-logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level: 'error',
            message: '[ContractViewer] Server-side: Token expired',
            data: { expiresAt: accessData.expires_at },
            url: typeof window !== 'undefined' ? window.location.href : 'server-side',
            userAgent: 'server-side',
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {})
      } catch {}
      redirect('/contract/niet-gevonden')
    }

    // Update accessed_at if token is valid
    if (accessData) {
      await supabase
        .from('contract_viewer_access')
        .update({ accessed_at: new Date().toISOString() })
        .eq('access_token', cleanToken)
    }

    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://pakketadvies.nl'}/api/debug-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: 'info',
          message: '[ContractViewer] Server-side: Token verified successfully, rendering viewer',
          data: { aanvraagId: aanvraag.id, contractId: aanvraag.contract_id },
          url: typeof window !== 'undefined' ? window.location.href : 'server-side',
          userAgent: 'server-side',
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {})
    } catch {}
  } else {
    // No token provided - check if there's a valid token in database
    // NULL expires_at = permanent access, or expires_at > now = still valid
    const { data: accessData } = await supabase
      .from('contract_viewer_access')
      .select('access_token, expires_at')
      .eq('aanvraag_id', aanvraag.id)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // If no valid token found, redirect to error page
    if (!accessData) {
      redirect('/contract/niet-gevonden')
    }
  }

  // Extract data
  const verbruikData = aanvraag.verbruik_data
  const gegevensData = aanvraag.gegevens_data
  const contract = aanvraag.contract as any
  const leverancier = contract?.leverancier

  if (!contract || !leverancier) {
    redirect('/contract/niet-gevonden')
  }

  // Fetch contract details based on type
  let contractDetails: any = null
  if (contract.type === 'vast') {
    const { data: details } = await supabase
      .from('contract_details_vast')
      .select('*')
      .eq('contract_id', contract.id)
      .single()
    contractDetails = details
  } else if (contract.type === 'dynamisch') {
    const { data: details } = await supabase
      .from('contract_details_dynamisch')
      .select('*')
      .eq('contract_id', contract.id)
      .single()
    contractDetails = details
  } else if (contract.type === 'maatwerk') {
    const { data: details } = await supabase
      .from('contract_details_maatwerk')
      .select('*')
      .eq('contract_id', contract.id)
      .single()
    contractDetails = details
  }

  return (
    <ContractViewer
      aanvraag={{
        id: aanvraag.id,
        aanvraagnummer: aanvraag.aanvraagnummer,
        status: aanvraag.status,
        created_at: aanvraag.created_at,
      }}
      contract={{
        id: contract.id,
        naam: aanvraag.contract_naam || contract.naam,
        type: aanvraag.contract_type,
        details: contractDetails,
      }}
      leverancier={{
        id: leverancier.id,
        naam: aanvraag.leverancier_naam || leverancier.naam,
        logo_url: leverancier.logo_url,
        website: leverancier.website,
        over_leverancier: leverancier.over_leverancier,
      }}
      verbruikData={verbruikData}
      gegevensData={gegevensData}
    />
  )
}

export default async function ContractViewerPage(props: PageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  const aanvraagnummer = params.aanvraagnummer
  const token = searchParams.token

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Contract laden...</p>
        </div>
      </div>
    }>
      <ContractViewerContent aanvraagnummer={aanvraagnummer} token={token} />
    </Suspense>
  )
}

