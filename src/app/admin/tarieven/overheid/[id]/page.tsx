'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { ArrowLeft, CheckCircle } from '@phosphor-icons/react'

interface OverheidsTarief {
  id: string
  jaar: number
  eb_elektriciteit_gv_schijf1_max: number
  eb_elektriciteit_gv_schijf1: number
  eb_elektriciteit_gv_schijf2_max: number
  eb_elektriciteit_gv_schijf2: number
  eb_elektriciteit_gv_schijf3_max: number
  eb_elektriciteit_gv_schijf3: number
  eb_elektriciteit_gv_schijf4: number
  eb_gas_schijf1_max: number
  eb_gas_schijf1: number
  eb_gas_schijf2: number
  btw_percentage: number
  vermindering_eb_elektriciteit: number
  actief: boolean
}

export default function BewerkenOverheidsTarievenPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [tarief, setTarief] = useState<OverheidsTarief | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTarief()
  }, [id])

  async function fetchTarief() {
    setLoading(true)
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tarieven_overheid')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      setError('Kon tarief niet laden')
    } else {
      setTarief(data)
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!tarief) return

    setSaving(true)
    setError(null)

    const supabase = await createClient()
    const { error: updateError } = await supabase
      .from('tarieven_overheid')
      .update({
        eb_elektriciteit_gv_schijf1_max: tarief.eb_elektriciteit_gv_schijf1_max,
        eb_elektriciteit_gv_schijf1: tarief.eb_elektriciteit_gv_schijf1,
        eb_elektriciteit_gv_schijf2_max: tarief.eb_elektriciteit_gv_schijf2_max,
        eb_elektriciteit_gv_schijf2: tarief.eb_elektriciteit_gv_schijf2,
        eb_elektriciteit_gv_schijf3_max: tarief.eb_elektriciteit_gv_schijf3_max,
        eb_elektriciteit_gv_schijf3: tarief.eb_elektriciteit_gv_schijf3,
        eb_elektriciteit_gv_schijf4: tarief.eb_elektriciteit_gv_schijf4,
        eb_gas_schijf1_max: tarief.eb_gas_schijf1_max,
        eb_gas_schijf1: tarief.eb_gas_schijf1,
        eb_gas_schijf2: tarief.eb_gas_schijf2,
        btw_percentage: tarief.btw_percentage,
        vermindering_eb_elektriciteit: tarief.vermindering_eb_elektriciteit,
        actief: tarief.actief,
      })
      .eq('id', id)

    if (updateError) {
      setError('Kon tarief niet opslaan: ' + updateError.message)
    } else {
      router.push('/admin/tarieven')
      router.refresh()
    }
    setSaving(false)
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

  if (!tarief) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-red-600">Tarief niet gevonden</p>
          <Link href="/admin/tarieven" className="text-brand-teal-600 hover:underline mt-4 inline-block">
            Terug naar overzicht
          </Link>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin/tarieven"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy-500">
              Overheidstarieven {tarief.jaar}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Bewerk energiebelasting, BTW en vermindering
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Energiebelasting Elektriciteit */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-brand-navy-500 mb-4">
              Energiebelasting Elektriciteit
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Tarieven per verbruiksschijf (zakelijk grootverbruik)
            </p>

            <div className="space-y-4">
              {/* Schijf 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
                    Schijf 1: 0 t/m (kWh)
                  </label>
                  <input
                    type="number"
                    value={tarief.eb_elektriciteit_gv_schijf1_max}
                    onChange={(e) => setTarief({ ...tarief, eb_elektriciteit_gv_schijf1_max: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
                    Tarief (€/kWh)
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={tarief.eb_elektriciteit_gv_schijf1}
                    onChange={(e) => setTarief({ ...tarief, eb_elektriciteit_gv_schijf1: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all font-mono"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Schijf 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
                    Schijf 2: t/m (kWh)
                  </label>
                  <input
                    type="number"
                    value={tarief.eb_elektriciteit_gv_schijf2_max}
                    onChange={(e) => setTarief({ ...tarief, eb_elektriciteit_gv_schijf2_max: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
                    Tarief (€/kWh)
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={tarief.eb_elektriciteit_gv_schijf2}
                    onChange={(e) => setTarief({ ...tarief, eb_elektriciteit_gv_schijf2: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all font-mono"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Schijf 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
                    Schijf 3: t/m (kWh)
                  </label>
                  <input
                    type="number"
                    value={tarief.eb_elektriciteit_gv_schijf3_max}
                    onChange={(e) => setTarief({ ...tarief, eb_elektriciteit_gv_schijf3_max: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
                    Tarief (€/kWh)
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={tarief.eb_elektriciteit_gv_schijf3}
                    onChange={(e) => setTarief({ ...tarief, eb_elektriciteit_gv_schijf3: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all font-mono"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Schijf 4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
                    Schijf 4: &gt; {(tarief.eb_elektriciteit_gv_schijf3_max / 1000000).toFixed(0)}M kWh
                  </label>
                  <p className="text-xs text-gray-500">Meer dan schijf 3 maximum</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
                    Tarief (€/kWh)
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={tarief.eb_elektriciteit_gv_schijf4}
                    onChange={(e) => setTarief({ ...tarief, eb_elektriciteit_gv_schijf4: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all font-mono"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Energiebelasting Gas */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-brand-navy-500 mb-4">
              Energiebelasting Gas
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Tarieven per verbruiksschijf (zakelijk)
            </p>

            <div className="space-y-4">
              {/* Schijf 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
                    Schijf 1: 0 t/m (m³)
                  </label>
                  <input
                    type="number"
                    value={tarief.eb_gas_schijf1_max}
                    onChange={(e) => setTarief({ ...tarief, eb_gas_schijf1_max: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
                    Tarief (€/m³)
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={tarief.eb_gas_schijf1}
                    onChange={(e) => setTarief({ ...tarief, eb_gas_schijf1: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all font-mono"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Schijf 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
                    Schijf 2: &gt; {(tarief.eb_gas_schijf1_max / 1000).toFixed(0)}k m³
                  </label>
                  <p className="text-xs text-gray-500">Meer dan schijf 1 maximum</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
                    Tarief (€/m³)
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={tarief.eb_gas_schijf2}
                    onChange={(e) => setTarief({ ...tarief, eb_gas_schijf2: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all font-mono"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BTW en Vermindering */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-brand-navy-500 mb-4">
              BTW en Vermindering
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
                  BTW (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={tarief.btw_percentage}
                  onChange={(e) => setTarief({ ...tarief, btw_percentage: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
                  Vermindering EB (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={tarief.vermindering_eb_elektriciteit}
                  onChange={(e) => setTarief({ ...tarief, vermindering_eb_elektriciteit: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer pt-8">
                  <input
                    type="checkbox"
                    checked={tarief.actief}
                    onChange={(e) => setTarief({ ...tarief, actief: e.target.checked })}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-2"
                    disabled={saving}
                  />
                  <span className="text-sm font-semibold text-brand-navy-500">Actief</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end sticky bottom-0 bg-white py-4 border-t-2 border-gray-200">
            <Link
              href="/admin/tarieven"
              className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
            >
              Annuleren
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Opslaan...
                </>
              ) : (
                <>
                  <CheckCircle size={20} weight="bold" />
                  Opslaan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

