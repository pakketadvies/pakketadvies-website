'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect, useRef } from 'react'
import { useCalculatorStore } from '@/store/calculatorStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Buildings, ShieldCheck, MagnifyingGlass, CheckCircle, XCircle, CaretDown } from '@phosphor-icons/react'
import { Storefront, ForkKnife, Factory, FirstAid, GraduationCap, Briefcase, SquaresFour } from '@phosphor-icons/react'

const bedrijfsgegevensSchema = z.object({
  kvkNummer: z.string().optional(),
  bedrijfsnaam: z.string().min(2, 'Vul een geldige bedrijfsnaam in'),
  contactpersoon: z.string().min(2, 'Vul een naam in'),
  email: z.string().email('Vul een geldig e-mailadres in'),
  telefoon: z.string().regex(/^[\d\s\-+()]+$/, 'Vul een geldig telefoonnummer in'),
  typeBedrijf: z.enum(['retail', 'horeca', 'kantoor', 'productie', 'gezondheidszorg', 'onderwijs', 'overig']),
  // Correspondentieadres (verplicht)
  correspondentieStraat: z.string().min(2, 'Vul een straatnaam in'),
  correspondentieHuisnummer: z.string().min(1, 'Vul een huisnummer in'),
  correspondentiePostcode: z.string().regex(/^\d{4}\s?[A-Z]{2}$/i, 'Vul een geldige postcode in'),
  correspondentiePlaats: z.string().min(2, 'Vul een plaatsnaam in'),
})

type BedrijfsgegevensFormData = z.infer<typeof bedrijfsgegevensSchema>

interface KvkSearchResult {
  kvkNummer: string
  bedrijfsnaam: string
  plaats: string
  adres: string
}

export function BedrijfsgegevensForm() {
  const { setBedrijfsgegevens, volgendeStap, vorigeStap, verbruik } = useCalculatorStore()
  
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
    setBedrijfsgegevens({
      ...data,
      kvkNummer: kvkNummer || undefined,
    })
    volgendeStap()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-navy-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Buildings weight="duotone" className="w-5 h-5 md:w-6 md:h-6 text-brand-teal-500" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-brand-navy-500 truncate">
              Bedrijfsgegevens
            </h2>
            <p className="text-sm md:text-base text-gray-600">Zodat we contact op kunnen nemen</p>
          </div>
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

      {/* Contactpersoon */}
      <div>
        <Input
          label="Contactpersoon"
          placeholder="Voor- en achternaam"
          error={errors.contactpersoon?.message}
          {...register('contactpersoon')}
          required
        />
      </div>

      {/* Email */}
      <div>
        <Input
          label="E-mailadres"
          type="email"
          placeholder="naam@bedrijf.nl"
          error={errors.email?.message}
          helpText="We sturen je advies hier naartoe"
          {...register('email')}
          required
        />
      </div>

      {/* Telefoon */}
      <div>
        <Input
          label="Telefoonnummer"
          type="tel"
          inputMode="tel"
          placeholder="06 12345678"
          error={errors.telefoon?.message}
          helpText="Voor eventuele vragen"
          {...register('telefoon')}
          required
        />
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

      {/* Privacy notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck weight="duotone" className="w-5 h-5 text-brand-teal-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
            Je gegevens worden veilig opgeslagen en alleen gebruikt voor het verstrekken van een 
            energieadvies. We delen je gegevens niet met derden zonder jouw toestemming.
          </p>
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
