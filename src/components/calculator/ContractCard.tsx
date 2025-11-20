'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Check, Star, Leaf, CaretDown, CaretUp } from '@phosphor-icons/react'
import Link from 'next/link'
import type { ContractOptie } from '@/types/calculator'

interface ContractCardProps {
  contract: ContractOptie
  meterType: 'slim' | 'oud' | 'weet_niet' | 'enkel'
  heeftEnkeleMeter: boolean
  // Verbruik voor kostenbreakdown
  verbruikElektriciteitNormaal: number
  verbruikElektriciteitDal: number
  verbruikGas: number
  // Aansluitwaarden
  aansluitwaardeElektriciteit: string
  aansluitwaardeGas: string
  // Postcode (voor netbeheerder)
  postcode: string
}

interface KostenBreakdown {
  leverancier: {
    elektriciteit: number
    gas: number
    vastrecht: number
    subtotaal: number
  }
  energiebelasting: {
    elektriciteit: number
    gas: number
    vermindering: number
    subtotaal: number
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
  }
}

export default function ContractCard({ 
  contract, 
  meterType, 
  heeftEnkeleMeter,
  verbruikElektriciteitNormaal,
  verbruikElektriciteitDal,
  verbruikGas,
  aansluitwaardeElektriciteit,
  aansluitwaardeGas,
  postcode
}: ContractCardProps) {
  const [openAccordion, setOpenAccordion] = useState<'prijsdetails' | 'voorwaarden' | 'over' | null>(null)
  const [breakdown, setBreakdown] = useState<KostenBreakdown | null>(null)
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

  // BEREKEN KOSTEN VIA API (direct bij mount voor hoofdbedrag)
  useEffect(() => {
    if (!breakdown && !loading) {
      berekenKosten()
    }
  }, []) // Empty deps = run once on mount

  // Re-bereken als accordion wordt geopend (voor extra zekerheid)
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
          vastrechtMaand: details?.vaste_kosten_maand || 8.25,
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
      {/* Badges */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
        {contract.aanbevolen && (
          <Badge variant="success" className="shadow-lg">
            <Check weight="bold" className="w-3 h-3 mr-1" />
            Aanbevolen
          </Badge>
        )}
        {contract.populair && (
          <Badge variant="info" className="shadow-lg">
            <Star weight="fill" className="w-3 h-3 mr-1" />
            Populair
          </Badge>
        )}
        {contract.groeneEnergie && (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <Leaf weight="duotone" className="w-3 h-3 mr-1" />
            Groen
          </Badge>
        )}
      </div>

      <CardContent className="pt-6">
        {/* Leverancier */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-brand-navy-500">
            {contract.leverancier.naam}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {contract.type === 'vast' ? 'Vast contract' : 'Dynamisch contract'} • {contract.looptijd} jaar
          </p>
        </div>

        {/* Prijs */}
        <div className="mb-6 pb-6 border-b-2 border-gray-100">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-bold text-brand-navy-500">
              €{breakdown ? Math.round(breakdown.totaal.maandExclBtw) : contract.maandbedrag}
            </span>
            <span className="text-gray-500">/maand</span>
          </div>
          <div className="text-sm text-gray-500 mb-3">
            €{breakdown ? Math.round(breakdown.totaal.jaarExclBtw).toLocaleString() : contract.jaarbedrag.toLocaleString()} per jaar
          </div>
          {contract.besparing && contract.besparing > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-semibold text-sm">
              <Check weight="bold" className="w-4 h-4" />
              <span>€{contract.besparing} besparing/maand</span>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-6">
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
        <div className="space-y-2 mb-6">
          {/* Prijsdetails */}
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleAccordion('prijsdetails')}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
            >
              <span className="font-semibold text-brand-navy-500">Prijsdetails</span>
              {openAccordion === 'prijsdetails' ? (
                <CaretUp weight="bold" className="w-5 h-5 text-gray-600" />
              ) : (
                <CaretDown weight="bold" className="w-5 h-5 text-gray-600" />
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
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-gray-600 mb-1.5">Variabele kosten</p>
                        <div className="space-y-1">
                          {/* Leveringskosten normaal - ALLEEN LEVERINGSTARIEF */}
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">
                              Leveringskosten normaal{' '}
                              <span className="text-xs text-gray-500">
                                {verbruikElektriciteitNormaal.toLocaleString()} kWh × €{contract.tariefElektriciteit?.toFixed(5) || '0'}
                              </span>
                            </span>
                            <span className="font-medium">€{(verbruikElektriciteitNormaal * (contract.tariefElektriciteit || 0)).toFixed(2)}</span>
                          </div>
                          
                          {/* Leveringskosten dal - ALLEEN LEVERINGSTARIEF */}
                          {verbruikElektriciteitDal > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">
                                Leveringskosten dal{' '}
                                <span className="text-xs text-gray-500">
                                  {verbruikElektriciteitDal.toLocaleString()} kWh × €{contract.tariefElektriciteitDal?.toFixed(5) || '0'}
                                </span>
                              </span>
                              <span className="font-medium">€{(verbruikElektriciteitDal * (contract.tariefElektriciteitDal || 0)).toFixed(2)}</span>
                            </div>
                          )}
                          
                          {/* Terugleverkosten (altijd 0) */}
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">
                              Terugleverkosten{' '}
                              <span className="text-xs text-gray-500">0 kWh × €0,00000</span>
                            </span>
                            <span className="font-medium">€0,00</span>
                          </div>
                          
                          {/* Overheidsheffingen - Schijf 1 */}
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">
                              Overheidsheffingen{' '}
                              <span className="text-xs text-gray-500">
                                0 - {Math.min(2900, totaalElektriciteit).toLocaleString()} kWh × €0,10154
                              </span>
                            </span>
                            <span className="font-medium">
                              €{(Math.min(2900, totaalElektriciteit) * 0.10154).toFixed(2)}
                            </span>
                          </div>
                          
                          {/* Overheidsheffingen - Schijf 2 (als > 2900 kWh) */}
                          {totaalElektriciteit > 2900 && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">
                                Overheidsheffingen{' '}
                                <span className="text-xs text-gray-500">
                                  2.901 - {totaalElektriciteit.toLocaleString()} kWh × €0,10154
                                </span>
                              </span>
                              <span className="font-medium">
                                €{((totaalElektriciteit - 2900) * 0.10154).toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Leveringstarief normaal */}
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-semibold text-brand-navy-500">
                            Leveringstarief normaal{' '}
                            <span className="text-xs text-gray-500 font-normal">Leveringstarief + Energiebelasting</span>
                          </span>
                          <span className="font-bold text-brand-navy-500">€{((contract.tariefElektriciteit || 0) + 0.10154).toFixed(5)}</span>
                        </div>
                      </div>
                      
                      {/* Leveringstarief dal */}
                      {verbruikElektriciteitDal > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-semibold text-brand-navy-500">
                              Leveringstarief dal{' '}
                              <span className="text-xs text-gray-500 font-normal">Leveringstarief + Energiebelasting</span>
                            </span>
                            <span className="font-bold text-brand-navy-500">€{((contract.tariefElektriciteitDal || 0) + 0.10154).toFixed(5)}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Vaste kosten */}
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 mb-1.5">Vaste kosten</p>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Vaste leveringskosten</span>
                            <span className="font-medium">€{breakdown.leverancier.vastrecht.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Vermindering energiebelasting</span>
                            <span className="font-medium text-green-600">€ - {breakdown.energiebelasting.vermindering.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">
                              Netbeheerkosten ({breakdown.netbeheer.netbeheerder} {aansluitwaardeElektriciteit})
                            </span>
                            <span className="font-medium">€{breakdown.netbeheer.elektriciteit.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Totale kosten stroom */}
                      <div className="mt-3 pt-2 border-t-2 border-gray-300">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-brand-navy-500">Totale kosten stroom</span>
                          <span className="font-bold text-brand-navy-500">
                            €{(breakdown.leverancier.elektriciteit + 
                               breakdown.energiebelasting.elektriciteit + 
                               breakdown.netbeheer.elektriciteit + 
                               breakdown.leverancier.vastrecht - 
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
                        <div className="mb-2">
                          <p className="text-xs font-semibold text-gray-600 mb-1.5">Variabele kosten</p>
                          <div className="space-y-1">
                            {/* Leveringskosten gas - ALLEEN LEVERINGSTARIEF */}
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">
                                Leveringskosten o.b.v. gasregio 4 (G1){' '}
                                <span className="text-xs text-gray-500">
                                  {verbruikGas.toLocaleString()} m³ × €{contract.tariefGas?.toFixed(5) || '0'}
                                </span>
                              </span>
                              <span className="font-medium">€{(verbruikGas * (contract.tariefGas || 0)).toFixed(2)}</span>
                            </div>
                            
                            {/* Overheidsheffingen gas - Schijf 1 */}
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">
                                Overheidsheffingen{' '}
                                <span className="text-xs text-gray-500">
                                  {Math.min(1000, verbruikGas).toLocaleString()} m³ × €0,57816
                                </span>
                              </span>
                              <span className="font-medium">
                                €{(Math.min(1000, verbruikGas) * 0.57816).toFixed(2)}
                              </span>
                            </div>
                            
                            {/* Overheidsheffingen gas - Schijf 2 (als > 1000 m³) */}
                            {verbruikGas > 1000 && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">
                                  Overheidsheffingen{' '}
                                  <span className="text-xs text-gray-500">
                                    {(verbruikGas - 1000).toLocaleString()} m³ × €0,57816
                                  </span>
                                </span>
                                <span className="font-medium">
                                  €{((verbruikGas - 1000) * 0.57816).toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Leveringstarief */}
                        <div className="mt-3 pt-2 border-t border-gray-200">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-semibold text-brand-navy-500">
                              Leveringstarief{' '}
                              <span className="text-xs text-gray-500 font-normal">Leveringstarief + Energiebelasting</span>
                            </span>
                            <span className="font-bold text-brand-navy-500">€{((contract.tariefGas || 0) + 0.57816).toFixed(5)}</span>
                          </div>
                        </div>
                        
                        {/* Vaste kosten */}
                        <div className="mt-3 pt-2 border-t border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 mb-1.5">Vaste kosten</p>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">
                                Netbeheerkosten ({breakdown.netbeheer.netbeheerder} t/m {aansluitwaardeGas}, 500 &lt; verbruik &lt; 4000)
                              </span>
                              <span className="font-medium">€{breakdown.netbeheer.gas.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Totale kosten gas */}
                        <div className="mt-3 pt-2 border-t-2 border-gray-300">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-brand-navy-500">Totale kosten gas</span>
                            <span className="font-bold text-brand-navy-500">
                              €{(breakdown.leverancier.gas + 
                                 breakdown.energiebelasting.gas + 
                                 breakdown.netbeheer.gas).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* TOTAAL SECTIE */}
                    <div className="pt-4 border-t-2 border-gray-300 bg-yellow-50 -mx-4 -mb-4 px-4 py-4 rounded-b-lg">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg text-brand-navy-500">Totaal jaarlijks excl. btw</span>
                          <span className="font-bold text-lg text-brand-navy-500">€{breakdown.totaal.jaarExclBtw.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-600 pt-2 border-t border-yellow-200">
                          <span>Btw</span>
                          <span>€{(breakdown.totaal.jaarExclBtw * 0.21).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center font-bold pt-2 border-t-2 border-yellow-300">
                          <span className="text-brand-navy-500">Geschatte maandelijkse kosten excl. btw</span>
                          <span className="text-brand-navy-500">€{breakdown.totaal.maandExclBtw.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <span>Totaal jaarlijks incl. btw</span>
                          <span>€{(breakdown.totaal.jaarExclBtw * 1.21).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <span>Geschatte maandelijkse kosten incl. btw</span>
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
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
            >
              <span className="font-semibold text-brand-navy-500">Voorwaarden</span>
              {openAccordion === 'voorwaarden' ? (
                <CaretUp weight="bold" className="w-5 h-5 text-gray-600" />
              ) : (
                <CaretDown weight="bold" className="w-5 h-5 text-gray-600" />
              )}
            </button>
            {openAccordion === 'voorwaarden' && (
              <div className="p-4 bg-white space-y-2 animate-slide-down">
                {contract.voorwaarden && contract.voorwaarden.length > 0 ? (
                  contract.voorwaarden.map((vw, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check weight="bold" className="w-4 h-4 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <span>{vw}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Geen specifieke voorwaarden beschikbaar</p>
                )}
                {contract.bijzonderheden && contract.bijzonderheden.length > 0 && (
                  <>
                    <div className="border-t border-gray-100 my-3" />
                    <p className="text-xs font-semibold text-gray-600 mb-2">Bijzonderheden:</p>
                    {contract.bijzonderheden.map((bz, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check weight="bold" className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
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
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
            >
              <span className="font-semibold text-brand-navy-500">Over leverancier</span>
              {openAccordion === 'over' ? (
                <CaretUp weight="bold" className="w-5 h-5 text-gray-600" />
              ) : (
                <CaretDown weight="bold" className="w-5 h-5 text-gray-600" />
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
        <div className="space-y-3 pt-4 border-t-2 border-gray-100">
          <Link href="/calculator?stap=2">
            <Button className="w-full bg-brand-teal-500 hover:bg-brand-teal-600">
              Bedrijfsgegevens invullen
            </Button>
          </Link>
          <button className="w-full text-gray-600 py-2 text-sm font-medium hover:text-brand-teal-600 transition-colors">
            Meer informatie
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
