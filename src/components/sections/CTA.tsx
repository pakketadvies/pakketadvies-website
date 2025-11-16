'use client'

import Link from 'next/link'
import { Lightning, ArrowRight } from '@phosphor-icons/react'

export function CTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-brand-navy-950 via-brand-navy-900 to-dark-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-brand-navy-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-brand-teal-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-teal-500 to-brand-teal-600 rounded-3xl shadow-2xl shadow-brand-teal-500/50 animate-float">
            <Lightning weight="duotone" className="w-10 h-10 text-white" />
          </div>

          {/* Heading */}
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Klaar om te besparen op je{' '}
            <span className="bg-gradient-to-r from-brand-teal-400 to-brand-teal-400 bg-clip-text text-transparent">
              energiekosten?
            </span>
          </h2>

          {/* Description */}
          <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Start vandaag nog met onze gratis besparingscheck en ontdek hoeveel je 
            kunt besparen met een beter energiecontract.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/calculator">
              <button className="group relative px-8 py-4 bg-white text-brand-navy-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Start je besparingscheck
                  <ArrowRight weight="bold" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </Link>
            
            <Link href="/contact">
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-semibold text-lg border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300 hover:scale-105">
                Of neem contact op
              </button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-8 pt-12 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-teal-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Gratis en vrijblijvend</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-teal-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Binnen 2 weken geregeld</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-teal-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>500+ bedrijven gingen je voor</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top wave */}
      <div className="absolute top-0 left-0 right-0 rotate-180">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" fillOpacity="0.03"/>
        </svg>
      </div>
    </section>
  )
}
