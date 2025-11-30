'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { TrendUp, TrendDown, Minus, Lightning, Flame } from '@phosphor-icons/react'

interface PrijzenInfoCardsProps {
  vandaag: {
    elektriciteit: { gemiddeld: number; dag: number; nacht: number }
    gas: { gemiddeld: number }
  } | null
  gemiddelden: {
    elektriciteit: number
    elektriciteit_dag: number
    elektriciteit_nacht: number
    gas: number
  }
  trends: {
    elektriciteit: 'up' | 'down' | 'stable'
    gas: 'up' | 'down' | 'stable'
  }
  loading?: boolean
}

export function PrijzenInfoCards({ vandaag, gemiddelden, trends, loading }: PrijzenInfoCardsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(price)
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendUp className="w-5 h-5 text-red-500" weight="bold" />
      case 'down':
        return <TrendDown className="w-5 h-5 text-green-500" weight="bold" />
      default:
        return <Minus className="w-5 h-5 text-gray-400" weight="bold" />
    }
  }

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-8">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {/* Huidige Prijzen */}
      <Card className="hover:shadow-xl transition-shadow border-l-4 border-l-brand-teal-500">
        <CardContent className="pt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-teal-400 to-brand-teal-500 rounded-xl flex items-center justify-center">
                <Lightning className="w-6 h-6 text-white" weight="duotone" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-navy-500">Huidige Prijzen</h3>
                <p className="text-sm text-gray-500">Vandaag</p>
              </div>
            </div>
            {vandaag && getTrendIcon(trends.elektriciteit)}
          </div>
          
          {vandaag ? (
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">Elektriciteit</p>
                <p className="text-2xl font-bold text-brand-navy-500">
                  {formatPrice(vandaag.elektriciteit.gemiddeld)}
                  <span className="text-sm font-normal text-gray-500">/kWh</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Gas</p>
                <p className="text-xl font-semibold text-brand-navy-500">
                  {formatPrice(vandaag.gas.gemiddeld)}
                  <span className="text-sm font-normal text-gray-500">/m³</span>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Geen data beschikbaar voor vandaag</p>
          )}
        </CardContent>
      </Card>

      {/* Gemiddelde Prijzen (30 dagen) */}
      <Card className="hover:shadow-xl transition-shadow border-l-4 border-l-brand-navy-500">
        <CardContent className="pt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-navy-400 to-brand-navy-500 rounded-xl flex items-center justify-center">
              <Lightning className="w-6 h-6 text-white" weight="duotone" />
            </div>
            <div>
              <h3 className="font-semibold text-brand-navy-500">Gemiddelde Prijzen</h3>
              <p className="text-sm text-gray-500">Laatste 30 dagen</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">Elektriciteit gemiddeld</p>
              <p className="text-2xl font-bold text-brand-navy-500">
                {formatPrice(gemiddelden.elektriciteit)}
                <span className="text-sm font-normal text-gray-500">/kWh</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Gas gemiddeld</p>
              <p className="text-xl font-semibold text-brand-navy-500">
                {formatPrice(gemiddelden.gas)}
                <span className="text-sm font-normal text-gray-500">/m³</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prijsontwikkeling */}
      <Card className="hover:shadow-xl transition-shadow border-l-4 border-l-brand-purple-500">
        <CardContent className="pt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-purple-400 to-brand-purple-500 rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" weight="duotone" />
            </div>
            <div>
              <h3 className="font-semibold text-brand-navy-500">Prijsontwikkeling</h3>
              <p className="text-sm text-gray-500">Trend analyse</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Elektriciteit</span>
              <div className="flex items-center gap-2">
                {getTrendIcon(trends.elektriciteit)}
                <span className={`text-sm font-semibold ${
                  trends.elektriciteit === 'up' ? 'text-red-500' :
                  trends.elektriciteit === 'down' ? 'text-green-500' :
                  'text-gray-500'
                }`}>
                  {trends.elektriciteit === 'up' ? 'Stijgend' :
                   trends.elektriciteit === 'down' ? 'Dalend' :
                   'Stabiel'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Gas</span>
              <div className="flex items-center gap-2">
                {getTrendIcon(trends.gas)}
                <span className={`text-sm font-semibold ${
                  trends.gas === 'up' ? 'text-red-500' :
                  trends.gas === 'down' ? 'text-green-500' :
                  'text-gray-500'
                }`}>
                  {trends.gas === 'up' ? 'Stijgend' :
                   trends.gas === 'down' ? 'Dalend' :
                   'Stabiel'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

