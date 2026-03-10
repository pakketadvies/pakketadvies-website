import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendLeadFunnelCompleteProfileEmail, sendLeadFunnelProposalEmail } from '@/lib/send-email-internal'
import { resolveLeadFunnelRecommendation } from '@/lib/lead-funnel'

function getSupplierFromRelation(leverancier: unknown) {
  if (Array.isArray(leverancier)) {
    const first = leverancier[0] as { naam?: string; logo_url?: string | null } | undefined
    return {
      name: first?.naam || 'Onbekende leverancier',
      logoUrl: first?.logo_url || null,
    }
  }

  if (leverancier && typeof leverancier === 'object') {
    const single = leverancier as { naam?: string; logo_url?: string | null }
    return {
      name: single.naam || 'Onbekende leverancier',
      logoUrl: single.logo_url || null,
    }
  }

  return { name: 'Onbekende leverancier', logoUrl: null }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
    }

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

    const nowIso = new Date().toISOString()
    const { data: leads, error } = await supabase
      .from('comparison_leads')
      .select(
        'id, email, flow, extra_context, funnel_access_token, funnel_status, funnel_step, funnel_next_email_at, funnel_recommended_contract_id, funnel_fallback_contract_id, status'
      )
      .in('funnel_status', ['pending_profile', 'profile_completed', 'proposal_sent'])
      .neq('status', 'converted')
      .not('funnel_access_token', 'is', null)
      .not('funnel_next_email_at', 'is', null)
      .lte('funnel_next_email_at', nowIso)
      .limit(200)

    if (error) {
      throw new Error(error.message)
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({ success: true, processed: 0, sent: 0, failed: 0 })
    }

    let sent = 0
    let failed = 0
    for (const lead of leads) {
      try {
        if (!lead.funnel_access_token) continue

        if (lead.funnel_status === 'pending_profile') {
          await sendLeadFunnelCompleteProfileEmail({
            leadId: lead.id,
            email: lead.email,
            accessToken: lead.funnel_access_token,
            step: Math.max(1, lead.funnel_step || 1),
          })

          const nextStep = (lead.funnel_step || 0) + 1
          const nextEmailAt =
            nextStep >= 3 ? null : new Date(Date.now() + (nextStep === 1 ? 48 : 72) * 60 * 60 * 1000).toISOString()

          await supabase
            .from('comparison_leads')
            .update({
              funnel_step: nextStep,
              funnel_last_email_sent_at: new Date().toISOString(),
              funnel_next_email_at: nextEmailAt,
            })
            .eq('id', lead.id)

          sent++
          continue
        }

        if (lead.funnel_status === 'profile_completed' || lead.funnel_status === 'proposal_sent') {
          const resolved = await resolveLeadFunnelRecommendation(supabase, {
            flow: lead.flow,
            extra_context: lead.extra_context,
          })

          let recommendation = null
          if (lead.funnel_recommended_contract_id) {
            const { data: contractData } = await supabase
              .from('contracten')
              .select('id, naam, type, leverancier:leveranciers(naam, logo_url)')
              .eq('id', lead.funnel_recommended_contract_id)
              .maybeSingle()

            if (contractData) {
              const supplier = getSupplierFromRelation(contractData.leverancier)
              recommendation = {
                id: contractData.id,
                name: contractData.naam || 'Onbekend contract',
                type: contractData.type || 'vast',
                supplierName: supplier.name,
                supplierLogoUrl: supplier.logoUrl,
              }
            }
          }

          if (!recommendation) {
            recommendation = resolved.primary
          }

          if (recommendation) {
            await sendLeadFunnelProposalEmail({
              leadId: lead.id,
              email: lead.email,
              accessToken: lead.funnel_access_token,
              contract: recommendation,
              fallback: resolved.fallback,
              step: Math.max(2, lead.funnel_step || 2),
              customSubject: resolved.rule?.email_subject || null,
            })

            const nextStep = (lead.funnel_step || 1) + 1
            const nextEmailAt = nextStep >= 4 ? null : new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()

            await supabase
              .from('comparison_leads')
              .update({
                funnel_status: 'proposal_sent',
                funnel_step: nextStep,
                funnel_last_email_sent_at: new Date().toISOString(),
                funnel_next_email_at: nextEmailAt,
              })
              .eq('id', lead.id)

            sent++
          }
        }
      } catch (sendError: unknown) {
        failed++
        console.error('Lead funnel cron send failed for lead', lead.id, sendError)
      }
    }

    return NextResponse.json({
      success: true,
      processed: leads.length,
      sent,
      failed,
    })
  } catch (error: unknown) {
    console.error('Unexpected error in comparison lead funnel cron:', error)
    return NextResponse.json({ success: false, error: 'Funnel cron mislukt.' }, { status: 500 })
  }
}
