'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Building,
  User,
  Envelope,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  Note,
  PencilSimple,
  FloppyDisk,
  X,
  Bug,
  Copy,
  Check,
  ArrowClockwise,
  Funnel
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import type { ContractAanvraag, AanvraagStatus } from '@/types/aanvragen'
import { convertToDutchDate } from '@/lib/date-utils'

interface AanvraagDetailProps {
  aanvraag: ContractAanvraag
}

interface GridHubLog {
  id: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  data: any
  context: any
  created_at: string
}

function GridHubLogsSection({ aanvraagId }: { aanvraagId: string }) {
  const [logs, setLogs] = useState<GridHubLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchLogs = async () => {
    try {
      const response = await fetch(`/api/admin/gridhub-logs?aanvraag_id=${aanvraagId}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
        setError(null)
      } else {
        setError('Fout bij ophalen logs')
      }
    } catch (err) {
      setError('Fout bij ophalen logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchLogs()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [aanvraagId, autoRefresh])

  const copyAllLogs = async () => {
    try {
      const filteredLogs = getFilteredLogs()
      const logsText = JSON.stringify(filteredLogs, null, 2)
      await navigator.clipboard.writeText(logsText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy logs:', err)
    }
  }

  const copySingleLog = async (log: GridHubLog) => {
    try {
      const logText = JSON.stringify(log, null, 2)
      await navigator.clipboard.writeText(logText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy log:', err)
    }
  }

  const getFilteredLogs = () => {
    let filtered = logs

    if (filterLevel !== 'all') {
      filtered = filtered.filter(log => log.level === filterLevel)
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(search) ||
        JSON.stringify(log.data).toLowerCase().includes(search) ||
        JSON.stringify(log.context).toLowerCase().includes(search)
      )
    }

    return filtered
  }

  const filteredLogs = getFilteredLogs()

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'warn':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'debug':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 p-4 md:p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">GridHub logs laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bug weight="duotone" className="w-5 h-5 text-brand-teal-600" />
          <h2 className="text-lg font-semibold text-brand-navy-500">
            GridHub Logs ({filteredLogs.length} van {logs.length})
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              autoRefresh
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title={autoRefresh ? 'Auto-refresh aan' : 'Auto-refresh uit'}
          >
            <ArrowClockwise size={16} weight={autoRefresh ? 'fill' : 'regular'} />
          </button>
          <button
            onClick={fetchLogs}
            className="px-3 py-1.5 bg-brand-teal-500 text-white rounded-lg hover:bg-brand-teal-600 transition-colors text-sm"
            title="Refresh logs"
          >
            <ArrowClockwise size={16} />
          </button>
          <button
            onClick={copyAllLogs}
            className="px-3 py-1.5 bg-brand-teal-500 text-white rounded-lg hover:bg-brand-teal-600 transition-colors text-sm"
            title="Kopieer alle logs"
          >
            {copied ? <Check size={16} weight="bold" /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-2 items-center">
        <Funnel size={16} className="text-gray-500" />
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded-lg text-xs"
        >
          <option value="all">Alle levels</option>
          <option value="error">Errors</option>
          <option value="warn">Warnings</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>
        <input
          type="text"
          placeholder="Zoek in logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-2 py-1 border border-gray-300 rounded-lg text-xs"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800 text-sm">
            {logs.length === 0 
              ? 'Geen GridHub logs gevonden voor deze aanvraag.'
              : 'Geen logs gevonden met de huidige filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`border-2 rounded-lg p-3 text-xs ${
                log.level === 'error'
                  ? 'bg-red-50 border-red-200'
                  : log.level === 'warn'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getLevelColor(log.level)}`}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="text-gray-500">
                    {new Date(log.created_at).toLocaleString('nl-NL')}
                  </span>
                </div>
                <button
                  onClick={() => copySingleLog(log)}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Kopieer deze log"
                >
                  <Copy size={14} />
                </button>
              </div>
              <div className="mb-2">
                <p className="font-medium text-gray-900">{log.message}</p>
              </div>
              {log.data && Object.keys(log.data).length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Data:</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-48">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </div>
              )}
              {log.context && Object.keys(log.context).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">Context:</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-48">
                    {JSON.stringify(log.context, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
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

export default function AanvraagDetail({ aanvraag }: AanvraagDetailProps) {
  const router = useRouter()
  const [status, setStatus] = useState<AanvraagStatus>(aanvraag.status)
  const [adminNotities, setAdminNotities] = useState(aanvraag.admin_notities || '')
  const [isEditingNotities, setIsEditingNotities] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleStatusChange = async (newStatus: AanvraagStatus) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/aanvragen/${aanvraag.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Fout bij updaten status')
      }

      setStatus(newStatus)
      router.refresh()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Fout bij updaten status. Probeer het opnieuw.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotities = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/aanvragen/${aanvraag.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ admin_notities: adminNotities }),
      })

      if (!response.ok) {
        throw new Error('Fout bij opslaan notities')
      }

      setIsEditingNotities(false)
      router.refresh()
    } catch (error) {
      console.error('Error saving notities:', error)
      alert('Fout bij opslaan notities. Probeer het opnieuw.')
    } finally {
      setSaving(false)
    }
  }

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

  const gegevens = aanvraag.gegevens_data
  const verbruik = aanvraag.verbruik_data

  // Get name and contact info based on type
  const getContactInfo = () => {
    if (aanvraag.aanvraag_type === 'particulier') {
      return {
        naam: `${gegevens.voornaam || ''} ${gegevens.tussenvoegsel ? gegevens.tussenvoegsel + ' ' : ''}${gegevens.achternaam || ''}`.trim(),
        email: gegevens.emailadres || gegevens.email,
        telefoon: gegevens.telefoonnummer || gegevens.telefoon,
        geboortedatum: gegevens.geboortedatum ? convertToDutchDate(gegevens.geboortedatum) || gegevens.geboortedatum : undefined,
        aanhef: gegevens.aanhef,
        voornaam: gegevens.voornaam,
        voorletters: gegevens.voorletters,
        tussenvoegsel: gegevens.tussenvoegsel,
        achternaam: gegevens.achternaam,
      }
    } else {
      return {
        naam: gegevens.bedrijfsnaam || '',
        email: gegevens.email || '',
        telefoon: gegevens.telefoon || '',
        kvk: gegevens.kvkNummer,
        typeBedrijf: gegevens.typeBedrijf,
        aanhef: gegevens.aanhef,
        voornaam: gegevens.voornaam,
        voorletters: gegevens.voorletters,
        tussenvoegsel: gegevens.tussenvoegsel,
        achternaam: gegevens.achternaam,
        geboortedatum: gegevens.geboortedatum ? convertToDutchDate(gegevens.geboortedatum) || gegevens.geboortedatum : undefined,
        contactpersoon: gegevens.contactpersoon,
      }
    }
  }

  const contactInfo = getContactInfo()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/aanvragen">
            <Button variant="ghost" size="sm">
              <ArrowLeft weight="duotone" className="w-4 h-4 mr-2" />
              Terug
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy-500">
              Aanvraag #{aanvraag.aanvraagnummer}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">
              {formatDate(aanvraag.created_at)}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${statusColors[status]}`}>
          {statusLabels[status]}
        </div>
      </div>

      {/* GridHub Status & Logs (if applicable) */}
      {(() => {
        console.log('🔍 [AanvraagDetail] Checking GridHub provider:', {
          external_api_provider: (aanvraag as any).external_api_provider,
          external_order_id: (aanvraag as any).external_order_id,
          external_status: (aanvraag as any).external_status,
          hasGridHub: (aanvraag as any).external_api_provider === 'GRIDHUB',
        })
        return null
      })()}
      {(aanvraag as any).external_api_provider === 'GRIDHUB' && (
        <>
          <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-blue-900">GridHub Status</h2>
              <button
                onClick={async () => {
                  setSaving(true)
                  try {
                    const response = await fetch(`/api/admin/aanvragen/${aanvraag.id}/sync-gridhub`, {
                      method: 'POST',
                    })
                    if (!response.ok) throw new Error('Sync failed')
                    router.refresh()
                    alert('Status gesynchroniseerd!')
                  } catch (error) {
                    alert('Fout bij synchroniseren. Probeer het opnieuw.')
                  } finally {
                    setSaving(false)
                  }
                }}
                disabled={saving}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                🔄 Sync Nu
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-blue-700">Order ID:</span>
                <p className="font-mono text-sm text-blue-900 mt-1">
                  {(aanvraag as any).external_order_id || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-sm text-blue-700">Status:</span>
                <p className="font-semibold text-blue-900 mt-1">
                  {(aanvraag as any).external_status || 'N/A'}
                </p>
              </div>
              {(aanvraag as any).external_status_reason && (
                <div>
                  <span className="text-sm text-blue-700">Status Reden:</span>
                  <p className="text-sm text-blue-800 mt-1">
                    {(aanvraag as any).external_status_reason}
                  </p>
                </div>
              )}
              {(aanvraag as any).external_last_sync && (
                <div>
                  <span className="text-sm text-blue-700">Laatste Sync:</span>
                  <p className="text-sm text-blue-800 mt-1">
                    {formatDate((aanvraag as any).external_last_sync)}
                  </p>
                </div>
              )}
              {(aanvraag as any).external_errors && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <span className="text-sm font-semibold text-red-700">API Error:</span>
                  <p className="text-sm text-red-600 mt-1">
                    {JSON.stringify((aanvraag as any).external_errors, null, 2)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* GridHub Logs */}
          <GridHubLogsSection aanvraagId={aanvraag.id} />
        </>
      )}

      {/* Status Management */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
        <h2 className="text-lg font-semibold text-brand-navy-500 mb-4">Status wijzigen</h2>
        <div className="flex flex-wrap gap-2">
          {(['nieuw', 'in_behandeling', 'afgehandeld', 'geannuleerd'] as AanvraagStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={saving || status === s}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === s
                  ? statusColors[s] + ' cursor-default'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <User weight="duotone" className="w-5 h-5 text-brand-teal-600" />
              <h2 className="text-lg font-semibold text-brand-navy-500">
                {aanvraag.aanvraag_type === 'particulier' ? 'Persoonlijke gegevens' : 'Bedrijfsgegevens'}
              </h2>
            </div>
            <div className="space-y-3">
              {/* Zakelijk: Bedrijfsnaam */}
              {aanvraag.aanvraag_type === 'zakelijk' && (
                <div>
                  <span className="text-sm text-gray-600">Bedrijfsnaam:</span>
                  <p className="font-medium text-brand-navy-500">{contactInfo.naam}</p>
                </div>
              )}
              
              {/* KvK nummer (zakelijk) */}
              {contactInfo.kvk && (
                <div>
                  <span className="text-sm text-gray-600">KvK nummer:</span>
                  <p className="font-medium">{contactInfo.kvk}</p>
                </div>
              )}
              
              {/* Type bedrijf (zakelijk) */}
              {contactInfo.typeBedrijf && (
                <div>
                  <span className="text-sm text-gray-600">Type bedrijf:</span>
                  <p className="font-medium capitalize">{contactInfo.typeBedrijf}</p>
                </div>
              )}
              
              {/* Aanhef */}
              {contactInfo.aanhef && (
                <div>
                  <span className="text-sm text-gray-600">Aanhef:</span>
                  <p className="font-medium">{contactInfo.aanhef === 'dhr' ? 'Dhr.' : 'Mevr.'}</p>
                </div>
              )}
              
              {/* Voornaam */}
              {contactInfo.voornaam && (
                <div>
                  <span className="text-sm text-gray-600">Voornaam:</span>
                  <p className="font-medium">{contactInfo.voornaam}</p>
                </div>
              )}
              
              {/* Voorletters */}
              {contactInfo.voorletters && (
                <div>
                  <span className="text-sm text-gray-600">Voorletters:</span>
                  <p className="font-medium">{contactInfo.voorletters}</p>
                </div>
              )}
              
              {/* Tussenvoegsel */}
              {contactInfo.tussenvoegsel && (
                <div>
                  <span className="text-sm text-gray-600">Tussenvoegsel:</span>
                  <p className="font-medium">{contactInfo.tussenvoegsel}</p>
                </div>
              )}
              
              {/* Achternaam */}
              {contactInfo.achternaam && (
                <div>
                  <span className="text-sm text-gray-600">Achternaam:</span>
                  <p className="font-medium">{contactInfo.achternaam}</p>
                </div>
              )}
              
              {/* Volledige naam (particulier) */}
              {aanvraag.aanvraag_type === 'particulier' && contactInfo.naam && (
                <div>
                  <span className="text-sm text-gray-600">Naam:</span>
                  <p className="font-medium text-brand-navy-500">{contactInfo.naam}</p>
                </div>
              )}
              
              {/* Contactpersoon (zakelijk) */}
              {contactInfo.contactpersoon && (
                <div>
                  <span className="text-sm text-gray-600">Contactpersoon:</span>
                  <p className="font-medium">{contactInfo.contactpersoon}</p>
                </div>
              )}
              
              {contactInfo.email && (
                <div className="flex items-center gap-2">
                  <Envelope weight="duotone" className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${contactInfo.email}`} className="text-brand-teal-600 hover:underline">
                    {contactInfo.email}
                  </a>
                </div>
              )}
              {contactInfo.telefoon && (
                <div className="flex items-center gap-2">
                  <Phone weight="duotone" className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${contactInfo.telefoon}`} className="text-brand-teal-600 hover:underline">
                    {contactInfo.telefoon}
                  </a>
                </div>
              )}
              {contactInfo.geboortedatum && (
                <div>
                  <span className="text-sm text-gray-600">Geboortedatum:</span>
                  <p className="font-medium">{contactInfo.geboortedatum}</p>
                </div>
              )}
            </div>
          </div>

          {/* Leveringsadres */}
          {verbruik?.leveringsadressen && verbruik.leveringsadressen.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin weight="duotone" className="w-5 h-5 text-brand-teal-600" />
                <h2 className="text-lg font-semibold text-brand-navy-500">Leveringsadres</h2>
              </div>
              <div className="space-y-2">
                {verbruik.leveringsadressen.map((adres: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">
                      {adres.straat} {adres.huisnummer}{adres.toevoeging ? ` ${adres.toevoeging}` : ''}
                    </p>
                    <p className="text-sm text-gray-600">
                      {adres.postcode} {adres.plaats}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verbruik */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText weight="duotone" className="w-5 h-5 text-brand-teal-600" />
              <h2 className="text-lg font-semibold text-brand-navy-500">Verbruik</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Elektriciteit normaal:</span>
                <p className="font-medium">{verbruik?.elektriciteitNormaal?.toLocaleString('nl-NL') || '0'} kWh/jaar</p>
              </div>
              {verbruik?.elektriciteitDal && (
                <div>
                  <span className="text-sm text-gray-600">Elektriciteit dal:</span>
                  <p className="font-medium">{verbruik.elektriciteitDal.toLocaleString('nl-NL')} kWh/jaar</p>
                </div>
              )}
              {(verbruik?.gasJaar !== undefined || verbruik?.gas !== undefined) && (
                <div>
                  <span className="text-sm text-gray-600">Gas:</span>
                  <p className="font-medium">{(verbruik.gasJaar || verbruik.gas || 0).toLocaleString('nl-NL')} m³/jaar</p>
                </div>
              )}
              {verbruik?.aansluitwaardeElektriciteit && (
                <div>
                  <span className="text-sm text-gray-600">Aansluitwaarde elektriciteit:</span>
                  <p className="font-medium">{verbruik.aansluitwaardeElektriciteit}</p>
                </div>
              )}
              {verbruik?.aansluitwaardeGas && (
                <div>
                  <span className="text-sm text-gray-600">Aansluitwaarde gas:</span>
                  <p className="font-medium">{verbruik.aansluitwaardeGas}</p>
                </div>
              )}
              {verbruik?.addressType && (
                <div>
                  <span className="text-sm text-gray-600">Adrestype:</span>
                  <p className="font-medium capitalize">{verbruik.addressType}</p>
                </div>
              )}
              {verbruik?.terugleveringJaar && (
                <div>
                  <span className="text-sm text-gray-600">Teruglevering:</span>
                  <p className="font-medium">{verbruik.terugleveringJaar.toLocaleString('nl-NL')} kWh/jaar</p>
                </div>
              )}
            </div>
          </div>

          {/* Correspondentieadres */}
          {aanvraag.heeft_andere_correspondentie_adres && aanvraag.correspondentie_adres && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Envelope weight="duotone" className="w-5 h-5 text-brand-teal-600" />
                <h2 className="text-lg font-semibold text-brand-navy-500">Correspondentieadres</h2>
              </div>
              <div className="space-y-2">
                <p className="font-medium">
                  {aanvraag.correspondentie_adres.straat} {aanvraag.correspondentie_adres.huisnummer}
                  {aanvraag.correspondentie_adres.toevoeging ? ` ${aanvraag.correspondentie_adres.toevoeging}` : ''}
                </p>
                <p className="text-sm text-gray-600">
                  {aanvraag.correspondentie_adres.postcode} {aanvraag.correspondentie_adres.plaats}
                </p>
              </div>
            </div>
          )}

          {/* Betalingsgegevens */}
          {aanvraag.iban && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard weight="duotone" className="w-5 h-5 text-brand-teal-600" />
                <h2 className="text-lg font-semibold text-brand-navy-500">Betalingsgegevens</h2>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">IBAN:</span>
                  <p className="font-mono font-medium">{aanvraag.iban}</p>
                </div>
                {aanvraag.rekening_op_andere_naam && (
                  <div>
                    <span className="text-sm text-gray-600">Rekening staat op andere naam:</span>
                    <p className="font-medium">{aanvraag.rekening_op_andere_naam ? 'Ja' : 'Nee'}</p>
                  </div>
                )}
                {aanvraag.rekening_op_andere_naam && aanvraag.rekeninghouder_naam && (
                  <div>
                    <span className="text-sm text-gray-600">Rekeninghouder:</span>
                    <p className="font-medium">{aanvraag.rekeninghouder_naam}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Levering Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar weight="duotone" className="w-5 h-5 text-brand-teal-600" />
              <h2 className="text-lg font-semibold text-brand-navy-500">Levering</h2>
            </div>
            <div className="space-y-3">
              {aanvraag.heeft_verblijfsfunctie !== undefined && (
                <div>
                  <span className="text-sm text-gray-600">Heeft verblijfsfunctie:</span>
                  <p className="font-medium">{aanvraag.heeft_verblijfsfunctie ? 'Ja' : 'Nee'}</p>
                </div>
              )}
              {aanvraag.gaat_verhuizen !== undefined && (
                <div>
                  <span className="text-sm text-gray-600">Gaat verhuizen:</span>
                  <p className="font-medium">{aanvraag.gaat_verhuizen ? 'Ja' : 'Nee'}</p>
                </div>
              )}
              {aanvraag.wanneer_overstappen && (
                <div>
                  <span className="text-sm text-gray-600">Wanneer overstappen:</span>
                  <p className="font-medium">
                    {aanvraag.wanneer_overstappen === 'zo_snel_mogelijk' ? 'Zo snel mogelijk' : 'Zodra contract afloopt'}
                  </p>
                </div>
              )}
              {aanvraag.contract_einddatum && (
                <div>
                  <span className="text-sm text-gray-600">Contract einddatum:</span>
                  <p className="font-medium">
                    {convertToDutchDate(aanvraag.contract_einddatum) || aanvraag.contract_einddatum}
                  </p>
                </div>
              )}
              {aanvraag.ingangsdatum && (
                <div>
                  <span className="text-sm text-gray-600">Ingangsdatum:</span>
                  <p className="font-medium">
                    {convertToDutchDate(aanvraag.ingangsdatum) || aanvraag.ingangsdatum}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Opties */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle weight="duotone" className="w-5 h-5 text-brand-teal-600" />
              <h2 className="text-lg font-semibold text-brand-navy-500">Opties</h2>
            </div>
            <div className="space-y-2">
              {aanvraag.is_klant_bij_leverancier !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Klant bij leverancier:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    aanvraag.is_klant_bij_leverancier ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {aanvraag.is_klant_bij_leverancier ? 'Ja' : 'Nee'}
                  </span>
                </div>
              )}
              {aanvraag.herinnering_contract !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Contract herinnering:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    aanvraag.herinnering_contract ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {aanvraag.herinnering_contract ? 'Ja' : 'Nee'}
                  </span>
                </div>
              )}
              {aanvraag.nieuwsbrief !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Nieuwsbrief:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    aanvraag.nieuwsbrief ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {aanvraag.nieuwsbrief ? 'Ja' : 'Nee'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Contract Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building weight="duotone" className="w-5 h-5 text-brand-teal-600" />
              <h2 className="text-lg font-semibold text-brand-navy-500">Contract</h2>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Leverancier:</span>
                <p className="font-medium">{aanvraag.leverancier_naam}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Contract:</span>
                <p className="font-medium">{aanvraag.contract_naam}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Type:</span>
                <p className="font-medium capitalize">{aanvraag.contract_type}</p>
              </div>
            </div>
          </div>

          {/* Admin Notities */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Note weight="duotone" className="w-5 h-5 text-brand-teal-600" />
                <h2 className="text-lg font-semibold text-brand-navy-500">Notities</h2>
              </div>
              {!isEditingNotities && (
                <button
                  onClick={() => setIsEditingNotities(true)}
                  className="text-brand-teal-600 hover:text-brand-teal-700"
                >
                  <PencilSimple weight="duotone" className="w-4 h-4" />
                </button>
              )}
            </div>
            {isEditingNotities ? (
              <div className="space-y-3">
                <textarea
                  value={adminNotities}
                  onChange={(e) => setAdminNotities(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal-500 focus:border-brand-teal-500"
                  placeholder="Voeg notities toe..."
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveNotities}
                    disabled={saving}
                    size="sm"
                    className="bg-brand-teal-500 hover:bg-brand-teal-600"
                  >
                    <FloppyDisk weight="duotone" className="w-4 h-4 mr-2" />
                    Opslaan
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditingNotities(false)
                      setAdminNotities(aanvraag.admin_notities || '')
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    <X weight="duotone" className="w-4 h-4 mr-2" />
                    Annuleren
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 whitespace-pre-wrap">
                {adminNotities || 'Geen notities'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

