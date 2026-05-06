import { createClientWithoutCookies } from '@/lib/supabase/server'

export interface AanbiedingTariefItem {
  label: string
  waarde: string
}

export interface AanbiedingTarieven {
  id: string
  slug: string
  titel: string
  tariefkaart_items: AanbiedingTariefItem[]
  hero_badges: AanbiedingTariefItem[]
  updated_at?: string
  created_at?: string
}

/**
 * Per-slug fallback met de oorspronkelijke hardcoded waarden.
 * Wordt gebruikt als de DB-rij (nog) niet bestaat — bv. wanneer
 * de migratie nog niet is uitgevoerd.
 */
const FALLBACKS: Record<string, Pick<AanbiedingTarieven, 'titel' | 'tariefkaart_items' | 'hero_badges'>> = {
  'clean-energy-ets2': {
    titel: 'Clean Energy ETS-2 (5 jaar vast gas)',
    tariefkaart_items: [
      { label: 'Unieke kans', waarde: 'ETS-2 risico vastgelegd' },
      { label: 'Elektra normaal', waarde: '€ 0,120 per kWh' },
      { label: 'Elektra dal', waarde: '€ 0,116 per kWh' },
      { label: 'Gastarief', waarde: '€ 0,494 per m3' },
      { label: 'Doelgroep', waarde: 'KvK (ook woonhuis)' },
      { label: 'Looptijd', waarde: 't/m 01-01-2031' },
    ],
    hero_badges: [
      { label: '5 jaar vast', waarde: 't/m 01-01-2031' },
      { label: 'ETS-2 risico', waarde: 'Volledig afgedekt' },
      { label: 'Alleen voor', waarde: 'KvK-klanten' },
    ],
  },
}

function normaliseerLijst(value: unknown): AanbiedingTariefItem[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => {
      if (entry && typeof entry === 'object') {
        const label = (entry as Record<string, unknown>).label
        const waarde = (entry as Record<string, unknown>).waarde
        return {
          label: typeof label === 'string' ? label : '',
          waarde: typeof waarde === 'string' ? waarde : '',
        }
      }
      return { label: '', waarde: '' }
    })
    .filter((item) => item.label.trim() !== '' || item.waarde.trim() !== '')
}

/**
 * Server-side fetch van de tarieven voor een aanbieding pagina.
 * Valt terug op een ingebakken default als de DB-rij ontbreekt of
 * de query faalt, zodat de pagina nooit kapot kan gaan.
 */
export async function getAanbiedingTarieven(slug: string): Promise<AanbiedingTarieven> {
  const fallback = FALLBACKS[slug] ?? {
    titel: slug,
    tariefkaart_items: [],
    hero_badges: [],
  }

  try {
    const supabase = createClientWithoutCookies()
    const { data, error } = await supabase
      .from('aanbieding_tarieven')
      .select('id, slug, titel, tariefkaart_items, hero_badges, updated_at, created_at')
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      console.error(`[aanbieding-tarieven] Supabase error voor slug "${slug}":`, error.message)
      return {
        id: '',
        slug,
        titel: fallback.titel,
        tariefkaart_items: fallback.tariefkaart_items,
        hero_badges: fallback.hero_badges,
      }
    }

    if (!data) {
      return {
        id: '',
        slug,
        titel: fallback.titel,
        tariefkaart_items: fallback.tariefkaart_items,
        hero_badges: fallback.hero_badges,
      }
    }

    return {
      id: data.id,
      slug: data.slug,
      titel: data.titel ?? fallback.titel,
      tariefkaart_items: normaliseerLijst(data.tariefkaart_items),
      hero_badges: normaliseerLijst(data.hero_badges),
      updated_at: data.updated_at ?? undefined,
      created_at: data.created_at ?? undefined,
    }
  } catch (err) {
    console.error(`[aanbieding-tarieven] Onverwachte fout voor slug "${slug}":`, err)
    return {
      id: '',
      slug,
      titel: fallback.titel,
      tariefkaart_items: fallback.tariefkaart_items,
      hero_badges: fallback.hero_badges,
    }
  }
}

/** Map van slug → publieke pagina-pad. Gebruikt voor revalidatie. */
export const AANBIEDING_PUBLIEKE_PADEN: Record<string, string> = {
  'clean-energy-ets2': '/aanbieding/clean-energy-ets2',
}
