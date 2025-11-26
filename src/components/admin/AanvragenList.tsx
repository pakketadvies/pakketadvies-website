'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  MagnifyingGlass, 
  Funnel, 
  X,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Calendar,
  Building,
  User,
  Envelope,
  Phone
} from '@phosphor-icons/react'
import type { ContractAanvraag, AanvraagStatus } from '@/types/aanvragen'

interface AanvragenListProps {
  initialAanvragen: ContractAanvraag[]
}

const statusColors: Record<AanvraagStatus, string> = {
  nieuw: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  in_behandeling: 'bg-blue-100 text-blue-700 border-blue-300',
  afgehandeld: 'bg-green-100 text-green-700 border-green-300',
  geannuleerd: 'bg-red-100 text-red-700 border-red-300',
}

const statusLabels: Record<AanvraagStatus, string> = {
  nieuw: 'Nieuw',
  in_behandeling: 'In behandeling',
  afgehandeld: 'Afgehandeld',
  geannuleerd: 'Geannuleerd',
}

const statusIcons: Record<AanvraagStatus, any> = {
  nieuw: Clock,
  in_behandeling: Clock,
  afgehandeld: CheckCircle,
  geannuleerd: XCircle,
}

export default function AanvragenList({ initialAanvragen }: AanvragenListProps) {
  const [aanvragen, setAanvragen] = useState<ContractAanvraag[]>(initialAanvragen)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<AanvraagStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<'particulier' | 'zakelijk' | 'all'>('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchAanvragen = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (statusFilter !== 'all') {
          params.append('status', statusFilter)
        }
        if (typeFilter !== 'all') {
          params.append('aanvraag_type', typeFilter)
        }
        if (search) {
          params.append('search', search)
        }

        const response = await fetch(`/api/aanvragen?${params.toString()}`)
        const data = await response.json()

        if (data.aanvragen) {
          setAanvragen(data.aanvragen)
        }
      } catch (error) {
        console.error('Error fetching aanvragen:', error)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(() => {
      fetchAanvragen()
    }, search ? 500 : 0) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [statusFilter, typeFilter, search])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getGegevensData = (aanvraag: ContractAanvraag) => {
    const data = aanvraag.gegevens_data
    if (aanvraag.aanvraag_type === 'particulier') {
      return {
        naam: `${data.voornaam || ''} ${data.tussenvoegsel ? data.tussenvoegsel + ' ' : ''}${data.achternaam || ''}`.trim(),
        email: data.emailadres || data.email,
        telefoon: data.telefoonnummer || data.telefoon,
      }
    } else {
      return {
        naam: data.bedrijfsnaam || '',
        email: data.email || '',
        telefoon: data.telefoon || '',
        kvk: data.kvkNummer,
      }
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Search and Filters */}
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Zoek op aanvraagnummer, naam, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal-500 focus:border-brand-teal-500"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'bg-brand-teal-50 border-brand-teal-300 text-brand-teal-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Funnel weight="duotone" className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
            {(statusFilter !== 'all' || typeFilter !== 'all') && (
              <span className="bg-brand-teal-600 text-white text-xs px-2 py-0.5 rounded-full">
                {(statusFilter !== 'all' ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AanvraagStatus | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal-500 focus:border-brand-teal-500"
              >
                <option value="all">Alle statussen</option>
                <option value="nieuw">Nieuw</option>
                <option value="in_behandeling">In behandeling</option>
                <option value="afgehandeld">Afgehandeld</option>
                <option value="geannuleerd">Geannuleerd</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'particulier' | 'zakelijk' | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal-500 focus:border-brand-teal-500"
              >
                <option value="all">Alle types</option>
                <option value="particulier">Particulier</option>
                <option value="zakelijk">Zakelijk</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-brand-teal-50 border-t-brand-teal-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Laden...</p>
          </div>
        ) : aanvragen.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">Geen aanvragen gevonden</p>
          </div>
        ) : (
          aanvragen.map((aanvraag) => {
            const gegevens = getGegevensData(aanvraag)
            const StatusIcon = statusIcons[aanvraag.status]

            return (
              <Link
                key={aanvraag.id}
                href={`/admin/aanvragen/${aanvraag.id}`}
                className="block p-4 md:p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left: Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono font-semibold text-brand-navy-500">
                        #{aanvraag.aanvraagnummer}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[aanvraag.status]}`}>
                        <StatusIcon weight="duotone" className="w-3.5 h-3.5" />
                        {statusLabels[aanvraag.status]}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {aanvraag.aanvraag_type === 'particulier' ? 'Particulier' : 'Zakelijk'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Building weight="duotone" className="w-4 h-4" />
                        <span className="font-medium">{aanvraag.leverancier_naam}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User weight="duotone" className="w-4 h-4" />
                        <span>{gegevens.naam}</span>
                      </div>
                      {gegevens.email && (
                        <div className="flex items-center gap-1.5">
                          <Envelope weight="duotone" className="w-4 h-4" />
                          <span className="hidden sm:inline">{gegevens.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar weight="duotone" className="w-4 h-4" />
                      <span>{formatDate(aanvraag.created_at)}</span>
                    </div>
                  </div>

                  {/* Right: Action */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-brand-teal-600 font-medium flex items-center gap-1.5">
                      <Eye weight="duotone" className="w-4 h-4" />
                      <span className="hidden sm:inline">Bekijken</span>
                    </span>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}

