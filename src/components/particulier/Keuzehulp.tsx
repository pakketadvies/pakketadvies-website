'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, CaretRight, Info, Check } from '@phosphor-icons/react'
import { lockBodyScroll } from '@/lib/scroll-lock'

type TariefType = 'vast' | 'variabel' | 'dynamisch' | null
type Looptijd = 1 | 2 | 3 | 5 | null

interface KeuzehulpProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: { 
    type: 'alle' | 'vast' | 'dynamisch'
    groeneEnergie: boolean
    sortBy: 'prijs-laag' | 'prijs-hoog' | 'besparing' | 'rating'
  }) => void
  currentFilters: {
    type: 'alle' | 'vast' | 'dynamisch'
    groeneEnergie: boolean
    sortBy: 'prijs-laag' | 'prijs-hoog' | 'besparing' | 'rating'
  }
}

type Step = 'weergave' | 'type' | 'looptijd' | 'duurzaamheid'

export function Keuzehulp({ isOpen, onClose, onApplyFilters, currentFilters }: KeuzehulpProps) {
  const [currentStep, setCurrentStep] = useState<Step>('weergave')
  const [selectedSortBy, setSelectedSortBy] = useState<'prijs-laag' | 'prijs-hoog' | 'besparing' | 'rating'>(currentFilters.sortBy)
  const [selectedType, setSelectedType] = useState<TariefType>(null)
  const [selectedLooptijd, setSelectedLooptijd] = useState<Looptijd>(null)
  const [selectedDuurzaamheid, setSelectedDuurzaamheid] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  // Initialize from current filters
  useEffect(() => {
    if (isOpen) {
      setSelectedSortBy(currentFilters.sortBy)
      if (currentFilters.type === 'vast') {
        setSelectedType('vast')
      } else if (currentFilters.type === 'dynamisch') {
        setSelectedType('dynamisch')
      } else {
        setSelectedType(null)
      }
      setSelectedDuurzaamheid(currentFilters.groeneEnergie)
      setCurrentStep('weergave')
    }
  }, [isOpen, currentFilters])

  // Keep mounted for exit animation (same as ContractDetailsDrawer)
  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      // next tick → animate in
      const t = setTimeout(() => setVisible(true), 10)
      return () => clearTimeout(t)
    }

    // animate out
    setVisible(false)
    const t = setTimeout(() => setMounted(false), 250)
    return () => clearTimeout(t)
  }, [isOpen])

  // Lock body scroll while mounted
  useEffect(() => {
    if (!mounted) return
    return lockBodyScroll('Keuzehulp')
  }, [mounted])

  // ESC closes
  useEffect(() => {
    if (!mounted) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mounted, onClose])

  const steps: Step[] = ['weergave', 'type', 'looptijd', 'duurzaamheid']
  const currentStepIndex = steps.indexOf(currentStep)

  const handleNext = () => {
    if (currentStep === 'weergave') {
      setCurrentStep('type')
    } else if (currentStep === 'type') {
      if (selectedType === 'vast') {
        setCurrentStep('looptijd')
      } else {
        setCurrentStep('duurzaamheid')
      }
    } else if (currentStep === 'looptijd') {
      setCurrentStep('duurzaamheid')
    } else {
      // Final step - apply filters
      applyFilters()
    }
  }

  const handleBack = () => {
    if (currentStep === 'duurzaamheid') {
      if (selectedType === 'vast') {
        setCurrentStep('looptijd')
      } else {
        setCurrentStep('type')
      }
    } else if (currentStep === 'looptijd') {
      setCurrentStep('type')
    } else if (currentStep === 'type') {
      setCurrentStep('weergave')
    }
  }

  const applyFilters = () => {
    let filterType: 'alle' | 'vast' | 'dynamisch' = 'alle'
    if (selectedType === 'vast' || selectedType === 'variabel') {
      filterType = 'vast'
    } else if (selectedType === 'dynamisch') {
      filterType = 'dynamisch'
    }

    onApplyFilters({
      type: filterType,
      groeneEnergie: selectedDuurzaamheid,
      sortBy: selectedSortBy,
    })
    onClose()
  }

  const canProceed = () => {
    if (currentStep === 'weergave') {
      return true // sortBy is always selected
    }
    if (currentStep === 'type') {
      return selectedType !== null
    }
    if (currentStep === 'looptijd') {
      return selectedLooptijd !== null
    }
    return true // duurzaamheid is optional
  }

  const handleResetFilters = () => {
    setSelectedSortBy('besparing')
    setSelectedType(null)
    setSelectedLooptijd(null)
    setSelectedDuurzaamheid(false)
  }

  if (!mounted) return null

  const content = (
    <div className="fixed inset-0 z-[120]">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Slide-in panel (desktop) / Full screen (mobile) */}
      <div
        className={`absolute inset-y-0 right-0 bg-white shadow-2xl transition-transform duration-300 ease-in-out
          ${visible ? 'translate-x-0' : 'translate-x-full'}
          w-full md:w-[600px] lg:w-[700px]
          flex flex-col
          max-h-screen overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-brand-navy-500">Wij helpen je graag</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Sluiten"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-start">
            {steps.map((step, index) => (
              <div key={step} className="flex items-start flex-1" style={{ minWidth: 0 }}>
                {/* Step circle and label */}
                <div className="flex flex-col items-center flex-1" style={{ minWidth: 0 }}>
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-colors flex-shrink-0 ${
                      index < currentStepIndex
                        ? 'bg-brand-teal-500 text-white'
                        : index === currentStepIndex
                          ? 'bg-brand-teal-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <Check size={14} weight="bold" className="sm:w-4 sm:h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={`mt-1.5 sm:mt-2 text-[10px] sm:text-xs font-medium text-center leading-tight px-0.5 ${
                      index === currentStepIndex ? 'text-brand-teal-600' : 'text-gray-500'
                    }`}
                  >
                    {step === 'weergave'
                      ? 'Weergave'
                      : step === 'type'
                        ? 'Type tarief'
                        : step === 'looptijd'
                          ? 'Looptijd'
                          : 'Duurzaamheid'}
                  </span>
                </div>
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-1 sm:mx-2 mt-4 transition-colors ${
                      index < currentStepIndex ? 'bg-brand-teal-500' : 'bg-gray-200'
                    }`}
                    style={{ minWidth: '8px' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Step 1: Weergave */}
          {currentStep === 'weergave' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-brand-navy-500 mb-2">
                  Hoe wil je de resultaten sorteren?
                </h3>
                <p className="text-gray-600">
                  Kies hoe je de energiecontracten wilt zien.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { value: 'besparing' as const, label: 'Hoogste besparing', desc: 'Toon eerst de contracten waarmee je het meest bespaart' },
                  { value: 'prijs-laag' as const, label: 'Laagste prijs', desc: 'Toon eerst de goedkoopste contracten' },
                  { value: 'prijs-hoog' as const, label: 'Hoogste prijs', desc: 'Toon eerst de duurste contracten' },
                  { value: 'rating' as const, label: 'Beste beoordeling', desc: 'Toon eerst de best beoordeelde contracten' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedSortBy === option.value
                        ? 'border-brand-teal-500 bg-brand-teal-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="sortBy"
                        value={option.value}
                        checked={selectedSortBy === option.value}
                        onChange={() => setSelectedSortBy(option.value)}
                        className="mt-1 w-5 h-5 text-brand-teal-600"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-brand-navy-500">{option.label}</span>
                        <p className="text-sm text-gray-600 mt-1">{option.desc}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Type tarief */}
          {currentStep === 'type' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-brand-navy-500 mb-2">
                  Wat voor soort tarief wil je?
                </h3>
                <p className="text-gray-600">
                  Kies het tarieftype dat het beste bij jouw situatie past.
                </p>
              </div>

              <div className="space-y-4">
                {/* Vast tarief */}
                <label
                  className={`block p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedType === 'vast'
                      ? 'border-brand-teal-500 bg-brand-teal-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="radio"
                      name="tariefType"
                      value="vast"
                      checked={selectedType === 'vast'}
                      onChange={() => setSelectedType('vast')}
                      className="mt-1 w-5 h-5 text-brand-teal-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-brand-navy-500">Vast tarief</span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          Meest gekozen
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Met een vast tarief kies je voor zekerheid. Je betaalt tijdens de looptijd van je contract
                        altijd hetzelfde tarief.
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                        <div className="flex items-start gap-2">
                          <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-blue-900">
                            <strong>Handig om te weten:</strong> De overheid kan de vaste tarieven jaarlijks aanpassen
                            op basis van de energiebelasting en ODE-heffing.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </label>

                {/* Variabel tarief */}
                <label
                  className={`block p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedType === 'variabel'
                      ? 'border-brand-teal-500 bg-brand-teal-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="radio"
                      name="tariefType"
                      value="variabel"
                      checked={selectedType === 'variabel'}
                      onChange={() => setSelectedType('variabel')}
                      className="mt-1 w-5 h-5 text-brand-teal-600"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-brand-navy-500">Variabel tarief</span>
                      <p className="text-sm text-gray-600 mt-2">
                        Kies je voor een variabel tarief? Dan kunnen de tarieven tijdens de looptijd van je contract
                        stijgen of dalen. Dit gebeurt meestal twee keer per jaar - in januari en juli - en hangt af van
                        invloeden op de energiemarkt.
                      </p>
                    </div>
                  </div>
                </label>

                {/* Dynamisch tarief */}
                <label
                  className={`block p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedType === 'dynamisch'
                      ? 'border-brand-teal-500 bg-brand-teal-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="radio"
                      name="tariefType"
                      value="dynamisch"
                      checked={selectedType === 'dynamisch'}
                      onChange={() => setSelectedType('dynamisch')}
                      className="mt-1 w-5 h-5 text-brand-teal-600"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-brand-navy-500">Dynamisch tarief</span>
                      <p className="text-sm text-gray-600 mt-2">
                        Met een dynamisch tarief betaal je elke maand de actuele prijs voor stroom en gas. Deze tarieven
                        kunnen per uur (stroom) of per dag (gas) schommelen, afhankelijk van de marktprijzen.
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Active filter tag */}
              {selectedType && (
                <div className="flex items-center gap-2 pt-2">
                  <span className="px-3 py-1.5 bg-brand-teal-100 text-brand-teal-700 rounded-full text-sm font-semibold inline-flex items-center gap-2">
                    {selectedType === 'vast'
                      ? 'Vast tarief'
                      : selectedType === 'variabel'
                        ? 'Variabel tarief'
                        : 'Dynamisch tarief'}
                    <button
                      onClick={() => setSelectedType(null)}
                      className="hover:bg-brand-teal-200 rounded-full p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Looptijd (alleen voor vast tarief) */}
          {currentStep === 'looptijd' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-brand-navy-500 mb-2">
                  Welke looptijd wil je?
                </h3>
                <p className="text-gray-600">
                  Kies de looptijd die bij jouw situatie past. Langere looptijden bieden vaak meer zekerheid.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {([1, 2, 3, 5] as const).map((looptijd) => (
                  <label
                    key={looptijd}
                    className={`block p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                      selectedLooptijd === looptijd
                        ? 'border-brand-teal-500 bg-brand-teal-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="looptijd"
                      value={looptijd}
                      checked={selectedLooptijd === looptijd}
                      onChange={() => setSelectedLooptijd(looptijd)}
                      className="sr-only"
                    />
                    <div className="font-bold text-lg text-brand-navy-500">{looptijd} jaar</div>
                    {looptijd === 3 && (
                      <div className="mt-1 text-xs text-brand-teal-600 font-semibold">Populair</div>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Duurzaamheid */}
          {currentStep === 'duurzaamheid' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-brand-navy-500 mb-2">
                  Duurzaamheid belangrijk voor jou?
                </h3>
                <p className="text-gray-600">
                  Kies voor groene energie als je wilt bijdragen aan een duurzamere toekomst.
                </p>
              </div>

              <label
                className={`block p-5 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedDuurzaamheid
                    ? 'border-brand-teal-500 bg-brand-teal-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedDuurzaamheid}
                    onChange={(e) => setSelectedDuurzaamheid(e.target.checked)}
                    className="mt-1 w-5 h-5 text-brand-teal-600 rounded"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-brand-navy-500">Alleen groene stroom</span>
                    <p className="text-sm text-gray-600 mt-2">
                      Toon alleen contracten met groene energie, opgewekt uit duurzame bronnen zoals wind en zon.
                    </p>
                  </div>
                </div>
              </label>

              {/* Reset filters button */}
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Filters herstellen
              </button>
            </div>
          )}
        </div>

        {/* Footer with buttons */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-4">
          {currentStepIndex > 0 ? (
            <button
              onClick={handleBack}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              ← Terug
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              canProceed()
                ? 'bg-brand-teal-500 text-white hover:bg-brand-teal-600 shadow-lg'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {currentStep === 'duurzaamheid' ? 'Filters toepassen' : 'Verder'}
            {currentStep !== 'duurzaamheid' && <CaretRight size={20} weight="bold" />}
          </button>
        </div>
      </div>
    </div>
  )

  // Render via portal to escape any stacking contexts (e.g. parent transforms),
  // ensuring the Keuzehulp always sits above the fixed header.
  if (typeof document !== 'undefined') {
    return createPortal(content, document.body)
  }

  return content
}

