'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { 
  ArrowLeft,
  Lightning, 
  Flame, 
  Buildings, 
  Pencil, 
  Plus,
  CheckCircle,
  XCircle,
  Tabs
} from '@phosphor-icons/react'

interface Netbeheerder {
  id: string
  naam: string
  code: string
}

interface Aansluitwaarde {
  id: string
  code: string
  naam: string
  is_kleinverbruik: boolean
}

interface NetbeheerTarief {
  id: string
  jaar: number
  aansluitwaarde: Aansluitwaarde
  all_in_tarief_jaar: number | null
  actief: boolean
  opmerkingen: string | null
}

type ViewType = 'elektriciteit' | 'gas'

export default function NetbeheerTarievenPage() {
  const [netbeheerders, setNetbeheerders] = useState<Netbeheerder[]>([])
  const [selectedNetbeheerder, setSelectedNetbeheerder] = useState<string | null>(null)
  const [viewType, setViewType] = useState<ViewType>('elektriciteit')
  const [tarieven, setTarieven] = useState<NetbeheerTarief[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNetbeheerders()
  }, [])

  useEffect(() => {
    if (selectedNetbeheerder) {
      fetchTarieven()
    }
  }, [selectedNetbeheerder, viewType])

  async function fetchNetbeheerders() {
    const supabase = createClient()
    const { data } = await supabase
      .from('netbeheerders')
      .select('*')
      .eq('actief', true)
      .order('naam')

    if (data && data.length > 0) {
      setNetbeheerders(data)
      setSelectedNetbeheerder(data[0].id)
    }
    setLoading(false)
  }

  async function fetchTarieven() {
    if (!selectedNetbeheerder) return

    setLoading(true)
    const supabase = createClient()
    const table = viewType === 'elektriciteit' 
      ? 'netbeheer_tarieven_elektriciteit'
      : 'netbeheer_tarieven_gas'
    
    const aansluitTable = viewType === 'elektriciteit'
      ? 'aansluitwaarden_elektriciteit'
      : 'aansluitwaarden_gas'

    console.log('🔍 Fetching tarieven:', {
      table,
      aansluitTable,
      netbeheerder_id: selectedNetbeheerder,
      jaar: 2025
    })

    // First, try without join to see if data exists
    const { data: rawData, error: rawError } = await supabase
      .from(table)
      .select('*')
      .eq('netbeheerder_id', selectedNetbeheerder)
      .eq('jaar', 2025)
      .eq('actief', true)

    console.log('📊 Raw query result:', {
      count: rawData?.length || 0,
      error: rawError,
      sample: rawData?.[0]
    })

    if (rawError) {
      console.error('❌ Error fetching raw tarieven:', rawError)
      setLoading(false)
      return
    }

    if (!rawData || rawData.length === 0) {
      console.warn('⚠️ No tarieven found for this netbeheerder/year/actief combination')
      setTarieven([])
      setLoading(false)
      return
    }

    // Now fetch with join
    const { data, error } = await supabase
      .from(table)
      .select(`
        *,
        aansluitwaarde:${aansluitTable}(*)
      `)
      .eq('netbeheerder_id', selectedNetbeheerder)
      .eq('jaar', 2025)
      .eq('actief', true)
    
    console.log('📊 Query with join result:', {
      count: data?.length || 0,
      error: error,
      sample: data?.[0]
    })
    
    if (error) {
      console.error('❌ Error fetching tarieven with join:', error)
      setError(`Error: ${error.message}`)
      
      // Fallback: use raw data and fetch aansluitwaarden separately
      const aansluitwaardeIds = rawData.map((t: any) => t.aansluitwaarde_id)
      const { data: aansluitwaardenData, error: aansluitError } = await supabase
        .from(aansluitTable)
        .select('*')
        .in('id', aansluitwaardeIds)
      
      if (aansluitError) {
        console.error('❌ Error fetching aansluitwaarden:', aansluitError)
        setError(`Error fetching aansluitwaarden: ${aansluitError.message}`)
        setTarieven([])
        setLoading(false)
        return
      }
      
      const tarievenWithAansluitwaarde = rawData.map((tarief: any) => ({
        ...tarief,
        aansluitwaarde: aansluitwaardenData?.find((a: any) => a.id === tarief.aansluitwaarde_id)
      })).sort((a: any, b: any) => {
        const aVolgorde = a.aansluitwaarde?.volgorde || 0
        const bVolgorde = b.aansluitwaarde?.volgorde || 0
        return aVolgorde - bVolgorde
      })
      
      setTarieven(tarievenWithAansluitwaarde as any)
      setError(null)
      setLoading(false)
      return
    }

    if (data) {
      // Sort by volgorde if available
      const sorted = [...data].sort((a: any, b: any) => {
        const aVolgorde = a.aansluitwaarde?.volgorde || 0
        const bVolgorde = b.aansluitwaarde?.volgorde || 0
        return aVolgorde - bVolgorde
      })
      setTarieven(sorted as any)
      setError(null)
    } else {
      setTarieven([])
    }
    
    setLoading(false)
  }

  const selectedNetbeheerderData = netbeheerders.find(n => n.id === selectedNetbeheerder)

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Laden...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/tarieven"
          className="inline-flex items-center gap-2 text-brand-teal-600 hover:text-brand-teal-700 mb-4 font-medium"
        >
          <ArrowLeft size={20} weight="bold" />
          Terug naar Tarieven
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy-500 mb-2">
          Netbeheertarieven
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Beheer tarieven per netbeheerder en aansluitwaarde
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg text-sm text-red-700 font-medium">
          <div className="flex items-start gap-2">
            <XCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Fout bij ophalen tarieven</p>
              <p>{error}</p>
              <p className="mt-2 text-xs text-red-600">Controleer de browser console voor meer details.</p>
            </div>
          </div>
        </div>
      )}

      {/* Netbeheerder Selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Selecteer Netbeheerder
        </label>
        <div className="flex flex-wrap gap-2">
          {netbeheerders.map((nb) => (
            <button
              key={nb.id}
              onClick={() => setSelectedNetbeheerder(nb.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedNetbeheerder === nb.id
                  ? 'bg-brand-purple-600 text-white'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-brand-purple-300'
              }`}
            >
              {nb.naam}
            </button>
          ))}
        </div>
      </div>

      {/* Type Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewType('elektriciteit')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              viewType === 'elektriciteit'
                ? 'bg-brand-teal-500 text-white'
                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-brand-teal-300'
            }`}
          >
            <Lightning size={20} weight={viewType === 'elektriciteit' ? 'fill' : 'regular'} />
            Elektriciteit
          </button>
          <button
            onClick={() => setViewType('gas')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              viewType === 'gas'
                ? 'bg-orange-500 text-white'
                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-300'
            }`}
          >
            <Flame size={20} weight={viewType === 'gas' ? 'fill' : 'regular'} />
            Gas
          </button>
        </div>
      </div>

      {/* Tarieven List */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="p-6 border-b-2 border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-brand-navy-500 mb-1">
              {selectedNetbeheerderData?.naam} - {viewType === 'elektriciteit' ? 'Elektriciteit' : 'Gas'} (2025)
            </h2>
            <p className="text-sm text-gray-600">
              {tarieven.length} {tarieven.length === 1 ? 'tarief' : 'tarieven'} beschikbaar
            </p>
          </div>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-brand-purple-600 hover:bg-brand-purple-700 text-white font-semibold rounded-lg transition-all">
            <Plus size={20} weight="bold" />
            Nieuw Tarief
          </button>
        </div>

        {tarieven.length === 0 ? (
          <div className="p-12 text-center">
            <Buildings size={48} weight="duotone" className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">
              Nog geen {viewType === 'elektriciteit' ? 'elektriciteits' : 'gas'}tarieven voor {selectedNetbeheerderData?.naam}
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-brand-purple-600 hover:bg-brand-purple-700 text-white font-semibold rounded-lg transition-all">
              <Plus size={20} weight="bold" />
              Eerste Tarief Toevoegen
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Aansluiting</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Type</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Tarief (jaar)</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Opmerkingen</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Acties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tarieven.map((tarief) => (
                    <tr key={tarief.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-brand-navy-500">{tarief.aansluitwaarde.code}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                          tarief.aansluitwaarde.is_kleinverbruik
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}>
                          {tarief.aansluitwaarde.is_kleinverbruik ? 'Kleinverbruik' : 'Grootverbruik'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {tarief.all_in_tarief_jaar ? (
                          <span className="font-bold text-brand-navy-500">
                            €{tarief.all_in_tarief_jaar.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Niet ingevuld</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {tarief.actief ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                            <CheckCircle size={14} weight="fill" />
                            Actief
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            <XCircle size={14} weight="fill" />
                            Inactief
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 line-clamp-1">
                          {tarief.opmerkingen || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Bewerken"
                          >
                            <Pencil size={20} className="text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden divide-y divide-gray-200">
              {tarieven.map((tarief) => (
                <div key={tarief.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-brand-navy-500 mb-1">
                        {tarief.aansluitwaarde.code}
                      </h3>
                      <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                        tarief.aansluitwaarde.is_kleinverbruik
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-purple-50 text-purple-700'
                      }`}>
                        {tarief.aansluitwaarde.is_kleinverbruik ? 'Kleinverbruik' : 'Grootverbruik'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {tarief.actief ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                          <CheckCircle size={14} weight="fill" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          <XCircle size={14} weight="fill" />
                        </span>
                      )}
                      <button
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Bewerken"
                      >
                        <Pencil size={20} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">Tarief per jaar</span>
                      {tarief.all_in_tarief_jaar ? (
                        <p className="font-bold text-brand-navy-500 text-lg">
                          €{tarief.all_in_tarief_jaar.toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-gray-400 italic">Niet ingevuld</p>
                      )}
                    </div>
                    {tarief.opmerkingen && (
                      <div>
                        <span className="text-xs text-gray-500">Opmerkingen</span>
                        <p className="text-sm text-gray-600">{tarief.opmerkingen}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}

