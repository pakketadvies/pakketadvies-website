'use client'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  stepLabels?: string[]
}

export function ProgressBar({ currentStep, totalSteps, stepLabels }: ProgressBarProps) {
  const percentage = (currentStep / totalSteps) * 100
  const currentLabel = stepLabels?.[currentStep - 1]

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-teal-500 to-brand-teal-600 rounded-full transition-all duration-500 ease-out shadow-lg"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Steps indicator */}
      <div className="flex justify-between items-center">
        <div className="min-w-0">
          <span className="text-sm font-medium text-gray-600">
            Stap {currentStep} van {totalSteps}
          </span>
          {currentLabel && (
            <p className="text-xs text-brand-navy-500 font-semibold mt-0.5 truncate">
              {currentLabel}
            </p>
          )}
        </div>
        <span className="text-sm font-bold text-brand-teal-600">
          {Math.round(percentage)}% compleet
        </span>
      </div>

      {stepLabels && stepLabels.length >= totalSteps && (
        <div className="grid grid-cols-2 gap-2">
          {stepLabels.slice(0, totalSteps).map((label, index) => {
            const stepNumber = index + 1
            const isActive = stepNumber === currentStep
            const isComplete = stepNumber < currentStep
            return (
              <div
                key={label}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'border-brand-teal-400 bg-brand-teal-50 text-brand-teal-700'
                    : isComplete
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                }`}
              >
                {stepNumber}. {label}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
