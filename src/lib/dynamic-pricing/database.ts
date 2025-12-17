/**
 * Dynamic Pricing Database Queries
 * 
 * Helper functions to read/write dynamic energy prices
 * from/to Supabase database with intelligent caching
 */

import { createClient, createClientWithoutCookies, createServiceRoleClient } from '@/lib/supabase/server'
import { fetchDayAheadPrices } from './api-client'

export interface DynamicPriceRecord {
  id: string
  datum: string
  elektriciteit_gemiddeld_dag: number
  elektriciteit_gemiddeld_nacht: number | null
  elektriciteit_min_dag: number | null
  elektriciteit_max_dag: number | null
  gas_gemiddeld: number
  gas_min: number | null
  gas_max: number | null
  bron: string
  laatst_geupdate: string
  is_voorspelling: boolean
}

/**
 * Calculate 30-day rolling average for electricity prices
 * Used for stable, predictable pricing instead of daily fluctuations
 */
async function get30DayAverageElectricityPrices(supabase?: any): Promise<{
  day: number
  night: number
  single: number
  source: string
  daysUsed: number
}> {
  if (!supabase) {
    supabase = createClientWithoutCookies()
  }
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Get last 30 days of price records
  const { data, error } = await supabase
    .from('dynamic_prices')
    .select('elektriciteit_gemiddeld_dag, elektriciteit_gemiddeld_nacht, bron')
    .gte('datum', thirtyDaysAgo.toISOString().split('T')[0])
    .lte('datum', now.toISOString().split('T')[0])
    .order('datum', { ascending: true })

  if (error || !data || data.length === 0) {
    console.warn('⚠️ No 30-day price history available, using most recent price')
    
    // Fallback to most recent price
    const { data: recentData } = await supabase
      .from('dynamic_prices')
      .select('elektriciteit_gemiddeld_dag, elektriciteit_gemiddeld_nacht, bron')
      .order('datum', { ascending: false })
      .limit(1)
      .single()

    if (recentData) {
      const dayPrice = recentData.elektriciteit_gemiddeld_dag
      const nightPrice = recentData.elektriciteit_gemiddeld_nacht || dayPrice * 0.8
      const singlePrice = (dayPrice + nightPrice) / 2

      return {
        day: dayPrice,
        night: nightPrice,
        single: singlePrice,
        source: recentData.bron,
        daysUsed: 1,
      }
    }

    // Ultimate fallback
    throw new Error('No electricity price data available')
  }

  // Calculate averages over 30 days
  const validDays = data.filter((d: { elektriciteit_gemiddeld_dag: number | null }) => d.elektriciteit_gemiddeld_dag != null)
  
  if (validDays.length === 0) {
    throw new Error('No valid electricity price data in 30-day period')
  }

  const avgDay = validDays.reduce((sum: number, d: { elektriciteit_gemiddeld_dag: number }) => sum + d.elektriciteit_gemiddeld_dag, 0) / validDays.length
  
  // For night: use provided night prices or estimate from day prices
  const nightPrices = validDays
    .filter((d: { elektriciteit_gemiddeld_nacht: number | null }) => d.elektriciteit_gemiddeld_nacht != null)
    .map((d: { elektriciteit_gemiddeld_nacht: number }) => d.elektriciteit_gemiddeld_nacht)
  const avgNight = nightPrices.length > 0
    ? nightPrices.reduce((sum: number, price: number) => sum + price, 0) / nightPrices.length
    : avgDay * 0.8 // Estimate: night ~20% cheaper

  // Single tariff = average of day and night
  const avgSingle = (avgDay + avgNight) / 2

  // Determine source (most common in dataset)
  const sourceCounts: Record<string, number> = {}
  validDays.forEach((d: { bron: string }) => {
    sourceCounts[d.bron] = (sourceCounts[d.bron] || 0) + 1
  })
  const mostCommonSource = Object.entries(sourceCounts).reduce((a, b) => 
    sourceCounts[a[0]] > sourceCounts[b[0]] ? a : b
  )[0]

  console.log(`✅ Calculated 30-day average electricity prices`, {
    daysUsed: validDays.length,
    avgDay: avgDay.toFixed(5),
    avgNight: avgNight.toFixed(5),
    avgSingle: avgSingle.toFixed(5),
    source: mostCommonSource,
  })

  return {
    day: avgDay,
    night: avgNight,
    single: avgSingle,
    source: mostCommonSource,
    daysUsed: validDays.length,
  }
}

/**
 * Calculate 30-day rolling average for gas prices
 * Used for stable, predictable pricing instead of daily fluctuations
 */
