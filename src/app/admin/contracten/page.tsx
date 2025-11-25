import AdminLayout from '@/components/admin/AdminLayout'
import ContractenList from '@/components/admin/ContractenList'
import { Plus } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Contract } from '@/types/admin'

async function getContracten() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contracten')
    .select(`
      *,
      leverancier:leveranciers(naam, logo_url)
    `)
    .order('volgorde', { ascending: true })
    .order('naam', { ascending: true })

  if (error) {
    console.error('Error fetching contracten:', error)
    return []
  }

  return data as Contract[]
}

export default async function ContractenPage() {
  const contracten = await getContracten()

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header - Mobile optimized */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy-500 mb-1">Contracten</h1>
            <p className="text-gray-600 text-sm sm:text-base">Beheer energiecontracten en hun details</p>
          </div>
          <Link
            href="/admin/contracten/nieuw"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-semibold rounded-lg transition-all"
          >
            <Plus size={20} weight="bold" />
            Nieuw contract
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Totaal</p>
            <p className="text-2xl font-bold text-brand-navy-500">{contracten.length}</p>
          </div>
          <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Actief</p>
            <p className="text-2xl font-bold text-green-600">
              {contracten.filter((c) => c.actief).length}
            </p>
          </div>
          <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Aanbevolen</p>
            <p className="text-2xl font-bold text-brand-teal-600">
              {contracten.filter((c) => c.aanbevolen).length}
            </p>
          </div>
          <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Populair</p>
            <p className="text-2xl font-bold text-brand-purple-600">
              {contracten.filter((c) => c.populair).length}
            </p>
          </div>
        </div>

        {/* Contracten List met filters */}
        <ContractenList contracten={contracten} />
      </div>
    </AdminLayout>
  )
}
