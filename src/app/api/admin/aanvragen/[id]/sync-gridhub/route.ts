/**
 * Sync GridHub Status for Aanvraag
 * POST /api/admin/aanvragen/[id]/sync-gridhub
 */

import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { GridHubClient } from '@/lib/integrations/gridhub/client'
import { decryptPassword } from '@/lib/integrations/gridhub/encryption'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServiceRoleClient()

    // Get aanvraag
    const { data: aanvraag, error: aanvraagError } = await supabase
      .from('contractaanvragen')
      .select('*, leverancier:leveranciers(id)')
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

    // Get GridHub config
    const { data: apiConfig, error: configError } = await supabase
      .from('leverancier_api_config')
      .select('*')
      .eq('leverancier_id', (aanvraag as any).leverancier_id)
      .eq('provider', 'GRIDHUB')
      .eq('actief', true)
      .single()

    if (configError || !apiConfig) {
      return NextResponse.json(
        { error: 'GridHub config niet gevonden' },
        { status: 404 }
      )
    }

    // Decrypt password
    const apiPassword = decryptPassword(apiConfig.api_password_encrypted)

    // Create GridHub client
    const gridhubClient = new GridHubClient({
      apiUrl: apiConfig.api_url,
      username: apiConfig.api_username,
      password: apiPassword,
      environment: apiConfig.environment as 'test' | 'production',
    })

    // Get status feed (last 24 hours)
    const timestampFrom = new Date()
    timestampFrom.setHours(timestampFrom.getHours() - 24)

    const statusFeed = await gridhubClient.getOrderRequestStatusFeed(timestampFrom)

    // Find matching entry
    const matchingEntry = statusFeed.data.find(
      (entry) =>
        entry.externalReference === (aanvraag as any).external_order_id ||
        entry.externalReference === (aanvraag as any).external_order_request_id
    )

    if (!matchingEntry) {
      return NextResponse.json({
        success: true,
        message: 'Geen status updates gevonden in de laatste 24 uur',
      })
    }

    // Update aanvraag
    const updateData: any = {
      external_status: matchingEntry.status,
      external_status_reason: matchingEntry.statusReason || null,
      external_last_sync: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Map to internal status
    const statusMapping: Record<string, string> = {
      NEW: 'verzonden',
      NEEDSATTENTION: 'in_behandeling',
      CREATED: 'in_behandeling',
      CANCELLED: 'geannuleerd',
    }
    updateData.status = statusMapping[matchingEntry.status] || 'in_behandeling'

    // If order is CREATED, update with order ID
    if (matchingEntry.status === 'CREATED' && matchingEntry.order) {
      updateData.external_order_id = matchingEntry.order.id.toString()
      updateData.external_sub_status_id = matchingEntry.order.subStatusID || null
      updateData.external_status = matchingEntry.order.status
      updateData.external_status_reason = matchingEntry.order.statusReason || null
    } else if (matchingEntry.order?.subStatusID) {
      updateData.external_sub_status_id = matchingEntry.order.subStatusID
    }

    const { error: updateError } = await supabase
      .from('contractaanvragen')
      .update(updateData)
      .eq('id', id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Fout bij updaten status: ' + updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      status: matchingEntry.status,
      message: 'Status gesynchroniseerd',
    })
  } catch (error: any) {
    console.error('Error syncing GridHub status:', error)
    return NextResponse.json(
      { error: error.message || 'Onverwachte fout' },
      { status: 500 }
    )
  }
}

