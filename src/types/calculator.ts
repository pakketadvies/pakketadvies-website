export interface Leveringsadres {
  postcode: string
  huisnummer: string
  toevoeging?: string
  straat?: string
  plaats?: string
}

export interface VerbruikData {
  // Elektriciteit - normaal/dal split (standaard dubbele meter)
  elektriciteitNormaal: number // kWh per jaar (dag tarief)
  elektriciteitDal: number | null // kWh per jaar (nacht/weekend tarief), null bij enkele meter
  heeftEnkeleMeter: boolean // true = enkele meter, false = dubbele meter

  // Gas
  gasJaar: number | null // m³ per jaar, null als geen gasaansluiting
  geenGasaansluiting: boolean

  // Zonnepanelen
  heeftZonnepanelen: boolean
  terugleveringJaar: number | null // in kWh - hoeveel stroom terug leveren per jaar

  // Meter info (optioneel, helpt voor contractadvies)
  meterType: 'slim' | 'oud' | 'weet_niet'

  // Aansluitwaarden (NIEUW - voor nauwkeurige netbeheerkosten berekening)
  aansluitwaardeElektriciteit?: string // '1x25A', '3x25A', '3x35A', '3x80A', etc.
  aansluitwaardeGas?: string // 'G4', 'G6', 'G10', 'G25', etc.

  // Leveringsadressen
  leveringsadressen: Leveringsadres[]

  // NIEUW: Address type (woonfunctie check via BAG API)
  addressType?: 'particulier' | 'zakelijk' | null // null = nog niet gecontroleerd

  // Legacy
  geschat: boolean // wordt later vervangen door "help mij schatten" feature
}

export interface BedrijfsGegevens {
  bedrijfsnaam: string
  contactpersoon: string
  email: string
  telefoon: string
  kvkNummer?: string
  typeBedrijf: TypeBedrijf
  aantalWerknemers?: number
  vierkanteMeter?: number
  huidigeLeverancier?: string
}

export type TypeBedrijf =
  | 'retail'
  | 'horeca'
  | 'kantoor'
  | 'productie'
  | 'gezondheidszorg'
  | 'onderwijs'
  | 'overig'

export interface ContractVoorkeuren {
  type: 'vast' | 'dynamisch' | 'beide' | 'maatwerk'
  looptijd?: 1 | 2 | 3 | 4 | 5
  groeneEnergie: boolean
  opmerkingen?: string
}

export interface CalculatorState {
  stap: number
  verbruik: VerbruikData | null
  bedrijfsgegevens: BedrijfsGegevens | null
  voorkeuren: ContractVoorkeuren | null
  resultaten: ContractOptie[] | null
}

export interface ContractOptie {
  id: string
  leverancier: Leverancier
  type: 'vast' | 'dynamisch'
  looptijd?: number // Optional: only for vast contracts, undefined for dynamic
  maandbedrag: number
  jaarbedrag: number
  tariefElektriciteit: number
  tariefElektriciteitEnkel?: number // Voor enkele meters
  tariefElektriciteitDal?: number // Voor dubbele meters (nacht)
  tariefGas?: number
  groeneEnergie: boolean
  rating: number
  aantalReviews: number
  voorwaarden: string[]
  opzegtermijn: number
  bijzonderheden: string[]
  besparing?: number
  aanbevolen?: boolean
  populair?: boolean
  breakdown?: any // Kosten breakdown voor prijsdetails (optioneel)
}

export interface Leverancier {
  id: string
  naam: string
  logo: string
  website: string
  overLeverancier?: string // Beschrijving voor "Over leverancier" tab
}

