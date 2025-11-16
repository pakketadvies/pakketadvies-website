'use client'

import { Calculator, ChatCircleDots, FileText, CheckCircle } from '@phosphor-icons/react'

const steps = [
  {
    number: '01',
    icon: Calculator,
    title: 'Bereken je verbruik',
    description: 'Vul in een paar minuten je energieverbruik in. Weet je het niet precies? Geen probleem, wij helpen je met een schatting.',
  },
  {
    number: '02',
    icon: ChatCircleDots,
    title: 'Ontvang advies op maat',
    description: 'Onze specialisten analyseren jouw situatie en presenteren de beste opties. Vast, dynamisch of een combinatie? Wij adviseren.',
  },
  {
    number: '03',
    icon: FileText,
    title: 'Kies je contract',
    description: 'Vergelijk alle aanbiedingen helder naast elkaar. Geen verborgen kosten, alleen transparante prijzen en voorwaarden.',
  },
  {
    number: '04',
    icon: CheckCircle,
    title: 'Wij regelen alles',
    description: 'Jij zegt ja, wij doen de rest. Opzeggen, aanmelden, activeren - binnen 2 weken volledig overgestapt en direct besparen.',
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 bg-white border-b border-gray-200">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="font-bold text-4xl md:text-5xl text-brand-navy-500 tracking-tight">
            Zo werkt het
          </h2>
          
          <p className="text-lg text-gray-600">
            In 4 simpele stappen naar een beter energiecontract. 
            Geen gedoe, alleen resultaat.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon
            
            return (
              <div
                key={index}
                className="relative"
              >
                {/* Number badge */}
                <div className="absolute -top-3 -left-3 w-10 h-10 bg-brand-navy-500 text-white rounded-md flex items-center justify-center font-bold text-sm">
                  {step.number}
                </div>
                
                {/* Card */}
                <div className="bg-white border border-gray-200 rounded-md p-6 h-full">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-md bg-brand-teal-500 flex items-center justify-center mb-4">
                    <Icon weight="regular" className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-bold text-lg text-brand-navy-500 mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4 font-medium">
            Klaar om te beginnen?
          </p>
          <a 
            href="/calculator" 
            className="inline-flex items-center gap-2 px-8 py-3 bg-brand-teal-500 text-white rounded-md font-semibold shadow-sm hover:bg-brand-teal-600 transition-colors duration-200"
          >
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
