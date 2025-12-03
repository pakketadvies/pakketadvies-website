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
  Calculator,
  ChartLine,
  Clock,
  ShieldCheck,
  FileText
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
  // Gebruik opgeslagen breakdown uit verbruik_data (vastgelegd bij aanvraag)
  // Dit zorgt ervoor dat de berekening altijd hetzelfde blijft, ook als tarieven later veranderen
  const opgeslagenBreakdown = verbruikData?.breakdown as KostenBreakdown | null
  const [breakdown, setBreakdown] = useState<KostenBreakdown | null>(opgeslagenBreakdown || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openAccordion, setOpenAccordion] = useState<'prijsdetails' | 'voorwaarden' | 'over' | 'contractinfo' | null>(null)
  const [priceHistory, setPriceHistory] = useState<any[]>([])
  const [currentPrices, setCurrentPrices] = useState<any>(null)
  const [loadingPrices, setLoadingPrices] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  // Load current prices and history for dynamic contracts
  const loadPriceData = async () => {
    if (contract.type !== 'dynamisch') return
    
    console.log('📊 [ContractViewer] Loading dynamic price data...')
    setLoadingPrices(true)
    try {
      // Fetch current prices
      console.log('📊 [ContractViewer] Fetching current prices from /api/dynamic-pricing/current')
      const currentResponse = await fetch('/api/dynamic-pricing/current')
      if (currentResponse.ok) {
        const currentData = await currentResponse.json()
        console.log('📊 [ContractViewer] Current prices response:', currentData)
        if (currentData.success && currentData.prices) {
          setCurrentPrices(currentData.prices)
          console.log('✅ [ContractViewer] Current prices loaded:', currentData.prices)
        } else {
          console.warn('⚠️ [ContractViewer] Current prices response not successful:', currentData)
        }
      } else {
        console.error('❌ [ContractViewer] Failed to fetch current prices:', currentResponse.status, await currentResponse.text())
      }
      
      // Fetch price history
      console.log('📊 [ContractViewer] Fetching price history from /api/dynamic-prices/history?days=30')
      const historyResponse = await fetch('/api/dynamic-prices/history?days=30')
      if (historyResponse.ok) {
        const historyData = await historyResponse.json()
        console.log('📊 [ContractViewer] Price history response:', historyData)
        if (historyData.success && historyData.history) {
          setPriceHistory(historyData.history || [])
          console.log('✅ [ContractViewer] Price history loaded:', historyData.history?.length || 0, 'records')
        } else {
          console.warn('⚠️ [ContractViewer] Price history response not successful:', historyData)
        }
      } else {
        console.error('❌ [ContractViewer] Failed to fetch price history:', historyResponse.status, await historyResponse.text())
      }
    } catch (err: any) {
      console.error('❌ [ContractViewer] Error loading price data:', err)
      setError(err.message || 'Fout bij laden dynamische prijzen')
    } finally {
      setLoadingPrices(false)
      console.log('📊 [ContractViewer] Finished loading price data')
    }
  }

  // Detect desktop vs mobile
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024) // lg breakpoint
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Format currency
  const formatCurrency = (amount: number) => {
    // Altijd afronden zonder decimalen voor consistentie met email
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(amount))
  }

  // Gebruik opgeslagen breakdown bij mount (geen nieuwe berekening nodig)
  useEffect(() => {
    // Gebruik opgeslagen breakdown uit verbruik_data (vastgelegd bij aanvraag)
    if (opgeslagenBreakdown && !breakdown) {
      setBreakdown(opgeslagenBreakdown)
    } else if (!breakdown && !loading && verbruikData && !opgeslagenBreakdown) {
      // Fallback: alleen berekenen als er geen opgeslagen breakdown is
      berekenKosten()
    }
  }, []) // Only run once on mount

  // Laad automatisch dynamische prijzen voor dynamische contracten bij mount
  // Dit gebeurt direct wanneer het component wordt geladen, ongeacht andere state
  useEffect(() => {
    if (contract.type === 'dynamisch') {
      console.log('📊 [ContractViewer] Dynamic contract detected, loading prices immediately...')
      // Force load immediately, don't check current state
      loadPriceData()
    }
  }, [contract.type]) // Run when contract type is known

  // On desktop, always keep both accordions open
  useEffect(() => {
    if (isDesktop) {
      // Set prijsdetails as open (contractinfo will also be shown via isAccordionOpen)
      if (openAccordion !== 'prijsdetails' && openAccordion !== 'contractinfo') {
        setOpenAccordion('prijsdetails')
      }
    }
  }, [isDesktop])

  // Also calculate when prijsdetails is opened (if not already calculated and no opgeslagen breakdown)
  useEffect(() => {
    if (openAccordion === 'prijsdetails' && !breakdown && !loading && !opgeslagenBreakdown) {
      berekenKosten()
    }
  }, [openAccordion])

  const berekenKosten = async () => {
    // Gebruik altijd de opgeslagen breakdown uit verbruik_data
    // Dit zorgt ervoor dat de berekening altijd hetzelfde blijft, ook als tarieven later veranderen
    if (opgeslagenBreakdown) {
      setBreakdown(opgeslagenBreakdown)
      setError(null)
      return
    }
    
    // Fallback: alleen als er geen opgeslagen breakdown is, bereken opnieuw
    // Dit zou niet moeten gebeuren voor nieuwe aanvragen, maar is een veiligheidsnet
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

  const toggleAccordion = (section: 'prijsdetails' | 'voorwaarden' | 'over' | 'contractinfo') => {
    // On desktop, don't allow closing (both always open)
    if (isDesktop && (section === 'prijsdetails' || section === 'contractinfo')) {
      return
    }
    
    setOpenAccordion(openAccordion === section ? null : section)
    
    // Load price history when contractinfo is opened for dynamic contracts
    if (section === 'contractinfo' && contract.type === 'dynamisch' && priceHistory.length === 0 && !loadingPrices) {
      loadPriceData()
    }
  }
  
  // Determine if accordion should be open
  const isAccordionOpen = (section: 'prijsdetails' | 'contractinfo') => {
    if (isDesktop) return true // Always open on desktop
    return openAccordion === section
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

  // Get costs - use opgeslagen breakdown from verbruik_data (vastgelegd bij aanvraag)
  // Dit zorgt ervoor dat het maandbedrag altijd hetzelfde blijft, ook als tarieven later veranderen
  // opgeslagenBreakdown is al gedefinieerd bovenaan de component (regel 65)
  const maandbedrag = verbruikData?.maandbedrag || (opgeslagenBreakdown?.totaal?.maandInclBtw ? Math.round(opgeslagenBreakdown.totaal.maandInclBtw) : (opgeslagenBreakdown?.totaal?.maandExclBtw ? Math.round(opgeslagenBreakdown.totaal.maandExclBtw * 1.21) : 0))
  const jaarbedrag = verbruikData?.jaarbedrag || (opgeslagenBreakdown?.totaal?.jaarInclBtw ? Math.round(opgeslagenBreakdown.totaal.jaarInclBtw) : (opgeslagenBreakdown?.totaal?.jaarExclBtw ? Math.round(opgeslagenBreakdown.totaal.jaarExclBtw * 1.21) : (maandbedrag > 0 ? maandbedrag * 12 : 0)))
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

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Contract Header Card - Full width */}
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

        {/* Desktop: Two-column layout, Mobile: Stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column: Prijsdetails (2/3 width on desktop) */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 h-full">
              <CardContent className="p-0 bg-white">
                <button
                  onClick={() => toggleAccordion('prijsdetails')}
                  className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${
                    isDesktop ? 'cursor-default' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calculator className="w-6 h-6 text-brand-teal-500" />
                    <span className="text-lg font-semibold text-brand-navy-500">Prijsdetails</span>
                  </div>
                  {!isDesktop && (
                    isAccordionOpen('prijsdetails') ? (
                      <CaretUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <CaretDown className="w-5 h-5 text-gray-400" />
                    )
                  )}
                </button>

                {isAccordionOpen('prijsdetails') && (
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
          </div>

          {/* Right Column: Contract Informatie (1/3 width on desktop) */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 h-full">
              <CardContent className="p-0 bg-white">
                <button
                  onClick={() => toggleAccordion('contractinfo')}
                  className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${
                    isDesktop ? 'cursor-default' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Info className="w-6 h-6 text-brand-teal-500" />
                    <span className="text-base lg:text-lg font-semibold text-brand-navy-500">
                      {contract.type === 'dynamisch' ? 'Dynamisch contract' : 
                       contract.type === 'vast' ? 'Vast contract' :
                       'Maatwerk contract'}
                    </span>
                  </div>
                  {!isDesktop && (
                    isAccordionOpen('contractinfo') ? (
                      <CaretUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <CaretDown className="w-5 h-5 text-gray-400" />
                    )
                  )}
                </button>

                {isAccordionOpen('contractinfo') && (
                  <div className="px-6 pb-6 border-t border-gray-200">
                    {contract.type === 'dynamisch' && (
                      <DynamischContractInfo 
                        contract={contract}
                        currentPrices={currentPrices}
                        priceHistory={priceHistory}
                        loadingPrices={loadingPrices}
                        formatCurrency={formatCurrency}
                      />
                    )}
                    {contract.type === 'vast' && (
                      <VastContractInfo 
                        contract={contract}
                        formatCurrency={formatCurrency}
                      />
                    )}
                    {contract.type === 'maatwerk' && (
                      <MaatwerkContractInfo 
                        contract={contract}
                        formatCurrency={formatCurrency}
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

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

// Dynamisch Contract Info Component
function DynamischContractInfo({ 
  contract, 
  currentPrices, 
  priceHistory, 
  loadingPrices,
  formatCurrency 
}: { 
  contract: any
  currentPrices: any
  priceHistory: any[]
  loadingPrices: boolean
  formatCurrency: (amount: number) => string
}) {
  const details = contract.details || {}
  const opslagElektriciteit = details.opslag_elektriciteit_normaal || details.opslag_elektriciteit || 0
  const opslagGas = details.opslag_gas || 0
  const indexNaam = details.index_naam || 'EPEX Day-Ahead'
  const maxPrijsCap = details.max_prijs_cap

  // Calculate current rates (spot + opslag)
  // Only calculate if we have valid prices (not null/undefined and not 0)
  const huidigTariefElektriciteit = currentPrices && currentPrices.electricityDay !== undefined && currentPrices.electricityDay !== null 
    ? (currentPrices.electricityDay + opslagElektriciteit) 
    : null
  const huidigTariefGas = currentPrices && currentPrices.gas !== undefined && currentPrices.gas !== null
    ? (currentPrices.gas + opslagGas)
    : null

  // Calculate averages from history
  const gemiddeldeElektriciteit = priceHistory.length > 0 
    ? priceHistory.reduce((sum, p) => sum + (p.elektriciteit_gemiddeld_dag || 0), 0) / priceHistory.length + opslagElektriciteit
    : null
  const gemiddeldeGas = priceHistory.length > 0
    ? priceHistory.reduce((sum, p) => sum + (p.gas_gemiddeld || 0), 0) / priceHistory.length + opslagGas
    : null

  return (
    <div className="mt-4 space-y-4 lg:space-y-5">
      {/* Uitleg */}
      <div className="bg-blue-50 rounded-lg p-4 lg:p-5 border border-blue-200">
        <h4 className="font-bold text-brand-navy-500 mb-2 lg:mb-3 flex items-center gap-2 text-sm lg:text-base">
          <Info className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 flex-shrink-0" />
          <span>Hoe werkt een dynamisch contract?</span>
        </h4>
        <div className="space-y-2 text-xs lg:text-sm text-gray-700">
          <p>
            Bij een <strong>dynamisch energiecontract</strong> volgt uw tarief de dagelijkse marktprijs van energie. 
            Uw tarief kan per uur variëren op basis van vraag en aanbod.
          </p>
          <p>
            Uw tarief = <strong>spotprijs</strong> ({indexNaam}) + <strong>opslag</strong> leverancier.
          </p>
          {maxPrijsCap && (
            <p className="text-green-700 font-semibold text-xs">
              ✓ Maximumprijs: {formatCurrency(maxPrijsCap)}/kWh
            </p>
          )}
        </div>
      </div>

      {/* Huidige Tarieven */}
      {loadingPrices ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-teal-500 mx-auto mb-2"></div>
          <p className="text-xs text-gray-600">Tarieven laden...</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 lg:p-4 border border-gray-200">
            <h5 className="font-semibold text-brand-navy-500 mb-2 flex items-center gap-2 text-xs lg:text-sm">
              <Lightning className="w-4 h-4 lg:w-5 lg:h-5 text-brand-teal-500 flex-shrink-0" />
              <span>Huidige tarieven</span>
            </h5>
            <div className="space-y-2 text-xs">
              {huidigTariefElektriciteit !== null ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Elektriciteit:</span>
                    <span className="font-semibold text-right">{formatCurrency(huidigTariefElektriciteit)}/kWh</span>
                  </div>
                  <div className="text-xs text-gray-500 pl-5 space-y-0.5">
                    <div>Spot: {formatCurrency(currentPrices?.electricityDay || 0)}/kWh</div>
                    <div>Opslag: +{formatCurrency(opslagElektriciteit)}/kWh</div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-xs">Niet beschikbaar</p>
              )}
              {huidigTariefGas !== null && (
                <>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Gas:</span>
                    <span className="font-semibold text-right">{formatCurrency(huidigTariefGas)}/m³</span>
                  </div>
                  <div className="text-xs text-gray-500 pl-5 space-y-0.5">
                    <div>Spot: {formatCurrency(currentPrices?.gas || 0)}/m³</div>
                    <div>Opslag: +{formatCurrency(opslagGas)}/m³</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Gemiddelde tarieven (30 dagen) */}
          {gemiddeldeElektriciteit !== null && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 lg:p-4 border border-gray-200">
              <h5 className="font-semibold text-brand-navy-500 mb-2 flex items-center gap-2 text-xs lg:text-sm">
                <ChartLine className="w-4 h-4 lg:w-5 lg:h-5 text-brand-teal-500 flex-shrink-0" />
                <span>Gemiddelde (30 dagen)</span>
              </h5>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Elektriciteit:</span>
                  <span className="font-semibold">{formatCurrency(gemiddeldeElektriciteit)}/kWh</span>
                </div>
                {gemiddeldeGas !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gas:</span>
                    <span className="font-semibold">{formatCurrency(gemiddeldeGas)}/m³</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historische tarieven - compact voor sidebar */}
      {priceHistory.length > 0 && (
        <div className="bg-white rounded-lg p-3 lg:p-4 border border-gray-200">
          <h5 className="font-semibold text-brand-navy-500 mb-3 flex items-center gap-2 text-xs lg:text-sm">
            <ChartLine className="w-4 h-4 lg:w-5 lg:h-5 text-brand-teal-500 flex-shrink-0" />
            <span>Historie (30 dagen)</span>
          </h5>
          <div className="space-y-1.5 max-h-48 lg:max-h-64 overflow-y-auto text-xs">
            {priceHistory.slice(0, 7).map((record, idx) => (
              <div key={idx} className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-1.5 border-b border-gray-100 last:border-0">
                <span className="text-gray-600 text-xs mb-0.5 lg:mb-0">
                  {new Date(record.datum).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' })}
                </span>
                <div className="flex flex-col lg:flex-row lg:gap-3 text-gray-700">
                  <span className="text-xs">
                    Stroom: {formatCurrency((record.elektriciteit_gemiddeld_dag || 0) + opslagElektriciteit)}/kWh
                  </span>
                  {record.gas_gemiddeld && (
                    <span className="text-xs">
                      Gas: {formatCurrency((record.gas_gemiddeld || 0) + opslagGas)}/m³
                    </span>
                  )}
                </div>
              </div>
            ))}
            {priceHistory.length > 7 && (
              <p className="text-xs text-gray-500 text-center pt-2">
                +{priceHistory.length - 7} meer dagen
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Vast Contract Info Component
function VastContractInfo({ 
  contract, 
  formatCurrency 
}: { 
  contract: any
  formatCurrency: (amount: number) => string
}) {
  const details = contract.details || {}
  const looptijd = details.looptijd || 1
  const prijsgarantie = details.prijsgarantie || false
  const opzegtermijn = details.opzegtermijn || 1
  const groeneEnergie = details.groene_energie || false

  return (
    <div className="mt-4 space-y-4 lg:space-y-5">
      {/* Uitleg */}
      <div className="bg-green-50 rounded-lg p-4 lg:p-5 border border-green-200">
        <h4 className="font-bold text-brand-navy-500 mb-2 lg:mb-3 flex items-center gap-2 text-sm lg:text-base">
          <ShieldCheck className="w-4 h-4 lg:w-5 lg:h-5 text-green-600 flex-shrink-0" />
          <span>Wat is een vast contract?</span>
        </h4>
        <div className="space-y-2 text-xs lg:text-sm text-gray-700">
          <p>
            Bij een <strong>vast energiecontract</strong> betaalt u gedurende de hele looptijd hetzelfde tarief. 
            Uw tarieven zijn gegarandeerd en veranderen niet.
          </p>
          {prijsgarantie && (
            <p className="text-green-700 font-semibold text-xs">
              ✓ Volledige prijsgarantie
            </p>
          )}
        </div>
      </div>

      {/* Contract Details - Stacked on mobile, grid on desktop sidebar */}
      <div className="space-y-3">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 lg:p-4 border border-gray-200">
          <h5 className="font-semibold text-brand-navy-500 mb-2 flex items-center gap-2 text-xs lg:text-sm">
            <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-brand-teal-500 flex-shrink-0" />
            <span>Looptijd</span>
          </h5>
          <p className="text-xl lg:text-2xl font-bold text-brand-navy-500">{looptijd} {looptijd === 1 ? 'jaar' : 'jaar'}</p>
          <p className="text-xs text-gray-500 mt-1">
            Vaste tarieven voor {looptijd} {looptijd === 1 ? 'jaar' : 'jaar'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 lg:p-4 border border-gray-200">
          <h5 className="font-semibold text-brand-navy-500 mb-2 flex items-center gap-2 text-xs lg:text-sm">
            <ShieldCheck className="w-4 h-4 lg:w-5 lg:h-5 text-brand-teal-500 flex-shrink-0" />
            <span>Prijsgarantie</span>
          </h5>
          {prijsgarantie ? (
            <>
              <p className="text-base lg:text-lg font-bold text-green-600">✓ Ja</p>
              <p className="text-xs text-gray-500 mt-1">
                Volledig gegarandeerd
              </p>
            </>
          ) : (
            <>
              <p className="text-base lg:text-lg font-bold text-gray-400">Nee</p>
              <p className="text-xs text-gray-500 mt-1">
                Kan worden aangepast
              </p>
            </>
          )}
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 lg:p-4 border border-gray-200">
          <h5 className="font-semibold text-brand-navy-500 mb-2 flex items-center gap-2 text-xs lg:text-sm">
            <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-brand-teal-500 flex-shrink-0" />
            <span>Opzegtermijn</span>
          </h5>
          <p className="text-xl lg:text-2xl font-bold text-brand-navy-500">{opzegtermijn} {opzegtermijn === 1 ? 'maand' : 'maanden'}</p>
          <p className="text-xs text-gray-500 mt-1">
            Opzeggen met {opzegtermijn} {opzegtermijn === 1 ? 'maand' : 'maanden'} opzegtermijn
          </p>
        </div>

        {groeneEnergie && (
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 lg:p-4 border border-green-200">
            <h5 className="font-semibold text-brand-navy-500 mb-2 flex items-center gap-2 text-xs lg:text-sm">
              <Leaf className="w-4 h-4 lg:w-5 lg:h-5 text-green-600 flex-shrink-0" />
              <span>Groene energie</span>
            </h5>
            <p className="text-base lg:text-lg font-bold text-green-600">✓ 100% Groen</p>
            <p className="text-xs text-gray-600 mt-1">
              Uit duurzame bronnen
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Maatwerk Contract Info Component
function MaatwerkContractInfo({ 
  contract, 
  formatCurrency 
}: { 
  contract: any
  formatCurrency: (amount: number) => string
}) {
  const details = contract.details || {}
  const looptijd = details.looptijd || 1
  const opzegtermijn = details.opzegtermijn || 1
  const groeneEnergie = details.groene_energie || false

  return (
    <div className="mt-4 space-y-4 lg:space-y-5">
      {/* Uitleg */}
      <div className="bg-purple-50 rounded-lg p-4 lg:p-5 border border-purple-200">
        <h4 className="font-bold text-brand-navy-500 mb-2 lg:mb-3 flex items-center gap-2 text-sm lg:text-base">
          <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600 flex-shrink-0" />
          <span>Wat is een maatwerk contract?</span>
        </h4>
        <div className="space-y-2 text-xs lg:text-sm text-gray-700">
          <p>
            Een <strong>maatwerk energiecontract</strong> is speciaal op uw situatie afgestemd. 
            Op maat gemaakt voor uw specifieke verbruikspatroon en behoeften.
          </p>
          <p>
            Ideaal voor bedrijven met specifieke energiebehoeften of bijzondere omstandigheden.
          </p>
        </div>
      </div>

      {/* Contract Details - Stacked */}
      <div className="space-y-3">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 lg:p-4 border border-gray-200">
          <h5 className="font-semibold text-brand-navy-500 mb-2 flex items-center gap-2 text-xs lg:text-sm">
            <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-brand-teal-500 flex-shrink-0" />
            <span>Looptijd</span>
          </h5>
          <p className="text-xl lg:text-2xl font-bold text-brand-navy-500">{looptijd} {looptijd === 1 ? 'jaar' : 'jaar'}</p>
          <p className="text-xs text-gray-500 mt-1">
            Contract looptijd
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 lg:p-4 border border-gray-200">
          <h5 className="font-semibold text-brand-navy-500 mb-2 flex items-center gap-2 text-xs lg:text-sm">
            <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-brand-teal-500 flex-shrink-0" />
            <span>Opzegtermijn</span>
          </h5>
          <p className="text-xl lg:text-2xl font-bold text-brand-navy-500">{opzegtermijn} {opzegtermijn === 1 ? 'maand' : 'maanden'}</p>
          <p className="text-xs text-gray-500 mt-1">
            Opzegtermijn voor dit contract
          </p>
        </div>

        {groeneEnergie && (
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 lg:p-4 border border-green-200">
            <h5 className="font-semibold text-brand-navy-500 mb-2 flex items-center gap-2 text-xs lg:text-sm">
              <Leaf className="w-4 h-4 lg:w-5 lg:h-5 text-green-600 flex-shrink-0" />
              <span>Groene energie</span>
            </h5>
            <p className="text-base lg:text-lg font-bold text-green-600">✓ 100% Groen</p>
            <p className="text-xs text-gray-600 mt-1">
              Uit duurzame bronnen
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

