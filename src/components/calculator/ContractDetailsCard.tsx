'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { CaretDown, Star, CheckCircle, CurrencyEur, Calendar, Leaf, Calculator, Lightning, Flame, Sun, FileText } from '@phosphor-icons/react'
import type { ContractOptie } from '@/types/calculator'
import { useCalculatorStore } from '@/store/calculatorStore'
import { isGrootverbruikElektriciteitAansluitwaarde, isGrootverbruikGasAansluitwaarde } from '@/lib/verbruik-type'

interface ContractDetailsCardProps {
  contract: ContractOptie | null
}

// EXACT DEZELFDE BEREKENING ALS IN ResultatenFlow.tsx
const berekenContractKostenVereenvoudigd = (
  contract: any,
  verbruikElektriciteitNormaal: number,
  verbruikElektriciteitDal: number,
  verbruikGas: number,
  heeftEnkeleMeter: boolean = false,
  terugleveringJaar: number = 0,
  aansluitwaardeElektriciteit?: string,
  aansluitwaardeGas?: string,
  addressType?: 'particulier' | 'zakelijk' | null
): { 
  maandbedrag: number
  jaarbedrag: number
  besparing: number
  breakdown: {
    leverancier: number
    energiebelasting: number
    netbeheer: number
    btw: number
    totaalExclBtw: number
    totaalInclBtw: number
  }
  tarieven: {
    elektriciteitNormaal?: number
    elektriciteitDal?: number
    elektriciteitEnkel?: number
    gas?: number
    teruglevering?: number
    vastrechtStroom: number
    vastrechtGas: number
  }
} => {
  let totaalJaar = 0
  let leverancierKosten = 0

  // ============================================
  // STAP 1: SALDERINGSREGELING TOEPASSEN
  // ============================================
  let nettoElektriciteitNormaal = verbruikElektriciteitNormaal
  let nettoElektriciteitDal = verbruikElektriciteitDal

  if (terugleveringJaar > 0) {
    if (heeftEnkeleMeter) {
      const totaalVerbruik = verbruikElektriciteitNormaal + verbruikElektriciteitDal
      const nettoTotaal = Math.max(0, totaalVerbruik - terugleveringJaar)
      nettoElektriciteitNormaal = nettoTotaal
      nettoElektriciteitDal = 0
    } else {
      const terugleveringNormaal = terugleveringJaar / 2
      const terugleveringDal = terugleveringJaar / 2

      let normaal_na_aftrek = verbruikElektriciteitNormaal - terugleveringNormaal
      let dal_na_aftrek = verbruikElektriciteitDal - terugleveringDal

      if (normaal_na_aftrek < 0) {
        const overschot_normaal = -normaal_na_aftrek
        dal_na_aftrek = Math.max(0, dal_na_aftrek - overschot_normaal)
        normaal_na_aftrek = 0
      } else if (dal_na_aftrek < 0) {
        const overschot_dal = -dal_na_aftrek
        normaal_na_aftrek = Math.max(0, normaal_na_aftrek - overschot_dal)
        dal_na_aftrek = 0
      }

      nettoElektriciteitNormaal = Math.max(0, normaal_na_aftrek)
      nettoElektriciteitDal = Math.max(0, dal_na_aftrek)
    }
  }

  const isZakelijk = addressType === 'zakelijk'

  if (contract.type === 'vast' && contract.details_vast) {
    const {
      tarief_elektriciteit_enkel,
      tarief_elektriciteit_normaal,
      tarief_elektriciteit_dal,
      tarief_gas,
      tarief_teruglevering_kwh,
      vastrecht_stroom_maand,
      vastrecht_gas_maand,
      vaste_kosten_maand,
    } = contract.details_vast

    if (heeftEnkeleMeter && tarief_elektriciteit_enkel) {
      const totaalElektriciteit = nettoElektriciteitNormaal + nettoElektriciteitDal
      leverancierKosten =
        totaalElektriciteit * tarief_elektriciteit_enkel +
        verbruikGas * (tarief_gas || 0) +
        (vastrecht_stroom_maand || vaste_kosten_maand || 4) * 12 +
        (verbruikGas > 0 ? (vastrecht_gas_maand || 0) * 12 : 0)
    } else if (!heeftEnkeleMeter && tarief_elektriciteit_normaal && tarief_elektriciteit_dal) {
      leverancierKosten =
        nettoElektriciteitNormaal * tarief_elektriciteit_normaal +
        nettoElektriciteitDal * tarief_elektriciteit_dal +
        verbruikGas * (tarief_gas || 0) +
        (vastrecht_stroom_maand || vaste_kosten_maand || 4) * 12 +
        (verbruikGas > 0 ? (vastrecht_gas_maand || 0) * 12 : 0)
    } else {
      const totaalElektriciteit = nettoElektriciteitNormaal + nettoElektriciteitDal
      const tariefElektriciteit = tarief_elektriciteit_enkel || tarief_elektriciteit_normaal || 0
      leverancierKosten =
        totaalElektriciteit * tariefElektriciteit +
        verbruikGas * (tarief_gas || 0) +
        (vastrecht_stroom_maand || vaste_kosten_maand || 4) * 12 +
        (verbruikGas > 0 ? (vastrecht_gas_maand || 0) * 12 : 0)
    }

    if (terugleveringJaar > 0 && tarief_teruglevering_kwh) {
      leverancierKosten += terugleveringJaar * tarief_teruglevering_kwh
    }

    const totaalElektriciteit = nettoElektriciteitNormaal + nettoElektriciteitDal
    const ebElektriciteit = totaalElektriciteit * 0.10154
    const ebGas = verbruikGas * 0.57816
    const vermindering = 524.95

    let netbeheerElektriciteit = 430.0
    if (aansluitwaardeElektriciteit && isGrootverbruikElektriciteitAansluitwaarde(aansluitwaardeElektriciteit)) {
      netbeheerElektriciteit = 0
    }
    let netbeheerGas = verbruikGas > 0 ? 245.0 : 0
    if (aansluitwaardeGas && isGrootverbruikGasAansluitwaarde(aansluitwaardeGas)) {
      netbeheerGas = 0
    }
    const netbeheerKosten = netbeheerElektriciteit + netbeheerGas

    const energiebelasting = ebElektriciteit + ebGas - vermindering
    totaalJaar = leverancierKosten + energiebelasting + netbeheerKosten

    const totaalExclBtw = totaalJaar
    const btw = isZakelijk ? totaalExclBtw * 0.21 : 0
    totaalJaar = totaalExclBtw + btw

    return {
      maandbedrag: totaalJaar / 12,
      jaarbedrag: totaalJaar,
      besparing: contract.besparing ? contract.besparing * 12 : 0,
      breakdown: {
        leverancier: leverancierKosten,
        energiebelasting,
        netbeheer: netbeheerKosten,
        btw,
        totaalExclBtw,
        totaalInclBtw: totaalJaar,
      },
      tarieven: {
        elektriciteitNormaal: tarief_elektriciteit_normaal || undefined,
        elektriciteitDal: tarief_elektriciteit_dal || undefined,
        elektriciteitEnkel: tarief_elektriciteit_enkel || undefined,
        gas: tarief_gas || undefined,
        teruglevering: tarief_teruglevering_kwh || undefined,
        vastrechtStroom: vastrecht_stroom_maand || vaste_kosten_maand || 4,
        vastrechtGas: vastrecht_gas_maand || 0,
      },
    }
  } else if (contract.type === 'dynamisch' && contract.details_dynamisch) {
    const { opslag_elektriciteit, opslag_elektriciteit_normaal, opslag_gas, vastrecht_stroom_maand, vastrecht_gas_maand } = contract.details_dynamisch
    const marktPrijsElektriciteit = 0.2
    const marktPrijsGas = 0.8
    const opslagElektriciteit = opslag_elektriciteit || opslag_elektriciteit_normaal || 0

    const totaalElektriciteit = nettoElektriciteitNormaal + nettoElektriciteitDal
    leverancierKosten =
      totaalElektriciteit * (marktPrijsElektriciteit + opslagElektriciteit) +
      verbruikGas * (marktPrijsGas + (opslag_gas || 0)) +
      (vastrecht_stroom_maand || 0) * 12 +
      (verbruikGas > 0 ? (vastrecht_gas_maand || 0) * 12 : 0)

    const ebElektriciteit = totaalElektriciteit * 0.10154
    const ebGas = verbruikGas * 0.57816
    const vermindering = 524.95

    let netbeheerElektriciteit = 430.0
    if (aansluitwaardeElektriciteit && isGrootverbruikElektriciteitAansluitwaarde(aansluitwaardeElektriciteit)) {
      netbeheerElektriciteit = 0
    }
    let netbeheerGas = verbruikGas > 0 ? 245.0 : 0
    if (aansluitwaardeGas && isGrootverbruikGasAansluitwaarde(aansluitwaardeGas)) {
      netbeheerGas = 0
    }
    const netbeheerKosten = netbeheerElektriciteit + netbeheerGas

    const energiebelasting = ebElektriciteit + ebGas - vermindering
    totaalJaar = leverancierKosten + energiebelasting + netbeheerKosten

    const totaalExclBtw = totaalJaar
    const btw = isZakelijk ? totaalExclBtw * 0.21 : 0
    totaalJaar = totaalExclBtw + btw

    return {
      maandbedrag: totaalJaar / 12,
      jaarbedrag: totaalJaar,
      besparing: contract.besparing ? contract.besparing * 12 : 0,
      breakdown: {
        leverancier: leverancierKosten,
        energiebelasting,
        netbeheer: netbeheerKosten,
        btw,
        totaalExclBtw,
        totaalInclBtw: totaalJaar,
      },
      tarieven: {
        elektriciteitNormaal: marktPrijsElektriciteit + opslagElektriciteit,
        elektriciteitDal: marktPrijsElektriciteit + opslagElektriciteit,
        gas: marktPrijsGas + (opslag_gas || 0),
        vastrechtStroom: vastrecht_stroom_maand || 0,
        vastrechtGas: vastrecht_gas_maand || 0,
      },
    }
  }

  // Fallback
  return {
    maandbedrag: contract.maandbedrag || 0,
    jaarbedrag: contract.jaarbedrag || 0,
    besparing: contract.besparing ? contract.besparing * 12 : 0,
    breakdown: {
      leverancier: 0,
      energiebelasting: 0,
      netbeheer: 0,
      btw: 0,
      totaalExclBtw: 0,
      totaalInclBtw: 0,
    },
    tarieven: {
      vastrechtStroom: 0,
      vastrechtGas: 0,
    },
  }
}

