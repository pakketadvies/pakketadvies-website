'use client'

import { useState, useEffect } from 'react'
import { Lightning, Flame, MapPin, PencilSimple, Sun } from '@phosphor-icons/react'
import type { VerbruikData } from '@/types/calculator'

interface VerbruikStickyBarProps {
  verbruikData: VerbruikData
  onEdit: () => void
}

export default function VerbruikStickyBar({ verbruikData, onEdit }: VerbruikStickyBarProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling 100px
      setIsVisible(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const totaalElektriciteit = verbruikData.elektriciteitNormaal + (verbruikData.elektriciteitDal || 0)

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-40 bg-white border-b-2 border-gray-200 shadow-md transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <button
        onClick={onEdit}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors active:bg-gray-100"
      >
        {/* Left side: Verbruik info */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-medium text-gray-700 min-w-0">
          {/* Elektriciteit */}
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Lightning weight="duotone" className="w-4 h-4 text-brand-teal-600 flex-shrink-0" />
            <span>{totaalElektriciteit.toLocaleString()} kWh</span>
          </div>

          {/* Teruglevering */}
          {verbruikData.heeftZonnepanelen && verbruikData.terugleveringJaar && (
            <>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <Sun weight="duotone" className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{verbruikData.terugleveringJaar.toLocaleString()} kWh</span>
              </div>
            </>
          )}

          {/* Gas */}
          {verbruikData.gasJaar && !verbruikData.geenGasaansluiting && (
            <>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <Flame weight="duotone" className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span>{verbruikData.gasJaar.toLocaleString()} m³</span>
              </div>
            </>
          )}

          {/* Postcode */}
          {verbruikData.leveringsadressen?.[0]?.postcode && (
            <>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <MapPin weight="duotone" className="w-4 h-4 text-brand-teal-600 flex-shrink-0" />
                <span>{verbruikData.leveringsadressen[0].postcode}</span>
              </div>
            </>
          )}
        </div>

        {/* Right side: Edit icon */}
        <div className="ml-3 flex-shrink-0">
          <div className="w-8 h-8 bg-brand-teal-100 rounded-lg flex items-center justify-center hover:bg-brand-teal-200 transition-colors">
            <PencilSimple weight="bold" className="w-4 h-4 text-brand-teal-600" />
          </div>
        </div>
      </button>
    </div>
  )
}

