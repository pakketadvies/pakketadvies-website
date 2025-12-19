'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { HandCoins, Clock, CheckCircle } from '@phosphor-icons/react'

const voordelen = [
  {
    icon: HandCoins,
    title: 'Bespaar tot €500 per jaar',
    description: 'Door te vergelijken en over te stappen kun je honderden euro\'s per jaar besparen op je energiekosten.',
  },
  {
    icon: Clock,
    title: 'Eenvoudig en snel',
    description: 'Binnen 2 weken ben je overgestapt. Wij regelen alles voor je, van opzeggen tot activeren.',
  },
  {
    icon: CheckCircle,
    title: 'Wij regelen alles',
    description: 'Volledige ontzorging. Van vergelijken tot overstappen: wij nemen je volledig uit handen.',
  },
]

export function WaaromOverstappen() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container-custom max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
            Waarom overstappen?
          </h2>
          <p className="text-lg text-gray-600">
            Drie goede redenen om je energieleverancier te vergelijken
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
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

