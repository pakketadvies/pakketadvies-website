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
          className="object-cover opacity-20 md:opacity-25"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-500/90 via-brand-navy-600/85 to-brand-navy-700/90" />
      </div>

      <div className="container-custom py-8 md:py-12 lg:py-20 relative z-10 w-full">
        {/* Mobile Layout */}
        <div className="lg:hidden space-y-8 px-2">
          {/* Heading */}
          <div className="text-center px-2">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
              Stop met te veel betalen voor{' '}
              <span className="text-brand-teal-500">energie</span>
            </h1>
            <p className="text-base text-gray-300 leading-relaxed">
              We bemiddelen het beste energiecontract voor jouw bedrijf.
            </p>
          </div>

          {/* Calculator - Prominent on mobile, minder marge */}
          <div className="w-full">
            <QuickCalculator />
          </div>

          {/* Trust indicators - Compact on mobile */}
          <div className="flex items-center justify-center gap-6 pt-4 text-gray-300">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-teal-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
              <span className="text-sm">7.500+ klanten</span>
            </div>
            <div className="w-px h-6 bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-teal-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm">100% transparant</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="w-full">
            <Link href="/contact" className="block">
              <button className="w-full px-6 py-4 bg-white text-brand-navy-500 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl">
                Vraag een offerte aan
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
            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-brand-teal-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">7.500+</div>
                  <div className="text-sm text-gray-400">Tevreden klanten</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-brand-teal-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">€2M+</div>
                  <div className="text-sm text-gray-400">Totaal bespaard</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-brand-teal-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">4.9/5</div>
                  <div className="text-sm text-gray-400">Klantbeoordeling</div>
                </div>
              </div>
            </div>

            {/* Desktop CTA Button */}
            <div className="pt-4">
              <Link href="/contact">
                <button className="px-8 py-4 bg-white text-brand-navy-500 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl">
                  Vraag een offerte aan
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
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden">
        <svg 
          viewBox="0 0 1440 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-20 md:h-24 lg:h-auto"
          preserveAspectRatio="none"
        >
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
