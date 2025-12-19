'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle } from '@phosphor-icons/react'

export function ParticulierCTA() {
  return (
    <section className="py-16 md:py-24 bg-brand-navy-500 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-main.jpg"
          alt="Energie vergelijken"
          fill
          className="object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-500/95 via-brand-navy-600/90 to-brand-teal-600/85" />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Klaar om te besparen op je energiekosten?
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Start vandaag nog met onze gratis vergelijking en ontdek hoeveel je kunt besparen met een beter energiecontract.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/calculator">
              <button className="w-full sm:w-auto px-8 py-4 bg-brand-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-brand-teal-500/30 hover:shadow-xl hover:shadow-brand-teal-500/40 hover:scale-105 hover:bg-brand-teal-600 transition-all duration-300 inline-flex items-center justify-center gap-2 text-lg">
                Start vergelijking
                <ArrowRight weight="bold" className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/contact">
              <button className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold border border-white/20 transition-all duration-300 text-lg">
                Neem contact op
              </button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-400" />
              <span>Gratis en vrijblijvend</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-400" />
              <span>Binnen 24 uur reactie</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-400" />
              <span>2.500+ tevreden klanten</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

