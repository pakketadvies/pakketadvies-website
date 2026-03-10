import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { checkRateLimit, getClientIP } from '@/lib/security/rate-limiter'
import { validateEmail } from '@/lib/security/email-validation'
import type { LeadAdviceEmailPayload } from '@/types/comparison-leads'

const leadAdviceEmailSchema = z.object({
  contractId: z.string().uuid().optional().nullable(),
  contractName: z.string().min(2).max(160),
  supplierName: z.string().min(2).max(160),
  supplierLogoUrl: z.string().max(1000).optional().nullable(),
  contractType: z.string().min(2).max(80),
  monthlyPrice: z.number().nonnegative().max(100000).optional().nullable(),
  yearlyPrice: z.number().nonnegative().max(1000000).optional().nullable(),
  whyTitle: z.string().max(200).optional().nullable(),
  whyIntro: z.string().max(1000).optional().nullable(),
  whyPoints: z.array(z.string().max(240)).max(5).optional().nullable(),
  whyDisclaimer: z.string().max(1000).optional().nullable(),
  pagePath: z.string().max(500).optional().nullable(),
})

const captureLeadSchema = z.object({
  email: z.string().min(5).max(320),
  phone: z.string().max(40).optional().nullable(),
  source: z.enum(['timed_popup', 'results_inline', 'why_modal', 'exit_intent', 'manual']).default('manual'),
  flow: z.enum(['business', 'consumer', 'unknown']).default('unknown'),
  pagePath: z.string().max(500).optional().nullable(),
  referrer: z.string().max(1000).optional().nullable(),
  utmSource: z.string().max(100).optional().nullable(),
  utmMedium: z.string().max(100).optional().nullable(),
  utmCampaign: z.string().max(150).optional().nullable(),
  utmContent: z.string().max(150).optional().nullable(),
  utmTerm: z.string().max(150).optional().nullable(),
  fbclid: z.string().max(200).optional().nullable(),
  gclid: z.string().max(200).optional().nullable(),
  sessionId: z.string().max(120).optional().nullable(),
  consentText: z.string().max(500).optional().nullable(),
  adviceEmail: leadAdviceEmailSchema.optional().nullable(),
})

