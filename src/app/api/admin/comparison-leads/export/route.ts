import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import type { ComparisonLead } from '@/types/comparison-leads'

const EXPORT_COLUMN_KEYS = [
  'id',
  'created_at',
  'email',
  'phone',
  'flow',
  'source',
  'status',
  'followup_priority',
  'profile_completion',
  'page_path',
  'referrer',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',
  'gclid',
  'session_id',
  'consent_contact',
  'consent_text',
  'location_type',
  'electricity_usage_range',
  'gas_usage_range',
  'switch_moment',
  'note',
  'converted_aanvraag_id',
  'notes_internal',
  'updated_at',
] as const

type LeadExportColumn = (typeof EXPORT_COLUMN_KEYS)[number]
type FlattenedLeadRow = Record<LeadExportColumn, string | number>

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false as const, status: 401, error: 'Unauthorized' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'admin') {
    return { ok: false as const, status: 403, error: 'Forbidden - Admin access required' }
  }

  return { ok: true as const }
}

function csvEscape(value: unknown) {
  if (value === null || value === undefined) return ''
  const str = String(value).replace(/"/g, '""')
  return `"${str}"`
}

function flattenLeadForExport(lead: ComparisonLead): FlattenedLeadRow {
  return {
    id: lead.id,
    created_at: lead.created_at,
    email: lead.email,
    phone: lead.phone || '',
    flow: lead.flow,
    source: lead.source,
    status: lead.status,
    followup_priority: lead.followup_priority,
    profile_completion: lead.profile_completion || 0,
    page_path: lead.page_path || '',
    referrer: lead.referrer || '',
    utm_source: lead.utm_source || '',
    utm_medium: lead.utm_medium || '',
    utm_campaign: lead.utm_campaign || '',
    utm_content: lead.utm_content || '',
    utm_term: lead.utm_term || '',
    fbclid: lead.fbclid || '',
    gclid: lead.gclid || '',
    session_id: lead.session_id || '',
    consent_contact: lead.consent_contact ? 'true' : 'false',
    consent_text: lead.consent_text || '',
    location_type: lead.extra_context?.locationType || '',
    electricity_usage_range: lead.extra_context?.electricityUsageRange || '',
    gas_usage_range: lead.extra_context?.gasUsageRange || '',
    switch_moment: lead.extra_context?.switchMoment || '',
    note: lead.extra_context?.note || '',
    converted_aanvraag_id: lead.converted_aanvraag_id || '',
    notes_internal: lead.notes || '',
    updated_at: lead.updated_at,
  }
}

function parseRequestedColumns(rawColumns: string | null): LeadExportColumn[] {
  if (!rawColumns) return [...EXPORT_COLUMN_KEYS]

  const requested = rawColumns
    .split(',')
    .map((column) => column.trim())
    .filter(Boolean)

  const requestedSet = new Set(requested)
  const validColumns = EXPORT_COLUMN_KEYS.filter((column) => requestedSet.has(column))

  return validColumns.length > 0 ? validColumns : [...EXPORT_COLUMN_KEYS]
}

function buildCsv(leads: ComparisonLead[], columns: LeadExportColumn[]) {
  const rows = leads.map(flattenLeadForExport)
  const headers = columns
  const headerLine = headers.map(csvEscape).join(',')
  const lines = rows.map((row) => headers.map((header) => csvEscape(row[header as keyof typeof row])).join(','))
  return [headerLine, ...lines].join('\n')
}

function buildExcelHtml(leads: ComparisonLead[], columns: LeadExportColumn[]) {
  const rows = leads.map(flattenLeadForExport)
  const headers = columns
  const headerCells = headers.map((header) => `<th>${header}</th>`).join('')
  const bodyRows = rows
    .map((row) => {
      const cells = headers
        .map((header) => {
          const value = row[header as keyof typeof row] ?? ''
          return `<td>${String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`
        })
        .join('')
      return `<tr>${cells}</tr>`
    })
    .join('')

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Vergelijker leads export</title>
  </head>
  <body>
    <table border="1">
      <thead><tr>${headerCells}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
  </body>
</html>`
}

async function fetchAllComparisonLeads() {
  const supabase = createServiceRoleClient()
  const pageSize = 1000
  const allLeads: ComparisonLead[] = []
  let from = 0

  while (true) {
    const to = from + pageSize - 1
    const { data, error } = await supabase
      .from('comparison_leads')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      break
    }

    allLeads.push(...(data as ComparisonLead[]))
    if (data.length < pageSize) {
      break
    }
    from += pageSize
  }

  return allLeads
}

export async function GET(request: Request) {
  try {
    const adminCheck = await requireAdmin()
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const url = new URL(request.url)
    const format = url.searchParams.get('format') === 'excel' ? 'excel' : 'csv'
    const columns = parseRequestedColumns(url.searchParams.get('columns'))
    const leads = await fetchAllComparisonLeads()

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    if (format === 'excel') {
      const html = buildExcelHtml(leads, columns)
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
          'Content-Disposition': `attachment; filename="vergelijker-leads-${timestamp}.xls"`,
          'Cache-Control': 'no-store',
        },
      })
    }

    const csv = buildCsv(leads, columns)
    return new NextResponse(`\uFEFF${csv}`, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="vergelijker-leads-${timestamp}.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error: unknown) {
    console.error('Unexpected error exporting comparison leads:', error)
    return NextResponse.json(
      { error: 'Onverwachte fout bij exporteren van leads.' },
      { status: 500 }
    )
  }
}
