import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { checkRateLimit, getClientIP } from '@/lib/security/rate-limiter'
import { validateEmail } from '@/lib/security/email-validation'

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
})

const cleanOptionalText = (value?: string | null) => {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
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
      .select('id')
      .eq('email', normalizedEmail)
      .eq('source', payload.source)
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingLead?.id) {
      return NextResponse.json({
        success: true,
        id: existingLead.id,
        deduplicated: true,
      })
    }

    const normalizedPhone = cleanOptionalText(payload.phone)
    const initialScore = scoreInitialLead(normalizedPhone)

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

    // Fire-and-forget welkomstmail in bestaande PakketAdvies stijl
    ;(async () => {
      try {
        const { sendLeadWelkomEmail } = await import('@/lib/send-email-internal')
        await sendLeadWelkomEmail({
          leadId: data.id,
          email: normalizedEmail,
        })
      } catch (mailError: unknown) {
        console.error('Lead welkomstmail mislukt (non-blocking):', mailError)
      }
    })()

    return NextResponse.json({
      success: true,
      id: data.id,
      deduplicated: false,
    })
  } catch (error: any) {
    console.error('Unexpected error in lead capture:', error)
    return NextResponse.json(
      { success: false, error: 'Onverwachte fout bij lead capture.' },
      { status: 500 }
    )
  }
}
