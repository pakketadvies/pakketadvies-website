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
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-8 bg-white rounded-2xl md:rounded-3xl border border-gray-200 shadow-2xl p-4 md:p-6 lg:p-8">
            <div className="mb-5 md:mb-6">
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

          <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-28 bg-white rounded-2xl border border-gray-200 shadow-lg p-4 md:p-5">
            <h3 className="text-base md:text-lg font-bold text-brand-navy-500">Snel en vrijblijvend vergelijken</h3>
            <p className="text-sm text-gray-600 mt-1">Vul je gegevens in en bekijk direct je aanbiedingen.</p>

            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-teal-500 shrink-0" />
                <span>Alleen de noodzakelijke gegevens in stap 1</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-teal-500 shrink-0" />
                <span>Geavanceerde instellingen zijn optioneel</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-teal-500 shrink-0" />
                <span>Gratis en zonder verplichtingen</span>
              </li>
            </ul>

            <div className="mt-5 border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600">
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
          </aside>
        </div>

        <div className="lg:hidden mt-4 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-sm text-gray-600">
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


