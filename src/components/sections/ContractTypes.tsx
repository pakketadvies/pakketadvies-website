'use client'

import Link from 'next/link'
import { Lock, Lightning, Diamond, ArrowRight, Check } from '@phosphor-icons/react'

export function ContractTypes() {
  const contracts = [
    {
      id: 'vast',
      icon: Lock,
      color: 'navy',
      title: 'Vast Contract',
      subtitle: '1 tot 5 jaar',
      description: 'Zekerheid en budgetcontrole',
      features: [
        'Vaste prijs gedurende looptijd',
        'Geen prijsschommelingen',
        'Perfect voor budgetplanning'
      ],
      idealFor: 'Kantoren, retail, vastgoed',
      href: '/producten/vast-contract'
    },
    {
      id: 'dynamisch',
      icon: Lightning,
      color: 'teal',
      title: 'Dynamisch Contract',
      subtitle: 'Maandelijks opzegbaar',
      description: 'Flexibel en marktconform',
      features: [
        'Profiteer van lage prijzen',
        'Maandelijks opzegbaar',
        'Volledige transparantie'
      ],
      idealFor: 'MKB, horeca, flexibele bedrijven',
      href: '/producten/dynamisch-contract',
      popular: true
    },
    {
      id: 'maatwerk',
      icon: Diamond,
      color: 'purple',
      title: 'Maatwerk Contract',
      subtitle: 'Voor grootverbruikers',
      description: 'Volume = voordeel',
      features: [
        'Bundeling van volumes',
        'Scherp onderhandelde tarieven',
        'Persoonlijke accountmanager'
      ],
      idealFor: 'Vanaf 60.000 kWh of 10.000 m³',
      href: '/producten/maatwerk-contract'
    }
  ]

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border' | 'hover') => {
    const colors = {
      navy: {
        bg: 'bg-brand-navy-500',
        text: 'text-brand-navy-600',
        border: 'border-brand-navy-400',
        hover: 'hover:border-brand-navy-500'
      },
      teal: {
        bg: 'bg-brand-teal-500',
        text: 'text-brand-teal-600',
        border: 'border-brand-teal-500',
        hover: 'hover:border-brand-teal-500'
      },
      purple: {
        bg: 'bg-brand-brand-brand-purple-500',
        text: 'text-brand-brand-purple-600',
        border: 'border-brand-brand-brand-purple-500',
        hover: 'hover:border-brand-brand-brand-purple-500'
      }
    }
    return colors[color as keyof typeof colors][type]
  }

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      {/* Top divider */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-teal-500 to-transparent opacity-30" />
      
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-brand-navy-500 mb-4">
            Hoe wil jij energie afnemen?
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Elk bedrijf is uniek. Kies de contractvorm die perfect bij jouw situatie past.
          </p>
        </div>

        {/* Contract Cards - Mobile: Stack, Desktop: 3 columns */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {contracts.map((contract) => {
            const Icon = contract.icon
            return (
              <div
                key={contract.id}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                  contract.popular 
                    ? `${getColorClasses(contract.color, 'border')}` 
                    : 'border-gray-200 ' + getColorClasses(contract.color, 'hover')
                }`}
              >
                {contract.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-brand-teal-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    Populair
                  </div>
                )}

                <div className="p-6 md:p-8">
                  {/* Icon */}
                  <div className={`w-14 h-14 md:w-16 md:h-16 ${getColorClasses(contract.color, 'bg')} rounded-2xl flex items-center justify-center mb-4`}>
                    <Icon weight="duotone" className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-xl md:text-2xl font-bold text-brand-navy-500 mb-1">
                    {contract.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{contract.subtitle}</p>
                  
                  {/* Description */}
                  <p className={`text-base md:text-lg font-semibold ${getColorClasses(contract.color, 'text')} mb-6`}>
                    {contract.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {contract.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm md:text-base">
                        <Check weight="bold" className={`w-5 h-5 ${getColorClasses(contract.color, 'text')} flex-shrink-0 mt-0.5`} />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Ideal for */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="text-xs font-semibold text-gray-600 mb-1">Ideaal voor:</div>
                    <div className="text-sm font-medium text-brand-navy-500">{contract.idealFor}</div>
                  </div>

                  {/* CTA */}
                  <Link href={contract.href} className="block">
                    <button className={`w-full px-6 py-3 ${getColorClasses(contract.color, 'bg')} hover:opacity-90 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all`}>
                      Meer informatie
                      <ArrowRight weight="bold" className="w-5 h-5" />
                    </button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            Niet zeker welk contract het beste bij je past?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/producten">
              <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-brand-navy-500 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                Vergelijk alle opties
                <ArrowRight weight="bold" className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/calculator">
              <button className="px-6 py-3 bg-brand-teal-500 hover:bg-brand-teal-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                <Lightning weight="duotone" className="w-5 h-5" />
                Bereken je besparing
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