async function get30DayAverageGasPrice(supabase?: any): Promise<{
  gas: number
  source: string
  daysUsed: number
}> {
  if (!supabase) {
    supabase = createClientWithoutCookies()
  }
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Get last 30 days of price records
  const { data, error } = await supabase
    .from('dynamic_prices')
    .select('gas_gemiddeld, bron')
    .gte('datum', thirtyDaysAgo.toISOString().split('T')[0])
    .lte('datum', now.toISOString().split('T')[0])
    .order('datum', { ascending: true })

  if (error || !data || data.length === 0) {
    console.warn('⚠️ No 30-day gas price history available, using most recent price')
    
    // Fallback to most recent price
    const { data: recentData } = await supabase
      .from('dynamic_prices')
      .select('gas_gemiddeld, bron')
      .order('datum', { ascending: false })
      .limit(1)
      .single()

    if (recentData) {
      return {
        gas: recentData.gas_gemiddeld,
        source: recentData.bron,
        daysUsed: 1,
      }
    }

    // Ultimate fallback
    throw new Error('No gas price data available')
  }

  // Calculate average over 30 days
  const validDays = data.filter((d: { gas_gemiddeld: number | null }) => d.gas_gemiddeld != null)
  
  if (validDays.length === 0) {
    throw new Error('No valid gas price data in 30-day period')
  }

  const avgGas = validDays.reduce((sum: number, d: { gas_gemiddeld: number }) => sum + d.gas_gemiddeld, 0) / validDays.length

  // Determine source (most common in dataset)
  const sourceCounts: Record<string, number> = {}
  validDays.forEach((d: { bron: string }) => {
    sourceCounts[d.bron] = (sourceCounts[d.bron] || 0) + 1
  })
  const mostCommonSource = Object.entries(sourceCounts).reduce((a, b) => 
    sourceCounts[a[0]] > sourceCounts[b[0]] ? a : b
  )[0]

  console.log(`✅ Calculated 30-day average gas price`, {
    daysUsed: validDays.length,
    avgGas: avgGas.toFixed(5),
    source: mostCommonSource,
  })

  return {
    gas: avgGas,
    source: mostCommonSource,
    daysUsed: validDays.length,
  }
}

/**
 * Get current dynamic prices with intelligent caching
 * 
 * Strategy:
 * - Electricity: 30-day rolling average for stable pricing
 * - Gas: 30-day rolling average for stable pricing
 * 
 * 1. Try to get from database (fastest)
 * 2. Check if data is fresh (< 24 hours old)
 * 3. If stale, fetch from API and update database
 * 4. Return prices
 */
export async function getCurrentDynamicPrices(supabaseClient?: any): Promise<{
  electricity: number
  electricityDay: number
  electricityNight: number
  gas: number
  source: string
  lastUpdated: Date
  isFresh: boolean
}> {
  // Use provided client or create one without cookies (for use in cached functions)
  const supabase = supabaseClient || createClientWithoutCookies()
  const now = new Date()

  // Get most recent price record (for freshness check)
  const { data: recentData, error: recentError } = await supabase
    .from('dynamic_prices')
    .select('*')
    .order('datum', { ascending: false })
    .limit(1)
    .single()

  // Get 30-day average for electricity
  let electricity30Day: { day: number; night: number; single: number; source: string; daysUsed: number }
  
  try {
    electricity30Day = await get30DayAverageElectricityPrices(supabase)
  } catch (error) {
    console.error('❌ Failed to calculate 30-day electricity average, fetching fresh data...', error)
    
    // Fallback: fetch fresh data and use it
    try {
      const freshPrices = await fetchDayAheadPrices(now)
      // Use service role for INSERT/UPDATE (required by RLS)
      await saveDynamicPrices(freshPrices, createServiceRoleClient())
      
        electricity30Day = {
          day: freshPrices.electricity.day,
          night: freshPrices.electricity.night,
          single: freshPrices.electricity.average,
          source: freshPrices.source,
          daysUsed: 1,
        }
      } catch (fetchError) {
        console.error('❌ Failed to fetch fresh electricity prices', fetchError)
        
        // Use recentData if available (but keep original source, not FALLBACK)
        if (recentData) {
          electricity30Day = {
            day: recentData.elektriciteit_gemiddeld_dag,
            night: recentData.elektriciteit_gemiddeld_nacht || recentData.elektriciteit_gemiddeld_dag * 0.8,
            single: (recentData.elektriciteit_gemiddeld_dag + (recentData.elektriciteit_gemiddeld_nacht || recentData.elektriciteit_gemiddeld_dag * 0.8)) / 2,
            source: recentData.bron,
            daysUsed: 1,
          }
        } else {
          throw new Error('No electricity price data available')
        }
      }
  }

  // Get 30-day average for gas
  let gas30Day: { gas: number; source: string; daysUsed: number }
  
  try {
    gas30Day = await get30DayAverageGasPrice(supabase)
  } catch (error) {
    console.error('❌ Failed to calculate 30-day gas average, fetching fresh data...', error)
    
    // Fallback: fetch fresh data and use it
    try {
      const freshPrices = await fetchDayAheadPrices(now)
      // Use service role for INSERT/UPDATE (required by RLS)
      await saveDynamicPrices(freshPrices, createServiceRoleClient())
      
        gas30Day = {
          gas: freshPrices.gas.average,
          source: freshPrices.source,
          daysUsed: 1,
        }
      } catch (fetchError) {
        console.error('❌ Failed to fetch fresh gas prices', fetchError)
        
        // Use recentData if available (but keep original source, not FALLBACK)
        if (recentData) {
          gas30Day = {
            gas: recentData.gas_gemiddeld,
            source: recentData.bron,
            daysUsed: 1,
          }
        } else {
          throw new Error('No gas price data available')
        }
      }
  }

  // Check if we have fresh data (for isFresh flag)
  const isFresh = recentData && 
    (now.getTime() - new Date(recentData.laatst_geupdate).getTime() < 24 * 60 * 60 * 1000) &&
    recentData.datum >= now.toISOString().split('T')[0]

  // Use the most recent update time for lastUpdated
  const lastUpdated = recentData 
    ? new Date(recentData.laatst_geupdate)
    : now

  // Combine sources
  const combinedSource = `${electricity30Day.source}_30D+${gas30Day.source}_30D`

  return {
    electricity: electricity30Day.single, // Single tariff average for backward compatibility
    electricityDay: electricity30Day.day,
    electricityNight: electricity30Day.night,
    gas: gas30Day.gas,
    source: combinedSource,
    lastUpdated: lastUpdated,
    isFresh: isFresh || false,
  }
}

