/**
 * Sync GridHub Status for Aanvraag
 * POST /api/admin/aanvragen/[id]/sync-gridhub
 * 
 * Uses GET /orders/statusfeed to get latest order status
 */

import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { GridHubClient } from '@/lib/integrations/gridhub/client'
import { decryptPassword } from '@/lib/integrations/gridhub/encryption'
import { gridHubLogger } from '@/lib/integrations/gridhub/logger'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServiceRoleClient()  // Use service role to bypass RLS

    // Get aanvraag
    const { data: aanvraag, error: aanvraagError } = await supabase
      .from('contractaanvragen')
      .select('*')
      .eq('id', id)
      .single()

    if (aanvraagError || !aanvraag) {
      return NextResponse.json({ error: 'Aanvraag niet gevonden' }, { status: 404 })
    }

    if ((aanvraag as any).external_api_provider !== 'GRIDHUB') {
      return NextResponse.json(
        { error: 'Deze aanvraag heeft geen GridHub integratie' },
        { status: 400 }
      )
    }

    const aanvraagnummer = (aanvraag as any).aanvraagnummer
    const externalOrderId = (aanvraag as any).external_order_id
    const leverancierId = (aanvraag as any).leverancier_id

    console.log('🔄 [GridHub Sync] Starting sync for:', aanvraagnummer)
    console.log('🔍 [GridHub Sync] Leverancier ID:', leverancierId)

    // Get GridHub config (check environment variable to decide test or production)
    let apiConfig = null
    const environmentToUse = process.env.GRIDHUB_ENVIRONMENT || 'production'

    if (environmentToUse === 'test') {
      console.log('🔍 [GridHub Sync] Looking for TEST config...')
      const { data: testConfig, error: testError } = await supabase
        .from('leverancier_api_config')
        .select('*')
        .eq('leverancier_id', leverancierId)
        .eq('provider', 'GRIDHUB')
        .eq('environment', 'test')
        .eq('actief', true)
        .single()
      
      if (testError) {
        console.log('⚠️  [GridHub Sync] TEST config error:', testError)
      }
      apiConfig = testConfig
    }

    if (!apiConfig) {
      console.log('🔍 [GridHub Sync] Looking for PRODUCTION config...')
      const { data: prodConfig, error: prodError } = await supabase
      .from('leverancier_api_config')
      .select('*')
        .eq('leverancier_id', leverancierId)
      .eq('provider', 'GRIDHUB')
        .eq('environment', 'production')
      .eq('actief', true)
      .single()

      if (prodError) {
        console.log('⚠️  [GridHub Sync] PRODUCTION config error:', prodError)
      }
      apiConfig = prodConfig
    }

    if (!apiConfig) {
      console.error('❌ [GridHub Sync] No GridHub config found for leverancier:', leverancierId)
      console.error('❌ [GridHub Sync] Environment:', environmentToUse)
      return NextResponse.json(
        { 
          error: 'GridHub config niet gevonden',
          details: `Geen GridHub configuratie gevonden voor leverancier ${leverancierId}`,
        },
        { status: 404 }
      )
    }

    console.log('✅ [GridHub Sync] Found config:', apiConfig.environment)

    // Decrypt password
    const apiPassword = decryptPassword(apiConfig.api_password_encrypted)

    // Create GridHub client
    const gridhubClient = new GridHubClient({
      apiUrl: apiConfig.api_url,
      username: apiConfig.api_username,
      password: apiPassword,
      environment: apiConfig.environment as 'test' | 'production',
    })

    // Get status feed (last 30 days to be safe)
    const timestampFrom = new Date()
    timestampFrom.setDate(timestampFrom.getDate() - 30)

    console.log('📡 [GridHub Sync] Fetching order status feed...')

    const statusFeed = await gridhubClient.getOrderStatusFeed(timestampFrom)

    console.log(`📊 [GridHub Sync] Received ${statusFeed.data?.length || 0} orders`)

    // Find matching entry by externalReference (our aanvraagnummer)
    const matchingEntry = statusFeed.data.find(
      (entry) => entry.externalReference === aanvraagnummer
    )

    if (!matchingEntry) {
      console.log('ℹ️  [GridHub Sync] No updates found in last 30 days')
      
      await gridHubLogger.info('GridHub Sync: No updates found', {
        aanvraagnummer,
        searchedLast: '30 days',
      }, {
        aanvraagId: id,
        aanvraagnummer,
      })

      return NextResponse.json({
        success: true,
        message: 'Geen status updates gevonden in de laatste 30 dagen',
      })
    }

    console.log('✅ [GridHub Sync] Found matching order:', {
      orderID: matchingEntry.order?.id,
      status: matchingEntry.status,
      statusReason: matchingEntry.statusReason,
    })

    // Log the sync
    await gridHubLogger.info('GridHub Sync: Status update found', {
      orderID: matchingEntry.order?.id,
      status: matchingEntry.status,
      statusReason: matchingEntry.statusReason,
      subStatusID: matchingEntry.order?.subStatusID,
      timestamp: matchingEntry.timestamp,
    }, {
      aanvraagId: id,
      aanvraagnummer,
    })

    // Update aanvraag
    const updateData: any = {
      external_order_id: matchingEntry.order?.id?.toString() || externalOrderId, // Use order.id from feed
      external_status: matchingEntry.status,
      external_status_reason: matchingEntry.statusReason || null,
      external_sub_status_id: matchingEntry.order?.subStatusID?.toString() || null,
      external_last_sync: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Map to internal status
    const statusMapping: Record<string, string> = {
      NEW: 'in_behandeling',
      NEEDSATTENTION: 'in_behandeling',
      CREATED: 'in_behandeling',
      CANCELLED: 'geannuleerd',
      COMPLETED: 'afgehandeld',
    }
    
    const mappedStatus = statusMapping[matchingEntry.status]
    if (mappedStatus) {
      updateData.status = mappedStatus
    }

    console.log('💾 [GridHub Sync] Updating database...')

    const { error: updateError } = await supabase
      .from('contractaanvragen')
      .update(updateData)
      .eq('id', id)

    if (updateError) {
      console.error('❌ [GridHub Sync] Update error:', updateError)
      return NextResponse.json(
        { error: 'Fout bij updaten status: ' + updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ [GridHub Sync] Successfully updated!')

    return NextResponse.json({
      success: true,
      status: matchingEntry.status,
      orderID: matchingEntry.order?.id,
      statusReason: matchingEntry.statusReason,
      message: 'Status gesynchroniseerd',
    })
  } catch (error: any) {
    console.error('❌ [GridHub Sync] Error:', error)
    
    // Log error
    try {
      const supabase = createServiceRoleClient()
      const { data: aanvraag } = await supabase
        .from('contractaanvragen')
        .select('aanvraagnummer')
        .eq('id', (await params).id)
        .single()
      
      if (aanvraag) {
        await gridHubLogger.error('GridHub Sync: Failed', {
          error: error.message,
          stack: error.stack,
        }, {
          aanvraagId: (await params).id,
          aanvraagnummer: (aanvraag as any).aanvraagnummer,
        })
      }
    } catch (logError) {
      console.error('Failed to log sync error:', logError)
    }

    return NextResponse.json(
      { error: error.message || 'Onverwachte fout bij synchroniseren' },
      { status: 500 }
    )
  }
}

