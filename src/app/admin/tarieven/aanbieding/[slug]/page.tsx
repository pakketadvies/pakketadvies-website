'use client'

import { useEffect, useMemo, useState } from 'react'
import { use } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import {
  ArrowLeft,
  ArrowSquareOut,
  CheckCircle,
  FloppyDisk,
  Plus,
  Trash,
  ArrowUp,
  ArrowDown,
  CurrencyEur,
  Sparkle,
} from '@phosphor-icons/react'
import type {
  AanbiedingTariefItem,
  AanbiedingTarieven,
} from '@/lib/aanbieding-tarieven'

interface PageProps {
  params: Promise<{ slug: string }>
}

const PUBLIEKE_PADEN: Record<string, string> = {
  'clean-energy-ets2': '/aanbieding/clean-energy-ets2',
}

export default function AanbiedingTarievenAdminPage({ params }: PageProps) {
  const { slug } = use(params)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [titel, setTitel] = useState('')
  const [tariefkaart, setTariefkaart] = useState<AanbiedingTariefItem[]>([])
  const [heroBadges, setHeroBadges] = useState<AanbiedingTariefItem[]>([])
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)

  const publiekPad = useMemo(() => PUBLIEKE_PADEN[slug] ?? null, [slug])

  useEffect(() => {
    let cancelled = false
    async function fetchTarieven() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/aanbieding-tarieven/${slug}`, {
          cache: 'no-store',
        })
        const data = await response.json()
        if (!cancelled) {
          if (data?.success && data.tarieven) {
            const tarieven = data.tarieven as AanbiedingTarieven
            setTitel(tarieven.titel || slug)
            setTariefkaart(
              Array.isArray(tarieven.tariefkaart_items)
                ? tarieven.tariefkaart_items
                : []
            )
            setHeroBadges(
              Array.isArray(tarieven.hero_badges) ? tarieven.hero_badges : []
            )
            setUpdatedAt(tarieven.updated_at ?? null)
          } else if (response.status === 404) {
            setTitel(slug)
            setTariefkaart([])
            setHeroBadges([])
          } else {
            setError(data?.error || 'Kon tarieven niet laden')
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Onbekende fout')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchTarieven()
    return () => {
      cancelled = true
    }
  }, [slug])

  function updateItem(
    list: AanbiedingTariefItem[],
    setter: (next: AanbiedingTariefItem[]) => void,
    index: number,
    field: keyof AanbiedingTariefItem,
    value: string
  ) {
    const next = list.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    setter(next)
  }

  function addItem(
    list: AanbiedingTariefItem[],
    setter: (next: AanbiedingTariefItem[]) => void,
    max?: number
  ) {
    if (max && list.length >= max) return
    setter([...list, { label: '', waarde: '' }])
  }

  function removeItem(
    list: AanbiedingTariefItem[],
    setter: (next: AanbiedingTariefItem[]) => void,
    index: number
  ) {
    setter(list.filter((_, i) => i !== index))
  }

  function moveItem(
    list: AanbiedingTariefItem[],
    setter: (next: AanbiedingTariefItem[]) => void,
    index: number,
    direction: -1 | 1
  ) {
    const target = index + direction
    if (target < 0 || target >= list.length) return
    const next = [...list]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    setter(next)
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    const cleanedTariefkaart = tariefkaart
      .map((item) => ({
        label: item.label.trim(),
        waarde: item.waarde.trim(),
      }))
      .filter((item) => item.label !== '' || item.waarde !== '')

    const cleanedHeroBadges = heroBadges
      .map((item) => ({
        label: item.label.trim(),
        waarde: item.waarde.trim(),
      }))
      .filter((item) => item.label !== '' || item.waarde !== '')
      .slice(0, 3)

    if (cleanedTariefkaart.length === 0) {
      setError('Voeg minimaal één tarief toe in de tariefkaart.')
      setSaving(false)
      return
    }

    try {
      const response = await fetch(`/api/aanbieding-tarieven/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titel: titel.trim() || slug,
          tariefkaart_items: cleanedTariefkaart,
          hero_badges: cleanedHeroBadges,
        }),
      })
      const data = await response.json()

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Opslaan mislukt')
      }

      const tarieven = data.tarieven as AanbiedingTarieven
      setTitel(tarieven.titel || slug)
      setTariefkaart(
        Array.isArray(tarieven.tariefkaart_items) ? tarieven.tariefkaart_items : []
      )
      setHeroBadges(
        Array.isArray(tarieven.hero_badges) ? tarieven.hero_badges : []
      )
      setUpdatedAt(tarieven.updated_at ?? null)
      setSuccessMessage('Tarieven succesvol opgeslagen. De live pagina is direct bijgewerkt.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opslaan mislukt')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal-600 mx-auto mb-4" />
            <p className="text-gray-600">Tarieven laden...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link
          href="/admin/tarieven"
          className="inline-flex items-center gap-1 hover:text-brand-teal-600 transition-colors"
        >
          <ArrowLeft size={16} weight="bold" />
          Terug naar tarieven
        </Link>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy-500 mb-2 flex items-center gap-2">
            <Sparkle size={28} weight="duotone" className="text-brand-teal-600" />
            Aanbieding tarieven bewerken
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Pas hier de tarieven en hero badges aan van{' '}
            <span className="font-semibold text-brand-navy-500">{titel || slug}</span>.
            Wijzigingen zijn direct na opslaan zichtbaar op de live pagina.
          </p>
          {updatedAt && (
            <p className="text-xs text-gray-500 mt-1">
              Laatst bijgewerkt: {new Date(updatedAt).toLocaleString('nl-NL')}
            </p>
          )}
        </div>
        {publiekPad && (
          <a
            href={publiekPad}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-brand-teal-300 hover:bg-brand-teal-50 text-sm font-semibold text-brand-navy-500 transition-all"
          >
            Bekijk live pagina
            <ArrowSquareOut size={16} weight="bold" />
          </a>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 border-2 border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-4 rounded-lg bg-green-50 border-2 border-green-200 text-green-700 text-sm flex items-center gap-2">
          <CheckCircle weight="fill" size={18} />
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Titel */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Interne titel (alleen zichtbaar in admin)
          </label>
          <input
            type="text"
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-teal-500 focus:outline-none"
            placeholder="Bijv. Clean Energy ETS-2 (5 jaar vast gas)"
          />
        </div>

        {/* Tariefkaart */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-brand-navy-500 flex items-center gap-2">
                <CurrencyEur size={22} weight="duotone" className="text-brand-teal-600" />
                Tariefkaart
              </h2>
              <p className="text-sm text-gray-600">
                Deze regels verschijnen één-op-één in de witte kaart op de pagina, in de volgorde hieronder.
              </p>
            </div>
            <button
              type="button"
              onClick={() => addItem(tariefkaart, setTariefkaart)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-semibold text-sm transition-all"
            >
              <Plus size={16} weight="bold" />
              Regel toevoegen
            </button>
          </div>

          {tariefkaart.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg">
              Nog geen regels. Voeg er één toe om te beginnen.
            </div>
          ) : (
            <div className="space-y-3">
              {tariefkaart.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-3 items-stretch p-3 rounded-lg border border-gray-200 bg-gray-50/60"
                >
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) =>
                      updateItem(tariefkaart, setTariefkaart, index, 'label', e.target.value)
                    }
                    placeholder="Label (bijv. Elektra normaal)"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-teal-500 focus:outline-none bg-white"
                  />
                  <input
                    type="text"
                    value={item.waarde}
                    onChange={(e) =>
                      updateItem(tariefkaart, setTariefkaart, index, 'waarde', e.target.value)
                    }
                    placeholder="Waarde (bijv. € 0,120 per kWh)"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-teal-500 focus:outline-none bg-white"
                  />
                  <div className="flex items-center gap-1 justify-end md:justify-start">
                    <button
                      type="button"
                      onClick={() => moveItem(tariefkaart, setTariefkaart, index, -1)}
                      disabled={index === 0}
                      title="Omhoog"
                      className="p-2 rounded-lg text-gray-600 hover:bg-white hover:text-brand-teal-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowUp size={18} weight="bold" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(tariefkaart, setTariefkaart, index, 1)}
                      disabled={index === tariefkaart.length - 1}
                      title="Omlaag"
                      className="p-2 rounded-lg text-gray-600 hover:bg-white hover:text-brand-teal-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowDown size={18} weight="bold" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(tariefkaart, setTariefkaart, index)}
                      title="Verwijderen"
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                    >
                      <Trash size={18} weight="bold" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hero badges */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-brand-navy-500 flex items-center gap-2">
                <Sparkle size={22} weight="duotone" className="text-brand-teal-600" />
                Hero trust badges
              </h2>
              <p className="text-sm text-gray-600">
                De drie korte regels onderaan de hero. Maximaal 3 worden getoond.
              </p>
            </div>
            <button
              type="button"
              onClick={() => addItem(heroBadges, setHeroBadges, 3)}
              disabled={heroBadges.length >= 3}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} weight="bold" />
              Badge toevoegen
            </button>
          </div>

          {heroBadges.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg">
              Nog geen hero badges.
            </div>
          ) : (
            <div className="space-y-3">
              {heroBadges.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-3 items-stretch p-3 rounded-lg border border-gray-200 bg-gray-50/60"
                >
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) =>
                      updateItem(heroBadges, setHeroBadges, index, 'label', e.target.value)
                    }
                    placeholder="Label boven (bijv. 5 jaar vast)"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-teal-500 focus:outline-none bg-white"
                  />
                  <input
                    type="text"
                    value={item.waarde}
                    onChange={(e) =>
                      updateItem(heroBadges, setHeroBadges, index, 'waarde', e.target.value)
                    }
                    placeholder="Waarde onder (bijv. t/m 01-01-2031)"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-teal-500 focus:outline-none bg-white"
                  />
                  <div className="flex items-center gap-1 justify-end md:justify-start">
                    <button
                      type="button"
                      onClick={() => moveItem(heroBadges, setHeroBadges, index, -1)}
                      disabled={index === 0}
                      title="Omhoog"
                      className="p-2 rounded-lg text-gray-600 hover:bg-white hover:text-brand-teal-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowUp size={18} weight="bold" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(heroBadges, setHeroBadges, index, 1)}
                      disabled={index === heroBadges.length - 1}
                      title="Omlaag"
                      className="p-2 rounded-lg text-gray-600 hover:bg-white hover:text-brand-teal-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowDown size={18} weight="bold" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(heroBadges, setHeroBadges, index)}
                      title="Verwijderen"
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                    >
                      <Trash size={18} weight="bold" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acties */}
        <div className="sticky bottom-0 -mx-6 lg:-mx-8 bg-white/80 backdrop-blur border-t border-gray-200 p-4 lg:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
          <Link
            href="/admin/tarieven"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold transition-all"
          >
            Annuleren
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FloppyDisk size={18} weight="bold" />
            {saving ? 'Opslaan...' : 'Opslaan & live zetten'}
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}
