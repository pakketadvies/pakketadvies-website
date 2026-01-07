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
  if (!aansluitwaarde) {
    console.log('🔍 [GridHub] mapAansluitwaardeToCapTar: aansluitwaarde is undefined/null')
    return undefined
  }

  // Normaliseer aansluitwaarde (uppercase, trim)
  const normalized = aansluitwaarde.trim().toUpperCase()
  console.log(`🔍 [GridHub] mapAansluitwaardeToCapTar: input="${aansluitwaarde}", normalized="${normalized}"`)

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
  // CONCLUSIE TEST: GridHub accepteert NIET dezelfde CapTar codes voor gas als voor elektriciteit
  // Test met "10211" (elektriciteit code) gaf 422 error - GridHub gebruikt aparte codes voor gas
  // We moeten de correcte gas CapTar codes van Energiek/GridHub krijgen
  const gasMapping: Record<string, string> = {
    'G4': '20101', // Standaard kleinverbruik - VERIFICATIE NODIG: GridHub wijst mogelijk af
    'G6': '20102', // Meest voorkomend - VERIFICATIE NODIG: GridHub wijst "20102" af met 422
    'G6_LAAG': '20102', // G6 varianten gebruiken dezelfde CapTar code als G6
    'G6_MIDDEN': '20102',
    'G6_HOOG': '20102',
    'G10': '20103', // VERIFICATIE NODIG
    'G16': '20104', // VERIFICATIE NODIG
    'G25': '20105', // VERIFICATIE NODIG
    'G40': '20106', // VERIFICATIE NODIG
    'G65': '20107', // VERIFICATIE NODIG
    // Voeg meer mappings toe indien nodig
  }

  // Check elektriciteit mapping
  if (elektriciteitMapping[normalized]) {
    const result = elektriciteitMapping[normalized]
    console.log(`✅ [GridHub] mapAansluitwaardeToCapTar: elektriciteit mapping gevonden: "${normalized}" -> "${result}"`)
    return result
  }

  // Check gas mapping
  if (gasMapping[normalized]) {
    const result = gasMapping[normalized]
    console.log(`✅ [GridHub] mapAansluitwaardeToCapTar: gas mapping gevonden: "${normalized}" -> "${result}"`)
    return result
  }

  // Als geen mapping gevonden: return aansluitwaarde als-is
  // GridHub moet dit accepteren, of we krijgen een error die we kunnen afhandelen
  // In productie: log dit voor monitoring en uitbreiding mapping
  console.warn(`⚠️ [GridHub] Geen CapTar mapping gevonden voor aansluitwaarde: ${aansluitwaarde} (normalized: ${normalized})`)
  console.warn(`⚠️ [GridHub] Beschikbare gas mappings: ${Object.keys(gasMapping).join(', ')}`)
  return normalized
}

/**
 * Format date/time for GridHub API (Y-m-d H:i:s format)
 */
function formatGridHubDateTime(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * Format IBAN for GridHub (remove spaces, uppercase)
 * GridHub verwacht een geldig IBAN formaat: 2 letters + 2 cijfers + max 30 alfanumerieke tekens
 */
function formatIBAN(iban: string): string {
  if (!iban) return ''
  
  // Remove all spaces and convert to uppercase
  const cleaned = iban.replace(/\s/g, '').toUpperCase()
  
  // Log voor debugging
  console.log('🔍 [GridHub] IBAN formatting:', {
    original: iban,
    cleaned,
    length: cleaned.length,
    isValidFormat: /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(cleaned),
  })
  
  // Validate IBAN format (basic check)
  // IBAN format: 2 letters (country code) + 2 digits (check digits) + up to 30 alphanumeric characters
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(cleaned)) {
    console.warn('⚠️ [GridHub] IBAN format may be invalid:', {
      iban: cleaned,
      expectedFormat: '2 letters + 2 digits + 1-30 alphanumeric characters',
    })
  }
  
  return cleaned
}

/**
 * Generate sign data (base64 encoded signature SVG)
 * 
 * GridHub vereist een base64 string van de handtekening (SVG is gewenst)
 * Voor Energiek.nl genereren we automatisch een digitale handtekening op basis van
 * de formulier data. Klanten hoeven niet echt te tekenen, maar er moet wel een
 * handtekening worden meegestuurd naar GridHub.
 */
