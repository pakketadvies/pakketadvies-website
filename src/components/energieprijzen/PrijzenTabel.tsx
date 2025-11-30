'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowUp, ArrowDown, Download, Table } from '@phosphor-icons/react'
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

type SortField = 'datum' | 'prijs'
type SortDirection = 'asc' | 'desc'

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
  const [sortField, setSortField] = useState<SortField>('datum')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [expanded, setExpanded] = useState(false)
  const [visibleRows, setVisibleRows] = useState(30)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(price)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  // Transform and sort data
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return []

    const transformed = data.map((item) => {
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

      // For sorting
      if (energietype === 'elektriciteit') {
        base.prijs = base.elektriciteit
      } else if (energietype === 'gas') {
        base.prijs = base.gas
      } else {
        base.prijs = base.elektriciteit || base.gas || 0
      }

      return base
    })

    // Sort
    const sorted = [...transformed].sort((a, b) => {
      if (sortField === 'datum') {
        const dateA = new Date(a.datum).getTime()
        const dateB = new Date(b.datum).getTime()
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
      } else {
        return sortDirection === 'asc' ? a.prijs - b.prijs : b.prijs - a.prijs
      }
    })

    return sorted
  }, [data, energietype, tarief, belastingen, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

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
      ...processedData.map((row) => {
        const values = [formatDate(row.datum)]
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
    link.setAttribute('download', `energieprijzen_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUp className="w-4 h-4 text-gray-300" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-brand-teal-500" />
    ) : (
      <ArrowDown className="w-4 h-4 text-brand-teal-500" />
    )
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
              <Table className="w-16 h-16 text-gray-300 mx-auto mb-4" weight="duotone" />
              <p className="text-gray-500">Geen data beschikbaar</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const displayData = expanded ? processedData : processedData.slice(0, visibleRows)
  const hasMore = processedData.length > visibleRows

  return (
    <Card className="mb-6">
      <CardContent className="pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-brand-navy-500 mb-2">Prijstabel</h3>
            <p className="text-sm text-gray-500">
              {processedData.length} {processedData.length === 1 ? 'record' : 'records'}
            </p>
          </div>
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-brand-navy-500">
                  <button
                    onClick={() => handleSort('datum')}
                    className="flex items-center gap-2 hover:text-brand-teal-600 transition-colors"
                  >
                    Datum
                    <SortIcon field="datum" />
                  </button>
                </th>
                {energietype === 'elektriciteit' || energietype === 'beide' ? (
                  energietype === 'beide' ? (
                    <>
                      <th className="text-right py-3 px-4 font-semibold text-brand-navy-500">
                        <button
                          onClick={() => handleSort('prijs')}
                          className="flex items-center gap-2 ml-auto hover:text-brand-teal-600 transition-colors"
                        >
                          Elektriciteit Dag
                          <SortIcon field="prijs" />
                        </button>
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-brand-navy-500">
                        Elektriciteit Nacht
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-brand-navy-500">
                        Elektriciteit Gemiddeld
                      </th>
                    </>
                  ) : (
                    <th className="text-right py-3 px-4 font-semibold text-brand-navy-500">
                      <button
                        onClick={() => handleSort('prijs')}
                        className="flex items-center gap-2 ml-auto hover:text-brand-teal-600 transition-colors"
                      >
                        Elektriciteit (€/kWh)
                        <SortIcon field="prijs" />
                      </button>
                    </th>
                  )
                ) : null}
                {energietype === 'gas' || energietype === 'beide' ? (
                  <th className="text-right py-3 px-4 font-semibold text-brand-navy-500">
                    <button
                      onClick={() => handleSort('prijs')}
                      className="flex items-center gap-2 ml-auto hover:text-brand-teal-600 transition-colors"
                    >
                      Gas (€/m³)
                      <SortIcon field="prijs" />
                    </button>
                  </th>
                ) : null}
                <th className="text-left py-3 px-4 font-semibold text-brand-navy-500">Bron</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((row, index) => {
                const isToday = row.datum === new Date().toISOString().split('T')[0]
                return (
                  <tr
                    key={index}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      isToday ? 'bg-brand-teal-50' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <span className={isToday ? 'font-semibold text-brand-teal-600' : ''}>
                        {formatDate(row.datum)}
                        {isToday && <span className="ml-2 text-xs text-brand-teal-600">(vandaag)</span>}
                      </span>
                    </td>
                    {energietype === 'elektriciteit' || energietype === 'beide' ? (
                      energietype === 'beide' ? (
                        <>
                          <td className="text-right py-3 px-4 font-mono">
                            {row.elektriciteit_dag ? formatPrice(row.elektriciteit_dag) : '-'}
                          </td>
                          <td className="text-right py-3 px-4 font-mono">
                            {row.elektriciteit_nacht ? formatPrice(row.elektriciteit_nacht) : '-'}
                          </td>
                          <td className="text-right py-3 px-4 font-mono font-semibold">
                            {formatPrice(row.elektriciteit)}
                          </td>
                        </>
                      ) : (
                        <td className="text-right py-3 px-4 font-mono font-semibold">
                          {formatPrice(row.elektriciteit)}
                        </td>
                      )
                    ) : null}
                    {energietype === 'gas' || energietype === 'beide' ? (
                      <td className="text-right py-3 px-4 font-mono font-semibold">
                        {formatPrice(row.gas)}
                      </td>
                    ) : null}
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-500">{row.bron}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {hasMore && !expanded && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => {
                setExpanded(true)
                setVisibleRows(processedData.length)
              }}
            >
              Toon alle {processedData.length} records
            </Button>
          </div>
        )}

        {expanded && processedData.length > 30 && (
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => {
                setExpanded(false)
                setVisibleRows(30)
              }}
            >
              Toon minder
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

