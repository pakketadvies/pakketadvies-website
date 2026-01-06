// Types for contractaanvragen (contract applications)

export type AanvraagStatus = 'nieuw' | 'in_behandeling' | 'afgehandeld' | 'geannuleerd'
export type AanvraagType = 'particulier' | 'zakelijk'

export interface ContractAanvraag {
  id: string
  aanvraagnummer: string
  contract_id: string
  contract_type: 'vast' | 'dynamisch' | 'maatwerk'
  contract_naam: string
  leverancier_id: string
  leverancier_naam: string
  aanvraag_type: AanvraagType
  status: AanvraagStatus
  verbruik_data: any // JSONB - VerbruikData from calculator
  gegevens_data: any // JSONB - Form data (particulier or zakelijk)
  iban?: string
  rekening_op_andere_naam: boolean
  rekeninghouder_naam?: string
  heeft_verblijfsfunctie?: boolean
  gaat_verhuizen: boolean
  wanneer_overstappen?: string
  contract_einddatum?: string
  ingangsdatum?: string
  is_klant_bij_leverancier: boolean
  herinnering_contract: boolean
  nieuwsbrief: boolean
  heeft_andere_correspondentie_adres: boolean
  correspondentie_adres?: any
  admin_notities?: string
  // GridHub integration fields
  external_api_provider?: 'GRIDHUB' | 'MANUAL' | null
  external_order_id?: string
  external_order_request_id?: string
  external_status?: string
  external_sub_status_id?: string
  external_status_reason?: string
  external_response?: any
  external_errors?: any
  external_last_sync?: string
  created_at: string
  updated_at: string
  afgehandeld_op?: string
  afgehandeld_door?: string
}

export interface CreateAanvraagRequest {
  contract_id: string
  contract_type: 'vast' | 'dynamisch' | 'maatwerk'
  contract_naam: string
  leverancier_id: string
  leverancier_naam: string
  aanvraag_type: AanvraagType
  verbruik_data: any
  gegevens_data: any
  iban?: string
  rekening_op_andere_naam?: boolean
  rekeninghouder_naam?: string
  heeft_verblijfsfunctie?: boolean
  gaat_verhuizen?: boolean
  wanneer_overstappen?: string
  contract_einddatum?: string
  ingangsdatum?: string
  is_klant_bij_leverancier?: boolean
  herinnering_contract?: boolean
  nieuwsbrief?: boolean
  heeft_andere_correspondentie_adres?: boolean
  correspondentie_adres?: any
}

export interface CreateAanvraagResponse {
  success: boolean
  aanvraag?: ContractAanvraag
  aanvraagnummer?: string
  message?: string
  error?: string
  emailLogs?: string[]
  emailSuccess?: boolean
  emailError?: {
    message?: string
    stack?: string
    name?: string
  }
}

