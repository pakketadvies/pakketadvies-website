'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Lightning, ArrowRight, CheckCircle } from '@phosphor-icons/react'

export function CTA() {
  return (
    <section className="py-24 bg-brand-navy-500 relative overflow-hidden">
      {/* Top divider */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-teal-500 to-transparent opacity-50" />
      
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/solar-roof.jpg"
          alt="Solar panels on business roof"
          fill
          className="object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-500/95 via-brand-navy-600/90 to-brand-navy-700/95" />
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-brand-teal-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-brand-teal-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-teal-500 rounded-3xl shadow-2xl shadow-brand-teal-500/50 animate-float">
            <Lightning weight="duotone" className="w-10 h-10 text-white" />
          </div>

          {/* Heading */}
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Klaar om te besparen op je{' '}
            <span className="text-brand-teal-500">
              energiekosten?
            </span>
          </h2>

          {/* Description */}
          <p className="text-xl text-gray-300 leading-relaxed">
            Start vandaag nog met onze gratis besparingscheck en ontdek hoeveel je 
            kunt besparen met een beter energiecontract.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/calculator">
              <button className="group relative px-8 py-4 bg-brand-teal-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-brand-teal-500/50 transition-all duration-300 hover:scale-105 hover:bg-brand-teal-600">
                <span className="flex items-center gap-2">
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
          <div className="flex flex-wrap justify-center gap-8 pt-12 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <CheckCircle weight="bold" className="w-5 h-5 text-brand-teal-500" />
              <span>Gratis en vrijblijvend</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle weight="bold" className="w-5 h-5 text-brand-teal-500" />
              <span>Binnen 2 weken geregeld</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle weight="bold" className="w-5 h-5 text-brand-teal-500" />
              <span>500+ bedrijven gingen je voor</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
