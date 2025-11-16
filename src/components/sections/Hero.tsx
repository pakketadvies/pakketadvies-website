'use client'

import Link from 'next/link'
import Image from 'next/image'
import { QuickCalculator } from '@/components/calculator/QuickCalculator'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-brand-navy-500">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-main.jpg"
          alt="Professional business meeting"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-500/95 via-brand-navy-600/90 to-brand-navy-700/95" />
      </div>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-teal-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-teal-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container-custom py-20 md:py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-slide-up">
            {/* Heading */}
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Stop met te veel betalen voor{' '}
              <span className="text-brand-teal-500">
                energie
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl">
              We bemiddelen het beste energiecontract voor jouw bedrijf. Geen gedoe, 
              volledig transparant en altijd met jouw voordeel voorop.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact">
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  Plan een gesprek
                </button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">500+</div>
                <div className="text-sm text-gray-400">Bedrijven geholpen</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">€2M+</div>
                <div className="text-sm text-gray-400">Totaal bespaard</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">4.9</div>
                <div className="text-sm text-gray-400">Gemiddelde score</div>
              </div>
            </div>
          </div>

          {/* Quick Calculator Widget */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <QuickCalculator />
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  )
}
