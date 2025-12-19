'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Clock, FileText, Handshake } from '@phosphor-icons/react'

// Force dynamic rendering to avoid SSR issues with ModeContext
export const dynamic = 'force-dynamic'

const stappen = [
  {
    nummer: '1',
    titel: 'Vergelijk energieleveranciers',
    beschrijving: 'Vul je postcode en verbruik in en vergelijk alle beschikbare energieleveranciers. We tonen je de beste deals op basis van jouw situatie.',
    icon: FileText,
  },
  {
    nummer: '2',
    titel: 'Kies je nieuwe contract',
    beschrijving: 'Selecteer het energiecontract dat het beste bij jou past. We helpen je met advies en leggen alles duidelijk uit.',
    icon: CheckCircle,
  },
  {
    nummer: '3',
    titel: 'Wij regelen de overstap',
    beschrijving: 'We regelen alles voor je: opzeggen van je oude contract, aanmelden bij de nieuwe leverancier en de overgang. Binnen 2 weken ben je overgestapt.',
    icon: Handshake,
  },
  {
    nummer: '4',
    titel: 'Geniet van lagere kosten',
    beschrijving: 'Vanaf de ingangsdatum van je nieuwe contract profiteer je direct van lagere energiekosten. Geen onderbreking van je levering.',
    icon: Clock,
  },
]

const faqItems = [
  {
    vraag: 'Hoe lang duurt het voordat ik kan overstappen?',
    antwoord: 'Gemiddeld kun je binnen 2 weken overstappen. Dit hangt af van je huidige contract en de opzegtermijn. We regelen alles voor je, inclusief het opzeggen van je oude contract en het activeren van het nieuwe.',
  },
  {
    vraag: 'Wat gebeurt er met mijn huidige contract?',
    antwoord: 'Wij regelen het opzeggen van je huidige contract voor je. We zorgen ervoor dat je op het juiste moment overstapt, zodat je geen dubbele kosten hebt en geen onderbreking van je levering ervaart.',
  },
  {
    vraag: 'Moet ik zelf iets regelen?',
    antwoord: 'Nee, wij regelen alles voor je. Van het opzeggen van je oude contract tot het activeren van het nieuwe. Je hoeft alleen je meterstanden door te geven wanneer we daarom vragen.',
  },
  {
    vraag: 'Kan ik op elk moment overstappen?',
    antwoord: 'Ja, je kunt op elk moment overstappen. Als je nog een contract hebt met een vaste looptijd, kan er een opzegvergoeding gelden. We adviseren je hierover en helpen je de beste timing te kiezen.',
  },
  {
    vraag: 'Is er een onderbreking van mijn energielevering?',
    antwoord: 'Nee, er is geen onderbreking van je energielevering. De overstap verloopt naadloos. Je oude contract wordt beëindigd en je nieuwe contract start op dezelfde dag.',
  },
]

export default function OverstappenPage() {
  return (
    <div className="min-h-screen bg-white pt-20 md:pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-navy-500 via-brand-navy-600 to-brand-teal-500 text-white py-16 md:py-24 pb-20 md:pb-28 relative overflow-hidden">
        <div className="container-custom max-w-6xl relative z-10">
          <div className="max-w-4xl">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Overstappen van energieleverancier
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Alles wat je moet weten over overstappen. Eenvoudig, snel en volledig ontzorgd.
            </p>
          </div>
        </div>
      </section>

      {/* Stappenplan */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Hoe werkt overstappen?
            </h2>
            <p className="text-lg text-gray-600">
              In 4 simpele stappen naar een nieuwe energieleverancier
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stappen.map((stap, index) => {
              const Icon = stap.icon
              return (
                <div key={index} className="relative">
                  {/* Connector line (desktop only) */}
                  {index < stappen.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-brand-teal-400 to-brand-teal-500/50 z-0" style={{ width: 'calc(100% - 3rem)', left: 'calc(50% + 1.5rem)' }} />
                  )}
                  
                  <div className="relative z-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-navy-500 text-white font-bold text-xl mb-4 shadow-lg">
                      {stap.nummer}
                    </div>
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-teal-400 to-brand-teal-500 mb-4 shadow-lg">
                      <Icon weight="duotone" className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-2">
                      {stap.titel}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {stap.beschrijving}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Tips voor overstappen
            </h2>
          </div>

          <div className="space-y-4">
            {[
              'Controleer de einddatum van je huidige contract om opzegvergoedingen te voorkomen',
              'Vergelijk altijd meerdere leveranciers om de beste deal te vinden',
              'Let niet alleen op de prijs, maar ook op de looptijd en voorwaarden',
              'Geef je meterstanden op tijd door voor een soepele overgang',
              'Bewaar alle documenten van je oude en nieuwe contract',
            ].map((tip, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle weight="fill" className="w-6 h-6 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">{tip}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Veelgestelde vragen
            </h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <Card key={index} className="hover-lift">
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-bold text-brand-navy-500 mb-3">
                    {item.vraag}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.antwoord}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-brand-navy-500 text-white relative overflow-hidden">
        <div className="container-custom max-w-4xl text-center relative z-10">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Klaar om over te stappen?
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Start nu je gratis vergelijking en wij regelen de rest
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

