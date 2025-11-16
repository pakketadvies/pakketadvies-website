export interface VerbruikData {
  elektriciteitJaar: number
  gasJaar: number | null
  geschat: boolean
  postcode: string
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
  type: 'vast' | 'dynamisch' | 'beide'
  looptijd: 1 | 2 | 3 | 5
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
  looptijd: number
  maandbedrag: number
  jaarbedrag: number
  tariefElektriciteit: number
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
}

export interface Leverancier {
  id: string
  naam: string
  logo: string
  website: string
}

