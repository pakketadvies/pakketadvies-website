import type { SupabaseClient } from '@supabase/supabase-js'
import type { ComparisonLead, ComparisonLeadExtraContext, ComparisonLeadFlow } from '@/types/comparison-leads'

export interface LeadFunnelRule {
  id: string
  name: string
  is_active: boolean
  priority: number
  flow: ComparisonLeadFlow | null
  location_type: ComparisonLeadExtraContext['locationType'] | null
  electricity_usage_range: ComparisonLeadExtraContext['electricityUsageRange'] | null
  gas_usage_range: ComparisonLeadExtraContext['gasUsageRange'] | null
  switch_moment: ComparisonLeadExtraContext['switchMoment'] | null
  contract_id: string
  fallback_contract_id: string | null
  email_subject: string | null
  created_at: string
  updated_at: string
}

export interface LeadFunnelContract {
  id: string
  name: string
  type: string
  supplierName: string
  supplierLogoUrl: string | null
}

export interface LeadFunnelRecommendation {
  rule: LeadFunnelRule | null
  primary: LeadFunnelContract | null
  fallback: LeadFunnelContract | null
}

function matchesOptionalRuleValue<T extends string | null | undefined>(ruleValue: T, leadValue: T): boolean {
  if (!ruleValue) return true
  return ruleValue === leadValue
}

function ruleMatchesLead(lead: Pick<ComparisonLead, 'flow' | 'extra_context'>, rule: LeadFunnelRule): boolean {
  const context = lead.extra_context || {}

  if (!matchesOptionalRuleValue(rule.flow, lead.flow)) return false
  if (!matchesOptionalRuleValue(rule.location_type, context.locationType)) return false
  if (!matchesOptionalRuleValue(rule.electricity_usage_range, context.electricityUsageRange)) return false
  if (!matchesOptionalRuleValue(rule.gas_usage_range, context.gasUsageRange)) return false
  if (!matchesOptionalRuleValue(rule.switch_moment, context.switchMoment)) return false

  return true
}

async function fetchContract(
  supabase: SupabaseClient,
  contractId: string | null | undefined
): Promise<LeadFunnelContract | null> {
  if (!contractId) return null

  const { data, error } = await supabase
    .from('contracten')
    .select('id, naam, type, leverancier:leveranciers(naam, logo_url)')
    .eq('id', contractId)
    .maybeSingle()

  if (error || !data) return null

  return {
    id: data.id,
    name: data.naam || 'Onbekend contract',
    type: data.type || 'vast',
    supplierName: data.leverancier?.naam || 'Onbekende leverancier',
    supplierLogoUrl: data.leverancier?.logo_url || null,
  }
}

export async function resolveLeadFunnelRecommendation(
  supabase: SupabaseClient,
  lead: Pick<ComparisonLead, 'flow' | 'extra_context'>
): Promise<LeadFunnelRecommendation> {
  const { data, error } = await supabase
    .from('comparison_lead_funnel_rules')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: true })
    .order('created_at', { ascending: true })

  if (error || !data || data.length === 0) {
    return { rule: null, primary: null, fallback: null }
  }

  const matchingRule = (data as LeadFunnelRule[]).find((rule) => ruleMatchesLead(lead, rule)) || null
  if (!matchingRule) {
    return { rule: null, primary: null, fallback: null }
  }

  const [primary, fallback] = await Promise.all([
    fetchContract(supabase, matchingRule.contract_id),
    fetchContract(supabase, matchingRule.fallback_contract_id),
  ])

  return {
    rule: matchingRule,
    primary,
    fallback,
  }
}
