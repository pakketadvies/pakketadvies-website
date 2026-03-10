import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { resolveLeadFunnelRecommendation } from '@/lib/lead-funnel'

const extraContextSchema = z.object({
  locationType: z.enum(['woning', 'zakelijk_pand', 'zakelijk_aan_huis', 'onbekend']).optional(),
  electricityUsageRange: z.enum(['lt_2500', '2500_5000', '5000_10000', 'gt_10000', 'unknown']).optional(),
  gasUsageRange: z.enum(['none', 'lt_1000', '1000_2000', '2000_4000', 'gt_4000', 'unknown']).optional(),
  switchMoment: z.enum(['direct', 'within_3_months', 'orienting']).optional(),
  note: z.string().max(600).optional(),
})

const bodySchema = z.object({
  extraContext: extraContextSchema,
})

function scoreExtraContext(extraContext: z.infer<typeof extraContextSchema>) {
  let score = 0
  if (extraContext.locationType && extraContext.locationType !== 'onbekend') score += 1
  if (extraContext.electricityUsageRange && extraContext.electricityUsageRange !== 'unknown') score += 2
  if (extraContext.gasUsageRange && extraContext.gasUsageRange !== 'unknown') score += 2
  if (extraContext.switchMoment === 'direct') score += 2
  if (extraContext.switchMoment === 'within_3_months') score += 1
  if (extraContext.note && extraContext.note.trim().length >= 10) score += 1

  const completion = Math.min(100, Math.round((score / 8) * 100))
  const priority = score >= 6 ? 'high' : score >= 3 ? 'medium' : 'low'
  return { completion, priority }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ success: false, error: 'Lead id ontbreekt.' }, { status: 400 })
    }

    const bodyJson = await request.json()
    const parsed = bodySchema.safeParse(bodyJson)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Ongeldige aanvullende leadinformatie.' },
        { status: 400 }
      )
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const { completion, priority } = scoreExtraContext(parsed.data.extraContext)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const { data: existingLead, error: existingLeadError } = await supabase
      .from('comparison_leads')
      .select('id, email, flow, funnel_access_token')
      .eq('id', id)
      .maybeSingle()

    if (existingLeadError || !existingLead) {
      console.error('Error loading comparison lead for context update:', existingLeadError)
      return NextResponse.json(
        { success: false, error: 'Lead niet gevonden.' },
        { status: 404 }
      )
    }

    const recommendation = await resolveLeadFunnelRecommendation(supabase, {
      flow: existingLead.flow,
      extra_context: parsed.data.extraContext,
    })

    const funnelUpdate =
      recommendation.primary
        ? {
            funnel_status: 'proposal_sent' as const,
            funnel_profile_completed_at: new Date().toISOString(),
            funnel_recommended_contract_id: recommendation.primary.id,
            funnel_fallback_contract_id: recommendation.fallback?.id || null,
            funnel_step: 1,
            funnel_next_email_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            funnel_metadata: {
              last_profile_submit_at: new Date().toISOString(),
              recommendation_rule_id: recommendation.rule?.id || null,
            },
          }
        : {}

    const { data, error } = await supabase
      .from('comparison_leads')
      .update({
        extra_context: parsed.data.extraContext,
        profile_completion: completion,
        followup_priority: priority,
        ...funnelUpdate,
      })
      .eq('id', id)
      .select('id, profile_completion, followup_priority, funnel_status')
      .single()

    if (error || !data?.id) {
      console.error('Error updating comparison lead context:', error)
      return NextResponse.json(
        { success: false, error: 'Bijwerken van leadinformatie is mislukt.' },
        { status: 500 }
      )
    }

    if (recommendation.primary && existingLead.funnel_access_token) {
      try {
        const { sendLeadFunnelProposalEmail } = await import('@/lib/send-email-internal')
        await sendLeadFunnelProposalEmail({
          leadId: existingLead.id,
          email: existingLead.email,
          accessToken: existingLead.funnel_access_token,
          contract: recommendation.primary,
          fallback: recommendation.fallback,
          step: 1,
        })
      } catch (mailError: unknown) {
        console.error('Funnel voorstelmail versturen mislukt na context update:', mailError)
      }
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      profileCompletion: data.profile_completion,
      followupPriority: data.followup_priority,
      funnelStatus: data.funnel_status,
      recommendation,
    })
  } catch (error: unknown) {
    console.error('Unexpected error updating lead context:', error)
    return NextResponse.json(
      { success: false, error: 'Onverwachte fout bij aanvullen van lead.' },
      { status: 500 }
    )
  }
}
