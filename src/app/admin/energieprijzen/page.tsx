'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Lightning, Flame, Download, CheckCircle, XCircle, Clock, Calendar } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'

export default function EnergieprijzenAdminPage() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)

  // Fetch current stats
  const fetchStats = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('dynamic_prices')
      .select('datum, bron')
      .order('datum', { ascending: false })
      .limit(1)

    if (data && data.length > 0) {
      const latest = data[0]
      const { count: totalCount } = await supabase
        .from('dynamic_prices')
        .select('*', { count: 'exact', head: true })

      const { count: energyzeroCount } = await supabase
        .from('dynamic_prices')
        .select('*', { count: 'exact', head: true })
        .eq('bron', 'ENERGYZERO')

      const { count: fallbackCount } = await supabase
        .from('dynamic_prices')
        .select('*', { count: 'exact', head: true })
        .eq('bron', 'FALLBACK')

      setStats({
        total: totalCount || 0,
        energyzero: energyzeroCount || 0,
        fallback: fallbackCount || 0,
        latestDate: latest.datum,
        latestSource: latest.bron,
      })
    }
  }

  // Load historical prices
  const loadHistoricalPrices = async (years: number = 5, force: boolean = false) => {
    setLoading(true)
    setError(null)
    setProgress(null)

    try {
      const today = new Date()
      const startDate = new Date(today)
      startDate.setFullYear(startDate.getFullYear() - years)

      const response = await fetch('/api/energieprijzen/load-historical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: startDate.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
          force,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to load historical prices')
      }

      setProgress(data)
      await fetchStats() // Refresh stats
    } catch (err: any) {
      console.error('Error loading historical prices:', err)
      setError(err.message || 'Er is een fout opgetreden bij het laden van historische prijzen')
    } finally {
      setLoading(false)
    }
  }

  // Fix fallback prices
  const fixFallbackPrices = async () => {
    setLoading(true)
    setError(null)

    try {
      // First, find all fallback dates
      const supabase = createClient()
      const { data: fallbackData } = await supabase
        .from('dynamic_prices')
        .select('datum')
        .eq('bron', 'FALLBACK')
        .order('datum', { ascending: false })
        .limit(100) // Limit to 100 at a time

      if (!fallbackData || fallbackData.length === 0) {
        setError('Geen FALLBACK prijzen gevonden om te fixen')
        setLoading(false)
        return
      }

      const dates = fallbackData.map((r) => r.datum)

      const response = await fetch('/api/energieprijzen/fix-fallback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dates }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fix fallback prices')
      }

      setProgress(data)
      await fetchStats() // Refresh stats
    } catch (err: any) {
      console.error('Error fixing fallback prices:', err)
      setError(err.message || 'Er is een fout opgetreden bij het fixen van fallback prijzen')
    } finally {
      setLoading(false)
    }
  }

  // Load stats on mount
  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy-500 mb-2">
          Energieprijzen Beheer
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Beheer historische energieprijzen voor de energieprijzen pagina en calculators
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Totaal Records</p>
                  <p className="text-2xl font-bold text-brand-navy-500">{stats.total.toLocaleString()}</p>
                </div>
                <Calendar className="w-8 h-8 text-brand-teal-500" weight="duotone" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">EnergyZero</p>
                  <p className="text-2xl font-bold text-green-600">{stats.energyzero.toLocaleString()}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" weight="duotone" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Fallback</p>
                  <p className="text-2xl font-bold text-red-600">{stats.fallback.toLocaleString()}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" weight="duotone" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Laatste Update</p>
                  <p className="text-sm font-semibold text-brand-navy-500">
                    {new Date(stats.latestDate).toLocaleDateString('nl-NL')}
                  </p>
                  <p className="text-xs text-gray-500">{stats.latestSource}</p>
                </div>
                <Clock className="w-8 h-8 text-brand-teal-500" weight="duotone" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Load Historical Prices */}
        <Card>
          <CardContent className="pt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-teal-400 to-brand-teal-500 rounded-xl flex items-center justify-center">
                <Download className="w-6 h-6 text-white" weight="duotone" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-navy-500">Laad Historische Prijzen</h3>
                <p className="text-sm text-gray-600">Laad alle prijzen van de afgelopen 5 jaar</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-2">
                  Dit proces laadt alle energieprijzen van de afgelopen 5 jaar in. Dit kan enkele minuten duren.
                </p>
                <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                  <li>Ophaalt prijzen van EnergyZero API</li>
                  <li>Slaat op in Supabase database</li>
                  <li>Slaat bestaande data over (tenzij geforceerd)</li>
                  <li>Verwerkt in batches om rate limiting te voorkomen</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => loadHistoricalPrices(5, false)}
                  disabled={loading}
                  className="flex-1"
                  variant="primary"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Laden...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Laad 5 Jaar
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => loadHistoricalPrices(5, true)}
                  disabled={loading}
                  variant="outline"
                  title="Force reload alle data (overschrijft bestaande)"
                >
                  Force
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fix Fallback Prices */}
        <Card>
          <CardContent className="pt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-navy-400 to-brand-navy-500 rounded-xl flex items-center justify-center">
                <Lightning className="w-6 h-6 text-white" weight="duotone" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-navy-500">Fix Fallback Prijzen</h3>
                <p className="text-sm text-gray-600">Vervang fallback prijzen met echte data</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 mb-2">
                  Vervangt alle FALLBACK prijzen met echte prijzen van EnergyZero API.
                </p>
                <p className="text-xs text-yellow-700">
                  Dit proces verwerkt maximaal 100 fallback records per keer.
                </p>
              </div>

              <Button
                onClick={fixFallbackPrices}
                disabled={loading}
                className="w-full"
                variant="secondary"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-brand-navy-500 border-t-transparent rounded-full animate-spin mr-2" />
                    Verwerken...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Fix Fallback Prijzen
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress/Results */}
      {progress && (
        <Card className="mb-8">
          <CardContent className="pt-8">
            <h3 className="text-lg font-bold text-brand-navy-500 mb-4">Resultaten</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Verwerkt</p>
                <p className="text-2xl font-bold text-green-600">{progress.summary?.processed || 0}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Gefaald</p>
                <p className="text-2xl font-bold text-red-600">{progress.summary?.failed || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Overgeslagen</p>
                <p className="text-2xl font-bold text-gray-600">{progress.summary?.skipped || 0}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Totaal</p>
                <p className="text-2xl font-bold text-blue-600">{progress.summary?.total || 0}</p>
              </div>
            </div>

            {progress.dateRange && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Periode: <span className="font-semibold">{progress.dateRange.start}</span> tot{' '}
                  <span className="font-semibold">{progress.dateRange.end}</span>
                </p>
              </div>
            )}

            {progress.errors && progress.errors.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-red-600 mb-2">Fouten ({progress.errors.length}):</p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {progress.errors.slice(0, 10).map((err: any, idx: number) => (
                    <p key={idx} className="text-xs text-gray-600">
                      {err.date}: {err.error}
                    </p>
                  ))}
                  {progress.errors.length > 10 && (
                    <p className="text-xs text-gray-500">... en {progress.errors.length - 10} meer</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardContent className="pt-8">
            <div className="flex items-center gap-3 text-red-600">
              <XCircle className="w-5 h-5" weight="duotone" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-8">
          <h4 className="font-semibold text-brand-navy-500 mb-2">ℹ️ Belangrijke informatie</h4>
          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
            <li>
              Historische prijzen worden gebruikt op de <strong>kennisbank/energieprijzen</strong> pagina
            </li>
            <li>
              Prijzen worden gebruikt in de <strong>calculator</strong> voor dynamische contract berekeningen
            </li>
            <li>
              Het laden van 5 jaar historische data kan <strong>10-15 minuten</strong> duren
            </li>
            <li>
              Het proces verwerkt data in batches om rate limiting te voorkomen
            </li>
            <li>
              Bestaande data wordt standaard overgeslagen (gebruik Force om te overschrijven)
            </li>
          </ul>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}

