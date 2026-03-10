'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

type FlowType = 'business' | 'consumer' | 'unknown'

type LeadData = {
  id: string
  email: string
  flow: FlowType
  extraContext?: {
    locationType?: 'woning' | 'zakelijk_pand' | 'zakelijk_aan_huis' | 'onbekend'
    electricityUsageRange?: 'lt_2500' | '2500_5000' | '5000_10000' | 'gt_10000' | 'unknown'
    gasUsageRange?: 'none' | 'lt_1000' | '1000_2000' | '2000_4000' | 'gt_4000' | 'unknown'
    switchMoment?: 'direct' | 'within_3_months' | 'orienting'
    note?: string
  }
}

type RecommendationContract = {
  id: string
  name: string
  type: string
  supplierName: string
  supplierLogoUrl: string | null
}

export default function AanbodCompleterenPage() {
  const params = useParams<{ token: string }>()
  const token = params?.token || ''

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lead, setLead] = useState<LeadData | null>(null)
  const [recommended, setRecommended] = useState<RecommendationContract | null>(null)
  const [fallback, setFallback] = useState<RecommendationContract | null>(null)
  const [completed, setCompleted] = useState(false)

  const [flow, setFlow] = useState<FlowType>('unknown')
  const [locationType, setLocationType] = useState<'woning' | 'zakelijk_pand' | 'zakelijk_aan_huis' | 'onbekend'>('onbekend')
  const [electricityUsageRange, setElectricityUsageRange] =
    useState<'lt_2500' | '2500_5000' | '5000_10000' | 'gt_10000' | 'unknown'>('unknown')
  const [gasUsageRange, setGasUsageRange] = useState<'none' | 'lt_1000' | '1000_2000' | '2000_4000' | 'gt_4000' | 'unknown'>('unknown')
  const [switchMoment, setSwitchMoment] = useState<'direct' | 'within_3_months' | 'orienting'>('orienting')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!token) return
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/comparison-leads/funnel/${token}`)
        const data = await response.json().catch(() => ({}))
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Kon je voorstel niet laden.')
        }

        const leadData = data.lead as LeadData
        setLead(leadData)
        setFlow(leadData.flow || 'unknown')
        setLocationType(leadData.extraContext?.locationType || 'onbekend')
        setElectricityUsageRange(leadData.extraContext?.electricityUsageRange || 'unknown')
        setGasUsageRange(leadData.extraContext?.gasUsageRange || 'unknown')
        setSwitchMoment(leadData.extraContext?.switchMoment || 'orienting')
        setNote(leadData.extraContext?.note || '')
        setRecommended(data.recommendation?.primary || null)
        setFallback(data.recommendation?.fallback || null)
      } catch (loadError: unknown) {
        const message = loadError instanceof Error ? loadError.message : 'Onbekende fout'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token])

  const contractApplyLink = useMemo(() => {
    if (!recommended) return '/calculator'
    return `/calculator?stap=2&contract=${recommended.id}&direct=true`
  }, [recommended])

  const friendlyError = useMemo(() => {
    if (!error) return null
    return error.replace(/funnel/gi, 'voorstel')
  }, [error])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!token) return

    try {
      setSaving(true)
      setError(null)
      const response = await fetch(`/api/comparison-leads/funnel/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flow,
          extraContext: {
            locationType,
            electricityUsageRange,
            gasUsageRange,
            switchMoment,
            note: note.trim() || undefined,
          },
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Opslaan mislukt.')
      }

      setRecommended(data.recommendation?.primary || null)
      setFallback(data.recommendation?.fallback || null)
      setCompleted(true)
    } catch (submitError: unknown) {
      const message = submitError instanceof Error ? submitError.message : 'Onbekende fout'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20 pb-10">
        <div className="container-custom max-w-2xl">
          <div className="rounded-2xl bg-white border border-gray-200 p-8 text-center">
            <p className="text-gray-600">Je persoonlijke voorstel wordt klaargezet...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20 pb-10">
        <div className="container-custom max-w-2xl">
          <div className="rounded-2xl bg-white border border-red-200 p-8 text-center">
            <h1 className="text-xl font-bold text-brand-navy-500 mb-2">Dit aanbod kon niet geladen worden</h1>
            <p className="text-gray-600">{friendlyError}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="container-custom max-w-3xl space-y-5">
        <div className="rounded-2xl bg-brand-navy-500 text-white p-6">
          <p className="text-sm text-white/80">Persoonlijk aanbod</p>
          <h1 className="text-2xl font-bold mt-1">Maak je energievoorstel compleet</h1>
          <p className="text-sm text-white/85 mt-2">
            We hebben je e-mail ontvangen ({lead?.email}). Vul deze korte stappen in en je ziet direct het aanbevolen contract.
          </p>
        </div>

        {!completed && (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Type klant</label>
              <select
                value={flow}
                onChange={(event) => setFlow(event.target.value as FlowType)}
                className="mt-1 w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
              >
                <option value="consumer">Particulier</option>
                <option value="business">Zakelijk</option>
                <option value="unknown">Nog niet zeker</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Locatie</label>
              <select
                value={locationType}
                onChange={(event) => setLocationType(event.target.value as typeof locationType)}
                className="mt-1 w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
              >
                <option value="onbekend">Niet opgegeven</option>
                <option value="woning">Woning</option>
                <option value="zakelijk_pand">Zakelijk pand</option>
                <option value="zakelijk_aan_huis">Zakelijk aan huis</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Jaarverbruik stroom</label>
                <select
                  value={electricityUsageRange}
                  onChange={(event) => setElectricityUsageRange(event.target.value as typeof electricityUsageRange)}
                  className="mt-1 w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
                >
                  <option value="unknown">Niet opgegeven</option>
                  <option value="lt_2500">Minder dan 2.500 kWh</option>
                  <option value="2500_5000">2.500 - 5.000 kWh</option>
                  <option value="5000_10000">5.000 - 10.000 kWh</option>
                  <option value="gt_10000">Meer dan 10.000 kWh</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Jaarverbruik gas</label>
                <select
                  value={gasUsageRange}
                  onChange={(event) => setGasUsageRange(event.target.value as typeof gasUsageRange)}
                  className="mt-1 w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
                >
                  <option value="unknown">Niet opgegeven</option>
                  <option value="none">Geen gas</option>
                  <option value="lt_1000">Minder dan 1.000 m3</option>
                  <option value="1000_2000">1.000 - 2.000 m3</option>
                  <option value="2000_4000">2.000 - 4.000 m3</option>
                  <option value="gt_4000">Meer dan 4.000 m3</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Wanneer wil je overstappen?</label>
              <select
                value={switchMoment}
                onChange={(event) => setSwitchMoment(event.target.value as typeof switchMoment)}
                className="mt-1 w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
              >
                <option value="direct">Zo snel mogelijk</option>
                <option value="within_3_months">Binnen 3 maanden</option>
                <option value="orienting">Ik ben me nog aan het orienteren</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Toelichting (optioneel)</label>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                maxLength={600}
                placeholder="Bijv. contract loopt binnenkort af of voorkeur voor meer zekerheid."
                className="mt-1 w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
              />
            </div>

            <Button type="submit" className="w-full" loading={saving}>
              Toon mijn beste contract
            </Button>
          </form>
        )}

        {completed && (
          <div className="rounded-2xl border border-brand-teal-200 bg-white p-5 md:p-6 space-y-4">
            <h2 className="text-xl font-bold text-brand-navy-500">Jouw aanbevolen contract</h2>
            {recommended ? (
              <div className="rounded-xl border border-brand-teal-200 bg-brand-teal-50/40 p-4">
                <p className="text-sm text-gray-600">Aanbevolen leverancier</p>
                <p className="text-lg font-bold text-brand-navy-500">{recommended.supplierName}</p>
                <p className="text-sm text-gray-700">{recommended.name} - {recommended.type}</p>
                <div className="mt-4">
                  <Link href={contractApplyLink}>
                    <Button className="w-full md:w-auto">Vraag dit contract direct aan</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-700">
                  We hebben nog geen exacte match kunnen bepalen. Je kunt direct verder met vergelijken.
                </p>
                <div className="mt-3">
                  <Link href="/calculator/resultaten">
                    <Button className="w-full md:w-auto">Ga naar vergelijking</Button>
                  </Link>
                </div>
              </div>
            )}

            {fallback && (
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Alternatief</p>
                <p className="text-sm font-semibold text-brand-navy-500">
                  {fallback.supplierName} - {fallback.name}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
