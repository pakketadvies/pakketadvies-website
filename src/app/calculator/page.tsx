'use client'

import { useCalculatorStore } from '@/store/calculatorStore'
import { ProgressBar } from '@/components/calculator/ProgressBar'
import { VerbruikForm } from '@/components/calculator/VerbruikForm'
import { BedrijfsgegevensForm } from '@/components/calculator/BedrijfsgegevensForm'
import { VoorkeurenForm } from '@/components/calculator/VoorkeurenForm'

export default function CalculatorPage() {
  const { stap } = useCalculatorStore()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-navy-500 mb-2">
            Bereken uw besparing
          </h1>
          <p className="text-lg text-gray-500">
            In een paar stappen naar uw beste energiecontract
          </p>
        </div>

        <ProgressBar />

        {stap === 1 && <VerbruikForm />}
        {stap === 2 && <BedrijfsgegevensForm />}
        {stap === 3 && <VoorkeurenForm />}
      </div>
    </div>
  )
}

