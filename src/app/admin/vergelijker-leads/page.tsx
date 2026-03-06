import AdminLayout from '@/components/admin/AdminLayout'
import ComparisonLeadsList from '@/components/admin/ComparisonLeadsList'
import { createClient } from '@/lib/supabase/server'
import type { ComparisonLead } from '@/types/comparison-leads'

async function getComparisonLeads() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return []
  }

  const { data, error } = await supabase
    .from('comparison_leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    console.error('Error fetching comparison leads:', error)
    return []
  }

  return (data || []) as ComparisonLead[]
}

async function getLeadStats() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      total: 0,
      popup: 0,
      inline: 0,
      why: 0,
      converted: 0,
    }
  }

  const [total, popup, inline, why, converted] = await Promise.all([
    supabase.from('comparison_leads').select('*', { count: 'exact', head: true }),
    supabase.from('comparison_leads').select('*', { count: 'exact', head: true }).eq('source', 'timed_popup'),
    supabase.from('comparison_leads').select('*', { count: 'exact', head: true }).eq('source', 'results_inline'),
    supabase.from('comparison_leads').select('*', { count: 'exact', head: true }).eq('source', 'why_modal'),
    supabase.from('comparison_leads').select('*', { count: 'exact', head: true }).eq('status', 'converted'),
  ])

  return {
    total: total.count || 0,
    popup: popup.count || 0,
    inline: inline.count || 0,
    why: why.count || 0,
    converted: converted.count || 0,
  }
}

export default async function VergelijkerLeadsPage() {
  const [leads, stats] = await Promise.all([getComparisonLeads(), getLeadStats()])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy-500 mb-1">Vergelijker leads</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Volledig inzicht in alle e-mail/telefoon leads uit popup, resultaten en aanbevolen uitleg.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Totaal</p>
            <p className="text-2xl font-bold text-brand-navy-500">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border-2 border-brand-teal-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Popup</p>
            <p className="text-2xl font-bold text-brand-teal-700">{stats.popup}</p>
          </div>
          <div className="bg-white rounded-xl border-2 border-brand-teal-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Resultaten</p>
            <p className="text-2xl font-bold text-brand-teal-700">{stats.inline}</p>
          </div>
          <div className="bg-white rounded-xl border-2 border-brand-teal-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Waarom-modal</p>
            <p className="text-2xl font-bold text-brand-teal-700">{stats.why}</p>
          </div>
          <div className="bg-white rounded-xl border-2 border-green-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Geconverteerd</p>
            <p className="text-2xl font-bold text-green-700">{stats.converted}</p>
          </div>
        </div>

        <ComparisonLeadsList initialLeads={leads} />
      </div>
    </AdminLayout>
  )
}