const cleanOptionalText = (value?: string | null) => {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeAdviceEmailPayload(
  advice?: z.infer<typeof leadAdviceEmailSchema> | null
): LeadAdviceEmailPayload | null {
  if (!advice) return null

  return {
    contractId: advice.contractId ?? null,
    contractName: advice.contractName.trim(),
    supplierName: advice.supplierName.trim(),
    supplierLogoUrl: cleanOptionalText(advice.supplierLogoUrl),
    contractType: advice.contractType.trim(),
    monthlyPrice: advice.monthlyPrice ?? null,
    yearlyPrice: advice.yearlyPrice ?? null,
    whyTitle: cleanOptionalText(advice.whyTitle),
    whyIntro: cleanOptionalText(advice.whyIntro),
    whyPoints:
      advice.whyPoints
        ?.map((point) => point.trim())
        .filter((point) => point.length > 0)
        .slice(0, 5) || [],
    whyDisclaimer: cleanOptionalText(advice.whyDisclaimer),
    pagePath: cleanOptionalText(advice.pagePath),
  }
}

function scoreInitialLead(phone: string | null) {
  if (phone) {
    return {
      profileCompletion: 20,
      followupPriority: 'medium' as const,
    }
  }
  return {
    profileCompletion: 0,
    followupPriority: 'low' as const,
  }
}

async function sendLeadEmails(input: {
  leadId: string
  email: string
  accessToken: string | null
  source: 'timed_popup' | 'results_inline' | 'why_modal' | 'exit_intent' | 'manual'
  adviceEmail?: LeadAdviceEmailPayload | null
  sendWelcome?: boolean
}) {
  const { sendLeadWelkomEmail, sendLeadWaaromAdviesEmail, sendLeadFunnelCompleteProfileEmail } = await import(
    '@/lib/send-email-internal'
  )

  if (input.source === 'why_modal' && input.adviceEmail) {
    await sendLeadWaaromAdviesEmail({
      leadId: input.leadId,
      email: input.email,
      advice: input.adviceEmail,
    })
    return
  }

  if (input.accessToken) {
    await sendLeadFunnelCompleteProfileEmail({
      leadId: input.leadId,
      email: input.email,
      accessToken: input.accessToken,
      step: 0,
    })
    return
  }

  if (input.sendWelcome !== false) {
    await sendLeadWelkomEmail({
      leadId: input.leadId,
      email: input.email,
    })
  }
}

export async function POST(request: Request) {
  try {
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(clientIP, 8, 60 * 60 * 1000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: rateLimit.error || 'Te veel verzoeken. Probeer later opnieuw.' },
        { status: 429 }
      )
    }

    const json = await request.json()
    const parsed = captureLeadSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Ongeldige invoer voor lead capture.' },
        { status: 400 }
      )
    }

    const payload = parsed.data
    const adviceEmailPayload = normalizeAdviceEmailPayload(payload.adviceEmail)
    const normalizedEmail = payload.email.trim().toLowerCase()
    const emailValidation = validateEmail(normalizedEmail)
    if (!emailValidation.valid) {
      return NextResponse.json(
        { success: false, error: emailValidation.error || 'Ongeldig e-mailadres.' },
        { status: 400 }
      )
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
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

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: existingLead } = await supabase
      .from('comparison_leads')
      .select('id, funnel_access_token')
      .eq('email', normalizedEmail)
      .eq('source', payload.source)
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingLead?.id) {
      if (payload.source === 'why_modal' && adviceEmailPayload) {
        try {
          await sendLeadEmails({
            leadId: existingLead.id,
            email: normalizedEmail,
            accessToken: existingLead.funnel_access_token || null,
            source: payload.source,
            adviceEmail: adviceEmailPayload,
            sendWelcome: false,
          })
        } catch (mailError: unknown) {
          console.error('Lead e-mail verzending mislukt (deduplicated lead):', mailError)
          return NextResponse.json(
            { success: false, error: 'Opslaan gelukt, maar verzenden van adviesmail is mislukt. Probeer opnieuw.' },
            { status: 502 }
          )
        }
      }

      return NextResponse.json({
        success: true,
        id: existingLead.id,
        deduplicated: true,
      })
    }

    const normalizedPhone = cleanOptionalText(payload.phone)
    const initialScore = scoreInitialLead(normalizedPhone)
    const funnelAccessToken = crypto.randomUUID()
    const funnelNextEmailAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('comparison_leads')
      .insert({
        email: normalizedEmail,
        phone: normalizedPhone,
        flow: payload.flow,
        source: payload.source,
        page_path: cleanOptionalText(payload.pagePath),
        referrer: cleanOptionalText(payload.referrer),
        utm_source: cleanOptionalText(payload.utmSource),
        utm_medium: cleanOptionalText(payload.utmMedium),
        utm_campaign: cleanOptionalText(payload.utmCampaign),
        utm_content: cleanOptionalText(payload.utmContent),
        utm_term: cleanOptionalText(payload.utmTerm),
        fbclid: cleanOptionalText(payload.fbclid),
        gclid: cleanOptionalText(payload.gclid),
        session_id: cleanOptionalText(payload.sessionId),
        consent_contact: true,
        consent_text: cleanOptionalText(payload.consentText),
        profile_completion: initialScore.profileCompletion,
        followup_priority: initialScore.followupPriority,
        funnel_access_token: funnelAccessToken,
        funnel_status: 'pending_profile',
        funnel_step: 0,
        funnel_next_email_at: funnelNextEmailAt,
      })
      .select('id')
      .single()

    if (error || !data?.id) {
      console.error('Error creating comparison lead:', error)
      return NextResponse.json(
        { success: false, error: 'Opslaan van lead is mislukt.' },
        { status: 500 }
      )
    }

    try {
      await sendLeadEmails({
        leadId: data.id,
        email: normalizedEmail,
        accessToken: funnelAccessToken,
        source: payload.source,
        adviceEmail: adviceEmailPayload,
      })
    } catch (mailError: unknown) {
      console.error('Lead e-mail verzending mislukt:', mailError)
      return NextResponse.json(
        { success: false, error: 'Lead opgeslagen, maar e-mail verzenden is mislukt. Probeer opnieuw.' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      deduplicated: false,
    })
  } catch (error: unknown) {
    console.error('Unexpected error in lead capture:', error)
    return NextResponse.json(
      { success: false, error: 'Onverwachte fout bij lead capture.' },
      { status: 500 }
    )
  }
}
