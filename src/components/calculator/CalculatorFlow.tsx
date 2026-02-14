'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCalculatorStore } from '@/store/calculatorStore'
import { VerbruikForm } from '@/components/calculator/VerbruikForm'
import { BedrijfsgegevensForm } from '@/components/calculator/BedrijfsgegevensForm'
import { QuickStartStep } from '@/components/calculator/QuickStartStep'
import { ProgressBar } from '@/components/calculator/ProgressBar'
import { TRUST_COPY } from '@/lib/copy'

const TOTAL_STEPS = 2 // verbruik + bedrijfsgegevens (business flow)

function CalculatorContent() {
  const searchParams = useSearchParams()
  const { stap, setStap, verbruik } = useCalculatorStore()
  const isDirect = searchParams?.get('direct') === 'true'

  useEffect(() => {
    const stapParam = searchParams?.get('stap')
    if (stapParam) {
      const stapNumber = parseInt(stapParam, 10)
      if (stapNumber >= 1 && stapNumber <= TOTAL_STEPS) {
        setStap(stapNumber as 1 | 2)
      }
    }
  }, [searchParams, setStap])

  const showQuickStart = isDirect && stap === 2 && !verbruik
  const progressStep = showQuickStart ? 1 : stap
  const stepLabels = ['Verbruik en adres', 'Gegevens en aanvraag']

  return (
    <div className="container-custom">
      <div className="max-w-3xl lg:max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-200 shadow-2xl p-6 md:p-8 lg:p-10">
          <div className="mb-6 md:mb-8">
            <ProgressBar currentStep={progressStep} totalSteps={TOTAL_STEPS} stepLabels={stepLabels} />
          </div>
          {showQuickStart ? (
            <QuickStartStep />
          ) : (
            <>
              {stap === 1 && <VerbruikForm />}
              {stap === 2 && <BedrijfsgegevensForm />}
            </>
          )}
        </div>

        <div className="mt-6 md:mt-8 text-center">
          <p className="text-sm md:text-base text-gray-600">
            Vragen? Bel ons op{' '}
            <a href="tel:+31850477065" className="font-semibold text-brand-teal-600 hover:text-brand-teal-700 transition-colors">
              085 047 7065
            </a>{' '}
            of{' '}
            <a href="mailto:info@pakketadvies.nl" className="font-semibold text-brand-teal-600 hover:text-brand-teal-700 transition-colors">
              mail ons
            </a>
            .
          </p>
          <p className="text-xs text-gray-500 mt-2">{TRUST_COPY.secureDataLine}</p>
        </div>
      </div>
    </div>
  )
}

export function CalculatorFlow() {
  return (
    <Suspense fallback={<div className="pt-32 pb-16 text-center">Laden...</div>}>
      <CalculatorContent />
    </Suspense>
  )
}


