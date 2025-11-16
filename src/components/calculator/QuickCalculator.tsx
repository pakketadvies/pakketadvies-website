'use client'

import { useState } from 'react'
import { Lightning, TrendUp, CheckCircle } from '@phosphor-icons/react'
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
    <div className="glass-dark rounded-3xl p-8 border border-white/10 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-brand-teal-500 rounded-2xl flex items-center justify-center">
          <Lightning weight="duotone" className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Bereken direct je besparing</h3>
          <p className="text-sm text-gray-300">Gratis en vrijblijvend in 30 seconden</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <>
            {/* Energy consumption inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Jaarverbruik stroom (kWh)
                </label>
                <input
                  type="number"
                  value={formData.stroomVerbruik}
                  onChange={(e) => setFormData({ ...formData, stroomVerbruik: e.target.value })}
                  placeholder="Bijv. 50000"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal-500 focus:border-transparent transition-all"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Te vinden op je jaarnota</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Jaarverbruik gas (m³)
                </label>
                <input
                  type="number"
                  value={formData.gasVerbruik}
                  onChange={(e) => setFormData({ ...formData, gasVerbruik: e.target.value })}
                  placeholder="Bijv. 20000"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal-500 focus:border-transparent transition-all"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Te vinden op je jaarnota</p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full group relative px-6 py-4 bg-brand-teal-500 text-white rounded-xl font-semibold text-lg shadow-xl shadow-brand-teal-500/30 hover:shadow-brand-teal-500/50 hover:bg-brand-teal-600 transition-all duration-300 hover:scale-[1.02]"
            >
              <span className="flex items-center justify-center gap-2">
                Volgende stap
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </>
        )}

        {step === 2 && (
          <>
            {/* Estimated savings display */}
            <div className="bg-brand-teal-500/20 border border-brand-teal-500/30 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendUp weight="duotone" className="w-8 h-8 text-brand-teal-500" />
                <div>
                  <p className="text-sm text-gray-300">Geschatte besparing per jaar</p>
                  <p className="text-4xl font-bold text-white">€{calculateEstimatedSavings().toLocaleString()}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">*Gebaseerd op gemiddelde marktprijzen</p>
            </div>

            {/* Business type selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Type bedrijf
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'klein', label: 'Klein', subtitle: '< 20 werknemers' },
                  { value: 'mkb', label: 'MKB', subtitle: '20-250 werknemers' },
                  { value: 'groot', label: 'Groot', subtitle: '> 250 werknemers' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, typeBedrijf: option.value as any })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.typeBedrijf === option.value
                        ? 'border-brand-teal-500 bg-brand-teal-500/20'
                        : 'border-white/20 bg-white/5 hover:border-white/40'
                    }`}
                  >
                    <div className="text-white font-semibold text-sm">{option.label}</div>
                    <div className="text-xs text-gray-400 mt-1">{option.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Final CTA */}
            <button
              type="submit"
              className="w-full group relative px-6 py-4 bg-brand-teal-500 text-white rounded-xl font-semibold text-lg shadow-xl shadow-brand-teal-500/30 hover:shadow-brand-teal-500/50 hover:bg-brand-teal-600 transition-all duration-300 hover:scale-[1.02]"
            >
              <span className="flex items-center justify-center gap-2">
                Bekijk mijn aanbiedingen
                <CheckCircle weight="duotone" className="w-5 h-5" />
              </span>
            </button>

            {/* Back button */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Terug naar verbruik
            </button>
          </>
        )}
      </form>

      {/* Trust indicators */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <CheckCircle weight="fill" className="w-4 h-4 text-brand-teal-500" />
            <span>100% gratis</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <CheckCircle weight="fill" className="w-4 h-4 text-brand-teal-500" />
            <span>Geen verplichtingen</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <CheckCircle weight="fill" className="w-4 h-4 text-brand-teal-500" />
            <span>Privacy gegarandeerd</span>
          </div>
        </div>
      </div>
    </div>
  )
}

