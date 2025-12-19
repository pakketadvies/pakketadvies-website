'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { CaretDown, CaretUp } from '@phosphor-icons/react'

const faqItems = [
  {
    vraag: 'Hoe lang duurt het voordat ik kan overstappen?',
    antwoord: 'Gemiddeld kun je binnen 2 weken overstappen. Dit hangt af van je huidige contract en de opzegtermijn. We regelen alles voor je, inclusief het opzeggen van je oude contract en het activeren van het nieuwe. Er is geen onderbreking van je energielevering.',
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
    vraag: 'Is jullie dienst echt volledig gratis?',
    antwoord: 'Ja, absoluut! Je betaalt NOOIT aan ons - ook niet als je een energiecontract afsluit. Wij bemiddelen voor je met energieleveranciers en onderhandelen de beste tarieven. In ruil ontvangen wij een kleine vergoeding van de energieleverancier. Dit heeft geen invloed op het tarief dat jij betaalt.',
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

export function ParticulierFAQ() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container-custom max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
            Veelgestelde vragen
          </h2>
          <p className="text-lg text-gray-600">
            Alles wat je wilt weten over energie vergelijken en overstappen
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <Card key={index} className="hover-lift">
              <CardContent className="p-0">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
                >
                  <h3 className="font-display text-lg font-bold text-brand-navy-500 pr-4">
                    {item.vraag}
                  </h3>
                  <div className="flex-shrink-0">
                    {openFaqIndex === index ? (
                      <CaretUp weight="bold" className="w-6 h-6 text-brand-teal-500" />
                    ) : (
                      <CaretDown weight="bold" className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 pb-6 border-t border-gray-200">
                    <p className="text-gray-600 leading-relaxed pt-4">
                      {item.antwoord}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

