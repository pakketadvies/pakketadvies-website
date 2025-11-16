'use client'

import { 
  Lightning, 
  ChartLineUp, 
  ShieldCheck, 
  Users, 
  ClockClockwise, 
  Leaf,
  HandCoins,
  Lightbulb
} from '@phosphor-icons/react'

const features = [
  {
    icon: ChartLineUp,
    title: 'Transparante vergelijking',
    description: 'Vergelijk alle beschikbare energieleveranciers in één overzicht. Geen verrassingen, alleen heldere cijfers.',
    gradient: 'from-brand-navy-500 to-brand-navy-600',
    size: 'large'
  },
  {
    icon: HandCoins,
    title: 'Direct besparen',
    description: 'Gemiddeld 30-40% besparing op je energiekosten',
    gradient: 'from-brand-teal-500 to-brand-teal-600',
    size: 'small'
  },
  {
    icon: Lightning,
    title: 'Snel geregeld',
    description: 'Binnen 2 weken volledig overgestapt',
    gradient: 'from-brand-teal-500 to-brand-teal-600',
    size: 'small'
  },
  {
    icon: ShieldCheck,
    title: 'Volledig ontzorgd',
    description: 'Wij regelen alles voor je, van opzeggen tot activeren. Jij hoeft nergens meer aan te denken.',
    gradient: 'from-brand-navy-600 to-brand-navy-700',
    size: 'medium'
  },
  {
    icon: Users,
    title: 'Persoonlijk advies',
    description: 'Geen bots of formulieren. Altijd contact met een echte specialist.',
    gradient: 'from-brand-teal-600 to-brand-teal-700',
    size: 'medium'
  },
  {
    icon: ClockClockwise,
    title: '24/7 support',
    description: 'Vragen? We staan altijd voor je klaar',
    gradient: 'from-brand-teal-600 to-brand-teal-700',
    size: 'small'
  },
  {
    icon: Leaf,
    title: 'Groene energie opties',
    description: 'Stap over naar duurzame energie zonder gedoe',
    gradient: 'from-brand-teal-500 to-brand-teal-600',
    size: 'small'
  },
  {
    icon: Lightbulb,
    title: 'Slimme contracten',
    description: 'We kiezen het perfecte contract voor jouw situatie. Vast, dynamisch of een combinatie - wij weten wat het beste werkt.',
    gradient: 'from-brand-navy-500 to-brand-teal-500',
    size: 'large'
  },
]

export function Features() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-navy-50 border border-brand-navy-100">
            <Lightning weight="duotone" className="w-5 h-5 text-brand-navy-600" />
            <span className="text-sm font-semibold text-brand-navy-700">
              Waarom PakketAdvies?
            </span>
          </div>
          
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-dark-900">
            Alles wat je nodig hebt voor{' '}
            <span className="gradient-text">het beste energiecontract</span>
          </h2>
          
          <p className="text-lg text-gray-600">
            We maken het overstappen naar een betere energieleverancier simpel, 
            snel en zorgeloos voor jouw bedrijf.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isLarge = feature.size === 'large'
            const isMedium = feature.size === 'medium'
            
            return (
              <div
                key={index}
                className={`
                  group relative overflow-hidden rounded-3xl bg-white border border-gray-200 p-8
                  hover-lift cursor-pointer transition-all duration-300
                  ${isLarge ? 'md:col-span-2' : ''}
                  ${isMedium ? 'md:col-span-1 lg:col-span-2' : ''}
                `}
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon weight="duotone" className="w-7 h-7 text-white" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-bold text-dark-900 mb-3 group-hover:text-brand-navy-600 transition-colors">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className={`text-gray-600 leading-relaxed ${isLarge ? 'text-lg' : ''}`}>
                    {feature.description}
                  </p>
                </div>

                {/* Decorative element */}
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-brand-navy-100 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <a href="/calculator" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-navy-500 to-brand-navy-600 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-brand-navy-500/30 hover:shadow-2xl hover:shadow-brand-navy-500/40 hover:scale-105 transition-all duration-300">
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
