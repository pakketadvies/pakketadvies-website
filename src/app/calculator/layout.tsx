'use client'

import { ReactNode } from 'react'
import { Lightning } from '@phosphor-icons/react'

export default function CalculatorLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero Section */}
      <div className="pt-32 pb-16 bg-brand-navy-500 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-brand-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-brand-teal-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-teal-500 rounded-2xl shadow-2xl shadow-brand-teal-500/50 mb-4">
              <Lightning weight="duotone" className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Bereken je{' '}
              <span className="text-brand-teal-500">
                besparing
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed">
              In een paar minuten weten hoeveel je kunt besparen met een beter energiecontract
            </p>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 32.5C840 35 960 40 1080 42.5C1200 45 1320 45 1380 45L1440 45V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="#FFFFFF"/>
          </svg>
        </div>
      </div>

      {/* Calculator Content */}
      <main className="flex-grow bg-gray-50">
        {children}
      </main>
    </div>
  )
}
