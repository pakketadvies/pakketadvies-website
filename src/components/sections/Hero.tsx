'use client'

import Link from 'next/link'
import Image from 'next/image'
import { QuickCalculator } from '@/components/calculator/QuickCalculator'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-brand-navy-500 pt-20 md:pt-24">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-main.jpg"
          alt="Professional business meeting"
          fill
          className="object-cover opacity-15 md:opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-500/95 via-brand-navy-600/90 to-brand-navy-700/95" />
      </div>

      <div className="container-custom py-8 md:py-12 lg:py-20 relative z-10 w-full">
        {/* Mobile Layout */}
        <div className="lg:hidden space-y-8">
          {/* Heading */}
          <div className="text-center px-4">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
              Stop met te veel betalen voor{' '}
              <span className="text-brand-teal-500">energie</span>
            </h1>
            <p className="text-base text-gray-300 leading-relaxed">
              We bemiddelen het beste energiecontract voor jouw bedrijf.
            </p>
          </div>

          {/* Calculator - Prominent on mobile */}
          <div className="w-full px-4">
            <QuickCalculator />
          </div>

          {/* Trust indicators - Compact on mobile */}
          <div className="grid grid-cols-3 gap-3 px-4 pt-4">
            <div className="text-center">
              <div className="text-xl font-bold text-white mb-0.5">500+</div>
              <div className="text-xs text-gray-400">Bedrijven</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white mb-0.5">€2M+</div>
              <div className="text-xs text-gray-400">Bespaard</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white mb-0.5">4.9</div>
              <div className="text-xs text-gray-400">Score</div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="px-4">
            <Link href="/contact" className="block">
              <button className="w-full px-6 py-3.5 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300">
                Plan een gratis gesprek
              </button>
            </Link>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            {/* Heading */}
            <h1 className="font-display text-5xl xl:text-7xl font-bold text-white leading-tight">
              Stop met te veel betalen voor{' '}
              <span className="text-brand-teal-500">energie</span>
            </h1>

            {/* Description */}
            <p className="text-lg lg:text-xl text-gray-300 leading-relaxed max-w-2xl">
              We bemiddelen het beste energiecontract voor jouw bedrijf. Geen gedoe, 
              volledig transparant en altijd met jouw voordeel voorop.
            </p>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-6 pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">500+</div>
                <div className="text-sm text-gray-400">Bedrijven</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">€2M+</div>
                <div className="text-sm text-gray-400">Bespaard</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">4.9</div>
                <div className="text-sm text-gray-400">Score</div>
              </div>
            </div>

            {/* Desktop CTA Button */}
            <div className="pt-4">
              <Link href="/contact">
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  Plan een gratis gesprek
                </button>
              </Link>
            </div>
          </div>

          {/* Quick Calculator Widget */}
          <div className="w-full">
            <QuickCalculator />
          </div>
        </div>
      </div>

      {/* Bottom energy flow transition */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-16 md:h-auto">
          {/* Main white background */}
          <path d="M0,40 Q360,10 720,40 T1440,40 L1440,120 L0,120 Z" fill="white"/>
          
          {/* Subtle teal energy accent line */}
          <path 
            d="M0,40 Q360,10 720,40 T1440,40" 
            stroke="url(#energyGradient)" 
            strokeWidth="2" 
            fill="none"
            opacity="0.4"
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00AF9B" stopOpacity="0" />
              <stop offset="20%" stopColor="#00AF9B" stopOpacity="1" />
              <stop offset="50%" stopColor="#00AF9B" stopOpacity="1" />
              <stop offset="80%" stopColor="#00AF9B" stopOpacity="1" />
              <stop offset="100%" stopColor="#00AF9B" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  )
}
