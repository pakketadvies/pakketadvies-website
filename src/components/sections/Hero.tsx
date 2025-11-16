'use client'

import Link from 'next/link'
import { ArrowRight, Check } from '@phosphor-icons/react'

export function Hero() {
  return (
    <section className="relative bg-white border-b border-gray-200">
      <div className="container-custom py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-teal-50 border border-brand-teal-200">
            <span className="text-sm font-semibold text-brand-teal-700">
              Specialist in zakelijke energiecontracten
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-bold text-5xl md:text-6xl lg:text-7xl text-brand-navy-500 leading-tight tracking-tight">
            Stop met te veel betalen voor energie
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            We bemiddelen het beste energiecontract voor jouw bedrijf. Geen gedoe, 
            volledig transparant en altijd met jouw voordeel voorop.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/calculator">
              <Button size="lg" className="gap-2">
                Bereken je besparing
                <ArrowRight weight="bold" className="w-5 h-5" />
              </Button>
            </Link>
            
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Plan een gesprek
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto border-t border-gray-200">
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-navy-500 mb-1">500+</div>
              <div className="text-sm text-gray-600 font-medium">Bedrijven geholpen</div>
            </div>
            <div className="text-center border-x border-gray-200">
              <div className="text-4xl font-bold text-brand-navy-500 mb-1">€2M+</div>
              <div className="text-sm text-gray-600 font-medium">Totaal bespaard</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-navy-500 mb-1">4.9</div>
              <div className="text-sm text-gray-600 font-medium">Gemiddelde score</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Import Button component
function Button({ children, size, variant, className }: any) {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-semibold transition-all duration-200"
  const sizeClasses = size === 'lg' ? 'px-8 py-3 text-base' : 'px-6 py-2.5 text-base'
  const variantClasses = variant === 'outline' 
    ? 'border-2 border-brand-navy-500 text-brand-navy-600 hover:bg-brand-navy-50' 
    : 'bg-brand-navy-500 text-white hover:bg-brand-navy-600 shadow-sm'
  
  return (
    <button className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className || ''}`}>
      {children}
    </button>
  )
}
