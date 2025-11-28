import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import ContractViewer from '@/components/contract/ContractViewer'

interface PageProps {
  params: Promise<{ aanvraagnummer: string }>
  searchParams: Promise<{ token?: string }>
}

async function ContractViewerContent({ aanvraagnummer, token }: { aanvraagnummer: string; token?: string }) {
  // Use service role key if token is provided (from email link)
  // Otherwise use regular client (for authenticated admin access)
  let supabase: any
  
  if (token && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Use service role key to bypass RLS when accessing via email token
    supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  } else {
    supabase = await createClient()
  }

  // First, verify access token if provided
  if (token) {
    const { data: accessData, error: tokenError } = await supabase
      .from('contract_viewer_access')
      .select('aanvraag_id, accessed_at, expires_at')
      .eq('access_token', token)
      .single()

    if (tokenError || !accessData) {
      console.error('Invalid or expired access token:', tokenError)
      redirect('/contract/niet-gevonden')
    }

    // Check if token is expired
    if (accessData.expires_at && new Date(accessData.expires_at) < new Date()) {
      console.error('Access token expired')
      redirect('/contract/niet-gevonden')
    }

    // Update accessed_at
    await supabase
      .from('contract_viewer_access')
      .update({ accessed_at: new Date().toISOString() })
      .eq('access_token', token)
  }

  // Fetch aanvraag by aanvraagnummer
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

  if (aanvraagError) {
    console.error('❌ [ContractViewer] Error fetching aanvraag:', {
      error: aanvraagError,
      code: aanvraagError.code,
      message: aanvraagError.message,
      details: aanvraagError.details,
      hint: aanvraagError.hint,
      aanvraagnummer,
      token: token ? 'present' : 'missing',
    })
    redirect('/contract/niet-gevonden')
  }

  if (!aanvraag) {
    console.error('❌ [ContractViewer] Aanvraag not found:', {
      aanvraagnummer,
      token: token ? 'present' : 'missing',
    })
    redirect('/contract/niet-gevonden')
  }
  
  console.log('✅ [ContractViewer] Aanvraag found:', {
    id: aanvraag.id,
    aanvraagnummer: aanvraag.aanvraagnummer,
    contract_id: aanvraag.contract_id,
    has_contract: !!aanvraag.contract,
  })

  // Extract data
  const verbruikData = aanvraag.verbruik_data
  const gegevensData = aanvraag.gegevens_data
  const contract = aanvraag.contract as any
  const leverancier = contract?.leverancier

  if (!contract || !leverancier) {
    redirect('/contract/niet-gevonden')
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

