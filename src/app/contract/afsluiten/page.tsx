'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Buildings, MagnifyingGlass, CheckCircle, XCircle, ShieldCheck, Phone, Envelope, User, CaretDown } from '@phosphor-icons/react'
import { Storefront, ForkKnife, Factory, FirstAid, GraduationCap, Briefcase, SquaresFour } from '@phosphor-icons/react'
import { useCalculatorStore } from '@/store/calculatorStore'

// Mock resultaten - later vervangen met echte data
const generateMockContract = (id: string) => {
  const contracts: any = {
    '1': {
      id: '1',
      leverancier: 'Groene Stroom',
      type: 'vast',
      looptijd: 3,
      maandbedrag: 285,
      jaarbedrag: 3420,
      besparing: 145,
      groeneEnergie: true,
    },
    '2': {
      id: '2',
      leverancier: 'Budget Energie',
      type: 'vast',
      looptijd: 1,
      maandbedrag: 275,
      jaarbedrag: 3300,
      besparing: 155,
      groeneEnergie: false,
    },
  }
  return contracts[id] || contracts['1']
}

interface KvkSearchResult {
  kvkNummer: string
  bedrijfsnaam: string
  plaats: string
  adres: string
}

function ContractAfsluitenContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const contractId = searchParams?.get('contract') || '1'
  const contract = generateMockContract(contractId)
  const { verbruik } = useCalculatorStore()

  // KvK lookup states
  const [kvkNummer, setKvkNummer] = useState('')
  const [kvkLoading, setKvkLoading] = useState(false)
  const [kvkError, setKvkError] = useState<string | null>(null)
  const [kvkSuccess, setKvkSuccess] = useState(false)

  // Autocomplete states
  const [bedrijfsnaamInput, setBedrijfsnaamInput] = useState('')
  const [searchResults, setSearchResults] = useState<KvkSearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    bedrijfsnaam: '',
    kvkNummer: '',
    straat: '',
    huisnummer: '',
    postcode: '',
    plaats: '',
    contactpersoon: '',
    email: '',
    telefoon: '',
    typeBedrijf: 'kantoor' as 'retail' | 'horeca' | 'kantoor' | 'productie' | 'gezondheidszorg' | 'onderwijs' | 'overig',
  })

  // Akkoorden
  const [akkoorden, setAkkoorden] = useState({
    voorwaarden: false,
    privacy: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search companies by name (debounced)
  const searchCompanies = async (query: string) => {
    console.log('🔍 [searchCompanies] START - Query:', query)
    
    if (query.length < 2) {
      console.log('❌ [searchCompanies] Query te kort (<2), stop')
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    console.log('⏳ [searchCompanies] Calling API...')
    setSearchLoading(true)
    
    try {
      const url = `/api/kvk/search?query=${encodeURIComponent(query)}`
      console.log('📡 [searchCompanies] URL:', url)
      
      const response = await fetch(url)
      console.log('📥 [searchCompanies] Response status:', response.status)
      
      const data = await response.json()
      console.log('📦 [searchCompanies] Response data:', data)

      if (response.ok && data.results) {
        console.log('✅ [searchCompanies] Success! Results count:', data.results.length)
        console.log('📋 [searchCompanies] Results:', data.results)
        setSearchResults(data.results)
        setShowDropdown(data.results.length > 0)
        console.log('🎯 [searchCompanies] Dropdown should be visible:', data.results.length > 0)
      } else {
        console.log('❌ [searchCompanies] No results or error')
        setSearchResults([])
        setShowDropdown(false)
      }
    } catch (error) {
      console.error('💥 [searchCompanies] Exception:', error)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
      console.log('🏁 [searchCompanies] END')
    }
  }

  // Handle bedrijfsnaam input change with debounce and KvK number detection
  const handleBedrijfsnaamChange = (value: string) => {
    console.log('⌨️ [handleBedrijfsnaamChange] Input value:', value)
    
    setBedrijfsnaamInput(value)
    setFormData({ ...formData, bedrijfsnaam: value })
    setSelectedIndex(-1)
    setKvkError(null)
    setKvkSuccess(false)

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      console.log('⏰ [handleBedrijfsnaamChange] Clearing previous timeout')
      clearTimeout(searchTimeoutRef.current)
    }

    // Als input leeg of te kort, reset alles
    if (value.length < 2) {
      console.log('❌ [handleBedrijfsnaamChange] Value te kort, reset')
      setSearchResults([])
      setShowDropdown(false)
      setKvkNummer('')
      return
    }

    console.log('⏲️ [handleBedrijfsnaamChange] Setting timeout (300ms) for search')
    
    // SIMPEL: Altijd search API aanroepen voor dropdown (werkt voor ALLES)
    // Dit toont dropdown voor:
    // - Bedrijfsnamen: "Coolblue", "Pakket"
    // - Gedeeltelijke KvK: "88929", "8092" 
    // - Volledige KvK: "88929280" (wordt ook gevonden in search)
    setKvkNummer('')
    
    searchTimeoutRef.current = setTimeout(() => {
      console.log('🚀 [handleBedrijfsnaamChange] Timeout fired! Calling searchCompanies...')
      searchCompanies(value)
    }, 300)
  }
  
  // Direct KvK lookup met waarde parameter (niet state)
  const fetchKvkDataDirect = async (kvkValue: string) => {
    if (!kvkValue || kvkValue.length !== 8) {
      setKvkError('Vul een geldig KvK-nummer in (8 cijfers)')
      return
    }

    setKvkLoading(true)
    setKvkError(null)
    setKvkSuccess(false)

    try {
      const response = await fetch(`/api/kvk?kvk=${kvkValue}`)
      const data = await response.json()

      if (!response.ok) {
        setKvkError(data.error || 'Kon bedrijf niet vinden')
        setKvkLoading(false)
        return
      }

      // Auto-fill form with KvK data
      if (data.bedrijfsnaam) {
        setBedrijfsnaamInput(data.bedrijfsnaam)
        setFormData(prev => ({ ...prev, bedrijfsnaam: data.bedrijfsnaam, kvkNummer: data.kvkNummer }))
      }
      
      if (data.correspondentieAdres) {
        setFormData(prev => ({
          ...prev,
          straat: data.correspondentieAdres.straat || '',
          huisnummer: data.correspondentieAdres.huisnummer || '',
          postcode: data.correspondentieAdres.postcode || '',
          plaats: data.correspondentieAdres.plaats || '',
        }))
      }
      
      setKvkSuccess(true)
      setTimeout(() => setKvkSuccess(false), 3000)
    } catch (error) {
      console.error('KvK fetch error:', error)
      setKvkError('Er ging iets mis. Probeer het opnieuw.')
    } finally {
      setKvkLoading(false)
    }
  }

  // Select company from dropdown
  const selectCompany = async (result: KvkSearchResult) => {
    setBedrijfsnaamInput(result.bedrijfsnaam)
    setFormData({ ...formData, bedrijfsnaam: result.bedrijfsnaam, kvkNummer: result.kvkNummer })
    setKvkNummer(result.kvkNummer)
    setShowDropdown(false)
    setSearchResults([])
    
    // Fetch full company data
    try {
      const response = await fetch(`/api/kvk?kvk=${result.kvkNummer}`)
      const data = await response.json()
      
      if (response.ok && data.correspondentieAdres) {
        setFormData(prev => ({
          ...prev,
          straat: data.correspondentieAdres.straat || '',
          huisnummer: data.correspondentieAdres.huisnummer || '',
          postcode: data.correspondentieAdres.postcode || '',
          plaats: data.correspondentieAdres.plaats || '',
        }))
      }
      
      setKvkSuccess(true)
      setTimeout(() => setKvkSuccess(false), 3000)
    } catch (error) {
      console.error('Error fetching company details:', error)
      setKvkSuccess(true)
      setTimeout(() => setKvkSuccess(false), 3000)
    }
  }

  // Fetch company data by KvK number
  const fetchKvkData = async () => {
    if (!kvkNummer || kvkNummer.length !== 8) {
      setKvkError('Vul een geldig KvK-nummer in (8 cijfers)')
      return
    }

    setKvkLoading(true)
    setKvkError(null)
    setKvkSuccess(false)

    try {
      const response = await fetch(`/api/kvk?kvk=${kvkNummer}`)
      const data = await response.json()

      if (!response.ok) {
        setKvkError(data.error || 'Kon bedrijf niet vinden')
        setKvkLoading(false)
        return
      }

      // Auto-fill form with KvK data
      if (data.bedrijfsnaam) {
        setBedrijfsnaamInput(data.bedrijfsnaam)
        setFormData(prev => ({ ...prev, bedrijfsnaam: data.bedrijfsnaam, kvkNummer: data.kvkNummer }))
      }
      
      if (data.correspondentieAdres) {
        setFormData(prev => ({
          ...prev,
          straat: data.correspondentieAdres.straat || '',
          huisnummer: data.correspondentieAdres.huisnummer || '',
          postcode: data.correspondentieAdres.postcode || '',
          plaats: data.correspondentieAdres.plaats || '',
        }))
      }

      setKvkSuccess(true)
      setKvkError(null)
      setKvkLoading(false)

      setTimeout(() => setKvkSuccess(false), 3000)
    } catch (error) {
      console.error('KvK fetch error:', error)
      setKvkError('Er ging iets mis. Probeer het opnieuw.')
      setKvkLoading(false)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || searchResults.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => 
        prev < searchResults.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      selectCompany(searchResults[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!akkoorden.voorwaarden || !akkoorden.privacy) {
      alert('Je moet akkoord gaan met de voorwaarden en het privacybeleid')
      return
    }

    setIsSubmitting(true)

    // Hier zou je de data naar de backend sturen
    const contractData = {
      contract: contract,
      verbruik: verbruik,
      bedrijfsgegevens: formData,
    }

    console.log('Contract data:', contractData)

    // Simuleer API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    router.push('/contract/bevestiging')
  }

  const alleVeldenIngevuld = 
    formData.bedrijfsnaam &&
    formData.contactpersoon &&
    formData.email &&
    formData.telefoon &&
    akkoorden.voorwaarden &&
    akkoorden.privacy

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-32 md:pt-36">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-navy-500 mb-2">
            Laatste stap: je bedrijfsgegevens
          </h1>
          <p className="text-lg text-gray-600">We hebben nog een paar gegevens nodig om je contract aan te vragen</p>
        </div>

        {/* Gekozen contract */}
        <Card className="mb-8 border-2 border-brand-teal-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle weight="duotone" className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-brand-navy-500">
                    {contract.leverancier}
                  </h3>
                  {contract.groeneEnergie && (
                    <Badge className="bg-green-100 text-green-700 border-green-200">Groen</Badge>
                  )}
                </div>
                <p className="text-gray-600 mb-3">
                  {contract.type === 'vast' ? 'Vast contract' : 'Dynamisch contract'} • {contract.looptijd} jaar
                </p>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-brand-navy-500">€{contract.maandbedrag}</span>
                  <span className="text-gray-500">/maand</span>
                  {contract.besparing && (
                    <span className="text-green-600 font-semibold">
                      • €{contract.besparing} besparing/maand
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Bedrijfsgegevens */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-brand-navy-500 rounded-xl flex items-center justify-center">
                  <Buildings weight="duotone" className="w-5 h-5 text-brand-teal-500" />
                </div>
                <h2 className="text-xl font-bold text-brand-navy-500">Bedrijfsgegevens</h2>
              </div>

              <div className="space-y-6">
                {/* Unified KvK Search - Naam OF Nummer */}
                <div className="bg-gradient-to-br from-brand-teal-50 to-brand-navy-50 border-2 border-brand-teal-200 rounded-xl p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Buildings weight="duotone" className="w-5 h-5 text-brand-teal-600" />
                      <h3 className="font-semibold text-brand-navy-500">Bedrijf opzoeken</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Zoek op bedrijfsnaam of KvK-nummer (8 cijfers) - we vullen automatisch je gegevens in
                    </p>
                    
                    <div className="relative" ref={dropdownRef}>
                      <div className="relative">
                        <input
                          type="text"
                          value={bedrijfsnaamInput}
                          onChange={(e) => handleBedrijfsnaamChange(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onFocus={() => {
                            if (searchResults.length > 0) setShowDropdown(true)
                          }}
                          placeholder="Typ bedrijfsnaam of 8-cijferig KvK-nummer..."
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all text-brand-navy-500 font-medium"
                          required
                        />
                        {searchLoading && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-5 h-5 border-2 border-brand-teal-300 border-t-brand-teal-600 rounded-full animate-spin" />
                          </div>
                        )}
                        {!searchLoading && showDropdown && searchResults.length > 0 && (
                          <CaretDown weight="bold" className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        )}
                      </div>

                      {/* Dropdown */}
                      {showDropdown && searchResults.length > 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-brand-teal-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                          {searchResults.map((result, index) => (
                            <button
                              key={result.kvkNummer}
                              type="button"
                              onClick={() => selectCompany(result)}
                              className={`w-full text-left px-4 py-3 hover:bg-brand-teal-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                index === selectedIndex ? 'bg-brand-teal-50' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-brand-navy-500 truncate">
                                    {result.bedrijfsnaam}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-0.5">
                                    KvK: {result.kvkNummer}
                                    {result.plaats && ` • ${result.plaats}`}
                                  </div>
                                </div>
                                <Buildings weight="duotone" className="w-5 h-5 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      <p className="mt-2 text-xs text-gray-500">
                        💡 Typ 2+ tekens voor zoeken • Ook voor gedeeltelijke KvK nummers!
                      </p>
                    </div>

                    {/* Success message */}
                    {kvkSuccess && (
                      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 animate-slide-down">
                        <CheckCircle weight="fill" className="w-5 h-5 flex-shrink-0" />
                        <span>Bedrijfsgegevens succesvol opgehaald!</span>
                      </div>
                    )}

                    {/* Error message */}
                    {kvkError && (
                      <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 animate-slide-down">
                        <XCircle weight="fill" className="w-5 h-5 flex-shrink-0" />
                        <span>{kvkError}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Adres velden (readonly als uit KvK) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Straatnaam"
                    value={formData.straat}
                    onChange={(e) => setFormData({ ...formData, straat: e.target.value })}
                    placeholder="Bijv. Weena"
                  />
                  <Input
                    label="Huisnummer"
                    value={formData.huisnummer}
                    onChange={(e) => setFormData({ ...formData, huisnummer: e.target.value })}
                    placeholder="Bijv. 664"
                  />
                  <Input
                    label="Postcode"
                    value={formData.postcode}
                    onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                    placeholder="Bijv. 3012CN"
                  />
                  <Input
                    label="Plaats"
                    value={formData.plaats}
                    onChange={(e) => setFormData({ ...formData, plaats: e.target.value })}
                    placeholder="Bijv. Rotterdam"
                  />
                </div>

                {/* Type bedrijf */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Type bedrijf <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { value: 'kantoor', label: 'Kantoor', icon: Briefcase },
                      { value: 'retail', label: 'Retail', icon: Storefront },
                      { value: 'horeca', label: 'Horeca', icon: ForkKnife },
                      { value: 'productie', label: 'Productie', icon: Factory },
                      { value: 'gezondheidszorg', label: 'Zorg', icon: FirstAid },
                      { value: 'onderwijs', label: 'Onderwijs', icon: GraduationCap },
                      { value: 'overig', label: 'Overig', icon: SquaresFour },
                    ].map((option) => {
                      const isSelected = formData.typeBedrijf === option.value
                      const Icon = option.icon
                      
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, typeBedrijf: option.value as any })}
                          className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-brand-teal-500 bg-brand-teal-50 shadow-lg shadow-brand-teal-500/20'
                              : 'border-gray-200 bg-white hover:border-brand-teal-300 hover:shadow-md'
                          }`}
                        >
                          <Icon 
                            weight="duotone" 
                            className={`w-8 h-8 mb-2 transition-colors ${
                              isSelected ? 'text-brand-teal-600' : 'text-gray-400'
                            }`}
                          />
                          <div className={`text-sm font-semibold ${isSelected ? 'text-brand-navy-500' : 'text-gray-700'}`}>
                            {option.label}
                          </div>
                          {isSelected && (
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-teal-600 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contactgegevens */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-brand-navy-500 rounded-xl flex items-center justify-center">
                  <User weight="duotone" className="w-5 h-5 text-brand-teal-500" />
                </div>
                <h2 className="text-xl font-bold text-brand-navy-500">Contactgegevens</h2>
              </div>

              <div className="space-y-4">
                <Input
                  label="Contactpersoon"
                  value={formData.contactpersoon}
                  onChange={(e) => setFormData({ ...formData, contactpersoon: e.target.value })}
                  placeholder="Voor- en achternaam"
                  required
                  icon={<User weight="duotone" className="w-5 h-5" />}
                />

                <Input
                  label="E-mailadres"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="naam@bedrijf.nl"
                  helpText="We sturen de contractbevestiging hier naartoe"
                  required
                  icon={<Envelope weight="duotone" className="w-5 h-5" />}
                />

                <Input
                  label="Telefoonnummer"
                  type="tel"
                  value={formData.telefoon}
                  onChange={(e) => setFormData({ ...formData, telefoon: e.target.value })}
                  placeholder="06 12345678"
                  helpText="Voor eventuele vragen over je contract"
                  required
                  icon={<Phone weight="duotone" className="w-5 h-5" />}
                />
              </div>
            </CardContent>
          </Card>

          {/* Akkoorden */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-brand-navy-500 rounded-xl flex items-center justify-center">
                  <ShieldCheck weight="duotone" className="w-5 h-5 text-brand-teal-500" />
                </div>
                <h2 className="text-xl font-bold text-brand-navy-500">Akkoord en privacyverklaring</h2>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={akkoorden.voorwaarden}
                    onChange={(e) => setAkkoorden({ ...akkoorden, voorwaarden: e.target.checked })}
                    className="w-5 h-5 mt-0.5 rounded-md text-brand-teal-500 border-gray-300 focus:ring-brand-teal-500 cursor-pointer"
                    required
                  />
                  <div>
                    <span className="text-sm font-medium text-brand-navy-500">
                      Ik heb de algemene voorwaarden gelezen en ga akkoord
                    </span>
                    <button
                      type="button"
                      className="block text-xs text-brand-teal-500 hover:underline mt-1"
                    >
                      Lees algemene voorwaarden
                    </button>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={akkoorden.privacy}
                    onChange={(e) => setAkkoorden({ ...akkoorden, privacy: e.target.checked })}
                    className="w-5 h-5 mt-0.5 rounded-md text-brand-teal-500 border-gray-300 focus:ring-brand-teal-500 cursor-pointer"
                    required
                  />
                  <div>
                    <span className="text-sm font-medium text-brand-navy-500">
                      Ik geef toestemming voor verwerking van mijn gegevens conform het privacybeleid
                    </span>
                    <button
                      type="button"
                      className="block text-xs text-brand-teal-500 hover:underline mt-1"
                    >
                      Lees privacybeleid
                    </button>
                  </div>
                </label>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck weight="duotone" className="w-5 h-5 text-brand-teal-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Je gegevens worden veilig verwerkt en alleen gebruikt voor het afsluiten van je energiecontract. 
                      We delen je gegevens niet met derden zonder jouw toestemming.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              type="button" 
              variant="outline" 
              size="lg" 
              onClick={() => router.back()}
              className="w-full sm:flex-1"
            >
              Terug naar resultaten
            </Button>
            <Button 
              type="submit" 
              size="lg" 
              disabled={!alleVeldenIngevuld || isSubmitting}
              className="w-full sm:flex-1 bg-brand-teal-500 hover:bg-brand-teal-600"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Bezig...
                </>
              ) : (
                'Contract aanvragen'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ContractAfsluitenPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-teal-50 border-t-brand-teal-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    }>
      <ContractAfsluitenContent />
    </Suspense>
  )
}
