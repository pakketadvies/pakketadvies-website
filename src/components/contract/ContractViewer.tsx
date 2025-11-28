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
    details?: any
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
      // Get postcode from leveringsadres
      const postcode = leveringsadres?.postcode || verbruikData?.postcode || ''
      
      // Extract contract details based on type
      const details = contract.details
      const heeftEnkeleMeter = verbruikData?.heeftEnkeleMeter || false
      
      // Prepare contract details for API
      let contractDetails: any = {}
      if (contract.type === 'vast' && details) {
        contractDetails = {
          tariefElektriciteitNormaal: details.tarief_elektriciteit_normaal,
          tariefElektriciteitDal: details.tarief_elektriciteit_dal,
          tariefElektriciteitEnkel: details.tarief_elektriciteit_enkel,
          tariefGas: details.tarief_gas,
          tariefTerugleveringKwh: details.tarief_teruglevering_kwh || 0,
          vastrechtStroomMaand: details.vastrecht_stroom_maand || 0,
          vastrechtGasMaand: details.vastrecht_gas_maand || 0,
        }
      } else if (contract.type === 'dynamisch' && details) {
        contractDetails = {
          opslagElektriciteit: details.opslag_elektriciteit_normaal || details.opslag_elektriciteit,
          opslagGas: details.opslag_gas,
          opslagTeruglevering: details.opslag_teruglevering || 0,
          vastrechtStroomMaand: details.vastrecht_stroom_maand || 0,
          vastrechtGasMaand: details.vastrecht_gas_maand || 0,
        }
      } else if (contract.type === 'maatwerk' && details) {
        contractDetails = {
          tariefElektriciteitNormaal: details.tarief_elektriciteit_normaal,
          tariefElektriciteitDal: details.tarief_elektriciteit_dal,
          tariefElektriciteitEnkel: details.tarief_elektriciteit_enkel,
          tariefGas: details.tarief_gas,
          tariefTerugleveringKwh: details.tarief_teruglevering_kwh || 0,
          vastrechtStroomMaand: details.vastrecht_stroom_maand || 0,
          vastrechtGasMaand: details.vastrecht_gas_maand || 0,
        }
      }
      
      const response = await fetch('/api/energie/bereken-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Verbruik
          elektriciteitNormaal: verbruikData?.elektriciteitNormaal || 0,
          elektriciteitDal: verbruikData?.elektriciteitDal || 0,
          gas: verbruikData?.gasJaar || verbruikData?.gas || 0,
          terugleveringJaar: verbruikData?.terugleveringJaar || 0,
          
          // Aansluitwaarden
          aansluitwaardeElektriciteit: verbruikData?.aansluitwaardeElektriciteit,
          aansluitwaardeGas: verbruikData?.aansluitwaardeGas,
          
          // Postcode
          postcode: postcode,
          
          // Contract details
          contractType: contract.type,
          heeftDubbeleMeter: !heeftEnkeleMeter,
          ...contractDetails,
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

  // Get address from leveringsadressen array
  const leveringsadres = verbruikData?.leveringsadressen?.[0] || {}
  const adres = {
    straat: leveringsadres.straat || verbruikData?.straat || '',
    huisnummer: leveringsadres.huisnummer || verbruikData?.huisnummer || '',
    toevoeging: leveringsadres.toevoeging || verbruikData?.toevoeging || '',
    postcode: leveringsadres.postcode || verbruikData?.postcode || '',
    plaats: leveringsadres.plaats || verbruikData?.plaats || '',
  }

  // Get verbruik - correct extract normaal/dal split
  const elektriciteitNormaal = verbruikData?.elektriciteitNormaal || 0
  const elektriciteitDal = verbruikData?.elektriciteitDal || 0
  const heeftEnkeleMeter = verbruikData?.heeftEnkeleMeter || false
  const verbruikElektriciteitTotaal = elektriciteitNormaal + elektriciteitDal
  const verbruikGas = verbruikData?.gasJaar || verbruikData?.gas || 0

  // Get costs
  const maandbedrag = verbruikData?.maandbedrag || 0
  const jaarbedrag = verbruikData?.jaarbedrag || maandbedrag * 12
  const besparing = verbruikData?.besparing

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'nieuw':
        return <Badge variant="info" className="bg-blue-100 text-blue-700">Nieuw</Badge>
      case 'in_behandeling':
        return <Badge variant="warning" className="bg-yellow-100 text-yellow-700">In behandeling</Badge>
      case 'afgehandeld':
        return <Badge variant="success" className="bg-green-100 text-green-700">Afgehandeld</Badge>
      case 'geannuleerd':
        return <Badge variant="error" className="bg-red-100 text-red-700">Geannuleerd</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-teal-50 via-white to-brand-navy-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-brand-navy-600 hover:text-brand-teal-600 transition-colors font-medium">
            <ArrowLeft className="w-5 h-5" />
            <span>Terug naar home</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Contract Header Card */}
        <Card className="mb-6 shadow-xl border-0 overflow-hidden">
          <CardContent className="p-6 md:p-8 bg-white">
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

            {/* Maandbedrag Box */}
            <div className="bg-gradient-to-br from-brand-teal-500 to-brand-teal-600 rounded-xl p-6 md:p-8 text-white text-center mb-6">
              <p className="text-sm uppercase tracking-wider mb-2 opacity-90">Uw maandbedrag</p>
              <p className="text-4xl md:text-5xl font-bold mb-2">{formatCurrency(maandbedrag)}</p>
              <p className="text-lg opacity-90 mb-4">per maand ({formatCurrency(jaarbedrag)} per jaar)</p>
              {besparing && besparing > 0 && (
                <p className="text-sm opacity-80">
                  U bespaart {formatCurrency(besparing)} per jaar ten opzichte van het gemiddelde tarief
                </p>
              )}
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 text-center border border-gray-200 shadow-sm">
                <Lightning className="w-10 h-10 text-brand-teal-500 mx-auto mb-3" weight="duotone" />
                <p className="text-xs uppercase tracking-wider text-gray-600 mb-2 font-semibold">Elektriciteit</p>
                {heeftEnkeleMeter ? (
                  <p className="text-lg font-bold text-brand-navy-500">{verbruikElektriciteitTotaal.toLocaleString('nl-NL')} kWh</p>
                ) : (
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-brand-navy-500">{verbruikElektriciteitTotaal.toLocaleString('nl-NL')} kWh</p>
                    <p className="text-xs text-gray-500">
                      {elektriciteitNormaal.toLocaleString('nl-NL')} normaal + {elektriciteitDal.toLocaleString('nl-NL')} dal
                    </p>
                  </div>
                )}
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 text-center border border-gray-200 shadow-sm">
                <Flame className="w-10 h-10 text-brand-teal-500 mx-auto mb-3" weight="duotone" />
                <p className="text-xs uppercase tracking-wider text-gray-600 mb-2 font-semibold">Gas</p>
                {verbruikGas > 0 ? (
                  <p className="text-lg font-bold text-brand-navy-500">{verbruikGas.toLocaleString('nl-NL')} m³</p>
                ) : (
                  <p className="text-sm text-gray-500">Geen gasaansluiting</p>
                )}
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 text-center border border-gray-200 shadow-sm">
                <MapPin className="w-10 h-10 text-brand-teal-500 mx-auto mb-3" weight="duotone" />
                <p className="text-xs uppercase tracking-wider text-gray-600 mb-2 font-semibold">Leveringsadres</p>
                {adres.straat ? (
                  <>
                    <p className="text-sm font-semibold text-brand-navy-500 mb-1">
                      {adres.straat} {adres.huisnummer}{adres.toevoeging ? ` ${adres.toevoeging}` : ''}
                    </p>
                    <p className="text-xs text-gray-500">{adres.postcode} {adres.plaats}</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Niet beschikbaar</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prijsdetails Accordion */}
        <Card className="mb-6 shadow-lg border-0">
          <CardContent className="p-0 bg-white">
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
        <Card className="shadow-lg border-0">
          <CardContent className="p-6 md:p-8 text-center bg-white">
            <h3 className="text-xl font-bold text-brand-navy-500 mb-4">Heeft u vragen?</h3>
            <p className="text-gray-600 mb-6">Ons team staat voor u klaar</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:info@pakketadvies.nl">
                <Button variant="primary" className="bg-brand-teal-500 hover:bg-brand-teal-600">
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

