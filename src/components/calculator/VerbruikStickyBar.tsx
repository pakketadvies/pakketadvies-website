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
      // Show sticky bar after scrolling 150px (after header + initial content)
      setIsVisible(window.scrollY > 150)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const totaalElektriciteit = verbruikData.elektriciteitNormaal + (verbruikData.elektriciteitDal || 0)

  return (
    <>
      {/* Spacer to prevent content jump when sticky bar appears */}
      <div className={`transition-all duration-300 ${isVisible ? 'h-16' : 'h-0'}`} />
      
      {/* Sticky Bar */}
      <div
        className={`fixed left-0 right-0 z-[100] transition-all duration-300 ${
          isVisible ? 'top-0 opacity-100 translate-y-0' : 'top-0 opacity-0 -translate-y-full pointer-events-none'
        }`}
      >
        {/* Glass effect background matching header */}
        <div className="bg-white/95 backdrop-blur-md border-b-2 border-gray-200 shadow-lg">
          <button
            onClick={onEdit}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50/80 transition-colors active:bg-gray-100/80"
          >
            {/* Left side: Compact verbruik info */}
            <div className="flex items-center gap-2 flex-wrap text-xs font-medium text-gray-700 min-w-0">
              {/* Elektriciteit */}
              <div className="flex items-center gap-1 whitespace-nowrap bg-brand-teal-50 px-2 py-1 rounded-md">
                <Lightning weight="duotone" className="w-3.5 h-3.5 text-brand-teal-600 flex-shrink-0" />
                <span className="text-brand-navy-600 font-semibold">{totaalElektriciteit.toLocaleString()}</span>
                <span className="text-gray-500">kWh</span>
              </div>

              {/* Teruglevering */}
              {verbruikData.heeftZonnepanelen && verbruikData.terugleveringJaar && (
                <div className="flex items-center gap-1 whitespace-nowrap bg-amber-50 px-2 py-1 rounded-md">
                  <Sun weight="duotone" className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span className="text-brand-navy-600 font-semibold">{verbruikData.terugleveringJaar.toLocaleString()}</span>
                  <span className="text-gray-500">kWh</span>
                </div>
              )}

              {/* Gas */}
              {verbruikData.gasJaar && !verbruikData.geenGasaansluiting && (
                <div className="flex items-center gap-1 whitespace-nowrap bg-orange-50 px-2 py-1 rounded-md">
                  <Flame weight="duotone" className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                  <span className="text-brand-navy-600 font-semibold">{verbruikData.gasJaar.toLocaleString()}</span>
                  <span className="text-gray-500">m³</span>
                </div>
              )}

              {/* Postcode */}
              {verbruikData.leveringsadressen?.[0]?.postcode && (
                <div className="flex items-center gap-1 whitespace-nowrap bg-gray-100 px-2 py-1 rounded-md">
                  <MapPin weight="duotone" className="w-3.5 h-3.5 text-brand-teal-600 flex-shrink-0" />
                  <span className="text-brand-navy-600 font-semibold">{verbruikData.leveringsadressen[0].postcode}</span>
                </div>
              )}
            </div>

            {/* Right side: Edit button */}
            <div className="ml-3 flex-shrink-0 flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600 hidden sm:inline">Aanpassen</span>
              <div className="w-9 h-9 bg-brand-teal-500 rounded-lg flex items-center justify-center hover:bg-brand-teal-600 transition-colors shadow-md">
                <PencilSimple weight="bold" className="w-4 h-4 text-white" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </>
  )
}

