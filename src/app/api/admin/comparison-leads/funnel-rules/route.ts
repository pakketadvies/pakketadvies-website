import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

const ruleSchema = z.object({
  name: z.string().min(2).max(120),
  is_active: z.boolean().default(true),
  priority: z.number().int().min(1).max(9999).default(100),
  flow: z.enum(['business', 'consumer', 'unknown']).nullable().optional(),
  location_type: z.enum(['woning', 'zakelijk_pand', 'zakelijk_aan_huis', 'onbekend']).nullable().optional(),
  electricity_usage_range: z.enum(['lt_2500', '2500_5000', '5000_10000', 'gt_10000', 'unknown']).nullable().optional(),
  gas_usage_range: z.enum(['none', 'lt_1000', '1000_2000', '2000_4000', 'gt_4000', 'unknown']).nullable().optional(),
  switch_moment: z.enum(['direct', 'within_3_months', 'orienting']).nullable().optional(),
  contract_id: z.string().uuid(),
  fallback_contract_id: z.string().uuid().nullable().optional(),
  email_subject: z.string().max(180).nullable().optional(),
})

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false as const, status: 401, error: 'Unauthorized' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'admin') {
    return { ok: false as const, status: 403, error: 'Forbidden - Admin access required' }
  }

  return { ok: true as const }
}

export async function GET() {
  try {
    const adminCheck = await requireAdmin()
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const serviceSupabase = createServiceRoleClient()
    const { data, error } = await serviceSupabase
      .from('comparison_lead_funnel_rules')
      .select('*')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, rules: data || [] })
  } catch (error: unknown) {
    console.error('Unexpected error loading funnel rules:', error)
    return NextResponse.json({ error: 'Onverwachte fout bij ophalen van funnelregels.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const adminCheck = await requireAdmin()
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const json = await request.json()
    const parsed = ruleSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ongeldige funnelregel.' }, { status: 400 })
    }

    const serviceSupabase = createServiceRoleClient()
    const { data, error } = await serviceSupabase
      .from('comparison_lead_funnel_rules')
      .insert(parsed.data)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, rule: data })
  } catch (error: unknown) {
    console.error('Unexpected error creating funnel rule:', error)
    return NextResponse.json({ error: 'Onverwachte fout bij aanmaken funnelregel.' }, { status: 500 })
  }
}
