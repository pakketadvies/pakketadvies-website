'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/Card'
import { Lightning, Flame } from '@phosphor-icons/react'
import type { PeriodeType, Energietype, TariefType, BelastingenType } from './PrijzenFilters'

interface PrijsData {
  datum: string
  elektriciteit_gemiddeld?: number
  elektriciteit_dag?: number
  elektriciteit_nacht?: number
  gas_gemiddeld?: number
  bron?: string
}

interface PrijzenGrafiekProps {
  data: PrijsData[]
  periode: PeriodeType
  energietype: Energietype
  tarief: TariefType
  belastingen: BelastingenType
  loading?: boolean
}

// BTW percentage (21%)
const BTW_PERCENTAGE = 0.21
// Energiebelasting per kWh (ongeveer €0.10/kWh voor kleinverbruik)
const EB_ELEKTRICITEIT = 0.10154
// Energiebelasting per m³ gas (ongeveer €0.58/m³)
const EB_GAS = 0.57816

export function PrijzenGrafiek({
  data,
  periode,
  energietype,
  tarief,
  belastingen,
  loading,
}: PrijzenGrafiekProps) {
  // Transform data for chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    return data.map((item) => {
      const base: any = {
        datum: new Date(item.datum).toLocaleDateString('nl-NL', {
          day: '2-digit',
          month: '2-digit',
          year: periode === '1m' || periode === '3m' ? undefined : 'numeric',
        }),
        fullDate: item.datum,
      }

      // Add electricity data
      if (energietype === 'elektriciteit' || energietype === 'beide') {
        let elecPrice = 0
        
        if (tarief === 'dag' && item.elektriciteit_dag) {
          elecPrice = item.elektriciteit_dag
        } else if (tarief === 'nacht' && item.elektriciteit_nacht) {
          elecPrice = item.elektriciteit_nacht
        } else {
          elecPrice = item.elektriciteit_gemiddeld || item.elektriciteit_dag || 0
        }

        // Add taxes if needed
        if (belastingen === 'inclusief') {
          const withEB = elecPrice + EB_ELEKTRICITEIT
          elecPrice = withEB * (1 + BTW_PERCENTAGE)
        }

        if (energietype === 'beide') {
          base.elektriciteit = parseFloat(elecPrice.toFixed(5))
        } else {
          base.prijs = parseFloat(elecPrice.toFixed(5))
        }
      }

      // Add gas data
      if (energietype === 'gas' || energietype === 'beide') {
        let gasPrice = item.gas_gemiddeld || 0

        // Add taxes if needed
        if (belastingen === 'inclusief') {
          const withEB = gasPrice + EB_GAS
          gasPrice = withEB * (1 + BTW_PERCENTAGE)
        }

        if (energietype === 'beide') {
          base.gas = parseFloat(gasPrice.toFixed(5))
        } else {
          base.prijs = parseFloat(gasPrice.toFixed(5))
        }
      }

      return base
    })
  }, [data, periode, energietype, tarief, belastingen])

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
          <p className="font-semibold text-brand-navy-500 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatPrice(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-8">
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-brand-teal-50 border-t-brand-teal-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Grafiek laden...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-8">
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <Lightning className="w-16 h-16 text-gray-300 mx-auto mb-4" weight="duotone" />
              <p className="text-gray-500">Geen data beschikbaar voor deze periode</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-brand-navy-500 mb-2">
            {energietype === 'elektriciteit' && (
              <div className="flex items-center gap-2">
                <Lightning className="w-6 h-6 text-brand-teal-500" weight="duotone" />
                Elektriciteitsprijzen
              </div>
            )}
            {energietype === 'gas' && (
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-brand-teal-500" weight="duotone" />
                Gasprijzen
              </div>
            )}
            {energietype === 'beide' && 'Energieprijzen'}
          </h3>
          <p className="text-sm text-gray-500">
            {belastingen === 'exclusief' ? 'Marktprijzen' : 'Consumentenprijzen'} 
            {' '}({belastingen === 'exclusief' ? 'excl.' : 'incl.'} BTW en energiebelasting)
          </p>
        </div>

        <div className="h-80 md:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              margin={{ top: 5, right: 20, left: 10, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="datum"
                stroke="#6B7280"
                style={{ fontSize: 'clamp(10px, 2vw, 12px)' }}
                angle={-45}
                textAnchor="end"
                height={80}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#6B7280"
                style={{ fontSize: 'clamp(10px, 2vw, 12px)' }}
                tickFormatter={(value) => formatPrice(value)}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                iconType="line"
              />
              
              {energietype === 'beide' ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="elektriciteit"
                    name="Elektriciteit"
                    stroke="#00AF9B"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="gas"
                    name="Gas"
                    stroke="#1A3756"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </>
              ) : (
                <Line
                  type="monotone"
                  dataKey="prijs"
                  name={energietype === 'elektriciteit' ? 'Elektriciteit' : 'Gas'}
                  stroke="#00AF9B"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

