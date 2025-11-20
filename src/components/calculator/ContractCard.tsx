'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Check, Star, Leaf, CaretDown, CaretUp } from '@phosphor-icons/react'
import Link from 'next/link'
import type { ContractOptie } from '@/types/calculator'

interface ContractCardProps {
  contract: ContractOptie
  meterType: 'slim' | 'oud' | 'weet_niet'
  heeftEnkeleMeter: boolean
  // Verbruik voor kostenbreakdown
  verbruikElektriciteitNormaal: number
  verbruikElektriciteitDal: number
  verbruikGas: number
}

export default function ContractCard({ 
  contract, 
  meterType, 
  heeftEnkeleMeter,
  verbruikElektriciteitNormaal,
  verbruikElektriciteitDal,
  verbruikGas
}: ContractCardProps) {
  const [openAccordion, setOpenAccordion] = useState<'prijsdetails' | 'voorwaarden' | 'over' | null>(null)

  const toggleAccordion = (section: 'prijsdetails' | 'voorwaarden' | 'over') => {
    setOpenAccordion(openAccordion === section ? null : section)
  }

  // Bepaal welke tarieven te tonen op basis van metertype
  const toonEnkeltarief = heeftEnkeleMeter || meterType === 'weet_niet'
  const toonDubbelTarief = !heeftEnkeleMeter || meterType === 'weet_niet'

  // BEREKEN KOSTENBREAKDOWN
  const totaalElektriciteit = verbruikElektriciteitNormaal + verbruikElektriciteitDal
  
  // 1. Leverancierskosten (op basis of het een enkel/dubbel contract is)
  const isContractDubbeleMeter = contract.tariefElektriciteitDal !== undefined && contract.tariefElektriciteitDal > 0
  let kostenLeverancierElektriciteit = 0
  
  if (isContractDubbeleMeter) {
    // Dubbele meter contract
    kostenLeverancierElektriciteit = 
      (verbruikElektriciteitNormaal * (contract.tariefElektriciteit || 0)) +
      (verbruikElektriciteitDal * (contract.tariefElektriciteitDal || 0))
  } else if (contract.tariefElektriciteitEnkel) {
    // Enkele meter contract
    kostenLeverancierElektriciteit = totaalElektriciteit * contract.tariefElektriciteitEnkel
  } else {
    // Fallback: gebruik normaal tarief voor alles
    kostenLeverancierElektriciteit = totaalElektriciteit * (contract.tariefElektriciteit || 0)
  }
  
  const kostenLeverancierGas = verbruikGas * (contract.tariefGas || 0)
  const kostenVastrecht = 99 // Geschat vastrecht per jaar (€99 zoals in veel contracten)
  const totaalLeverancier = kostenLeverancierElektriciteit + kostenLeverancierGas + kostenVastrecht
  
  // 2. Energiebelasting (kleinverbruik staffels 2025)
  const ebElektriciteit = totaalElektriciteit <= 10000 
    ? totaalElektriciteit * 0.14649
    : (10000 * 0.14649) + ((totaalElektriciteit - 10000) * 0.06277)
  
  const ebGas = verbruikGas <= 1000
    ? verbruikGas * 0.57816
    : (1000 * 0.57816) + ((verbruikGas - 1000) * 0.31718)
  
  const verminderingEB = totaalElektriciteit <= 10000 ? 542.04 : 0
  const totaalEnergiebelasting = ebElektriciteit + ebGas - verminderingEB
  
  // 3. Netbeheerkosten (gemiddeld - later per netbeheerder)
  const netbeheerKosten = 675 // Gemiddeld voor 3x25A + G6
  
  // 4. Totalen
  const totaalJaarExclBtw = totaalLeverancier + totaalEnergiebelasting + netbeheerKosten
  const totaalMaandExclBtw = totaalJaarExclBtw / 12

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
              €{contract.maandbedrag}
            </span>
            <span className="text-gray-500">/maand</span>
          </div>
          <div className="text-sm text-gray-500 mb-3">
            €{contract.jaarbedrag.toLocaleString()} per jaar
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
                {/* KOSTENBREAKDOWN */}
                <div className="bg-brand-teal-50 border border-brand-teal-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-brand-navy-500 text-sm mb-3">Opbouw maandbedrag</h4>
                  
                  {/* Leverancier */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs text-gray-600">
                      <span>Elektriciteit ({totaalElektriciteit.toLocaleString()} kWh)</span>
                      <span>€{Math.round(kostenLeverancierElektriciteit / 12)}/mnd</span>
                    </div>
                    {verbruikGas > 0 && (
                      <div className="flex justify-between items-center text-xs text-gray-600">
                        <span>Gas ({verbruikGas.toLocaleString()} m³)</span>
                        <span>€{Math.round(kostenLeverancierGas / 12)}/mnd</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs text-gray-600">
                      <span>Vastrecht</span>
                      <span>€{Math.round(kostenVastrecht / 12)}/mnd</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-brand-teal-300 pt-2 flex justify-between items-center text-xs font-semibold text-brand-teal-900">
                    <span>Subtotaal leverancier</span>
                    <span>€{Math.round(totaalLeverancier / 12)}/mnd</span>
                  </div>
                  
                  {/* Energiebelasting */}
                  <div className="pt-2 border-t border-brand-teal-200 space-y-1.5">
                    <div className="flex justify-between items-center text-xs text-gray-600">
                      <span>Energiebelasting elektriciteit</span>
                      <span>€{Math.round(ebElektriciteit / 12)}/mnd</span>
                    </div>
                    {verbruikGas > 0 && (
                      <div className="flex justify-between items-center text-xs text-gray-600">
                        <span>Energiebelasting gas</span>
                        <span>€{Math.round(ebGas / 12)}/mnd</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs text-green-700">
                      <span>Vermindering energiebelasting</span>
                      <span>-€{Math.round(verminderingEB / 12)}/mnd</span>
                    </div>
                  </div>
                  
                  {/* Netbeheer */}
                  <div className="pt-2 border-t border-brand-teal-200 flex justify-between items-center text-xs text-gray-600">
                    <span>Netbeheerkosten</span>
                    <span>€{Math.round(netbeheerKosten / 12)}/mnd</span>
                  </div>
                  
                  {/* Totaal */}
                  <div className="pt-2 border-t-2 border-brand-teal-400 flex justify-between items-center text-sm font-bold text-brand-navy-500">
                    <span>Totaal per maand (excl. btw)</span>
                    <span>€{Math.round(totaalMaandExclBtw)}</span>
                  </div>
                  
                  <p className="text-xs text-gray-500 pt-1">
                    Dit is een berekening op basis van het standaard energiepakket
                  </p>
                </div>
                
                {/* TARIEVEN (oorspronkelijke sectie) */}
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <h4 className="font-semibold text-brand-navy-500 text-sm mb-2">Leverancierstarieven</h4>
                  
                  {/* Enkeltarief (voor enkele meter OF weet_niet) */}
                  {toonEnkeltarief && contract.tariefElektriciteitEnkel && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Stroom (enkel)</span>
                      <span className="font-semibold text-brand-navy-500">€{contract.tariefElektriciteitEnkel.toFixed(4)}/kWh</span>
                    </div>
                  )}
                  
                  {/* Normaal tarief (voor dubbele meter OF weet_niet) */}
                  {toonDubbelTarief && contract.tariefElektriciteit && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Stroom (normaal)</span>
                      <span className="font-semibold text-brand-navy-500">€{contract.tariefElektriciteit.toFixed(4)}/kWh</span>
                    </div>
                  )}
                  
                  {/* Dal tarief (voor dubbele meter OF weet_niet) */}
                  {toonDubbelTarief && contract.tariefElektriciteitDal && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Stroom (dal)</span>
                      <span className="font-semibold text-brand-navy-500">€{contract.tariefElektriciteitDal.toFixed(4)}/kWh</span>
                    </div>
                  )}
                  
                  {/* Gas */}
                  {contract.tariefGas && contract.tariefGas > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Gas</span>
                      <span className="font-semibold text-brand-navy-500">€{contract.tariefGas.toFixed(4)}/m³</span>
                    </div>
                  )}
                  
                  {/* Looptijd */}
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
                    <span className="text-gray-600">Looptijd</span>
                    <span className="font-semibold text-brand-navy-500">{contract.looptijd} jaar</span>
                  </div>
                  
                  {/* Disclaimer - EXCLUSIEF BTW voor zakelijk */}
                  <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                    De leverancierstarieven zijn excl. 21% btw. Energiebelasting en netbeheerkosten zijn hierboven apart weergegeven.
                  </p>
                </div>
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

