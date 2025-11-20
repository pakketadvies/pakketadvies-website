import AdminLayout from '@/components/admin/AdminLayout'
import { Plus, FileText, Pencil, Trash, CheckCircle, XCircle, Star } from '@phosphor-icons/react/dist/ssr'
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'vast':
        return 'Vast'
      case 'dynamisch':
        return 'Dynamisch'
      case 'maatwerk':
        return 'Maatwerk'
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vast':
        return 'bg-blue-50 text-blue-700'
      case 'dynamisch':
        return 'bg-purple-50 text-purple-700'
      case 'maatwerk':
        return 'bg-orange-50 text-orange-700'
      default:
        return 'bg-gray-50 text-gray-700'
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header - Mobile optimized */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy-500 mb-2">Contracten</h1>
            <p className="text-sm sm:text-base text-gray-600">Beheer energiecontracten en hun details</p>
          </div>
          <Link
            href="/admin/contracten/nieuw"
            className="flex items-center justify-center gap-2 px-5 py-3 bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
          >
            <Plus size={20} weight="bold" />
            <span className="sm:inline">Nieuw contract</span>
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
            <p className="text-2xl font-bold text-orange-600">
              {contracten.filter((c) => c.populair).length}
            </p>
          </div>
        </div>

        {/* Filter Tabs - Smaller on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
          <button className="px-3 sm:px-4 py-2 bg-brand-teal-50 text-brand-teal-700 font-medium rounded-lg border-2 border-brand-teal-200 text-sm whitespace-nowrap flex-shrink-0">
            Alle ({contracten.length})
          </button>
          <button className="px-3 sm:px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium rounded-lg border-2 border-gray-200 transition-colors text-sm whitespace-nowrap flex-shrink-0">
            Vast ({contracten.filter((c) => c.type === 'vast').length})
          </button>
          <button className="px-3 sm:px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium rounded-lg border-2 border-gray-200 transition-colors text-sm whitespace-nowrap flex-shrink-0">
            Dynamisch ({contracten.filter((c) => c.type === 'dynamisch').length})
          </button>
          <button className="px-3 sm:px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium rounded-lg border-2 border-gray-200 transition-colors text-sm whitespace-nowrap flex-shrink-0">
            Maatwerk ({contracten.filter((c) => c.type === 'maatwerk').length})
          </button>
        </div>

        {/* Contracten List - Card layout op mobiel, table op desktop */}
        {contracten.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-8 sm:p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nog geen contracten</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Voeg je eerste energiecontract toe om te beginnen
            </p>
            <Link
              href="/admin/contracten/nieuw"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-semibold rounded-lg transition-all"
            >
              <Plus size={20} weight="bold" />
              Eerste contract toevoegen
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="sm:hidden space-y-4">
              {contracten.map((contract) => (
                <div key={contract.id} className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-brand-teal-300 transition-all">
                  <div className="space-y-3">
                    {/* Header: Name + Type */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-brand-navy-500 text-base mb-1 truncate">{contract.naam}</h3>
                        <p className="text-sm text-gray-600">{contract.leverancier?.naam || '-'}</p>
                      </div>
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getTypeColor(contract.type)}`}>
                        {getTypeLabel(contract.type)}
                      </span>
                    </div>
                    
                    {/* Status + Labels */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {contract.actief ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                          <CheckCircle size={12} weight="fill" />
                          Actief
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          <XCircle size={12} weight="fill" />
                          Inactief
                        </span>
                      )}
                      {contract.aanbevolen && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand-teal-50 text-brand-teal-700 text-xs font-medium rounded-full">
                          <Star size={12} weight="fill" />
                          Aanbevolen
                        </span>
                      )}
                      {contract.populair && (
                        <span className="inline-flex px-2 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full">
                          Populair
                        </span>
                      )}
                      <span className="inline-flex px-2 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full ml-auto">
                        #{contract.volgorde}
                      </span>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <Link
                        href={`/admin/contracten/${contract.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-teal-50 hover:bg-brand-teal-100 text-brand-teal-700 font-medium rounded-lg transition-colors text-sm"
                      >
                        <Pencil size={16} weight="bold" />
                        Bewerken
                      </Link>
                      <button
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-lg transition-colors text-sm"
                        title="Verwijderen"
                      >
                        <Trash size={16} weight="bold" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden sm:block bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contract</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Leverancier</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Labels</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Volgorde</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acties</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {contracten.map((contract) => (
                      <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-brand-navy-500">{contract.naam}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">{contract.leverancier?.naam || '-'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(contract.type)}`}>
                            {getTypeLabel(contract.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {contract.actief ? (
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
                          <div className="flex items-center gap-1">
                            {contract.aanbevolen && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand-teal-50 text-brand-teal-700 text-xs font-medium rounded-full">
                                <Star size={12} weight="fill" />
                                Aanbevolen
                              </span>
                            )}
                            {contract.populair && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full">
                                Populair
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{contract.volgorde}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/contracten/${contract.id}`}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Bewerken"
                            >
                              <Pencil size={18} className="text-gray-600" />
                            </Link>
                            <button
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Verwijderen"
                            >
                              <Trash size={18} className="text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}

