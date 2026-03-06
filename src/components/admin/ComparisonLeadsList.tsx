'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import type {
  ComparisonLead,
  ComparisonLeadPriority,
  ComparisonLeadStatus,
} from '@/types/comparison-leads'

interface ComparisonLeadsListProps {
  initialLeads: ComparisonLead[]
}

const exportColumns = [
  { key: 'created_at', label: 'Datum aangemaakt' },
  { key: 'email', label: 'E-mailadres' },
  { key: 'phone', label: 'Telefoonnummer' },
  { key: 'flow', label: 'Flow' },
  { key: 'source', label: 'Bron' },
  { key: 'status', label: 'Status' },
  { key: 'followup_priority', label: 'Prioriteit' },
  { key: 'profile_completion', label: 'Compleetheid (%)' },
  { key: 'page_path', label: 'Pagina pad' },
  { key: 'referrer', label: 'Referrer' },
  { key: 'utm_source', label: 'UTM source' },
  { key: 'utm_medium', label: 'UTM medium' },
  { key: 'utm_campaign', label: 'UTM campagne' },
  { key: 'utm_content', label: 'UTM content' },
  { key: 'utm_term', label: 'UTM term' },
  { key: 'fbclid', label: 'fbclid' },
  { key: 'gclid', label: 'gclid' },
  { key: 'session_id', label: 'Sessie ID' },
  { key: 'consent_contact', label: 'Contact consent' },
  { key: 'consent_text', label: 'Consent tekst' },
  { key: 'location_type', label: 'Locatietype' },
  { key: 'electricity_usage_range', label: 'Stroom range' },
  { key: 'gas_usage_range', label: 'Gas range' },
  { key: 'switch_moment', label: 'Overstapmoment' },
  { key: 'note', label: 'Notitie' },
  { key: 'converted_aanvraag_id', label: 'Geconverteerde aanvraag ID' },
  { key: 'notes_internal', label: 'Interne notities' },
  { key: 'updated_at', label: 'Laatst bijgewerkt' },
] as const

type LeadExportColumn = (typeof exportColumns)[number]['key']

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

const electricityRangeLabels: Record<string, string> = {
  lt_2500: '< 2.500 kWh',
  '2500_5000': '2.500 - 5.000 kWh',
  '5000_10000': '5.000 - 10.000 kWh',
  gt_10000: '> 10.000 kWh',
  unknown: 'Niet opgegeven',
}

const gasRangeLabels: Record<string, string> = {
  none: 'Geen gas',
  lt_1000: '< 1.000 m3',
  '1000_2000': '1.000 - 2.000 m3',
  '2000_4000': '2.000 - 4.000 m3',
  gt_4000: '> 4.000 m3',
  unknown: 'Niet opgegeven',
}

