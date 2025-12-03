'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { 
  Lightning, 
  Flame, 
  Buildings, 
  Pencil, 
  Plus,
  CheckCircle,
  XCircle,
  CurrencyEur,
  Percent
} from '@phosphor-icons/react'

interface OverheidsTarief {
  id: string
  jaar: number
  // Energiebelasting elektriciteit
  eb_elektriciteit_gv_schijf1_max: number
  eb_elektriciteit_gv_schijf1: number
  eb_elektriciteit_gv_schijf2_max: number
  eb_elektriciteit_gv_schijf2: number
  eb_elektriciteit_gv_schijf3_max: number
  eb_elektriciteit_gv_schijf3: number
  eb_elektriciteit_gv_schijf4: number
  // Energiebelasting gas
  eb_gas_schijf1_max: number
  eb_gas_schijf1: number
  eb_gas_schijf2: number
  // ODE
  ode_elektriciteit: number
  ode_gas: number
  // BTW en vermindering
  btw_percentage: number
  vermindering_eb_elektriciteit: number
  // Status
  actief: boolean
  ingangsdatum: string
  einddatum: string | null
}

interface NetbeheerTariefCount {
  netbeheerder: string
  elektriciteit_count: number
  gas_count: number
}

interface ModelTarief {
  id: string
  leverancier_naam: string
  tarief_elektriciteit_normaal: number
  tarief_elektriciteit_dal: number
  tarief_elektriciteit_enkel: number
  tarief_gas: number
  vastrecht_stroom_maand: number
  vastrecht_gas_maand: number
  ingangsdatum: string
  einddatum: string | null
  actief: boolean
  opmerkingen: string | null
}

