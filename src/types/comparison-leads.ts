export type ComparisonLeadFlow = 'business' | 'consumer' | 'unknown'

export type ComparisonLeadSource =
  | 'timed_popup'
  | 'results_inline'
  | 'why_modal'
  | 'exit_intent'
  | 'manual'

export type ComparisonLeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'discarded'

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
  status: ComparisonLeadStatus
  converted_aanvraag_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
