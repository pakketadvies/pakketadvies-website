/**
 * Dynamic Pricing Database Queries
 * 
 * Helper functions to read/write dynamic energy prices
 * from/to Supabase database with intelligent caching
 */

import { createClient } from '@/lib/supabase/server'
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
 * Get current dynamic prices with intelligent caching
 * 
 * Strategy:
 * 1. Try to get from database (fastest)
 * 2. Check if data is fresh (< 24 hours old)
 * 3. If stale, fetch from API and update database
 * 4. Return prices
 */
export async function getCurrentDynamicPrices(): Promise<{
  electricity: number
  electricityDay: number
  electricityNight: number
  gas: number
  source: string
  lastUpdated: Date
  isFresh: boolean
}> {
  const supabase = await createClient()

  // Get most recent price record
  const { data, error } = await supabase
    .from('dynamic_prices')
    .select('*')
    .order('datum', { ascending: false })
    .limit(1)
    .single()

  // Check if we have data and if it's fresh
  const now = new Date()
  const isFresh = data && 
    (now.getTime() - new Date(data.laatst_geupdate).getTime() < 24 * 60 * 60 * 1000) &&
    data.datum >= now.toISOString().split('T')[0]

  if (isFresh && data) {
    console.log('✅ Using cached dynamic prices from database', {
      date: data.datum,
      source: data.bron,
      age: Math.round((now.getTime() - new Date(data.laatst_geupdate).getTime()) / (60 * 1000)) + ' minutes'
    })

    return {
      electricity: data.elektriciteit_gemiddeld_dag,
      electricityDay: data.elektriciteit_gemiddeld_dag,
      electricityNight: data.elektriciteit_gemiddeld_nacht || data.elektriciteit_gemiddeld_dag * 0.8,
      gas: data.gas_gemiddeld,
      source: data.bron,
      lastUpdated: new Date(data.laatst_geupdate),
      isFresh: true,
    }
  }

  // Data is stale or missing, fetch fresh data
  console.warn('⚠️ Cached prices stale or missing, fetching fresh data...')

  try {
    const freshPrices = await fetchDayAheadPrices(now)

    // Store in database for future queries
    await saveDynamicPrices(freshPrices)

    return {
      electricity: freshPrices.electricity.average,
      electricityDay: freshPrices.electricity.day,
      electricityNight: freshPrices.electricity.night,
      gas: freshPrices.gas.average,
      source: freshPrices.source,
      lastUpdated: now,
      isFresh: true,
    }
  } catch (error) {
    console.error('❌ Failed to fetch fresh prices, using stale data if available', error)

    // Use stale data as last resort
    if (data) {
      return {
        electricity: data.elektriciteit_gemiddeld_dag,
        electricityDay: data.elektriciteit_gemiddeld_dag,
        electricityNight: data.elektriciteit_gemiddeld_nacht || data.elektriciteit_gemiddeld_dag * 0.8,
        gas: data.gas_gemiddeld,
        source: data.bron + '_STALE',
        lastUpdated: new Date(data.laatst_geupdate),
        isFresh: false,
      }
    }

    // Ultimate fallback
    throw new Error('No dynamic prices available and API fetch failed')
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
}): Promise<void> {
  const supabase = await createClient()

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

