'use client'

import { useCalculatorStore } from '@/store/calculatorStore'
import { cn } from '@/lib/utils'

const steps = [
  { number: 1, title: 'Verbruik' },
  { number: 2, title: 'Bedrijfsgegevens' },
  { number: 3, title: 'Voorkeuren' },
  { number: 4, title: 'Resultaten' },
]

export function ProgressBar() {
  const { stap } = useCalculatorStore()

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-brand-navy-500">
          Stap {stap} van 4
        </span>
        <span className="text-sm text-gray-500">{(stap / 4) * 100}% voltooid</span>
      </div>

      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <div key={step.number} className="flex-1 flex items-center gap-2">
            {/* Step circle */}
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                {
                  'bg-brand-teal-500 text-white': stap > step.number,
                  'bg-brand-teal-500 text-white ring-4 ring-brand-teal-500/20':
                    stap === step.number,
                  'bg-gray-200 text-gray-500': stap < step.number,
                }
              )}
            >
              {stap > step.number ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                step.number
              )}
            </div>

            {/* Line connector */}
            {index < steps.length - 1 && (
              <div
                className={cn('flex-1 h-1 rounded-full transition-all', {
                  'bg-brand-teal-500': stap > step.number,
                  'bg-gray-200': stap <= step.number,
                })}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step titles for desktop */}
      <div className="hidden md:flex items-center justify-between mt-2">
        {steps.map((step) => (
          <div key={step.number} className="flex-1 text-center">
            <span
              className={cn('text-xs', {
                'text-brand-teal-500 font-medium': stap >= step.number,
                'text-gray-500': stap < step.number,
              })}
            >
              {step.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

