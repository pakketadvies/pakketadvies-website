'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect, useRef, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCalculatorStore } from '@/store/calculatorStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Buildings, ShieldCheck, MagnifyingGlass, CheckCircle, XCircle, CaretDown, MapPin, Warning, House, CreditCard, Calendar, User, Envelope, Phone, ArrowsClockwise } from '@phosphor-icons/react'
import { Storefront, ForkKnife, Factory, FirstAid, GraduationCap, Briefcase, SquaresFour } from '@phosphor-icons/react'
import { bepaalContractType } from '@/lib/contract-type'
import { ParticulierAanvraagForm } from './ParticulierAanvraagForm'
import { IbanCalculator } from '@/components/ui/IbanCalculator'

const bedrijfsgegevensSchema = z.object({
  // Klant check
  isKlantBijLeverancier: z.boolean(),
  
  // Bedrijfsgegevens
  kvkNummer: z.string().optional(),
  bedrijfsnaam: z.string().min(2, 'Vul een geldige bedrijfsnaam in'),
  
  // Persoonlijke gegevens
  aanhef: z.enum(['dhr', 'mevr']),
  voornaam: z.string().min(2, 'Vul je voornaam in'),
  voorletters: z.string().optional(),
  tussenvoegsel: z.string().optional(),
  achternaam: z.string().min(2, 'Vul je achternaam in'),
  geboortedatum: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, 'Vul een geldige geboortedatum in (dd-mm-jjjj)'),
  telefoon: z.string().regex(/^[\d\s\-+()]+$/, 'Vul een geldig telefoonnummer in'),
  email: z.string().email('Vul een geldig e-mailadres in'),
  herhaalEmail: z.string().email('Vul een geldig e-mailadres in'),
  
  // IBAN
  iban: z.string().min(15, 'Vul een geldig IBAN in'),
  
  // Levering
  heeftVerblijfsfunctie: z.boolean(),
  gaatVerhuizen: z.boolean(),
  wanneerOverstappen: z.enum(['zo_snel_mogelijk', 'na_contract_verlopen']),
  
  // Legacy velden (voor backward compatibility)
  contactpersoon: z.string().optional(), // Wordt nu vervangen door voornaam + achternaam
  typeBedrijf: z.enum(['retail', 'horeca', 'kantoor', 'productie', 'gezondheidszorg', 'onderwijs', 'overig']).optional(),
  
  // Correspondentieadres (verplicht)
  correspondentieStraat: z.string().min(2, 'Vul een straatnaam in'),
  correspondentieHuisnummer: z.string().min(1, 'Vul een huisnummer in'),
  correspondentiePostcode: z.string().regex(/^\d{4}\s?[A-Z]{2}$/i, 'Vul een geldige postcode in'),
  correspondentiePlaats: z.string().min(2, 'Vul een plaatsnaam in'),
  
  // Akkoorden
  voorwaarden: z.boolean().refine(val => val === true, 'Je moet akkoord gaan met de voorwaarden'),
  privacy: z.boolean().refine(val => val === true, 'Je moet akkoord gaan met het privacybeleid'),
  herinneringContract: z.boolean(),
  nieuwsbrief: z.boolean(),
}).refine(data => data.email === data.herhaalEmail, {
  message: 'E-mailadressen komen niet overeen',
  path: ['herhaalEmail'],
})

type BedrijfsgegevensFormData = z.infer<typeof bedrijfsgegevensSchema>

interface KvkSearchResult {
  kvkNummer: string
  bedrijfsnaam: string
  plaats: string
  adres: string
}

function BedrijfsgegevensFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setBedrijfsgegevens, vorigeStap, verbruik, selectedContract, resultaten, setVerbruik, setAddressType } = useCalculatorStore()
  
  // Haal contract op uit query param of store
  const contractId = searchParams?.get('contract')
  const contract = selectedContract || (contractId && resultaten?.find(c => c.id === contractId)) || null
  
  // Debug logging
  console.log('🔍 BedrijfsgegevensForm - Contract:', contract?.id, 'targetAudience:', contract?.targetAudience)
  console.log('🔍 BedrijfsgegevensForm - Verbruik:', verbruik ? { addressType: verbruik.addressType } : 'null')
  
  // Bepaal contract type
  const contractType = bepaalContractType(contract, verbruik)
  
  console.log('🔍 BedrijfsgegevensForm - Bepaald contract type:', contractType)
  
  // Als particulier, render particulier formulier
  if (contractType === 'particulier') {
    return <ParticulierAanvraagForm contract={contract} />
  }
  
  // Anders: zakelijk formulier (bestaande logica)
  
  // KvK number lookup states
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
  
  // Correspondentieadres checkbox
  const [zelfdeAlsLeveradres, setZelfdeAlsLeveradres] = useState(false)
  
  // IBAN Calculator modal
  const [showIbanCalculator, setShowIbanCalculator] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BedrijfsgegevensFormData>({
    resolver: zodResolver(bedrijfsgegevensSchema),
    defaultValues: {
      typeBedrijf: 'kantoor',
      isKlantBijLeverancier: false,
      aanhef: 'dhr',
      heeftVerblijfsfunctie: true,
      gaatVerhuizen: false,
      wanneerOverstappen: 'zo_snel_mogelijk',
      voorwaarden: false,
      privacy: false,
      herinneringContract: false,
      nieuwsbrief: false,
    },
  })

  const typeBedrijf = watch('typeBedrijf')

  // Copy leveradres to correspondentie when checkbox is checked
  useEffect(() => {
    if (zelfdeAlsLeveradres && verbruik && verbruik.leveringsadressen.length > 0) {
      const leveradres = verbruik.leveringsadressen[0]
      setValue('correspondentieStraat', leveradres.straat || '')
      setValue('correspondentieHuisnummer', leveradres.huisnummer)
      setValue('correspondentiePostcode', leveradres.postcode)
      setValue('correspondentiePlaats', leveradres.plaats || '')
    }
  }, [zelfdeAlsLeveradres, verbruik, setValue])

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
    setValue('bedrijfsnaam', value)
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
    setKvkNummer('') // Reset KvK nummer
    
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
        setValue('bedrijfsnaam', data.bedrijfsnaam)
      }
      if (data.kvkNummer) {
        setValue('kvkNummer', data.kvkNummer)
        setKvkNummer(data.kvkNummer)
      }
      // Auto-fill correspondentieadres
      if (data.correspondentieAdres) {
        setValue('correspondentieStraat', data.correspondentieAdres.straat || '')
        setValue('correspondentieHuisnummer', data.correspondentieAdres.huisnummer || '')
        setValue('correspondentiePostcode', data.correspondentieAdres.postcode || '')
        setValue('correspondentiePlaats', data.correspondentieAdres.plaats || '')
      }
      
      setKvkSuccess(true)
      setKvkLoading(false)
      
      // Hide success message after 3 seconds
      setTimeout(() => setKvkSuccess(false), 3000)
    } catch (error) {
      console.error('KvK fetch error:', error)
      setKvkError('Er ging iets mis. Probeer het opnieuw.')
      setKvkLoading(false)
    }
  }

  // Select company from dropdown
  const selectCompany = async (result: KvkSearchResult) => {
    setBedrijfsnaamInput(result.bedrijfsnaam)
    setValue('bedrijfsnaam', result.bedrijfsnaam)
    setKvkNummer(result.kvkNummer)
    setValue('kvkNummer', result.kvkNummer)
    setShowDropdown(false)
    setSearchResults([])
    
    // Fetch full company data including correspondentieadres
    try {
      const response = await fetch(`/api/kvk?kvk=${result.kvkNummer}`)
      const data = await response.json()
      
      if (response.ok && data.correspondentieAdres) {
        setValue('correspondentieStraat', data.correspondentieAdres.straat || '')
        setValue('correspondentieHuisnummer', data.correspondentieAdres.huisnummer || '')
        setValue('correspondentiePostcode', data.correspondentieAdres.postcode || '')
        setValue('correspondentiePlaats', data.correspondentieAdres.plaats || '')
      }
      
      setKvkSuccess(true)
      setTimeout(() => setKvkSuccess(false), 3000)
    } catch (error) {
      console.error('Error fetching company details:', error)
      // Still show success for name/kvk, but no address
      setKvkSuccess(true)
      setTimeout(() => setKvkSuccess(false), 3000)
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
        setValue('bedrijfsnaam', data.bedrijfsnaam)
      }
      if (data.kvkNummer) {
        setValue('kvkNummer', data.kvkNummer)
      }
      // Auto-fill correspondentieadres
      if (data.correspondentieAdres) {
        setValue('correspondentieStraat', data.correspondentieAdres.straat || '')
        setValue('correspondentieHuisnummer', data.correspondentieAdres.huisnummer || '')
        setValue('correspondentiePostcode', data.correspondentieAdres.postcode || '')
        setValue('correspondentiePlaats', data.correspondentieAdres.plaats || '')
      }

      setKvkSuccess(true)
      setKvkError(null)
      setKvkLoading(false)

      // Show success message briefly
      setTimeout(() => setKvkSuccess(false), 3000)
    } catch (error) {
      console.error('KvK fetch error:', error)
      setKvkError('Er ging iets mis. Probeer het opnieuw.')
      setKvkLoading(false)
    }
  }

  const onSubmit = (data: BedrijfsgegevensFormData) => {
    // Transform form data to BedrijfsGegevens format
    setBedrijfsgegevens({
      bedrijfsnaam: data.bedrijfsnaam,
      contactpersoon: `${data.voornaam} ${data.tussenvoegsel ? data.tussenvoegsel + ' ' : ''}${data.achternaam}`.trim(),
      email: data.email,
      telefoon: data.telefoon,
      kvkNummer: kvkNummer || data.kvkNummer || undefined,
      typeBedrijf: data.typeBedrijf || 'overig',
    })
    // Ga naar bevestigingspagina (contract is al gekozen op resultaten pagina)
    router.push('/contract/bevestiging')
  }

  const leverancierNaam = contract?.leverancier.naam || 'Energieleverancier'
  const contractNaam = contract?.contractNaam || `${contract?.type === 'vast' ? 'Vast' : 'Dynamisch'} contract`
  const heeftVerblijfsfunctie = watch('heeftVerblijfsfunctie')
  const gaatVerhuizen = watch('gaatVerhuizen')
  const leveringsadres = verbruik?.leveringsadressen?.[0] || null

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
      {/* Header: Meld u nu aan */}
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-brand-navy-500 mb-2">
          Meld u nu aan bij {leverancierNaam}
        </h2>
        <p className="text-base md:text-lg text-gray-600">
          Meld u nu aan voor {contractNaam}. {leverancierNaam} verzorgt uw volledige overstap. 
          Uw bedrijf komt geen moment zonder stroom en gas te zitten.
        </p>
      </div>

      {/* Bent u momenteel klant? */}
      <div className="md:bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm">
        <div className="p-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Bent u momenteel klant bij {leverancierNaam}?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors flex-1">
                <input
                  type="radio"
                  value="ja"
                  checked={watch('isKlantBijLeverancier') === true}
                  onChange={() => setValue('isKlantBijLeverancier', true)}
                  className="w-5 h-5 text-brand-teal-500"
                />
                <span className="font-medium">Ja</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors flex-1">
                <input
                  type="radio"
                  value="nee"
                  checked={watch('isKlantBijLeverancier') === false}
                  onChange={() => setValue('isKlantBijLeverancier', false)}
                  className="w-5 h-5 text-brand-teal-500"
                />
                <span className="font-medium">Nee</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Leveringsadres */}
      <div className="md:bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-teal-500 rounded-xl flex items-center justify-center">
              <MapPin weight="duotone" className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-brand-navy-500">Leveringsadres</h2>
          </div>

          {leveringsadres ? (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
              <div className="font-semibold text-brand-navy-500 mb-1">
                {leveringsadres.straat} {leveringsadres.huisnummer}
                {leveringsadres.toevoeging ? ` ${leveringsadres.toevoeging}` : ''}
              </div>
              <div className="text-gray-600">
                {leveringsadres.postcode} {leveringsadres.plaats}
              </div>
              <button
                type="button"
                className="text-sm text-brand-teal-600 hover:text-brand-teal-700 font-semibold underline mt-2"
              >
                Adres wijzigen
              </button>
            </div>
          ) : (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-red-700">Geen leveringsadres gevonden. Ga terug naar stap 1 om een adres in te vullen.</p>
            </div>
          )}
        </div>
      </div>

      {/* Unified KvK Search - Naam OF Nummer */}
      <div className="bg-gradient-to-br from-brand-teal-50 to-brand-navy-50 border-2 border-brand-teal-200 rounded-xl md:rounded-2xl p-4 md:p-6">
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
            className={`w-full px-4 py-3 rounded-xl border-2 ${
              errors.bedrijfsnaam 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-brand-teal-500'
                } focus:ring-2 focus:ring-brand-teal-500/20 transition-all text-brand-navy-500 font-medium`}
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

        {errors.bedrijfsnaam && (
          <p className="mt-2 text-sm text-red-600">{errors.bedrijfsnaam.message}</p>
        )}
            
        <p className="mt-2 text-xs text-gray-500">
              💡 Typ je KvK-nummer of bedrijfsnaam om te zoeken
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

      {/* Correspondentieadres */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Buildings weight="duotone" className="w-5 h-5 text-brand-navy-500" />
          <h3 className="text-lg font-semibold text-brand-navy-500">Correspondentieadres</h3>
        </div>

        {/* Checkbox: Zelfde als leveradres */}
        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors border-2 border-gray-200">
            <input
              type="checkbox"
              checked={zelfdeAlsLeveradres}
              onChange={(e) => setZelfdeAlsLeveradres(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-brand-teal-300 text-brand-teal-600 focus:ring-brand-teal-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Zelfde als leveradres
            </span>
          </label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Straatnaam"
              placeholder="Bijv. Weena"
              {...register('correspondentieStraat')}
              disabled={zelfdeAlsLeveradres}
              required
            />
          </div>
          <div>
            <Input
              label="Huisnummer"
              placeholder="Bijv. 664"
              {...register('correspondentieHuisnummer')}
              disabled={zelfdeAlsLeveradres}
              required
            />
          </div>
          <div>
            <Input
              label="Postcode"
              placeholder="Bijv. 3012CN"
              {...register('correspondentiePostcode')}
              disabled={zelfdeAlsLeveradres}
              required
            />
          </div>
          <div>
            <Input
              label="Plaats"
              placeholder="Bijv. Rotterdam"
              {...register('correspondentiePlaats')}
              disabled={zelfdeAlsLeveradres}
              required
            />
          </div>
        </div>
      </div>

      {/* Uw gegevens - Persoonlijke gegevens */}
      <div className="md:bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-teal-500 rounded-xl flex items-center justify-center">
              <User weight="duotone" className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-brand-navy-500">Uw gegevens</h2>
          </div>

          <div className="space-y-4">
            {/* Aanhef */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Aanhef <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors flex-1">
                  <input
                    type="radio"
                    value="dhr"
                    {...register('aanhef')}
                    className="w-5 h-5 text-brand-teal-500"
                  />
                  <span className="font-medium">Dhr.</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors flex-1">
                  <input
                    type="radio"
                    value="mevr"
                    {...register('aanhef')}
                    className="w-5 h-5 text-brand-teal-500"
                  />
                  <span className="font-medium">Mevr.</span>
                </label>
              </div>
            </div>

            {/* Voornaam */}
            <Input
              label="Voornaam"
              {...register('voornaam')}
              error={errors.voornaam?.message}
              placeholder="Jan"
              required
              icon={<User weight="duotone" className="w-5 h-5" />}
            />

            {/* Voorletters */}
            <Input
              label="Voorletters"
              {...register('voorletters')}
              error={errors.voorletters?.message}
              placeholder="bijv. J.H."
              helpText="De eerste letter(s) van uw voornaam"
            />

            {/* Tussenvoegsel */}
            <Input
              label="Tussenvoegsel"
              {...register('tussenvoegsel')}
              error={errors.tussenvoegsel?.message}
              placeholder="van"
            />

            {/* Achternaam */}
            <Input
              label="Achternaam"
              {...register('achternaam')}
              error={errors.achternaam?.message}
              placeholder="Jansen"
              required
            />

            {/* Geboortedatum */}
            <Input
              label="Geboortedatum"
              {...register('geboortedatum')}
              error={errors.geboortedatum?.message}
              placeholder="bijv. 15-01-1970"
              required
              icon={<Calendar weight="duotone" className="w-5 h-5" />}
            />

            {/* Telefoonnummer */}
            <Input
              label="Telefoonnummer"
              type="tel"
              {...register('telefoon')}
              error={errors.telefoon?.message}
              placeholder="bijv. 0612345678"
              required
              icon={<Phone weight="duotone" className="w-5 h-5" />}
            />

            {/* E-mailadres */}
            <Input
              label="E-mailadres"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="naam@bedrijf.nl"
              required
              icon={<Envelope weight="duotone" className="w-5 h-5" />}
            />

            {/* Herhaal e-mailadres */}
            <Input
              label="Herhaal e-mailadres"
              type="email"
              {...register('herhaalEmail')}
              error={errors.herhaalEmail?.message}
              placeholder="naam@bedrijf.nl"
              required
              icon={<Envelope weight="duotone" className="w-5 h-5" />}
            />
          </div>
        </div>
      </div>

      {/* Type bedrijf */}
      <div className="space-y-4">
        <label className="block text-sm md:text-base font-semibold text-gray-700">
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
            const isSelected = typeBedrijf === option.value
            const Icon = option.icon
            
            return (
              <label
                key={option.value}
                className={`
                  relative flex flex-col items-center justify-center p-4 md:p-5 rounded-xl md:rounded-2xl border-2 cursor-pointer transition-all duration-300
                  ${isSelected 
                    ? 'border-brand-teal-500 bg-brand-teal-50 shadow-lg shadow-brand-teal-500/20' 
                    : 'border-gray-200 bg-white hover:border-brand-teal-300 hover:shadow-md'
                  }
                `}
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register('typeBedrijf')}
                  className="sr-only"
                />
                <Icon 
                  weight="duotone" 
                  className={`w-8 h-8 md:w-10 md:h-10 mb-2 transition-colors ${
                    isSelected ? 'text-brand-teal-600' : 'text-gray-400'
                  }`}
                />
                <div className={`text-sm md:text-base font-semibold ${isSelected ? 'text-brand-navy-500' : 'text-gray-700'}`}>
                  {option.label}
                </div>
                
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 bg-brand-teal-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </label>
            )
          })}
        </div>
      </div>

      {/* Maandelijkse betaling */}
      <div className="md:bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-teal-500 rounded-xl flex items-center justify-center">
              <CreditCard weight="duotone" className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-brand-navy-500">Maandelijkse betaling</h2>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Bij {leverancierNaam} betaalt u standaard via automatische incasso.
            </p>

            {/* IBAN */}
            <div>
              <Input
                label="IBAN (rekeningnummer)"
                {...register('iban')}
                error={errors.iban?.message}
                placeholder="NL91ABNA0417164300"
                required
                icon={<CreditCard weight="duotone" className="w-5 h-5" />}
              />
              <button
                type="button"
                onClick={() => setShowIbanCalculator(true)}
                className="text-xs text-brand-teal-600 hover:text-brand-teal-700 font-semibold underline mt-1 inline-block transition-colors"
              >
                IBAN bepalen
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Levering */}
      <div className="md:bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-teal-500 rounded-xl flex items-center justify-center">
              <House weight="duotone" className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-brand-navy-500">Levering</h2>
          </div>

          <div className="space-y-6">
            {/* Heeft uw adres een verblijfsfunctie? */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Heeft uw adres een verblijfsfunctie (woon-/werkadres)? <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors flex-1">
                  <input
                    type="radio"
                    value="ja"
                    checked={heeftVerblijfsfunctie === true}
                    onChange={() => setValue('heeftVerblijfsfunctie', true)}
                    className="w-5 h-5 text-brand-teal-500"
                  />
                  <span className="font-medium">Ja</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors flex-1">
                  <input
                    type="radio"
                    value="nee"
                    checked={heeftVerblijfsfunctie === false}
                    onChange={() => setValue('heeftVerblijfsfunctie', false)}
                    className="w-5 h-5 text-brand-teal-500"
                  />
                  <span className="font-medium">Nee</span>
                </label>
              </div>
              {!heeftVerblijfsfunctie && (
                <div className="mt-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <Warning weight="duotone" className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      <strong>Let op:</strong> U heeft geen recht op vermindering energiebelasting als uw adres geen verblijfsfunctie heeft.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Gaat u binnenkort verhuizen? */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Gaat u binnenkort verhuizen, of bent u onlangs verhuisd?
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors flex-1">
                  <input
                    type="radio"
                    value="nee"
                    checked={gaatVerhuizen === false}
                    onChange={() => setValue('gaatVerhuizen', false)}
                    className="w-5 h-5 text-brand-teal-500"
                  />
                  <span className="font-medium">Nee</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors flex-1">
                  <input
                    type="radio"
                    value="ja"
                    checked={gaatVerhuizen === true}
                    onChange={() => setValue('gaatVerhuizen', true)}
                    className="w-5 h-5 text-brand-teal-500"
                  />
                  <span className="font-medium">Ja</span>
                </label>
              </div>
            </div>

            {/* Wanneer wilt u overstappen? */}
            {!gaatVerhuizen && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Wanneer wilt u overstappen? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors">
                    <input
                      type="radio"
                      value="zo_snel_mogelijk"
                      {...register('wanneerOverstappen')}
                      className="w-5 h-5 mt-0.5 text-brand-teal-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-brand-navy-500 mb-1">
                        Zo snel mogelijk overstappen
                      </div>
                      <div className="text-sm text-gray-600">
                        Contract is verlopen, onbepaalde tijd of voortijdig opzeggen
                      </div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors">
                    <input
                      type="radio"
                      value="na_contract_verlopen"
                      {...register('wanneerOverstappen')}
                      className="w-5 h-5 mt-0.5 text-brand-teal-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-brand-navy-500 mb-1">
                        Zodra mijn vaste contract afloopt
                      </div>
                      <div className="text-sm text-gray-600">
                        Stap pas over nadat het vaste contract afloopt en voorkom een opzegboete
                      </div>
                    </div>
                  </label>
                </div>

                {/* Info blok: Hoe snel stapt u over? */}
                <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-brand-navy-500 mb-2">Hoe snel stapt u over?</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    De verwerkingstijd van een overstap is gemiddeld 30 dagen.
                    <br />
                    Als uw contract eerder ingaat, is dit geen probleem en regelen de leveranciers dit onderling.
                    <br />
                    Van de energieleverancier ontvangt u een contractbevestiging. Hierin vindt u de exacte startdatum.
                  </p>
                </div>
              </div>
            )}

            {/* Checkboxes */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <label className="flex items-start gap-3 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  {...register('herinneringContract')}
                  className="w-5 h-5 mt-0.5 rounded-md text-brand-teal-500 border-gray-300 focus:ring-brand-teal-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Ja, ik word graag door PakketAdvies herinnerd wanneer mijn contract bijna afloopt
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  {...register('nieuwsbrief')}
                  className="w-5 h-5 mt-0.5 rounded-md text-brand-teal-500 border-gray-300 focus:ring-brand-teal-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Ja, ik ontvang graag nieuws en marktontwikkelingen van PakketAdvies
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Akkoord en privacyverklaring */}
      <div className="md:bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-teal-500 rounded-xl flex items-center justify-center">
              <ShieldCheck weight="duotone" className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-brand-navy-500">Akkoord en privacyverklaring</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                {...register('voorwaarden')}
                className="w-5 h-5 mt-0.5 rounded-md text-brand-teal-500 border-gray-300 focus:ring-brand-teal-500 cursor-pointer"
              />
              <div>
                <span className="text-sm font-medium text-brand-navy-500">
                  Door aan te melden gaat u akkoord met de voorwaarden en sluit u een overeenkomst met betalingsverplichting met {leverancierNaam}. 
                  U heeft 14 kalenderdagen bedenktijd na ontvangst contract leverancier.
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
                {...register('privacy')}
                className="w-5 h-5 mt-0.5 rounded-md text-brand-teal-500 border-gray-300 focus:ring-brand-teal-500 cursor-pointer"
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

            {/* Security badges */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4">
              <div className="flex flex-wrap items-center gap-4 justify-center">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <ShieldCheck weight="duotone" className="w-4 h-4 text-brand-teal-600" />
                  <span>Secure GlobalSign</span>
                </div>
                <div className="text-xs text-gray-600">
                  Uw gegevens worden via een beveiligde verbinding verstuurd
                </div>
                <div className="text-xs text-gray-600">
                  Beveiligd met reCAPTCHA - <a href="#" className="text-brand-teal-600 hover:underline">Privacy</a> - <a href="#" className="text-brand-teal-600 hover:underline">Voorwaarden</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <Button type="button" variant="ghost" size="lg" onClick={vorigeStap} className="w-full sm:flex-1 text-sm md:text-base">
          <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Vorige
        </Button>
        <Button type="submit" size="lg" className="w-full sm:flex-1 bg-brand-teal-500 hover:bg-brand-teal-600 text-sm md:text-base">
          Volgende stap
          <svg className="w-4 h-4 md:w-5 md:h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Button>
      </div>
    </form>
  )
}

export function BedrijfsgegevensForm() {
  return (
    <Suspense fallback={
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-brand-teal-50 border-t-brand-teal-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Laden...</p>
      </div>
    }>
      <BedrijfsgegevensFormContent />
    </Suspense>
  )
}