/**
 * Save dynamic prices to database
 * Uses upsert to avoid duplicates
 */
export async function saveDynamicPrices(prices: {
  electricity: { average: number; day: number; night: number; min: number; max: number }
  gas: { average: number; min: number; max: number }
  source: string
  date: string
}, supabaseClient?: any): Promise<void> {
  // IMPORTANT: Use service role client for INSERT/UPDATE operations
  // If no client provided, use service role (required for RLS)
  const supabase = supabaseClient || createServiceRoleClient()

  const { error } = await supabase
    .from('dynamic_prices')
    .upsert({
      datum: prices.date,
      elektriciteit_gemiddeld_dag: prices.electricity.day,
      elektriciteit_gemiddeld_nacht: prices.electricity.night,
      elektriciteit_min_dag: prices.electricity.min,
      elektriciteit_max_dag: prices.electricity.max,
      gas_gemiddeld: prices.gas.average,
      gas_min: prices.gas.min,
      gas_max: prices.gas.max,
      bron: prices.source,
      laatst_geupdate: new Date().toISOString(),
      is_voorspelling: false,
    }, {
      onConflict: 'datum'
    })

  if (error) {
    console.error('Failed to save dynamic prices to database:', error)
    throw error
  }

  console.log('✅ Dynamic prices saved to database', {
    date: prices.date,
    source: prices.source
  })
}

/**
 * Get price history (last N days)
 * Useful for charts and trend analysis
 */
export async function getPriceHistory(days: number = 30): Promise<DynamicPriceRecord[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('dynamic_prices')
    .select('*')
    .order('datum', { ascending: false })
    .limit(days)

  if (error) {
    console.error('Failed to fetch price history:', error)
    return []
  }

  return data || []
}

/**
 * Get price for specific date
 */
export async function getPriceForDate(date: Date): Promise<DynamicPriceRecord | null> {
  const supabase = await createClient()
  const dateStr = date.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('dynamic_prices')
    .select('*')
    .eq('datum', dateStr)
    .single()

  if (error) {
    console.warn(`No price data found for ${dateStr}`)
    return null
  }

  return data
}

/**
 * Calculate average price over period
 */
export async function getAveragePriceOverPeriod(
  startDate: Date,
  endDate: Date
): Promise<{ electricity: number; gas: number } | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('dynamic_prices')
    .select('elektriciteit_gemiddeld_dag, gas_gemiddeld')
    .gte('datum', startDate.toISOString().split('T')[0])
    .lte('datum', endDate.toISOString().split('T')[0])

  if (error || !data || data.length === 0) {
    return null
  }

  const avgElectricity = data.reduce((sum, d) => sum + d.elektriciteit_gemiddeld_dag, 0) / data.length
  const avgGas = data.reduce((sum, d) => sum + d.gas_gemiddeld, 0) / data.length

  return {
    electricity: avgElectricity,
    gas: avgGas,
  }
}

