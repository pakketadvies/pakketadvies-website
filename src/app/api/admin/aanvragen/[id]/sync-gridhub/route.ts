/**
 * Sync GridHub Status for Aanvraag
 * POST /api/admin/aanvragen/[id]/sync-gridhub
 * 
 * Uses GET /orders/statusfeed to get latest order status
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GridHubClient } from '@/lib/integrations/gridhub/client'
import { decryptPassword } from '@/lib/integrations/gridhub/encryption'
import { gridHubLogger } from '@/lib/integrations/gridhub/logger'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

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

    console.log('🔄 [GridHub Sync] Starting sync for:', aanvraagnummer)

    // Get GridHub config (check environment variable to decide test or production)
    let apiConfig = null
    const environmentToUse = process.env.GRIDHUB_ENVIRONMENT || 'production'

    if (environmentToUse === 'test') {
      const { data: testConfig } = await supabase
        .from('leverancier_api_config')
        .select('*')
        .eq('leverancier_id', (aanvraag as any).leverancier_id)
        .eq('provider', 'GRIDHUB')
        .eq('environment', 'test')
        .eq('actief', true)
        .single()
      
      apiConfig = testConfig
    }

    if (!apiConfig) {
      const { data: prodConfig } = await supabase
        .from('leverancier_api_config')
        .select('*')
        .eq('leverancier_id', (aanvraag as any).leverancier_id)
        .eq('provider', 'GRIDHUB')
        .eq('environment', 'production')
        .eq('actief', true)
        .single()
      
      apiConfig = prodConfig
    }

    if (!apiConfig) {
      return NextResponse.json(
        { error: 'GridHub config niet gevonden' },
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
      orderID: matchingEntry.orderID,
      status: matchingEntry.status,
      statusReason: matchingEntry.statusReason,
    })

    // Log the sync
    await gridHubLogger.info('GridHub Sync: Status update found', {
      orderID: matchingEntry.orderID,
      status: matchingEntry.status,
      statusReason: matchingEntry.statusReason,
      subStatusID: matchingEntry.subStatusID,
      timestamp: matchingEntry.timestamp,
    }, {
      aanvraagId: id,
      aanvraagnummer,
    })

    // Update aanvraag
    const updateData: any = {
      external_order_id: matchingEntry.orderID?.toString() || externalOrderId, // Use orderID from feed
      external_status: matchingEntry.status,
      external_status_reason: matchingEntry.statusReason || null,
      external_sub_status_id: matchingEntry.subStatusID?.toString() || null,
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
      orderID: matchingEntry.orderID,
      statusReason: matchingEntry.statusReason,
      message: 'Status gesynchroniseerd',
    })
  } catch (error: any) {
    console.error('❌ [GridHub Sync] Error:', error)
    
    // Log error
    try {
      const supabase = await createClient()
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

