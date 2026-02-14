/**
 * GridHub Webhook Handler
 * 
 * Receives status updates from GridHub when order request status changes
 * POST /api/webhooks/gridhub
 */

import { createHmac, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendBevestigingEmail } from '@/lib/send-email-internal'
import { apiError, apiSuccess, getErrorMessage } from '@/lib/api/response'

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

const gridHubOrderSchema = z.object({
  id: z.number(),
  status: z.string(),
  statusReason: z.string().optional(),
  subStatusID: z.string().optional(),
})

const gridHubWebhookPayloadSchema = z.object({
  id: z.number(),
  externalReference: z.string().min(1),
  timestamp: z.string(),
  status: z.enum(['NEW', 'NEEDSATTENTION', 'CANCELLED', 'CREATED']),
  statusReason: z.string().optional(),
  order: gridHubOrderSchema.optional(),
})

function signaturesMatch(rawBody: string, signatureHeader: string, secret: string): boolean {
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  const candidates = signatureHeader
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.replace(/^sha256=/i, ''))

  for (const candidate of candidates) {
    try {
      const expectedBuffer = Buffer.from(expected, 'hex')
      const candidateBuffer = Buffer.from(candidate, 'hex')
      if (
        expectedBuffer.length === candidateBuffer.length &&
        timingSafeEqual(expectedBuffer, candidateBuffer)
      ) {
        return true
      }
    } catch {
      // Ignore malformed signatures and continue checking other candidates.
    }
  }

  return false
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
  } catch (error: unknown) {
    console.error('❌ [GridHub Webhook] Error sending status update email:', error)
    // Non-blocking: don't fail webhook if email fails
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const webhookSecret = process.env.GRIDHUB_WEBHOOK_SECRET?.trim()
    const signature =
      request.headers.get('x-gridhub-signature') ||
      request.headers.get('x-signature')

    if (!webhookSecret) {
      console.error('❌ [GridHub Webhook] GRIDHUB_WEBHOOK_SECRET ontbreekt')
      return apiError('Webhook endpoint not configured', 503)
    }

    if (!signature || !signaturesMatch(rawBody, signature, webhookSecret)) {
      console.error('❌ [GridHub Webhook] Invalid or missing signature')
      return apiError('Invalid signature', 401)
    }

    const body: unknown = JSON.parse(rawBody)
    
    // GridHub can send single entry or array
    const rawEntries = Array.isArray(body) ? body : [body]
    const entries: GridHubWebhookPayload[] = []
    for (const rawEntry of rawEntries) {
      const parsed = gridHubWebhookPayloadSchema.safeParse(rawEntry)
      if (!parsed.success) {
        console.error('❌ [GridHub Webhook] Invalid payload entry:', parsed.error.issues[0]?.message)
        return apiError('Invalid webhook payload', 400)
      }
      entries.push(parsed.data)
    }
    
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
        const updateData: {
          external_status: string
          external_status_reason: string | null
          external_last_sync: string
          status: string
          updated_at: string
          external_order_id?: string
          external_sub_status_id?: string | null
        } = {
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
      } catch (entryError: unknown) {
        console.error('❌ [GridHub Webhook] Error processing entry:', entryError)
        errors++
      }
    }
    
    return apiSuccess({
      updated,
      errors,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    console.error('❌ [GridHub Webhook] Fatal error:', error)
    return apiError(getErrorMessage(error), 500)
  }
}

// Also support GET for webhook verification (if GridHub requires it)
export async function GET(request: Request) {
  return apiSuccess({
    message: 'GridHub webhook endpoint is active',
    timestamp: new Date().toISOString(),
  })
}

