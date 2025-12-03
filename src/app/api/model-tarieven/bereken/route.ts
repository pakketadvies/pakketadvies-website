import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { berekenEnecoModelContractKosten } from '@/lib/energie-berekening'

// Disable caching to ensure we always get the latest model tariffs
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * POST /api/model-tarieven/bereken
 * 
 * Calculates Eneco modelcontract costs for given consumption
 * Body: { verbruikElektriciteitNormaal, verbruikElektriciteitDal, verbruikGas, heeftEnkeleMeter, aansluitwaardeElektriciteit, aansluitwaardeGas }
 */
export async function POST(request: Request) {
  console.log('🔵 [MODEL-TARIEVEN-BEREKEN] Request ontvangen')
  
  try {
    const body = await request.json()
    console.log('📥 [MODEL-TARIEVEN-BEREKEN] Body:', JSON.stringify(body, null, 2))
    
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
      console.error('❌ [MODEL-TARIEVEN-BEREKEN] Ongeldige parameters')
      return NextResponse.json(
        { success: false, error: 'Ongeldige parameters' },
        { status: 400 }
      )
    }
    
    console.log('🔍 [MODEL-TARIEVEN-BEREKEN] Ophalen modeltarieven uit Supabase...')
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
      console.error('❌ [MODEL-TARIEVEN-BEREKEN] Geen resultaat van berekening')
      return NextResponse.json(
        { success: false, error: 'Kon Eneco modelcontract kosten niet berekenen' },
        { status: 500 }
      )
    }
    
    console.log('✅ [MODEL-TARIEVEN-BEREKEN] Resultaat:', JSON.stringify(result, null, 2))
    
    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error: any) {
    console.error('❌ [MODEL-TARIEVEN-BEREKEN] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Fout bij berekenen Eneco modelcontract kosten' },
      { status: 500 }
    )
  }
}

