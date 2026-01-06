import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Contract, ContractDetailsVast, ContractDetailsDynamisch, ContractDetailsMaatwerk } from '@/types/admin'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get all active contracts with leverancier info
    // Filter on BOTH contract.actief AND leverancier.actief
    const { data: contracten, error } = await supabase
      .from('contracten')
      .select(`
        *,
        leverancier:leveranciers(*)
      `)
      .eq('actief', true)
      .order('volgorde', { ascending: true })
      .order('naam', { ascending: true })

    if (error) {
      console.error('Error fetching contracten:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!contracten) {
      return NextResponse.json({ contracten: [] })
    }

    // Filter out contracts where leverancier is inactive
    const activeContracten = contracten.filter((contract: any) => {
      return contract.leverancier && contract.leverancier.actief === true
    })

    // Fetch details for each contract based on type
    const contractenWithDetails = await Promise.all(
      activeContracten.map(async (contract: any) => {
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

    return NextResponse.json({ contracten: contractenWithDetails })
  } catch (error: any) {
    console.error('Error in API route:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het ophalen van contracten' },
      { status: 500 }
    )
  }
}

