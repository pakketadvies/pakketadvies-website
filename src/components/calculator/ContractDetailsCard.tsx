'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CaretDown, Star, CheckCircle } from '@phosphor-icons/react'
import type { ContractOptie } from '@/types/calculator'

interface ContractDetailsCardProps {
  contract: ContractOptie | null
}

export function ContractDetailsCard({ contract }: ContractDetailsCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  if (!contract) return null

  const getContractTypeLabel = () => {
    if (contract.type === 'vast') {
      return contract.looptijd ? `Vast contract • ${contract.looptijd} jaar` : 'Vast contract'
    }
    return 'Dynamisch contract'
  }

  const besparing = contract.besparing ? contract.besparing * 12 : null // Jaarlijkse besparing
  const rating = contract.rating || 0
  const reviews = contract.aantalReviews || 0

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg mb-6 overflow-hidden">
      {/* Main Card Content */}
      <div className="p-4 md:p-5">
        <div className="flex items-start gap-3 md:gap-4">
          {/* Logo */}
          {contract.leverancier.logo && (
            <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-lg border border-gray-200 p-2 flex items-center justify-center">
              <Image
                src={contract.leverancier.logo}
                alt={contract.leverancier.naam}
                width={64}
                height={64}
                className="object-contain w-full h-full"
              />
            </div>
          )}

          {/* Contract Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-brand-navy-500 text-sm md:text-base mb-1">
              {contract.contractNaam || `${contract.type === 'vast' ? 'Vast' : 'Dynamisch'} contract`}
            </h3>
            <p className="text-xs md:text-sm text-gray-600 mb-2">
              {contract.leverancier.naam}
            </p>

            {/* Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-1.5 mb-2">
                <Star className="w-3.5 h-3.5 text-yellow-400" weight="fill" />
                <span className="text-xs font-semibold text-gray-700">
                  {rating.toFixed(1)}
                </span>
                {reviews > 0 && (
                  <span className="text-xs text-gray-500">
                    ({reviews} {reviews === 1 ? 'review' : 'reviews'})
                  </span>
                )}
              </div>
            )}

            {/* Besparing */}
            {besparing && besparing > 0 && (
              <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg px-2.5 py-1 mt-1">
                <CheckCircle className="w-3.5 h-3.5" weight="bold" />
                <span className="text-xs font-semibold">
                  €{besparing.toLocaleString('nl-NL')} besparing/jaar
                </span>
              </div>
            )}
          </div>

          {/* Toggle Details Button */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex-shrink-0 text-brand-teal-600 hover:text-brand-teal-700 transition-colors flex items-center gap-1"
          >
            <span className="text-xs md:text-sm font-semibold hidden sm:inline">
              {showDetails ? 'Verberg details' : 'Bekijk details'}
            </span>
            <CaretDown
              className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${showDetails ? 'rotate-180' : ''}`}
              weight="bold"
            />
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="border-t border-gray-200 bg-gray-50 p-4 md:p-5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {/* Contract Type */}
            <div>
              <span className="text-gray-600">Type:</span>
              <span className="ml-2 font-semibold text-brand-navy-500">
                {getContractTypeLabel()}
              </span>
            </div>

            {/* Groene Energie */}
            {contract.groeneEnergie && (
              <div>
                <span className="text-gray-600">Energie:</span>
                <span className="ml-2 font-semibold text-green-600">
                  100% Groen
                </span>
              </div>
            )}

            {/* Opzegtermijn */}
            <div>
              <span className="text-gray-600">Opzegtermijn:</span>
              <span className="ml-2 font-semibold text-brand-navy-500">
                {contract.opzegtermijn} maand{contract.opzegtermijn !== 1 ? 'en' : ''}
              </span>
            </div>

            {/* Maandbedrag */}
            {contract.maandbedrag > 0 && (
              <div>
                <span className="text-gray-600">Maandbedrag:</span>
                <span className="ml-2 font-semibold text-brand-navy-500">
                  €{contract.maandbedrag.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>

          {/* Bijzonderheden */}
          {contract.bijzonderheden && contract.bijzonderheden.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Bijzonderheden:
              </span>
              <ul className="mt-1.5 space-y-1">
                {contract.bijzonderheden.map((bijzonderheid, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-teal-600 flex-shrink-0 mt-0.5" weight="bold" />
                    <span>{bijzonderheid}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

