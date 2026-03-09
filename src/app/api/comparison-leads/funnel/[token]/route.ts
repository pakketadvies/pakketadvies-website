import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { resolveLeadFunnelRecommendation } from '@/lib/lead-funnel'

const bodySchema = z.object({
  flow: z.enum(['business', 'consumer', 'unknown']),
  extraContext: z.object({
    locationType: z.enum(['woning', 'zakelijk_pand', 'zakelijk_aan_huis', 'onbekend']).optional(),
    electricityUsageRange: z.enum(['lt_2500', '2500_5000', '5000_10000', 'gt_10000', 'unknown']).optional(),
    gasUsageRange: z.enum(['none', 'lt_1000', '1000_2000', '2000_4000', 'gt_4000', 'unknown']).optional(),
    switchMoment: z.enum(['direct', 'within_3_months', 'orienting']).optional(),
    note: z.string().max(600).optional(),
  }),
})

function scoreExtraContext(extraContext: z.infer<typeof bodySchema>['extraContext']) {
  let score = 0
  if (extraContext.locationType && extraContext.locationType !== 'onbekend') score += 1
  if (extraContext.electricityUsageRange && extraContext.electricityUsageRange !== 'unknown') score += 2
  if (extraContext.gasUsageRange && extraContext.gasUsageRange !== 'unknown') score += 2
  if (extraContext.switchMoment === 'direct') score += 2
  if (extraContext.switchMoment === 'within_3_months') score += 1
  if (extraContext.note && extraContext.note.trim().length >= 10) score += 1

  const completion = Math.min(100, Math.round((score / 8) * 100))
  return completion
}

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    if (!token || token.length < 16) {
      return NextResponse.json({ success: false, error: 'Ongeldige token.' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()
    const { data: lead, error } = await supabase
      .from('comparison_leads')
      .select('id, email, flow, extra_context, funnel_status, funnel_step, funnel_recommended_contract_id, funnel_fallback_contract_id')
      .eq('funnel_access_token', token)
      .maybeSingle()

    if (error || !lead) {
      return NextResponse.json({ success: false, error: 'Lead niet gevonden.' }, { status: 404 })
    }

    const recommendation = await resolveLeadFunnelRecommendation(supabase, {
      flow: lead.flow,
      extra_context: lead.extra_context,
    })

    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        email: lead.email,
        flow: lead.flow,
        extraContext: lead.extra_context || {},
        funnelStatus: lead.funnel_status,
      },
      recommendation,
    })
  } catch (error: unknown) {
    console.error('Unexpected error loading lead funnel token:', error)
    return NextResponse.json({ success: false, error: 'Onverwachte fout bij laden funnel.' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    if (!token || token.length < 16) {
      return NextResponse.json({ success: false, error: 'Ongeldige token.' }, { status: 400 })
    }

    const parsed = bodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Ongeldige profieldata.' }, { status: 400 })
    }

    const payload = parsed.data
    const completion = scoreExtraContext(payload.extraContext)
    const supabase = createServiceRoleClient()

    const { data: lead, error: leadError } = await supabase
      .from('comparison_leads')
      .select('id, email')
      .eq('funnel_access_token', token)
      .maybeSingle()

    if (leadError || !lead) {
      return NextResponse.json({ success: false, error: 'Lead niet gevonden.' }, { status: 404 })
    }

    const recommendation = await resolveLeadFunnelRecommendation(supabase, {
      flow: payload.flow,
      extra_context: payload.extraContext,
    })

    const nextEmailAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const { error: updateError } = await supabase
      .from('comparison_leads')
      .update({
        flow: payload.flow,
        extra_context: payload.extraContext,
        profile_completion: completion,
        followup_priority: completion >= 70 ? 'high' : completion >= 35 ? 'medium' : 'low',
        funnel_status: 'proposal_sent',
        funnel_profile_completed_at: new Date().toISOString(),
        funnel_recommended_contract_id: recommendation.primary?.id || null,
        funnel_fallback_contract_id: recommendation.fallback?.id || null,
        funnel_step: 1,
        funnel_next_email_at: nextEmailAt,
        funnel_metadata: {
          last_profile_submit_at: new Date().toISOString(),
          recommendation_rule_id: recommendation.rule?.id || null,
        },
      })
      .eq('id', lead.id)

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
    }

    if (recommendation.primary) {
      try {
        const { sendLeadFunnelProposalEmail } = await import('@/lib/send-email-internal')
        await sendLeadFunnelProposalEmail({
          leadId: lead.id,
          email: lead.email,
          accessToken: token,
          contract: recommendation.primary,
          fallback: recommendation.fallback,
          step: 1,
        })
      } catch (emailError: unknown) {
        console.error('Funnel proposal e-mail versturen mislukt:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      recommendation,
      completion,
      leadId: lead.id,
    })
  } catch (error: unknown) {
    console.error('Unexpected error updating lead funnel profile:', error)
    return NextResponse.json({ success: false, error: 'Onverwachte fout bij opslaan profiel.' }, { status: 500 })
  }
}
