'use client'

import Link from 'next/link'
import { Storefront, Buildings, Factory, Plant, Hospital, Briefcase, ArrowRight } from '@phosphor-icons/react'

export function Sectors() {
  const sectors = [
    {
      id: 'horeca',
      icon: Storefront,
      title: 'Horeca',
      description: 'Restaurants, hotels, cafés',
      highlights: ['Flexibele contracten', 'Piekverbruik oplossingen'],
      color: 'from-orange-500 to-orange-600',
      href: '/sectoren/horeca'
    },
    {
      id: 'retail',
      icon: Storefront,
      title: 'Retail',
      description: 'Winkels en winkelketens',
      highlights: ['Portfolio beheer', 'Meerdere vestigingen'],
      color: 'from-blue-500 to-blue-600',
      href: '/sectoren/retail'
    },
    {
      id: 'vastgoed',
      icon: Buildings,
      title: 'Vastgoed',
      description: 'Beleggers en beheerders',
      highlights: ['ESG-rapportage', 'Centrale inkoop'],
      color: 'from-purple-500 to-purple-600',
      href: '/sectoren/vastgoed'
    },
    {
      id: 'industrie',
      icon: Factory,
      title: 'Industrie',
      description: 'Productie en maakindustrie',
      highlights: ['Grootverbruik', 'Volume voordeel'],
      color: 'from-gray-600 to-gray-700',
      href: '/sectoren/industrie'
    },
    {
      id: 'agrarisch',
      icon: Plant,
      title: 'Agrarisch',
      description: 'Glastuinbouw en telers',
      highlights: ['WKK-integratie', 'Seizoenscontracten'],
      color: 'from-green-500 to-green-600',
      href: '/sectoren/agrarisch'
    },
    {
      id: 'kantoren',
      icon: Briefcase,
      title: 'Kantoren',
      description: 'Zakelijke dienstverlening',
      highlights: ['Groene energie', 'Budgetzekerheid'],
      color: 'from-brand-teal-500 to-brand-teal-600',
      href: '/sectoren/kantoren'
    }
  ]

  return (
    <section className="py-16 md:py-24 bg-gray-50 relative overflow-hidden">
      {/* Top divider */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-teal-500 to-transparent opacity-30" />
      
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-brand-navy-500 mb-4">
            Voor elke sector de juiste oplossing
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Wij begrijpen de specifieke energie-uitdagingen van jouw branche en bieden oplossingen op maat.
          </p>
        </div>

        {/* Sector Cards - Mobile: 2 cols, Tablet: 2 cols, Desktop: 3 cols */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
          {sectors.map((sector) => {
            const Icon = sector.icon
            return (
              <Link
                key={sector.id}
                href={sector.href}
                className="group block bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <div className={`h-3 bg-gradient-to-r ${sector.color}`} />
                
                <div className="p-4 md:p-6">
                  {/* Icon */}
                  <div className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${sector.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon weight="duotone" className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-lg md:text-xl font-bold text-brand-navy-500 mb-1">
                    {sector.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 mb-4">{sector.description}</p>

                  {/* Highlights */}
                  <ul className="space-y-2 mb-4">
                    {sector.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs md:text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-brand-teal-500 rounded-full flex-shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Arrow */}
                  <div className="flex items-center gap-2 text-brand-teal-600 font-semibold text-sm group-hover:gap-3 transition-all">
                    <span>Meer informatie</span>
                    <ArrowRight weight="bold" className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-12 text-center">
          <h3 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
            Staat jouw sector er niet tussen?
          </h3>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Geen probleem! We helpen bedrijven uit alle branches met hun energiecontracten. 
            Neem contact op voor een vrijblijvend adviesgesprek.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sectoren">
              <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-brand-navy-500 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                Alle sectoren
                <ArrowRight weight="bold" className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-6 py-3 bg-brand-teal-500 hover:bg-brand-teal-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                Plan gratis gesprek
                <ArrowRight weight="bold" className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

