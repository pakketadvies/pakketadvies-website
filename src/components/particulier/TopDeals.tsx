'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { ArrowRight, CheckCircle } from '@phosphor-icons/react'

interface TopDealsProps {
  initialData?: {
    contracten: any[]
    averagePrice: number
  }
}

export function TopDeals({ initialData }: TopDealsProps) {
  const deals = initialData?.contracten || []

  if (deals.length === 0) {
    return null
  }

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container-custom max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
            Top 5 beste deals voor particulieren
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            De scherpste energietarieven van dit moment, zorgvuldig geselecteerd voor particuliere consumenten
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {deals.slice(0, 3).map((deal, index) => (
            <Card key={deal.id || index} className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal-100 text-brand-teal-700 text-xs font-semibold mb-2">
                      #{index + 1} Beste deal
                    </div>
                    <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-1">
                      {deal.leverancier?.naam || 'Energieleverancier'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {deal.type === 'vast' ? 'Vast contract' : deal.type === 'dynamisch' ? 'Dynamisch contract' : 'Maatwerk'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {deal.stroomtariefPiek && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Stroom piek:</span>
                      <span className="font-semibold text-brand-navy-500">€{parseFloat(deal.stroomtariefPiek).toFixed(4)}/kWh</span>
                    </div>
                  )}
                  {deal.stroomtariefDal && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Stroom dal:</span>
                      <span className="font-semibold text-brand-navy-500">€{parseFloat(deal.stroomtariefDal).toFixed(4)}/kWh</span>
                    </div>
                  )}
                  {deal.gastarief && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Gas:</span>
                      <span className="font-semibold text-brand-navy-500">€{parseFloat(deal.gastarief).toFixed(4)}/m³</span>
                    </div>
                  )}
                </div>

                <Link href="/calculator">
                  <button className="w-full px-4 py-2 bg-brand-teal-500 text-white rounded-lg font-semibold hover:bg-brand-teal-600 transition-colors flex items-center justify-center gap-2">
                    Bekijk details
                    <ArrowRight weight="bold" className="w-4 h-4" />
                  </button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link href="/calculator">
            <button className="px-8 py-4 bg-brand-navy-500 text-white rounded-xl font-semibold hover:bg-brand-navy-600 transition-colors inline-flex items-center gap-2">
              Bekijk alle deals
              <ArrowRight weight="bold" className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}

