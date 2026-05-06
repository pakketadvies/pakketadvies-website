import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import {
  AANBIEDING_PUBLIEKE_PADEN,
  type AanbiedingTariefItem,
} from '@/lib/aanbieding-tarieven'

interface IncomingItem {
  label?: unknown
  waarde?: unknown
}

function sanitizeItems(input: unknown): AanbiedingTariefItem[] {
  if (!Array.isArray(input)) return []
  return input
    .map((entry: IncomingItem) => ({
      label: typeof entry?.label === 'string' ? entry.label.trim() : '',
      waarde: typeof entry?.waarde === 'string' ? entry.waarde.trim() : '',
    }))
    .filter((item) => item.label !== '' || item.waarde !== '')
}

/**
 * GET /api/aanbieding-tarieven/[slug]
 *
 * Publieke read-endpoint voor de tarieven van een aanbieding pagina.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('aanbieding_tarieven')
      .select('id, slug, titel, tariefkaart_items, hero_badges, updated_at, created_at')
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      console.error('[aanbieding-tarieven][GET] Supabase error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Aanbieding niet gevonden' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, tarieven: data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    console.error('[aanbieding-tarieven][GET] Onverwachte fout:', err)
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/aanbieding-tarieven/[slug]
 *
 * Update de tarieven voor een aanbieding pagina.
 * Alleen toegankelijk voor ingelogde admin-gebruikers.
 * Triggert na succesvolle save automatisch een
 * cache revalidate op het publieke pad.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Niet geautoriseerd' },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Geen admin rechten' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const titel: string =
      typeof body?.titel === 'string' && body.titel.trim() !== ''
        ? body.titel.trim()
        : slug
    const tariefkaartItems = sanitizeItems(body?.tariefkaart_items)
    const heroBadges = sanitizeItems(body?.hero_badges).slice(0, 3)

    if (tariefkaartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Voeg minimaal één tarief toe.' },
        { status: 400 }
      )
    }

    const serviceClient = createServiceRoleClient()

    const { data: existing, error: fetchError } = await serviceClient
      .from('aanbieding_tarieven')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (fetchError) {
      console.error('[aanbieding-tarieven][PUT] Fetch error:', fetchError)
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      )
    }

    let saved
    if (existing) {
      const { data, error: updateError } = await serviceClient
        .from('aanbieding_tarieven')
        .update({
          titel,
          tariefkaart_items: tariefkaartItems,
          hero_badges: heroBadges,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (updateError) {
        console.error('[aanbieding-tarieven][PUT] Update error:', updateError)
        return NextResponse.json(
          { success: false, error: updateError.message },
          { status: 500 }
        )
      }
      saved = data
    } else {
      const { data, error: insertError } = await serviceClient
        .from('aanbieding_tarieven')
        .insert({
          slug,
          titel,
          tariefkaart_items: tariefkaartItems,
          hero_badges: heroBadges,
        })
        .select()
        .single()

      if (insertError) {
        console.error('[aanbieding-tarieven][PUT] Insert error:', insertError)
        return NextResponse.json(
          { success: false, error: insertError.message },
          { status: 500 }
        )
      }
      saved = data
    }

    const publiekPad = AANBIEDING_PUBLIEKE_PADEN[slug]
    if (publiekPad) {
      try {
        revalidatePath(publiekPad, 'page')
      } catch (revalErr) {
        console.warn('[aanbieding-tarieven][PUT] revalidatePath warning:', revalErr)
      }
    }

    return NextResponse.json({ success: true, tarieven: saved })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    console.error('[aanbieding-tarieven][PUT] Onverwachte fout:', err)
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
