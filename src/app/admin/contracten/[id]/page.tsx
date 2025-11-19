import AdminLayout from '@/components/admin/AdminLayout'
import VastContractForm from '@/components/admin/VastContractForm'
import DynamischContractForm from '@/components/admin/DynamischContractForm'
import MaatwerkContractForm from '@/components/admin/MaatwerkContractForm'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Contract, ContractDetailsVast, ContractDetailsDynamisch, ContractDetailsMaatwerk } from '@/types/admin'

async function getContract(id: string) {
  const supabase = await createClient()
  
  // Get contract with leverancier
  const { data: contract, error } = await supabase
    .from('contracten')
    .select(`
      *,
      leverancier:leveranciers(*)
    `)
    .eq('id', id)
    .single()

  if (error || !contract) {
    return null
  }

  // Get type-specific details
  if (contract.type === 'vast') {
    const { data: details } = await supabase
      .from('contract_details_vast')
      .select('*')
      .eq('contract_id', id)
      .single()
    
    return { ...contract, details_vast: details } as Contract & { details_vast: ContractDetailsVast }
  } else if (contract.type === 'dynamisch') {
    const { data: details } = await supabase
      .from('contract_details_dynamisch')
      .select('*')
      .eq('contract_id', id)
      .single()
    
    return { ...contract, details_dynamisch: details } as Contract & { details_dynamisch: ContractDetailsDynamisch }
  } else if (contract.type === 'maatwerk') {
    const { data: details } = await supabase
      .from('contract_details_maatwerk')
      .select('*')
      .eq('contract_id', id)
      .single()
    
    return { ...contract, details_maatwerk: details } as Contract & { details_maatwerk: ContractDetailsMaatwerk }
  }

  return contract as Contract
}

export default async function EditContractPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const contract = await getContract(id)

  if (!contract) {
    notFound()
  }

  return (
    <AdminLayout>
      {contract.type === 'vast' && (
        <VastContractForm contract={contract as Contract & { details_vast?: ContractDetailsVast }} />
      )}
      {contract.type === 'dynamisch' && (
        <DynamischContractForm contract={contract as Contract & { details_dynamisch?: ContractDetailsDynamisch }} />
      )}
      {contract.type === 'maatwerk' && (
        <MaatwerkContractForm contract={contract as Contract & { details_maatwerk?: ContractDetailsMaatwerk }} />
      )}
    </AdminLayout>
  )
}

