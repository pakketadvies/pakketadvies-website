'use client'

import { Star, Quotes, User } from '@phosphor-icons/react'

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
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-teal-500 to-transparent opacity-30" />
      
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm">
            <Star weight="duotone" className="w-5 h-5 text-brand-teal-600" />
            <span className="text-sm font-semibold text-brand-navy-600">
              4.9/5 gemiddelde beoordeling
            </span>
          </div>
          
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-brand-navy-500">
            Wat onze klanten{' '}
            <span className="gradient-text">zeggen</span>
          </h2>
          
          <p className="text-lg text-gray-600">
            Sluit je aan bij honderden tevreden bedrijven die al besparen met PakketAdvies
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-3xl p-8 border border-gray-200 hover-lift hover:border-brand-teal-500/50 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Quote icon */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-brand-teal-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Quotes weight="bold" className="w-6 h-6 text-white" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} weight="fill" className="w-5 h-5 text-brand-teal-500" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                <div className="w-12 h-12 bg-brand-navy-500 rounded-2xl flex items-center justify-center">
                  <User weight="duotone" className="w-6 h-6 text-brand-teal-500" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-brand-navy-500">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-xs text-gray-500">{testimonial.company}</div>
                </div>
              </div>

              {/* Savings badge */}
              <div className="absolute -bottom-3 -right-3 px-4 py-2 bg-brand-teal-500 text-white rounded-xl shadow-lg font-bold text-sm">
                {testimonial.savings} bespaard
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-brand-navy-500 mb-2">
              500+
            </div>
            <div className="text-gray-600 font-medium">Tevreden klanten</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-brand-navy-500 mb-2">
              €2M+
            </div>
            <div className="text-gray-600 font-medium">Totaal bespaard</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-brand-navy-500 mb-2">
              4.9
            </div>
            <div className="text-gray-600 font-medium">Gemiddelde score</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-brand-navy-500 mb-2">
              98%
            </div>
            <div className="text-gray-600 font-medium">Aanbeveelt ons</div>
          </div>
        </div>
      </div>
    </section>
  )
}
