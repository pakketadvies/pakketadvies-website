'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useCalculatorStore } from '@/store/calculatorStore'
import type { ContractOptie } from '@/types/calculator'

// Mock data voor demonstratie
const mockResultaten: ContractOptie[] = [
  {
    id: '1',
    leverancier: {
      id: 'gs',
      naam: 'Groene Stroom',
      logo: '/logos/groene-stroom.svg',
      website: 'https://groenestroom.nl',
    },
    type: 'vast',
    looptijd: 3,
    maandbedrag: 137,
    jaarbedrag: 1644,
    tariefElektriciteit: 0.28,
    tariefGas: 1.15,
    groeneEnergie: true,
    rating: 4.8,
    aantalReviews: 253,
    voorwaarden: ['Prijsgarantie 3 jaar', 'Geen opstapkosten', '1 maand opzegtermijn'],
    opzegtermijn: 1,
    bijzonderheden: ['100% Nederlandse windenergie'],
    besparing: 45,
    aanbevolen: true,
  },
  {
    id: '2',
    leverancier: {
      id: 'be',
      naam: 'Budget Energie',
      logo: '/logos/budget-energie.svg',
      website: 'https://budgetenergie.nl',
    },
    type: 'vast',
    looptijd: 1,
    maandbedrag: 129,
    jaarbedrag: 1548,
    tariefElektriciteit: 0.26,
    tariefGas: 1.10,
    groeneEnergie: false,
    rating: 4.5,
    aantalReviews: 182,
    voorwaarden: ['Prijsgarantie 1 jaar', 'Geen opstapkosten'],
    opzegtermijn: 1,
    bijzonderheden: [],
    besparing: 53,
  },
  {
    id: '3',
    leverancier: {
      id: 'eneco',
      naam: 'Eneco',
      logo: '/logos/eneco.svg',
      website: 'https://eneco.nl',
    },
    type: 'dynamisch',
    looptijd: 1,
    maandbedrag: 142,
    jaarbedrag: 1704,
    tariefElektriciteit: 0.29,
    tariefGas: 1.18,
    groeneEnergie: true,
    rating: 4.9,
    aantalReviews: 421,
    voorwaarden: ['Variabel tarief', 'Geen opstapkosten', '1 maand opzegtermijn'],
    opzegtermijn: 1,
    bijzonderheden: ['Slimme laadpaal integratie', 'App voor realtime inzicht'],
    besparing: 40,
    populair: true,
  },
]

export default function ResultatenPage() {
  const { verbruik, voorkeuren } = useCalculatorStore()
  const [resultaten, setResultaten] = useState<ContractOptie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simuleer API call
    setTimeout(() => {
      setResultaten(mockResultaten)
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
              <div className="w-full h-full border-4 border-brand-teal-50 border-t-brand-teal-500 rounded-full animate-spin" />
            </div>
            <p className="text-lg text-gray-500">We zoeken de beste opties voor u...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-navy-500 mb-2">
            We vonden {resultaten.length} passende contracten voor u
          </h1>
          <p className="text-lg text-gray-500">
            Op basis van uw verbruik van {verbruik?.elektriciteitJaar.toLocaleString()} kWh per jaar
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {resultaten.map((contract) => (
            <Card
              key={contract.id}
              className={`relative ${
                contract.aanbevolen ? 'ring-2 ring-brand-teal-500' : ''
              }`}
            >
              {/* Badges */}
              {contract.aanbevolen && (
                <div className="absolute top-4 right-4">
                  <Badge variant="success">Aanbevolen</Badge>
                </div>
              )}
              {contract.populair && (
                <div className="absolute top-4 right-4">
                  <Badge variant="info">Populair</Badge>
                </div>
              )}

              <CardContent className="pt-8">
                {/* Leverancier */}
                <div className="mb-4">
                  <div className="h-10 flex items-center mb-2">
                    <span className="text-lg font-semibold text-brand-navy-500">
                      {contract.leverancier.naam}
                    </span>
                  </div>
                </div>

                {/* Prijs */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-brand-navy-500">
                      €{contract.maandbedrag}
                    </span>
                    <span className="text-gray-500">/maand</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    €{contract.jaarbedrag.toLocaleString()} per jaar
                  </div>
                  {contract.besparing && (
                    <div className="flex items-center gap-1 text-success-500 font-medium mt-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>€{contract.besparing} besparing per maand</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-brand-teal-500 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-brand-navy-500">
                      {contract.type === 'vast' ? 'Vast contract' : 'Dynamisch contract'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-brand-teal-500 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-brand-navy-500">{contract.looptijd} jaar looptijd</span>
                  </div>
                  {contract.groeneEnergie && (
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-brand-teal-500 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-brand-navy-500">100% groene energie</span>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-2 pt-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(contract.rating)
                              ? 'text-warning-500 fill-current'
                              : 'text-gray-300'
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {contract.rating} ({contract.aantalReviews} reviews)
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <Button fullWidth>Kies dit contract</Button>
                  <button className="w-full text-gray-500 py-2 text-sm hover:text-brand-teal-500 transition-colors">
                    Bekijk details
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA sectie */}
        <div className="mt-12 bg-white rounded-2xl p-8 text-center shadow-md">
          <h2 className="text-2xl font-bold text-brand-navy-500 mb-4">
            Hulp nodig bij het kiezen?
          </h2>
          <p className="text-gray-500 mb-6 max-w-2xl mx-auto">
            Onze energiespecialisten helpen u graag om het beste contract te vinden dat perfect bij
            uw bedrijf past.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary">Bel me terug</Button>
            <Button variant="secondary">Stuur een email</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

