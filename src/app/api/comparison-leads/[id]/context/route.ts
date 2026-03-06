import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
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

    const { data, error } = await supabase
      .from('comparison_leads')
      .update({
        extra_context: parsed.data.extraContext,
        profile_completion: completion,
        followup_priority: priority,
      })
      .eq('id', id)
      .select('id, profile_completion, followup_priority')
      .single()

    if (error || !data?.id) {
      console.error('Error updating comparison lead context:', error)
      return NextResponse.json(
        { success: false, error: 'Bijwerken van leadinformatie is mislukt.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      profileCompletion: data.profile_completion,
      followupPriority: data.followup_priority,
    })
  } catch (error: unknown) {
    console.error('Unexpected error updating lead context:', error)
    return NextResponse.json(
      { success: false, error: 'Onverwachte fout bij aanvullen van lead.' },
      { status: 500 }
    )
  }
}
