'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Lightning, Star, Leaf, ArrowRight, Lock, TrendDown } from '@phosphor-icons/react'
import type { Contract } from '@/types/admin'

interface BestDeal {
  id: string
  naam: string
  type: 'vast' | 'dynamisch' | 'maatwerk'
  aanbevolen: boolean
  populair: boolean
  leverancier: {
    id: string
    naam: string
    logo_url: string | null
  }
  details_vast?: any
  details_dynamisch?: any
  details_maatwerk?: any
  estimatedMaandbedrag: number
  rating: number
}

interface HomepageBestDealsProps {
  averagePrice?: number
}

export function HomepageBestDeals({ averagePrice: propAveragePrice }: HomepageBestDealsProps) {
  const [contracts, setContracts] = useState<BestDeal[]>([])
  const [averagePrice, setAveragePrice] = useState(propAveragePrice || 0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'alle' | 'vast' | 'dynamisch'>('alle')

  useEffect(() => {
    const fetchBestDeals = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/contracten/best-deals?limit=5&type=${filter}`)
        const data = await response.json()
        
        if (data.contracten) {
          setContracts(data.contracten)
          if (data.averagePrice) {
            setAveragePrice(data.averagePrice)
          }
        }
      } catch (error) {
        console.error('Error fetching best deals:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBestDeals()
  }, [filter])

  const getContractDetails = (contract: BestDeal) => {
    return contract.details_vast || contract.details_dynamisch || contract.details_maatwerk || {}
  }

  const getContractTypeLabel = (contract: BestDeal) => {
    if (contract.type === 'vast') return 'Vast tarief'
    if (contract.type === 'dynamisch') return 'Dynamisch'
    return 'Maatwerk'
  }

  const getLooptijd = (contract: BestDeal) => {
    const details = getContractDetails(contract)
    if (contract.type === 'vast' && details.looptijd) {
      return `${details.looptijd} jaar`
    }
    if (contract.type === 'dynamisch') {
      return 'Maandelijks opzegbaar'
    }
    return null
  }

  const getBesparing = (contract: BestDeal) => {
    if (averagePrice > 0 && contract.estimatedMaandbedrag < averagePrice) {
      return averagePrice - contract.estimatedMaandbedrag
    }
    return 0
  }

  const getRating = (contract: BestDeal) => {
    const details = getContractDetails(contract)
    return details.rating || contract.rating || 0
  }

  const getAantalReviews = (contract: BestDeal) => {
    const details = getContractDetails(contract)
    return details.aantal_reviews || 0
  }

  const isGroen = (contract: BestDeal) => {
    const details = getContractDetails(contract)
    return details.groene_energie || false
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-teal-500/20 rounded-lg animate-pulse" />
          <div className="h-8 bg-brand-teal-500/20 rounded-lg flex-1 animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white/10 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // Empty state
  if (contracts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-300">Geen contracten beschikbaar</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-teal-500/20 rounded-xl flex items-center justify-center">
            <Lightning className="w-6 h-6 text-brand-teal-400" weight="bold" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white">
              Energie vergelijken
            </h2>
            <p className="text-sm text-gray-300">
              Vergelijk de beste energiecontracten
            </p>
          </div>
        </div>

        {/* Promo Box */}
        <div className="bg-brand-teal-500/20 border border-brand-teal-400/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <TrendDown className="w-5 h-5 text-brand-teal-400 flex-shrink-0 mt-0.5" weight="bold" />
            <div>
              <p className="text-white font-medium text-sm">
                Overstappen in december?
              </p>
              <p className="text-gray-300 text-xs mt-0.5">
                92% kiest voor 1 jaar vast
              </p>
            </div>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-4 h-4 text-yellow-400"
                weight="fill"
              />
            ))}
          </div>
          <span className="text-white font-semibold text-sm">4.9/5</span>
          <span className="text-gray-400 text-xs">(7.500+ reviews)</span>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          {(['alle', 'vast', 'dynamisch'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === filterType
                  ? 'bg-brand-teal-500 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {filterType === 'alle' ? 'Alle' : filterType === 'vast' ? 'Vast' : 'Dynamisch'}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Beste aanbiedingen
        </h3>
      </div>

      {/* Desktop: Vertical Cards */}
      <div className="hidden lg:block space-y-4">
        {contracts.map((contract, index) => {
          const details = getContractDetails(contract)
          const rating = getRating(contract)
          const reviews = getAantalReviews(contract)
          const besparing = getBesparing(contract)
          const groen = isGroen(contract)
          const looptijd = getLooptijd(contract)
          const Icon = contract.type === 'vast' ? Lock : Lightning

          return (
            <Link
              key={contract.id}
              href="/calculator"
              className="block group"
            >
              <div className="bg-white rounded-xl p-4 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 border-transparent hover:border-brand-teal-500/30">
                {/* Position Badge */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-brand-teal-500 to-brand-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                    {index + 1}
                  </div>
                  {contract.aanbevolen && (
                    <span className="bg-brand-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Aanbevolen
                    </span>
                  )}
                </div>

                {/* Logo & Leverancier */}
                <div className="flex items-center gap-3 mb-3">
                  {contract.leverancier.logo_url && (
                    <div className="w-12 h-12 bg-gray-50 rounded-lg border border-gray-200 p-2 flex items-center justify-center flex-shrink-0">
                      <Image
                        src={contract.leverancier.logo_url}
                        alt={contract.leverancier.naam}
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-brand-navy-500 truncate">
                      {contract.leverancier.naam}
                    </h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3.5 h-3.5 text-yellow-400" weight="fill" />
                      <span className="text-sm text-gray-600">
                        {rating.toFixed(1)}
                        {reviews > 0 && (
                          <span className="text-gray-400 ml-1">({reviews})</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-teal-500 transition-colors flex-shrink-0" />
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-navy-50 text-brand-navy-700 rounded-full text-xs font-medium">
                    <Icon className="w-3.5 h-3.5" weight="bold" />
                    {getContractTypeLabel(contract)}
                  </span>
                  {looptijd && (
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {looptijd}
                    </span>
                  )}
                  {groen && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                      <Leaf className="w-3.5 h-3.5" weight="fill" />
                      Groen
                    </span>
                  )}
                </div>

                {/* Price & Savings */}
                <div className="space-y-1 mb-4">
                  {besparing > 0 && (
                    <div className="flex items-center gap-2 text-brand-teal-600 font-semibold">
                      <TrendDown className="w-4 h-4" weight="bold" />
                      <span className="text-sm">€{besparing} besparing/maand</span>
                    </div>
                  )}
                  <div className="text-2xl font-bold text-brand-navy-500">
                    €{contract.estimatedMaandbedrag}
                    <span className="text-base font-normal text-gray-600"> /maand</span>
                  </div>
                </div>

                {/* CTA Button */}
                <button className="w-full bg-brand-teal-500 hover:bg-brand-teal-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  Bereken je besparing
                  <ArrowRight className="w-4 h-4" weight="bold" />
                </button>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Mobile: Horizontal Scroll */}
      <div className="lg:hidden">
        <div className="flex gap-3 overflow-x-auto px-2 pb-4 scrollbar-hide snap-x snap-mandatory -mx-2">
          {contracts.map((contract, index) => {
            const details = getContractDetails(contract)
            const rating = getRating(contract)
            const reviews = getAantalReviews(contract)
            const besparing = getBesparing(contract)
            const groen = isGroen(contract)
            const looptijd = getLooptijd(contract)
            const Icon = contract.type === 'vast' ? Lock : Lightning

            return (
              <Link
                key={contract.id}
                href="/calculator"
                className="block flex-shrink-0 w-[280px] snap-start"
              >
                <div className="bg-white rounded-xl p-4 h-full border-2 border-transparent hover:border-brand-teal-500/30 transition-all">
                  {/* Position Badge */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-brand-teal-500 to-brand-teal-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-lg">
                      {index + 1}
                    </div>
                    {contract.aanbevolen && (
                      <span className="bg-brand-teal-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        Aanbevolen
                      </span>
                    )}
                  </div>

                  {/* Logo & Leverancier */}
                  <div className="flex items-center gap-2 mb-2">
                    {contract.leverancier.logo_url && (
                      <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-200 p-1.5 flex items-center justify-center flex-shrink-0">
                        <Image
                          src={contract.leverancier.logo_url}
                          alt={contract.leverancier.naam}
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-brand-navy-500 text-sm truncate">
                        {contract.leverancier.naam}
                      </h4>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400" weight="fill" />
                        <span className="text-xs text-gray-600">
                          {rating.toFixed(1)}
                          {reviews > 0 && (
                            <span className="text-gray-400 ml-0.5">({reviews})</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-navy-50 text-brand-navy-700 rounded-full text-xs font-medium">
                      <Icon className="w-3 h-3" weight="bold" />
                      {getContractTypeLabel(contract)}
                    </span>
                    {looptijd && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {looptijd}
                      </span>
                    )}
                    {groen && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                        <Leaf className="w-3 h-3" weight="fill" />
                        Groen
                      </span>
                    )}
                  </div>

                  {/* Price & Savings */}
                  <div className="space-y-1 mb-3">
                    {besparing > 0 && (
                      <div className="flex items-center gap-1.5 text-brand-teal-600 font-semibold">
                        <TrendDown className="w-3.5 h-3.5" weight="bold" />
                        <span className="text-xs">€{besparing} besparing/maand</span>
                      </div>
                    )}
                    <div className="text-xl font-bold text-brand-navy-500">
                      €{contract.estimatedMaandbedrag}
                      <span className="text-sm font-normal text-gray-600"> /maand</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button className="w-full bg-brand-teal-500 hover:bg-brand-teal-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                    Bereken je besparing
                    <ArrowRight className="w-4 h-4" weight="bold" />
                  </button>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Footer Links */}
      <div className="pt-4 space-y-2">
        <Link
          href="/calculator/resultaten"
          className="text-brand-teal-400 hover:text-brand-teal-300 text-sm font-medium flex items-center gap-2 group"
        >
          Meer contracten bekijken
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
        <p className="text-xs text-gray-400">
          De getoonde tarieven zijn indicatief. Exacte prijs na invoer verbruik.
        </p>
      </div>
    </div>
  )
}

