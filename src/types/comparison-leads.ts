export type ComparisonLeadFlow = 'business' | 'consumer' | 'unknown'

export type ComparisonLeadSource =
  | 'timed_popup'
  | 'results_inline'
  | 'why_modal'
  | 'exit_intent'
  | 'manual'

export type ComparisonLeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'discarded'
export type ComparisonLeadPriority = 'low' | 'medium' | 'high'

export interface ComparisonLeadExtraContext {
  locationType?: 'woning' | 'zakelijk_pand' | 'zakelijk_aan_huis' | 'onbekend'
  electricityUsageRange?: 'lt_2500' | '2500_5000' | '5000_10000' | 'gt_10000' | 'unknown'
  gasUsageRange?: 'none' | 'lt_1000' | '1000_2000' | '2000_4000' | 'gt_4000' | 'unknown'
  switchMoment?: 'direct' | 'within_3_months' | 'orienting'
  note?: string
}

export interface LeadAdviceEmailPayload {
  contractId?: string | null
  contractName: string
  supplierName: string
  supplierLogoUrl?: string | null
  contractType: string
  monthlyPrice?: number | null
  yearlyPrice?: number | null
  whyTitle?: string | null
  whyIntro?: string | null
  whyPoints?: string[]
  whyDisclaimer?: string | null
  pagePath?: string | null
}

export interface ComparisonLead {
  id: string
  email: string
  phone: string | null
  flow: ComparisonLeadFlow
  source: ComparisonLeadSource
  page_path: string | null
  referrer: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  fbclid: string | null
  gclid: string | null
  session_id: string | null
  consent_contact: boolean
  consent_text: string | null
  extra_context: ComparisonLeadExtraContext | null
  profile_completion: number
  followup_priority: ComparisonLeadPriority
  funnel_access_token?: string | null
  funnel_status?: 'pending_profile' | 'profile_completed' | 'proposal_sent' | 'converted' | 'unsubscribed'
  funnel_step?: number
  funnel_last_email_sent_at?: string | null
  funnel_next_email_at?: string | null
  funnel_profile_completed_at?: string | null
  funnel_recommended_contract_id?: string | null
  funnel_fallback_contract_id?: string | null
  funnel_metadata?: Record<string, unknown> | null
  status: ComparisonLeadStatus
  converted_aanvraag_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
