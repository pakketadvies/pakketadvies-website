'use client'

import { ReactNode } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function CalculatorLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="py-16 bg-brand-navy-500 border-b border-brand-navy-600">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="font-bold text-4xl md:text-5xl text-white tracking-tight">
              Bereken je besparing
            </h1>
            
            <p className="text-lg text-gray-300">
              In een paar minuten weten hoeveel je kunt besparen met een beter energiecontract
            </p>
          </div>
        </div>
      </div>

      {/* Calculator Content */}
      <main className="flex-grow">
        {children}
      </main>

      <Footer />
    </div>
  )
}
