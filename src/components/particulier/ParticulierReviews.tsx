'use client'

import { Star } from '@phosphor-icons/react'
import { Card, CardContent } from '@/components/ui/Card'

const reviews = [
  {
    naam: 'Marieke van der Berg',
    locatie: 'Amsterdam',
    rating: 5,
    besparing: '€420',
    tekst: 'Super service! Binnen 2 weken was ik overgestapt en bespaar ik nu €420 per jaar. Alles werd voor me geregeld, echt top!',
  },
  {
    naam: 'Jan de Vries',
    locatie: 'Rotterdam',
    rating: 5,
    besparing: '€380',
    tekst: 'Zeer tevreden over het advies. Duidelijk uitgelegd welke leverancier het beste bij mijn situatie past. Aanrader!',
  },
  {
    naam: 'Lisa Jansen',
    locatie: 'Utrecht',
    rating: 5,
    besparing: '€450',
    tekst: 'Eindelijk een partij die echt in mijn belang werkt. Geen verborgen kosten, transparant en snel geregeld.',
  },
]

export function ParticulierReviews() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container-custom max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
            Wat zeggen onze klanten?
          </h2>
          <p className="text-lg text-gray-600">
            Meer dan 2.500 particulieren gingen je voor
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <Card key={index} className="hover-lift">
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} weight="fill" className="w-5 h-5 text-yellow-400" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-gray-700 mb-4 leading-relaxed italic">
                  "{review.tekst}"
                </p>

                {/* Author */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="font-semibold text-brand-navy-500">{review.naam}</div>
                  <div className="text-sm text-gray-600">{review.locatie}</div>
                  <div className="text-sm font-semibold text-brand-teal-600 mt-1">
                    Bespaart €{review.besparing}/jaar
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

