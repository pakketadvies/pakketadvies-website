'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Check, Star, Leaf, CaretDown, CaretUp, Sun, Info, FilePdf, FileText } from '@phosphor-icons/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCalculatorStore } from '@/store/calculatorStore'
import type { ContractOptie } from '@/types/calculator'
import Tooltip from '@/components/ui/Tooltip'
import { getFriendlyDocumentUrl } from '@/lib/document-url'
import { isGrootverbruikElektriciteitAansluitwaarde, isGrootverbruikGasAansluitwaarde } from '@/lib/verbruik-type'
import { useFacebookPixel } from '@/lib/tracking/useFacebookPixel'

interface ContractCardProps {
  contract: ContractOptie
  meterType: 'slim' | 'oud' | 'weet_niet' | 'enkel'
  heeftEnkeleMeter: boolean
  // Verbruik voor kostenbreakdown
  verbruikElektriciteitNormaal: number
  verbruikElektriciteitDal: number
  verbruikGas: number
  terugleveringJaar?: number // NIEUW: voor saldering
  // Aansluitwaarden
  aansluitwaardeElektriciteit: string
  aansluitwaardeGas: string
  // Postcode (voor netbeheerder)
  postcode: string
  // Position number (1-based index)
  position?: number
}

export interface KostenBreakdown {
  leverancier: {
    elektriciteit: number
    elektriciteitDetails?: {
      type: 'enkel' | 'dubbel'
      enkel?: { kwh: number; tarief: number; bedrag: number }
      normaal?: { kwh: number; tarief: number; bedrag: number }
      dal?: { kwh: number; tarief: number; bedrag: number }
    }
    gas: number
    gasDetails?: {
      m3: number
      tarief: number
      bedrag: number
    } | null
    teruglevering?: number // NIEUW
    terugleveringDetails?: { // NIEUW
      kwh: number
      tarief: number
      bedrag: number
    } | null
    overschotKwh?: number // NIEUW: overschot teruglevering (alleen dynamisch)
    opbrengstOverschot?: number // NIEUW: opbrengst van overschot (alleen dynamisch)
    vastrechtStroom: number
    vastrechtGas: number
    vastrecht: number
    subtotaal: number
  }
  energiebelasting: {
    elektriciteit: number
    gas: number
    vermindering: number
    subtotaal: number
    staffels?: {
      schijf1?: { kwh: number; tarief: number; bedrag: number }
      schijf2?: { kwh: number; tarief: number; bedrag: number }
      schijf3?: { kwh: number; tarief: number; bedrag: number }
      schijf4?: { kwh: number; tarief: number; bedrag: number }
    }
  }
  netbeheer: {
    elektriciteit: number
    gas: number
    subtotaal: number
    netbeheerder: string
  }
  totaal: {
    jaarExclBtw: number
    maandExclBtw: number
    jaarInclBtw?: number
    maandInclBtw?: number
  }
}

