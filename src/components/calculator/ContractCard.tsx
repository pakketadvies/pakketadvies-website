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
}

export default function ContractCard({ contract, meterType, heeftEnkeleMeter }: ContractCardProps) {
  const [openAccordion, setOpenAccordion] = useState<'prijsdetails' | 'voorwaarden' | 'over' | null>(null)

  const toggleAccordion = (section: 'prijsdetails' | 'voorwaarden' | 'over') => {
    setOpenAccordion(openAccordion === section ? null : section)
  }

  // Bepaal welke tarieven te tonen op basis van metertype
  const toonEnkeltarief = heeftEnkeleMeter || meterType === 'weet_niet'
  const toonDubbelTarief = !heeftEnkeleMeter || meterType === 'weet_niet'

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
              <div className="p-4 bg-white space-y-3 animate-slide-down">
                {/* Enkeltarief (voor enkele meter OF weet_niet) */}
                {toonEnkeltarief && contract.tariefElektriciteitEnkel && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Stroom (enkel)</span>
                    <span className="font-semibold text-brand-navy-500">€ {contract.tariefElektriciteitEnkel.toFixed(4)}/kWh</span>
                  </div>
                )}
                
                {/* Normaal tarief (voor dubbele meter OF weet_niet) */}
                {toonDubbelTarief && contract.tariefElektriciteit && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Stroom (normaal)</span>
                    <span className="font-semibold text-brand-navy-500">€ {contract.tariefElektriciteit.toFixed(4)}/kWh</span>
                  </div>
                )}
                
                {/* Dal tarief (voor dubbele meter OF weet_niet) */}
                {toonDubbelTarief && contract.tariefElektriciteitDal && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Stroom (dal)</span>
                    <span className="font-semibold text-brand-navy-500">€ {contract.tariefElektriciteitDal.toFixed(4)}/kWh</span>
                  </div>
                )}
                
                {/* Gas */}
                {contract.tariefGas && contract.tariefGas > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Gas</span>
                    <span className="font-semibold text-brand-navy-500">€ {contract.tariefGas.toFixed(4)}/m³</span>
                  </div>
                )}
                
                {/* Looptijd */}
                <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
                  <span className="text-gray-600">Looptijd</span>
                  <span className="font-semibold text-brand-navy-500">{contract.looptijd} jaar</span>
                </div>
                
                {/* Disclaimer - EXCLUSIEF BTW voor zakelijk */}
                <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                  De tarieven zijn excl. 21% btw, en overheidsheffingen van 2025
                </p>
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