export default function ComparisonLeadsList({ initialLeads }: ComparisonLeadsListProps) {
  const router = useRouter()
  const [leads, setLeads] = useState(initialLeads)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ComparisonLeadStatus>('all')
  const [sourceFilter, setSourceFilter] = useState<'all' | ComparisonLead['source']>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | ComparisonLeadPriority>('all')
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null)
  const [exportingFormat, setExportingFormat] = useState<'csv' | 'excel' | null>(null)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [pendingExportFormat, setPendingExportFormat] = useState<'csv' | 'excel' | null>(null)
  const [selectedExportColumns, setSelectedExportColumns] = useState<LeadExportColumn[]>(
    exportColumns.map((column) => column.key)
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return leads.filter((lead) => {
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
  }, [leads, query, statusFilter, sourceFilter, priorityFilter])

  const selectedLead = useMemo(
    () => filtered.find((lead) => lead.id === selectedLeadId) || null,
    [filtered, selectedLeadId]
  )

  const handleDeleteLead = async (leadId: string, email: string) => {
    const confirmDelete = window.confirm(
      `Weet je zeker dat je lead ${email} wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`
    )
    if (!confirmDelete) return

    try {
      setDeletingLeadId(leadId)
      const response = await fetch(`/api/admin/comparison-leads/${leadId}`, {
        method: 'DELETE',
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.error || 'Verwijderen van lead mislukt')
      }

      setLeads((current) => current.filter((lead) => lead.id !== leadId))
      if (selectedLeadId === leadId) {
        setSelectedLeadId(null)
      }
      router.refresh()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Onbekende fout'
      window.alert(`Lead kon niet verwijderd worden: ${message}`)
    } finally {
      setDeletingLeadId(null)
    }
  }

  const openExportModal = (format: 'csv' | 'excel') => {
    setPendingExportFormat(format)
    setIsExportModalOpen(true)
  }

  const toggleExportColumn = (column: LeadExportColumn) => {
    setSelectedExportColumns((current) =>
      current.includes(column) ? current.filter((item) => item !== column) : [...current, column]
    )
  }

  const handleExport = async () => {
    if (!pendingExportFormat) return
    if (selectedExportColumns.length === 0) {
      window.alert('Selecteer minimaal 1 kolom voor export.')
      return
    }

    try {
      setExportingFormat(pendingExportFormat)
      const params = new URLSearchParams({
        format: pendingExportFormat,
        columns: selectedExportColumns.join(','),
      })
      const response = await fetch(`/api/admin/comparison-leads/export?${params.toString()}`, {
        method: 'GET',
      })

      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        throw new Error(result.error || 'Exporteren mislukt')
      }

      const blob = await response.blob()
      const disposition = response.headers.get('content-disposition') || ''
      const filenameMatch = disposition.match(/filename="(.+)"/i)
      const filename =
        filenameMatch?.[1] || `vergelijker-leads.${pendingExportFormat === 'excel' ? 'xls' : 'csv'}`

      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(url)
      setIsExportModalOpen(false)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Onbekende fout'
      window.alert(`Lead export mislukt: ${message}`)
    } finally {
      setExportingFormat(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => openExportModal('csv')}
            disabled={exportingFormat !== null}
            className="inline-flex items-center rounded-lg border border-brand-teal-200 bg-brand-teal-50 px-3 py-2 text-xs font-semibold text-brand-teal-700 hover:bg-brand-teal-100 disabled:opacity-50"
          >
            {exportingFormat === 'csv' ? 'CSV exporteren...' : 'Exporteer CSV'}
          </button>
          <button
            type="button"
            onClick={() => openExportModal('excel')}
            disabled={exportingFormat !== null}
            className="inline-flex items-center rounded-lg border border-brand-navy-200 bg-brand-navy-50 px-3 py-2 text-xs font-semibold text-brand-navy-700 hover:bg-brand-navy-100 disabled:opacity-50"
          >
            {exportingFormat === 'excel' ? 'Excel exporteren...' : 'Exporteer Excel'}
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zoek op e-mail, telefoon, UTM of notitie..."
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
          <table className="w-full min-w-[1240px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Datum</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Contact</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Flow</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Bron</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Campagne</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Pagina</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Compleetheid</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Prioriteit</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((lead) => {
                const isSelected = selectedLeadId === lead.id
                return (
                  <tr
                    key={lead.id}
                    className={`hover:bg-gray-50 ${isSelected ? 'bg-brand-teal-50/40' : ''}`}
                  >
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
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-[220px]">
                      <span className="inline-block truncate align-middle max-w-[220px]">{lead.page_path || '-'}</span>
                    </td>
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
                        disabled={deletingLeadId === lead.id}
                        onClick={() => setSelectedLeadId(isSelected ? null : lead.id)}
                        className="text-xs font-semibold text-brand-teal-700 hover:text-brand-teal-800 underline underline-offset-2 disabled:opacity-50"
                      >
                        {isSelected ? 'Verberg' : 'Bekijk'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {selectedLead && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-4">
            <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-sm font-semibold text-brand-navy-600">
                Details lead: <span className="text-brand-teal-700">{selectedLead.email}</span>
              </p>
              <button
                type="button"
                onClick={() => setSelectedLeadId(null)}
                className="text-xs font-semibold text-gray-600 hover:text-gray-800 self-start sm:self-auto"
              >
                Sluiten
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Profielcontext</p>
                <p className="text-gray-700">Locatie: {locationLabels[selectedLead.extra_context?.locationType || 'onbekend']}</p>
                <p className="text-gray-700">Overstap: {switchLabels[selectedLead.extra_context?.switchMoment || 'orienting']}</p>
                <p className="text-gray-700">
                  Stroomrange: {electricityRangeLabels[selectedLead.extra_context?.electricityUsageRange || 'unknown']}
                </p>
                <p className="text-gray-700">Gasrange: {gasRangeLabels[selectedLead.extra_context?.gasUsageRange || 'unknown']}</p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Traffic</p>
                <p className="text-gray-700 break-all">Pagina: {selectedLead.page_path || '-'}</p>
                <p className="text-gray-700">UTM source: {selectedLead.utm_source || '-'}</p>
                <p className="text-gray-700">UTM medium: {selectedLead.utm_medium || '-'}</p>
                <p className="text-gray-700">UTM campaign: {selectedLead.utm_campaign || '-'}</p>
                <p className="text-gray-700">fbclid: {selectedLead.fbclid || '-'}</p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Notitie</p>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedLead.extra_context?.note || 'Geen extra notitie ingevuld.'}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => handleDeleteLead(selectedLead.id, selectedLead.email)}
                disabled={deletingLeadId === selectedLead.id}
                className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                {deletingLeadId === selectedLead.id ? 'Verwijderen...' : 'Lead verwijderen'}
              </button>
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-gray-600">
            Geen leads gevonden voor de huidige filters.
          </div>
        )}
      </div>

      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title={`Kies kolommen voor ${pendingExportFormat === 'excel' ? 'Excel' : 'CSV'} export`}
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Selecteer welke kolommen je wilt meenemen in de export. Minimaal 1 kolom is verplicht.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedExportColumns(exportColumns.map((column) => column.key))}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Alles selecteren
            </button>
            <button
              type="button"
              onClick={() => setSelectedExportColumns([])}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Alles uitzetten
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-[45vh] overflow-y-auto pr-1">
            {exportColumns.map((column) => (
              <label
                key={column.key}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={selectedExportColumns.includes(column.key)}
                  onChange={() => toggleExportColumn(column.key)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500"
                />
                <span>{column.label}</span>
              </label>
            ))}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsExportModalOpen(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Annuleren
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exportingFormat !== null || selectedExportColumns.length === 0}
              className="rounded-lg bg-brand-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-teal-600 disabled:opacity-50"
            >
              {exportingFormat
                ? `${pendingExportFormat === 'excel' ? 'Excel' : 'CSV'} exporteren...`
                : `Exporteer ${pendingExportFormat === 'excel' ? 'Excel' : 'CSV'}`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
