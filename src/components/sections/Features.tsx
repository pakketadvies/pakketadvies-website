'use client'

import { 
  ChartLineUp, 
  ShieldCheck, 
  Users, 
  ClockClockwise, 
  Leaf,
  HandCoins,
  Lightbulb,
  Lightning
} from '@phosphor-icons/react'

const features = [
  {
    icon: ChartLineUp,
    title: 'Transparante vergelijking',
    description: 'Vergelijk alle beschikbare energieleveranciers in één overzicht. Geen verrassingen, alleen heldere cijfers.',
  },
  {
    icon: HandCoins,
    title: 'Direct besparen',
    description: 'Gemiddeld 30-40% besparing op je energiekosten door slimme contractvergelijking.',
  },
  {
    icon: Lightning,
    title: 'Snel geregeld',
    description: 'Binnen 2 weken volledig overgestapt naar een beter energiecontract.',
  },
  {
    icon: ShieldCheck,
    title: 'Volledig ontzorgd',
    description: 'Wij regelen alles voor je, van opzeggen tot activeren. Jij hoeft nergens meer aan te denken.',
  },
  {
    icon: Users,
    title: 'Persoonlijk advies',
    description: 'Geen bots of formulieren. Altijd contact met een echte specialist die je situatie begrijpt.',
  },
  {
    icon: Leaf,
    title: 'Groene energie opties',
    description: 'Stap over naar duurzame energie uit wind, zon of water zonder gedoe.',
  },
  {
    icon: ClockClockwise,
    title: '24/7 support',
    description: 'Vragen over je contract? We staan altijd voor je klaar met persoonlijk advies.',
  },
  {
    icon: Lightbulb,
    title: 'Slimme contracten',
    description: 'We kiezen het perfecte contract voor jouw situatie. Vast, dynamisch of een combinatie.',
  },
]

export function Features() {
  return (
    <section className="py-20 bg-gray-50 border-b border-gray-200">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-teal-50 border border-brand-teal-200">
            <span className="text-sm font-semibold text-brand-teal-700">
              Waarom PakketAdvies?
            </span>
          </div>
          
          <h2 className="font-bold text-4xl md:text-5xl text-brand-navy-500 tracking-tight">
            Alles voor het beste energiecontract
          </h2>
          
          <p className="text-lg text-gray-600">
            We maken het overstappen naar een betere energieleverancier simpel, 
            snel en zorgeloos voor jouw bedrijf.
          </p>
        </div>

        {/* Grid - gelijke grootte */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon
            
            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-md p-6 hover-lift"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-md bg-brand-teal-500 flex items-center justify-center mb-4">
                  <Icon weight="regular" className="w-6 h-6 text-white" />
                </div>
                
                {/* Title */}
                <h3 className="text-lg font-bold text-brand-navy-500 mb-2">
                  {feature.title}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <a 
            href="/calculator" 
            className="inline-flex items-center gap-2 px-8 py-3 bg-brand-navy-500 text-white rounded-md font-semibold shadow-sm hover:bg-brand-navy-600 transition-colors duration-200"
          >
            Start met besparen
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
