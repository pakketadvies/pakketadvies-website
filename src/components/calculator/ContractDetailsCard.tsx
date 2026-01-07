'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { CaretDown, Star, CheckCircle, CurrencyEur, ChartBar, Leaf, Info } from '@phosphor-icons/react'
import type { ContractOptie } from '@/types/calculator'
import { useCalculatorStore } from '@/store/calculatorStore'
import { debugLogger } from '@/lib/debug-logger'

interface ContractDetailsCardProps {
  contract: ContractOptie | null
}

export function ContractDetailsCard({ contract }: ContractDetailsCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [breakdown, setBreakdown] = useState<any>(null)
  const [loadingBreakdown, setLoadingBreakdown] = useState(false)
  const { verbruik } = useCalculatorStore()

  // 📱 DEBUG: Log component mount op mobiel
  useEffect(() => {
    debugLogger.info('ContractDetailsCard - Component mounted', {
      hasContract: !!contract,
      contractId: contract?.id,
      contractNaam: contract?.contractNaam,
      maandbedrag: contract?.maandbedrag,
      jaarbedrag: contract?.jaarbedrag,
      besparing: contract?.besparing,
      hasBreakdown: !!(contract as any)?.breakdown,
    })
  }, [])

  if (!contract) {
    debugLogger.warn('ContractDetailsCard - No contract provided')
    return null
  }

  const getContractTypeLabel = () => {
    if (contract.type === 'vast') {
      return contract.looptijd ? `Vast contract • ${contract.looptijd} jaar` : 'Vast contract'
    }
    return 'Dynamisch contract'
  }

  const besparing = contract.besparing ? contract.besparing * 12 : null // Jaarlijkse besparing
  const rating = contract.rating || 0
  const reviews = contract.aantalReviews || 0

  // 📱 DEBUG: Log berekende waardes
  useEffect(() => {
    debugLogger.info('ContractDetailsCard - Calculated values', {
      besparing,
      rating,
      reviews,
      contractType: contract.type,
    })
  }, [besparing, rating, reviews, contract.type])

  // Haal contract details op voor tarieven
  const details = contract.type === 'vast' 
    ? (contract as any).details_vast 
    : (contract as any).details_dynamisch

  // 📱 DEBUG: Log details om te zien wat erin zit
  useEffect(() => {
    debugLogger.info('ContractDetailsCard - Contract details', {
      contractType: contract.type,
      hasDetails: !!details,
      hasDetailsVast: !!(contract as any).details_vast,
      hasDetailsDynamisch: !!(contract as any).details_dynamisch,
      detailsObject: details,
      opslag_elektriciteit: details?.opslag_elektriciteit,
      opslag_elektriciteit_normaal: details?.opslag_elektriciteit_normaal,
      opslag_gas: details?.opslag_gas,
      opslag_teruglevering: details?.opslag_teruglevering,
      fullContract: contract,
    })
  }, [contract.type, details])

  // Check of het contract al een breakdown heeft (van de resultatenpagina)
  // Als dat zo is, gebruik die in plaats van opnieuw berekenen
  useEffect(() => {
    if (showDetails && !breakdown && !loadingBreakdown) {
      // 📱 DEBUG: Log breakdown check
      debugLogger.info('ContractDetailsCard - Breakdown check', {
        showDetails,
        hasBreakdown: !!breakdown,
        hasContractBreakdown: !!(contract as any).breakdown,
        loadingBreakdown,
        hasVerbruik: !!verbruik,
      })

      // Als het contract al een breakdown heeft, gebruik die direct
      if ((contract as any).breakdown) {
        debugLogger.info('ContractDetailsCard - Using existing breakdown from contract')
        setBreakdown((contract as any).breakdown)
        return
      }
      
      // Anders: haal breakdown op via API (fallback voor oude/cached contracten)
      if (verbruik) {
        setLoadingBreakdown(true)
        debugLogger.info('ContractDetailsCard - Fetching breakdown from API')
        
        const fetchBreakdown = async () => {
          try {
            const payload = {
              // Verbruik
              elektriciteitNormaal: verbruik.elektriciteitNormaal || 0,
              elektriciteitDal: verbruik.elektriciteitDal || 0,
              gas: verbruik.gasJaar || 0,
              terugleveringJaar: verbruik.terugleveringJaar || 0,
              
              // Aansluitwaarden
              aansluitwaardeElektriciteit: verbruik.aansluitwaardeElektriciteit || '1x25A',
              aansluitwaardeGas: verbruik.aansluitwaardeGas || 'G4',
              
              // Postcode
              postcode: verbruik.leveringsadressen?.[0]?.postcode?.replace(/\s/g, '') || '',
              
              // Contract details
              contractType: contract.type,
              tariefElektriciteitNormaal: contract.tariefElektriciteit,
              tariefElektriciteitDal: contract.tariefElektriciteitDal,
              tariefElektriciteitEnkel: contract.tariefElektriciteitEnkel,
              tariefGas: contract.tariefGas,
              tariefTerugleveringKwh: details?.tarief_teruglevering_kwh || 0,
              // Dynamische contract opslagen
              opslagElektriciteit: details?.opslag_elektriciteit || details?.opslag_elektriciteit_normaal || 0,
              opslagGas: details?.opslag_gas || 0,
              opslagTeruglevering: details?.opslag_teruglevering || 0,
              vastrechtStroomMaand: details?.vastrecht_stroom_maand || 4.00,
              vastrechtGasMaand: details?.vastrecht_gas_maand || 4.00,
              heeftDubbeleMeter: !verbruik.heeftEnkeleMeter,
            }

            debugLogger.info('ContractDetailsCard - API request payload', payload)

            const response = await fetch('/api/energie/bereken-contract', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })

            debugLogger.info('ContractDetailsCard - API response', {
              ok: response.ok,
              status: response.status,
              statusText: response.statusText,
            })

            if (response.ok) {
              const data = await response.json()
              debugLogger.info('ContractDetailsCard - API response data received', {
                hasBreakdown: !!data.breakdown,
                breakdownKeys: data.breakdown ? Object.keys(data.breakdown) : [],
              })
              setBreakdown(data.breakdown)
            } else {
              const errorText = await response.text()
              debugLogger.error('ContractDetailsCard - API error response', {
                status: response.status,
                errorText,
              })
            }
          } catch (error: any) {
            debugLogger.error('ContractDetailsCard - Fetch error', {
              error: error.message,
              stack: error.stack,
            })
            console.error('Error fetching breakdown:', error)
          } finally {
            setLoadingBreakdown(false)
            debugLogger.info('ContractDetailsCard - Fetch complete')
          }
        }

        fetchBreakdown()
      } else {
        debugLogger.warn('ContractDetailsCard - No verbruik data available')
      }
    }
  }, [showDetails, breakdown, loadingBreakdown, contract, verbruik, details])

  // Format currency helper
  // contract.maandbedrag en contract.jaarbedrag zijn AL correct (incl. BTW voor particulier, excl. BTW voor zakelijk)
  // breakdown items zijn excl. BTW, dus daar moeten we wel BTW toevoegen voor particulier
  const formatCurrency = (amount: number, isBreakdownItem: boolean = false) => {
    // Voor breakdown items: voeg BTW toe voor particulier
    if (isBreakdownItem && !isZakelijk) {
      amount = amount * 1.21
    }
    return `€${amount.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  
  // Format tariff helper (voor tarieven zoals €/kWh, €/m³)
  // Tarieven in database zijn excl. BTW, dus voor particulier moeten we BTW toevoegen
  const formatTariff = (tariff: number, decimals: number = 6) => {
    const adjustedTariff = isZakelijk ? tariff : tariff * 1.21
    return `€${adjustedTariff.toFixed(decimals)}`
  }

  // Bepaal of zakelijk of particulier (voor BTW indicatie)
  const isZakelijk = verbruik?.addressType === 'zakelijk'

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
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-3">
              {/* Maandbedrag */}
              {contract.maandbedrag > 0 && (
                <div className="flex items-center gap-1.5 bg-brand-teal-50 text-brand-teal-700 border border-brand-teal-200 rounded-lg px-3 py-1.5">
                  <CurrencyEur className="w-4 h-4" weight="bold" />
                  <span className="text-sm md:text-base font-bold">
                    {formatCurrency(contract.maandbedrag)}/maand
                  </span>
                </div>
              )}

              {/* Jaarbedrag */}
              {contract.jaarbedrag > 0 && (
                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5">
                  <ChartBar className="w-4 h-4" weight="bold" />
                  <span className="text-sm md:text-base font-bold">
                    {formatCurrency(contract.jaarbedrag)}/jaar
                  </span>
              </div>
            )}

            {/* Besparing */}
            {besparing && besparing > 0 && (
                <div className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg px-3 py-1.5">
                  <CheckCircle className="w-4 h-4" weight="bold" />
                  <span className="text-sm md:text-base font-bold">
                    {formatCurrency(besparing)} besparing/jaar
                </span>
              </div>
            )}
            </div>

            {/* 📱 DEBUG: Log waarom labels niet renderen */}
            {(() => {
              const debugInfo = {
                maandbedrag: contract.maandbedrag,
                maandbedragGreaterThanZero: contract.maandbedrag > 0,
                jaarbedrag: contract.jaarbedrag,
                jaarbedragGreaterThanZero: contract.jaarbedrag > 0,
                besparing,
                besparingExists: !!besparing,
                besparingGreaterThanZero: besparing && besparing > 0,
              }
              debugLogger.info('ContractDetailsCard - Rendering price badges', debugInfo)
              return null
            })()}
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
            {/* Contract Type */}
            <div>
              <span className="text-gray-600">Type:</span>
              <span className="ml-2 font-semibold text-brand-navy-500">
                {getContractTypeLabel()}
              </span>
            </div>

            {/* Groene Energie */}
            {contract.groeneEnergie && (
              <div>
                <span className="text-gray-600">Energie:</span>
                  <span className="ml-2 font-semibold text-green-600 flex items-center gap-1">
                    <Leaf className="w-4 h-4" weight="bold" />
                  100% Groen
                </span>
              </div>
            )}

            {/* Opzegtermijn */}
            <div>
              <span className="text-gray-600">Opzegtermijn:</span>
              <span className="ml-2 font-semibold text-brand-navy-500">
                {contract.opzegtermijn} maand{contract.opzegtermijn !== 1 ? 'en' : ''}
              </span>
            </div>

              {/* Maandbedrag (ook hier voor volledigheid) */}
            {contract.maandbedrag > 0 && (
              <div>
                <span className="text-gray-600">Maandbedrag:</span>
                <span className="ml-2 font-semibold text-brand-navy-500">
                    {formatCurrency(contract.maandbedrag)}
                  </span>
                  {isZakelijk && <span className="text-xs text-gray-500 ml-1">(excl. BTW)</span>}
                  {!isZakelijk && <span className="text-xs text-gray-500 ml-1">(incl. BTW)</span>}
                </div>
              )}
            </div>
          </div>

          {/* Tarieven */}
          <div>
            <h4 className="text-sm md:text-base font-bold text-brand-navy-500 mb-3 flex items-center gap-2">
              <CurrencyEur className="w-4 h-4 md:w-5 md:h-5" weight="bold" />
              Tarieven
            </h4>
            <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 space-y-2">
              {/* Vast contract: normale tarieven */}
              {contract.type === 'vast' && (
                <>
                  {/* Elektriciteit tarieven */}
                  {contract.tariefElektriciteitEnkel && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Elektriciteit enkeltarief:</span>
                      <span className="font-semibold text-brand-navy-500">
                        {formatTariff(contract.tariefElektriciteitEnkel)}/kWh
                      </span>
                    </div>
                  )}
                  {contract.tariefElektriciteit && !contract.tariefElektriciteitEnkel && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Elektriciteit normaal:</span>
                      <span className="font-semibold text-brand-navy-500">
                        {formatTariff(contract.tariefElektriciteit)}/kWh
                      </span>
                    </div>
                  )}
                  {contract.tariefElektriciteitDal && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Elektriciteit dal:</span>
                      <span className="font-semibold text-brand-navy-500">
                        {formatTariff(contract.tariefElektriciteitDal)}/kWh
                      </span>
                    </div>
                  )}

                  {/* Gas tarief */}
                  {contract.tariefGas && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Gas:</span>
                      <span className="font-semibold text-brand-navy-500">
                        {formatTariff(contract.tariefGas)}/m³
                      </span>
                    </div>
                  )}

                  {/* Teruglevering tarief */}
                  {details?.tarief_teruglevering_kwh && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Teruglevering:</span>
                      <span className="font-semibold text-brand-navy-500">
                        {formatTariff(details.tarief_teruglevering_kwh)}/kWh
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* Dynamisch contract: opslagen bovenop spotprijs */}
              {contract.type === 'dynamisch' && details && (
                <>
                  <p className="text-xs font-semibold text-gray-500 mb-2">Opslagen bovenop spotprijs:</p>
                  {/* Opslag elektriciteit - toon altijd als het bestaat (ook als 0) */}
                  {(details.opslag_elektriciteit !== undefined && details.opslag_elektriciteit !== null) || 
                   (details.opslag_elektriciteit_normaal !== undefined && details.opslag_elektriciteit_normaal !== null) ? (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Opslag elektriciteit:</span>
                      <span className="font-semibold text-brand-navy-500">
                        {formatTariff(details.opslag_elektriciteit ?? details.opslag_elektriciteit_normaal ?? 0)}/kWh
                      </span>
                    </div>
                  ) : null}
                  {/* Opslag gas - toon altijd als het bestaat (ook als 0) */}
                  {details.opslag_gas !== undefined && details.opslag_gas !== null ? (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Opslag gas:</span>
                      <span className="font-semibold text-brand-navy-500">
                        {formatTariff(details.opslag_gas)}/m³
                      </span>
                    </div>
                  ) : null}
                  {/* Opslag teruglevering - toon altijd als het bestaat (ook als 0) */}
                  {details.opslag_teruglevering !== undefined && details.opslag_teruglevering !== null ? (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Opslag teruglevering:</span>
                      <span className="font-semibold text-brand-navy-500">
                        {formatTariff(details.opslag_teruglevering)}/kWh
                      </span>
                    </div>
                  ) : null}
                </>
              )}

              {/* Vastrechten */}
              {(details?.vastrecht_stroom_maand || details?.vastrecht_gas_maand) && (
                <div className="pt-2 border-t border-gray-200 mt-2">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Vaste kosten per maand:</p>
                  {details.vastrecht_stroom_maand && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Vastrecht stroom:</span>
                      <span className="font-semibold text-brand-navy-500">
                        {formatCurrency(details.vastrecht_stroom_maand, true)}/maand
                      </span>
                    </div>
                  )}
                  {details.vastrecht_gas_maand && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Vastrecht gas:</span>
                      <span className="font-semibold text-brand-navy-500">
                        {formatCurrency(details.vastrecht_gas_maand, true)}/maand
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Berekening Breakdown */}
          {loadingBreakdown && (
            <div className="text-center py-4">
              <div className="inline-block w-6 h-6 border-2 border-brand-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600 mt-2">Berekening laden...</p>
            </div>
          )}

          {breakdown && !loadingBreakdown && (
            <div>
              <h4 className="text-sm md:text-base font-bold text-brand-navy-500 mb-3 flex items-center gap-2">
                <ChartBar className="w-4 h-4 md:w-5 md:h-5" weight="bold" />
                Berekening (op basis van jouw verbruik)
              </h4>
              <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 space-y-3">
                {/* Elektriciteit */}
                {verbruik && (verbruik.elektriciteitNormaal > 0 || (verbruik.elektriciteitDal && verbruik.elektriciteitDal > 0)) && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Elektriciteit</p>
                    <div className="space-y-1.5">
                      {breakdown.leverancier.elektriciteitDetails?.type === 'dubbel' && (
                        <>
                          {breakdown.leverancier.elektriciteitDetails.normaal && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">
                                Leveringskosten normaal
                                <span className="text-xs text-gray-500 ml-1">
                                  ({((breakdown.leverancier.elektriciteitDetails.normaal as any)?.nettoKwh ?? breakdown.leverancier.elektriciteitDetails.normaal?.kwh ?? 0).toLocaleString()} kWh × {formatTariff(breakdown.leverancier.elektriciteitDetails.normaal?.tarief)})
                                </span>
                              </span>
                              <span className="font-semibold text-brand-navy-500">
                                {formatCurrency(breakdown.leverancier.elektriciteitDetails.normaal?.bedrag || 0, true)}
                              </span>
                            </div>
                          )}
                          {breakdown.leverancier.elektriciteitDetails.dal && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">
                                Leveringskosten dal
                                <span className="text-xs text-gray-500 ml-1">
                                  ({((breakdown.leverancier.elektriciteitDetails.dal as any)?.nettoKwh ?? breakdown.leverancier.elektriciteitDetails.dal?.kwh ?? 0).toLocaleString()} kWh × {formatTariff(breakdown.leverancier.elektriciteitDetails.dal?.tarief)})
                                </span>
                              </span>
                              <span className="font-semibold text-brand-navy-500">
                                {formatCurrency(breakdown.leverancier.elektriciteitDetails.dal?.bedrag || 0, true)}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      {breakdown.leverancier.elektriciteitDetails?.type === 'enkel' && breakdown.leverancier.elektriciteitDetails.enkel && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">
                            Leveringskosten enkeltarief
                            <span className="text-xs text-gray-500 ml-1">
                              ({((breakdown.leverancier.elektriciteitDetails.enkel as any)?.nettoKwh ?? breakdown.leverancier.elektriciteitDetails.enkel?.kwh ?? 0).toLocaleString()} kWh × {formatTariff(breakdown.leverancier.elektriciteitDetails.enkel?.tarief)})
                            </span>
                          </span>
                          <span className="font-semibold text-brand-navy-500">
                            {formatCurrency(breakdown.leverancier.elektriciteitDetails.enkel?.bedrag || 0, true)}
                          </span>
                        </div>
                      )}
                      {!breakdown.leverancier.elektriciteitDetails && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">
                            Leveringskosten stroom
                            <span className="text-xs text-gray-500 ml-1">
                              ({(verbruik.elektriciteitNormaal + (verbruik.elektriciteitDal ?? 0)).toLocaleString()} kWh)
                            </span>
                          </span>
                          <span className="font-semibold text-brand-navy-500">
                            {formatCurrency(breakdown.leverancier.elektriciteit || 0, true)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Energiebelasting</span>
                        <span className="font-semibold text-brand-navy-500">
                          {formatCurrency(breakdown.energiebelasting.elektriciteit || 0, true)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Vastrecht stroom</span>
                        <span className="font-semibold text-brand-navy-500">
                          {formatCurrency(breakdown.leverancier.vastrechtStroom || 0, true)}
                        </span>
                      </div>
                      {breakdown.netbeheer && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">
                            Netbeheerkosten
                            {breakdown.netbeheer.netbeheerder && (
                              <span className="text-xs text-gray-500 ml-1">({breakdown.netbeheer.netbeheerder})</span>
                            )}
                          </span>
                          <span className="font-semibold text-brand-navy-500">
                            {formatCurrency(breakdown.netbeheer.elektriciteit || 0, true)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Gas */}
                {verbruik && verbruik.gasJaar !== null && verbruik.gasJaar > 0 && breakdown.leverancier.gas !== undefined && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Gas</p>
                    <div className="space-y-1.5">
                      {breakdown.leverancier.gasDetails && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">
                            Leveringskosten gas
                            <span className="text-xs text-gray-500 ml-1">
                              ({breakdown.leverancier.gasDetails.m3.toLocaleString()} m³ × {formatTariff(breakdown.leverancier.gasDetails.tarief)})
                            </span>
                          </span>
                          <span className="font-semibold text-brand-navy-500">
                            {formatCurrency(breakdown.leverancier.gasDetails.bedrag || 0, true)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Energiebelasting</span>
                        <span className="font-semibold text-brand-navy-500">
                          {formatCurrency(breakdown.energiebelasting.gas || 0, true)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Vastrecht gas</span>
                        <span className="font-semibold text-brand-navy-500">
                          {formatCurrency(breakdown.leverancier.vastrechtGas || 0, true)}
                        </span>
                      </div>
                      {breakdown.netbeheer && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">
                            Netbeheerkosten
                            {breakdown.netbeheer.netbeheerder && (
                              <span className="text-xs text-gray-500 ml-1">({breakdown.netbeheer.netbeheerder})</span>
                            )}
                          </span>
                          <span className="font-semibold text-brand-navy-500">
                            {formatCurrency(breakdown.netbeheer.gas || 0, true)}
                </span>
              </div>
            )}
          </div>
                  </div>
                )}

                {/* Totaal */}
                {breakdown.totaal && (
                  <div className="pt-3 border-t-2 border-brand-teal-200 bg-brand-teal-50 rounded-lg p-3 mt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-base font-bold text-brand-navy-500">
                        Totaal per jaar {isZakelijk ? '(excl. BTW)' : '(incl. BTW)'}:
                      </span>
                      <span className="text-lg font-bold text-brand-teal-600">
                        {formatCurrency(isZakelijk ? breakdown.totaal.jaarExclBtw : (breakdown.totaal.jaarInclBtw ?? breakdown.totaal.jaarExclBtw), false)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Totaal per maand {isZakelijk ? '(excl. BTW)' : '(incl. BTW)'}:
                      </span>
                      <span className="text-base font-semibold text-brand-navy-500">
                        {formatCurrency(isZakelijk ? breakdown.totaal.maandExclBtw : (breakdown.totaal.maandInclBtw ?? breakdown.totaal.maandExclBtw), false)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bijzonderheden */}
          {contract.bijzonderheden && contract.bijzonderheden.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Bijzonderheden:
              </span>
              <ul className="mt-1.5 space-y-1">
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
