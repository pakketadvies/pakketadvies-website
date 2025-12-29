'use client'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const percentage = (currentStep / totalSteps) * 100

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
        <span className="text-sm font-medium text-gray-600">
          Stap {currentStep} van {totalSteps}
        </span>
        <span className="text-sm font-bold text-brand-teal-600">
          {Math.round(percentage)}% compleet
        </span>
      </div>
    </div>
  )
}
