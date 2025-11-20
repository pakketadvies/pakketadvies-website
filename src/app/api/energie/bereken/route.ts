import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { berekenEnergieKosten, EnergieKostenInput } from '@/lib/energie-berekening'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const input: EnergieKostenInput = {
      elektriciteitNormaal: body.elektriciteitNormaal || 0,
      elektriciteitDal: body.elektriciteitDal || 0,
      gas: body.gas || 0,
      teruglevering: body.teruglevering || 0,
      tariefElektriciteitNormaal: body.tariefElektriciteitNormaal,
      tariefElektriciteitDal: body.tariefElektriciteitDal,
      tariefGas: body.tariefGas,
      vastrecht: body.vastrecht,
      aansluitwaardeElektriciteit: body.aansluitwaardeElektriciteit || '3x25A',
      aansluitwaardeGas: body.aansluitwaardeGas || 'G4',
      netbeheerderId: body.netbeheerderId,
      jaar: body.jaar || 2025,
    }

    // Validatie
    if (!input.netbeheerderId) {
      return NextResponse.json(
        { error: 'netbeheerderId is verplicht' },
        { status: 400 }
      )
    }

    if (!input.tariefElektriciteitNormaal || !input.tariefGas || input.vastrecht === undefined) {
      return NextResponse.json(
        { error: 'Contract tarieven zijn verplicht' },
        { status: 400 }
      )
    }

    // Bereken kosten
    const breakdown = await berekenEnergieKosten(input, supabase)

    return NextResponse.json({
      success: true,
      breakdown,
    })
  } catch (error: any) {
    console.error('Fout bij berekenen energiekosten:', error)
    return NextResponse.json(
      { error: error.message || 'Er is een fout opgetreden bij het berekenen' },
      { status: 500 }
    )
  }
}

