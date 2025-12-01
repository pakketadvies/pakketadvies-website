import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/energieprijzen/historie
 * 
 * Returns historical energy prices for a date range
 * Query params:
 * - startDate: YYYY-MM-DD (default: 30 days ago)
 * - endDate: YYYY-MM-DD (default: today)
 * - type: 'elektriciteit' | 'gas' | 'beide' (default: 'beide')
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const supabase = await createClient()
    
    // Parse date range
    const today = new Date()
    const defaultStartDate = new Date(today)
    defaultStartDate.setDate(defaultStartDate.getDate() - 30)
    
    const startDateStr = searchParams.get('startDate') || defaultStartDate.toISOString().split('T')[0]
    const endDateStr = searchParams.get('endDate') || today.toISOString().split('T')[0]
    const type = searchParams.get('type') || 'beide'
    
    // Validate dates
    const startDate = new Date(startDateStr)
    const endDate = new Date(endDateStr)
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Ongeldige datum format. Gebruik YYYY-MM-DD' },
        { status: 400 }
      )
    }
    
    if (startDate > endDate) {
      return NextResponse.json(
        { success: false, error: 'Startdatum moet voor einddatum liggen' },
        { status: 400 }
      )
    }
    
    // Fetch data from database
    // Supabase has a default limit of 1000, we need to fetch all data
    // Use pagination to get all records
    let allData: any[] = []
    let from = 0
    const pageSize = 1000
    let hasMore = true
    
    while (hasMore) {
      const { data: pageData, error: pageError } = await supabase
        .from('dynamic_prices')
        .select('*')
        .gte('datum', startDateStr)
        .lte('datum', endDateStr)
        .order('datum', { ascending: true })
        .range(from, from + pageSize - 1)
      
      if (pageError) {
        console.error('Error fetching price history:', pageError)
        return NextResponse.json(
          { success: false, error: 'Fout bij ophalen historische prijzen' },
          { status: 500 }
        )
      }
      
      if (pageData && pageData.length > 0) {
        allData = [...allData, ...pageData]
        from += pageSize
        hasMore = pageData.length === pageSize
      } else {
        hasMore = false
      }
    }
    
    const data = allData
    
    if (error) {
      console.error('Error fetching price history:', error)
      return NextResponse.json(
        { success: false, error: 'Fout bij ophalen historische prijzen' },
        { status: 500 }
      )
    }
    
    // Transform data based on type
    const transformed = (data || []).map(record => {
      const base: any = {
        datum: record.datum,
        bron: record.bron,
      }
      
      if (type === 'elektriciteit' || type === 'beide') {
        base.elektriciteit_gemiddeld = record.elektriciteit_gemiddeld_dag
        base.elektriciteit_dag = record.elektriciteit_gemiddeld_dag
        base.elektriciteit_nacht = record.elektriciteit_gemiddeld_nacht || record.elektriciteit_gemiddeld_dag * 0.8
        base.elektriciteit_min = record.elektriciteit_min_dag
        base.elektriciteit_max = record.elektriciteit_max_dag
      }
      
      if (type === 'gas' || type === 'beide') {
        base.gas_gemiddeld = record.gas_gemiddeld
        base.gas_min = record.gas_min
        base.gas_max = record.gas_max
      }
      
      return base
    })
    
    return NextResponse.json({
      success: true,
      data: transformed,
      count: transformed.length,
      startDate: startDateStr,
      endDate: endDateStr,
      type,
    })
  } catch (error: any) {
    console.error('Error in energieprijzen/historie:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Fout bij ophalen historische prijzen' },
      { status: 500 }
    )
  }
}

