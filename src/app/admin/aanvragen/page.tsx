import AdminLayout from '@/components/admin/AdminLayout'
import AanvragenList from '@/components/admin/AanvragenList'
import { createClient } from '@/lib/supabase/server'
import type { ContractAanvraag } from '@/types/aanvragen'

async function getAanvragen() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return []
  }

  const { data, error } = await supabase
    .from('contractaanvragen')
    .select(`
      *,
      contract:contracten(id, naam, type),
      leverancier:leveranciers(id, naam, logo_url)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching aanvragen:', error)
    return []
  }

  return (data || []) as ContractAanvraag[]
}

async function getStats() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { totaal: 0, nieuw: 0, in_behandeling: 0, afgehandeld: 0 }
  }

  const { count: totaal } = await supabase
    .from('contractaanvragen')
    .select('*', { count: 'exact', head: true })

  const { count: nieuw } = await supabase
    .from('contractaanvragen')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'nieuw')

  const { count: in_behandeling } = await supabase
    .from('contractaanvragen')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'in_behandeling')

  const { count: afgehandeld } = await supabase
    .from('contractaanvragen')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'afgehandeld')

  return {
    totaal: totaal || 0,
    nieuw: nieuw || 0,
    in_behandeling: in_behandeling || 0,
    afgehandeld: afgehandeld || 0,
  }
}

export default async function AanvragenPage() {
  const aanvragen = await getAanvragen()
  const stats = await getStats()

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy-500 mb-1">Contractaanvragen</h1>
            <p className="text-gray-600 text-sm sm:text-base">Bekijk en beheer alle contractaanvragen</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Totaal</p>
            <p className="text-2xl font-bold text-brand-navy-500">{stats.totaal}</p>
          </div>
          <div className="bg-white rounded-xl border-2 border-yellow-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Nieuw</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.nieuw}</p>
          </div>
          <div className="bg-white rounded-xl border-2 border-blue-200 p-4">
            <p className="text-sm text-gray-600 mb-1">In behandeling</p>
            <p className="text-2xl font-bold text-blue-600">{stats.in_behandeling}</p>
          </div>
          <div className="bg-white rounded-xl border-2 border-green-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Afgehandeld</p>
            <p className="text-2xl font-bold text-green-600">{stats.afgehandeld}</p>
          </div>
        </div>

        {/* Aanvragen List */}
        <AanvragenList initialAanvragen={aanvragen} />
      </div>
    </AdminLayout>
  )
}

