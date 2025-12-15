import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { calculateContractCosts } from '@/lib/bereken-contract-internal'
import { berekenEnecoModelContractKosten } from '@/lib/energie-berekening'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')
    const type = searchParams.get('type') || 'alle' // 'alle', 'vast', 'dynamisch'
    
    const supabase = await createClient()
    
    // Get all active contracts with leverancier info
    let query = supabase
      .from('contracten')
      .select(`
        *,
        leverancier:leveranciers(*)
      `)
      .eq('actief', true)
    
    // Filter by type if specified
    if (type !== 'alle') {
      query = query.eq('type', type)
    }
    
    const { data: contracten, error } = await query
      .order('aanbevolen', { ascending: false }) // Aanbevolen first
      .order('populair', { ascending: false }) // Then populair
      .order('volgorde', { ascending: true })
      .limit(limit * 2) // Get more to sort by rating/price later

    if (error) {
      console.error('Error fetching contracten:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!contracten || contracten.length === 0) {
      return NextResponse.json({ contracten: [], averagePrice: 0 })
    }

    // Fetch details for each contract based on type
    const contractenWithDetails = await Promise.all(
      contracten.map(async (contract: any) => {
        if (contract.type === 'vast') {
          const { data: details } = await supabase
            .from('contract_details_vast')
            .select('*')
            .eq('contract_id', contract.id)
            .single()
          
          return { ...contract, details_vast: details }
        } else if (contract.type === 'dynamisch') {
          const { data: details } = await supabase
            .from('contract_details_dynamisch')
            .select('*')
            .eq('contract_id', contract.id)
            .single()
          
          return { ...contract, details_dynamisch: details }
        } else if (contract.type === 'maatwerk') {
          const { data: details } = await supabase
            .from('contract_details_maatwerk')
            .select('*')
            .eq('contract_id', contract.id)
            .single()
          
          return { ...contract, details_maatwerk: details }
        }
        
        return contract
      })
    )

    // Filter out contracts without details
    const validContracten = contractenWithDetails.filter((c: any) => {
      if (c.type === 'vast') return !!c.details_vast
      if (c.type === 'dynamisch') return !!c.details_dynamisch
      if (c.type === 'maatwerk') return !!c.details_maatwerk
      return false
    })

    // Calculate prices using the actual contract calculation for accurate results
    // Using typical MKB usage: 6000 kWh/year (4000 normaal + 2000 dal), 1200 m³/year
    const defaultElektriciteitNormaal = 4000 // kWh/year
    const defaultElektriciteitDal = 2000 // kWh/year
    const defaultGas = 1200 // m³/year
    const defaultPostcode = '1000AA' // Amsterdam as default
    const heeftEnkeleMeter = false // Default: dubbele meter

    // Calculate Eneco model contract costs for comparison (baseline for savings)
    const enecoModelKosten = await berekenEnecoModelContractKosten(
      defaultElektriciteitNormaal,
      defaultElektriciteitDal,
      defaultGas,
      heeftEnkeleMeter,
      supabase,
      '3x25A',
      'G6'
    )
    const enecoModelMaandbedrag = enecoModelKosten?.maandbedrag || 0

    // Calculate prices for each contract using the actual calculation function
    const contractenMetPrijzen = await Promise.all(
      validContracten.map(async (contract: any) => {
        const details = contract.details_vast || contract.details_dynamisch || contract.details_maatwerk || {}
        
        try {
          // Use the actual contract calculation function for accurate pricing
          const berekenInput = {
            elektriciteitNormaal: defaultElektriciteitNormaal,
            elektriciteitDal: defaultElektriciteitDal,
            gas: defaultGas,
            terugleveringJaar: 0,
            aansluitwaardeElektriciteit: '3x25A',
            aansluitwaardeGas: 'G6',
            postcode: defaultPostcode,
            contractType: contract.type === 'maatwerk' ? 'maatwerk' : contract.type as 'vast' | 'dynamisch' | 'maatwerk',
            tariefElektriciteitNormaal: contract.type === 'vast' || contract.type === 'maatwerk' ? (details.tarief_elektriciteit_normaal || 0) : 0,
            tariefElektriciteitDal: contract.type === 'vast' || contract.type === 'maatwerk' ? (details.tarief_elektriciteit_dal || undefined) : undefined,
            tariefElektriciteitEnkel: contract.type === 'vast' || contract.type === 'maatwerk' ? (details.tarief_elektriciteit_enkel || undefined) : undefined,
            tariefGas: contract.type === 'vast' || contract.type === 'maatwerk' ? (details.tarief_gas || 0) : 0,
            tariefTerugleveringKwh: contract.type === 'vast' || contract.type === 'maatwerk' ? (details.tarief_teruglevering_kwh || 0) : 0,
            opslagElektriciteit: contract.type === 'dynamisch' ? (details.opslag_elektriciteit_normaal || details.opslag_elektriciteit || 0) : undefined,
            opslagGas: contract.type === 'dynamisch' ? (details.opslag_gas || 0) : undefined,
            opslagTeruglevering: contract.type === 'dynamisch' ? (details.opslag_teruglevering || 0) : undefined,
            vastrechtStroomMaand: details.vastrecht_stroom_maand || 4.00,
            vastrechtGasMaand: details.vastrecht_gas_maand || 4.00,
            heeftDubbeleMeter: true,
          }

          const berekenResult = await calculateContractCosts(berekenInput, supabase)

          if (berekenResult.success && berekenResult.breakdown) {
            const maandbedrag = Math.round(berekenResult.breakdown.totaal.maandInclBtw || 0)
            
            // Calculate savings compared to Eneco model contract
            const besparing = enecoModelMaandbedrag > 0 && maandbedrag < enecoModelMaandbedrag
              ? Math.round(enecoModelMaandbedrag - maandbedrag)
              : 0
            
            return {
              ...contract,
              estimatedMaandbedrag: maandbedrag > 0 ? maandbedrag : 150,
              estimatedBesparing: besparing,
              rating: details.rating || 0,
            }
          }
        } catch (error) {
          console.error(`Error calculating price for contract ${contract.id}:`, error)
        }

        // Fallback: simplified estimate if calculation fails
        return {
          ...contract,
          estimatedMaandbedrag: 150, // Fallback to reasonable default
          estimatedBesparing: 0,
          rating: details.rating || 0,
        }
      })
    )

    // Calculate average price (use Eneco model as average if available)
    const averagePrice = enecoModelMaandbedrag > 0 
      ? enecoModelMaandbedrag 
      : (validContracten.length > 0 
          ? Math.round(contractenMetPrijzen.reduce((sum: number, c: any) => sum + c.estimatedMaandbedrag, 0) / validContracten.length)
          : 0)

    // Sort by: aanbevolen > rating > price
    contractenMetPrijzen.sort((a: any, b: any) => {
      // First: aanbevolen
      if (a.aanbevolen && !b.aanbevolen) return -1
      if (!a.aanbevolen && b.aanbevolen) return 1
      
      // Second: rating
      if (a.rating !== b.rating) return b.rating - a.rating
      
      // Third: price (lower is better)
      return a.estimatedMaandbedrag - b.estimatedMaandbedrag
    })

    // Take top N contracts
    const topContracten = contractenMetPrijzen.slice(0, limit)

    return NextResponse.json({ 
      contracten: topContracten,
      averagePrice 
    })
  } catch (error: any) {
    console.error('Error in best-deals API route:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het ophalen van de beste deals' },
      { status: 500 }
    )
  }
}

