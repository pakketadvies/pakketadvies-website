'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { 
  CaretDown, 
  Star, 
  CheckCircle, 
  CurrencyEur, 
  ChartLine, 
  Leaf,
  Lightning,
  Flame,
  Calculator,
  Info
} from '@phosphor-icons/react'
import type { ContractOptie, VerbruikData } from '@/types/calculator'
import type { KostenBreakdown } from './ContractCard'

interface ContractDetailsCardProps {
  contract: ContractOptie | null
  verbruik?: VerbruikData | null
  addressType?: 'particulier' | 'zakelijk' | null
}

export function ContractDetailsCard({ contract, verbruik, addressType }: ContractDetailsCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [breakdown, setBreakdown] = useState<KostenBreakdown | null>(null)
  const [loadingBreakdown, setLoadingBreakdown] = useState(false)
  const [breakdownError, setBreakdownError] = useState<string | null>(null)

  // Haal breakdown op wanneer details worden uitgeklapt
  useEffect(() => {
    if (showDetails && !breakdown && !loadingBreakdown && verbruik && contract) {
      fetchBreakdown()
    }
  }, [showDetails, breakdown, loadingBreakdown, verbruik, contract])

  const fetchBreakdown = async () => {
    if (!verbruik || !contract) return

    setLoadingBreakdown(true)
    setBreakdownError(null)

    try {
      const leveringsadres = verbruik.leveringsadressen?.[0]
      if (!leveringsadres?.postcode) {
        setBreakdownError('Postcode ontbreekt')
        setLoadingBreakdown(false)
        return
      }

      // Haal contract details op
      const details = contract.type === 'vast' 
        ? (contract as any).details_vast 
        : (contract as any).details_dynamisch

      const response = await fetch('/api/energie/bereken-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Verbruik
          elektriciteitNormaal: verbruik.elektriciteitNormaal || 0,
          elektriciteitDal: verbruik.elektriciteitDal || 0,
          gas: verbruik.gasJaar || 0,
          terugleveringJaar: verbruik.terugleveringJaar || 0,
          
          // Aansluitwaarden
          aansluitwaardeElektriciteit: verbruik.aansluitwaarden?.elektriciteit || '3x25A',
          aansluitwaardeGas: verbruik.aansluitwaarden?.gas || 'G4',
          
          // Postcode
          postcode: leveringsadres.postcode.replace(/\s/g, ''),
          
          // Contract details
          contractType: contract.type,
          tariefElektriciteitNormaal: contract.tariefElektriciteit,
          tariefElektriciteitDal: contract.tariefElektriciteitDal,
          tariefElektriciteitEnkel: contract.tariefElektriciteitEnkel,
          tariefGas: contract.tariefGas,
          tariefTerugleveringKwh: details?.tarief_teruglevering_kwh || 0,
          // Dynamische contract opslagen
          opslagElektriciteit: details?.opslag_elektriciteit || 0,
          opslagGas: details?.opslag_gas || 0,
          opslagTeruglevering: details?.opslag_teruglevering || 0,
          vastrechtStroomMaand: details?.vastrecht_stroom_maand || 4.00,
          vastrechtGasMaand: details?.vastrecht_gas_maand || 4.00,
          heeftDubbeleMeter: !verbruik.heeftEnkeleMeter,
        }),
      })

      if (!response.ok) {
        throw new Error('Fout bij ophalen berekening')
      }

      const data = await response.json()
      setBreakdown(data.breakdown)
    } catch (error: any) {
      console.error('Error fetching breakdown:', error)
      setBreakdownError(error.message || 'Fout bij ophalen berekening')
    } finally {
      setLoadingBreakdown(false)
    }
  }

  if (!contract) return null

  const getContractTypeLabel = () => {
    if (contract.type === 'vast') {
      return contract.looptijd ? `Vast contract • ${contract.looptijd} jaar` : 'Vast contract'
    }
    return 'Dynamisch contract'
  }

  const besparing = contract.besparing ? contract.besparing * 12 : null // Jaarlijkse besparing
  const rating = contract.rating || 0
  const reviews = contract.aantalReviews || 0
  const isZakelijk = addressType === 'zakelijk'

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return `€${amount.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Haal contract details op voor tarieven
  const details = contract.type === 'vast' 
    ? (contract as any).details_vast 
    : (contract as any).details_dynamisch

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
              <div className="flex items-center gap-1.5 mb-3">
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
            <div className="space-y-2 mb-3">
              {/* Maandbedrag */}
              {contract.maandbedrag > 0 && (
                <div className="flex items-center gap-2">
                  <CurrencyEur className="w-4 h-4 text-brand-teal-600" weight="bold" />
                  <span className="text-base md:text-lg font-bold text-brand-navy-500">
                    {formatCurrency(contract.maandbedrag)}/maand
                  </span>
                  {isZakelijk && (
                    <span className="text-xs text-gray-500">(excl. BTW)</span>
                  )}
                </div>
              )}

              {/* Jaarbedrag */}
              {contract.jaarbedrag > 0 && (
                <div className="flex items-center gap-2">
                  <ChartLine className="w-4 h-4 text-brand-teal-600" weight="bold" />
                  <span className="text-sm md:text-base font-semibold text-gray-700">
                    {formatCurrency(contract.jaarbedrag)}/jaar
                  </span>
                  {isZakelijk && (
                    <span className="text-xs text-gray-500">(excl. BTW)</span>
                  )}
                </div>
              )}

              {/* Besparing */}
              {besparing && besparing > 0 && (
                <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg px-2.5 py-1 mt-1">
                  <CheckCircle className="w-3.5 h-3.5" weight="bold" />
                  <span className="text-xs font-semibold">
                    €{besparing.toLocaleString('nl-NL')} besparing/jaar
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
        <div className="border-t border-gray-200 bg-gray-50 p-4 md:p-5 space-y-4 md:space-y-5">
          {/* Contractdetails */}
          <div>
            <h4 className="text-sm md:text-base font-bold text-brand-navy-500 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 md:w-5 md:h-5" weight="bold" />
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
                    <Leaf className="w-3.5 h-3.5" weight="bold" />
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
          {details && (
            <div>
              <h4 className="text-sm md:text-base font-bold text-brand-navy-500 mb-3 flex items-center gap-2">
                <Calculator className="w-4 h-4 md:w-5 md:h-5" weight="bold" />
                Tarieven
              </h4>
              <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 space-y-2 md:space-y-3">
                {/* Voor vast contract: toon tarieven */}
                {contract.type === 'vast' && (
                  <>
                    {details.tarief_elektriciteit_enkel && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Lightning className="w-4 h-4 text-brand-teal-600" weight="bold" />
                          <span className="text-gray-700">Elektriciteit (enkel tarief):</span>
                        </div>
                        <span className="font-semibold text-brand-navy-500">
                          €{details.tarief_elektriciteit_enkel.toLocaleString('nl-NL', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}/kWh
                        </span>
                      </div>
                    )}
                    {details.tarief_elektriciteit_normaal && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Lightning className="w-4 h-4 text-brand-teal-600" weight="bold" />
                          <span className="text-gray-700">Elektriciteit normaal:</span>
                        </div>
                        <span className="font-semibold text-brand-navy-500">
                          €{details.tarief_elektriciteit_normaal.toLocaleString('nl-NL', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}/kWh
                        </span>
                      </div>
                    )}
                    {details.tarief_elektriciteit_dal && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Lightning className="w-4 h-4 text-brand-teal-600" weight="bold" />
                          <span className="text-gray-700">Elektriciteit dal:</span>
                        </div>
                        <span className="font-semibold text-brand-navy-500">
                          €{details.tarief_elektriciteit_dal.toLocaleString('nl-NL', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}/kWh
                        </span>
                      </div>
                    )}
                    {details.tarief_gas && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-orange-500" weight="bold" />
                          <span className="text-gray-700">Gas:</span>
                        </div>
                        <span className="font-semibold text-brand-navy-500">
                          €{details.tarief_gas.toLocaleString('nl-NL', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}/m³
                        </span>
                      </div>
                    )}
                    {details.tarief_teruglevering_kwh !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Lightning className="w-4 h-4 text-yellow-500" weight="bold" />
                          <span className="text-gray-700">Teruglevering:</span>
                        </div>
                        <span className="font-semibold text-brand-navy-500">
                          €{details.tarief_teruglevering_kwh.toLocaleString('nl-NL', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}/kWh
                        </span>
                      </div>
                    )}
                  </>
                )}
                
                {/* Voor dynamisch contract: toon opslagen */}
                {contract.type === 'dynamisch' && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Lightning className="w-4 h-4 text-brand-teal-600" weight="bold" />
                        <span className="text-gray-700">Opslag elektriciteit:</span>
                      </div>
                      <span className="font-semibold text-brand-navy-500">
                        €{details.opslag_elektriciteit?.toLocaleString('nl-NL', { minimumFractionDigits: 4, maximumFractionDigits: 4 }) || '0,0000'}/kWh
                      </span>
                    </div>
                    {details.opslag_gas && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-orange-500" weight="bold" />
                          <span className="text-gray-700">Opslag gas:</span>
                        </div>
                        <span className="font-semibold text-brand-navy-500">
                          €{details.opslag_gas.toLocaleString('nl-NL', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}/m³
                        </span>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 italic pt-1">
                      * Tarieven = spotprijs + opslag (variabel per uur/dag)
                    </div>
                  </>
                )}
                
                {/* Vastrechten (voor beide types) */}
                <div className="pt-2 border-t border-gray-200 space-y-2">
                  {details.vastrecht_stroom_maand && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Vastrecht stroom:</span>
                      <span className="font-semibold text-brand-navy-500">
                        €{details.vastrecht_stroom_maand.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/maand
                      </span>
                    </div>
                  )}
                  {details.vastrecht_gas_maand && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Vastrecht gas:</span>
                      <span className="font-semibold text-brand-navy-500">
                        €{details.vastrecht_gas_maand.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/maand
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Berekening */}
          {loadingBreakdown && (
            <div className="text-center py-4">
              <div className="inline-block w-6 h-6 border-2 border-brand-teal-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-600 mt-2">Berekening wordt opgehaald...</p>
            </div>
          )}

          {breakdownError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{breakdownError}</p>
            </div>
          )}

          {breakdown && !loadingBreakdown && (
            <div>
              <h4 className="text-sm md:text-base font-bold text-brand-navy-500 mb-3 flex items-center gap-2">
                <Calculator className="w-4 h-4 md:w-5 md:h-5" weight="bold" />
                Berekening (op basis van jouw verbruik)
              </h4>
              <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 space-y-3">
                {/* Leverancier kosten */}
                <div>
                  <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Leverancier</h5>
                  <div className="space-y-1.5 text-sm">
                    {breakdown.leverancier.elektriciteitDetails && (
                      <>
                        {breakdown.leverancier.elektriciteitDetails.enkel && (
                          <div className="flex justify-between">
                            <span className="text-gray-700">
                              Elektriciteit: {breakdown.leverancier.elektriciteitDetails.enkel.kwh.toLocaleString('nl-NL')} kWh × €{breakdown.leverancier.elektriciteitDetails.enkel.tarief.toLocaleString('nl-NL', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                            </span>
                            <span className="font-semibold text-brand-navy-500">
                              {formatCurrency(breakdown.leverancier.elektriciteitDetails.enkel.bedrag)}
                            </span>
                          </div>
                        )}
                        {breakdown.leverancier.elektriciteitDetails.normaal && (
                          <div className="flex justify-between">
                            <span className="text-gray-700">
                              Elektriciteit normaal: {breakdown.leverancier.elektriciteitDetails.normaal.kwh.toLocaleString('nl-NL')} kWh × €{breakdown.leverancier.elektriciteitDetails.normaal.tarief.toLocaleString('nl-NL', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                            </span>
                            <span className="font-semibold text-brand-navy-500">
                              {formatCurrency(breakdown.leverancier.elektriciteitDetails.normaal.bedrag)}
                            </span>
                          </div>
                        )}
                        {breakdown.leverancier.elektriciteitDetails.dal && (
                          <div className="flex justify-between">
                            <span className="text-gray-700">
                              Elektriciteit dal: {breakdown.leverancier.elektriciteitDetails.dal.kwh.toLocaleString('nl-NL')} kWh × €{breakdown.leverancier.elektriciteitDetails.dal.tarief.toLocaleString('nl-NL', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                            </span>
                            <span className="font-semibold text-brand-navy-500">
                              {formatCurrency(breakdown.leverancier.elektriciteitDetails.dal.bedrag)}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    {breakdown.leverancier.gasDetails && (
                      <div className="flex justify-between">
                        <span className="text-gray-700">
                          Gas: {breakdown.leverancier.gasDetails.m3.toLocaleString('nl-NL')} m³ × €{breakdown.leverancier.gasDetails.tarief.toLocaleString('nl-NL', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                        </span>
                        <span className="font-semibold text-brand-navy-500">
                          {formatCurrency(breakdown.leverancier.gasDetails.bedrag)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-700">Vastrecht:</span>
                      <span className="font-semibold text-brand-navy-500">
                        {formatCurrency(breakdown.leverancier.vastrecht)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                      <span className="text-brand-navy-500">Subtotaal leverancier:</span>
                      <span className="text-brand-navy-500">
                        {formatCurrency(breakdown.leverancier.subtotaal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Netbeheer */}
                <div>
                  <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Netbeheer</h5>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Netbeheerder: {breakdown.netbeheer.netbeheerder}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                      <span className="text-brand-navy-500">Subtotaal netbeheer:</span>
                      <span className="text-brand-navy-500">
                        {formatCurrency(breakdown.netbeheer.subtotaal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Energiebelasting */}
                <div>
                  <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Energiebelasting</h5>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                      <span className="text-brand-navy-500">Subtotaal energiebelasting:</span>
                      <span className="text-brand-navy-500">
                        {formatCurrency(breakdown.energiebelasting.subtotaal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Totaal */}
                <div className="bg-brand-teal-50 rounded-lg p-3 md:p-4 border-2 border-brand-teal-200 mt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-base md:text-lg font-bold text-brand-navy-500">
                      Totaal per jaar {isZakelijk ? '(excl. BTW)' : '(incl. BTW)'}:
                    </span>
                    <span className="text-xl md:text-2xl font-bold text-brand-teal-600">
                      {formatCurrency(
                        isZakelijk 
                          ? breakdown.totaal.jaarExclBtw 
                          : (breakdown.totaal.jaarInclBtw ?? breakdown.totaal.jaarExclBtw)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Totaal per maand {isZakelijk ? '(excl. BTW)' : '(incl. BTW)'}:
                    </span>
                    <span className="text-lg font-semibold text-brand-navy-500">
                      {formatCurrency(
                        isZakelijk 
                          ? breakdown.totaal.maandExclBtw 
                          : (breakdown.totaal.maandInclBtw ?? breakdown.totaal.maandExclBtw)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bijzonderheden */}
          {contract.bijzonderheden && contract.bijzonderheden.length > 0 && (
            <div>
              <h4 className="text-sm md:text-base font-bold text-brand-navy-500 mb-3">Bijzonderheden</h4>
              <ul className="space-y-2">
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
