'use client'

import Link from 'next/link'
import { ArrowRight, Check } from '@phosphor-icons/react'

export function CTA() {
  return (
    <section className="py-20 bg-brand-navy-500 border-b border-brand-navy-600">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Heading */}
          <h2 className="font-bold text-4xl md:text-5xl text-white tracking-tight">
            Klaar om te besparen op je energiekosten?
          </h2>

          {/* Description */}
          <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Start vandaag nog met onze gratis besparingscheck en ontdek hoeveel je 
            kunt besparen met een beter energiecontract.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/calculator">
              <button className="inline-flex items-center gap-2 px-8 py-3 bg-white text-brand-navy-600 rounded-md font-semibold shadow-sm hover:bg-gray-50 transition-colors">
                Start je besparingscheck
                <ArrowRight weight="bold" className="w-5 h-5" />
              </button>
            </Link>
            
            <Link href="/contact">
              <button className="px-8 py-3 bg-brand-teal-500 text-white rounded-md font-semibold hover:bg-brand-teal-600 transition-colors">
                Of neem contact op
              </button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Check weight="bold" className="w-5 h-5 text-brand-teal-500" />
              <span>Gratis en vrijblijvend</span>
            </div>
            <div className="flex items-center gap-2">
              <Check weight="bold" className="w-5 h-5 text-brand-teal-500" />
              <span>Binnen 2 weken geregeld</span>
            </div>
            <div className="flex items-center gap-2">
              <Check weight="bold" className="w-5 h-5 text-brand-teal-500" />
              <span>500+ bedrijven gingen je voor</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
