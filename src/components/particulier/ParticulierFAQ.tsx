'use client'

import { useState } from 'react'
import { CaretDown, CaretUp } from '@phosphor-icons/react'
import { Card, CardContent } from '@/components/ui/Card'

const faqItems = [
  {
    vraag: 'Hoe werkt overstappen?',
    antwoord: 'Overstappen is eenvoudig. Je vult je postcode en verbruik in, wij vergelijken alle leveranciers en geven je persoonlijk advies. Als je kiest voor een nieuwe leverancier, regelen wij het opzeggen van je oude contract en het aanmelden bij de nieuwe. Binnen 2 weken ben je overgestapt, zonder onderbreking van je levering.',
  },
  {
    vraag: 'Wat kost overstappen?',
    antwoord: 'Overstappen kost je niets! Ons advies en bemiddeling is volledig gratis. Je betaalt alleen de energiekosten aan je nieuwe leverancier. Er zijn geen verborgen kosten of verrassingen.',
  },
  {
    vraag: 'Kan ik altijd overstappen?',
    antwoord: 'Ja, in principe kun je altijd overstappen. Als je een contract met een vaste looptijd hebt, kan er een opzegvergoeding gelden als je eerder opzegt. Wij checken dit voor je en adviseren je over het beste moment om over te stappen.',
  },
  {
    vraag: 'Wat gebeurt er met mijn huidige contract?',
    antwoord: 'Wij regelen het opzeggen van je huidige contract voor je. We zorgen ervoor dat je op het juiste moment overstapt, zodat je geen dubbele kosten hebt en geen onderbreking van je levering ervaart.',
  },
  {
    vraag: 'Is er risico op onderbreking van levering?',
    antwoord: 'Nee, absoluut niet. Er is geen risico op onderbreking van je energielevering. De overstap wordt naadloos geregeld tussen de oude en nieuwe leverancier. Je merkt alleen dat je een andere leverancier hebt en lagere kosten.',
  },
  {
    vraag: 'Hoe lang duurt het voordat ik kan overstappen?',
    antwoord: 'Gemiddeld kun je binnen 2 weken overstappen. Dit hangt af van je huidige contract en de opzegtermijn. We regelen alles voor je, inclusief het opzeggen van je oude contract en het activeren van het nieuwe.',
  },
]

export function ParticulierFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container-custom max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
            Veelgestelde vragen
          </h2>
          <p className="text-lg text-gray-600">
            Alles wat je wilt weten over overstappen
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <Card key={index} className="hover-lift">
              <CardContent className="p-0">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
                >
                  <h3 className="font-display text-lg font-bold text-brand-navy-500 pr-4">
                    {item.vraag}
                  </h3>
                  <div className="flex-shrink-0">
                    {openIndex === index ? (
                      <CaretUp weight="bold" className="w-6 h-6 text-brand-teal-500" />
                    ) : (
                      <CaretDown weight="bold" className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </button>
                {openIndex === index && (
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

