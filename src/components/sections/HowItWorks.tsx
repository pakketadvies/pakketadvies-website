import { Card, CardContent } from '@/components/ui/Card'

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Verbruik invoeren',
      description: 'Vul uw jaarlijks energieverbruik in of laat ons het schatten op basis van uw bedrijf.',
    },
    {
      number: '02',
      title: 'Contracten vergelijken',
      description: 'Bekijk direct de beste contractopties met verwachte maandkosten en besparingen.',
    },
    {
      number: '03',
      title: 'Advies & keuze',
      description: 'Kies zelf of laat u adviseren door onze energiespecialisten voor het beste contract.',
    },
    {
      number: '04',
      title: 'Overstap & begeleiding',
      description: 'Wij regelen de overstap en blijven u begeleiden voor een zorgeloos proces.',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
            Hoe werkt het?
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            In vier simpele stappen naar uw nieuwe energiecontract
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="h-full">
                <CardContent className="pt-8">
                  <div className="text-5xl font-bold text-brand-teal-500/20 mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-brand-navy-500 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-500">{step.description}</p>
                </CardContent>
              </Card>
              {/* Arrow for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-brand-teal-500">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

