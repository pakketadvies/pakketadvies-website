'use client'

import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, ShieldCheck, Users } from '@phosphor-icons/react'

export function ParticulierHero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-brand-navy-500 via-brand-navy-600 to-brand-teal-600 pt-20 md:pt-24">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-main.jpg"
          alt="Energie vergelijken"
          fill
          className="object-cover opacity-20 md:opacity-25"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-500/90 via-brand-navy-600/85 to-brand-teal-600/80" />
      </div>

      <div className="container-custom py-12 md:py-20 relative z-10 w-full">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-teal-500/20 border border-brand-teal-400/30 mb-6">
            <CheckCircle weight="duotone" className="w-5 h-5 text-brand-teal-300" />
            <span className="text-sm font-semibold text-brand-teal-200">100% Gratis & Onafhankelijk</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Vergelijk energieleveranciers en{' '}
            <span className="text-brand-teal-400">bespaar tot €500</span> per jaar
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            Vind in 2 minuten het beste energiecontract voor jouw situatie. 
            Volledig gratis, onafhankelijk en zonder verplichtingen.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mb-10 text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                <Users weight="duotone" className="w-5 h-5 text-brand-teal-300" />
              </div>
              <div className="text-left">
                <div className="text-sm text-gray-400">2.500+ reviews</div>
                <div className="font-semibold text-white">Gemiddeld 4.8/5</div>
              </div>
            </div>
            
            <div className="w-px h-8 bg-gray-600"></div>
            
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                <ShieldCheck weight="duotone" className="w-5 h-5 text-brand-teal-300" />
              </div>
              <div className="text-left">
                <div className="text-sm text-gray-400">100% onafhankelijk</div>
                <div className="font-semibold text-white">Altijd in jouw belang</div>
              </div>
            </div>

            <div className="w-px h-8 bg-gray-600"></div>
            
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                <CheckCircle weight="duotone" className="w-5 h-5 text-brand-teal-300" />
              </div>
              <div className="text-left">
                <div className="text-sm text-gray-400">Volledig gratis</div>
                <div className="font-semibold text-white">Geen verborgen kosten</div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calculator">
              <button className="w-full sm:w-auto px-8 py-4 bg-brand-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-brand-teal-500/30 hover:shadow-xl hover:shadow-brand-teal-500/40 hover:scale-105 hover:bg-brand-teal-600 transition-all duration-300 text-lg">
                Start vergelijking
              </button>
            </Link>
            <Link href="/particulier/overstappen">
              <button className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold border border-white/20 transition-all duration-300 text-lg">
                Meer over overstappen
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom transition */}
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

