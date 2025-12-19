'use client'

import { Card, CardContent } from '@/components/ui/Card'
import Link from 'next/link'
import { ArrowRight, Lightbulb, Leaf, Sun, BatteryHigh } from '@phosphor-icons/react'

// Force dynamic rendering to avoid SSR issues with ModeContext
export const dynamic = 'force-dynamic'

const tips = [
  {
    icon: Lightbulb,
    title: 'LED verlichting',
    description: 'Vervang gloeilampen en halogeenlampen door LED verlichting. Dit bespaart tot 80% op je verlichtingskosten.',
    category: 'Verlichting',
  },
  {
    icon: Leaf,
    title: 'Goede isolatie',
    description: 'Zorg voor goede isolatie van je woning. Dit bespaart tot 30% op je verwarmingskosten.',
    category: 'Isolatie',
  },
  {
    icon: Sun,
    title: 'Zonnepanelen',
    description: 'Met zonnepanelen wek je je eigen stroom op en kun je tot €1.000 per jaar besparen.',
    category: 'Duurzaamheid',
  },
  {
    icon: BatteryHigh,
    title: 'Slimme thermostaat',
    description: 'Een slimme thermostaat helpt je automatisch energie te besparen door je verwarming optimaal te regelen.',
    category: 'Verwarming',
  },
]

export default function BespaartipsPage() {
  return (
    <div className="min-h-screen bg-white pt-20 md:pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-navy-500 via-brand-navy-600 to-brand-teal-500 text-white py-16 md:py-24 pb-20 md:pb-28 relative overflow-hidden">
        <div className="container-custom max-w-6xl relative z-10">
          <div className="max-w-4xl">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Energie bespaartips
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Praktische tips om energie te besparen en je energiekosten te verlagen
            </p>
          </div>
        </div>
      </section>

      {/* Tips Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {tips.map((tip, index) => {
              const Icon = tip.icon
              return (
                <Card key={index} className="hover-lift">
                  <CardContent className="pt-8">
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-teal-400 to-brand-teal-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Icon weight="duotone" className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="inline-block px-3 py-1 rounded-full bg-brand-teal-100 text-brand-teal-700 text-xs font-semibold mb-3">
                          {tip.category}
                        </span>
                        <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-3">
                          {tip.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {tip.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom max-w-4xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
            Bespaar ook op je energiecontract
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Naast energie besparen kun je ook besparen door over te stappen naar een scherper energiecontract.
          </p>
          <Link href="/particulier/vergelijken">
            <button className="px-8 py-4 bg-brand-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-brand-teal-500/30 hover:shadow-xl hover:shadow-brand-teal-500/40 hover:scale-105 hover:bg-brand-teal-600 transition-all duration-300 inline-flex items-center gap-2">
              Vergelijk energieleveranciers
              <ArrowRight weight="bold" className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  )
}

