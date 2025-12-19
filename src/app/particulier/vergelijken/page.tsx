'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { ArrowRight, Lightning, CheckCircle, ShieldCheck } from '@phosphor-icons/react'

// Force dynamic rendering to avoid SSR issues with ModeContext
export const dynamic = 'force-dynamic'

export default function VergelijkenPage() {
  return (
    <div className="min-h-screen bg-white pt-20 md:pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-navy-500 via-brand-navy-600 to-brand-teal-500 text-white py-16 md:py-24 pb-20 md:pb-28 relative overflow-hidden">
        <div className="container-custom max-w-6xl relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Vergelijk energieleveranciers en{' '}
              <span className="text-brand-teal-300">bespaar tot €500</span> per jaar
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Vind in 2 minuten het beste energiecontract voor jouw situatie. Gratis, onafhankelijk en volledig vrijblijvend.
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mb-8">
              <div className="flex items-center gap-2">
                <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-300" />
                <span className="text-sm md:text-base">100.000+ tevreden klanten</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-300" />
                <span className="text-sm md:text-base">Gratis & onafhankelijk</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-300" />
                <span className="text-sm md:text-base">Binnen 2 weken overgestapt</span>
              </div>
            </div>

            <Link href="/calculator">
              <Button size="lg" variant="primary" className="bg-white text-brand-navy-500 hover:bg-gray-50">
                Start vergelijking
                <ArrowRight weight="bold" className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Comparison Widget */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Start je vergelijking
            </h2>
            <p className="text-lg text-gray-600">
              Vul je postcode en verbruik in en ontdek direct de beste deals
            </p>
          </div>

          <Card className="shadow-xl">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
                    Postcode
                  </label>
                  <input
                    type="text"
                    placeholder="1234AB"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-teal-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
                    Jaarlijks verbruik elektriciteit (kWh)
                  </label>
                  <input
                    type="number"
                    placeholder="3500"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-teal-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
                    Jaarlijks verbruik gas (m³)
                  </label>
                  <input
                    type="number"
                    placeholder="1200"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-teal-500 focus:outline-none transition-colors"
                  />
                </div>
                <Link href="/calculator">
                  <Button size="lg" variant="primary" className="w-full">
                    Vergelijk nu
                    <ArrowRight weight="bold" className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Compare Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Waarom energie vergelijken?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Door regelmatig te vergelijken kun je flink besparen op je energiekosten
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Lightning,
                title: 'Bespaar tot €500 per jaar',
                description: 'Door te vergelijken en over te stappen kun je honderden euro\'s per jaar besparen op je energiekosten.',
              },
              {
                icon: ShieldCheck,
                title: '100% onafhankelijk',
                description: 'We werken niet voor leveranciers, maar uitsluitend voor jou. Objectief advies in jouw belang.',
              },
              {
                icon: CheckCircle,
                title: 'Volledig gratis',
                description: 'Ons advies en bemiddeling is volledig gratis. Je betaalt NOOIT aan ons.',
              },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <Card key={index} className="hover-lift text-center">
                  <CardContent className="pt-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-teal-400 to-brand-teal-500 shadow-lg mb-6">
                      <Icon weight="duotone" className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-brand-navy-500 text-white relative overflow-hidden">
        <div className="container-custom max-w-4xl text-center relative z-10">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Klaar om te besparen?
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Start nu je gratis vergelijking en ontdek hoeveel je kunt besparen
          </p>
          <Link href="/calculator">
            <Button size="lg" variant="primary" className="bg-brand-teal-500 hover:bg-brand-teal-600 text-white">
              Start vergelijking
              <ArrowRight weight="bold" className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

