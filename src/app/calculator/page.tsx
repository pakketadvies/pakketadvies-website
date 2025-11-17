'use client'

import { useCalculatorStore } from '@/store/calculatorStore'
import { ProgressBar } from '@/components/calculator/ProgressBar'
import { VerbruikForm } from '@/components/calculator/VerbruikForm'
import { BedrijfsgegevensForm } from '@/components/calculator/BedrijfsgegevensForm'
import { VoorkeurenForm } from '@/components/calculator/VoorkeurenForm'
import { Users, ShieldCheck, Clock } from '@phosphor-icons/react'

const TOTAL_STEPS = 3

export default function CalculatorPage() {
  const { stap } = useCalculatorStore()

  return (
    <div className="pt-32 pb-16">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="mb-8 md:mb-12">
            <ProgressBar currentStep={stap} totalSteps={TOTAL_STEPS} />
          </div>

          {/* Social Proof Bar - Only on step 1 */}
          {stap === 1 && (
            <div className="mb-6 bg-brand-teal-50 border border-brand-teal-200 rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm">
                <div className="flex items-center gap-2 text-brand-teal-700">
                  <Users weight="duotone" className="w-5 h-5" />
                  <span className="font-medium">7.500+ bedrijven gingen je voor</span>
                </div>
                <div className="hidden md:block w-px h-6 bg-brand-teal-300"></div>
                <div className="flex items-center gap-2 text-brand-teal-700">
                  <Clock weight="duotone" className="w-5 h-5" />
                  <span className="font-medium">Gemiddeld €450/mnd bespaard</span>
                </div>
                <div className="hidden md:block w-px h-6 bg-brand-teal-300"></div>
                <div className="flex items-center gap-2 text-brand-teal-700">
                  <ShieldCheck weight="duotone" className="w-5 h-5" />
                  <span className="font-medium">100% vrijblijvend</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-200 shadow-2xl p-6 md:p-8 lg:p-12">
            {stap === 1 && <VerbruikForm />}
            {stap === 2 && <BedrijfsgegevensForm />}
            {stap === 3 && <VoorkeurenForm />}
          </div>

          {/* Help text */}
          <div className="mt-6 md:mt-8 text-center">
            <p className="text-sm md:text-base text-gray-600">
              Vragen? Bel ons op{' '}
              <a href="tel:+31201234567" className="font-semibold text-brand-teal-600 hover:text-brand-teal-700 transition-colors">
                020 123 4567
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
