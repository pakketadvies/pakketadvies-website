import AdminLayout from '@/components/admin/AdminLayout'
import { Plus, Buildings, Pencil, CheckCircle, XCircle } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Leverancier } from '@/types/admin'
import Image from 'next/image'
import { DeleteLeverancierButton } from '@/components/admin/DeleteLeverancierButton'

async function getLeveranciers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leveranciers')
    .select('*')
    .order('volgorde', { ascending: true })
    .order('naam', { ascending: true })

  if (error) {
    console.error('Error fetching leveranciers:', error)
    return []
  }

  return data as Leverancier[]
}

export default async function LeveranciersPage() {
  const leveranciers = await getLeveranciers()

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-navy-500 mb-2">Leveranciers</h1>
            <p className="text-gray-600">Beheer energieleveranciers en hun logo's</p>
          </div>
          <Link
            href="/admin/leveranciers/nieuw"
            className="flex items-center gap-2 px-6 py-3 bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-semibold rounded-lg transition-all"
          >
            <Plus size={20} weight="bold" />
            Nieuwe leverancier
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Totaal</p>
            <p className="text-2xl font-bold text-brand-navy-500">{leveranciers.length}</p>
          </div>
          <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Actief</p>
            <p className="text-2xl font-bold text-green-600">
              {leveranciers.filter((l) => l.actief).length}
            </p>
          </div>
          <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Inactief</p>
            <p className="text-2xl font-bold text-gray-400">
              {leveranciers.filter((l) => !l.actief).length}
            </p>
          </div>
        </div>

        {/* Leveranciers List */}
        {leveranciers.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
            <Buildings size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nog geen leveranciers</h3>
            <p className="text-gray-600 mb-6">
              Voeg je eerste energieleverancier toe om te beginnen
            </p>
            <Link
              href="/admin/leveranciers/nieuw"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-semibold rounded-lg transition-all"
            >
              <Plus size={20} weight="bold" />
              Eerste leverancier toevoegen
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Logo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Naam</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Website</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Volgorde</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leveranciers.map((leverancier) => (
                    <tr key={leverancier.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        {leverancier.logo_url ? (
                          <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-gray-200">
                            <Image
                              src={leverancier.logo_url}
                              alt={leverancier.naam}
                              fill
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Buildings size={24} className="text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-brand-navy-500">{leverancier.naam}</p>
                      </td>
                      <td className="px-6 py-4">
                        {leverancier.website ? (
                          <a
                            href={leverancier.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-teal-600 hover:underline text-sm"
                          >
                            {new URL(leverancier.website).hostname}
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {leverancier.actief ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                            <CheckCircle size={14} weight="fill" />
                            Actief
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            <XCircle size={14} weight="fill" />
                            Inactief
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{leverancier.volgorde}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/leveranciers/${leverancier.id}`}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Bewerken"
                          >
                            <Pencil size={18} className="text-gray-600" />
                          </Link>
                          <DeleteLeverancierButton id={leverancier.id} naam={leverancier.naam} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

