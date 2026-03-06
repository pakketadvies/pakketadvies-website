'use client'

import { useMemo, useState } from 'react'
import type { ComparisonLead, ComparisonLeadStatus } from '@/types/comparison-leads'

interface ComparisonLeadsListProps {
  initialLeads: ComparisonLead[]
}

const statusLabels: Record<ComparisonLeadStatus, string> = {
  new: 'Nieuw',
  contacted: 'Gecontacteerd',
  qualified: 'Kwalitatief',
  converted: 'Geconverteerd',
  discarded: 'Afgewezen',
}

const sourceLabels: Record<ComparisonLead['source'], string> = {
  timed_popup: 'Popup (timer)',
  results_inline: 'Resultatenblok',
  why_modal: 'Waarom-modal',
  exit_intent: 'Exit intent',
  manual: 'Handmatig',
}

const flowLabels: Record<ComparisonLead['flow'], string> = {
  business: 'Zakelijk',
  consumer: 'Particulier',
  unknown: 'Onbekend',
}

export default function ComparisonLeadsList({ initialLeads }: ComparisonLeadsListProps) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ComparisonLeadStatus>('all')
  const [sourceFilter, setSourceFilter] = useState<'all' | ComparisonLead['source']>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return initialLeads.filter((lead) => {
      if (statusFilter !== 'all' && lead.status !== statusFilter) return false
      if (sourceFilter !== 'all' && lead.source !== sourceFilter) return false
      if (!q) return true
      return (
        lead.email.toLowerCase().includes(q) ||
        (lead.phone || '').toLowerCase().includes(q) ||
        (lead.page_path || '').toLowerCase().includes(q) ||
        (lead.utm_campaign || '').toLowerCase().includes(q)
      )
    })
  }, [initialLeads, query, statusFilter, sourceFilter])

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zoek op e-mail, telefoon, UTM..."
            className="md:col-span-2 w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | ComparisonLeadStatus)}
            className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
          >
            <option value="all">Alle statussen</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value as 'all' | ComparisonLead['source'])}
            className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
          >
            <option value="all">Alle bronnen</option>
            {Object.entries(sourceLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Datum</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Contact</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Flow</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Bron</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Campagne</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Pagina</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(lead.created_at).toLocaleString('nl-NL')}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-brand-navy-600">{lead.email}</p>
                    <p className="text-xs text-gray-500">{lead.phone || 'Geen telefoonnummer'}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{flowLabels[lead.flow]}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{sourceLabels[lead.source]}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{lead.utm_campaign || '-'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-[260px] truncate">{lead.page_path || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-brand-teal-50 px-2.5 py-1 text-xs font-semibold text-brand-teal-700">
                      {statusLabels[lead.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-gray-600">
            Geen leads gevonden voor de huidige filters.
          </div>
        )}
      </div>
    </div>
  )
}
