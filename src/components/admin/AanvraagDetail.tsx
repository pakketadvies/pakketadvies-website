'use client'

import { useState } from 'react'
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
  X
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import type { ContractAanvraag, AanvraagStatus } from '@/types/aanvragen'

interface AanvraagDetailProps {
  aanvraag: ContractAanvraag
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
        geboortedatum: gegevens.geboortedatum,
        aanhef: gegevens.aanhef,
      }
    } else {
      return {
        naam: gegevens.bedrijfsnaam || '',
        email: gegevens.email || '',
        telefoon: gegevens.telefoon || '',
        kvk: gegevens.kvkNummer,
        typeBedrijf: gegevens.typeBedrijf,
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
              <div>
                <span className="text-sm text-gray-600">Naam:</span>
                <p className="font-medium text-brand-navy-500">{contactInfo.naam}</p>
              </div>
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
              {contactInfo.kvk && (
                <div>
                  <span className="text-sm text-gray-600">KvK nummer:</span>
                  <p className="font-medium">{contactInfo.kvk}</p>
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
              {verbruik?.gasJaar && (
                <div>
                  <span className="text-sm text-gray-600">Gas:</span>
                  <p className="font-medium">{verbruik.gasJaar.toLocaleString('nl-NL')} m³/jaar</p>
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
                {aanvraag.rekening_op_andere_naam && aanvraag.rekeninghouder_naam && (
                  <div>
                    <span className="text-sm text-gray-600">Rekeninghouder:</span>
                    <p className="font-medium">{aanvraag.rekeninghouder_naam}</p>
                  </div>
                )}
              </div>
            </div>
          )}
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

