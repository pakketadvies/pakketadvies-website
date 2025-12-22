'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, CheckCircle, XCircle, Star } from '@phosphor-icons/react'
import DeleteContractButton from './DeleteContractButton'
import DuplicateContractButton from './DuplicateContractButton'
import type { Contract } from '@/types/admin'

interface ContractenListProps {
  contracten: Contract[]
}

export default function ContractenList({ contracten }: ContractenListProps) {
  const [activeFilter, setActiveFilter] = useState<'alle' | 'vast' | 'dynamisch' | 'maatwerk'>('alle')

  const filteredContracten = activeFilter === 'alle' 
    ? contracten 
    : contracten.filter(c => c.type === activeFilter)

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'vast': return 'Vast'
      case 'dynamisch': return 'Dynamisch'
      case 'maatwerk': return 'Maatwerk'
      default: return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vast': return 'bg-brand-navy-50 text-brand-navy-700'  // Navy = foundation/authority
      case 'dynamisch': return 'bg-brand-teal-50 text-brand-teal-700'  // Teal = action/energy
      case 'maatwerk': return 'bg-brand-purple-50 text-brand-purple-700'  // Purple = premium
      default: return 'bg-gray-50 text-gray-700'
    }
  }

  return (
    <>
      {/* Filter Tabs - Werkende filters! */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter('alle')}
          className={`px-4 py-2 font-medium rounded-lg border-2 transition-colors ${
            activeFilter === 'alle'
              ? 'bg-brand-teal-50 text-brand-teal-700 border-brand-teal-200'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          Alle ({contracten.length})
        </button>
        <button
          onClick={() => setActiveFilter('vast')}
          className={`px-4 py-2 font-medium rounded-lg border-2 transition-colors ${
            activeFilter === 'vast'
              ? 'bg-brand-teal-50 text-brand-teal-700 border-brand-teal-200'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          Vast ({contracten.filter(c => c.type === 'vast').length})
        </button>
        <button
          onClick={() => setActiveFilter('dynamisch')}
          className={`px-4 py-2 font-medium rounded-lg border-2 transition-colors ${
            activeFilter === 'dynamisch'
              ? 'bg-brand-teal-50 text-brand-teal-700 border-brand-teal-200'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          Dynamisch ({contracten.filter(c => c.type === 'dynamisch').length})
        </button>
        <button
          onClick={() => setActiveFilter('maatwerk')}
          className={`px-4 py-2 font-medium rounded-lg border-2 transition-colors ${
            activeFilter === 'maatwerk'
              ? 'bg-brand-teal-50 text-brand-teal-700 border-brand-teal-200'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          Maatwerk ({contracten.filter(c => c.type === 'maatwerk').length})
        </button>
      </div>

      {/* Contracten List */}
      {filteredContracten.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <p className="text-gray-600">
            {activeFilter === 'alle' 
              ? 'Nog geen contracten toegevoegd'
              : `Geen ${getTypeLabel(activeFilter).toLowerCase()} contracten gevonden`
            }
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Contract</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Leverancier</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Labels</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Volgorde</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Acties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredContracten.map((contract) => (
                    <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-brand-navy-500">{contract.naam}</p>
                          {contract.beschrijving && (
                            <p className="text-sm text-gray-600 line-clamp-1">{contract.beschrijving}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getTypeColor(contract.type)}`}>
                          {getTypeLabel(contract.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">{contract.leverancier?.naam || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        {contract.actief ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                            <CheckCircle size={14} weight="fill" />
                            Actief
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            <XCircle size={14} weight="fill" />
                            Inactief
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          {contract.aanbevolen && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand-teal-50 text-brand-teal-700 text-xs font-medium rounded-full">
                              <Star size={12} weight="fill" />
                              Aanbevolen
                            </span>
                          )}
                          {contract.populair && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand-teal-50 text-brand-teal-700 text-xs font-medium rounded-full">
                              Populair
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-600">{contract.volgorde}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/contracten/${contract.id}`}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Bewerken"
                          >
                            <Pencil size={20} className="text-gray-600" />
                          </Link>
                          <DuplicateContractButton id={contract.id} naam={contract.naam} />
                          <DeleteContractButton id={contract.id} naam={contract.naam} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {filteredContracten.map((contract) => (
              <div key={contract.id} className="bg-white rounded-xl border-2 border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getTypeColor(contract.type)}`}>
                    {getTypeLabel(contract.type)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/contracten/${contract.id}`}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Bewerken"
                    >
                      <Pencil size={20} className="text-gray-600" />
                    </Link>
                    <DuplicateContractButton id={contract.id} naam={contract.naam} />
                    <DeleteContractButton id={contract.id} naam={contract.naam} />
                  </div>
                </div>
                <h3 className="font-bold text-lg text-brand-navy-500 mb-1">{contract.naam}</h3>
                <p className="text-sm text-gray-600 mb-3">Leverancier: {contract.leverancier?.naam || '-'}</p>
                <div className="flex items-center justify-between text-sm mb-3">
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
                  <div className="flex items-center gap-1">
                    {contract.aanbevolen && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand-teal-50 text-brand-teal-700 text-xs font-medium rounded-full">
                        <Star size={12} weight="fill" />
                        Aanbevolen
                      </span>
                    )}
                    {contract.populair && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand-teal-50 text-brand-teal-700 text-xs font-medium rounded-full">
                        Populair
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">Volgorde: {contract.volgorde}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}

