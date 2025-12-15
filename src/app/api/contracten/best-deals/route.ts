import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    // Calculate average monthly price using typical MKB usage
    // Using typical MKB usage: 6000 kWh/year (4000 normaal + 2000 dal), 1000 m³/year
    const defaultElektriciteitNormaal = 4000 // kWh/year
    const defaultElektriciteitDal = 2000 // kWh/year
    const defaultGas = 1000 // m³/year
    const defaultAansluitwaardeElektriciteit = '3x25A'
    const defaultAansluitwaardeGas = 'G6'
    const btwPercentage = 1.21 // 21% BTW

    // Calculate prices for each contract
    const contractenMetPrijzen = validContracten.map((contract: any) => {
      const details = contract.details_vast || contract.details_dynamisch || contract.details_maatwerk || {}
      
      // Get tarieven based on contract type
      let tariefElektriciteitNormaal = 0
      let tariefElektriciteitDal = 0
      let tariefGas = 0
      const vastrechtStroom = details.vastrecht_stroom_maand || 4.00
      const vastrechtGas = details.vastrecht_gas_maand || 4.00

      if (contract.type === 'vast') {
        tariefElektriciteitNormaal = details.tarief_elektriciteit_normaal || 0
        tariefElektriciteitDal = details.tarief_elektriciteit_dal || 0
        tariefGas = details.tarief_gas || 0
      } else if (contract.type === 'dynamisch') {
        // For dynamic, we use opslag - this is added to market price
        // We'll estimate with a base market price of ~0.28 cent/kWh and ~1.40 cent/m³
        const baseElektriciteit = 0.28 // Approximate base market price
        const baseGas = 1.40 // Approximate base market price
        tariefElektriciteitNormaal = baseElektriciteit + (details.opslag_elektriciteit_normaal || 0)
        tariefElektriciteitDal = baseElektriciteit + (details.opslag_elektriciteit_dal || 0)
        tariefGas = baseGas + (details.opslag_gas || 0)
      } else if (contract.type === 'maatwerk') {
        tariefElektriciteitNormaal = details.tarief_elektriciteit_normaal || 0
        tariefElektriciteitDal = details.tarief_elektriciteit_dal || 0
        tariefGas = details.tarief_gas || 0
      }

      // Calculate yearly costs (including BTW)
      const kostenElektriciteitNormaal = (defaultElektriciteitNormaal * tariefElektriciteitNormaal) / 100
      const kostenElektriciteitDal = (defaultElektriciteitDal * tariefElektriciteitDal) / 100
      const kostenGas = (defaultGas * tariefGas) / 100
      const vastrechtenJaar = (vastrechtStroom + vastrechtGas) * 12
      
      const jaarkostenExclBtw = kostenElektriciteitNormaal + kostenElektriciteitDal + kostenGas + vastrechtenJaar
      const jaarkostenInclBtw = jaarkostenExclBtw * btwPercentage
      const maandbedrag = Math.round(jaarkostenInclBtw / 12)

      return {
        ...contract,
        estimatedMaandbedrag: maandbedrag,
        rating: details.rating || 0,
      }
    })

    // Calculate average price
    const totalPrice = contractenMetPrijzen.reduce((sum: number, c: any) => sum + c.estimatedMaandbedrag, 0)
    const averagePrice = validContracten.length > 0 ? Math.round(totalPrice / validContracten.length) : 0

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

