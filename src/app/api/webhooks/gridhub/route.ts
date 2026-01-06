/**
 * GridHub Webhook Handler
 * 
 * Receives status updates from GridHub when order request status changes
 * POST /api/webhooks/gridhub
 */

import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendBevestigingEmail } from '@/lib/send-email-internal'

interface GridHubWebhookPayload {
  id: number
  externalReference: string
  timestamp: string
  status: 'NEW' | 'NEEDSATTENTION' | 'CANCELLED' | 'CREATED'
  statusReason?: string
  order?: {
    id: number
    status: string
    statusReason?: string
    subStatusID?: string
  }
}

/**
 * Map GridHub status to internal status
 */
function mapGridHubStatusToInternalStatus(gridhubStatus: string): string {
  const mapping: Record<string, string> = {
    NEW: 'verzonden',
    NEEDSATTENTION: 'in_behandeling',
    CREATED: 'in_behandeling',
    CANCELLED: 'geannuleerd',
  }
  return mapping[gridhubStatus] || 'in_behandeling'
}

/**
 * Send status update email to customer
 */
async function sendStatusUpdateEmail(
  aanvraagId: string,
  aanvraagnummer: string,
  status: string,
  statusReason?: string
) {
  try {
    // For now, we'll use the existing confirmation email
    // In the future, we can create specific status update emails
    if (status === 'CREATED') {
      // Order is created - send confirmation
      await sendBevestigingEmail(aanvraagId, aanvraagnummer)
    }
    // TODO: Add other status-specific emails (NEEDSATTENTION, CANCELLED, etc.)
  } catch (error: any) {
    console.error('❌ [GridHub Webhook] Error sending status update email:', error)
    // Non-blocking: don't fail webhook if email fails
  }
}

export async function POST(request: Request) {
  try {
    // TODO: Add webhook signature verification for security
    // const signature = request.headers.get('x-gridhub-signature')
    // if (!verifyWebhookSignature(signature, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    const body = await request.json()
    
    // GridHub can send single entry or array
    const entries: GridHubWebhookPayload[] = Array.isArray(body) ? body : [body]
    
    console.log(`📥 [GridHub Webhook] Received ${entries.length} status update(s)`)
    
    const supabase = createServiceRoleClient()
    let updated = 0
    let errors = 0
    
    for (const entry of entries) {
      try {
        // Find aanvraag by external_order_id or external_order_request_id
        const { data: aanvraag, error: findError } = await supabase
          .from('contractaanvragen')
          .select('id, aanvraagnummer, external_status')
          .or(
            `external_order_id.eq.${entry.externalReference},external_order_request_id.eq.${entry.externalReference}`
          )
          .single()
        
        if (findError || !aanvraag) {
          console.warn(
            `⚠️ [GridHub Webhook] Aanvraag not found for externalReference: ${entry.externalReference}`
          )
          errors++
          continue
        }
        
        // Check if status actually changed
        if (aanvraag.external_status === entry.status) {
          console.log(
            `ℹ️ [GridHub Webhook] Status unchanged for aanvraag ${aanvraag.id}: ${entry.status}`
          )
          continue
        }
        
        // Update aanvraag status
        const updateData: any = {
          external_status: entry.status,
          external_status_reason: entry.statusReason || null,
          external_last_sync: new Date().toISOString(),
          status: mapGridHubStatusToInternalStatus(entry.status),
          updated_at: new Date().toISOString(),
        }
        
        // If order is CREATED, update with order ID
        if (entry.status === 'CREATED' && entry.order) {
          updateData.external_order_id = entry.order.id.toString()
          updateData.external_sub_status_id = entry.order.subStatusID || null
          updateData.external_status = entry.order.status
          updateData.external_status_reason = entry.order.statusReason || null
        } else if (entry.order?.subStatusID) {
          updateData.external_sub_status_id = entry.order.subStatusID
        }
        
        const { error: updateError } = await supabase
          .from('contractaanvragen')
          .update(updateData)
          .eq('id', aanvraag.id)
        
        if (updateError) {
          console.error(
            `❌ [GridHub Webhook] Error updating aanvraag ${aanvraag.id}:`,
            updateError
          )
          errors++
          continue
        }
        
        console.log(
          `✅ [GridHub Webhook] Updated aanvraag ${aanvraag.id}: ${aanvraag.external_status} → ${entry.status}`
        )
        updated++
        
        // Send email notification for important status changes
        if (['CREATED', 'NEEDSATTENTION', 'CANCELLED'].includes(entry.status)) {
          await sendStatusUpdateEmail(
            aanvraag.id,
            aanvraag.aanvraagnummer,
            entry.status,
            entry.statusReason
          )
        }
      } catch (entryError: any) {
        console.error('❌ [GridHub Webhook] Error processing entry:', entryError)
        errors++
      }
    }
    
    return NextResponse.json({
      success: true,
      updated,
      errors,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('❌ [GridHub Webhook] Fatal error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// Also support GET for webhook verification (if GridHub requires it)
export async function GET(request: Request) {
  return NextResponse.json({
    message: 'GridHub webhook endpoint is active',
    timestamp: new Date().toISOString(),
  })
}