function generateSignData(
  gegevens: any,
  verbruik: any,
  aanvraagnummer: string,
  signTimestamp: Date
): string {
  const signerName = `${gegevens.voornaam || ''} ${gegevens.achternaam || ''}`.trim()
  const signerEmail = gegevens.emailadres || gegevens.email || ''
  const signDate = signTimestamp.toISOString().split('T')[0]
  const signTime = signTimestamp.toTimeString().split(' ')[0]
  
  // Genereer een professionele SVG handtekening
  // Dit is een digitale handtekening die voldoet aan GridHub's vereisten
  const svgSignature = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="150" viewBox="0 0 500 150">
    <rect width="500" height="150" fill="white" stroke="#000" stroke-width="2" rx="4"/>
    <text x="10" y="25" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#000">Digitale Handtekening</text>
    <line x1="10" y1="30" x2="490" y2="30" stroke="#000" stroke-width="1"/>
    <text x="10" y="55" font-family="Arial, sans-serif" font-size="14" fill="#000">Naam: ${signerName}</text>
    <text x="10" y="80" font-family="Arial, sans-serif" font-size="14" fill="#000">Email: ${signerEmail}</text>
    <text x="10" y="105" font-family="Arial, sans-serif" font-size="14" fill="#000">Datum: ${signDate} ${signTime}</text>
    <text x="10" y="130" font-family="Arial, sans-serif" font-size="12" fill="#666">Aanvraagnummer: ${aanvraagnummer}</text>
    <line x1="10" y1="140" x2="490" y2="140" stroke="#000" stroke-width="1"/>
  </svg>`

  // Return base64 encoded SVG (GridHub vereist base64 string, SVG is gewenst)
  // Geen prefix nodig - gewoon de base64 string van de SVG
  const base64Signature = Buffer.from(svgSignature).toString('base64')
  return base64Signature
}

export function mapAanvraagToGridHubOrderRequest(
  options: MapToGridHubOptions
): GridHubCreateOrderRequestPayload {
  const { aanvraag, productId, tariffId, customerApprovalIDs, clientIP, signTimestamp } = options

  const gegevens = aanvraag.gegevens_data
  const verbruik = aanvraag.verbruik_data
  const leveringsadres = verbruik.leveringsadressen?.[0]

  // Map relation (volgens voorbeeld JSON van Energiek.nl)
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
    birthDate: gegevens.geboortedatum || gegevens.birthDate, // YYYY-MM-DD (optioneel)
    phoneNumber: gegevens.telefoonnummer || gegevens.telefoon || '',
    email: gegevens.emailadres || gegevens.email || '', // "email" niet "emailAddress"
    street: leveringsadres?.straat || '',
    houseNumber: leveringsadres?.huisnummer || '', // String, niet number!
    houseNumberAddition: leveringsadres?.toevoeging || '',
    postalCode: leveringsadres?.postcode?.replace(/\s/g, '').toUpperCase() || '',
    city: leveringsadres?.plaats || '',
    country: 'NL',
    companyName: aanvraag.aanvraag_type === 'zakelijk' ? gegevens.bedrijfsnaam : undefined,
    companyCoCNumber: aanvraag.aanvraag_type === 'zakelijk' ? gegevens.kvkNummer : undefined,
    bankAccountType: 'IBAN',
    bankAccountNumber: formatIBAN(aanvraag.iban || ''),
    debtorName: `${gegevens.voornaam?.[0] || ''}. ${gegevens.achternaam || ''}`.trim() || undefined, // In voorbeeld: "J. Doe"
    paymentMethod: 'AUTOMATICCOLLECTION',
    mandateDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    mandateReference: undefined, // Optioneel
  }

  // Map requested connection
  const hasElectricity =
    !verbruik.geenElektriciteitsaansluiting &&
    (verbruik.elektriciteitNormaal > 0 || verbruik.elektriciteitDal > 0 || verbruik.elektriciteitEnkel > 0)
  // Volgens Energiek.nl: andere prijsvergelijkers sturen de CapTar code NIET mee
  // We houden hasGas false voor alleen-elektriciteit aanvragen (zoals het hoort)
  // En we laten capacityCodeGas weg als hasGas false is
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

  // Map meter type (volgens voorbeeld: "DOUBLE" voor dubbele meter)
  let meterType: 'DOUBLE' | 'SINGLE' | 'SMART' | 'CONVENTIONAL' | 'UNKNOWN' = 'UNKNOWN'
  if (verbruik.meterType === 'slim') {
    meterType = 'SMART'
  } else if (verbruik.heeftDubbeleMeter) {
    meterType = 'DOUBLE' // In voorbeeld: "DOUBLE"
  } else if (verbruik.meterType === 'enkelvoudig') {
    meterType = 'SINGLE'
  } else if (verbruik.meterType === 'dubbel') {
    meterType = 'DOUBLE'
  }

  // Map switch type
  const switchType: 'SWITCH' | 'NEW' | 'MOVE' | 'UNKNOWN' = aanvraag.gaat_verhuizen
    ? 'MOVE'
    : 'SWITCH'

  // Map capacity codes with logging
  const capacityCodeElectricity = hasElectricity
    ? mapAansluitwaardeToCapTar(verbruik.aansluitwaardeElektriciteit)
    : undefined
  const capacityCodeGas = hasGas ? mapAansluitwaardeToCapTar(verbruik.aansluitwaardeGas) : undefined

  // Uitgebreide logging voor CapTar codes debugging
  const verbruikData = {
    geenGasaansluiting: verbruik.geenGasaansluiting,
    gasJaar: verbruik.gasJaar,
    aansluitwaardeGas: verbruik.aansluitwaardeGas,
    aansluitwaardeElektriciteit: verbruik.aansluitwaardeElektriciteit,
    elektriciteitNormaal: verbruik.elektriciteitNormaal,
    elektriciteitDal: verbruik.elektriciteitDal,
    elektriciteitEnkel: verbruik.elektriciteitEnkel,
  }
  
  // Log naar console EN database (non-blocking)
  console.log('🔍 [GridHub] ========== CAPTAR CODE DEBUGGING ==========')
  console.log('🔍 [GridHub] Input verbruik data:', verbruikData)
  gridHubLogger.debug('CapTar Code Debugging - Input verbruik data', verbruikData, {
    aanvraagnummer: aanvraag.aanvraagnummer,
  })
  
  const calculatedFlags = {
    hasGas,
    hasElectricity,
    hasGasCalculation: `!${verbruik.geenGasaansluiting} && ${verbruik.gasJaar} > 0 = ${!verbruik.geenGasaansluiting && verbruik.gasJaar > 0}`,
    hasElectricityCalculation: `!${verbruik.geenElektriciteitsaansluiting} && (${verbruik.elektriciteitNormaal} || ${verbruik.elektriciteitDal} || ${verbruik.elektriciteitEnkel})`,
  }
  console.log('🔍 [GridHub] Calculated flags:', calculatedFlags)
  gridHubLogger.debug('CapTar Code Debugging - Calculated flags', calculatedFlags, {
    aanvraagnummer: aanvraag.aanvraagnummer,
  })
  
  const capacityCodesMapping = {
    hasGas,
    aansluitwaardeGas: verbruik.aansluitwaardeGas,
    capacityCodeGas,
    capacityCodeGasSource: hasGas ? `mapAansluitwaardeToCapTar("${verbruik.aansluitwaardeGas}")` : 'undefined (hasGas=false)',
    hasElectricity,
    aansluitwaardeElektriciteit: verbruik.aansluitwaardeElektriciteit,
    capacityCodeElectricity,
    capacityCodeElectricitySource: hasElectricity ? `mapAansluitwaardeToCapTar("${verbruik.aansluitwaardeElektriciteit}")` : 'undefined (hasElectricity=false)',
  }
  console.log('🔍 [GridHub] Capacity codes mapping:', capacityCodesMapping)
  gridHubLogger.debug('CapTar Code Debugging - Capacity codes mapping', capacityCodesMapping, {
    aanvraagnummer: aanvraag.aanvraagnummer,
    hasGas,
    hasElectricity,
    capacityCodeGas,
    capacityCodeElectricity,
  })
  console.log('🔍 [GridHub] ===========================================')

  // Build requestedConnection object
  const requestedConnection: any = {
    postalCode: leveringsadres?.postcode?.replace(/\s/g, '').toUpperCase() || '',
    houseNumber: leveringsadres?.huisnummer || '', // String, niet number!
    houseNumberAddition: leveringsadres?.toevoeging || '',
    hasElectricity,
    hasGas,
    isResidenceFunction: true, // In voorbeeld: true
  }
  
  console.log('🔍 [GridHub] ========== REQUESTED CONNECTION BUILD ==========')
  console.log('🔍 [GridHub] Initial requestedConnection:', JSON.stringify(requestedConnection, null, 2))

  // Only add optional fields if they have values
  if (hasElectricity) {
    if (meterType) requestedConnection.meterType = meterType
    if (startDateStr) requestedConnection.startDateElectricity = startDateStr
    if (capacityCodeElectricity) requestedConnection.capacityCodeElectricity = capacityCodeElectricity
    if (switchType) requestedConnection.switchTypeElectricity = switchType
    if (verbruik.meterType === 'slim') requestedConnection.hasP1Data = true
    
    if (verbruik.elektriciteitNormaal && verbruik.heeftDubbeleMeter) {
      requestedConnection.usageElectricityHigh = Math.round(verbruik.elektriciteitNormaal).toString()
    }
    if (verbruik.elektriciteitDal && verbruik.heeftDubbeleMeter) {
      requestedConnection.usageElectricityLow = Math.round(verbruik.elektriciteitDal).toString()
    }
    if (!verbruik.heeftDubbeleMeter) {
      if (verbruik.elektriciteitEnkel) {
        requestedConnection.usageElectricitySingle = Math.round(verbruik.elektriciteitEnkel).toString()
      } else if (verbruik.elektriciteitNormaal) {
        requestedConnection.usageElectricitySingle = Math.round(verbruik.elektriciteitNormaal).toString()
      }
    }
    if (verbruik.terugleveringJaar && verbruik.terugleveringJaar > 0) {
      if (verbruik.heeftDubbeleMeter) {
        requestedConnection.returnElectricityHigh = Math.round(verbruik.terugleveringJaar).toString()
      } else {
        requestedConnection.returnElectricitySingle = Math.round(verbruik.terugleveringJaar).toString()
      }
    }
  }

  if (hasGas) {
    console.log('🔍 [GridHub] hasGas is TRUE - Adding gas fields...')
    if (startDateStr) requestedConnection.startDateGas = startDateStr
    if (switchType) requestedConnection.switchTypeGas = switchType
    if (verbruik.gasJaar) {
      requestedConnection.usageGas = Math.round(verbruik.gasJaar).toString()
    }
    // VOLGENS ENERGIEK.NL: andere prijsvergelijkers sturen capacityCodeGas NIET mee
    // We laten capacityCodeGas daarom weg, ook als hasGas true is
    // Dit is volgens het advies van Energiek.nl
    console.log('ℹ️ [GridHub] capacityCodeGas wordt WEGGELATEN (volgens advies Energiek.nl)')
    console.log('ℹ️ [GridHub] Andere prijsvergelijkers sturen deze ook niet mee')
    console.log('🔍 [GridHub] Gas fields added:', {
      startDateGas: requestedConnection.startDateGas,
      switchTypeGas: requestedConnection.switchTypeGas,
      usageGas: requestedConnection.usageGas,
      capacityCodeGas: 'WEGGELATEN',
    })
  } else {
    console.log('🔍 [GridHub] hasGas is FALSE - No gas fields added')
    console.log('🔍 [GridHub] capacityCodeGas wordt sowieso niet meegestuurd (hasGas=false)')
  }

  // Always set these
  requestedConnection.customerApprovalLEDs = true // Verplicht: true

  // Bereken advance payment amounts (volgens voorbeeld: numbers, niet strings!)
  const maandbedrag = aanvraag.verbruik_data?.maandbedrag || 0
  let agreedAdvancePaymentAmountElectricity = 0
  let agreedAdvancePaymentAmountGas = 0
  let agreedAdvancePaymentAmount = 0

  if (maandbedrag > 0) {
    if (hasElectricity && hasGas) {
      // Split 50/50 tussen elektriciteit en gas
      const half = maandbedrag / 2
      agreedAdvancePaymentAmountElectricity = Math.round(half * 100) / 100 // 2 decimalen
      agreedAdvancePaymentAmountGas = Math.round(half * 100) / 100
      agreedAdvancePaymentAmount = Math.round(maandbedrag * 100) / 100
    } else if (hasElectricity) {
      agreedAdvancePaymentAmountElectricity = Math.round(maandbedrag * 100) / 100
      agreedAdvancePaymentAmountGas = 0
      agreedAdvancePaymentAmount = Math.round(maandbedrag * 100) / 100
    } else if (hasGas) {
      agreedAdvancePaymentAmountElectricity = 0
      agreedAdvancePaymentAmountGas = Math.round(maandbedrag * 100) / 100
      agreedAdvancePaymentAmount = Math.round(maandbedrag * 100) / 100
    }
  }

  // Voeg agreedAdvancePaymentAmount toe aan requestedConnection (numbers, niet strings!)
  // CONCLUSIE TESTEN:
  // - agreedAdvancePaymentAmountGas weglaten → 422 error (veld is verplicht)
  // - agreedAdvancePaymentAmountGas: 0 → 500 error (met hasGas: false)
  // - capacityCodeGas weglaten → volgens Energiek.nl doen andere prijsvergelijkers dit ook
  if (hasElectricity) {
    requestedConnection.agreedAdvancePaymentAmountElectricity = agreedAdvancePaymentAmountElectricity
  }
  
  // agreedAdvancePaymentAmountGas is VERPLICHT (ook als hasGas false)
  // We moeten het meesturen, maar krijgen 500 error met hasGas: false + 0
  // Dit lijkt een GridHub bug te zijn
  requestedConnection.agreedAdvancePaymentAmountGas = agreedAdvancePaymentAmountGas
  
  if (!hasGas) {
    console.log('ℹ️ [GridHub] hasGas: false, maar agreedAdvancePaymentAmountGas wordt meegestuurd (verplicht veld)')
    console.log('ℹ️ [GridHub] capacityCodeGas wordt WEGGELATEN (volgens advies Energiek.nl)')
    console.warn('⚠️ [GridHub] Als je een 500 error krijgt, is dit een GridHub server-side probleem')
    console.warn('⚠️ [GridHub] Neem contact op met Energiek/GridHub met de Service ID uit de error')
  }

  // Format timestamps voor GridHub (Y-m-d H:i:s format)
  // Use provided signTimestamp or current date/time as fallback
  const signTimestampToUse = signTimestamp || new Date()
  const formattedSignTimestamp = formatGridHubDateTime(signTimestampToUse)
  const formattedOriginalTimestamp = aanvraag.created_at
    ? formatGridHubDateTime(new Date(aanvraag.created_at))
    : formattedSignTimestamp

  // FINAL DEBUGGING: Log complete requestedConnection before sending
  console.log('🔍 [GridHub] ========== FINAL REQUESTED CONNECTION ==========')
  console.log('🔍 [GridHub] Complete requestedConnection object:', JSON.stringify(requestedConnection, null, 2))
  console.log('🔍 [GridHub] Key fields check:', {
    hasElectricity: requestedConnection.hasElectricity,
    hasGas: requestedConnection.hasGas,
    capacityCodeElectricity: requestedConnection.capacityCodeElectricity || 'NOT SET',
    capacityCodeGas: requestedConnection.capacityCodeGas || 'NOT SET (wegelaten)',
    agreedAdvancePaymentAmountElectricity: requestedConnection.agreedAdvancePaymentAmountElectricity,
    agreedAdvancePaymentAmountGas: requestedConnection.agreedAdvancePaymentAmountGas,
    allKeys: Object.keys(requestedConnection).sort(),
  })
  console.log('🔍 [GridHub] ===============================================')

  // Volgens voorbeeld: requestedConnections is een object, niet een array!
  // signData en signIP zijn niet aanwezig in voorbeeld (mogelijk niet nodig voor DIRECT)
  return {
    relation,
    productID: productId,
    tariffID: tariffId,
    signTimestamp: formattedSignTimestamp, // Y-m-d H:i:s format
    signType: 'DIRECT', // In voorbeeld: "DIRECT" (niet "ESIGNATURE")
    signSource: 'DIRECT', // In voorbeeld: "DIRECT" (niet "EMAIL")
    externalReference: aanvraag.aanvraagnummer, // In voorbeeld op root level
    requestedConnections: requestedConnection, // Object, niet array!
    customerApprovalIDs: customerApprovalIDs,
    originalCreateTimestamp: formattedOriginalTimestamp, // Verplicht op root level, Y-m-d H:i:s format
    flowQuestion: [], // In voorbeeld: lege array
    agreedAdvancePaymentAmount: agreedAdvancePaymentAmount, // Number, niet string!
  }
}

