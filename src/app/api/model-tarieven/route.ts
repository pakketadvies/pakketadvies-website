import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getModelTarieven, berekenEnecoModelContractKosten } from '@/lib/energie-berekening'

/**
 * GET /api/model-tarieven
 * 
 * Returns active Eneco modeltarieven from Supabase
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const modelTarieven = await getModelTarieven(supabase)
    
    if (!modelTarieven) {
      return NextResponse.json(
        { success: false, error: 'Geen modeltarieven gevonden' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      tarieven: modelTarieven,
    })
  } catch (error: any) {
    console.error('Error fetching model tarieven:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Fout bij ophalen modeltarieven' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/model-tarieven/bereken
 * 
 * Calculates Eneco modelcontract costs for given consumption
 * Body: { verbruikElektriciteitNormaal, verbruikElektriciteitDal, verbruikGas, heeftEnkeleMeter, aansluitwaardeElektriciteit, aansluitwaardeGas }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      verbruikElektriciteitNormaal,
      verbruikElektriciteitDal,
      verbruikGas,
      heeftEnkeleMeter,
      aansluitwaardeElektriciteit = '3x25A', // Default waarde
      aansluitwaardeGas = 'G6',               // Default waarde
    } = body
    
    if (
      typeof verbruikElektriciteitNormaal !== 'number' ||
      typeof verbruikElektriciteitDal !== 'number' ||
      typeof verbruikGas !== 'number' ||
      typeof heeftEnkeleMeter !== 'boolean'
    ) {
      return NextResponse.json(
        { success: false, error: 'Ongeldige parameters' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    const result = await berekenEnecoModelContractKosten(
      verbruikElektriciteitNormaal,
      verbruikElektriciteitDal,
      verbruikGas,
      heeftEnkeleMeter,
      supabase,
      aansluitwaardeElektriciteit,
      aansluitwaardeGas
    )
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Kon Eneco modelcontract kosten niet berekenen' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error: any) {
    console.error('Error calculating Eneco modelcontract costs:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Fout bij berekenen Eneco modelcontract kosten' },
      { status: 500 }
    )
  }
}

