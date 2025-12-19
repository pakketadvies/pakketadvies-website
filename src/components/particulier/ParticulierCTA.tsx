'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ArrowRight, CheckCircle } from '@phosphor-icons/react'

export function ParticulierCTA() {
  return (
    <section className="py-16 md:py-24 bg-brand-navy-500 text-white relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-500/95 via-brand-navy-600/90 to-brand-teal-500/95" />
      </div>

      <div className="container-custom max-w-4xl text-center relative z-10">
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
          Klaar om te besparen?
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Start nu je gratis vergelijking en ontdek hoeveel je kunt besparen met een beter energiecontract.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link href="/calculator">
            <Button size="lg" variant="primary" className="bg-brand-teal-500 hover:bg-brand-teal-600 text-white">
              Start vergelijking
              <ArrowRight weight="bold" className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              Neem contact op
            </Button>
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
            <span>100.000+ tevreden klanten</span>
          </div>
        </div>
      </div>
    </section>
  )
}