export default function TarievenPage() {
  const [overheidsTarieven, setOverheidsTarieven] = useState<OverheidsTarief[]>([])
  const [netbeheerCounts, setNetbeheerCounts] = useState<NetbeheerTariefCount[]>([])
  const [modelTarief, setModelTarief] = useState<ModelTarief | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingModelTarief, setEditingModelTarief] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const supabase = await createClient()

    // Haal overheidstarieven op
    const { data: overheidData } = await supabase
      .from('tarieven_overheid')
      .select('*')
      .order('jaar', { ascending: false })

    if (overheidData) {
      setOverheidsTarieven(overheidData)
    }

    // Haal netbeheer statistieken op
    const { data: netbeheerders } = await supabase
      .from('netbeheerders')
      .select('id, naam, code')
      .eq('actief', true)

    if (netbeheerders) {
      const counts = await Promise.all(
        netbeheerders.map(async (nb) => {
          const [elektriciteit, gas] = await Promise.all([
            supabase
              .from('netbeheer_tarieven_elektriciteit')
              .select('id', { count: 'exact', head: true })
              .eq('netbeheerder_id', nb.id)
              .eq('jaar', 2025)
              .eq('actief', true),
            supabase
              .from('netbeheer_tarieven_gas')
              .select('id', { count: 'exact', head: true })
              .eq('netbeheerder_id', nb.id)
              .eq('jaar', 2025)
              .eq('actief', true),
          ])

          return {
            netbeheerder: nb.naam,
            elektriciteit_count: elektriciteit.count || 0,
            gas_count: gas.count || 0,
          }
        })
      )
      setNetbeheerCounts(counts)
    }

    // Haal modeltarieven op
    const { data: modelData } = await supabase
      .from('model_tarieven')
      .select('*')
      .eq('actief', true)
      .single()

    if (modelData) {
      setModelTarief(modelData)
    }

    setLoading(false)
  }

  async function saveModelTarief(formData: FormData) {
    setSaving(true)
    try {
      const response = await fetch('/api/model-tarieven/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tarief_elektriciteit_normaal: parseFloat(formData.get('tarief_elektriciteit_normaal') as string),
          tarief_elektriciteit_dal: parseFloat(formData.get('tarief_elektriciteit_dal') as string),
          tarief_elektriciteit_enkel: parseFloat(formData.get('tarief_elektriciteit_enkel') as string),
          tarief_gas: parseFloat(formData.get('tarief_gas') as string),
          vastrecht_stroom_maand: parseFloat(formData.get('vastrecht_stroom_maand') as string),
          vastrecht_gas_maand: parseFloat(formData.get('vastrecht_gas_maand') as string),
          opmerkingen: formData.get('opmerkingen') as string || null,
        }),
      })

      const data = await response.json()
      if (data.success) {
        // Refresh data from database to ensure we have the latest values
        await fetchData()
        setEditingModelTarief(false)
        alert('Modeltarieven succesvol opgeslagen!')
      } else {
        alert('Fout bij opslaan: ' + data.error)
      }
    } catch (error: any) {
      alert('Fout bij opslaan: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal-600 mx-auto mb-4"></div>
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
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy-500 mb-2">
          Tarieven Beheer
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Beheer overheidstarieven en netbeheertarieven voor nauwkeurige berekeningen
        </p>
      </div>

      {/* Overheidstarieven Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-brand-navy-500 mb-1 flex items-center gap-2">
              <CurrencyEur size={24} weight="duotone" className="text-brand-teal-600" />
              Overheidstarieven
            </h2>
            <p className="text-sm text-gray-600">
              Energiebelasting, BTW en vermindering per jaar
            </p>
          </div>
          <button
            disabled
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed opacity-50"
            title="Binnenkort beschikbaar"
          >
            <Plus size={20} weight="bold" />
            Nieuw Jaar (binnenkort)
          </button>
        </div>

        {overheidsTarieven.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-8 text-center">
            <CurrencyEur size={48} weight="duotone" className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Nog geen overheidstarieven ingevoerd</p>
            <button
              disabled
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed opacity-50"
              title="Binnenkort beschikbaar"
            >
              <Plus size={20} weight="bold" />
              Eerste Jaar Toevoegen (binnenkort)
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Jaar</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">EB Stroom</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">EB Gas</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">BTW</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Vermindering EB</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Acties</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {overheidsTarieven.map((tarief) => (
                      <tr key={tarief.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-brand-navy-500 text-lg">{tarief.jaar}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs space-y-1">
                            <div>0-{(tarief.eb_elektriciteit_gv_schijf1_max / 1000).toFixed(0)}k: <span className="font-semibold">€{tarief.eb_elektriciteit_gv_schijf1.toFixed(5)}</span></div>
                            <div>{((tarief.eb_elektriciteit_gv_schijf1_max + 1) / 1000).toFixed(0)}-{(tarief.eb_elektriciteit_gv_schijf2_max / 1000).toFixed(0)}k: <span className="font-semibold">€{tarief.eb_elektriciteit_gv_schijf2.toFixed(5)}</span></div>
                            <div>{((tarief.eb_elektriciteit_gv_schijf2_max + 1) / 1000).toFixed(0)}-{(tarief.eb_elektriciteit_gv_schijf3_max / 1000000).toFixed(0)}M: <span className="font-semibold">€{tarief.eb_elektriciteit_gv_schijf3.toFixed(5)}</span></div>
                            <div>&gt;{(tarief.eb_elektriciteit_gv_schijf3_max / 1000000).toFixed(0)}M: <span className="font-semibold">€{tarief.eb_elektriciteit_gv_schijf4.toFixed(5)}</span></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs space-y-1">
                            <div>0-{(tarief.eb_gas_schijf1_max / 1000).toFixed(0)}k: <span className="font-semibold">€{tarief.eb_gas_schijf1.toFixed(5)}</span></div>
                            <div>&gt;{(tarief.eb_gas_schijf1_max / 1000).toFixed(0)}k: <span className="font-semibold">€{tarief.eb_gas_schijf2.toFixed(5)}</span></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-700">{tarief.btw_percentage}%</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-700">€{tarief.vermindering_eb_elektriciteit.toFixed(2)}</span>
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
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/tarieven/overheid/${tarief.id}`}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Bewerken"
                            >
                              <Pencil size={20} className="text-gray-600" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden grid grid-cols-1 gap-4">
              {overheidsTarieven.map((tarief) => (
                <div key={tarief.id} className="bg-white rounded-xl border-2 border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-brand-navy-500">{tarief.jaar}</span>
                    <div className="flex items-center gap-2">
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
                      <Link
                        href={`/admin/tarieven/overheid/${tarief.id}`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Bewerken"
                      >
                        <Pencil size={20} className="text-gray-600" />
                      </Link>
                    </div>
                  </div>
                  
                  {/* Energiebelasting Stroom */}
                  <div className="mb-3">
                    <span className="text-gray-500 text-xs font-semibold mb-1 block">Energiebelasting Stroom</span>
                    <div className="text-xs space-y-0.5 text-gray-700">
                      <div>0-{(tarief.eb_elektriciteit_gv_schijf1_max / 1000).toFixed(0)}k kWh: <span className="font-semibold">€{tarief.eb_elektriciteit_gv_schijf1.toFixed(5)}/kWh</span></div>
                      <div>{((tarief.eb_elektriciteit_gv_schijf1_max + 1) / 1000).toFixed(0)}-{(tarief.eb_elektriciteit_gv_schijf2_max / 1000).toFixed(0)}k kWh: <span className="font-semibold">€{tarief.eb_elektriciteit_gv_schijf2.toFixed(5)}/kWh</span></div>
                      <div>{((tarief.eb_elektriciteit_gv_schijf2_max + 1) / 1000).toFixed(0)}k-{(tarief.eb_elektriciteit_gv_schijf3_max / 1000000).toFixed(0)}M kWh: <span className="font-semibold">€{tarief.eb_elektriciteit_gv_schijf3.toFixed(5)}/kWh</span></div>
                      <div>&gt;{(tarief.eb_elektriciteit_gv_schijf3_max / 1000000).toFixed(0)}M kWh: <span className="font-semibold">€{tarief.eb_elektriciteit_gv_schijf4.toFixed(5)}/kWh</span></div>
                    </div>
                  </div>
                  
                  {/* Energiebelasting Gas */}
                  <div className="mb-3">
                    <span className="text-gray-500 text-xs font-semibold mb-1 block">Energiebelasting Gas</span>
                    <div className="text-xs space-y-0.5 text-gray-700">
                      <div>0-{(tarief.eb_gas_schijf1_max / 1000).toFixed(0)}k m³: <span className="font-semibold">€{tarief.eb_gas_schijf1.toFixed(5)}/m³</span></div>
                      <div>&gt;{(tarief.eb_gas_schijf1_max / 1000).toFixed(0)}k m³: <span className="font-semibold">€{tarief.eb_gas_schijf2.toFixed(5)}/m³</span></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm pt-3 border-t border-gray-200">
                    <div>
                      <span className="text-gray-500 text-xs">BTW</span>
                      <p className="font-semibold text-gray-700">{tarief.btw_percentage}%</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Vermindering EB</span>
                      <p className="font-semibold text-gray-700">€{tarief.vermindering_eb_elektriciteit.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modeltarieven Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-brand-navy-500 mb-1 flex items-center gap-2">
              <Lightning size={24} weight="duotone" className="text-brand-teal-600" />
              Eneco Modeltarieven
            </h2>
            <p className="text-sm text-gray-600">
              Baseline tarieven voor besparingsberekening (inclusief EB en BTW)
            </p>
          </div>
          {!editingModelTarief && (
            <button
              onClick={() => setEditingModelTarief(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-semibold rounded-lg transition-all"
            >
              <Pencil size={20} weight="bold" />
              {modelTarief ? 'Bewerken' : 'Toevoegen'}
            </button>
          )}
        </div>

        {editingModelTarief ? (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <form action={saveModelTarief} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Elektriciteit tarieven */}
                <div className="space-y-4">
                  <h3 className="font-bold text-brand-navy-500 mb-4">Elektriciteit (€/kWh)</h3>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Normaal tarief *
                    </label>
                    <input
                      type="number"
                      name="tarief_elektriciteit_normaal"
                      step="0.00001"
                      defaultValue={modelTarief?.tarief_elektriciteit_normaal || 0.30112}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Dal tarief *
                    </label>
                    <input
                      type="number"
                      name="tarief_elektriciteit_dal"
                      step="0.00001"
                      defaultValue={modelTarief?.tarief_elektriciteit_dal || 0.28402}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Enkeltarief *
                    </label>
                    <input
                      type="number"
                      name="tarief_elektriciteit_enkel"
                      step="0.00001"
                      defaultValue={modelTarief?.tarief_elektriciteit_enkel || 0.29284}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Gas en vastrecht */}
                <div className="space-y-4">
                  <h3 className="font-bold text-brand-navy-500 mb-4">Gas & Vastrecht</h3>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gas tarief (€/m³) *
                    </label>
                    <input
                      type="number"
                      name="tarief_gas"
                      step="0.00001"
                      defaultValue={modelTarief?.tarief_gas || 1.30055}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vastrecht stroom (€/maand) *
                    </label>
                    <input
                      type="number"
                      name="vastrecht_stroom_maand"
                      step="0.01"
                      defaultValue={modelTarief?.vastrecht_stroom_maand || 47.99}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vastrecht gas (€/maand) *
                    </label>
                    <input
                      type="number"
                      name="vastrecht_gas_maand"
                      step="0.01"
                      defaultValue={modelTarief?.vastrecht_gas_maand || 7.99}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Opmerkingen
                </label>
                <textarea
                  name="opmerkingen"
                  rows={3}
                  defaultValue={modelTarief?.opmerkingen || ''}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-teal-500 focus:outline-none"
                  placeholder="Optionele notities over deze tarieven..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Opslaan...' : 'Opslaan'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingModelTarief(false)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all"
                >
                  Annuleren
                </button>
              </div>
            </form>
          </div>
        ) : modelTarief ? (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-brand-navy-500 mb-4">Elektriciteit (€/kWh)</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Normaal tarief:</span>
                    <span className="font-semibold">€{modelTarief.tarief_elektriciteit_normaal.toFixed(5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dal tarief:</span>
                    <span className="font-semibold">€{modelTarief.tarief_elektriciteit_dal.toFixed(5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Enkeltarief:</span>
                    <span className="font-semibold">€{modelTarief.tarief_elektriciteit_enkel.toFixed(5)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-brand-navy-500 mb-4">Gas & Vastrecht</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gas tarief:</span>
                    <span className="font-semibold">€{modelTarief.tarief_gas.toFixed(5)}/m³</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vastrecht stroom:</span>
                    <span className="font-semibold">€{modelTarief.vastrecht_stroom_maand.toFixed(2)}/maand</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vastrecht gas:</span>
                    <span className="font-semibold">€{modelTarief.vastrecht_gas_maand.toFixed(2)}/maand</span>
                  </div>
                </div>
              </div>
            </div>
            {modelTarief.opmerkingen && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">{modelTarief.opmerkingen}</p>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
              Geldig van {modelTarief.ingangsdatum} {modelTarief.einddatum ? `tot ${modelTarief.einddatum}` : 'tot onbepaald'}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-8 text-center">
            <Lightning size={48} weight="duotone" className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Nog geen modeltarieven ingesteld</p>
            <button
              onClick={() => setEditingModelTarief(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-semibold rounded-lg transition-all"
            >
              <Plus size={20} weight="bold" />
              Modeltarieven Toevoegen
            </button>
          </div>
        )}
      </div>

      {/* Netbeheertarieven Section */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-brand-navy-500 mb-1 flex items-center gap-2">
              <Buildings size={24} weight="duotone" className="text-brand-purple-600" />
              Netbeheertarieven
            </h2>
            <p className="text-sm text-gray-600">
              Tarieven per netbeheerder en aansluitwaarde
            </p>
          </div>
          <Link
            href="/admin/tarieven/netbeheer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-brand-purple-600 hover:bg-brand-purple-700 text-white font-semibold rounded-lg transition-all"
          >
            <Buildings size={20} weight="bold" />
            Beheer Netbeheer
          </Link>
        </div>

        {/* Netbeheer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {netbeheerCounts.map((count) => (
            <div
              key={count.netbeheerder}
              className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-brand-purple-300 transition-all"
            >
              <h3 className="font-bold text-lg text-brand-navy-500 mb-4">{count.netbeheerder}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightning size={20} weight="duotone" className="text-brand-teal-600" />
                    <span className="text-sm text-gray-600">Elektriciteit</span>
                  </div>
                  <span className="font-bold text-brand-navy-500">{count.elektriciteit_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame size={20} weight="duotone" className="text-brand-teal-600" />
                    <span className="text-sm text-gray-600">Gas</span>
                  </div>
                  <span className="font-bold text-brand-navy-500">{count.gas_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}

