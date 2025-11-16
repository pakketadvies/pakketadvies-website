'use client'

import { useCalculatorStore } from '@/store/calculatorStore'
import { ProgressBar } from '@/components/calculator/ProgressBar'
import { VerbruikForm } from '@/components/calculator/VerbruikForm'
import { BedrijfsgegevensForm } from '@/components/calculator/BedrijfsgegevensForm'
import { VoorkeurenForm } from '@/components/calculator/VoorkeurenForm'

const TOTAL_STEPS = 3

export default function CalculatorPage() {
  const { stap } = useCalculatorStore()

  return (
    <div className="py-16">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="mb-12">
            <ProgressBar currentStep={stap} totalSteps={TOTAL_STEPS} />
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-8 md:p-12">
            {stap === 1 && <VerbruikForm />}
            {stap === 2 && <BedrijfsgegevensForm />}
            {stap === 3 && <VoorkeurenForm />}
          </div>

          {/* Help text */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Vragen? Bel ons op{' '}
              <a href="tel:+31201234567" className="font-semibold text-primary-600 hover:text-primary-700">
                020 123 4567
              </a>
              {' '}of{' '}
              <a href="mailto:info@pakketadvies.nl" className="font-semibold text-primary-600 hover:text-primary-700">
                mail ons
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
