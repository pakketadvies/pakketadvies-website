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
  console.log('🔍 [ContractViewer] Starting with:', { aanvraagnummer, hasToken: !!token })
  
  // Use service role key if token is provided (from email link)
  // Otherwise use regular client (for authenticated admin access)
  let supabase: any
  
  if (token) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ [ContractViewer] SUPABASE_SERVICE_ROLE_KEY not available')
      redirect('/contract/niet-gevonden')
    }
    
    // Always use service role key when token is provided to bypass RLS
    console.log('🔑 [ContractViewer] Using service role key for token-based access')
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
    console.log('👤 [ContractViewer] Using regular client (no token)')
    supabase = await createClient()
  }

  // First, verify access token if provided
  if (token) {
    console.log('🔐 [ContractViewer] Verifying access token...')
    console.log('🔐 [ContractViewer] Token (first 10 chars):', token.substring(0, 10) + '...')
    
    try {
      const { data: accessData, error: tokenError } = await supabase
        .from('contract_viewer_access')
        .select('aanvraag_id, accessed_at, expires_at')
        .eq('access_token', token)
        .single()

      if (tokenError) {
        console.error('❌ [ContractViewer] Token error:', {
          code: tokenError.code,
          message: tokenError.message,
          details: tokenError.details,
          hint: tokenError.hint,
          using_service_role: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        })
        redirect('/contract/niet-gevonden')
      }

      if (!accessData) {
        console.error('❌ [ContractViewer] Access token not found in database')
        console.error('❌ [ContractViewer] Token searched:', token.substring(0, 10) + '...')
        redirect('/contract/niet-gevonden')
      }

      console.log('✅ [ContractViewer] Token found:', {
        aanvraag_id: accessData.aanvraag_id,
        expires_at: accessData.expires_at,
        is_expired: accessData.expires_at ? new Date(accessData.expires_at) < new Date() : false,
      })

      // Check if token is expired
      if (accessData.expires_at && new Date(accessData.expires_at) < new Date()) {
        console.error('❌ [ContractViewer] Access token expired:', accessData.expires_at)
        redirect('/contract/niet-gevonden')
      }

      // Update accessed_at (non-blocking)
      try {
        await supabase
          .from('contract_viewer_access')
          .update({ accessed_at: new Date().toISOString() })
          .eq('access_token', token)
        console.log('✅ [ContractViewer] Updated accessed_at timestamp')
      } catch (updateError: any) {
        console.warn('⚠️ [ContractViewer] Failed to update accessed_at (non-critical):', updateError.message)
      }
    } catch (tokenVerifyError: any) {
      console.error('❌ [ContractViewer] Exception during token verification:', {
        message: tokenVerifyError.message,
        stack: tokenVerifyError.stack,
      })
      redirect('/contract/niet-gevonden')
    }
  }

  // Fetch aanvraag by aanvraagnummer
  // Use simpler query first (without nested select) to avoid RLS issues
  console.log('🔍 [ContractViewer] Fetching aanvraag with aanvraagnummer:', aanvraagnummer)
  const { data: aanvraag, error: aanvraagError } = await supabase
    .from('contractaanvragen')
    .select('*')
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
      using_service_role: !!token && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    })
    redirect('/contract/niet-gevonden')
  }

  if (!aanvraag) {
    console.error('❌ [ContractViewer] Aanvraag not found (no data returned):', {
      aanvraagnummer,
      token: token ? 'present' : 'missing',
      using_service_role: !!token && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    })
    redirect('/contract/niet-gevonden')
  }
  
  console.log('✅ [ContractViewer] Aanvraag found:', {
    id: aanvraag.id,
    aanvraagnummer: aanvraag.aanvraagnummer,
    contract_id: aanvraag.contract_id,
    has_verbruik_data: !!aanvraag.verbruik_data,
    has_gegevens_data: !!aanvraag.gegevens_data,
  })

  // Fetch contract separately to avoid nested query issues
  let contract: any = null
  let leverancier: any = null
  
  if (aanvraag.contract_id) {
    console.log('🔍 [ContractViewer] Fetching contract separately:', aanvraag.contract_id)
    const { data: contractData, error: contractError } = await supabase
      .from('contracten')
      .select(`
        id,
        naam,
        type,
        leverancier_id
      `)
      .eq('id', aanvraag.contract_id)
      .single()
    
    if (contractError) {
      console.error('❌ [ContractViewer] Error fetching contract:', {
        error: contractError,
        code: contractError.code,
        message: contractError.message,
        contract_id: aanvraag.contract_id,
      })
      // Continue with fallback data from aanvraag
    } else if (contractData) {
      contract = contractData
      console.log('✅ [ContractViewer] Contract found:', contract.id)
      
      // Fetch leverancier separately
      if (contract.leverancier_id) {
        console.log('🔍 [ContractViewer] Fetching leverancier separately:', contract.leverancier_id)
        const { data: leverancierData, error: leverancierError } = await supabase
          .from('leveranciers')
          .select('id, naam, logo_url, website, over_leverancier')
          .eq('id', contract.leverancier_id)
          .single()
        
        if (leverancierError) {
          console.error('❌ [ContractViewer] Error fetching leverancier:', {
            error: leverancierError,
            code: leverancierError.code,
            message: leverancierError.message,
            leverancier_id: contract.leverancier_id,
          })
          // Continue with fallback data from aanvraag
        } else if (leverancierData) {
          leverancier = leverancierData
          console.log('✅ [ContractViewer] Leverancier found:', leverancier.id)
        }
      }
    }
  }

  // Extract data
  const verbruikData = aanvraag.verbruik_data
  const gegevensData = aanvraag.gegevens_data

  // Use fallback data from aanvraag if contract/leverancier not found
  if (!contract) {
    console.warn('⚠️ [ContractViewer] Contract not found, using fallback data from aanvraag')
    contract = {
      id: aanvraag.contract_id,
      naam: aanvraag.contract_naam || 'Onbekend contract',
      type: aanvraag.contract_type || 'vast',
    }
  }

  if (!leverancier) {
    console.warn('⚠️ [ContractViewer] Leverancier not found, using fallback data from aanvraag')
    leverancier = {
      id: aanvraag.leverancier_id,
      naam: aanvraag.leverancier_naam || 'Onbekende leverancier',
      logo_url: null,
      website: null,
      over_leverancier: null,
    }
  }

  console.log('✅ [ContractViewer] All data available, rendering ContractViewer component')

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

