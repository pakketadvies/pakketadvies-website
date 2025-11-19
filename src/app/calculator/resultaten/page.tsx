'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useCalculatorStore } from '@/store/calculatorStore'
import { Lightning, SlidersHorizontal, X, Check, Star, ArrowsDownUp, Leaf } from '@phosphor-icons/react'
import Link from 'next/link'
import type { ContractOptie } from '@/types/calculator'

// Mock data voor demonstratie - Later vervangen met admin data
const generateMockResultaten = (verbruikElektriciteit: number, verbruikGas: number): ContractOptie[] => {
  const basePrice = (verbruikElektriciteit * 0.28 + verbruikGas * 1.15) / 12
  
  return [
    {
      id: '1',
      leverancier: {
        id: 'gs',
        naam: 'Groene Stroom',
        logo: '/logos/groene-stroom.svg',
        website: 'https://groenestroom.nl',
      },
      type: 'vast',
      looptijd: 3,
      maandbedrag: Math.round(basePrice * 0.92),
      jaarbedrag: Math.round(basePrice * 0.92 * 12),
      tariefElektriciteit: 0.28,
      tariefGas: 1.15,
      groeneEnergie: true,
      rating: 4.8,
      aantalReviews: 253,
      voorwaarden: ['Prijsgarantie 3 jaar', 'Geen opstapkosten', '1 maand opzegtermijn'],
      opzegtermijn: 1,
      bijzonderheden: ['100% Nederlandse windenergie', 'CO2-neutraal'],
      besparing: Math.round(basePrice * 0.08),
      aanbevolen: true,
    },
    {
      id: '2',
      leverancier: {
        id: 'be',
        naam: 'Budget Energie',
        logo: '/logos/budget-energie.svg',
        website: 'https://budgetenergie.nl',
      },
      type: 'vast',
      looptijd: 1,
      maandbedrag: Math.round(basePrice * 0.89),
      jaarbedrag: Math.round(basePrice * 0.89 * 12),
      tariefElektriciteit: 0.26,
      tariefGas: 1.10,
      groeneEnergie: false,
      rating: 4.5,
      aantalReviews: 182,
      voorwaarden: ['Prijsgarantie 1 jaar', 'Geen opstapkosten'],
      opzegtermijn: 1,
      bijzonderheden: ['Laagste prijs garantie'],
      besparing: Math.round(basePrice * 0.11),
    },
    {
      id: '3',
      leverancier: {
        id: 'eneco',
        naam: 'Eneco Zakelijk',
        logo: '/logos/eneco.svg',
        website: 'https://eneco.nl',
      },
      type: 'dynamisch',
      looptijd: 1,
      maandbedrag: Math.round(basePrice * 0.95),
      jaarbedrag: Math.round(basePrice * 0.95 * 12),
      tariefElektriciteit: 0.29,
      tariefGas: 1.18,
      groeneEnergie: true,
      rating: 4.9,
      aantalReviews: 421,
      voorwaarden: ['Variabel tarief', 'Geen opstapkosten', 'Maandelijks opzegbaar'],
      opzegtermijn: 1,
      bijzonderheden: ['Slimme laadpaal integratie', 'App voor realtime inzicht', 'Profiteer van daluren'],
      besparing: Math.round(basePrice * 0.05),
      populair: true,
    },
    {
      id: '4',
      leverancier: {
        id: 've',
        naam: 'Vattenfall',
        logo: '/logos/vattenfall.svg',
        website: 'https://vattenfall.nl',
      },
      type: 'vast',
      looptijd: 5,
      maandbedrag: Math.round(basePrice * 0.87),
      jaarbedrag: Math.round(basePrice * 0.87 * 12),
      tariefElektriciteit: 0.25,
      tariefGas: 1.08,
      groeneEnergie: true,
      rating: 4.7,
      aantalReviews: 315,
      voorwaarden: ['Prijsgarantie 5 jaar', 'Geen opstapkosten', '2 maanden opzegtermijn'],
      opzegtermijn: 2,
      bijzonderheden: ['Langste zekerheid', 'Gratis energiescan'],
      besparing: Math.round(basePrice * 0.13),
    },
    {
      id: '5',
      leverancier: {
        id: 'es',
        naam: 'Essent',
        logo: '/logos/essent.svg',
        website: 'https://essent.nl',
      },
      type: 'dynamisch',
      looptijd: 1,
      maandbedrag: Math.round(basePrice * 0.93),
      jaarbedrag: Math.round(basePrice * 0.93 * 12),
      tariefElektriciteit: 0.27,
      tariefGas: 1.16,
      groeneEnergie: false,
      rating: 4.6,
      aantalReviews: 198,
      voorwaarden: ['Variabel tarief', 'Geen opstapkosten', 'Maandelijks opzegbaar'],
      opzegtermijn: 1,
      bijzonderheden: ['24/7 klantenservice', 'Smart meter compatible'],
      besparing: Math.round(basePrice * 0.07),
    },
  ]
}

function ResultatenContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verbruik, voorkeuren, reset } = useCalculatorStore()
  
  const [resultaten, setResultaten] = useState<ContractOptie[]>([])
  const [filteredResultaten, setFilteredResultaten] = useState<ContractOptie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
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
  
  useEffect(() => {
    const loadResultaten = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800))
        
        let verbruikData = verbruik
        
        // If coming from quick calc, use query params or localStorage
        if (isQuickCalc) {
          const stroom = parseInt(searchParams?.get('stroom') || '0')
          const gas = parseInt(searchParams?.get('gas') || '0')
          
          if (stroom && gas) {
            verbruikData = {
              elektriciteitNormaal: Math.round(stroom * 0.6), // 60% normaal
              elektriciteitDal: Math.round(stroom * 0.4), // 40% dal (typische verdeling)
              heeftEnkeleMeter: false,
              gasJaar: gas,
              geenGasaansluiting: false,
              heeftZonnepanelen: false,
              terugleveringJaar: null,
              meterType: 'weet_niet',
              leveringsadressen: [{ postcode: '0000 XX', huisnummer: '1' }],
              geschat: true,
            }
          } else {
            // Fallback to localStorage
            const quickData = localStorage.getItem('quickcalc-data')
            if (quickData) {
              const parsed = JSON.parse(quickData)
              verbruikData = parsed.verbruik
            }
          }
        }
        
        if (!verbruikData?.elektriciteitNormaal) {
          router.push('/calculator')
          return
        }
        
        // Calculate total electricity
        const totaalElektriciteit = verbruikData.elektriciteitNormaal + (verbruikData.elektriciteitDal || 0)
        
        const mockData = generateMockResultaten(
          totaalElektriciteit,
          verbruikData.gasJaar || 0
        )
        
        setResultaten(mockData)
        setFilteredResultaten(mockData)
        setLoading(false)
      } catch (err) {
        setError('Er ging iets mis bij het ophalen van de resultaten. Probeer het opnieuw.')
        setLoading(false)
      }
    }
    
    loadResultaten()
  }, [verbruik, isQuickCalc, searchParams, router])

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
              <Card
                key={contract.id}
                className={`relative hover:shadow-xl transition-shadow duration-300 ${
                  contract.aanbevolen ? 'ring-2 ring-brand-teal-500' : ''
                }`}
              >
                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                  {contract.aanbevolen && (
                    <Badge variant="success" className="shadow-lg">
                      <Check weight="bold" className="w-3 h-3 mr-1" />
                      Aanbevolen
                    </Badge>
                  )}
                  {contract.populair && (
                    <Badge variant="info" className="shadow-lg">
                      <Star weight="fill" className="w-3 h-3 mr-1" />
                      Populair
                    </Badge>
                  )}
                  {contract.groeneEnergie && (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <Leaf weight="duotone" className="w-3 h-3 mr-1" />
                      Groen
                    </Badge>
                  )}
                </div>

                <CardContent className="pt-6">
                  {/* Leverancier */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-brand-navy-500">
                      {contract.leverancier.naam}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {contract.type === 'vast' ? 'Vast contract' : 'Dynamisch contract'} • {contract.looptijd} jaar
                    </p>
                  </div>

                  {/* Prijs */}
                  <div className="mb-6 pb-6 border-b-2 border-gray-100">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-4xl font-bold text-brand-navy-500">
                        €{contract.maandbedrag}
                      </span>
                      <span className="text-gray-500">/maand</span>
                    </div>
                    <div className="text-sm text-gray-500 mb-3">
                      €{contract.jaarbedrag.toLocaleString()} per jaar
                    </div>
                    {contract.besparing && contract.besparing > 0 && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-semibold text-sm">
                        <Check weight="bold" className="w-4 h-4" />
                        <span>€{contract.besparing} besparing/maand</span>
                      </div>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          weight={i < Math.floor(contract.rating) ? 'fill' : 'regular'}
                          className={`w-4 h-4 ${
                            i < Math.floor(contract.rating)
                              ? 'text-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {contract.rating} ({contract.aantalReviews})
                    </span>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {contract.voorwaarden.slice(0, 3).map((vw, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check weight="bold" className="w-4 h-4 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                        <span>{vw}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-4 border-t-2 border-gray-100">
                    <Link href={`/contract/afsluiten?contract=${contract.id}`}>
                      <Button className="w-full bg-brand-teal-500 hover:bg-brand-teal-600">
                        Kies dit contract
                      </Button>
                    </Link>
                    <Link href={`/producten/${contract.type}-contract`}>
                      <button className="w-full text-gray-600 py-2 text-sm font-medium hover:text-brand-teal-600 transition-colors">
                        Meer informatie
                      </button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
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