export default function ContractCard({ 
  contract, 
  meterType, 
  heeftEnkeleMeter,
  verbruikElektriciteitNormaal,
  verbruikElektriciteitDal,
  verbruikGas,
  terugleveringJaar,
  aansluitwaardeElektriciteit,
  aansluitwaardeGas,
  postcode,
  position
}: ContractCardProps) {
  const { track } = useFacebookPixel()
  const router = useRouter()
  const { setSelectedContract } = useCalculatorStore()
  const [openAccordion, setOpenAccordion] = useState<'prijsdetails' | 'voorwaarden' | 'over' | null>(null)
  const [breakdown, setBreakdown] = useState<KostenBreakdown | null>(contract.breakdown || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleAccordion = (section: 'prijsdetails' | 'voorwaarden' | 'over') => {
    setOpenAccordion(openAccordion === section ? null : section)
  }

  // Bepaal welke tarieven te tonen op basis van metertype
  const toonEnkeltarief = heeftEnkeleMeter || meterType === 'weet_niet'
  const toonDubbelTarief = !heeftEnkeleMeter || meterType === 'weet_niet'

  // Haal contract details op
  const details = contract.type === 'vast' 
    ? (contract as any).details_vast 
    : (contract as any).details_dynamisch

  // BEREKEN KOSTEN VIA API alleen voor prijsdetails breakdown
  useEffect(() => {
    if (openAccordion === 'prijsdetails' && !breakdown && !loading) {
      berekenKosten()
    }
  }, [openAccordion])

  const berekenKosten = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/energie/bereken-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Verbruik
          elektriciteitNormaal: verbruikElektriciteitNormaal,
          elektriciteitDal: verbruikElektriciteitDal,
          gas: verbruikGas,
          terugleveringJaar: terugleveringJaar || 0, // NIEUW
          
          // Aansluitwaarden
          aansluitwaardeElektriciteit,
          aansluitwaardeGas,
          
          // Postcode
          postcode,
          
          // Contract details
          contractType: contract.type,
          tariefElektriciteitNormaal: contract.tariefElektriciteit,
          tariefElektriciteitDal: contract.tariefElektriciteitDal,
          tariefElektriciteitEnkel: contract.tariefElektriciteitEnkel,
          tariefGas: contract.tariefGas,
          tariefTerugleveringKwh: details?.tarief_teruglevering_kwh || 0, // NIEUW (alleen vast)
          // Dynamische contract opslagen
          opslagElektriciteit: details?.opslag_elektriciteit || details?.opslag_elektriciteit_normaal || 0,
          opslagGas: details?.opslag_gas || 0,
          opslagTeruglevering: details?.opslag_teruglevering || 0, // NIEUW (alleen dynamisch)
          vastrechtStroomMaand: details?.vastrecht_stroom_maand || 4.00,
          vastrechtGasMaand: details?.vastrecht_gas_maand || 4.00,
          heeftDubbeleMeter: !heeftEnkeleMeter,
        }),
      })

      if (!response.ok) {
        throw new Error('Fout bij berekenen kosten')
      }

      const data = await response.json()
      setBreakdown(data.breakdown)
    } catch (err: any) {
      console.error('Error calculating costs:', err)
      setError(err.message || 'Kon kosten niet berekenen')
    } finally {
      setLoading(false)
    }
  }

  const totaalElektriciteit = verbruikElektriciteitNormaal + verbruikElektriciteitDal

  return (
    <Card
      className={`relative hover:shadow-xl transition-shadow duration-300 ${
        contract.aanbevolen ? 'ring-2 ring-brand-teal-500' : ''
      }`}
    >
      {/* Position Number - Linksboven (corner positioned) */}
      {position !== undefined && (
        <div className="absolute -top-3 -left-3 z-10">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-teal-500 to-brand-teal-600 text-white rounded-full flex items-center justify-center shadow-lg font-bold text-base border-2 border-white">
            {position}
          </div>
        </div>
      )}

      <CardContent className="pt-6 md:pt-6">
        {/* Leverancier met logo */}
        <div className="mb-4 md:mb-6 flex items-start gap-3 md:gap-4">
          {/* Logo */}
          {contract.leverancier.logo && (
            <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-white rounded-lg border-2 border-gray-100 p-1.5 md:p-2 flex items-center justify-center">
              <img 
                src={contract.leverancier.logo} 
                alt={`${contract.leverancier.naam} logo`}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          
          {/* Naam en details */}
          <div className="flex-1 min-w-0">
            <h3 
              className="text-lg md:text-xl lg:text-2xl font-bold text-brand-navy-500 mb-1.5 md:mb-2 lg:mb-2.5 pr-0" 
              title={contract.leverancier.naam}
              style={{
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                lineHeight: '1.3',
              }}
              dangerouslySetInnerHTML={{
                __html: (() => {
                  // Add <wbr> (word break opportunity) before capital letters that follow lowercase letters
                  // This allows breaking "NieuweStroom" into "Nieuwe<br>Stroom" when card is narrow
                  // but keeps it as "NieuweStroom" when card is wide enough
                  const naam = contract.leverancier.naam
                  return naam.replace(/([a-z])([A-Z])/g, '$1<wbr>$2')
                })()
              }}
            />
            
            {/* Badges - Direct onder de naam, perfect uitgelijnd */}
            {(contract.aanbevolen || contract.populair || contract.groeneEnergie) && (
              <div className="flex flex-wrap items-center gap-1 md:gap-1.5 lg:gap-2 mb-1.5 md:mb-2.5 lg:mb-3">
                {contract.aanbevolen && (
                  <Badge variant="success" className="shadow-md text-xs md:text-xs lg:text-sm px-1.5 md:px-2 lg:px-2.5 py-0.5 md:py-1 lg:py-1.5">
                    <Check weight="bold" className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 mr-0.5 md:mr-1 flex-shrink-0" />
                    <span className="whitespace-nowrap">Aanbevolen</span>
                  </Badge>
                )}
                {contract.populair && !contract.aanbevolen && (
                  <Badge variant="info" className="shadow-md text-xs md:text-xs lg:text-sm px-1.5 md:px-2 lg:px-2.5 py-0.5 md:py-1 lg:py-1.5">
                    <Star weight="fill" className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 mr-0.5 md:mr-1 flex-shrink-0" />
                    <span className="whitespace-nowrap">Populair</span>
                  </Badge>
                )}
                {contract.groeneEnergie && (
                  <Badge className="bg-green-100 text-green-700 border-green-200 shadow-md text-xs md:text-xs lg:text-sm px-1.5 md:px-2 lg:px-2.5 py-0.5 md:py-1 lg:py-1.5">
                    <Leaf weight="duotone" className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 mr-0.5 md:mr-1 flex-shrink-0" />
                    <span className="whitespace-nowrap">Groen</span>
                  </Badge>
                )}
              </div>
            )}
            
            <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mt-0.5">
              {contract.looptijd 
                ? `Vast contract • ${contract.looptijd} jaar`
                : contract.type === 'dynamisch'
                ? 'Dynamisch contract • Maandelijks opzegbaar'
                : 'Contract'
              }
            </p>
          </div>
        </div>

        {/* Prijs en Rating op één lijn op mobiel */}
        <div className="mb-4 md:mb-6 pb-4 md:pb-6 border-b-2 border-gray-100">
          <div className="flex items-start justify-between gap-3 mb-2 md:mb-1">
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5 md:gap-2 mb-1">
                <span className="text-3xl md:text-4xl font-bold text-brand-navy-500">
                  €{contract.maandbedrag}
                </span>
                <span className="text-xs md:text-base text-gray-500">/maand</span>
              </div>
              <div className="text-xs md:text-sm text-gray-500 mb-2 md:mb-3">
                €{contract.jaarbedrag.toLocaleString()} per jaar
              </div>
              {contract.besparing && contract.besparing > 0 && (
                <Tooltip
                  title="Indicatie besparing"
                  content={
                    <div className="space-y-5">
                      {/* Cost comparison */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-700">Jaarkosten Eneco</span>
                          <span className="text-base font-semibold text-brand-navy-700">€{((contract.besparing * 12) + contract.jaarbedrag).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-700">Jaarkosten van dit contract van {contract.leverancier.naam}</span>
                          <span className="text-base font-semibold text-brand-navy-700">€{contract.jaarbedrag.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="pt-3 mt-2 border-t-2 border-gray-200 flex justify-between items-center">
                          <span className="text-base font-bold text-green-600">Besparing per jaar</span>
                          <span className="text-base font-bold text-green-600">€{(contract.besparing * 12).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                      {/* Explanation */}
                      <div className="pt-4 border-t border-gray-100 space-y-3">
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Wij berekenen de besparing met het standaard variabele contract van Eneco omdat u deze tarieven waarschijnlijk in rekening gebracht krijgt als uw vaste contract inmiddels is verlopen, of gaat krijgen zolang u niet overstapt.
                        </p>
                        <p className="text-sm font-medium text-gray-700 leading-relaxed">
                          Een standaard variabel contract is een flexibel energiecontract voor onbepaalde tijd met variabele tarieven.
                        </p>
                      </div>
                    </div>
                  }
                  position="bottom"
                >
                  <div className="inline-flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 bg-green-50 text-green-700 rounded-lg font-semibold text-xs md:text-sm cursor-pointer hover:bg-green-100 active:bg-green-200 transition-colors group">
                    <Check weight="bold" className="w-3 h-3 md:w-4 md:h-4" />
                    <span>€{contract.besparing}/mnd</span>
                    <Info weight="fill" className="w-3 h-3 md:w-4 md:h-4 text-green-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Tooltip>
              )}
            </div>
            
            {/* Rating - Rechts op mobiel */}
            <div className="flex flex-col items-end gap-1 md:hidden flex-shrink-0">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    weight={i < Math.floor(contract.rating) ? 'fill' : 'regular'}
                    className={`w-3 h-3 ${
                      i < Math.floor(contract.rating)
                        ? 'text-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600 font-medium">
                {contract.rating} ({contract.aantalReviews})
              </span>
            </div>
          </div>
        </div>

        {/* Rating - Desktop versie (onder prijs) */}
        <div className="hidden md:flex items-center gap-2 mb-4 md:mb-6">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                weight={i < Math.floor(contract.rating) ? 'fill' : 'regular'}
                className={`w-4 h-4 ${
                  i < Math.floor(contract.rating)
                    ? 'text-yellow-500'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 font-medium">
            {contract.rating} ({contract.aantalReviews})
          </span>
        </div>

        {/* 3 Accordions */}
        <div className="space-y-1.5 md:space-y-2 mb-4 md:mb-6">
          {/* Prijsdetails */}
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleAccordion('prijsdetails')}
              className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
            >
              <span className="font-semibold text-sm md:text-base text-brand-navy-500">Prijsdetails</span>
              {openAccordion === 'prijsdetails' ? (
                <CaretUp weight="bold" className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              ) : (
                <CaretDown weight="bold" className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              )}
            </button>
            {openAccordion === 'prijsdetails' && (
              <div className="p-4 bg-white space-y-4 animate-slide-down">
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal-600"></div>
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                    {error}
                  </div>
                )}
                
                {breakdown && !loading && (
                  <div className="space-y-4">
                    {/* STROOM SECTIE */}
                    <div>
                      <h4 className="font-bold text-brand-navy-500 mb-3">Stroom</h4>
                      
                      {/* Variabele kosten */}
                      <div className="space-y-1.5 mb-3">
                        <p className="text-xs font-semibold text-gray-500 mb-1">Variabele kosten</p>
                        
                        {/* Leveringskosten stroom - met tarief details */}
                        {breakdown.leverancier.elektriciteitDetails?.type === 'dubbel' && (
                          <>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">
                                Leveringskosten normaal
                                <span className="text-xs text-gray-500 ml-1">
                                  ({((breakdown.leverancier.elektriciteitDetails.normaal as any)?.nettoKwh ?? breakdown.leverancier.elektriciteitDetails.normaal?.kwh ?? 0).toLocaleString()} kWh × €{breakdown.leverancier.elektriciteitDetails.normaal?.tarief.toFixed(6)})
                                </span>
                              </span>
                              <span className="font-medium">
                                €{breakdown.leverancier.elektriciteitDetails.normaal?.bedrag.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">
                                Leveringskosten dal
                                <span className="text-xs text-gray-500 ml-1">
                                  ({((breakdown.leverancier.elektriciteitDetails.dal as any)?.nettoKwh ?? breakdown.leverancier.elektriciteitDetails.dal?.kwh ?? 0).toLocaleString()} kWh × €{breakdown.leverancier.elektriciteitDetails.dal?.tarief.toFixed(6)})
                                </span>
                              </span>
                              <span className="font-medium">
                                €{breakdown.leverancier.elektriciteitDetails.dal?.bedrag.toFixed(2)}
                              </span>
                            </div>
                          </>
                        )}
                        
                        {breakdown.leverancier.elektriciteitDetails?.type === 'enkel' && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">
                              Leveringskosten enkeltarief
                              <span className="text-xs text-gray-500 ml-1">
                                ({((breakdown.leverancier.elektriciteitDetails.enkel as any)?.nettoKwh ?? breakdown.leverancier.elektriciteitDetails.enkel?.kwh ?? 0).toLocaleString()} kWh × €{breakdown.leverancier.elektriciteitDetails.enkel?.tarief.toFixed(6)})
                              </span>
                            </span>
                            <span className="font-medium">
                              €{breakdown.leverancier.elektriciteitDetails.enkel?.bedrag.toFixed(2)}
                            </span>
                          </div>
                        )}
                        
                        {/* Fallback als er geen details zijn */}
                        {!breakdown.leverancier.elektriciteitDetails && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">
                              Leveringskosten stroom
                              <span className="text-xs text-gray-500 ml-1">
                                ({totaalElektriciteit.toLocaleString()} kWh)
                              </span>
                            </span>
                            <span className="font-medium">
                              €{breakdown.leverancier.elektriciteit.toFixed(2)}
                            </span>
                          </div>
                        )}
                        
                        {/* Energiebelasting stroom */}
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">
                            Energiebelasting
                          </span>
                          <span className="font-medium">
                            €{breakdown.energiebelasting.elektriciteit.toFixed(2)}
                          </span>
                        </div>
                        
                        {/* Energiebelasting staffels uitklapper */}
                        {breakdown.energiebelasting.staffels && (
                          <details className="ml-4 text-xs text-gray-600">
                            <summary className="cursor-pointer hover:text-brand-teal-600 font-medium">
                              Bekijk staffels
                            </summary>
                            <div className="mt-2 space-y-1 pl-2 border-l-2 border-gray-200">
                              {breakdown.energiebelasting.staffels.schijf1 && (
                                <div className="flex justify-between">
                                  <span>0-{breakdown.energiebelasting.staffels.schijf1.kwh.toLocaleString()} kWh × €{breakdown.energiebelasting.staffels.schijf1.tarief.toFixed(5)}</span>
                                  <span>€{breakdown.energiebelasting.staffels.schijf1.bedrag.toFixed(2)}</span>
                                </div>
                              )}
                              {breakdown.energiebelasting.staffels.schijf2 && (
                                <div className="flex justify-between">
                                  <span>{(breakdown.energiebelasting.staffels.schijf1?.kwh || 0).toLocaleString()}-{breakdown.energiebelasting.staffels.schijf2.kwh.toLocaleString()} kWh × €{breakdown.energiebelasting.staffels.schijf2.tarief.toFixed(5)}</span>
                                  <span>€{breakdown.energiebelasting.staffels.schijf2.bedrag.toFixed(2)}</span>
                                </div>
                              )}
                              {breakdown.energiebelasting.staffels.schijf3 && (
                                <div className="flex justify-between">
                                  <span>{(breakdown.energiebelasting.staffels.schijf2?.kwh || 0).toLocaleString()}-{breakdown.energiebelasting.staffels.schijf3.kwh.toLocaleString()} kWh × €{breakdown.energiebelasting.staffels.schijf3.tarief.toFixed(5)}</span>
                                  <span>€{breakdown.energiebelasting.staffels.schijf3.bedrag.toFixed(2)}</span>
                                </div>
                              )}
                              {breakdown.energiebelasting.staffels.schijf4 && (
                                <div className="flex justify-between">
                                  <span>&gt;{(breakdown.energiebelasting.staffels.schijf3?.kwh || 0).toLocaleString()} kWh × €{breakdown.energiebelasting.staffels.schijf4.tarief.toFixed(5)}</span>
                                  <span>€{breakdown.energiebelasting.staffels.schijf4.bedrag.toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                          </details>
                        )}
                      </div>
                      
                      {/* Vaste kosten stroom */}
                      <div className="space-y-1.5 pt-2 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 mb-1">Vaste kosten</p>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">Vastrecht</span>
                          <span className="font-medium">€{breakdown.leverancier.vastrechtStroom.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">
                            Netbeheerkosten {aansluitwaardeElektriciteit}
                            <span className="text-xs text-gray-500 ml-1">
                              ({breakdown.netbeheer.netbeheerder})
                            </span>
                          </span>
                          <span className="font-medium">€{breakdown.netbeheer.elektriciteit.toFixed(2)}</span>
                        </div>
                        
                        {/* Melding voor grootverbruik elektriciteit */}
                        {isGrootverbruikElektriciteitAansluitwaarde(aansluitwaardeElektriciteit) && (
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-xs text-blue-700 leading-relaxed">
                              <strong>Let op:</strong> Bij grootverbruik aansluitingen (&gt;3x80A) worden de netbeheerkosten apart door de netbeheerder in rekening gebracht en zijn daarom niet opgenomen in dit maandbedrag.
                            </p>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center text-sm text-green-700">
                          <span>Vermindering EB</span>
                          <span className="font-medium">-€{breakdown.energiebelasting.vermindering.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {/* Subtotaal stroom */}
                      <div className="mt-3 pt-2 border-t-2 border-gray-300">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-brand-navy-500">Totaal stroom</span>
                          <span className="font-bold text-brand-navy-500">
                            €{(breakdown.leverancier.elektriciteit + 
                               breakdown.energiebelasting.elektriciteit + 
                               breakdown.netbeheer.elektriciteit + 
                               breakdown.leverancier.vastrechtStroom - 
                               breakdown.energiebelasting.vermindering).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* GAS SECTIE */}
                    {verbruikGas > 0 && (
                      <div className="pt-4 border-t-2 border-gray-200">
                        <h4 className="font-bold text-brand-navy-500 mb-3">Gas</h4>
                        
                        {/* Variabele kosten */}
                        <div className="space-y-1.5 mb-3">
                          <p className="text-xs font-semibold text-gray-500 mb-1">Variabele kosten</p>
                          
                          {/* Leveringskosten gas - met tarief details */}
                          {breakdown.leverancier.gasDetails ? (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">
                                Leveringskosten gas
                                <span className="text-xs text-gray-500 ml-1">
                                  ({breakdown.leverancier.gasDetails.m3.toLocaleString()} m³ × €{breakdown.leverancier.gasDetails.tarief.toFixed(6)})
                                </span>
                              </span>
                              <span className="font-medium">
                                €{breakdown.leverancier.gasDetails.bedrag.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">
                                Leveringskosten gas
                                <span className="text-xs text-gray-500 ml-1">
                                  ({verbruikGas.toLocaleString()} m³)
                                </span>
                              </span>
                              <span className="font-medium">
                                €{breakdown.leverancier.gas.toFixed(2)}
                              </span>
                            </div>
                          )}
                          
                          {/* Energiebelasting gas */}
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">
                              Energiebelasting
                              <span className="text-xs text-gray-500 ml-1">
                                (staffel: €0,57816/m³)
                              </span>
                            </span>
                            <span className="font-medium">
                              €{breakdown.energiebelasting.gas.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Vaste kosten gas */}
                        <div className="space-y-1.5 pt-2 border-t border-gray-200">
                          <p className="text-xs font-semibold text-gray-500 mb-1">Vaste kosten</p>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">Vastrecht</span>
                            <span className="font-medium">€{breakdown.leverancier.vastrechtGas.toFixed(2)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">
                              Netbeheerkosten {aansluitwaardeGas}
                              <span className="text-xs text-gray-500 ml-1">
                                ({breakdown.netbeheer.netbeheerder})
                              </span>
                            </span>
                            <span className="font-medium">€{breakdown.netbeheer.gas.toFixed(2)}</span>
                          </div>
                          
                          {/* Melding voor grootverbruik gas */}
                          {isGrootverbruikGasAansluitwaarde(aansluitwaardeGas) && (
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-xs text-blue-700 leading-relaxed">
                                <strong>Let op:</strong> Bij grootverbruik aansluitingen (&gt;G25) worden de netbeheerkosten apart door de netbeheerder in rekening gebracht en zijn daarom niet opgenomen in dit maandbedrag.
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Subtotaal gas */}
                        <div className="mt-3 pt-2 border-t-2 border-gray-300">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-brand-navy-500">Totaal gas</span>
                            <span className="font-bold text-brand-navy-500">
                              €{(breakdown.leverancier.gas + 
                                 breakdown.energiebelasting.gas + 
                                 breakdown.netbeheer.gas +
                                 breakdown.leverancier.vastrechtGas).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Teruglevering (zonnepanelen) - VASTE CONTRACTEN */}
                    {contract.type === 'vast' && breakdown.leverancier.terugleveringDetails && breakdown.leverancier.terugleveringDetails.kwh > 0 && breakdown.leverancier.terugleveringDetails.bedrag > 0 && (
                      <div className="bg-brand-teal-50 border-2 border-brand-teal-200 rounded-lg p-4">
                        <h4 className="font-bold text-brand-navy-500 mb-3 flex items-center gap-2">
                          <Sun weight="duotone" className="w-5 h-5 text-brand-teal-600" />
                          Teruglevering (Zonnepanelen)
                        </h4>
                        
                        {/* Terugleverkosten */}
                        <div className="space-y-1.5 mb-3">
                          <p className="text-xs font-semibold text-gray-500 mb-1">Terugleverkosten</p>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">
                              Kosten teruglevering
                              <span className="text-xs text-gray-500 ml-1">
                                ({breakdown.leverancier.terugleveringDetails.kwh.toLocaleString()} kWh × €{breakdown.leverancier.terugleveringDetails.tarief.toFixed(6)})
                              </span>
                            </span>
                            <span className="font-medium text-brand-teal-700">
                              €{breakdown.leverancier.terugleveringDetails.bedrag.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Info box */}
                        <div className="mt-3 p-2 bg-brand-teal-100 rounded text-xs text-brand-teal-900">
                          <strong>ℹ️ Salderingsregeling:</strong> Je verbruik is al verrekend met je teruglevering. Bovenstaande kosten zijn de administratiekosten die de leverancier rekent voor het innemen van stroom.
                        </div>
                      </div>
                    )}
                    
                    {/* Opbrengst extra teruglevering - DYNAMISCHE CONTRACTEN */}
                    {contract.type === 'dynamisch' && breakdown.leverancier.overschotKwh && breakdown.leverancier.overschotKwh > 0 && breakdown.leverancier.opbrengstOverschot && breakdown.leverancier.opbrengstOverschot > 0 && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                        <h4 className="font-bold text-brand-navy-500 mb-3 flex items-center gap-2">
                          <Sun weight="duotone" className="w-5 h-5 text-green-600" />
                          Opbrengst Extra Teruglevering
                        </h4>
                        
                        <div className="space-y-1.5 mb-3">
                          <p className="text-xs font-semibold text-gray-500 mb-1">Opbrengst</p>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">
                              Opbrengst extra teruglevering
                              <span className="text-xs text-gray-500 ml-1">
                                ({breakdown.leverancier.overschotKwh.toLocaleString()} kWh)
                              </span>
                            </span>
                            <span className="font-medium text-green-700">
                              − €{breakdown.leverancier.opbrengstOverschot.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Info box */}
                        <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-900">
                          <strong>ℹ️ Salderingsregeling:</strong> Je hebt meer stroom teruggeleverd dan verbruikt. Je krijgt voor de overschot teruglevering een vergoeding van je leverancier.
                        </div>
                      </div>
                    )}
                    
                    {/* TOTAAL SECTIE */}
                    <div className="pt-4 border-t-2 border-gray-300 bg-yellow-50 -mx-4 -mb-4 px-4 py-4 rounded-b-lg">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-brand-navy-500">Totaal per jaar (excl. btw)</span>
                          <span className="font-bold text-brand-navy-500">€{breakdown.totaal.jaarExclBtw.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-yellow-300">
                          <span className="text-brand-navy-500">Per maand (excl. btw)</span>
                          <span className="text-brand-navy-500">€{breakdown.totaal.maandExclBtw.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <span>Per maand (incl. 21% btw)</span>
                          <span>€{(breakdown.totaal.maandExclBtw * 1.21).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Voorwaarden */}
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleAccordion('voorwaarden')}
              className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
            >
              <span className="font-semibold text-sm md:text-base text-brand-navy-500">Voorwaarden</span>
              {openAccordion === 'voorwaarden' ? (
                <CaretUp weight="bold" className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              ) : (
                <CaretDown weight="bold" className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              )}
            </button>
            {openAccordion === 'voorwaarden' && (
              <div className="p-4 bg-white space-y-2 animate-slide-down">
                {contract.voorwaarden && contract.voorwaarden.length > 0 ? (() => {
                  // Filter alleen documenten (PDF/DOC met URL), negeer tekstvoorwaarden
                  const documenten = contract.voorwaarden
                    .map(vw => {
                      let voorwaardeObj: { naam?: string; url?: string; type?: string } | null = null

                      if (typeof vw === 'string') {
                        // Try to parse as JSON
                        try {
                          const parsed = JSON.parse(vw) as { naam?: string; url?: string; type?: string }
                          if (parsed && typeof parsed === 'object' && parsed.url && (parsed.type === 'pdf' || parsed.type === 'doc')) {
                            voorwaardeObj = parsed
                          }
                        } catch {
                          // Legacy string format - ignore (tekstvoorwaarde)
                        }
                      } else if (vw && typeof vw === 'object' && 'naam' in vw) {
                        const vwObj = vw as { naam?: string; url?: string; type?: string }
                        if (vwObj.url && (vwObj.type === 'pdf' || vwObj.type === 'doc')) {
                          voorwaardeObj = vwObj
                        }
                      }

                      return voorwaardeObj
                    })
                    .filter((v): v is { naam: string; url: string; type: 'pdf' | 'doc' } => v !== null)

                  if (documenten.length === 0) {
                    return <p className="text-sm text-gray-500">Geen voorwaarden beschikbaar</p>
                  }

                  return documenten.map((vw, i) => {
                    const isPdf = vw.type === 'pdf'
                    const isDoc = vw.type === 'doc'

                    return (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        {isPdf ? (
                          <FilePdf weight="bold" className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        ) : isDoc ? (
                          <FileText weight="bold" className="w-4 h-4 text-brand-teal-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Check weight="bold" className="w-4 h-4 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                        )}
                        <a
                          href={getFriendlyDocumentUrl(vw.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-teal-600 hover:text-brand-teal-700 hover:underline font-medium"
                        >
                          {vw.naam || 'Download voorwaarden'}
                        </a>
                      </div>
                    )
                  })
                })() : (
                  <p className="text-sm text-gray-500">Geen voorwaarden beschikbaar</p>
                )}
                {contract.bijzonderheden && contract.bijzonderheden.length > 0 && (
                  <>
                    <div className="border-t border-gray-100 my-3" />
                    <p className="text-xs font-semibold text-gray-600 mb-2">Bijzonderheden:</p>
                    {contract.bijzonderheden.map((bz, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check weight="bold" className="w-4 h-4 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                        <span>{bz}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Over leverancier */}
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleAccordion('over')}
              className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
            >
              <span className="font-semibold text-sm md:text-base text-brand-navy-500">Over leverancier</span>
              {openAccordion === 'over' ? (
                <CaretUp weight="bold" className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              ) : (
                <CaretDown weight="bold" className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              )}
            </button>
            {openAccordion === 'over' && (
              <div className="p-4 bg-white animate-slide-down">
                {contract.leverancier.overLeverancier ? (
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {contract.leverancier.overLeverancier}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">Geen informatie beschikbaar over deze leverancier</p>
                )}
                {contract.leverancier.website && (
                  <a
                    href={contract.leverancier.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-sm text-brand-teal-600 hover:text-brand-teal-700 font-semibold"
                  >
                    Bezoek website →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 md:space-y-3 pt-3 md:pt-4 border-t-2 border-gray-100">
          <Button 
            className="w-full bg-brand-teal-500 hover:bg-brand-teal-600 text-sm md:text-base py-2.5 md:py-3"
            onClick={async () => {
              // Track InitiateCheckout event for Facebook Pixel - VOORDAT navigatie
              const eventData = {
                content_name: contract.leverancier.naam,
                content_category: 'Energiecontract',
                value: breakdown?.totaal.jaarInclBtw || breakdown?.totaal.jaarExclBtw || 0,
                currency: 'EUR',
                contract_id: contract.id,
                contract_type: contract.type,
              }
              
              console.log('[ContractCard] Tracking InitiateCheckout event:', eventData)
              track('InitiateCheckout', eventData)
              
              // Kleine delay om Pixel event de tijd te geven om te worden getracked
              await new Promise(resolve => setTimeout(resolve, 100))
              
              // Sla gekozen contract op in store
              setSelectedContract(contract)
              // Navigeer naar stap 2
              router.push(`/calculator?stap=2&contract=${contract.id}`)
            }}
          >
              Aanvragen
            </Button>
          <button className="w-full text-gray-600 py-1.5 md:py-2 text-xs md:text-sm font-medium hover:text-brand-teal-600 transition-colors">
            Meer informatie
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
