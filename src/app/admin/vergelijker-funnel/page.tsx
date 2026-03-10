import AdminLayout from '@/components/admin/AdminLayout'
import { LeadFunnelRulesManager } from '@/components/admin/LeadFunnelRulesManager'
import type { ContractOption, FunnelRule } from '@/components/admin/LeadFunnelRulesManager'
import { createClient } from '@/lib/supabase/server'

type RecentFunnelEmailLog = {
  id: string
  created_at: string
  email_type: string
  recipient_email: string
  subject: string
  status: 'sent' | 'failed'
  error_message: string | null
  resend_id: string | null
}

const funnelMailCatalog = [
  {
    key: 'welcome',
    label: 'Welkom / bevestiging',
    subjectExample: 'Welkom bij PakketAdvies',
    trigger: 'Na eerste lead capture (algemene leadflow)',
    source: 'sendLeadWelkomEmail()',
  },
  {
    key: 'why_advice',
    label: 'Waarom deze keuze adviesmail',
    subjectExample: 'Jouw advies: <leverancier> - <contracttype>',
    trigger: 'Na submit in waarom-modal',
    source: 'sendLeadWaaromAdviesEmail()',
  },
  {
    key: 'funnel_complete_profile',
    label: 'Funnel: profiel completeren',
    subjectExample: 'Maak je energievoorstel compleet',
    trigger: 'Start van automatische funnel / reminder pending profiel',
    source: 'sendLeadFunnelCompleteProfileEmail()',
  },
  {
    key: 'funnel_proposal',
    label: 'Funnel: contractvoorstel',
    subjectExample: 'Jouw aanbevolen energiecontract',
    trigger: 'Na profiel-completion + in proposal follow-up',
    source: 'sendLeadFunnelProposalEmail()',
  },
] as const

function getLeverancierNaam(leverancier: unknown): string {
  if (Array.isArray(leverancier)) {
    const first = leverancier[0] as { naam?: string } | undefined
    return first?.naam || 'Onbekende leverancier'
  }

  if (leverancier && typeof leverancier === 'object') {
    const single = leverancier as { naam?: string }
    return single.naam || 'Onbekende leverancier'
  }

  return 'Onbekende leverancier'
}

async function getRuleData() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { rules: [], contracts: [], recentFollowupEmails: [] }
  }

  const [rulesResult, contractsResult, emailLogsResult] = await Promise.all([
    supabase
      .from('comparison_lead_funnel_rules')
      .select('*')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase
      .from('contracten')
      .select('id, naam, leverancier:leveranciers(naam)')
      .order('naam', { ascending: true }),
    supabase
      .from('email_logs')
      .select('id, created_at, email_type, recipient_email, subject, status, error_message, resend_id')
      .is('aanvraag_id', null)
      .order('created_at', { ascending: false })
      .limit(120),
  ])

  const rules = (rulesResult.data || []) as FunnelRule[]
  const contracts: ContractOption[] =
    contractsResult.data?.map((contract) => ({
      id: contract.id,
      naam: contract.naam || 'Onbekend contract',
      leverancierNaam: getLeverancierNaam(contract.leverancier),
    })) || []

  const recentFollowupEmails = (emailLogsResult.data || []) as RecentFunnelEmailLog[]

  return { rules, contracts, recentFollowupEmails }
}

export default async function VergelijkerFunnelPage() {
  const { rules, contracts, recentFollowupEmails } = await getRuleData()

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy-500 mb-1">Vergelijker funnel</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Configureer automatisch aanbevolen contracten per lead-segment voor de e-mailfunnel.
          </p>
        </div>

        <LeadFunnelRulesManager initialRules={rules} contractOptions={contracts} />

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-bold text-brand-navy-500 mb-3">Welke mails worden verstuurd?</h2>
          <p className="text-sm text-gray-600 mb-4">
            Hier zie je exact welke mails actief zijn in deze flow, inclusief onderwerp en trigger.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {funnelMailCatalog.map((mail) => (
              <div key={mail.key} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-sm font-semibold text-brand-navy-600">{mail.label}</p>
                <p className="text-xs text-gray-700 mt-1">
                  <span className="font-semibold">Onderwerp:</span> {mail.subjectExample}
                </p>
                <p className="text-xs text-gray-700 mt-1">
                  <span className="font-semibold">Trigger:</span> {mail.trigger}
                </p>
                <p className="text-xs text-gray-700 mt-1">
                  <span className="font-semibold">Bron:</span> {mail.source}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-lg font-bold text-brand-navy-500">Recente verzonden leadmails</h2>
            <span className="text-xs text-gray-500">{recentFollowupEmails.length} recente logs</span>
          </div>

          {recentFollowupEmails.length === 0 ? (
            <p className="text-sm text-gray-600">Nog geen verzonden leadmails gevonden.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="py-2 pr-3">Verzonden op</th>
                    <th className="py-2 pr-3">Type</th>
                    <th className="py-2 pr-3">Ontvanger</th>
                    <th className="py-2 pr-3">Onderwerp</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Resend ID</th>
                    <th className="py-2">Foutmelding</th>
                  </tr>
                </thead>
                <tbody>
                  {recentFollowupEmails.map((mail) => (
                    <tr key={mail.id} className="border-b border-gray-100 align-top">
                      <td className="py-2 pr-3 text-gray-700 whitespace-nowrap">
                        {new Date(mail.created_at).toLocaleString('nl-NL')}
                      </td>
                      <td className="py-2 pr-3 text-xs text-gray-600">{mail.email_type}</td>
                      <td className="py-2 pr-3 text-gray-800">{mail.recipient_email}</td>
                      <td className="py-2 pr-3 text-gray-800">{mail.subject}</td>
                      <td className="py-2 pr-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            mail.status === 'sent'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {mail.status === 'sent' ? 'Verzonden' : 'Mislukt'}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-xs text-gray-600">{mail.resend_id || '—'}</td>
                      <td className="py-2 text-xs text-gray-600">{mail.error_message || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