export function ContractDetailsCard({ contract }: ContractDetailsCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const { verbruik, addressType } = useCalculatorStore()

  if (!contract || !verbruik) return null

  // Bereken kosten met EXACT dezelfde logica als resultatenpagina
  const berekening = useMemo(() => {
    return berekenContractKostenVereenvoudigd(
      contract,
      verbruik.elektriciteitNormaal || 0,
      verbruik.elektriciteitDal || 0,
      verbruik.gasJaar || 0,
      verbruik.heeftEnkeleMeter || false,
      verbruik.terugleveringJaar || 0,
      verbruik.aansluitwaarden?.elektriciteit,
      verbruik.aansluitwaarden?.gas,
      addressType
    )
  }, [contract, verbruik, addressType])

  const getContractTypeLabel = () => {
    if (contract.type === 'vast') {
      return contract.looptijd ? `Vast contract • ${contract.looptijd} jaar` : 'Vast contract'
    }
    return 'Dynamisch contract'
  }

  const rating = contract.rating || 0
  const reviews = contract.aantalReviews || 0
  const isZakelijk = addressType === 'zakelijk'

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg mb-6 overflow-hidden">
      {/* Main Card Content */}
      <div className="p-4 md:p-5">
        <div className="flex items-start gap-3 md:gap-4">
          {/* Logo */}
          {contract.leverancier.logo && (
            <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-lg border border-gray-200 p-2 flex items-center justify-center">
              <Image
                src={contract.leverancier.logo}
                alt={contract.leverancier.naam}
                width={64}
                height={64}
                className="object-contain w-full h-full"
              />
            </div>
          )}

          {/* Contract Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-brand-navy-500 text-sm md:text-base mb-1">
              {contract.contractNaam || `${contract.type === 'vast' ? 'Vast' : 'Dynamisch'} contract`}
            </h3>
            <p className="text-xs md:text-sm text-gray-600 mb-2">
              {contract.leverancier.naam}
            </p>

            {/* Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-1.5 mb-2">
                <Star className="w-3.5 h-3.5 text-yellow-400" weight="fill" />
                <span className="text-xs font-semibold text-gray-700">
                  {rating.toFixed(1)}
                </span>
                {reviews > 0 && (
                  <span className="text-xs text-gray-500">
                    ({reviews} {reviews === 1 ? 'review' : 'reviews'})
                  </span>
                )}
              </div>
            )}

            {/* Prominente prijsinformatie */}
            <div className="flex flex-col gap-1.5 mt-3">
              <div className="flex items-center gap-2">
                <CurrencyEur className="w-4 h-4 text-brand-teal-600" weight="bold" />
                <span className="text-base md:text-lg font-bold text-brand-navy-500">
                  €{berekening.maandbedrag.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/maand
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-teal-600" weight="bold" />
                <span className="text-sm md:text-base font-semibold text-gray-700">
                  €{berekening.jaarbedrag.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/jaar
                </span>
              </div>
              {berekening.besparing > 0 && (
                <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg px-2.5 py-1 mt-1 w-fit">
                  <CheckCircle className="w-3.5 h-3.5" weight="bold" />
                  <span className="text-xs font-semibold">
                    €{berekening.besparing.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} besparing/jaar
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Toggle Details Button */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex-shrink-0 text-brand-teal-600 hover:text-brand-teal-700 transition-colors flex items-center gap-1"
          >
            <span className="text-xs md:text-sm font-semibold hidden sm:inline">
              {showDetails ? 'Verberg details' : 'Bekijk details'}
            </span>
            <CaretDown
              className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${showDetails ? 'rotate-180' : ''}`}
              weight="bold"
            />
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="border-t border-gray-200 bg-gray-50 p-4 md:p-5 space-y-4">
          {/* Contractdetails */}
          <div>
            <h4 className="text-sm font-bold text-brand-navy-500 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" weight="bold" />
              Contractdetails
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Type:</span>
                <span className="ml-2 font-semibold text-brand-navy-500">
                  {getContractTypeLabel()}
                </span>
              </div>
              {contract.groeneEnergie && (
                <div>
                  <span className="text-gray-600">Energie:</span>
                  <span className="ml-2 font-semibold text-green-600 flex items-center gap-1">
                    <Leaf className="w-4 h-4" weight="bold" />
                    100% Groen
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Opzegtermijn:</span>
                <span className="ml-2 font-semibold text-brand-navy-500">
                  {contract.opzegtermijn} maand{contract.opzegtermijn !== 1 ? 'en' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Tarieven */}
          <div>
            <h4 className="text-sm font-bold text-brand-navy-500 mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4" weight="bold" />
              Tarieven
            </h4>
            <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 space-y-2 text-sm">
              {berekening.tarieven.elektriciteitEnkel && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-1.5">
                    <Lightning className="w-4 h-4 text-brand-teal-600" weight="bold" />
                    Elektriciteit (enkele meter):
                  </span>
                  <span className="font-semibold text-brand-navy-500">
                    €{berekening.tarieven.elektriciteitEnkel.toLocaleString('nl-NL', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}/kWh
                  </span>
                </div>
              )}
              {berekening.tarieven.elektriciteitNormaal && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-1.5">
                    <Lightning className="w-4 h-4 text-brand-teal-600" weight="bold" />
                    Elektriciteit normaal:
                  </span>
                  <span className="font-semibold text-brand-navy-500">
                    €{berekening.tarieven.elektriciteitNormaal.toLocaleString('nl-NL', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}/kWh
                  </span>
                </div>
              )}
              {berekening.tarieven.elektriciteitDal && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-1.5">
                    <Lightning className="w-4 h-4 text-brand-teal-600" weight="bold" />
                    Elektriciteit dal:
                  </span>
                  <span className="font-semibold text-brand-navy-500">
                    €{berekening.tarieven.elektriciteitDal.toLocaleString('nl-NL', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}/kWh
                  </span>
                </div>
              )}
              {berekening.tarieven.gas && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-500" weight="bold" />
                    Gas:
                  </span>
                  <span className="font-semibold text-brand-navy-500">
                    €{berekening.tarieven.gas.toLocaleString('nl-NL', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}/m³
                  </span>
                </div>
              )}
              {berekening.tarieven.teruglevering !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-yellow-500" weight="bold" />
                    Teruglevering:
                  </span>
                  <span className="font-semibold text-brand-navy-500">
                    €{berekening.tarieven.teruglevering.toLocaleString('nl-NL', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}/kWh
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-600">Vastrecht stroom:</span>
                <span className="font-semibold text-brand-navy-500">
                  €{berekening.tarieven.vastrechtStroom.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/maand
                </span>
              </div>
              {verbruik.gasJaar && verbruik.gasJaar > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Vastrecht gas:</span>
                  <span className="font-semibold text-brand-navy-500">
                    €{berekening.tarieven.vastrechtGas.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/maand
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Berekening */}
          <div>
            <h4 className="text-sm font-bold text-brand-navy-500 mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4" weight="bold" />
              Berekening (op basis van jouw verbruik)
            </h4>
            <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 space-y-2 text-sm">
              {/* Verbruik details */}
              {verbruik.heeftEnkeleMeter ? (
                <div className="text-gray-700">
                  <span className="font-semibold">Elektriciteit:</span> {(verbruik.elektriciteitNormaal || 0) + (verbruik.elektriciteitDal || 0)} kWh (enkele meter)
                </div>
              ) : (
                <>
                  {verbruik.elektriciteitNormaal && verbruik.elektriciteitNormaal > 0 && (
                    <div className="text-gray-700">
                      <span className="font-semibold">Elektriciteit normaal:</span> {verbruik.elektriciteitNormaal.toLocaleString('nl-NL')} kWh
                    </div>
                  )}
                  {verbruik.elektriciteitDal && verbruik.elektriciteitDal > 0 && (
                    <div className="text-gray-700">
                      <span className="font-semibold">Elektriciteit dal:</span> {verbruik.elektriciteitDal.toLocaleString('nl-NL')} kWh
                    </div>
                  )}
                </>
              )}
              {verbruik.gasJaar && verbruik.gasJaar > 0 && (
                <div className="text-gray-700">
                  <span className="font-semibold">Gas:</span> {verbruik.gasJaar.toLocaleString('nl-NL')} m³/jaar
                </div>
              )}
              {verbruik.terugleveringJaar && verbruik.terugleveringJaar > 0 && (
                <div className="text-gray-700">
                  <span className="font-semibold">Teruglevering:</span> {verbruik.terugleveringJaar.toLocaleString('nl-NL')} kWh/jaar
                </div>
              )}

              <div className="pt-3 border-t border-gray-200 space-y-1.5">
                <div className="flex justify-between text-gray-700">
                  <span>Leverancier:</span>
                  <span className="font-semibold">€{berekening.breakdown.leverancier.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/jaar</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Energiebelasting:</span>
                  <span className="font-semibold">€{berekening.breakdown.energiebelasting.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/jaar</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Netbeheerder:</span>
                  <span className="font-semibold">€{berekening.breakdown.netbeheer.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/jaar</span>
                </div>
                {isZakelijk && (
                  <div className="flex justify-between text-gray-700">
                    <span>BTW (21%):</span>
                    <span className="font-semibold">€{berekening.breakdown.btw.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/jaar</span>
                  </div>
                )}
                <div className="pt-2 border-t-2 border-brand-teal-500 flex justify-between font-bold text-brand-navy-500">
                  <span>Totaal {isZakelijk ? '(incl. BTW)' : '(incl. BTW)'}:</span>
                  <span>€{berekening.breakdown.totaalInclBtw.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/jaar</span>
                </div>
                <div className="text-xs text-gray-500 text-center pt-1">
                  (€{berekening.maandbedrag.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/maand)
                </div>
              </div>
            </div>
          </div>

          {/* Bijzonderheden */}
          {contract.bijzonderheden && contract.bijzonderheden.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-brand-navy-500 mb-2">Bijzonderheden</h4>
              <ul className="space-y-1.5">
                {contract.bijzonderheden.map((bijzonderheid, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-teal-600 flex-shrink-0 mt-0.5" weight="bold" />
                    <span>{bijzonderheid}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
