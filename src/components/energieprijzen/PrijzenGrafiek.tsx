'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/Card'
import { Lightning, Flame, CaretLeft, CaretRight, Calendar } from '@phosphor-icons/react'
import type { Energietype } from './PrijzenFilters'

interface HourlyPrice {
  hour: number
  price: number
  min?: number
  max?: number
}

interface PrijzenGrafiekProps {
  data: any[]
  periode: string
  energietype: Energietype
  tarief: string
  belastingen: string
  loading?: boolean
}

const BTW_PERCENTAGE = 0.21
const EB_ELEKTRICITEIT = 0.10154
const EB_GAS = 0.57816

export function PrijzenGrafiek({
  data,
  periode,
  energietype,
  tarief,
  belastingen,
  loading,
}: PrijzenGrafiekProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showQuarterHour, setShowQuarterHour] = useState(false)
  const [hourlyData, setHourlyData] = useState<HourlyPrice[]>([])
  const [loadingHourly, setLoadingHourly] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const timeRange = periode === '1m' ? 'dag' : periode === '3m' ? 'week' : periode === '1j' ? 'maand' : 'jaar'

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fetch hourly data when date or type changes
  useEffect(() => {
    if (timeRange !== 'dag' || energietype === 'gas') {
      setHourlyData([])
      return
    }

    const fetchHourlyData = async () => {
      setLoadingHourly(true)
      try {
        const dateStr = selectedDate.toISOString().split('T')[0]
        const response = await fetch(`/api/energieprijzen/uur?date=${dateStr}&type=${energietype}`)
        const result = await response.json()
        
        if (result.success && result.hourly) {
          setHourlyData(result.hourly)
        }
      } catch (error) {
        console.error('Error fetching hourly data:', error)
      } finally {
        setLoadingHourly(false)
      }
    }

    fetchHourlyData()
  }, [selectedDate, energietype, timeRange])

  // Format chart data
  const chartData = useMemo(() => {
    if (timeRange === 'dag' && hourlyData.length > 0 && energietype !== 'gas') {
      return hourlyData.map((item) => {
        let price = item.price
        
        if (belastingen === 'inclusief') {
          const withEB = price + EB_ELEKTRICITEIT
          price = withEB * (1 + BTW_PERCENTAGE)
        }
        
        return {
          hour: item.hour,
          label: `${String(item.hour).padStart(2, '0')}:00`,
          price: parseFloat(price.toFixed(5)),
          min: item.min ? parseFloat((belastingen === 'inclusief' 
            ? (item.min + EB_ELEKTRICITEIT) * (1 + BTW_PERCENTAGE)
            : item.min).toFixed(5)) : undefined,
          max: item.max ? parseFloat((belastingen === 'inclusief'
            ? (item.max + EB_ELEKTRICITEIT) * (1 + BTW_PERCENTAGE)
            : item.max).toFixed(5)) : undefined,
        }
      })
    }
    
    // Fallback to daily data
    if (!data || data.length === 0) return []
    
    return data.map((item) => {
      const base: any = {
        datum: new Date(item.datum).toLocaleDateString('nl-NL', {
          day: '2-digit',
          month: '2-digit',
        }),
        fullDate: item.datum,
      }

      if (energietype === 'elektriciteit' || energietype === 'beide') {
        let elecPrice = item.elektriciteit_gemiddeld || item.elektriciteit_dag || 0
        
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

      if (energietype === 'gas' || energietype === 'beide') {
        let gasPrice = item.gas_gemiddeld || 0
        
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
  }, [hourlyData, data, timeRange, energietype, belastingen])

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 5,
      maximumFractionDigits: 5,
    }).format(value)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setSelectedDate(newDate)
  }

  // Calculate average price
  const averagePrice = useMemo(() => {
    if (chartData.length === 0) return 0
    const prices = chartData.map((d: any) => d.price || d.prijs || d.elektriciteit || d.gas || 0)
    return prices.reduce((sum: number, p: number) => sum + p, 0) / prices.length
  }, [chartData])

  // Get current hour price
  const currentHourPrice = useMemo(() => {
    if (timeRange !== 'dag' || !hourlyData.length) return null
    
    const currentHour = currentTime.getHours()
    const today = new Date()
    const isToday = selectedDate.toISOString().split('T')[0] === today.toISOString().split('T')[0]
    
    if (!isToday) return null
    
    const hourData = hourlyData.find((h) => h.hour === currentHour)
    if (!hourData) return null
    
    let price = hourData.price
    if (belastingen === 'inclusief') {
      const withEB = price + EB_ELEKTRICITEIT
      price = withEB * (1 + BTW_PERCENTAGE)
    }
    
    return {
      hour: currentHour,
      price: parseFloat(price.toFixed(5)),
      time: `${String(currentHour).padStart(2, '0')}:00 - ${String(currentHour + 1).padStart(2, '0')}:00`,
    }
  }, [hourlyData, currentTime, selectedDate, timeRange, belastingen])

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

  if (loading || loadingHourly) {
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

  const isToday = selectedDate.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
  const currentHour = currentTime.getHours()

  return (
    <Card className="mb-6">
      <CardContent className="pt-8">
        {/* Controls */}
        <div className="mb-6 space-y-4">
          {/* Quarter Hour Toggle (only for electricity, day view) */}
          {energietype === 'elektriciteit' && timeRange === 'dag' && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Toon kwartierprijzen</span>
              <button
                onClick={() => setShowQuarterHour(!showQuarterHour)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  showQuarterHour ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    showQuarterHour ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Date Navigation */}
          {timeRange === 'dag' && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Vorige dag"
              >
                <CaretLeft className="w-5 h-5 text-gray-600" weight="bold" />
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" weight="duotone" />
                <span className="font-medium text-gray-700">{formatDate(selectedDate)}</span>
              </div>
              <button
                onClick={() => navigateDate('next')}
                disabled={isToday}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Volgende dag"
              >
                <CaretRight className="w-5 h-5 text-gray-600" weight="bold" />
              </button>
            </div>
          )}

          {/* Current Time/Price Indicator */}
          {currentHourPrice && isToday && timeRange === 'dag' && (
            <div className="flex items-center gap-4 flex-wrap">
              <div className="px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  Nu: {currentHourPrice.time}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">
                  Gem. marktprijs: <span className="font-semibold">{formatPrice(currentHourPrice.price)}/kWh</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Graph */}
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey={timeRange === 'dag' ? 'label' : 'datum'}
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                angle={timeRange === 'dag' ? 0 : -45}
                textAnchor={timeRange === 'dag' ? 'middle' : 'end'}
                height={timeRange === 'dag' ? 40 : 80}
              />
              <YAxis
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => formatPrice(value)}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Average price reference line */}
              <ReferenceLine
                y={averagePrice}
                stroke="#000"
                strokeDasharray="5 5"
                strokeWidth={1}
                label={{ value: `Gemiddeld: ${formatPrice(averagePrice)}`, position: 'right' }}
              />
              
              {/* Current time indicator (only for today, day view) */}
              {isToday && timeRange === 'dag' && currentHourPrice && (
                <ReferenceLine
                  x={currentHour}
                  stroke="#FCD34D"
                  strokeWidth={3}
                  label={{ value: 'Nu', position: 'bottom', fill: '#FCD34D', fontSize: 12 }}
                />
              )}
              
              {/* Bar chart */}
              {energietype === 'beide' ? (
                <>
                  <Bar dataKey="elektriciteit" name="Elektriciteit" fill="#00AF9B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gas" name="Gas" fill="#1A3756" radius={[4, 4, 0, 0]} />
                </>
              ) : (
                <Bar
                  dataKey={timeRange === 'dag' ? 'price' : 'prijs'}
                  name={energietype === 'elektriciteit' ? 'Elektriciteit' : 'Gas'}
                  fill="#00AF9B"
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry: any, index: number) => {
                    // Color bars based on price (green for low, red for high)
                    const price = entry.price || entry.prijs || entry.elektriciteit || entry.gas || 0
                    const isLow = price < averagePrice * 0.9
                    const isHigh = price > averagePrice * 1.1
                    
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={isLow ? '#10B981' : isHigh ? '#EF4444' : '#00AF9B'}
                      />
                    )
                  })}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Average price below graph */}
        <div className="mt-4 text-center mb-6">
          <p className="text-sm text-gray-600">
            Marktprijs gemiddeld: <span className="font-semibold text-brand-navy-500">{formatPrice(averagePrice)}/kWh</span>
          </p>
        </div>

        {/* Explanatory text (like Nieuwe Stroom) */}
        {energietype === 'elektriciteit' && timeRange === 'dag' && (
          <div className="mt-6 space-y-3 text-sm text-gray-700">
            <p>
              Voor stroom verschilt de prijs per kwartier, voor gas per dag. Je kunt de marktprijzen (en je verbruik) realtime volgen, 
              dus op de kwartierprijzen kun je slim inspelen. Dat heeft twee voordelen: je bespaart extra en helpt Nederland sneller 
              en goedkoper fossielvrij te zijn.
            </p>
            <p>
              Omdat je altijd de markt volgt, voorkom je verborgen kosten voor de voorfinanciering van langlopende contracten en de 
              bijbehorende risico's van de leverancier.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
