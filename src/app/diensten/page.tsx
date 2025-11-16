import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function DienstenPage() {
  const diensten = [
    {
      title: 'Energiebemiddeling',
      description:
        'We vergelijken alle energieleveranciers en vinden het beste contract voor uw bedrijf. Volledig gratis en vrijblijvend.',
      features: [
        'Vergelijking van alle leveranciers',
        'Persoonlijk advies op maat',
        'Beste prijs gegarandeerd',
        'Volledige ontzorging',
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      title: 'Contractbeheer',
      description:
        'Beheer al uw energiecontracten centraal. We houden de einddatums in de gaten en adviseren tijdig over verlenging of overstap.',
      features: [
        'Centraal contractoverzicht',
        'Automatische herinneringen',
        'Optimalisatie mogelijkheden',
        'Jaarlijkse evaluatie',
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      title: 'Advies op maat',
      description:
        'Onze energiespecialisten denken met u mee. Van duurzaamheidsadvies tot kostenbesparingen, we helpen u verder.',
      features: [
        'Persoonlijk energiespecialist',
        'Duurzaamheidsadvies',
        'Kostenbesparing analyse',
        'Marktinzichten',
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-brand-navy-500 text-white py-16">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Onze diensten</h1>
          <p className="text-lg text-white/90 max-w-2xl">
            Van bemiddeling tot langdurige begeleiding. We nemen u volledig uit handen op het gebied van energie.
          </p>
        </div>
      </section>

      {/* Diensten */}
      <section className="py-16">
        <div className="container-custom max-w-5xl">
          <div className="space-y-8">
            {diensten.map((dienst, index) => (
              <Card key={index}>
                <CardContent className="pt-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-brand-teal-50 flex items-center justify-center text-brand-teal-500 flex-shrink-0">
                      {dienst.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="mb-3">{dienst.title}</CardTitle>
                      <p className="text-gray-500 mb-4">{dienst.description}</p>
                      <ul className="space-y-2">
                        {dienst.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
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
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-teal-500 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Benieuwd wat we voor u kunnen betekenen?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Start met een gratis berekening of neem direct contact met ons op
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="primary" asChild className="bg-white text-brand-teal-500 hover:bg-white/90">
              <Link href="/calculator">Start berekening</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild className="border-white text-white hover:bg-white/10">
              <Link href="/contact">Neem contact op</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

