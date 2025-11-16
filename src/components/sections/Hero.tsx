'use client'

import Link from 'next/link'
import { Lightning, ChartLineUp, ShieldCheck } from '@phosphor-icons/react'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-brand-navy-500 via-brand-navy-600 to-brand-navy-700">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-teal-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-teal-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container-custom py-20 md:py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark border border-brand-teal-500/30">
              <Lightning weight="duotone" className="w-5 h-5 text-brand-teal-500" />
              <span className="text-sm font-medium text-white">
                Specialist in zakelijke energiecontracten
              </span>
            </div>

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
              <Link href="/calculator">
                <button className="group relative px-8 py-4 bg-brand-teal-500 text-white rounded-2xl font-semibold text-lg shadow-2xl shadow-brand-teal-500/30 hover:shadow-brand-teal-500/50 hover:bg-brand-teal-600 transition-all duration-300 hover:scale-105">
                  <span className="flex items-center gap-2">
                    Bereken je besparing
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </Link>
              
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

          {/* Visual Side - Bento Grid Cards */}
          <div className="hidden lg:grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {/* Card 1 - Big */}
            <div className="col-span-2 glass-dark rounded-3xl p-8 border border-white/10 hover-lift group cursor-pointer">
              <ChartLineUp weight="duotone" className="w-12 h-12 text-brand-teal-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-white mb-2">Tot 40% besparing</h3>
              <p className="text-gray-300">Wij onderhandelen de beste tarieven voor jouw bedrijf</p>
            </div>

            {/* Card 2 */}
            <div className="glass-dark rounded-3xl p-6 border border-white/10 hover-lift group cursor-pointer">
              <Lightning weight="duotone" className="w-10 h-10 text-brand-teal-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2">Snel schakelen</h3>
              <p className="text-sm text-gray-300">Binnen 2 weken geregeld</p>
            </div>

            {/* Card 3 */}
            <div className="glass-dark rounded-3xl p-6 border border-white/10 hover-lift group cursor-pointer">
              <ShieldCheck weight="duotone" className="w-10 h-10 text-brand-teal-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2">Zorgeloos</h3>
              <p className="text-sm text-gray-300">Wij regelen alles van A tot Z</p>
            </div>
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
