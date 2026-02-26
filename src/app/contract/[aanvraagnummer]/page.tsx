import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ContractViewer from '@/components/contract/ContractViewer'

export const metadata: Metadata = {
  title: 'Contractviewer | PakketAdvies',
  description: 'Beveiligde contractviewer voor bestaande aanvragen.',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
}

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

  // Fetch aanvraag by aanvraagnummer first (without nested selects to avoid "Cannot coerce" error)
  // We'll fetch contract and leverancier separately
  // Use service role client to bypass RLS (this is a public contract viewer)
  let aanvraag: any = null
  let aanvraagError: any = null

  // First try with regular client
  const { data: regularAanvraag, error: regularError } = await supabase
    .from('contractaanvragen')
    .select('*')
    .eq('aanvraagnummer', aanvraagnummer)
    .maybeSingle()

  if (regularError) {
    aanvraagError = regularError
  } else if (regularAanvraag) {
    aanvraag = regularAanvraag
  }

  // If not found, try with service role client (bypasses RLS)
  if (!aanvraag && !aanvraagError) {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient } = await import('@supabase/supabase-js')
      const serviceSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )

      const { data: serviceAanvraag, error: serviceError } = await serviceSupabase
        .from('contractaanvragen')
        .select('*')
        .eq('aanvraagnummer', aanvraagnummer)
        .maybeSingle()

      if (serviceError) {
        aanvraagError = serviceError
      } else if (serviceAanvraag) {
        aanvraag = serviceAanvraag
      }
    }
  }

  if (aanvraagError) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://pakketadvies.nl'}/api/debug-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: 'error',
          message: '[ContractViewer] Server-side: Database error fetching aanvraag',
          data: { 
            aanvraagnummer, 
            error: aanvraagError.message, 
            code: aanvraagError.code,
            details: aanvraagError.details,
            hint: aanvraagError.hint
          },
          url: typeof window !== 'undefined' ? window.location.href : 'server-side',
          userAgent: 'server-side',
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {})
    } catch {}
    redirect('/contract/niet-gevonden')
  }

  if (!aanvraag) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://pakketadvies.nl'}/api/debug-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: 'error',
          message: '[ContractViewer] Server-side: Aanvraag not found in database',
          data: { 
            aanvraagnummer,
            triedRegularClient: true,
            triedServiceClient: !!process.env.SUPABASE_SERVICE_ROLE_KEY
          },
          url: typeof window !== 'undefined' ? window.location.href : 'server-side',
          userAgent: 'server-side',
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {})
    } catch {}
    redirect('/contract/niet-gevonden')
  }

  // Fetch contract separately (to avoid nested select issues)
  let contract: any = null
  let leverancier: any = null

  if (aanvraag.contract_id) {
    const { data: contractData, error: contractError } = await supabase
      .from('contracten')
      .select(`
        id,
        naam,
        type,
        leverancier_id
      `)
      .eq('id', aanvraag.contract_id)
      .maybeSingle()

    if (contractError) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://pakketadvies.nl'}/api/debug-logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level: 'error',
            message: '[ContractViewer] Server-side: Error fetching contract',
            data: { contractId: aanvraag.contract_id, error: contractError.message },
            url: typeof window !== 'undefined' ? window.location.href : 'server-side',
            userAgent: 'server-side',
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {})
      } catch {}
    } else {
      contract = contractData
    }

    // Fetch leverancier separately
    if (contract?.leverancier_id) {
      const { data: leverancierData, error: leverancierError } = await supabase
        .from('leveranciers')
        .select('id, naam, logo_url, website, over_leverancier')
        .eq('id', contract.leverancier_id)
        .maybeSingle()

      if (leverancierError) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://pakketadvies.nl'}/api/debug-logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              level: 'error',
              message: '[ContractViewer] Server-side: Error fetching leverancier',
              data: { leverancierId: contract.leverancier_id, error: leverancierError.message },
              url: typeof window !== 'undefined' ? window.location.href : 'server-side',
              userAgent: 'server-side',
              timestamp: new Date().toISOString(),
            }),
          }).catch(() => {})
        } catch {}
      } else {
        leverancier = leverancierData
      }
    }
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
  // contract and leverancier are already fetched above

  if (!contract || !leverancier) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://pakketadvies.nl'}/api/debug-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: 'error',
          message: '[ContractViewer] Server-side: Contract or leverancier missing',
          data: { hasContract: !!contract, hasLeverancier: !!leverancier, contractId: aanvraag.contract_id },
          url: typeof window !== 'undefined' ? window.location.href : 'server-side',
          userAgent: 'server-side',
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {})
    } catch {}
    redirect('/contract/niet-gevonden')
  }

  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://pakketadvies.nl'}/api/debug-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level: 'info',
        message: '[ContractViewer] Server-side: All checks passed, rendering ContractViewer component',
        data: { 
          contractType: contract.type,
          leverancierId: leverancier.id,
          hasVerbruikData: !!verbruikData,
          hasGegevensData: !!gegevensData
        },
        url: typeof window !== 'undefined' ? window.location.href : 'server-side',
        userAgent: 'server-side',
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {})
  } catch {}

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

