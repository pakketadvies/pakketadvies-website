'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  CheckCircle, 
  Star, 
  Leaf, 
  CaretDown, 
  CaretUp, 
  Info, 
  FilePdf, 
  Download,
  ArrowLeft,
  Building,
  MapPin,
  Lightning,
  Flame,
  Calculator
} from '@phosphor-icons/react'
import Link from 'next/link'
import Image from 'next/image'
import type { KostenBreakdown } from '@/components/calculator/ContractCard'
import { isGrootverbruikElektriciteitAansluitwaarde, isGrootverbruikGasAansluitwaarde } from '@/lib/verbruik-type'

interface ContractViewerProps {
  aanvraag: {
    id: string
    aanvraagnummer: string
    status: string
    created_at: string
  }
  contract: {
    id: string
    naam: string
    type: 'vast' | 'dynamisch' | 'maatwerk'
  }
  leverancier: {
    id: string
    naam: string
    logo_url?: string | null
    website?: string | null
    over_leverancier?: string | null
  }
  verbruikData: any
  gegevensData: any
}

export default function ContractViewer({
  aanvraag,
  contract,
  leverancier,
  verbruikData,
  gegevensData,
}: ContractViewerProps) {
  const [breakdown, setBreakdown] = useState<KostenBreakdown | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openAccordion, setOpenAccordion] = useState<'prijsdetails' | 'voorwaarden' | 'over' | null>(null)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Calculate costs via API
  useEffect(() => {
    if (openAccordion === 'prijsdetails' && !breakdown && !loading) {
      berekenKosten()
    }
  }, [openAccordion])

  const berekenKosten = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/energie/bereken-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Verbruik
          elektriciteitNormaal: verbruikData?.elektriciteitNormaal || 0,
          elektriciteitDal: verbruikData?.elektriciteitDal || 0,
          gas: verbruikData?.gas || 0,
          terugleveringJaar: verbruikData?.terugleveringJaar || 0,
          
          // Aansluitwaarden
          aansluitwaardeElektriciteit: verbruikData?.aansluitwaardeElektriciteit,
          aansluitwaardeGas: verbruikData?.aansluitwaardeGas,
          
          // Postcode
          postcode: verbruikData?.postcode,
          
          // Contract details
          contractType: contract.type,
          tariefElektriciteitNormaal: verbruikData?.tariefElektriciteitNormaal,
          tariefElektriciteitDal: verbruikData?.tariefElektriciteitDal,
          tariefElektriciteitEnkel: verbruikData?.tariefElektriciteitEnkel,
          tariefGas: verbruikData?.tariefGas,
          tariefTerugleveringKwh: verbruikData?.tariefTerugleveringKwh,
          opslagElektriciteit: verbruikData?.opslagElektriciteit,
          opslagGas: verbruikData?.opslagGas,
          opslagTeruglevering: verbruikData?.opslagTeruglevering,
          vastrechtStroomMaand: verbruikData?.vastrechtStroomMaand,
          vastrechtGasMaand: verbruikData?.vastrechtGasMaand,
          heeftDubbeleMeter: verbruikData?.meterType !== 'enkel',
        }),
      })

      if (!response.ok) {
        throw new Error('Fout bij berekenen kosten')
      }

      const data = await response.json()
      if (data.success && data.breakdown) {
        setBreakdown(data.breakdown)
      } else {
        throw new Error(data.error || 'Onbekende fout')
      }
    } catch (err: any) {
      setError(err.message || 'Er ging iets mis bij het berekenen van de kosten')
    } finally {
      setLoading(false)
    }
  }

  const toggleAccordion = (section: 'prijsdetails' | 'voorwaarden' | 'over') => {
    setOpenAccordion(openAccordion === section ? null : section)
  }

  // Get klant naam
  const klantNaam = gegevensData?.bedrijfsnaam || 
                    `${gegevensData?.aanhef === 'dhr' ? 'Dhr.' : 'Mevr.'} ${gegevensData?.voornaam || ''} ${gegevensData?.achternaam || ''}`.trim() ||
                    gegevensData?.achternaam ||
                    'Klant'

  // Get address
  const adres = {
    straat: verbruikData?.straat || '',
    huisnummer: verbruikData?.huisnummer || '',
    toevoeging: verbruikData?.toevoeging || '',
    postcode: verbruikData?.postcode || '',
    plaats: verbruikData?.plaats || '',
  }

  // Get verbruik
  const verbruikElektriciteit = (verbruikData?.elektriciteitNormaal || 0) + (verbruikData?.elektriciteitDal || 0)
  const verbruikGas = verbruikData?.gas || 0

  // Get costs
  const maandbedrag = verbruikData?.maandbedrag || 0
  const jaarbedrag = verbruikData?.jaarbedrag || maandbedrag * 12
  const besparing = verbruikData?.besparing

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'nieuw':
        return <Badge variant="default" className="bg-blue-100 text-blue-700">Nieuw</Badge>
      case 'in_behandeling':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-700">In behandeling</Badge>
      case 'afgehandeld':
        return <Badge variant="default" className="bg-green-100 text-green-700">Afgehandeld</Badge>
      case 'geannuleerd':
        return <Badge variant="default" className="bg-red-100 text-red-700">Geannuleerd</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-teal-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Terug naar home</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Contract Header Card */}
        <Card className="mb-6">
          <CardContent className="p-6 md:p-8">
            <div className="text-center mb-6">
              {leverancier.logo_url && (
                <div className="mb-4">
                  <Image
                    src={leverancier.logo_url}
                    alt={leverancier.naam}
                    width={150}
                    height={80}
                    className="mx-auto object-contain"
                  />
                </div>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-brand-navy-500 mb-2">
                {contract.naam}
              </h1>
              <p className="text-lg text-gray-600 mb-4">bij {leverancier.naam}</p>
              <div className="flex items-center justify-center gap-4 mb-4">
                {getStatusBadge(aanvraag.status)}
                <span className="text-sm text-gray-500">Aanvraagnummer: <strong>{aanvraag.aanvraagnummer}</strong></span>
              </div>
            </div>

            {/* Besparing Box */}
            <div className="bg-gradient-to-br from-brand-teal-500 to-brand-teal-600 rounded-xl p-6 md:p-8 text-white text-center mb-6">
              <p className="text-sm uppercase tracking-wider mb-2 opacity-90">Uw besparing</p>
              <p className="text-4xl md:text-5xl font-bold mb-2">{formatCurrency(jaarbedrag)}</p>
              <p className="text-lg opacity-90 mb-4">per jaar ({formatCurrency(maandbedrag)} per maand)</p>
              {besparing && besparing > 0 && (
                <p className="text-sm opacity-80">
                  U bespaart {formatCurrency(besparing)} per jaar ten opzichte van het gemiddelde tarief
                </p>
              )}
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Lightning className="w-8 h-8 text-brand-teal-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Elektriciteit</p>
                <p className="text-lg font-semibold text-brand-navy-500">{verbruikElektriciteit.toLocaleString('nl-NL')} kWh</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Flame className="w-8 h-8 text-brand-teal-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Gas</p>
                <p className="text-lg font-semibold text-brand-navy-500">{verbruikGas.toLocaleString('nl-NL')} m³</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <MapPin className="w-8 h-8 text-brand-teal-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Leveringsadres</p>
                <p className="text-sm font-semibold text-brand-navy-500">
                  {adres.straat} {adres.huisnummer}{adres.toevoeging ? ` ${adres.toevoeging}` : ''}
                </p>
                <p className="text-xs text-gray-500">{adres.postcode} {adres.plaats}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prijsdetails Accordion */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <button
              onClick={() => toggleAccordion('prijsdetails')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Calculator className="w-6 h-6 text-brand-teal-500" />
                <span className="text-lg font-semibold text-brand-navy-500">Prijsdetails</span>
              </div>
              {openAccordion === 'prijsdetails' ? (
                <CaretUp className="w-5 h-5 text-gray-400" />
              ) : (
                <CaretDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {openAccordion === 'prijsdetails' && (
              <div className="px-6 pb-6 border-t border-gray-200">
                {loading && (
                  <div className="py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Kosten berekenen...</p>
                  </div>
                )}

                {error && (
                  <div className="py-4 text-center text-red-600">
                    <p>{error}</p>
                  </div>
                )}

                {breakdown && !loading && (
                  <div className="mt-4 space-y-4">
                    {/* Leverancier kosten */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-brand-navy-500 mb-3">Leverancierskosten</h4>
                      {/* Breakdown details hier - reuse logic from ContractCard */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Elektriciteit:</span>
                          <span className="font-medium">{formatCurrency(breakdown.leverancier.elektriciteit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gas:</span>
                          <span className="font-medium">{formatCurrency(breakdown.leverancier.gas)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Vastrecht:</span>
                          <span className="font-medium">{formatCurrency(breakdown.leverancier.vastrecht)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-300 font-semibold">
                          <span>Subtotaal leverancier:</span>
                          <span>{formatCurrency(breakdown.leverancier.subtotaal)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Energiebelasting */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-brand-navy-500 mb-3">Energiebelasting</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Elektriciteit:</span>
                          <span className="font-medium">{formatCurrency(breakdown.energiebelasting.elektriciteit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gas:</span>
                          <span className="font-medium">{formatCurrency(breakdown.energiebelasting.gas)}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>Vermindering:</span>
                          <span className="font-medium">-{formatCurrency(breakdown.energiebelasting.vermindering)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-300 font-semibold">
                          <span>Subtotaal energiebelasting:</span>
                          <span>{formatCurrency(breakdown.energiebelasting.subtotaal)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Netbeheer */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-brand-navy-500 mb-3">Netbeheerkosten</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Elektriciteit:</span>
                          <span className="font-medium">{formatCurrency(breakdown.netbeheer.elektriciteit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gas:</span>
                          <span className="font-medium">{formatCurrency(breakdown.netbeheer.gas)}</span>
                        </div>
                        {breakdown.netbeheer.netbeheerder && (
                          <p className="text-xs text-gray-500 mt-2">Netbeheerder: {breakdown.netbeheer.netbeheerder}</p>
                        )}
                        <div className="flex justify-between pt-2 border-t border-gray-300 font-semibold">
                          <span>Subtotaal netbeheer:</span>
                          <span>{formatCurrency(breakdown.netbeheer.subtotaal)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Totaal */}
                    <div className="bg-brand-teal-50 rounded-lg p-4 border-2 border-brand-teal-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-brand-navy-500">Totaal per jaar (excl. BTW):</span>
                        <span className="text-2xl font-bold text-brand-teal-600">
                          {formatCurrency(breakdown.totaal.jaarExclBtw)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-600">Totaal per maand (excl. BTW):</span>
                        <span className="text-lg font-semibold text-brand-navy-500">
                          {formatCurrency(breakdown.totaal.maandExclBtw)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Card */}
        <Card>
          <CardContent className="p-6 md:p-8 text-center">
            <h3 className="text-xl font-bold text-brand-navy-500 mb-4">Heeft u vragen?</h3>
            <p className="text-gray-600 mb-6">Ons team staat voor u klaar</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:info@pakketadvies.nl">
                <Button variant="default" className="bg-brand-teal-500 hover:bg-brand-teal-600">
                  Email ons
                </Button>
              </a>
              <a href="tel:0850477065">
                <Button variant="outline">Bel ons: 085 047 7065</Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

