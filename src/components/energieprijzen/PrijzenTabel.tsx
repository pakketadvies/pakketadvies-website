'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CaretLeft, CaretRight, Download, Calendar } from '@phosphor-icons/react'
import type { Energietype, TariefType, BelastingenType } from './PrijzenFilters'

interface PrijsData {
  datum: string
  elektriciteit_gemiddeld?: number
  elektriciteit_dag?: number
  elektriciteit_nacht?: number
  gas_gemiddeld?: number
  bron?: string
}

interface PrijzenTabelProps {
  data: PrijsData[]
  energietype: Energietype
  tarief: TariefType
  belastingen: BelastingenType
  loading?: boolean
}

const BTW_PERCENTAGE = 0.21
const EB_ELEKTRICITEIT = 0.10154
const EB_GAS = 0.57816

export function PrijzenTabel({
  data,
  energietype,
  tarief,
  belastingen,
  loading,
}: PrijzenTabelProps) {
  const [currentWeek, setCurrentWeek] = useState(0) // 0 = current week, -1 = last week, etc.
  const [viewMode, setViewMode] = useState<'week' | 'all'>('week')

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 5,
      maximumFractionDigits: 5,
    }).format(price)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const days = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']
    const dayName = days[date.getDay()]
    const day = date.getDate()
    const month = date.getMonth() + 1
    return `${dayName} ${day} ${month}`
  }

  const formatDateFull = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  // Get current week dates
  const getWeekDates = (weekOffset: number) => {
    const today = new Date()
    const currentDay = today.getDay()
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1) // Monday as first day
    const monday = new Date(today.setDate(diff))
    monday.setDate(monday.getDate() + (weekOffset * 7))
    
    const weekDates: Date[] = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      weekDates.push(date)
    }
    return weekDates
  }

  // Get week number
  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }

  // Process data
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return []

    return data.map((item) => {
      const base: any = {
        datum: item.datum,
        bron: item.bron || 'Onbekend',
      }

      // Add electricity prices
      if (energietype === 'elektriciteit' || energietype === 'beide') {
        let elecPrice = 0
        
        if (tarief === 'dag' && item.elektriciteit_dag) {
          elecPrice = item.elektriciteit_dag
        } else if (tarief === 'nacht' && item.elektriciteit_nacht) {
          elecPrice = item.elektriciteit_nacht
        } else {
          elecPrice = item.elektriciteit_gemiddeld || item.elektriciteit_dag || 0
        }

        if (belastingen === 'inclusief') {
          const withEB = elecPrice + EB_ELEKTRICITEIT
          elecPrice = withEB * (1 + BTW_PERCENTAGE)
        }

        base.elektriciteit = parseFloat(elecPrice.toFixed(5))
        base.elektriciteit_dag = item.elektriciteit_dag ? parseFloat((belastingen === 'inclusief' 
          ? (item.elektriciteit_dag + EB_ELEKTRICITEIT) * (1 + BTW_PERCENTAGE)
          : item.elektriciteit_dag).toFixed(5)) : null
        base.elektriciteit_nacht = item.elektriciteit_nacht ? parseFloat((belastingen === 'inclusief'
          ? (item.elektriciteit_nacht + EB_ELEKTRICITEIT) * (1 + BTW_PERCENTAGE)
          : item.elektriciteit_nacht).toFixed(5)) : null
      }

      // Add gas prices
      if (energietype === 'gas' || energietype === 'beide') {
        let gasPrice = item.gas_gemiddeld || 0

        if (belastingen === 'inclusief') {
          const withEB = gasPrice + EB_GAS
          gasPrice = withEB * (1 + BTW_PERCENTAGE)
        }

        base.gas = parseFloat(gasPrice.toFixed(5))
      }

      return base
    })
  }, [data, energietype, tarief, belastingen])

  // Filter data for current week
  const weekDates = getWeekDates(currentWeek)
  const weekStart = weekDates[0].toISOString().split('T')[0]
  const weekEnd = weekDates[6].toISOString().split('T')[0]

  const weekData = useMemo(() => {
    if (viewMode === 'all') return processedData
    
    return processedData.filter(item => {
      return item.datum >= weekStart && item.datum <= weekEnd
    })
  }, [processedData, weekStart, weekEnd, viewMode])

  // Get current time and price
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const currentHour = now.getHours()
  const currentPrice = processedData.find(item => item.datum === todayStr)

  const exportToCSV = () => {
    const headers = ['Datum']
    if (energietype === 'elektriciteit' || energietype === 'beide') {
      if (energietype === 'beide') {
        headers.push('Elektriciteit Dag (€/kWh)', 'Elektriciteit Nacht (€/kWh)', 'Elektriciteit Gemiddeld (€/kWh)')
      } else {
        headers.push('Elektriciteit (€/kWh)')
      }
    }
    if (energietype === 'gas' || energietype === 'beide') {
      headers.push('Gas (€/m³)')
    }
    headers.push('Bron')

    const csvRows = [
      headers.join(','),
      ...(viewMode === 'week' ? weekData : processedData).map((row) => {
        const values = [formatDateFull(row.datum)]
        if (energietype === 'elektriciteit' || energietype === 'beide') {
          if (energietype === 'beide') {
            values.push(
              row.elektriciteit_dag?.toFixed(5) || '',
              row.elektriciteit_nacht?.toFixed(5) || '',
              row.elektriciteit.toFixed(5)
            )
          } else {
            values.push(row.elektriciteit.toFixed(5))
          }
        }
        if (energietype === 'gas' || energietype === 'beide') {
          values.push(row.gas.toFixed(5))
        }
        values.push(row.bron)
        return values.join(',')
      }),
    ]

    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `energieprijzen_${viewMode === 'week' ? `week_${getWeekNumber(weekDates[0])}` : 'all'}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-8">
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-brand-teal-50 border-t-brand-teal-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Tabel laden...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!processedData || processedData.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-8">
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" weight="duotone" />
              <p className="text-gray-500">Geen data beschikbaar</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const weekNumber = getWeekNumber(weekDates[0])
  const currentYear = weekDates[0].getFullYear()

  return (
    <Card className="mb-6">
      <CardContent className="pt-8">
        {/* Header with week navigation */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentWeek(currentWeek - 1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Vorige week"
              >
                <CaretLeft className="w-5 h-5 text-brand-navy-500" weight="bold" />
              </button>
              <div className="px-4 py-2 bg-gray-100 rounded-lg min-w-[140px] text-center">
                <span className="font-semibold text-brand-navy-500">
                  Week {weekNumber}
                </span>
                <div className="text-xs text-gray-500 mt-0.5">
                  {formatDateFull(weekStart)} - {formatDateFull(weekEnd)}
                </div>
              </div>
              <button
                onClick={() => setCurrentWeek(currentWeek + 1)}
                disabled={currentWeek >= 0}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Volgende week"
              >
                <CaretRight className="w-5 h-5 text-brand-navy-500" weight="bold" />
              </button>
            </div>
            
            {/* View mode toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'week'
                    ? 'bg-white text-brand-teal-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'all'
                    ? 'bg-white text-brand-teal-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Alles
              </button>
            </div>
          </div>

          {/* Current price indicator */}
          {currentPrice && currentWeek === 0 && (
            <div className="flex items-center gap-3 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <div className="text-xs text-gray-600">Nu: {currentHour}:00 - {currentHour + 1}:00</div>
                <div className="text-sm font-semibold text-brand-navy-500">
                  {energietype === 'elektriciteit' || energietype === 'beide' 
                    ? `Gem. marktprijs: ${formatPrice(currentPrice.elektriciteit)}/kWh`
                    : `Gem. marktprijs: ${formatPrice(currentPrice.gas)}/m³`
                  }
                </div>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-4 font-semibold text-brand-navy-500">Datum</th>
                {energietype === 'elektriciteit' || energietype === 'beide' ? (
                  energietype === 'beide' ? (
                    <>
                      <th className="text-right py-3 px-4 font-semibold text-brand-navy-500">Dag (€/kWh)</th>
                      <th className="text-right py-3 px-4 font-semibold text-brand-navy-500">Nacht (€/kWh)</th>
                      <th className="text-right py-3 px-4 font-semibold text-brand-navy-500">Gemiddeld (€/kWh)</th>
                    </>
                  ) : (
                    <th className="text-right py-3 px-4 font-semibold text-brand-navy-500">
                      {tarief === 'dag' ? 'Dag' : tarief === 'nacht' ? 'Nacht' : 'Gemiddeld'} (€/kWh)
                    </th>
                  )
                ) : null}
                {energietype === 'gas' || energietype === 'beide' ? (
                  <th className="text-right py-3 px-4 font-semibold text-brand-navy-500">Gas (€/m³)</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {(viewMode === 'week' ? weekData : processedData).map((row, index) => {
                const isToday = row.datum === todayStr
                const date = new Date(row.datum)
                const isWeekend = date.getDay() === 0 || date.getDay() === 6
                
                return (
                  <tr
                    key={index}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      isToday ? 'bg-brand-teal-50 font-semibold' : ''
                    } ${isWeekend ? 'bg-gray-50/50' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <span className={isToday ? 'text-brand-teal-600' : 'text-gray-700'}>
                        {formatDate(row.datum)}
                      </span>
                    </td>
                    {energietype === 'elektriciteit' || energietype === 'beide' ? (
                      energietype === 'beide' ? (
                        <>
                          <td className="text-right py-3 px-4 font-mono text-gray-700">
                            {row.elektriciteit_dag ? formatPrice(row.elektriciteit_dag) : '-'}
                          </td>
                          <td className="text-right py-3 px-4 font-mono text-gray-700">
                            {row.elektriciteit_nacht ? formatPrice(row.elektriciteit_nacht) : '-'}
                          </td>
                          <td className={`text-right py-3 px-4 font-mono ${isToday ? 'text-brand-teal-600 font-bold' : 'text-gray-900 font-semibold'}`}>
                            {formatPrice(row.elektriciteit)}
                          </td>
                        </>
                      ) : (
                        <td className={`text-right py-3 px-4 font-mono ${isToday ? 'text-brand-teal-600 font-bold' : 'text-gray-900 font-semibold'}`}>
                          {formatPrice(row.elektriciteit)}
                        </td>
                      )
                    ) : null}
                    {energietype === 'gas' || energietype === 'beide' ? (
                      <td className={`text-right py-3 px-4 font-mono ${isToday ? 'text-brand-teal-600 font-bold' : 'text-gray-900 font-semibold'}`}>
                        {formatPrice(row.gas)}
                      </td>
                    ) : null}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        {viewMode === 'week' && weekData.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Marktprijs gemiddeld:{' '}
                <span className="font-semibold text-brand-navy-500">
                  {energietype === 'elektriciteit' || energietype === 'beide'
                    ? formatPrice(weekData.reduce((sum, r) => sum + r.elektriciteit, 0) / weekData.length)
                    : formatPrice(weekData.reduce((sum, r) => sum + r.gas, 0) / weekData.length)
                  }
                  {energietype === 'elektriciteit' || energietype === 'beide' ? '/kWh' : '/m³'}
                </span>
              </span>
              <span className="text-xs text-gray-500">
                {weekData.length} {weekData.length === 1 ? 'dag' : 'dagen'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
