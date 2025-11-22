'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import ContractCard from '@/components/calculator/ContractCard'
import EditVerbruikPanel from '@/components/calculator/EditVerbruikPanel'
import { useCalculatorStore } from '@/store/calculatorStore'
import { Lightning, SlidersHorizontal, X, ArrowsDownUp, Leaf } from '@phosphor-icons/react'
import Link from 'next/link'
import type { ContractOptie, VerbruikData } from '@/types/calculator'

// Helper: Calculate estimated cost for contract
// NOTE: This is a SIMPLIFIED calculation for the results page
// It calculates ONLY the leverancier costs (excl. taxes, netbeheer)
// For the FULL calculation with all costs, the energie-berekening.ts would be used
// But that requires netbeheerder lookup which is async and heavy for list pages
const berekenContractKostenVereenvoudigd = (
  contract: any,
  verbruikElektriciteitNormaal: number,
  verbruikElektriciteitDal: number,
  verbruikGas: number,
  heeftEnkeleMeter: boolean = false,
  terugleveringJaar: number = 0 // NIEUW: voor saldering
): { maandbedrag: number; jaarbedrag: number; besparing: number } => {
  let totaalJaar = 0
  
  // ============================================
  // STAP 1: SALDERINGSREGELING TOEPASSEN
  // ============================================
  let nettoElektriciteitNormaal = verbruikElektriciteitNormaal
  let nettoElektriciteitDal = verbruikElektriciteitDal
  
  if (terugleveringJaar > 0) {
    if (heeftEnkeleMeter) {
      // ENKELE METER: Teruglevering volledig aftrekken van totaal verbruik
      const totaalVerbruik = verbruikElektriciteitNormaal + verbruikElektriciteitDal
      const nettoTotaal = Math.max(0, totaalVerbruik - terugleveringJaar)
      nettoElektriciteitNormaal = nettoTotaal
      nettoElektriciteitDal = 0
    } else {
      // DUBBELE METER: Teruglevering 50/50 verdelen tussen normaal en dal
      const terugleveringNormaal = terugleveringJaar / 2
      const terugleveringDal = terugleveringJaar / 2
      
      nettoElektriciteitNormaal = Math.max(0, verbruikElektriciteitNormaal - terugleveringNormaal)
      nettoElektriciteitDal = Math.max(0, verbruikElektriciteitDal - terugleveringDal)
    }
  }

  if (contract.type === 'vast' && contract.details_vast) {
    const { 
      tarief_elektriciteit_enkel,
      tarief_elektriciteit_normaal, 
      tarief_elektriciteit_dal,
      tarief_gas,
      tarief_teruglevering_kwh, // NIEUW
      vastrecht_stroom_maand,
      vastrecht_gas_maand,
      vaste_kosten_maand,
    } = contract.details_vast
    
    // Leverancierskosten - gebruik NETTO verbruik na saldering
    if (heeftEnkeleMeter && tarief_elektriciteit_enkel) {
      // ENKELE METER: gebruik enkeltarief
      const totaalElektriciteit = nettoElektriciteitNormaal + nettoElektriciteitDal
      totaalJaar = 
        (totaalElektriciteit * tarief_elektriciteit_enkel) +
        (verbruikGas * (tarief_gas || 0)) +
        ((vastrecht_stroom_maand || vaste_kosten_maand || 4) * 12)
    } else if (!heeftEnkeleMeter && tarief_elektriciteit_normaal && tarief_elektriciteit_dal) {
      // DUBBELE METER: gebruik normaal + dal tarieven
      totaalJaar = 
        (nettoElektriciteitNormaal * tarief_elektriciteit_normaal) +
        (nettoElektriciteitDal * tarief_elektriciteit_dal) +
        (verbruikGas * (tarief_gas || 0)) +
        ((vastrecht_stroom_maand || vaste_kosten_maand || 4) * 12)
    } else {
      // Fallback: gebruik enkeltarief of normaal tarief
      const totaalElektriciteit = nettoElektriciteitNormaal + nettoElektriciteitDal
      const tariefElektriciteit = tarief_elektriciteit_enkel || tarief_elektriciteit_normaal || 0
      totaalJaar = 
        (totaalElektriciteit * tariefElektriciteit) +
        (verbruikGas * (tarief_gas || 0)) +
        ((vastrecht_stroom_maand || vaste_kosten_maand || 4) * 12)
    }
    
    // TERUGLEVERKOSTEN toevoegen (berekend over VOLLEDIGE teruglevering)
    if (terugleveringJaar > 0 && tarief_teruglevering_kwh) {
      totaalJaar += terugleveringJaar * tarief_teruglevering_kwh
    }
    
    // EXACTE tarieven 2025 (na database migration):
    // - EB elektriciteit: €0.10154/kWh (alle staffels)
    // - EB gas: €0.57816/m³ (alle staffels)
    // - Vermindering EB: €524.95/jaar
    // - Netbeheer Enexis: €430 elektra (3x25A) + €245 gas (G6)
    const totaalElektriciteit = nettoElektriciteitNormaal + nettoElektriciteitDal // NETTO na saldering
    
    // Energiebelasting 2025 (over NETTO verbruik)
    const ebElektriciteit = totaalElektriciteit * 0.10154
    const ebGas = verbruikGas * 0.57816
    
    // Vermindering 2025
    const vermindering = 524.95
    
    // Netbeheerkosten Enexis (default aansluitwaarden)
    // 3x25A elektriciteit + G6 gas
    const netbeheerElektriciteit = 430.00
    const netbeheerGas = verbruikGas > 0 ? 245.00 : 0
    const netbeheerKosten = netbeheerElektriciteit + netbeheerGas
    
    const geschatteExtraKosten = ebElektriciteit + ebGas - vermindering + netbeheerKosten
    totaalJaar += geschatteExtraKosten
    
  } else if (contract.type === 'dynamisch' && contract.details_dynamisch) {
    const { opslag_elektriciteit_normaal, opslag_gas, vaste_kosten_maand } = contract.details_dynamisch
    // Assume market price + surcharge (estimated market: €0.20 elec, €0.80 gas)
    const marktPrijsElektriciteit = 0.20
    const marktPrijsGas = 0.80
    const totaalElektriciteit = nettoElektriciteitNormaal + nettoElektriciteitDal // NETTO na saldering
    totaalJaar = 
      (totaalElektriciteit * (marktPrijsElektriciteit + opslag_elektriciteit_normaal)) +
      (verbruikGas * (marktPrijsGas + (opslag_gas || 0))) +
      ((vaste_kosten_maand || 0) * 12)
      
    // Energiebelasting en netbeheer toevoegen
    const ebElektriciteit = totaalElektriciteit * 0.10154
    const ebGas = verbruikGas * 0.57816
    const vermindering = 524.95
    const netbeheerElektriciteit = 430.00
    const netbeheerGas = verbruikGas > 0 ? 245.00 : 0
    const netbeheerKosten = netbeheerElektriciteit + netbeheerGas
    
    const geschatteExtraKosten = ebElektriciteit + ebGas - vermindering + netbeheerKosten
    totaalJaar += geschatteExtraKosten
    
  } else if (contract.type === 'maatwerk') {
    // No price calculation for maatwerk
    return { maandbedrag: 0, jaarbedrag: 0, besparing: 0 }
  }

  const maandbedrag = Math.round(totaalJaar / 12)
  const jaarbedrag = Math.round(totaalJaar)
  
  // Calculate besparing vs average of all contracts (simple estimation)
  const totaalElektriciteit = verbruikElektriciteitNormaal + verbruikElektriciteitDal
  const gemiddeldeMaandbedrag = Math.round(((totaalElektriciteit * 0.35) + (verbruikGas * 1.50) + 700) / 12)
  const besparing = Math.max(0, gemiddeldeMaandbedrag - maandbedrag)

  return { maandbedrag, jaarbedrag, besparing }
}

