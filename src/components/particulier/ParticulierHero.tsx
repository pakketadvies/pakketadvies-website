'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { ArrowRight, CheckCircle, ShieldCheck, Users } from '@phosphor-icons/react'
import { QuickCalculator } from '@/components/calculator/QuickCalculator'

export function ParticulierHero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-brand-navy-500 via-brand-navy-600 to-brand-teal-500 pt-20 md:pt-24">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-main.jpg"
          alt="Energie vergelijken"
          fill
          className="object-cover opacity-20 md:opacity-25"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-500/90 via-brand-navy-600/85 to-brand-teal-500/90" />
      </div>

      <div className="container-custom py-8 md:py-12 lg:py-20 relative z-10 w-full">
        {/* Mobile Layout */}
        <div className="lg:hidden space-y-8">
          {/* Hero Content */}
          <div className="text-center px-4">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Vergelijk energieleveranciers en{' '}
              <span className="text-brand-teal-300">bespaar tot €500</span> per jaar
            </h1>
            <p className="text-lg text-gray-200 mb-8">
              Vind in 2 minuten het beste energiecontract voor jouw situatie. Gratis, onafhankelijk en volledig vrijblijvend.
            </p>
          </div>

          {/* Calculator - Prominent on mobile */}
          <div className="w-full">
            <QuickCalculator />
          </div>

          {/* Trust indicators - Compact on mobile */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-gray-200">
            <div className="flex items-center gap-2">
              <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-300" />
              <span className="text-sm">100.000+ tevreden klanten</span>
            </div>
            <div className="w-px h-6 bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <ShieldCheck weight="fill" className="w-5 h-5 text-brand-teal-300" />
              <span className="text-sm">100% onafhankelijk</span>
            </div>
            <div className="w-px h-6 bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <Users weight="fill" className="w-5 h-5 text-brand-teal-300" />
              <span className="text-sm">Gratis & vrijblijvend</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="w-full px-4">
            <Link href="/calculator" className="block">
              <button className="w-full px-6 py-4 bg-white text-brand-navy-500 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl">
                Start vergelijking
              </button>
            </Link>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-start">
          {/* Hero Content */}
          <div className="sticky top-8">
            <h1 className="font-display text-5xl lg:text-6xl font-bold text-white mb-6">
              Vergelijk energieleveranciers en{' '}
              <span className="text-brand-teal-300">bespaar tot €500</span> per jaar
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Vind in 2 minuten het beste energiecontract voor jouw situatie. Gratis, onafhankelijk en volledig vrijblijvend.
            </p>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 mb-8 text-gray-200">
              <div className="flex items-center gap-2">
                <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-300" />
                <span>100.000+ tevreden klanten</span>
              </div>
              <div className="w-px h-8 bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <ShieldCheck weight="fill" className="w-5 h-5 text-brand-teal-300" />
                <span>100% onafhankelijk</span>
              </div>
            </div>

            <Link href="/calculator">
              <Button size="lg" variant="primary" className="bg-white text-brand-navy-500 hover:bg-gray-50">
                Start vergelijking
                <ArrowRight weight="bold" className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Quick Calculator Widget */}
          <div className="w-full">
            <QuickCalculator />
          </div>
        </div>
      </div>

      {/* Bottom energy flow transition */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden">
        <svg 
          viewBox="0 0 1440 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-20 md:h-24 lg:h-auto"
          preserveAspectRatio="none"
        >
          <path d="M0,40 Q360,10 720,40 T1440,40 L1440,120 L0,120 Z" fill="white"/>
          <path 
            d="M0,40 Q360,10 720,40 T1440,40" 
            stroke="url(#energyGradient)" 
            strokeWidth="2" 
            fill="none"
            opacity="0.4"
          />
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

