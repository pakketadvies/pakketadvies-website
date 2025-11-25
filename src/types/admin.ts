// Database types voor admin system

export interface Leverancier {
  id: string
  naam: string
  logo_url: string | null
  website: string | null
  over_leverancier: string | null // Beschrijving voor "Over leverancier" tab
  actief: boolean
  volgorde: number
  created_at: string
  updated_at: string
}

export interface Contract {
  id: string
  leverancier_id: string
  naam: string
  type: 'vast' | 'dynamisch' | 'maatwerk'
  beschrijving: string | null
  actief: boolean
  aanbevolen: boolean
  populair: boolean
  volgorde: number
  zichtbaar_bij_teruglevering: boolean | null // NULL = altijd tonen, TRUE = alleen bij teruglevering, FALSE = alleen zonder teruglevering
  target_audience: 'particulier' | 'zakelijk' | 'both' // NIEUW: Bepaalt voor welke doelgroep het contract wordt getoond
  created_at: string
  updated_at: string
  
  // Relations (populated via joins)
  leverancier?: Leverancier
  details_vast?: ContractDetailsVast
  details_dynamisch?: ContractDetailsDynamisch
  details_maatwerk?: ContractDetailsMaatwerk
}

export interface ContractDetailsVast {
  contract_id: string
  looptijd: 1 | 2 | 3 | 4 | 5
  
  // Tarieven (altijd alle 3 invullen)
  tarief_elektriciteit_enkel: number | null // Voor enkele meters
  tarief_elektriciteit_normaal: number | null // Voor dubbele meters (dag)
  tarief_elektriciteit_dal: number | null // Voor dubbele meters (nacht)
  tarief_gas: number | null
  tarief_teruglevering_kwh: number // Kosten per kWh teruglevering (voor zonnepanelen)
  
  // Vastrechten (apart voor stroom en gas)
  vastrecht_stroom_maand: number
  vastrecht_gas_maand: number
  vaste_kosten_maand: number | null // Deprecated, gebruik vastrecht_stroom_maand + vastrecht_gas_maand
  
  // Eigenschappen
  groene_energie: boolean
  prijsgarantie: boolean
  opzegtermijn: number
  
  // Display
  voorwaarden: string[]
  bijzonderheden: string[]
  rating: number
  aantal_reviews: number
  
  created_at: string
  updated_at: string
}

export interface ContractDetailsDynamisch {
  contract_id: string
  
  // Opslagen bovenop spotprijs
  opslag_elektriciteit: number // Opslag voor stroom (geldt voor zowel dag als nacht)
  opslag_gas: number | null
  opslag_teruglevering: number // Opslag voor teruglevering (€/kWh, meestal negatief of 0)
  
  // Vastrechten (apart voor stroom en gas)
  vastrecht_stroom_maand: number
  vastrecht_gas_maand: number
  
  // Index
  index_naam: string
  max_prijs_cap: number | null
  
  // Eigenschappen
  groene_energie: boolean
  opzegtermijn: number
  
  // Display
  voorwaarden: string[]
  bijzonderheden: string[]
  rating: number
  aantal_reviews: number
  
  created_at: string
  updated_at: string
}

export interface ContractDetailsMaatwerk {
  contract_id: string
  
  // Identiek aan vast contract
  looptijd: 1 | 2 | 3 | 4 | 5
  
  // Tarieven (altijd alle 3 invullen)
  tarief_elektriciteit_enkel: number | null // Voor enkele meters
  tarief_elektriciteit_normaal: number | null // Voor dubbele meters (dag)
  tarief_elektriciteit_dal: number | null // Voor dubbele meters (nacht)
  tarief_gas: number | null
  tarief_teruglevering_kwh: number // Kosten per kWh teruglevering (voor zonnepanelen)
  
  // Vastrechten (apart voor stroom en gas)
  vastrecht_stroom_maand: number
  vastrecht_gas_maand: number
  vaste_kosten_maand: number | null // Deprecated, gebruik vastrecht_stroom_maand + vastrecht_gas_maand
  
  // Eigenschappen
  groene_energie: boolean
  prijsgarantie: boolean
  opzegtermijn: number
  
  // Drempels (uniek voor maatwerk)
  min_verbruik_elektriciteit: number | null // Minimaal verbruik in kWh/jaar om zichtbaar te zijn
  min_verbruik_gas: number | null // Minimaal verbruik in m³/jaar om zichtbaar te zijn
  
  // Contact (optioneel, voor maatwerk specifiek)
  custom_tekst: string | null
  contact_email: string | null
  contact_telefoon: string | null
  
  // Display
  voorwaarden: string[]
  bijzonderheden: string[]
  rating: number
  aantal_reviews: number
  
  created_at: string
  updated_at: string
}

// Form types voor create/edit
export type LeverancierFormData = Omit<Leverancier, 'id' | 'created_at' | 'updated_at'>

export type ContractFormData = Omit<Contract, 'id' | 'created_at' | 'updated_at' | 'leverancier' | 'details_vast' | 'details_dynamisch' | 'details_maatwerk'>

export type ContractDetailsVastFormData = Omit<ContractDetailsVast, 'contract_id' | 'created_at' | 'updated_at'>

export type ContractDetailsDynamischFormData = Omit<ContractDetailsDynamisch, 'contract_id' | 'created_at' | 'updated_at'>

export type ContractDetailsMaatwerkFormData = Omit<ContractDetailsMaatwerk, 'contract_id' | 'created_at' | 'updated_at'>

