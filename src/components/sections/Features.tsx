'use client'

import Image from 'next/image'
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
    size: 'large'
  },
  {
    icon: HandCoins,
    title: 'Direct besparen',
    description: 'Gemiddeld 30-40% besparing op je energiekosten',
    size: 'small'
  },
  {
    icon: Lightning,
    title: 'Snel geregeld',
    description: 'Binnen 2 weken volledig overgestapt',
    size: 'small'
  },
  {
    icon: ShieldCheck,
    title: 'Volledig ontzorgd',
    description: 'Wij regelen alles voor je, van opzeggen tot activeren. Jij hoeft nergens meer aan te denken.',
    size: 'medium'
  },
  {
    icon: Users,
    title: 'Persoonlijk advies',
    description: 'Geen bots of formulieren. Altijd contact met een echte specialist.',
    size: 'medium'
  },
  {
    icon: ClockClockwise,
    title: '24/7 support',
    description: 'Vragen? We staan altijd voor je klaar',
    size: 'small'
  },
  {
    icon: Leaf,
    title: 'Groene energie opties',
    description: 'Stap over naar duurzame energie zonder gedoe',
    size: 'small'
  },
  {
    icon: Lightbulb,
    title: 'Slimme contracten',
    description: 'We kiezen het perfecte contract voor jouw situatie. Vast, dynamisch of een combinatie - wij weten wat het beste werkt.',
    size: 'large'
  },
]

export function Features() {
  return (
    <section className="py-24 bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-teal-50 border border-brand-teal-200">
            <Lightning weight="duotone" className="w-5 h-5 text-brand-teal-600" />
            <span className="text-sm font-semibold text-brand-teal-700">
              Waarom PakketAdvies?
            </span>
          </div>
          
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-brand-navy-500">
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
                  hover-lift cursor-pointer transition-all duration-300 hover:border-brand-teal-500/50
                  ${isLarge ? 'md:col-span-2' : ''}
                  ${isMedium ? 'md:col-span-1 lg:col-span-2' : ''}
                `}
              >
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-teal-500 shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon weight="duotone" className="w-7 h-7 text-white" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-bold text-brand-navy-500 mb-3 group-hover:text-brand-teal-600 transition-colors">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className={`text-gray-600 leading-relaxed ${isLarge ? 'text-lg' : ''}`}>
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <a href="/calculator" className="inline-flex items-center gap-2 px-8 py-4 bg-brand-teal-500 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-brand-teal-500/30 hover:shadow-2xl hover:shadow-brand-teal-500/40 hover:scale-105 hover:bg-brand-teal-600 transition-all duration-300">
            Start met besparen
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>

        {/* Visual Section with Image */}
        <div className="mt-24 relative h-96 rounded-3xl overflow-hidden">
          <Image
            src="/images/features-dashboard.jpg"
            alt="Energy dashboard analytics"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy-500/80 to-transparent flex items-end p-12">
            <div className="text-white">
              <h3 className="font-display text-3xl font-bold mb-2">Real-time inzicht in je energiekosten</h3>
              <p className="text-lg text-gray-200">Volledige transparantie en controle over je zakelijke energiecontracten</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
