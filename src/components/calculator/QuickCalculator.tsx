'use client'

import { useState } from 'react'
import { Lightning, TrendUp, CheckCircle, ArrowRight } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'

export function QuickCalculator() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [formData, setFormData] = useState({
    stroomVerbruik: '',
    gasVerbruik: '',
    typeBedrijf: 'mkb' as 'mkb' | 'groot' | 'klein',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1 && formData.stroomVerbruik && formData.gasVerbruik) {
      setStep(2)
    } else if (step === 2) {
      // Navigate to full calculator with pre-filled data
      router.push(`/calculator?stroom=${formData.stroomVerbruik}&gas=${formData.gasVerbruik}&type=${formData.typeBedrijf}`)
    }
  }

  const calculateEstimatedSavings = () => {
    const stroom = parseInt(formData.stroomVerbruik) || 0
    const gas = parseInt(formData.gasVerbruik) || 0
    const total = (stroom * 0.28 + gas * 1.15) / 1000
    return Math.round(total * 0.35) // Estimate 35% savings
  }

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Lightning weight="duotone" className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-bold text-brand-navy-500">Bereken je besparing</h3>
          <p className="text-xs md:text-sm text-gray-600">Gratis en vrijblijvend</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
        {step === 1 && (
          <>
            {/* Energy consumption inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-navy-500 mb-2">
                  Jaarverbruik stroom (kWh)
                </label>
                <input
                  type="number"
                  value={formData.stroomVerbruik}
                  onChange={(e) => setFormData({ ...formData, stroomVerbruik: e.target.value })}
                  placeholder="Bijv. 50000"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-brand-navy-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal-500 focus:border-transparent transition-all"
                  required
                />
                <p className="text-xs text-gray-500 mt-1.5">Te vinden op je jaarnota</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-navy-500 mb-2">
                  Jaarverbruik gas (m³)
                </label>
                <input
                  type="number"
                  value={formData.gasVerbruik}
                  onChange={(e) => setFormData({ ...formData, gasVerbruik: e.target.value })}
                  placeholder="Bijv. 20000"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-brand-navy-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal-500 focus:border-transparent transition-all"
                  required
                />
                <p className="text-xs text-gray-500 mt-1.5">Te vinden op je jaarnota</p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full group relative px-6 py-3.5 bg-brand-teal-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:bg-brand-teal-600 transition-all duration-300"
            >
              <span className="flex items-center justify-center gap-2">
                Volgende stap
                <ArrowRight weight="bold" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </>
        )}

        {step === 2 && (
          <>
            {/* Estimated savings display */}
            <div className="bg-brand-teal-50 border-2 border-brand-teal-500 rounded-xl p-5 md:p-6 mb-5">
              <div className="flex items-center gap-3 mb-2">
                <TrendUp weight="duotone" className="w-7 h-7 md:w-8 md:h-8 text-brand-teal-600" />
                <div>
                  <p className="text-xs md:text-sm text-brand-navy-600 font-medium">Geschatte besparing per jaar</p>
                  <p className="text-3xl md:text-4xl font-bold text-brand-teal-600">€{calculateEstimatedSavings().toLocaleString()}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600">*Gebaseerd op gemiddelde marktprijzen</p>
            </div>

            {/* Business type selection */}
            <div>
              <label className="block text-sm font-medium text-brand-navy-500 mb-3">
                Type bedrijf
              </label>
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                {[
                  { value: 'klein', label: 'Klein', subtitle: '< 20' },
                  { value: 'mkb', label: 'MKB', subtitle: '20-250' },
                  { value: 'groot', label: 'Groot', subtitle: '> 250' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, typeBedrijf: option.value as any })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.typeBedrijf === option.value
                        ? 'border-brand-teal-500 bg-brand-teal-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-brand-navy-500 font-semibold text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{option.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Final CTA */}
            <button
              type="submit"
              className="w-full group relative px-6 py-3.5 bg-brand-teal-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:bg-brand-teal-600 transition-all duration-300"
            >
              <span className="flex items-center justify-center gap-2">
                Bekijk aanbiedingen
                <CheckCircle weight="duotone" className="w-5 h-5" />
              </span>
            </button>

            {/* Back button */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-sm text-gray-600 hover:text-brand-navy-500 transition-colors py-2"
            >
              ← Terug naar verbruik
            </button>
          </>
        )}
      </form>

      {/* Trust indicators */}
      <div className="mt-5 pt-5 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col items-center gap-1.5 text-gray-600">
            <CheckCircle weight="fill" className="w-4 h-4 text-brand-teal-500" />
            <span className="text-center leading-tight">100% gratis</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-gray-600">
            <CheckCircle weight="fill" className="w-4 h-4 text-brand-teal-500" />
            <span className="text-center leading-tight">Geen verplichtingen</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-gray-600">
            <CheckCircle weight="fill" className="w-4 h-4 text-brand-teal-500" />
            <span className="text-center leading-tight">Privacy veilig</span>
          </div>
        </div>
      </div>
    </div>
  )
}

