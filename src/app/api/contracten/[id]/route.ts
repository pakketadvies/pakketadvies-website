import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Contract, ContractDetailsVast, ContractDetailsDynamisch, ContractDetailsMaatwerk } from '@/types/admin'

/**
 * GET /api/contracten/[id]
 * 
 * Fetches a single contract by ID with all details
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Get contract with leverancier
    const { data: contract, error } = await supabase
      .from('contracten')
      .select(`
        *,
        leverancier:leveranciers(*)
      `)
      .eq('id', id)
      .eq('actief', true)
      .single()

    if (error || !contract) {
      return NextResponse.json({ error: 'Contract niet gevonden' }, { status: 404 })
    }

    // Get type-specific details
    let contractWithDetails: any = contract

    if (contract.type === 'vast') {
      const { data: details } = await supabase
        .from('contract_details_vast')
        .select('*')
        .eq('contract_id', id)
        .single()
      
      contractWithDetails = { ...contract, details_vast: details }
    } else if (contract.type === 'dynamisch') {
      const { data: details } = await supabase
        .from('contract_details_dynamisch')
        .select('*')
        .eq('contract_id', id)
        .single()
      
      contractWithDetails = { ...contract, details_dynamisch: details }
    } else if (contract.type === 'maatwerk') {
      const { data: details } = await supabase
        .from('contract_details_maatwerk')
        .select('*')
        .eq('contract_id', id)
        .single()
      
      contractWithDetails = { ...contract, details_maatwerk: details }
    }

    return NextResponse.json({ contract: contractWithDetails })
  } catch (error: any) {
    console.error('Error fetching contract:', error)
    return NextResponse.json(
      { error: 'Fout bij ophalen contract: ' + (error.message || 'Unknown error') },
      { status: 500 }
    )
  }
}

