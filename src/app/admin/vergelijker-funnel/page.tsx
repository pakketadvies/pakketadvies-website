import AdminLayout from '@/components/admin/AdminLayout'
import { LeadFunnelRulesManager } from '@/components/admin/LeadFunnelRulesManager'
import type { ContractOption, FunnelRule } from '@/components/admin/LeadFunnelRulesManager'
import { createClient } from '@/lib/supabase/server'

function getLeverancierNaam(leverancier: unknown): string {
  if (Array.isArray(leverancier)) {
    const first = leverancier[0] as { naam?: string } | undefined
    return first?.naam || 'Onbekende leverancier'
  }

  if (leverancier && typeof leverancier === 'object') {
    const single = leverancier as { naam?: string }
    return single.naam || 'Onbekende leverancier'
  }

  return 'Onbekende leverancier'
}

async function getRuleData() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { rules: [], contracts: [] }
  }

  const [rulesResult, contractsResult] = await Promise.all([
    supabase
      .from('comparison_lead_funnel_rules')
      .select('*')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase
      .from('contracten')
      .select('id, naam, leverancier:leveranciers(naam)')
      .order('naam', { ascending: true }),
  ])

  const rules = (rulesResult.data || []) as FunnelRule[]
  const contracts: ContractOption[] =
    contractsResult.data?.map((contract) => ({
      id: contract.id,
      naam: contract.naam || 'Onbekend contract',
      leverancierNaam: getLeverancierNaam(contract.leverancier),
    })) || []

  return { rules, contracts }
}

export default async function VergelijkerFunnelPage() {
  const { rules, contracts } = await getRuleData()

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy-500 mb-1">Vergelijker funnel</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Configureer automatisch aanbevolen contracten per lead-segment voor de e-mailfunnel.
          </p>
        </div>

        <LeadFunnelRulesManager initialRules={rules} contractOptions={contracts} />
      </div>
    </AdminLayout>
  )
}
