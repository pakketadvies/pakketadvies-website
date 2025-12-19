'use client'

import { HandCoins, Clock, ShieldCheck, CheckCircle } from '@phosphor-icons/react'
import { Card, CardContent } from '@/components/ui/Card'

const voordelen = [
  {
    icon: HandCoins,
    title: 'Bespaar tot €500 per jaar',
    description: 'Door over te stappen naar een scherpere leverancier kun je aanzienlijk besparen op je energiekosten.',
  },
  {
    icon: Clock,
    title: 'Binnen 2 weken geregeld',
    description: 'Het overstappen is eenvoudig en snel. Wij regelen alles voor je, zonder onderbreking van je levering.',
  },
  {
    icon: ShieldCheck,
    title: 'Volledig gratis',
    description: 'Ons advies en bemiddeling kost je niets. Geen verborgen kosten, geen verrassingen.',
  },
  {
    icon: CheckCircle,
    title: '100% veilig',
    description: 'Er is geen risico op onderbreking van je energielevering. Alles wordt naadloos overgedragen.',
  },
]

export function WaaromOverstappen() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container-custom max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
            Waarom overstappen?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ontdek de voordelen van overstappen naar een betere energieleverancier
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {voordelen.map((voordeel, index) => {
            const Icon = voordeel.icon
            return (
              <Card key={index} className="hover-lift text-center">
                <CardContent className="pt-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-teal-400 to-brand-teal-500 shadow-lg mb-6">
                    <Icon weight="duotone" className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-3">
                    {voordeel.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {voordeel.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

