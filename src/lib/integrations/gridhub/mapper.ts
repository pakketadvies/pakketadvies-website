/**
 * Maps our internal aanvraag data to GridHub API format
 */

import type { ContractAanvraag } from '@/types/aanvragen'
import type {
  GridHubCreateOrderRequestPayload,
  GridHubRelation,
  GridHubRequestedConnection,
} from './client'
import crypto from 'crypto'

interface MapToGridHubOptions {
  aanvraag: ContractAanvraag
  productId: string
  tariffId: string
  customerApprovalIDs: number[]
  clientIP: string
  signTimestamp: Date
}

/**
 * Map aansluitwaarde naar CapTar code (korte variant)
 * 
 * CapTar codes zijn 5-cijferige codes die de aansluitcapaciteit beschrijven
 * Bijv. "10211" voor 3x25A
 * 
 * Deze mapping is gebaseerd op de meest voorkomende aansluitwaarden
 * Voor productie: deze mapping moet mogelijk worden uitgebreid of via API worden opgehaald
 */
function mapAansluitwaardeToCapTar(aansluitwaarde: string | undefined): string | undefined {
  if (!aansluitwaarde) return undefined

  // Normaliseer aansluitwaarde (uppercase, trim)
  const normalized = aansluitwaarde.trim().toUpperCase()

  // Mapping tabel voor elektriciteit (meest voorkomende)
  const elektriciteitMapping: Record<string, string> = {
    '1X25A': '10211', // Standaard kleinverbruik
    '3X25A': '10211', // Meest voorkomend
    '3X35A': '10212',
    '3X50A': '10213',
    '3X63A': '10214',
    '3X80A': '10215',
    '3X100A': '10216',
    // Voeg meer mappings toe indien nodig
  }

  // Mapping tabel voor gas (meest voorkomende)
  const gasMapping: Record<string, string> = {
    'G4': '20101', // Standaard kleinverbruik
    'G6': '20102',
    'G10': '20103',
    'G16': '20104',
    'G25': '20105',
    'G40': '20106',
    'G65': '20107',
    // Voeg meer mappings toe indien nodig
  }

  // Check elektriciteit mapping
  if (elektriciteitMapping[normalized]) {
    return elektriciteitMapping[normalized]
  }

  // Check gas mapping
  if (gasMapping[normalized]) {
    return gasMapping[normalized]
  }

  // Als geen mapping gevonden: return aansluitwaarde als-is
  // GridHub moet dit accepteren, of we krijgen een error die we kunnen afhandelen
  // In productie: log dit voor monitoring en uitbreiding mapping
  console.warn(`⚠️ [GridHub] Geen CapTar mapping gevonden voor aansluitwaarde: ${aansluitwaarde}`)
  return normalized
}

/**
 * Generate sign data (slimme oplossing)
 * 
 * Maakt een hash van de formulier data + timestamp + aanvraagnummer
 * Dit is een veilige manier om te verifiëren dat de aanvraag legitiem is
 */
function generateSignData(
  gegevens: any,
  verbruik: any,
  aanvraagnummer: string,
  signTimestamp: Date
): string {
  // Maak een object met alle relevante data voor signature
  const signDataObj = {
    aanvraagnummer,
    email: gegevens.emailadres || gegevens.email,
    postcode: verbruik.leveringsadressen?.[0]?.postcode,
    huisnummer: verbruik.leveringsadressen?.[0]?.huisnummer,
    timestamp: signTimestamp.toISOString(),
    // Voeg meer verificatie data toe indien nodig
  }

  // Maak een hash van het object (SHA-256)
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(signDataObj))
    .digest('hex')

  // Return base64 encoded hash (GridHub verwacht string)
  return Buffer.from(hash).toString('base64')
}

