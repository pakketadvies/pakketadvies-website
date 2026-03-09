'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'

export type ContractOption = {
  id: string
  naam: string
  leverancierNaam: string
}

export type FunnelRule = {
  id: string
  name: string
  is_active: boolean
  priority: number
  flow: 'business' | 'consumer' | 'unknown' | null
  location_type: 'woning' | 'zakelijk_pand' | 'zakelijk_aan_huis' | 'onbekend' | null
  electricity_usage_range: 'lt_2500' | '2500_5000' | '5000_10000' | 'gt_10000' | 'unknown' | null
  gas_usage_range: 'none' | 'lt_1000' | '1000_2000' | '2000_4000' | 'gt_4000' | 'unknown' | null
  switch_moment: 'direct' | 'within_3_months' | 'orienting' | null
  contract_id: string
  fallback_contract_id: string | null
  email_subject: string | null
}

interface LeadFunnelRulesManagerProps {
  initialRules: FunnelRule[]
  contractOptions: ContractOption[]
}

const emptyForm = {
  name: '',
  is_active: true,
  priority: 100,
  flow: '',
  location_type: '',
  electricity_usage_range: '',
  gas_usage_range: '',
  switch_moment: '',
  contract_id: '',
  fallback_contract_id: '',
  email_subject: '',
}

