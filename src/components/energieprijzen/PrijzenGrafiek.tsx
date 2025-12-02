'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/Card'
import { Lightning, Flame, CaretLeft, CaretRight } from '@phosphor-icons/react'
import type { Energietype } from './PrijzenFilters'

interface HourlyPrice {
  hour: number
  price: number
  min?: number
  max?: number
}

interface QuarterHourlyPrice {
  hour: number
  quarter: number
  timestamp: string
  price: number
  time: string
}

interface PrijzenGrafiekProps {
  data: any[]
  belastingen?: string
  loading?: boolean
}

const BTW_PERCENTAGE = 0.21
const EB_ELEKTRICITEIT = 0.10154
const EB_GAS = 0.57816

type GraphView = 'dag' | 'week' | 'maand' | 'jaar'
type LocalEnergietype = 'elektriciteit' | 'gas'

export function PrijzenGrafiek({
  data,
  belastingen = 'exclusief',
  loading,
}: PrijzenGrafiekProps) {
  // Local state for graph controls
  const [localEnergietype, setLocalEnergietype] = useState<LocalEnergietype>('elektriciteit')
  const [graphView, setGraphView] = useState<GraphView>('dag')
  // Store selectedDate as string to avoid Date object reference issues
  const [selectedDateStr, setSelectedDateStr] = useState(() => new Date().toISOString().split('T')[0])
  const [showQuarterHour, setShowQuarterHour] = useState(false)
  const [hourlyData, setHourlyData] = useState<HourlyPrice[]>([])
  const [quarterHourlyData, setQuarterHourlyData] = useState<QuarterHourlyPrice[]>([])
  const [loadingHourly, setLoadingHourly] = useState(false)
  // Store current time as timestamp to avoid Date object issues
  const [currentTimeStamp, setCurrentTimeStamp] = useState(() => Date.now())
  // Detect mobile screen size
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimeStamp(Date.now())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fetch hourly/quarter-hourly data when date or type changes
  useEffect(() => {
    // Always fetch data for day view, or for gas (single daily price)
    if (graphView === 'dag') {
      const fetchHourlyData = async () => {
        setLoadingHourly(true)
        try {
          const response = await fetch(`/api/energieprijzen/uur?date=${selectedDateStr}&type=${localEnergietype}`)
          const result = await response.json()
          
          if (result.success) {
            if (result.hourly) {
              setHourlyData(result.hourly)
            }
            if (result.quarterHourly) {
              setQuarterHourlyData(result.quarterHourly)
            }
          } else {
            // If API fails, clear data
            setHourlyData([])
            setQuarterHourlyData([])
          }
        } catch (error) {
          console.error('Error fetching hourly data:', error)
          setHourlyData([])
          setQuarterHourlyData([])
        } finally {
          setLoadingHourly(false)
        }
      }

      fetchHourlyData()
    } else {
      // For week/month/year, clear hourly data
      setHourlyData([])
      setQuarterHourlyData([])
    }
  }, [selectedDateStr, localEnergietype, graphView])

  // Helper: get Date object from string (only for display/calculation)
  const selectedDate = new Date(selectedDateStr + 'T00:00:00Z')

  // Calculate current time values directly - no useMemo to avoid React error #310
  const currentTime = new Date(currentTimeStamp)
  const currentHour = currentTime.getHours()
  const currentQuarter = Math.floor(currentTime.getMinutes() / 15)
  const todayStr = new Date().toISOString().split('T')[0]
  const isToday = selectedDateStr === todayStr

  // Format chart data
  const chartData = useMemo(() => {
    // Debug logging for week/month/year views
    if (graphView !== 'dag' && data && data.length > 0) {
      const firstDate = data[0]?.datum
      const lastDate = data[data.length - 1]?.datum
      console.log(`[PrijzenGrafiek] ${graphView} view:`, {
        totalData: data.length,
        firstDate,
        lastDate,
        sampleDates: data.slice(0, 5).map(d => d.datum),
        sampleDatesEnd: data.slice(-5).map(d => d.datum)
      })
      
      // Check if we have recent data
      const today = new Date().toISOString().split('T')[0]
      const hasRecentData = lastDate >= today || lastDate >= '2025-11-01'
      console.log(`[PrijzenGrafiek] Has recent data (>= 2025-11-01):`, hasRecentData, 'lastDate:', lastDate)
    }
    
    // For day view with hourly/quarter-hourly data
    if (graphView === 'dag' && localEnergietype === 'elektriciteit') {
      const sourceData = showQuarterHour ? quarterHourlyData : hourlyData
      
      // If no hourly data, fallback to daily data from props
      if (sourceData.length === 0) {
        const dayData = data.find((d) => {
          // Handle both string and Date formats
          const recordDate = typeof d.datum === 'string' ? d.datum : new Date(d.datum).toISOString().split('T')[0]
          return recordDate === selectedDateStr
        })
        
        if (!dayData) return []
        
        // Use daily average price and create a single bar
        let elecPrice = dayData.elektriciteit_gemiddeld || dayData.elektriciteit_dag || 0
        if (belastingen === 'inclusief') {
          const withEB = elecPrice + EB_ELEKTRICITEIT
          elecPrice = withEB * (1 + BTW_PERCENTAGE)
        }
        
        return [{
          index: 0,
          hour: 12,
          label: 'Vandaag',
          price: parseFloat(elecPrice.toFixed(5)),
          originalPrice: dayData.elektriciteit_gemiddeld || dayData.elektriciteit_dag || 0,
        }]
      }
      
      return sourceData.map((item, index) => {
        let price = item.price
        
        if (belastingen === 'inclusief') {
          const withEB = price + EB_ELEKTRICITEIT
          price = withEB * (1 + BTW_PERCENTAGE)
        }
        
        if (showQuarterHour) {
          const qhItem = item as QuarterHourlyPrice
          return {
            index,
            hour: qhItem.hour,
            quarter: qhItem.quarter,
            label: qhItem.time,
            price: parseFloat(price.toFixed(5)),
            originalPrice: qhItem.price,
          }
        } else {
          const hItem = item as HourlyPrice
          return {
            index,
            hour: hItem.hour,
            label: `${String(hItem.hour).padStart(2, '0')}:00`,
            price: parseFloat(price.toFixed(5)),
            min: hItem.min ? parseFloat((belastingen === 'inclusief' 
              ? (hItem.min + EB_ELEKTRICITEIT) * (1 + BTW_PERCENTAGE)
              : hItem.min).toFixed(5)) : undefined,
            max: hItem.max ? parseFloat((belastingen === 'inclusief'
              ? (hItem.max + EB_ELEKTRICITEIT) * (1 + BTW_PERCENTAGE)
              : hItem.max).toFixed(5)) : undefined,
            originalPrice: hItem.price,
          }
        }
      })
    }
    
    // For gas day view - single daily price
    if (graphView === 'dag' && localEnergietype === 'gas') {
      const dayData = data.find((d) => {
        // Handle both string and Date formats
        const recordDate = typeof d.datum === 'string' ? d.datum : new Date(d.datum).toISOString().split('T')[0]
        return recordDate === selectedDateStr
      })
      
      if (!dayData) return []
      
      let gasPrice = dayData.gas_gemiddeld || 0
      if (belastingen === 'inclusief') {
        const withEB = gasPrice + EB_GAS
        gasPrice = withEB * (1 + BTW_PERCENTAGE)
      }
      
      return [{
        label: 'Vandaag',
        price: parseFloat(gasPrice.toFixed(5)),
        originalPrice: dayData.gas_gemiddeld || 0,
      }]
    }
    
    // Fallback to daily data for week/month/year views
    if (!data || data.length === 0) return []

    // Filter data based on graphView
    // For week/month/year, always show data up to today (not selectedDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]
    
    // Helper function to normalize date strings
    const normalizeDate = (dateInput: any): string => {
      if (typeof dateInput === 'string') {
        // If it's already a string in YYYY-MM-DD format, return it
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
          return dateInput
        }
        // Try to parse it
        const parsed = new Date(dateInput)
        if (!isNaN(parsed.getTime())) {
          return parsed.toISOString().split('T')[0]
        }
        return dateInput
      }
      // If it's a Date object, convert to string
      if (dateInput instanceof Date) {
        return dateInput.toISOString().split('T')[0]
      }
      // Fallback: try to create a Date
      const parsed = new Date(dateInput)
      return isNaN(parsed.getTime()) ? '' : parsed.toISOString().split('T')[0]
    }
    
    let filteredData = data
    if (graphView === 'week') {
      // Show last 7 days from today (including today)
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 6) // 7 days total (today + 6 days back)
      const weekAgoStr = weekAgo.toISOString().split('T')[0]
      
      console.log(`[PrijzenGrafiek] Week filter: ${weekAgoStr} to ${todayStr}`)
      
      filteredData = data.filter((item) => {
        const recordDate = normalizeDate(item.datum)
        if (!recordDate) {
          console.warn('[PrijzenGrafiek] Invalid date:', item.datum)
          return false
        }
        const inRange = recordDate >= weekAgoStr && recordDate <= todayStr
        return inRange
      })
      
      console.log(`[PrijzenGrafiek] Week filtered: ${filteredData.length} records from ${data.length} total`)
    } else if (graphView === 'maand') {
      // Show last 30 days from today (including today)
      const monthAgo = new Date(today)
      monthAgo.setDate(monthAgo.getDate() - 29) // 30 days total (today + 29 days back)
      const monthAgoStr = monthAgo.toISOString().split('T')[0]
      
      console.log(`[PrijzenGrafiek] Month filter: ${monthAgoStr} to ${todayStr}`)
      
      filteredData = data.filter((item) => {
        const recordDate = normalizeDate(item.datum)
        if (!recordDate) {
          console.warn('[PrijzenGrafiek] Invalid date:', item.datum)
          return false
        }
        const inRange = recordDate >= monthAgoStr && recordDate <= todayStr
        return inRange
      })
      
      console.log(`[PrijzenGrafiek] Month filtered: ${filteredData.length} records from ${data.length} total`)
    } else if (graphView === 'jaar') {
      // Show last 365 days from today (including today)
      const yearAgo = new Date(today)
      yearAgo.setDate(yearAgo.getDate() - 364) // 365 days total (today + 364 days back)
      const yearAgoStr = yearAgo.toISOString().split('T')[0]
      
      console.log(`[PrijzenGrafiek] Year filter: ${yearAgoStr} to ${todayStr}`)
      
      filteredData = data.filter((item) => {
        const recordDate = normalizeDate(item.datum)
        if (!recordDate) {
          console.warn('[PrijzenGrafiek] Invalid date:', item.datum)
          return false
        }
        const inRange = recordDate >= yearAgoStr && recordDate <= todayStr
        return inRange
      })
      
      console.log(`[PrijzenGrafiek] Year filtered: ${filteredData.length} records from ${data.length} total`)
      
      // For year view: aggregate data per month
      const monthGroups: Record<string, any[]> = {}
      
      filteredData.forEach((item) => {
        const recordDate = normalizeDate(item.datum)
        if (!recordDate) return
        
        const date = new Date(recordDate + 'T00:00:00Z')
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        
        if (!monthGroups[monthKey]) {
          monthGroups[monthKey] = []
        }
        monthGroups[monthKey].push(item)
      })
      
      // Calculate monthly averages, min, max
      const monthNames = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
      
      return Object.entries(monthGroups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([monthKey, items]) => {
          const [year, month] = monthKey.split('-')
          const monthIndex = parseInt(month) - 1
          const monthName = monthNames[monthIndex]
          
          const base: any = {
            datum: monthName,
            fullDate: monthKey,
            monthKey,
            year: parseInt(year),
            month: parseInt(month),
          }
          
          if (localEnergietype === 'elektriciteit') {
            const prices = items.map(item => {
              let price = item.elektriciteit_gemiddeld || item.elektriciteit_dag || 0
              if (belastingen === 'inclusief') {
                const withEB = price + EB_ELEKTRICITEIT
                price = withEB * (1 + BTW_PERCENTAGE)
              }
              return parseFloat(price.toFixed(5))
            })
            
            const originalPrices = items.map(item => item.elektriciteit_gemiddeld || item.elektriciteit_dag || 0)
            
            base.prijs = prices.reduce((sum, p) => sum + p, 0) / prices.length
            base.min = Math.min(...prices)
            base.max = Math.max(...prices)
            base.originalPrice = originalPrices.reduce((sum, p) => sum + p, 0) / originalPrices.length
            base.originalMin = Math.min(...originalPrices)
            base.originalMax = Math.max(...originalPrices)
          }
          
          if (localEnergietype === 'gas') {
            const prices = items.map(item => {
              let price = item.gas_gemiddeld || 0
              if (belastingen === 'inclusief') {
                const withEB = price + EB_GAS
                price = withEB * (1 + BTW_PERCENTAGE)
              }
              return parseFloat(price.toFixed(5))
            })
            
            const originalPrices = items.map(item => item.gas_gemiddeld || 0)
            
            base.prijs = prices.reduce((sum, p) => sum + p, 0) / prices.length
            base.min = Math.min(...prices)
            base.max = Math.max(...prices)
            base.originalPrice = originalPrices.reduce((sum, p) => sum + p, 0) / originalPrices.length
            base.originalMin = Math.min(...originalPrices)
            base.originalMax = Math.max(...originalPrices)
          }
          
          return base
        })
    }
    
    // For week/month views: return daily data
    return filteredData.map((item) => {
      const base: any = {
        datum: new Date(item.datum).toLocaleDateString('nl-NL', {
          day: '2-digit',
          month: '2-digit',
        }),
        fullDate: item.datum,
      }

      if (localEnergietype === 'elektriciteit') {
        let elecPrice = item.elektriciteit_gemiddeld || item.elektriciteit_dag || 0
        
        if (belastingen === 'inclusief') {
          const withEB = elecPrice + EB_ELEKTRICITEIT
          elecPrice = withEB * (1 + BTW_PERCENTAGE)
        }

          base.prijs = parseFloat(elecPrice.toFixed(5))
        base.originalPrice = item.elektriciteit_gemiddeld || item.elektriciteit_dag || 0
      }

      if (localEnergietype === 'gas') {
        let gasPrice = item.gas_gemiddeld || 0

        if (belastingen === 'inclusief') {
          const withEB = gasPrice + EB_GAS
          gasPrice = withEB * (1 + BTW_PERCENTAGE)
        }

          base.prijs = parseFloat(gasPrice.toFixed(5))
        base.originalPrice = item.gas_gemiddeld || 0
      }

      return base
    })
  }, [
    hourlyData, 
    quarterHourlyData, 
    showQuarterHour, 
    data, // Keep data - we need to recalculate when data changes
    graphView, 
    localEnergietype, 
    belastingen, 
    selectedDateStr
  ])

  // Calculate average price - direct calculation, no useMemo
  const averagePrice = chartData.length === 0 ? 0 : 
    chartData.map((d: any) => d.price || d.prijs || 0).reduce((sum: number, p: number) => sum + p, 0) / chartData.length

  // Find min and max prices for labels - direct calculation, no useMemo
  const prices = chartData.map((d: any) => d.price || d.prijs || 0)
  const minPrice = chartData.length === 0 ? 0 : Math.min(...prices)
  const maxPrice = chartData.length === 0 ? 0 : Math.max(...prices)
  const minIndex = chartData.length === 0 ? -1 : prices.indexOf(minPrice)
  const maxIndex = chartData.length === 0 ? -1 : prices.indexOf(maxPrice)

  // Get current hour/quarter price - direct calculation, no useMemo
  const getCurrentPriceInfo = () => {
    if (graphView !== 'dag') return null
    
    // Calculate isToday inside useMemo to avoid dependency issues
    const today = new Date().toISOString().split('T')[0]
    if (selectedDateStr !== today) return null
    
    if (localEnergietype === 'elektriciteit') {
      if (showQuarterHour && quarterHourlyData.length > 0) {
        const qhData = quarterHourlyData.find(
          (q) => q.hour === currentHour && q.quarter === currentQuarter
        )
        if (!qhData) return null
        
        let price = qhData.price
        if (belastingen === 'inclusief') {
          const withEB = price + EB_ELEKTRICITEIT
          price = withEB * (1 + BTW_PERCENTAGE)
        }
        
        const nextQuarter = currentQuarter === 3 ? { hour: currentHour + 1, quarter: 0 } : { hour: currentHour, quarter: currentQuarter + 1 }
        const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentQuarter * 15).padStart(2, '0')} - ${String(nextQuarter.hour).padStart(2, '0')}:${String(nextQuarter.quarter * 15).padStart(2, '0')}`
        
        return {
          price: parseFloat(price.toFixed(5)),
          time: timeStr,
          index: quarterHourlyData.indexOf(qhData),
        }
      } else if (hourlyData.length > 0) {
        const hourData = hourlyData.find((h) => h.hour === currentHour)
        if (!hourData) return null
        
        let price = hourData.price
        if (belastingen === 'inclusief') {
          const withEB = price + EB_ELEKTRICITEIT
          price = withEB * (1 + BTW_PERCENTAGE)
        }
        
        return {
          price: parseFloat(price.toFixed(5)),
          time: `${String(currentHour).padStart(2, '0')}:00 - ${String(currentHour + 1).padStart(2, '0')}:00`,
          index: hourlyData.indexOf(hourData),
        }
      }
    } else if (localEnergietype === 'gas') {
      const dayData = data.find((d) => {
        const recordDate = typeof d.datum === 'string' ? d.datum : new Date(d.datum).toISOString().split('T')[0]
        return recordDate === selectedDateStr
      })
      if (!dayData) return null
      
      let price = dayData.gas_gemiddeld || 0
      if (belastingen === 'inclusief') {
        const withEB = price + EB_GAS
        price = withEB * (1 + BTW_PERCENTAGE)
      }
      
      return {
        price: parseFloat(price.toFixed(5)),
        time: 'Vandaag',
        index: 0,
      }
    }
    
    return null
  }
  
  const currentPriceInfo = getCurrentPriceInfo()

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 5,
      maximumFractionDigits: 5,
    }).format(value)
  }

  const formatPriceYAxis = (value: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
    const date = new Date(selectedDateStr + 'T00:00:00Z')
    if (direction === 'prev') {
      switch (graphView) {
        case 'dag':
          date.setUTCDate(date.getUTCDate() - 1)
          break
        case 'week':
          date.setUTCDate(date.getUTCDate() - 7)
          break
        case 'maand':
          date.setUTCMonth(date.getUTCMonth() - 1)
          break
        case 'jaar':
          date.setUTCFullYear(date.getUTCFullYear() - 1)
          break
      }
    } else {
      switch (graphView) {
        case 'dag':
          date.setUTCDate(date.getUTCDate() + 1)
          break
        case 'week':
          date.setUTCDate(date.getUTCDate() + 7)
          break
        case 'maand':
          date.setUTCMonth(date.getUTCMonth() + 1)
          break
        case 'jaar':
          date.setUTCFullYear(date.getUTCFullYear() + 1)
          break
      }
    }
    setSelectedDateStr(date.toISOString().split('T')[0])
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload
      const isYearView = graphView === 'jaar'
      
      return (
        <div className="bg-white p-2 md:p-4 rounded-lg shadow-xl border border-gray-200 max-w-[180px] sm:max-w-[200px] md:max-w-none">
          <p className="font-semibold text-brand-navy-500 text-xs md:text-sm mb-1 md:mb-2">
            {isYearView && data?.year ? `${label} ${data.year}` : label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="text-xs md:text-sm" style={{ color: entry.color }}>
              <p className="font-medium">
              {entry.name}: {formatPrice(entry.value)}
            </p>
              {isYearView && data && (data.min !== undefined || data.max !== undefined) && (
                <div className="mt-1 text-[10px] md:text-xs text-gray-600">
                  {data.min !== undefined && (
                    <p>Min: {formatPrice(data.min)}</p>
                  )}
                  {data.max !== undefined && (
                    <p>Max: {formatPrice(data.max)}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  // Custom label component for min/max prices on bars (disabled on mobile for better readability)
  const CustomBarLabel = ({ x, y, width, value, index }: any) => {
    if (index !== minIndex && index !== maxIndex) return null
    
    const isMin = index === minIndex
    const price = isMin ? minPrice : maxPrice
    
    return (
      <text
        x={x + width / 2}
        y={y - 8}
        fill={isMin ? '#10B981' : '#EF4444'}
        textAnchor="middle"
        fontSize={12}
        fontWeight="bold"
      >
        {formatPrice(price)}
      </text>
    )
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

  // Don't show empty state if we're still loading hourly data for day view
  if ((!chartData || chartData.length === 0) && !loadingHourly && graphView === 'dag') {
    return (
      <Card className="mb-6">
        <CardContent className="pt-8">
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <Lightning className="w-16 h-16 text-gray-300 mx-auto mb-4" weight="duotone" />
              <p className="text-gray-500">Geen data beschikbaar voor deze datum</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // For week/month/year views, show empty state if no data
  if ((!chartData || chartData.length === 0) && graphView !== 'dag' && !loading) {
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
  
  // Calculate current index for "Nu" line - direct calculation, no useMemo
  const getCurrentIndex = () => {
    if (!isToday || graphView !== 'dag') return -1
    
    if (localEnergietype === 'elektriciteit') {
      if (showQuarterHour && quarterHourlyData.length > 0) {
        const index = quarterHourlyData.findIndex(
          (q) => q.hour === currentHour && q.quarter === currentQuarter
        )
        return index >= 0 ? index : -1
      } else if (hourlyData.length > 0) {
        const index = hourlyData.findIndex((h) => h.hour === currentHour)
        return index >= 0 ? index : -1
      }
    } else if (localEnergietype === 'gas') {
      // For gas, show "Nu" line on the single bar
      return 0
    }
    
    return -1
  }
  
  const currentIndex = getCurrentIndex()

  return (
    <Card className="mb-6">
      <CardContent className="pt-4 md:pt-8 px-2 md:px-6">
        {/* Controls Section */}
        <div className="mb-4 md:mb-6 space-y-3 md:space-y-4">
          {/* Type Toggle (Stroom/Gas) */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => {
                setLocalEnergietype('elektriciteit')
                if (graphView !== 'dag') setGraphView('dag')
              }}
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all ${
                localEnergietype === 'elektriciteit'
                  ? 'bg-brand-teal-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Lightning className="w-4 h-4 md:w-5 md:h-5" weight="duotone" />
              <span className="hidden sm:inline">Stroom</span>
              <span className="sm:hidden">Stroom</span>
            </button>
            <button
              onClick={() => {
                setLocalEnergietype('gas')
                setShowQuarterHour(false)
                if (graphView !== 'dag') setGraphView('dag')
              }}
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all ${
                localEnergietype === 'gas'
                  ? 'bg-brand-teal-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Flame className="w-4 h-4 md:w-5 md:h-5" weight="duotone" />
              Gas
            </button>
          </div>

          {/* Quarter Hour Toggle (only for electricity, day view) */}
          {localEnergietype === 'elektriciteit' && graphView === 'dag' && (
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-xs md:text-sm text-gray-600">Toon kwartierprijzen</span>
              <button
                onClick={() => setShowQuarterHour(!showQuarterHour)}
                className={`relative w-10 h-5 md:w-12 md:h-6 rounded-full transition-colors ${
                  showQuarterHour ? 'bg-brand-teal-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 md:top-1 md:left-1 w-4 h-4 md:w-4 md:h-4 bg-white rounded-full transition-transform ${
                    showQuarterHour ? 'translate-x-5 md:translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              </div>
            )}

          {/* Period Filters */}
          <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto pb-1 -mx-2 px-2 md:mx-0 md:px-0">
            {(['dag', 'week', 'maand', 'jaar'] as GraphView[]).map((view) => (
              <button
                key={view}
                onClick={() => {
                  setGraphView(view)
                  if (view !== 'dag') {
                    setShowQuarterHour(false)
                  }
                }}
                className={`px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  graphView === view
                    ? 'bg-brand-teal-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => navigateDate('prev')}
              className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Vorige"
            >
              <CaretLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600" weight="bold" />
            </button>
            <div className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-gray-100 rounded-lg flex-1 justify-center">
              <span className="font-medium text-gray-700 text-sm md:text-base">{formatDate(selectedDate)}</span>
            </div>
            <button
              onClick={() => navigateDate('next')}
              disabled={isToday && graphView === 'dag'}
              className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Volgende"
            >
              <CaretRight className="w-4 h-4 md:w-5 md:h-5 text-gray-600" weight="bold" />
            </button>
              </div>
        </div>

        {/* Current Price Box (yellow, above graph) */}
        {currentPriceInfo && isToday && graphView === 'dag' && (
          <div className="mb-3 md:mb-4 px-3 md:px-4 py-2 md:py-3 bg-[#FCD34D] rounded-lg border border-yellow-400">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <span className="text-xs md:text-sm font-medium text-gray-800">
                Nu: {currentPriceInfo.time}
              </span>
              <span className="text-xs md:text-sm text-gray-800">
                Gem. marktprijs: <span className="font-semibold">{formatPrice(currentPriceInfo.price)}/{localEnergietype === 'elektriciteit' ? 'kWh' : 'm³'}</span>
              </span>
            </div>
          </div>
        )}

        {/* Graph */}
        {chartData && chartData.length > 0 ? (
          <div className="h-64 sm:h-80 md:h-96 w-full relative overflow-x-auto -ml-2 md:ml-0" style={{ width: '100%' }}>
            <div className="min-w-full pl-2 md:pl-0" style={{ height: '100%', minHeight: '256px' }}>
              <ResponsiveContainer width="100%" height="100%" minHeight={256}>
              {graphView === 'jaar' ? (
                // Line chart for year view - optimized for mobile
            <LineChart 
              data={chartData} 
                  margin={{ 
                    top: 10, 
                    right: 10, 
                    left: 20, 
                    bottom: 40 
                  }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="datum"
                stroke="#6B7280"
                style={{ fontSize: isMobile ? '8px' : '10px' }}
                angle={0}
                textAnchor="middle"
                height={isMobile ? 50 : 30}
                interval="preserveStartEnd"
                tick={{ fontSize: isMobile ? 8 : 10 }}
              />
              <YAxis
                stroke="#6B7280"
                    style={{ fontSize: '10px' }}
                    tickFormatter={(value) => formatPriceYAxis(value)}
                    width={20}
              />
              <Tooltip content={<CustomTooltip />} />
                  
                  {/* Average price reference line */}
                  {averagePrice > 0 && (
                    <ReferenceLine
                      y={averagePrice}
                      stroke="#6B7280"
                      strokeDasharray="5 5"
                      strokeWidth={1}
                    />
                  )}
                  
                  {/* Line chart */}
                  <Line
                    type="monotone"
                    dataKey="prijs"
                    name={localEnergietype === 'elektriciteit' ? 'Elektriciteit' : 'Gas'}
                    stroke="#00AF9B"
                    strokeWidth={1.5}
                    dot={{ fill: '#00AF9B', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              ) : (
                // Bar chart for day/week/month views
                <BarChart
                  data={chartData} 
                  margin={{ 
                    top: 10, 
                    right: 10, 
                    left: 20, 
                    bottom: graphView === 'dag' ? 40 : 60
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey={graphView === 'dag' ? 'label' : 'datum'}
                    stroke="#6B7280"
                    style={{ fontSize: isMobile ? '8px' : '10px' }}
                    angle={graphView === 'dag' ? 0 : -60}
                    textAnchor={graphView === 'dag' ? 'middle' : 'end'}
                    height={graphView === 'dag' ? (isMobile ? 50 : 30) : 60}
                    // For quarter-hourly: show every 3 hours (00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00)
                    // Every 3 hours = every 12 quarter-hours (3 * 4 = 12)
                    // Interval 11 means: skip 11, show 1 = every 12th tick
                    interval={
                      graphView === 'dag' && showQuarterHour
                        ? 11 // Every 12th tick = every 3 hours (00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00)
                        : 'preserveStartEnd'
                    }
                    tick={{ fontSize: isMobile ? 8 : 10 }}
                    // No custom tickFormatter needed - interval handles it correctly
                    // The interval of 11 will show: index 0 (00:00), 12 (03:00), 24 (06:00), 36 (09:00), 48 (12:00), 60 (15:00), 72 (18:00), 84 (21:00)
                  />
                  <YAxis
                    stroke="#6B7280"
                    style={{ fontSize: '10px' }}
                    tickFormatter={(value) => formatPriceYAxis(value)}
                    width={20}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Average price reference line */}
                  {averagePrice > 0 && (
                    <ReferenceLine
                      y={averagePrice}
                      stroke="#6B7280"
                      strokeDasharray="5 5"
                      strokeWidth={1}
                    />
                  )}
                  
                  {/* Current time indicator (yellow "Nu" line) */}
                  {isToday && graphView === 'dag' && currentIndex >= 0 && (
                    <ReferenceLine
                      x={currentIndex}
                      stroke="#FCD34D"
                  strokeWidth={2}
                      label={{ 
                        value: 'Nu', 
                        position: 'bottom', 
                        fill: '#FCD34D', 
                        fontSize: 10, 
                        fontWeight: 'bold' 
                      }}
                      />
                  )}
                  
                  {/* Bar chart */}
                  <Bar
                    dataKey={graphView === 'dag' ? 'price' : 'prijs'}
                    name={localEnergietype === 'elektriciteit' ? 'Elektriciteit' : 'Gas'}
                    fill="#00AF9B"
                    radius={[4, 4, 0, 0]}
                    label={undefined} // Disabled on mobile for readability
                    // Make bars narrower for quarter-hourly view (96 bars)
                    barSize={graphView === 'dag' && showQuarterHour ? 4 : undefined}
                  >
                    {chartData.map((entry: any, index: number) => {
                      const price = entry.price || entry.prijs || 0
                      const isLow = index === minIndex
                      const isHigh = index === maxIndex
                      
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={isLow ? '#10B981' : isHigh ? '#EF4444' : '#00AF9B'}
                />
                      )
                    })}
                  </Bar>
                </BarChart>
              )}
          </ResponsiveContainer>
            </div>
            
            {/* Type indicator (STROOM/GAS) - bottom right */}
            <div className="absolute bottom-1 right-2 md:bottom-2 md:right-4">
              <span className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase">
                {localEnergietype === 'elektriciteit' ? 'STROOM' : 'GAS'}
              </span>
            </div>
          </div>
        ) : null}

        {/* Average price below graph */}
        <div className="mt-3 md:mt-4 text-center mb-4 md:mb-6">
          <p className="text-xs md:text-sm text-gray-600">
            Marktprijs gemiddeld: <span className="font-semibold text-brand-navy-500">{formatPrice(averagePrice)}/{localEnergietype === 'elektriciteit' ? 'kWh' : 'm³'}</span>
          </p>
        </div>

        {/* Explanatory text (like Nieuwe Stroom) */}
        {localEnergietype === 'elektriciteit' && graphView === 'dag' && (
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
