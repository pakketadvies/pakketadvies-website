'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { SlidersHorizontal, Calendar, Lightning, Flame } from '@phosphor-icons/react'

export type PeriodeType = '1m' | '3m' | '1j' | '2j' | '5j'
export type Energietype = 'elektriciteit' | 'gas' | 'beide'
export type TariefType = 'gemiddeld' | 'dag' | 'nacht'
export type BelastingenType = 'exclusief' | 'inclusief'

interface PrijzenFiltersProps {
  periode: PeriodeType
  energietype: Energietype
  tarief: TariefType
  belastingen: BelastingenType
  onPeriodeChange: (periode: PeriodeType) => void
  onEnergietypeChange: (type: Energietype) => void
  onTariefChange: (tarief: TariefType) => void
  onBelastingenChange: (belastingen: BelastingenType) => void
}

export function PrijzenFilters({
  periode,
  energietype,
  tarief,
  belastingen,
  onPeriodeChange,
  onEnergietypeChange,
  onTariefChange,
  onBelastingenChange,
}: PrijzenFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
      if (window.innerWidth >= 1024) {
        setIsExpanded(true) // Always expanded on desktop
      }
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  const periodeOptions: { value: PeriodeType; label: string }[] = [
    { value: '1m', label: '1 maand' },
    { value: '3m', label: '3 maanden' },
    { value: '1j', label: '1 jaar' },
    { value: '2j', label: '2 jaar' },
    { value: '5j', label: '5 jaar' },
  ]

  return (
    <Card className="mb-6 glass border border-gray-200">
      <CardContent className="p-0">
        {/* Header - Always visible */}
        <button
          onClick={() => !isDesktop && setIsExpanded(!isExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors lg:cursor-default"
        >
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-5 h-5 text-brand-teal-500" weight="duotone" />
            <span className="font-semibold text-brand-navy-500">Filters</span>
          </div>
          <div className="lg:hidden">
            {isExpanded ? (
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </button>

        {/* Filters - Expanded on desktop, toggleable on mobile */}
        <div className={`px-6 pb-6 border-t border-gray-200 ${isExpanded || isDesktop ? 'block' : 'hidden'}`}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {/* Periode */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-brand-navy-500 mb-2">
                <Calendar className="w-4 h-4" />
                Periode
              </label>
              <div className="flex flex-wrap gap-2">
                {periodeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onPeriodeChange(option.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      periode === option.value
                        ? 'bg-brand-teal-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Energietype */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-brand-navy-500 mb-2">
                <Lightning className="w-4 h-4" />
                Type
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'elektriciteit' as Energietype, label: 'Elektriciteit', icon: Lightning },
                  { value: 'gas' as Energietype, label: 'Gas', icon: Flame },
                  { value: 'beide' as Energietype, label: 'Beide', icon: null },
                ].map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      onClick={() => onEnergietypeChange(option.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                        energietype === option.value
                          ? 'bg-brand-teal-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {Icon && <Icon className="w-4 h-4" weight="duotone" />}
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tarief (alleen voor elektriciteit) */}
            {energietype === 'elektriciteit' || energietype === 'beide' ? (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-brand-navy-500 mb-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Tarief
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'gemiddeld' as TariefType, label: 'Gemiddeld' },
                    { value: 'dag' as TariefType, label: 'Dag' },
                    { value: 'nacht' as TariefType, label: 'Nacht' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onTariefChange(option.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        tarief === option.value
                          ? 'bg-brand-teal-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Belastingen */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-brand-navy-500 mb-2">
                <span className="text-xs">€</span>
                Belastingen
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'exclusief' as BelastingenType, label: 'Exclusief' },
                  { value: 'inclusief' as BelastingenType, label: 'Inclusief' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onBelastingenChange(option.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      belastingen === option.value
                        ? 'bg-brand-teal-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

