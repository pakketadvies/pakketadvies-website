'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCalculatorStore } from '@/store/calculatorStore'
import { ProgressBar } from '@/components/calculator/ProgressBar'
import { VerbruikForm } from '@/components/calculator/VerbruikForm'
import { BedrijfsgegevensForm } from '@/components/calculator/BedrijfsgegevensForm'

const TOTAL_STEPS = 2  // Alleen verbruik en bedrijfsgegevens

function CalculatorContent() {
  const searchParams = useSearchParams()
  const { stap, setStap } = useCalculatorStore()

  // Check for stap query parameter and set step accordingly
  useEffect(() => {
    const stapParam = searchParams?.get('stap')
    if (stapParam) {
      const stapNumber = parseInt(stapParam, 10)
      if (stapNumber >= 1 && stapNumber <= TOTAL_STEPS) {
        setStap(stapNumber as 1 | 2)
      }
    }
  }, [searchParams, setStap])

  return (
    <div className="pt-24 pb-12 md:pt-28 md:pb-16">
      <div className="container-custom">
        {/* Hero tekst - compact */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-brand-teal-500 rounded-2xl mb-4">
            <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-navy-500 mb-2">
            Bereken je besparing
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            In een paar minuten weten hoeveel je kunt besparen met een beter energiecontract
          </p>
        </div>

        {/* Desktop: max-w-5xl voor meer horizontale ruimte, mobiel: max-w-3xl */}
        <div className="max-w-3xl lg:max-w-5xl mx-auto">
          {/* Progress */}
          <div className="mb-6 md:mb-8">
            <ProgressBar currentStep={stap} totalSteps={TOTAL_STEPS} />
          </div>

          {/* Form Card - Desktop: compactere padding */}
          <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-200 shadow-2xl p-6 md:p-8 lg:p-10">
            {stap === 1 && <VerbruikForm />}
            {stap === 2 && <BedrijfsgegevensForm />}
          </div>

          {/* Help text */}
          <div className="mt-6 md:mt-8 text-center">
            <p className="text-sm md:text-base text-gray-600">
              Vragen? Bel ons op{' '}
              <a href="tel:+31850477065" className="font-semibold text-brand-teal-600 hover:text-brand-teal-700 transition-colors">
                085 047 7065
              </a>
              {' '}of{' '}
              <a href="mailto:info@pakketadvies.nl" className="font-semibold text-brand-teal-600 hover:text-brand-teal-700 transition-colors">
                mail ons
              </a>
            </p>
            <p className="text-xs text-gray-500 mt-2">Je gegevens worden veilig opgeslagen en niet gedeeld met derden</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CalculatorPage() {
  return (
    <Suspense fallback={<div className="pt-32 pb-16 text-center">Laden...</div>}>
      <CalculatorContent />
    </Suspense>
  )
}
