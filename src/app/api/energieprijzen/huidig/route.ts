import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentDynamicPrices } from '@/lib/dynamic-pricing/database'

/**
 * GET /api/energieprijzen/huidig
 * 
 * Returns current energy prices and today's prices
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    // Day-ahead pricing: cron job saves tomorrow's prices
    // So we need to check both today and tomorrow
    const tomorrow = new Date(today)
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    
    // Get today's prices first
    let todayData = null
    const { data: todayDataResult, error: todayError } = await supabase
      .from('dynamic_prices')
      .select('*')
      .eq('datum', todayStr)
      .single()
    
    if (todayDataResult) {
      todayData = todayDataResult
    } else {
      // If today's data doesn't exist, try tomorrow (day-ahead pricing)
      // This happens when cron job has already saved tomorrow's prices
      const { data: tomorrowDataResult } = await supabase
        .from('dynamic_prices')
        .select('*')
        .eq('datum', tomorrowStr)
        .single()
      
      if (tomorrowDataResult) {
        // Use tomorrow's data but treat it as "today" for display
        todayData = tomorrowDataResult
      }
    }
    
    // Get yesterday's prices for comparison
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    const { data: yesterdayData } = await supabase
      .from('dynamic_prices')
      .select('*')
      .eq('datum', yesterdayStr)
      .single()
    
    // Get current dynamic prices (30-day average)
    const currentPrices = await getCurrentDynamicPrices()
    
    // Calculate trends
    let elektriciteitTrend: 'up' | 'down' | 'stable' = 'stable'
    let gasTrend: 'up' | 'down' | 'stable' = 'stable'
    
    if (todayData && yesterdayData) {
      const elecDiff = todayData.elektriciteit_gemiddeld_dag - yesterdayData.elektriciteit_gemiddeld_dag
      const gasDiff = todayData.gas_gemiddeld - yesterdayData.gas_gemiddeld
      
      elektriciteitTrend = elecDiff > 0.001 ? 'up' : elecDiff < -0.001 ? 'down' : 'stable'
      gasTrend = gasDiff > 0.001 ? 'up' : gasDiff < -0.001 ? 'down' : 'stable'
    }
    
    return NextResponse.json({
      success: true,
      vandaag: todayData ? {
        datum: todayData.datum,
        elektriciteit: {
          gemiddeld: todayData.elektriciteit_gemiddeld_dag,
          dag: todayData.elektriciteit_gemiddeld_dag,
          nacht: todayData.elektriciteit_gemiddeld_nacht || todayData.elektriciteit_gemiddeld_dag * 0.8,
          min: todayData.elektriciteit_min_dag,
          max: todayData.elektriciteit_max_dag,
        },
        gas: {
          gemiddeld: todayData.gas_gemiddeld,
          min: todayData.gas_min,
          max: todayData.gas_max,
        },
        bron: todayData.bron,
      } : null,
      gisteren: yesterdayData ? {
        datum: yesterdayData.datum,
        elektriciteit_gemiddeld: yesterdayData.elektriciteit_gemiddeld_dag,
        gas_gemiddeld: yesterdayData.gas_gemiddeld,
      } : null,
      trends: {
        elektriciteit: elektriciteitTrend,
        gas: gasTrend,
      },
      gemiddelden_30_dagen: {
        elektriciteit: currentPrices.electricity,
        elektriciteit_dag: currentPrices.electricityDay,
        elektriciteit_nacht: currentPrices.electricityNight,
        gas: currentPrices.gas,
        bron: currentPrices.source,
        laatst_geupdate: currentPrices.lastUpdated.toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Error in energieprijzen/huidig:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Fout bij ophalen huidige prijzen' },
      { status: 500 }
    )
  }
}
