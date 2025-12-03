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

  // Helper function to normalize date strings (used in multiple places)
  const normalizeDate = (dateInput: any): string => {
    if (typeof dateInput === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        return dateInput
      }
      const parsed = new Date(dateInput)
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0]
      }
      return dateInput
    }
    if (dateInput instanceof Date) {
      return dateInput.toISOString().split('T')[0]
    }
    const parsed = new Date(dateInput)
    return isNaN(parsed.getTime()) ? '' : parsed.toISOString().split('T')[0]
  }

  // Calculate latest available data date (for navigation limits)
  const latestDataDate = useMemo(() => {
    if (!data || data.length === 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return today
    }
    const dates = data.map(item => {
      const recordDate = normalizeDate(item.datum)
      return recordDate ? new Date(recordDate + 'T00:00:00Z') : null
    }).filter(d => d !== null) as Date[]
    if (dates.length === 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return today
    }
    const latest = new Date(Math.max(...dates.map(d => d.getTime())))
    latest.setHours(0, 0, 0, 0)
    return latest
  }, [data])

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
          // For the last hour (23:00), we want to show it as "00:00" to indicate the next day
          const isLastHour = index === hourlyData.length - 1 && hItem.hour === 23
          return {
            index,
            hour: hItem.hour,
            label: isLastHour ? '00:00' : `${String(hItem.hour).padStart(2, '0')}:00`,
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
    
    // Helper functions to calculate period boundaries based on selectedDate
    const getWeekStart = (date: Date): Date => {
      const d = new Date(date)
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday as first day
      return new Date(d.setDate(diff))
    }
    
    const getWeekEnd = (date: Date): Date => {
      const start = getWeekStart(date)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      return end
    }
    
    const getMonthStart = (date: Date): Date => {
      return new Date(date.getFullYear(), date.getMonth(), 1)
    }
    
    const getMonthEnd = (date: Date): Date => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0)
    }
    
    const getYearStart = (date: Date): Date => {
      return new Date(date.getFullYear(), 0, 1)
    }
    
    const getYearEnd = (date: Date): Date => {
      return new Date(date.getFullYear(), 11, 31)
    }
    
    // Calculate period boundaries based on selectedDate and graphView
    let periodStart: Date
    let periodEnd: Date
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (graphView === 'week') {
      periodStart = getWeekStart(selectedDate)
      periodEnd = getWeekEnd(selectedDate)
      const todayStr = today.toISOString().split('T')[0]
      const selectedDateStr = selectedDate.toISOString().split('T')[0]
      const weekStartStr = periodStart.toISOString().split('T')[0]
      const weekEndStr = periodEnd.toISOString().split('T')[0]
      
      // Check if this is the current week (today is within this week)
      const isCurrentWeek = todayStr >= weekStartStr && todayStr <= weekEndStr
      
      if (isCurrentWeek) {
        // Current week - include today and tomorrow if data is available
        // Don't limit to today, but extend to latest available data (which includes tomorrow)
        if (latestDataDate > periodEnd) {
          periodEnd = latestDataDate
        }
      } else {
        // Past week - show full week, don't limit to today
        // Only limit if the week extends beyond available data
        if (periodEnd > latestDataDate) {
          periodEnd = latestDataDate
        }
      }
    } else if (graphView === 'maand') {
      periodStart = getMonthStart(selectedDate)
      periodEnd = getMonthEnd(selectedDate)
      
      // Check if this is the current month
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const selectedMonth = selectedDate.getMonth()
      const selectedYear = selectedDate.getFullYear()
      const currentMonth = today.getMonth()
      const currentYear = today.getFullYear()
      const isCurrentMonth = selectedMonth === currentMonth && selectedYear === currentYear
      
      if (isCurrentMonth) {
        // Current month: show from 1st to today (or tomorrow if data available)
        // Use latestDataDate to include tomorrow if available
        if (latestDataDate < periodEnd) {
          periodEnd = latestDataDate
        }
      } else {
        // Past month: show full month (1st to last day of that month)
        // Only limit if data doesn't extend that far (shouldn't happen for past months)
        if (periodEnd > latestDataDate) {
          periodEnd = latestDataDate
        }
      }
    } else if (graphView === 'jaar') {
      periodStart = getYearStart(selectedDate)
      periodEnd = getYearEnd(selectedDate)
      // Only limit if the year extends beyond available data
      if (periodEnd > latestDataDate) {
        periodEnd = latestDataDate
      }
    } else {
      // For day view, use selectedDate
      periodStart = selectedDate
      periodEnd = selectedDate
    }
    
    // Set time to midnight to ensure correct date comparison (use UTC to avoid timezone issues)
    const periodStartStr = `${periodStart.getUTCFullYear()}-${String(periodStart.getUTCMonth() + 1).padStart(2, '0')}-${String(periodStart.getUTCDate()).padStart(2, '0')}`
    const periodEndStr = `${periodEnd.getUTCFullYear()}-${String(periodEnd.getUTCMonth() + 1).padStart(2, '0')}-${String(periodEnd.getUTCDate()).padStart(2, '0')}`
    
    // Filter data based on calculated period
    let filteredData = data.filter((item) => {
      const recordDate = normalizeDate(item.datum)
      if (!recordDate) {
        return false
      }
      return recordDate >= periodStartStr && recordDate <= periodEndStr
    })
    
    if (graphView === 'jaar') {
      
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
      
      // Create entries for all 12 months, even if no data
      const year = selectedDate.getFullYear()
      const allMonths: Array<[string, any[]]> = []
      
      for (let month = 1; month <= 12; month++) {
        const monthKey = `${year}-${String(month).padStart(2, '0')}`
        allMonths.push([monthKey, monthGroups[monthKey] || []])
      }
      
      return allMonths
        .map(([monthKey, items]) => {
          const [year, month] = monthKey.split('-')
          const monthIndex = parseInt(month) - 1
          const monthName = monthNames[monthIndex]
          
          // If no data for this month, return null/empty values
          if (items.length === 0) {
            return {
              datum: monthName,
              fullDate: monthKey,
              monthKey,
              year: parseInt(year),
              month: parseInt(month),
              prijs: 0,
              originalPrice: 0,
              min: 0,
              max: 0,
              originalMin: 0,
              originalMax: 0,
              isEmpty: true,
            }
          }
          
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
    // Sort by date to ensure correct order
    const sortedData = [...filteredData].sort((a, b) => {
      const dateA = normalizeDate(a.datum)
      const dateB = normalizeDate(b.datum)
      return dateA.localeCompare(dateB)
    })
    
    return sortedData.map((item) => {
      // Ensure we use the normalized date format
      const recordDate = normalizeDate(item.datum)
      const date = new Date(recordDate + 'T00:00:00Z')
      
      const base: any = {
        datum: date.toLocaleDateString('nl-NL', {
          day: '2-digit',
          month: '2-digit',
        }),
        fullDate: recordDate,
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

  // Helper function to calculate week number (ISO 8601)
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }

  // Helper functions to get period display date
  const getDisplayDate = (): Date => {
    switch (graphView) {
      case 'week': {
        // Use the Monday of the week
        const d = new Date(selectedDateStr + 'T00:00:00Z')
        const day = d.getDay()
        const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday as first day
        return new Date(d.setDate(diff))
      }
      case 'maand': {
        // Use the first day of the month
        const d = new Date(selectedDateStr + 'T00:00:00Z')
        return new Date(d.getFullYear(), d.getMonth(), 1)
      }
      case 'jaar': {
        // Use the first day of the year
        const d = new Date(selectedDateStr + 'T00:00:00Z')
        return new Date(d.getFullYear(), 0, 1)
      }
      default:
        return selectedDate
    }
  }

  const formatDate = (date: Date) => {
    // Use the display date for week/month/year to show the correct period
    const displayDate = graphView !== 'dag' ? getDisplayDate() : date
    
    switch (graphView) {
      case 'dag':
        return displayDate.toLocaleDateString('nl-NL', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      case 'week': {
        const weekNumber = getWeekNumber(displayDate)
        const year = displayDate.getFullYear()
        return `Week ${weekNumber}, ${year}`
      }
      case 'maand':
        return displayDate.toLocaleDateString('nl-NL', {
          month: 'long',
          year: 'numeric',
        })
      case 'jaar':
        return displayDate.getFullYear().toString()
      default:
        return displayDate.toLocaleDateString('nl-NL', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
    }
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const date = new Date(selectedDateStr + 'T00:00:00Z')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (direction === 'prev') {
      switch (graphView) {
        case 'dag':
          date.setUTCDate(date.getUTCDate() - 1)
          break
        case 'week': {
          // Go to Monday of previous week
          const day = date.getDay()
          const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Monday of current week
          const monday = new Date(date)
          monday.setDate(diff)
          monday.setUTCDate(monday.getUTCDate() - 7) // Previous week Monday
          date.setTime(monday.getTime())
          break
        }
        case 'maand': {
          // Go to first day of previous month
          date.setUTCMonth(date.getUTCMonth() - 1)
          date.setUTCDate(1)
          break
        }
        case 'jaar': {
          // Go to first day of previous year
          date.setUTCFullYear(date.getUTCFullYear() - 1)
          date.setUTCMonth(0)
          date.setUTCDate(1)
          break
        }
      }
    } else {
      switch (graphView) {
        case 'dag':
          date.setUTCDate(date.getUTCDate() + 1)
          // Allow navigation to tomorrow if data is available
          if (date > latestDataDate) {
            return
          }
          break
        case 'week': {
          // Go to Monday of next week
          const day = date.getDay()
          const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Monday of current week
          const monday = new Date(date)
          monday.setDate(diff)
          monday.setUTCDate(monday.getUTCDate() + 7) // Next week Monday
          // Only prevent if week extends beyond available data
          if (monday > latestDataDate) {
            return
          }
          date.setTime(monday.getTime())
          break
        }
        case 'maand': {
          // Go to first day of next month
          date.setUTCMonth(date.getUTCMonth() + 1)
          date.setUTCDate(1)
          // Only prevent if month extends beyond available data
          if (date > latestDataDate) {
            return
          }
          break
        }
        case 'jaar': {
          // Go to first day of next year
          date.setUTCFullYear(date.getUTCFullYear() + 1)
          date.setUTCMonth(0)
          date.setUTCDate(1)
          // Only prevent if year extends beyond available data
          if (date > latestDataDate) {
            return
          }
          break
        }
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
          {/* Desktop: Top row with Stroom/Gas left and Period filters right */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            {/* Type Toggle (Stroom/Gas) - Horizontal on mobile, left on desktop */}
            <div className="flex flex-row items-center gap-2 md:gap-3">
              <button
                onClick={() => {
                  setLocalEnergietype('elektriciteit')
                  if (graphView !== 'dag') setGraphView('dag')
                }}
                className={`flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-1.5 rounded-lg text-sm md:text-base font-medium transition-all flex-1 md:flex-none ${
                  localEnergietype === 'elektriciteit'
                    ? 'bg-brand-teal-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Lightning className="w-4 h-4 md:w-5 md:h-5" weight="duotone" />
                <span>Stroom</span>
              </button>
              <button
                onClick={() => {
                  setLocalEnergietype('gas')
                  setShowQuarterHour(false)
                  if (graphView !== 'dag') setGraphView('dag')
                }}
                className={`flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-1.5 rounded-lg text-sm md:text-base font-medium transition-all flex-1 md:flex-none ${
                  localEnergietype === 'gas'
                    ? 'bg-brand-teal-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Flame className="w-4 h-4 md:w-5 md:h-5" weight="duotone" />
                Gas
              </button>
            </div>

            {/* Period Filters - Horizontal on mobile, right on desktop */}
            <div className="flex flex-row items-center gap-1.5 md:gap-1.5 md:overflow-x-auto md:pb-1 md:-mx-2 md:px-2">
              {(['dag', 'week', 'maand', 'jaar'] as GraphView[]).map((view) => (
                <button
                  key={view}
                  onClick={() => {
                    setGraphView(view)
                    if (view !== 'dag') {
                      setShowQuarterHour(false)
                    }
                  }}
                  className={`px-2.5 md:px-3 py-2.5 md:py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-1 md:flex-none md:flex-shrink-0 ${
                    graphView === view
                      ? 'bg-brand-teal-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Quarter Hour Toggle (only for electricity, day view) - Left on desktop */}
          {localEnergietype === 'elektriciteit' && graphView === 'dag' && (
            <div className="flex items-center justify-start gap-2 md:gap-3">
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
                    // For day view: show labels every 3 hours (00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00)
                    interval={graphView === 'dag' ? 0 : 'preserveStartEnd'}
                    tick={{ fontSize: isMobile ? 8 : 10 }}
                    tickLine={false}
                    // Custom tickFormatter to show only labels at 3-hour intervals
                    tickFormatter={(value, index) => {
                      if (graphView === 'dag') {
                        // For quarter-hourly view: show labels every 3 hours (every 12 quarters)
                        if (showQuarterHour) {
                          // Show labels at indices 0, 12, 24, 36, 48, 60, 72, 84 (every 3 hours)
                          // Skip the last data point (index 95) to avoid duplicate 00:00
                          if (index % 12 === 0) {
                            // Skip if it's the last data point and would show 00:00
                            if (index === chartData.length - 1) {
                              return ''
                            }
                            const hour = Math.floor(index / 12) * 3
                            return `${String(hour).padStart(2, '0')}:00`
                          }
                          return ''
                        }
                        
                        // For hourly view: parse the time string (e.g., "00:00", "03:00", "17:00")
                        if (typeof value === 'string' && value.includes(':')) {
                          const [hourStr, minuteStr] = value.split(':')
                          const hour = parseInt(hourStr, 10)
                          const minute = parseInt(minuteStr, 10)
                          
                          // Show labels at exactly 00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00
                          // But skip the last data point if it's already 00:00 to avoid duplicate
                          if (minute === 0 && hour % 3 === 0) {
                            // Don't show 00:00 on the last data point if it's the same as the first
                            if (hour === 0 && index === chartData.length - 1) {
                              return ''
                            }
                            return value
                          }
                        }
                        // Hide all other labels
                        return ''
                      }
                      return value
                    }}
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
