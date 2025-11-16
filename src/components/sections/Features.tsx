import { Card, CardContent, CardTitle } from '@/components/ui/Card'

export function Features() {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Gratis advies op maat',
      description: 'Onze energiespecialisten adviseren u vrijblijvend over de beste opties voor uw bedrijf.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Van A tot Z geregeld',
      description: 'Wij nemen het hele proces uit handen, van vergelijken tot en met het afsluiten van uw nieuwe contract.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Zorgeloos overstappen',
      description: 'Geen gedoe met opzeggingen of administratie. Wij regelen de overstap naar uw nieuwe leverancier.',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-brand-teal-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
            Waarom kiezen voor PakketAdvies?
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            We helpen MKB'ers en grootzakelijke klanten al jaren met het vinden van de beste energiecontracten
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:border-brand-teal-500 group">
              <CardContent className="pt-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-brand-teal-50 rounded-2xl flex items-center justify-center text-brand-teal-500 group-hover:bg-brand-teal-500 group-hover:text-white transition-colors duration-250">
                  {feature.icon}
                </div>
                <CardTitle className="mb-2">{feature.title}</CardTitle>
                <p className="text-gray-500">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

