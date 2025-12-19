'use client'

import { FileText, CheckCircle, Handshake, Clock } from '@phosphor-icons/react'

const stappen = [
  {
    nummer: '1',
    titel: 'Vergelijk',
    beschrijving: 'Vul je postcode en verbruik in en vergelijk alle beschikbare energieleveranciers.',
    icon: FileText,
  },
  {
    nummer: '2',
    titel: 'Kies je contract',
    beschrijving: 'Selecteer het energiecontract dat het beste bij jou past. We helpen je met advies.',
    icon: CheckCircle,
  },
  {
    nummer: '3',
    titel: 'Wij regelen overstap',
    beschrijving: 'We regelen alles voor je: opzeggen, aanmelden en activeren. Binnen 2 weken ben je overgestapt.',
    icon: Handshake,
  },
  {
    nummer: '4',
    titel: 'Geniet van lagere kosten',
    beschrijving: 'Vanaf de ingangsdatum profiteer je direct van lagere energiekosten.',
    icon: Clock,
  },
]

export function Stappenplan() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container-custom max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
            Hoe werkt het?
          </h2>
          <p className="text-lg text-gray-600">
            In 4 simpele stappen naar een nieuwe energieleverancier
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stappen.map((stap, index) => {
            const Icon = stap.icon
            return (
              <div key={index} className="relative">
                {/* Connector line (desktop only) */}
                {index < stappen.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-brand-teal-400 to-brand-teal-500/50 z-0" style={{ width: 'calc(100% - 3rem)', left: 'calc(50% + 1.5rem)' }} />
                )}
                
                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-navy-500 text-white font-bold text-xl mb-4 shadow-lg">
                    {stap.nummer}
                  </div>
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-teal-400 to-brand-teal-500 mb-4 shadow-lg">
                    <Icon weight="duotone" className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-2">
                    {stap.titel}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {stap.beschrijving}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

