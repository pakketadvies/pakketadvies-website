'use client'

import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'

// Force dynamic rendering to avoid SSR issues with ModeContext
export const dynamic = 'force-dynamic'

export default function ParticulierEnergieprijzenPage() {
  return (
    <div className="min-h-screen bg-white pt-20 md:pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-navy-500 via-brand-navy-600 to-brand-teal-500 text-white py-16 md:py-24 pb-20 md:pb-28 relative overflow-hidden">
        <div className="container-custom max-w-6xl relative z-10">
          <div className="max-w-4xl">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Energieprijzen voor particulieren
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Bekijk actuele en historische marktprijzen voor elektriciteit en gas. Deze prijzen helpen je bij het kiezen van het juiste energiecontract.
            </p>
          </div>
        </div>
      </section>

      {/* Redirect to main energieprijzen page */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom max-w-4xl text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
              Bekijk alle energieprijzen
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Voor gedetailleerde energieprijzen, grafieken en historische data, bezoek onze energieprijzen pagina.
            </p>
            <Link href="/kennisbank/energieprijzen">
              <Button size="lg" variant="primary" className="bg-brand-teal-500 hover:bg-brand-teal-600 text-white">
                Bekijk energieprijzen
                <ArrowRight weight="bold" className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

