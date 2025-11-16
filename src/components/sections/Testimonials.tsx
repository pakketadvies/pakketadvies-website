'use client'

import { Star } from '@phosphor-icons/react'

const testimonials = [
  {
    name: 'Jan van der Berg',
    company: 'Van der Berg Installatietechniek',
    role: 'Directeur',
    content: 'PakketAdvies heeft ons binnen 2 weken geholpen met overstappen naar een veel voordeliger contract. We besparen nu €8.000 per jaar!',
    rating: 5,
    savings: '€8.000',
  },
  {
    name: 'Linda Hermans',
    company: 'Hermans & Zn. Bakkerij',
    role: 'Eigenaar',
    content: 'Eindelijk iemand die echt meedenkt. Geen gedoe, gewoon een eerlijk advies en een contract dat perfect past bij onze situatie.',
    rating: 5,
    savings: '€3.500',
  },
  {
    name: 'Mark Jansen',
    company: 'Jansen Transport B.V.',
    role: 'CFO',
    content: 'Transparantie en vakkennis op één plek. De vergelijking was helder en het hele proces vlekkeloos. Absolute aanrader!',
    rating: 5,
    savings: '€12.000',
  },
]

export function Testimonials() {
  return (
    <section className="py-20 bg-gray-50 border-b border-gray-200">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-50 border border-yellow-200">
            <Star weight="fill" className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold text-yellow-700">
              4.9/5 gemiddelde beoordeling
            </span>
          </div>
          
          <h2 className="font-bold text-4xl md:text-5xl text-brand-navy-500 tracking-tight">
            Wat onze klanten zeggen
          </h2>
          
          <p className="text-lg text-gray-600">
            Sluit je aan bij honderden tevreden bedrijven die al besparen met PakketAdvies
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative bg-white border border-gray-200 rounded-md p-6"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} weight="fill" className="w-4 h-4 text-yellow-500" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="pt-4 border-t border-gray-200">
                <div className="font-bold text-brand-navy-500 text-sm">{testimonial.name}</div>
                <div className="text-xs text-gray-600">{testimonial.role}</div>
                <div className="text-xs text-gray-500">{testimonial.company}</div>
              </div>

              {/* Savings badge */}
              <div className="absolute -top-3 -right-3 px-3 py-1 bg-brand-teal-500 text-white rounded-md font-bold text-xs">
                {testimonial.savings} bespaard
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto pt-12 border-t border-gray-200">
          <div className="text-center">
            <div className="text-4xl font-bold text-brand-navy-500 mb-1">500+</div>
            <div className="text-sm text-gray-600 font-medium">Tevreden klanten</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-brand-navy-500 mb-1">€2M+</div>
            <div className="text-sm text-gray-600 font-medium">Totaal bespaard</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-brand-navy-500 mb-1">4.9</div>
            <div className="text-sm text-gray-600 font-medium">Gemiddelde score</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-brand-navy-500 mb-1">98%</div>
            <div className="text-sm text-gray-600 font-medium">Aanbeveelt ons</div>
          </div>
        </div>
      </div>
    </section>
  )
}