export function LeadFunnelRulesManager({ initialRules, contractOptions }: LeadFunnelRulesManagerProps) {
  const [rules, setRules] = useState<FunnelRule[]>(initialRules)
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const sortedRules = useMemo(() => {
    return [...rules].sort((a, b) => a.priority - b.priority)
  }, [rules])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingRuleId(null)
  }

  const handleEdit = (rule: FunnelRule) => {
    setEditingRuleId(rule.id)
    setForm({
      name: rule.name,
      is_active: rule.is_active,
      priority: rule.priority,
      flow: rule.flow || '',
      location_type: rule.location_type || '',
      electricity_usage_range: rule.electricity_usage_range || '',
      gas_usage_range: rule.gas_usage_range || '',
      switch_moment: rule.switch_moment || '',
      contract_id: rule.contract_id,
      fallback_contract_id: rule.fallback_contract_id || '',
      email_subject: rule.email_subject || '',
    })
  }

  const handleDelete = async (id: string) => {
    const yes = window.confirm('Weet je zeker dat je deze funnelregel wilt verwijderen?')
    if (!yes) return
    const response = await fetch(`/api/admin/comparison-leads/funnel-rules/${id}`, { method: 'DELETE' })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      window.alert(data.error || 'Verwijderen mislukt')
      return
    }
    setRules((current) => current.filter((rule) => rule.id !== id))
    if (editingRuleId === id) resetForm()
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.name.trim() || !form.contract_id) {
      window.alert('Vul minimaal naam en primair contract in.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        is_active: form.is_active,
        priority: Number(form.priority) || 100,
        flow: form.flow || null,
        location_type: form.location_type || null,
        electricity_usage_range: form.electricity_usage_range || null,
        gas_usage_range: form.gas_usage_range || null,
        switch_moment: form.switch_moment || null,
        contract_id: form.contract_id,
        fallback_contract_id: form.fallback_contract_id || null,
        email_subject: form.email_subject.trim() || null,
      }

      const response = await fetch(
        editingRuleId
          ? `/api/admin/comparison-leads/funnel-rules/${editingRuleId}`
          : '/api/admin/comparison-leads/funnel-rules',
        {
          method: editingRuleId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Opslaan mislukt')
      }

      const saved = data.rule as FunnelRule
      if (editingRuleId) {
        setRules((current) => current.map((rule) => (rule.id === editingRuleId ? saved : rule)))
      } else {
        setRules((current) => [...current, saved])
      }
      resetForm()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Onbekende fout'
      window.alert(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-bold text-brand-navy-500 mb-3">
          {editingRuleId ? 'Funnelregel bewerken' : 'Nieuwe funnelregel'}
        </h2>
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Naam van regel"
            className="rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm"
          />
          <input
            type="number"
            min={1}
            value={form.priority}
            onChange={(event) => setForm((current) => ({ ...current, priority: Number(event.target.value) }))}
            placeholder="Prioriteit (lager = belangrijker)"
            className="rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm"
          />

          <select
            value={form.flow}
            onChange={(event) => setForm((current) => ({ ...current, flow: event.target.value }))}
            className="rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm"
          >
            <option value="">Alle flows</option>
            <option value="consumer">Particulier</option>
            <option value="business">Zakelijk</option>
            <option value="unknown">Onbekend</option>
          </select>

          <select
            value={form.location_type}
            onChange={(event) => setForm((current) => ({ ...current, location_type: event.target.value }))}
            className="rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm"
          >
            <option value="">Alle locaties</option>
            <option value="woning">Woning</option>
            <option value="zakelijk_pand">Zakelijk pand</option>
            <option value="zakelijk_aan_huis">Zakelijk aan huis</option>
            <option value="onbekend">Onbekend</option>
          </select>

          <select
            value={form.electricity_usage_range}
            onChange={(event) => setForm((current) => ({ ...current, electricity_usage_range: event.target.value }))}
            className="rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm"
          >
            <option value="">Alle stroomranges</option>
            <option value="lt_2500">&lt; 2.500</option>
            <option value="2500_5000">2.500 - 5.000</option>
            <option value="5000_10000">5.000 - 10.000</option>
            <option value="gt_10000">&gt; 10.000</option>
            <option value="unknown">Onbekend</option>
          </select>

          <select
            value={form.gas_usage_range}
            onChange={(event) => setForm((current) => ({ ...current, gas_usage_range: event.target.value }))}
            className="rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm"
          >
            <option value="">Alle gasranges</option>
            <option value="none">Geen gas</option>
            <option value="lt_1000">&lt; 1.000</option>
            <option value="1000_2000">1.000 - 2.000</option>
            <option value="2000_4000">2.000 - 4.000</option>
            <option value="gt_4000">&gt; 4.000</option>
            <option value="unknown">Onbekend</option>
          </select>

          <select
            value={form.switch_moment}
            onChange={(event) => setForm((current) => ({ ...current, switch_moment: event.target.value }))}
            className="rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm"
          >
            <option value="">Alle overstapmomenten</option>
            <option value="direct">Direct</option>
            <option value="within_3_months">Binnen 3 maanden</option>
            <option value="orienting">Orienterend</option>
          </select>

          <select
            value={form.contract_id}
            onChange={(event) => setForm((current) => ({ ...current, contract_id: event.target.value }))}
            className="rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm"
          >
            <option value="">Kies primair contract</option>
            {contractOptions.map((contract) => (
              <option key={contract.id} value={contract.id}>
                {contract.naam} - {contract.leverancierNaam}
              </option>
            ))}
          </select>

          <select
            value={form.fallback_contract_id}
            onChange={(event) => setForm((current) => ({ ...current, fallback_contract_id: event.target.value }))}
            className="rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm"
          >
            <option value="">Geen fallback</option>
            {contractOptions.map((contract) => (
              <option key={contract.id} value={contract.id}>
                {contract.naam} - {contract.leverancierNaam}
              </option>
            ))}
          </select>

          <input
            value={form.email_subject}
            onChange={(event) => setForm((current) => ({ ...current, email_subject: event.target.value }))}
            placeholder="Onderwerpregel override (optioneel)"
            className="rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm md:col-span-2"
          />

          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
            />
            Regel actief
          </label>

          <div className="md:col-span-2 flex flex-wrap gap-2">
            <Button type="submit" loading={saving}>
              {editingRuleId ? 'Regel bijwerken' : 'Regel toevoegen'}
            </Button>
            {editingRuleId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Annuleren
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full min-w-[980px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Regel</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Segment</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Primair contract</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Prioriteit</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedRules.map((rule) => {
              const contract = contractOptions.find((item) => item.id === rule.contract_id)
              return (
                <tr key={rule.id}>
                  <td className="px-4 py-3 text-sm text-brand-navy-600 font-semibold">{rule.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {rule.flow || 'alle flows'} / {rule.location_type || 'alle locaties'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {contract ? `${contract.naam} (${contract.leverancierNaam})` : rule.contract_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{rule.priority}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${rule.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {rule.is_active ? 'Actief' : 'Inactief'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm space-x-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(rule)}
                      className="text-brand-teal-700 hover:text-brand-teal-900 underline underline-offset-2"
                    >
                      Bewerk
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(rule.id)}
                      className="text-red-600 hover:text-red-800 underline underline-offset-2"
                    >
                      Verwijder
                    </button>
                  </td>
                </tr>
              )
            })}
            {sortedRules.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-600">
                  Nog geen funnelregels geconfigureerd.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