// Transform API contract to ContractOptie
const transformContractToOptie = (
  contract: any,
  verbruikElektriciteitNormaal: number,
  verbruikElektriciteitDal: number,
  verbruikGas: number,
  heeftEnkeleMeter: boolean = false,
  terugleveringJaar: number = 0 // NIEUW
): ContractOptie | null => {
  // Skip maatwerk contracts in standard listing
  if (contract.type === 'maatwerk') {
    return null
  }

  // Gebruik exacte bedragen als beschikbaar, anders fallback naar vereenvoudigde berekening
  let maandbedrag: number
  let jaarbedrag: number
  
  if (contract.exactMaandbedrag && contract.exactJaarbedrag) {
    // Exacte berekening al gedaan op resultaten pagina
    maandbedrag = contract.exactMaandbedrag
    jaarbedrag = contract.exactJaarbedrag
  } else {
    // Fallback naar vereenvoudigde berekening
    const berekend = berekenContractKostenVereenvoudigd(
      contract,
      verbruikElektriciteitNormaal,
      verbruikElektriciteitDal,
      verbruikGas,
      heeftEnkeleMeter,
      terugleveringJaar // NIEUW: teruglevering meegeven
    )
    maandbedrag = berekend.maandbedrag
    jaarbedrag = berekend.jaarbedrag
  }

  const leverancier = contract.leverancier || {}
  const details = contract.details_vast || contract.details_dynamisch || {}
  
  // Calculate besparing
  const totaalElektriciteit = verbruikElektriciteitNormaal + verbruikElektriciteitDal
  const gemiddeldeMaandbedrag = Math.round(((totaalElektriciteit * 0.35) + (verbruikGas * 1.50) + 700) / 12)
  const besparing = Math.max(0, gemiddeldeMaandbedrag - maandbedrag)

  return {
    id: contract.id,
    leverancier: {
      id: leverancier.id || '',
      naam: leverancier.naam || 'Onbekende leverancier',
      logo: leverancier.logo_url || '',
      website: leverancier.website || '',
      overLeverancier: leverancier.over_leverancier || undefined,
    },
    type: contract.type,
    looptijd: contract.type === 'vast' ? details.looptijd : 1,
    maandbedrag,
    jaarbedrag,
    tariefElektriciteit: details.tarief_elektriciteit_normaal || details.opslag_elektriciteit_normaal || 0,
    tariefElektriciteitEnkel: details.tarief_elektriciteit_enkel || undefined,
    tariefElektriciteitDal: details.tarief_elektriciteit_dal || undefined,
    tariefGas: details.tarief_gas || details.opslag_gas || 0,
    groeneEnergie: details.groene_energie || false,
    rating: details.rating || 0,
    aantalReviews: details.aantal_reviews || 0,
    voorwaarden: details.voorwaarden || [],
    opzegtermijn: details.opzegtermijn || 1,
    bijzonderheden: details.bijzonderheden || [],
    besparing,
    aanbevolen: contract.aanbevolen || false,
    populair: contract.populair || false,
    breakdown: contract.breakdown || undefined, // Breakdown voor prijsdetails
  }
}

function ResultatenContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verbruik, setVerbruik, voorkeuren, reset } = useCalculatorStore()
  
  const [resultaten, setResultaten] = useState<ContractOptie[]>([])
  const [filteredResultaten, setFilteredResultaten] = useState<ContractOptie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Filter states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [filters, setFilters] = useState({
    type: 'alle' as 'alle' | 'vast' | 'dynamisch',
    groeneEnergie: false,
    maxPrijs: 99999,
    minRating: 0,
  })
  const [sortBy, setSortBy] = useState<'prijs-laag' | 'prijs-hoog' | 'besparing' | 'rating'>('besparing')

  // Check if coming from quick calculator
  const isQuickCalc = searchParams?.get('quick') === 'true'
  
  // Handler for updating verbruik from EditPanel
  const handleVerbruikUpdate = async (newVerbruikData: VerbruikData) => {
    setIsUpdating(true)
    try {
      // Update store
      setVerbruik(newVerbruikData)
      
      // Reload resultaten with new data
      await loadResultaten(newVerbruikData)
      
      // Smooth scroll to results
      setTimeout(() => {
        window.scrollTo({ top: 400, behavior: 'smooth' })
      }, 300)
    } catch (err) {
      console.error('Error updating verbruik:', err)
      setError('Er ging iets mis bij het herberekenen. Probeer het opnieuw.')
    } finally {
      setIsUpdating(false)
    }
  }
  
  const loadResultaten = async (verbruikData?: VerbruikData) => {
    try {
      setLoading(true)
      setError(null)
      
      let data = verbruikData || verbruik
      
      console.log('🔍 DEBUG - Verbruik data from store:', data)
      
      // If coming from quick calc, data should be in store (set by QuickCalculator)
      // No longer use query params fallback - we always use the store
      if (!data && isQuickCalc) {
        // Fallback to localStorage if store is empty
        const quickData = localStorage.getItem('quickcalc-data')
        if (quickData) {
          const parsed = JSON.parse(quickData)
          data = parsed.verbruik
        }
      }
      
      if (!data?.elektriciteitNormaal) {
        router.push('/calculator')
        return
      }
      
      // Calculate total electricity and gas
      const elektriciteitNormaal = data.elektriciteitNormaal
      const elektriciteitDal = data.elektriciteitDal || 0
      const totaalGas = data.gasJaar || 0
      
      // Fetch active contracts from API
      const response = await fetch('/api/contracten/actief')
      if (!response.ok) {
        throw new Error('Failed to fetch contracts')
      }
      
      const { contracten } = await response.json()
      
      // Bereken EXACTE kosten voor alle contracten via API
      // Dit voorkomt dat elke card apart een API call moet doen
      const postcode = data.leveringsadressen?.[0]?.postcode || '0000AA'
      const aansluitwaardeElektriciteit = data.aansluitwaardeElektriciteit || '3x25A'
      const aansluitwaardeGas = data.aansluitwaardeGas || 'G6'
      
      // Debug log
      console.log('🔧 Aansluitwaarden voor berekening:', {
        elektriciteit: aansluitwaardeElektriciteit,
        gas: aansluitwaardeGas,
        vanData: {
          elektriciteit: data.aansluitwaardeElektriciteit,
          elektriciteitType: typeof data.aansluitwaardeElektriciteit,
          gas: data.aansluitwaardeGas,
          gasType: typeof data.aansluitwaardeGas,
          gasIsEmpty: data.aansluitwaardeGas === '',
          gasIsUndefined: data.aansluitwaardeGas === undefined,
          gasIsNull: data.aansluitwaardeGas === null,
        }
      })
      
      const contractenMetKosten = await Promise.all(
        contracten.map(async (contract: any) => {
          try {
            // Skip maatwerk
            if (contract.type === 'maatwerk') return null
            
            const details = contract.details_vast || contract.details_dynamisch || {}
            
            // Bereken exacte kosten via API
            // BELANGRIJK: gebruik USER input voor metertype, niet contract details!
            const heeftDubbeleMeter = data?.heeftEnkeleMeter === true ? false : !data?.heeftEnkeleMeter
            
            const kostenResponse = await fetch('/api/energie/bereken-contract', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                elektriciteitNormaal,
                elektriciteitDal,
                gas: totaalGas,
                terugleveringJaar: data?.terugleveringJaar || 0, // NIEUW: teruglevering
                aansluitwaardeElektriciteit,
                aansluitwaardeGas,
                postcode,
                contractType: contract.type,
                tariefElektriciteitNormaal: details.tarief_elektriciteit_normaal || details.opslag_elektriciteit_normaal || 0,
                tariefElektriciteitDal: details.tarief_elektriciteit_dal || 0,
                tariefElektriciteitEnkel: details.tarief_elektriciteit_enkel || 0,
                tariefGas: details.tarief_gas || details.opslag_gas || 0,
                tariefTerugleveringKwh: details.tarief_teruglevering_kwh || 0, // NIEUW: teruglevertarief
                vastrechtStroomMaand: details.vastrecht_stroom_maand || 4.00,
                vastrechtGasMaand: details.vastrecht_gas_maand || 4.00,
                heeftDubbeleMeter: heeftDubbeleMeter,
              }),
            })
            
            if (kostenResponse.ok) {
              const { breakdown } = await kostenResponse.json()
              return {
                ...contract,
                exactMaandbedrag: Math.round(breakdown.totaal.maandExclBtw),
                exactJaarbedrag: Math.round(breakdown.totaal.jaarExclBtw),
                breakdown: breakdown, // Bewaar hele breakdown voor prijsdetails
              }
            }
          } catch (err) {
            console.error('Error calculating costs for contract:', contract.id, err)
          }
          
          // Fallback naar vereenvoudigde berekening
          return contract
        })
      )
      
      // Filter null values (maatwerk)
      const validContracten = contractenMetKosten.filter((c: any) => c !== null)
      
      // Transform to ContractOptie format
      const transformed = validContracten
        .map((c: any) => transformContractToOptie(
          c, 
          elektriciteitNormaal, 
          elektriciteitDal, 
          totaalGas, 
          data?.heeftEnkeleMeter || false,
          data?.terugleveringJaar || 0 // NIEUW: teruglevering meegeven
        ))
        .filter((c: any) => c !== null) as ContractOptie[]
      
      setResultaten(transformed)
      setFilteredResultaten(transformed)
      setLoading(false)
    } catch (err) {
      console.error('Error loading resultaten:', err)
      setError('Er ging iets mis bij het ophalen van de resultaten. Probeer het opnieuw.')
      setLoading(false)
    }
  }
  
  // Load resultaten on mount
  useEffect(() => {
    loadResultaten()
  }, [isQuickCalc, searchParams, router])

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...resultaten]
    
    // Filter by type
    if (filters.type !== 'alle') {
      filtered = filtered.filter(r => r.type === filters.type)
    }
    
    // Filter by groene energie
    if (filters.groeneEnergie) {
      filtered = filtered.filter(r => r.groeneEnergie)
    }
    
    // Filter by max price
    filtered = filtered.filter(r => r.maandbedrag <= filters.maxPrijs)
    
    // Filter by min rating
    filtered = filtered.filter(r => r.rating >= filters.minRating)
    
    // Sort
    switch (sortBy) {
      case 'prijs-laag':
        filtered.sort((a, b) => a.maandbedrag - b.maandbedrag)
        break
      case 'prijs-hoog':
        filtered.sort((a, b) => b.maandbedrag - a.maandbedrag)
        break
      case 'besparing':
        filtered.sort((a, b) => (b.besparing || 0) - (a.besparing || 0))
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
    }
    
    setFilteredResultaten(filtered)
  }, [resultaten, filters, sortBy])

  const handleStartOpnieuw = () => {
    reset()
    localStorage.removeItem('quickcalc-data')
    router.push('/calculator')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-12">
        <div className="container-custom">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
              <div className="w-full h-full border-4 border-brand-teal-50 border-t-brand-teal-500 rounded-full animate-spin" />
            </div>
            <p className="text-lg text-gray-600">We zoeken de beste opties voor jou...</p>
            <p className="text-sm text-gray-500 mt-2">Dit duurt maar een paar seconden</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-12">
        <div className="container-custom max-w-2xl">
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X weight="bold" className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-brand-navy-500 mb-2">Er ging iets mis</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => window.location.reload()}>
                Probeer opnieuw
              </Button>
              <Button variant="outline" onClick={handleStartOpnieuw}>
                Start opnieuw
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const verbruikElektriciteit = ((verbruik?.elektriciteitNormaal || 0) + (verbruik?.elektriciteitDal || 0)) || parseInt(searchParams?.get('stroom') || '0')

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12">
      <div className="container-custom max-w-7xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-navy-500 mb-2">
                {filteredResultaten.length} {filteredResultaten.length === 1 ? 'passend contract' : 'passende contracten'}
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Op basis van {verbruikElektriciteit.toLocaleString()} kWh per jaar
                {verbruik?.leveringsadressen && verbruik.leveringsadressen.length > 1 && 
                  ` • ${verbruik.leveringsadressen.length} leveringsadressen`
                }
                {isQuickCalc && ' • Snelle scan'}
              </p>
            </div>
            <Button variant="outline" onClick={handleStartOpnieuw} className="w-full md:w-auto">
              <Lightning weight="bold" className="w-5 h-5 mr-2" />
              Start opnieuw
            </Button>
          </div>

          {/* Edit Verbruik Panel */}
          {verbruik && (
            <div className="mb-6">
              <EditVerbruikPanel
                currentData={verbruik}
                onUpdate={handleVerbruikUpdate}
                isUpdating={isUpdating}
              />
            </div>
          )}

          {/* Filters Bar - Compact by default */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-4">
            {/* Main row: Quick filters + Sort */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              {/* Quick filter buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilters({ ...filters, type: 'alle' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.type === 'alle'
                      ? 'bg-brand-teal-500 text-white shadow-md'
                      : 'bg-brand-navy-50 text-brand-navy-600 hover:bg-brand-navy-100'
                  }`}
                >
                  Alle
                </button>
                <button
                  onClick={() => setFilters({ ...filters, type: 'vast' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.type === 'vast'
                      ? 'bg-brand-teal-500 text-white shadow-md'
                      : 'bg-brand-navy-50 text-brand-navy-600 hover:bg-brand-navy-100'
                  }`}
                >
                  Vast
                </button>
                <button
                  onClick={() => setFilters({ ...filters, type: 'dynamisch' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.type === 'dynamisch'
                      ? 'bg-brand-teal-500 text-white shadow-md'
                      : 'bg-brand-navy-50 text-brand-navy-600 hover:bg-brand-navy-100'
                  }`}
                >
                  Dynamisch
                </button>
                <button
                  onClick={() => setFilters({ ...filters, groeneEnergie: !filters.groeneEnergie })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    filters.groeneEnergie
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Leaf weight="duotone" className="w-4 h-4" />
                  Groen
                </button>
                
                {/* Meer filters button */}
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center gap-2"
                >
                  <SlidersHorizontal weight="bold" className="w-4 h-4" />
                  Meer filters
                  {showAdvancedFilters ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Sort dropdown */}
              <div className="flex items-center gap-2">
                <ArrowsDownUp weight="bold" className="w-5 h-5 text-gray-500 hidden sm:block" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium text-brand-navy-600 focus:outline-none focus:ring-2 focus:ring-brand-teal-500 focus:border-transparent transition-all"
                >
                  <option value="besparing">Hoogste besparing</option>
                  <option value="prijs-laag">Laagste prijs</option>
                  <option value="prijs-hoog">Hoogste prijs</option>
                  <option value="rating">Beste beoordeling</option>
                </select>
              </div>
            </div>

            {/* Advanced filters (collapsible) */}
            {showAdvancedFilters && (
              <div className="pt-3 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-slide-down">
                {/* Rating filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Min. beoordeling</label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal-500 focus:border-transparent"
                  >
                    <option value="0">Alle</option>
                    <option value="4">4+ sterren</option>
                    <option value="4.5">4.5+ sterren</option>
                    <option value="4.8">4.8+ sterren</option>
                  </select>
                </div>

                {/* Dynamisch info link */}
                <div className="flex items-end">
                  <Link
                    href="/producten/dynamisch-contract"
                    className="w-full px-4 py-2 text-sm font-medium text-brand-teal-600 hover:text-brand-teal-700 hover:bg-brand-teal-50 rounded-lg transition-colors border-2 border-brand-teal-200 hover:border-brand-teal-300 flex items-center justify-center gap-2"
                  >
                    <Lightning weight="duotone" className="w-4 h-4" />
                    Hoe werkt dynamisch?
                  </Link>
                </div>

                {/* Reset filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({ type: 'alle', groeneEnergie: false, maxPrijs: 99999, minRating: 0 })}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-600 hover:text-brand-navy-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <X weight="bold" className="w-4 h-4 inline mr-1" />
                    Reset filters
                  </button>
                </div>
              </div>
            )}

            {/* Active filters count */}
            {(filters.type !== 'alle' || filters.groeneEnergie || filters.minRating > 0) && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-600">
                  {filteredResultaten.length} {filteredResultaten.length === 1 ? 'resultaat' : 'resultaten'} gevonden
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Results grid */}
        {filteredResultaten.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <p className="text-gray-600 mb-4">Geen contracten gevonden met deze filters</p>
            <Button variant="outline" onClick={() => setFilters({ type: 'alle', groeneEnergie: false, maxPrijs: 99999, minRating: 0 })}>
              Reset filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredResultaten.map((contract) => (
              <ContractCard 
                key={contract.id} 
                contract={contract}
                meterType={verbruik?.meterType || 'weet_niet'}
                heeftEnkeleMeter={verbruik?.heeftEnkeleMeter || false}
                verbruikElektriciteitNormaal={verbruik?.elektriciteitNormaal || 0}
                verbruikElektriciteitDal={verbruik?.elektriciteitDal || 0}
                verbruikGas={verbruik?.gasJaar || 0}
                terugleveringJaar={verbruik?.terugleveringJaar || 0}
                aansluitwaardeElektriciteit={verbruik?.aansluitwaardeElektriciteit || '3x25A'}
                aansluitwaardeGas={verbruik?.aansluitwaardeGas || 'G6'}
                postcode={verbruik?.leveringsadressen?.[0]?.postcode || ''}
              />
            ))}
          </div>
        )}

        {/* CTA section */}
        <div className="mt-12 bg-white rounded-2xl p-6 md:p-8 text-center shadow-md">
          <h2 className="text-xl md:text-2xl font-bold text-brand-navy-500 mb-3">
            Hulp nodig bij het kiezen?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto text-sm md:text-base">
            Onze energiespecialisten helpen je graag om het beste contract te vinden dat perfect bij
            jouw bedrijf past.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Link href="/contact?reason=advies">
              <Button className="w-full sm:w-auto">Vraag persoonlijk advies</Button>
            </Link>
            <Link href="tel:+31201234567">
              <Button variant="outline" className="w-full sm:w-auto">Bel 020 123 4567</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResultatenPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 pt-32 pb-12">
        <div className="container-custom">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
              <div className="w-full h-full border-4 border-brand-teal-50 border-t-brand-teal-500 rounded-full animate-spin" />
            </div>
            <p className="text-lg text-gray-600">Laden...</p>
          </div>
        </div>
      </div>
    }>
      <ResultatenContent />
    </Suspense>
  )
}
