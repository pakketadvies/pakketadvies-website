'use client'

import Link from 'next/link'
import Image from 'next/image'
import { QuickCalculator } from '@/components/calculator/QuickCalculator'
import { HomepageBestDeals } from '@/components/sections/HomepageBestDeals'

interface HeroProps {
  initialBestDeals?: {
    contracten: any[]
    averagePrice: number
  }
}

export function Hero({ initialBestDeals }: HeroProps = {} as HeroProps) {
  console.log('🔵 [Hero] Rendered with initialBestDeals:', initialBestDeals?.contracten?.length || 0, 'contracts')
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
        <div className="lg:hidden space-y-8">
          {/* Best Deals Section - Mobile */}
          <div className="w-full px-4">
            <HomepageBestDeals initialData={initialBestDeals} />
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
                    <span className="text-sm">2.500+ reviews</span>
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
          <div className="w-full px-4">
            <Link href="/contact" className="block">
              <button className="w-full px-6 py-4 bg-white text-brand-navy-500 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl">
                Vraag een offerte aan
              </button>
            </Link>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-start">
          {/* Best Deals Section */}
          <div className="sticky top-8">
            <HomepageBestDeals initialData={initialBestDeals} />
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