export function mapAanvraagToGridHubOrderRequest(
  options: MapToGridHubOptions
): GridHubCreateOrderRequestPayload {
  const { aanvraag, productId, tariffId, customerApprovalIDs, clientIP, signTimestamp } = options

  const gegevens = aanvraag.gegevens_data
  const verbruik = aanvraag.verbruik_data
  const leveringsadres = verbruik.leveringsadressen?.[0]

  // Map relation
  const relation: GridHubRelation = {
    type: aanvraag.aanvraag_type === 'particulier' ? 'CONSUMER' : 'BUSINESS',
    firstName: gegevens.voornaam || gegevens.firstName || '',
    middleName: gegevens.tussenvoegsel || gegevens.middleName,
    lastName: gegevens.achternaam || gegevens.lastName || '',
    gender:
      gegevens.geslacht === 'man'
        ? 'MALE'
        : gegevens.geslacht === 'vrouw'
          ? 'FEMALE'
          : 'MALE', // Default naar MALE als niet gespecificeerd
    birthDate: gegevens.geboortedatum || gegevens.birthDate || '', // YYYY-MM-DD
    phoneNumber: gegevens.telefoonnummer || gegevens.telefoon || '',
    emailAddress: gegevens.emailadres || gegevens.email || '',
    street: leveringsadres?.straat || '',
    houseNumber: parseInt(leveringsadres?.huisnummer || '0', 10),
    houseNumberAddition: leveringsadres?.toevoeging,
    postalCode: leveringsadres?.postcode?.replace(/\s/g, '').toUpperCase() || '',
    city: leveringsadres?.plaats || '',
    country: 'NL',
    companyName: aanvraag.aanvraag_type === 'zakelijk' ? gegevens.bedrijfsnaam : undefined,
    companyCoCNumber: aanvraag.aanvraag_type === 'zakelijk' ? gegevens.kvkNummer : undefined,
    bankAccountType: 'IBAN',
    bankAccountNumber: aanvraag.iban || '',
    paymentMethod: 'DIRECT_DEBIT', // Altijd verplicht voor Energiek
    mandateDate: new Date().toISOString().split('T')[0], // Vandaag
    mandateReference: undefined, // Optioneel
  }

  // Map requested connection
  const hasElectricity =
    !verbruik.geenElektriciteitsaansluiting &&
    (verbruik.elektriciteitNormaal > 0 || verbruik.elektriciteitDal > 0 || verbruik.elektriciteitEnkel > 0)
  const hasGas = !verbruik.geenGasaansluiting && verbruik.gasJaar > 0

  // Bereken startdatum (minimaal 20 dagen, behalve inhuizing: 3 dagen)
  // Dit wordt later in de flow berekend, maar hier gebruiken we de ingangsdatum als die er is
  const minDagen = aanvraag.gaat_verhuizen ? 3 : 20
  let startDate: Date
  if (aanvraag.ingangsdatum) {
    startDate = new Date(aanvraag.ingangsdatum)
  } else {
    startDate = new Date()
    startDate.setDate(startDate.getDate() + minDagen)
  }
  const startDateStr = startDate.toISOString().split('T')[0]

  // Map meter type
  let meterType: 'SMART' | 'CONVENTIONAL' | 'UNKNOWN' = 'UNKNOWN'
  if (verbruik.meterType === 'slim') {
    meterType = 'SMART'
  } else if (verbruik.meterType === 'enkelvoudig' || verbruik.meterType === 'dubbel') {
    meterType = 'CONVENTIONAL'
  }

  // Map switch type
  const switchType: 'SWITCH' | 'NEW' | 'MOVE' | 'UNKNOWN' = aanvraag.gaat_verhuizen
    ? 'MOVE'
    : 'SWITCH'

  const requestedConnection: GridHubRequestedConnection = {
    postalCode: leveringsadres?.postcode?.replace(/\s/g, '').toUpperCase() || '',
    houseNumber: parseInt(leveringsadres?.huisnummer || '0', 10),
    houseNumberAddition: leveringsadres?.toevoeging,
    hasElectricity,
    hasGas,
    meterType: hasElectricity ? meterType : undefined,
    capacityCodeElectricity: hasElectricity
      ? mapAansluitwaardeToCapTar(verbruik.aansluitwaardeElektriciteit)
      : undefined,
    capacityCodeGas: hasGas ? mapAansluitwaardeToCapTar(verbruik.aansluitwaardeGas) : undefined,
    usageElectricityHigh:
      hasElectricity && verbruik.elektriciteitNormaal && verbruik.heeftDubbeleMeter
        ? Math.round(verbruik.elektriciteitNormaal).toString()
        : undefined,
    usageElectricityLow:
      hasElectricity && verbruik.elektriciteitDal && verbruik.heeftDubbeleMeter
        ? Math.round(verbruik.elektriciteitDal).toString()
        : undefined,
    usageElectricitySingle:
      hasElectricity && !verbruik.heeftDubbeleMeter && verbruik.elektriciteitEnkel
        ? Math.round(verbruik.elektriciteitEnkel).toString()
        : hasElectricity && !verbruik.heeftDubbeleMeter && verbruik.elektriciteitNormaal
          ? Math.round(verbruik.elektriciteitNormaal).toString()
          : undefined,
    usageGas: hasGas && verbruik.gasJaar ? Math.round(verbruik.gasJaar).toString() : undefined,
    returnElectricityHigh:
      hasElectricity &&
      verbruik.terugleveringJaar &&
      verbruik.heeftDubbeleMeter &&
      verbruik.terugleveringJaar > 0
        ? Math.round(verbruik.terugleveringJaar).toString()
        : undefined,
    returnElectricityLow: undefined, // Niet beschikbaar in onze data
    returnElectricitySingle:
      hasElectricity &&
      verbruik.terugleveringJaar &&
      !verbruik.heeftDubbeleMeter &&
      verbruik.terugleveringJaar > 0
        ? Math.round(verbruik.terugleveringJaar).toString()
        : undefined,
    switchTypeElectricity: hasElectricity ? switchType : undefined,
    switchTypeGas: hasGas ? switchType : undefined,
    hasP1Data: verbruik.meterType === 'slim',
    expectedAdvancePaymentAmountElectricity: undefined, // Wordt door GridHub berekend
    expectedAdvancePaymentAmountGas: undefined, // Wordt door GridHub berekend
    customerApprovalLEDs: true, // Verplicht: true
    billingIDs: undefined, // Optioneel
    originalCreateTimestamp: aanvraag.created_at,
  }

  // Generate sign data (slimme oplossing: hash van formulier data)
  const signData = generateSignData(gegevens, verbruik, aanvraag.aanvraagnummer, signTimestamp)

  return {
    relation,
    externalUser: {
      firstName: gegevens.voornaam,
      lastName: gegevens.achternaam,
      externalReference: aanvraag.aanvraagnummer, // Ons aanvraagnummer als external reference
    },
    externalOrganization: undefined, // Optioneel
    requestedConnections: [requestedConnection],
    productID: productId,
    tariffID: tariffId,
    customerApprovalIDs: customerApprovalIDs,
    signTimestamp: signTimestamp.toISOString(),
    signType: 'DIGITAL', // DIGITAL voor digitale handtekening via formulier
    signSource: 'DIRECT_DEBIT_MANDATE', // DIRECT_DEBIT_MANDATE voor automatische incasso
    signIP: clientIP,
    signData: signData,
  }
}

