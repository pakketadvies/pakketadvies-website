'use client'

import { useMemo, useState } from 'react'
import type {
  ComparisonLead,
  ComparisonLeadPriority,
  ComparisonLeadStatus,
} from '@/types/comparison-leads'

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

const priorityLabels: Record<ComparisonLeadPriority, string> = {
  low: 'Laag',
  medium: 'Middel',
  high: 'Hoog',
}

const locationLabels: Record<string, string> = {
  woning: 'Woning',
  zakelijk_pand: 'Zakelijk pand',
  zakelijk_aan_huis: 'Zakelijk aan huis',
  onbekend: 'Niet opgegeven',
}

const switchLabels: Record<string, string> = {
  direct: 'Zo snel mogelijk',
  within_3_months: 'Binnen 3 maanden',
  orienting: 'Orienterend',
}

export default function ComparisonLeadsList({ initialLeads }: ComparisonLeadsListProps) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ComparisonLeadStatus>('all')
  const [sourceFilter, setSourceFilter] = useState<'all' | ComparisonLead['source']>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | ComparisonLeadPriority>('all')
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return initialLeads.filter((lead) => {
      if (statusFilter !== 'all' && lead.status !== statusFilter) return false
      if (sourceFilter !== 'all' && lead.source !== sourceFilter) return false
      if (priorityFilter !== 'all' && lead.followup_priority !== priorityFilter) return false
      if (!q) return true
      return (
        lead.email.toLowerCase().includes(q) ||
        (lead.phone || '').toLowerCase().includes(q) ||
        (lead.page_path || '').toLowerCase().includes(q) ||
        (lead.utm_campaign || '').toLowerCase().includes(q) ||
        (lead.extra_context?.note || '').toLowerCase().includes(q)
      )
    })
  }, [initialLeads, query, statusFilter, sourceFilter, priorityFilter])

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
        <div className="grid gap-3 md:grid-cols-5">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zoek op e-mail, telefoon, UTM..."
            className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
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
          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value as 'all' | ComparisonLeadPriority)}
            className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
          >
            <option value="all">Alle prioriteiten</option>
            {Object.entries(priorityLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Datum</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Contact</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Flow</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Bron</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Campagne</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Compleetheid</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Prioriteit</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((lead) => {
                const isExpanded = expandedLeadId === lead.id
                return (
                  <tbody key={lead.id} className="divide-y divide-gray-100">
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
                      <td className="px-4 py-3">
                        <div className="w-28">
                          <div className="h-2 w-full rounded-full bg-gray-100">
                            <div
                              className="h-2 rounded-full bg-brand-teal-500"
                              style={{ width: `${Math.max(0, Math.min(100, lead.profile_completion || 0))}%` }}
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-600">{lead.profile_completion || 0}%</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            lead.followup_priority === 'high'
                              ? 'bg-red-50 text-red-700'
                              : lead.followup_priority === 'medium'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {priorityLabels[lead.followup_priority]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-brand-teal-50 px-2.5 py-1 text-xs font-semibold text-brand-teal-700">
                          {statusLabels[lead.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setExpandedLeadId(isExpanded ? null : lead.id)}
                          className="text-xs font-semibold text-brand-teal-700 hover:text-brand-teal-800"
                        >
                          {isExpanded ? 'Sluit' : 'Bekijk'}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50">
                        <td colSpan={9} className="px-4 py-4">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-sm">
                            <div className="rounded-lg border border-gray-200 bg-white p-3">
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Profielcontext</p>
                              <p className="text-gray-700">
                                Locatie: {locationLabels[lead.extra_context?.locationType || 'onbekend']}
                              </p>
                              <p className="text-gray-700">
                                Overstap: {switchLabels[lead.extra_context?.switchMoment || 'orienting']}
                              </p>
                              <p className="text-gray-700">Stroomrange: {lead.extra_context?.electricityUsageRange || '-'}</p>
                              <p className="text-gray-700">Gasrange: {lead.extra_context?.gasUsageRange || '-'}</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white p-3">
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Traffic</p>
                              <p className="text-gray-700">Pagina: {lead.page_path || '-'}</p>
                              <p className="text-gray-700">UTM source: {lead.utm_source || '-'}</p>
                              <p className="text-gray-700">UTM medium: {lead.utm_medium || '-'}</p>
                              <p className="text-gray-700">UTM campaign: {lead.utm_campaign || '-'}</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white p-3">
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Notitie</p>
                              <p className="text-gray-700 whitespace-pre-wrap">
                                {lead.extra_context?.note || 'Geen extra notitie ingevuld.'}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                )
              })}
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
