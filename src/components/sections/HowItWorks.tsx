'use client'

import { Calculator, ChatCircleDots, FileText, CheckCircle } from '@phosphor-icons/react'

const steps = [
  {
    number: '01',
    icon: Calculator,
    title: 'Bereken je verbruik',
    description: 'Vul in een paar minuten je energieverbruik in. Weet je het niet precies? Geen probleem, wij helpen je met een schatting.',
    color: 'primary',
    image: '📊'
  },
  {
    number: '02',
    icon: ChatCircleDots,
    title: 'Ontvang advies op maat',
    description: 'Onze specialisten analyseren jouw situatie en presenteren de beste opties. Vast, dynamisch of een combinatie? Wij adviseren.',
    color: 'energy',
    image: '💡'
  },
  {
    number: '03',
    icon: FileText,
    title: 'Kies je contract',
    description: 'Vergelijk alle aanbiedingen helder naast elkaar. Geen verborgen kosten, alleen transparante prijzen en voorwaarden.',
    color: 'accent',
    image: '📋'
  },
  {
    number: '04',
    icon: CheckCircle,
    title: 'Wij regelen alles',
    description: 'Jij zegt ja, wij doen de rest. Opzeggen, aanmelden, activeren - binnen 2 weken volledig overgestapt en direct besparen.',
    color: 'energy',
    image: '✅'
  },
]

export function HowItWorks() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-0 w-96 h-96 bg-brand-navy-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-brand-teal-100/50 rounded-full blur-3xl" />
      
      <div className="container-custom relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-teal-50 border border-brand-teal-100">
            <span className="text-sm font-semibold text-brand-teal-700">
              Simpel en snel
            </span>
          </div>
          
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-dark-900">
            Zo werkt het
          </h2>
          
          <p className="text-lg text-gray-600">
            In 4 simpele stappen naar een beter energiecontract. 
            Geen gedoe, alleen resultaat.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isEven = index % 2 === 0
            
            return (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Connector line (desktop only) */}
                {index < steps.length - 1 && (
                  <div className={`hidden md:block absolute ${isEven ? 'left-full' : 'right-full'} top-1/2 w-8 h-0.5 bg-gradient-to-r from-gray-200 to-transparent`} />
                )}
                
                {/* Card */}
                <div className="relative bg-white rounded-3xl p-8 md:p-10 border border-gray-200 hover-lift transition-all duration-300 h-full">
                  {/* Number badge */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-brand-navy-500 to-brand-navy-600 rounded-2xl flex items-center justify-center shadow-xl rotate-12 group-hover:rotate-0 transition-transform duration-300">
                    <span className="font-display text-2xl font-bold text-white">
                      {step.number}
                    </span>
                  </div>
                  
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-${step.color}-500 to-${step.color}-600 shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon weight="duotone" className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-dark-900 mb-4 group-hover:text-brand-navy-600 transition-colors">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {step.description}
                  </p>

                  {/* Decorative emoji */}
                  <div className="absolute bottom-8 right-8 text-6xl opacity-5 group-hover:opacity-10 transition-opacity">
                    {step.image}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center space-y-4">
          <p className="text-gray-600 text-lg">
            Klaar om te beginnen?
          </p>
          <a href="/calculator" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-teal-500 to-brand-teal-600 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-brand-teal-500/30 hover:shadow-2xl hover:shadow-brand-teal-500/40 hover:scale-105 transition-all duration-300">
            Start je besparingscheck
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
