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
import { ContractDetailsCard } from './ContractDetailsCard'
import { IbanCalculator } from '@/components/ui/IbanCalculator'
import { DatePicker } from '@/components/ui/DatePicker'
import { validatePhoneNumber } from '@/lib/phone-validation'
import { convertToISODate } from '@/lib/date-utils'
import type { ContractOptie } from '@/types/calculator'

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
  geboortedatum: z.string().refine((val) => {
    if (!val) return false
    const cleaned = val.trim().replace(/\s+/g, '')
    const patterns = [
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
    ]
    for (const pattern of patterns) {
      const match = cleaned.match(pattern)
      if (match) {
        const day = parseInt(match[1], 10)
        const month = parseInt(match[2], 10)
        const year = parseInt(match[3], 10)
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= new Date().getFullYear()) {
          const date = new Date(year, month - 1, day)
          return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year
        }
      }
    }
    return false
  }, 'Vul een geldige geboortedatum in (bijv. 18-07-1992)'),
  telefoon: z.string().refine((val: string) => {
    const result = validatePhoneNumber(val)
    return result.valid
  }, {
    message: 'Vul een geldig telefoonnummer in',
  }),
  email: z.string().email('Vul een geldig e-mailadres in'),
  herhaalEmail: z.string().email('Vul een geldig e-mailadres in'),
  
  // IBAN
  iban: z.string().min(15, 'Vul een geldig IBAN in'),
  rekeningOpAndereNaam: z.boolean().optional(),
  rekeninghouderNaam: z.string().optional(),
  
  // Levering
  heeftVerblijfsfunctie: z.boolean(),
  gaatVerhuizen: z.boolean(),
  wanneerOverstappen: z.enum(['zo_snel_mogelijk', 'na_contract_verlopen']).optional(),
  ingangsdatum: z.string().optional(),
  contractEinddatum: z.string().optional(),
  
  // Legacy velden (voor backward compatibility)
  contactpersoon: z.string().optional(), // Wordt nu vervangen door voornaam + achternaam
  typeBedrijf: z.enum(['retail', 'horeca', 'kantoor', 'productie', 'gezondheidszorg', 'onderwijs', 'overig']).optional(),
  
  // Correspondentieadres (verplicht)
  correspondentieStraat: z.string().min(2, 'Vul een straatnaam in'),
  correspondentieHuisnummer: z.string().min(1, 'Vul een huisnummer in'),
  correspondentiePostcode: z.string().regex(/^\d{4}\s?[A-Z]{2}$/i, 'Vul een geldige postcode in'),
  correspondentiePlaats: z.string().min(2, 'Vul een plaatsnaam in'),
  
  // Akkoorden (automatisch true, geen checkboxes meer nodig)
  voorwaarden: z.boolean().optional(),
  privacy: z.boolean().optional(),
  herinneringContract: z.boolean(),
  nieuwsbrief: z.boolean(),
}).refine(data => data.email === data.herhaalEmail, {
  message: 'E-mailadressen komen niet overeen',
  path: ['herhaalEmail'],
}).refine(data => {
  if (data.rekeningOpAndereNaam) {
    return data.rekeninghouderNaam && data.rekeninghouderNaam.length >= 2
  }
  return true
}, {
  message: 'Vul de naam van de rekeninghouder in',
  path: ['rekeninghouderNaam'],
}).refine(data => {
  if (data.gaatVerhuizen === false) {
    return data.wanneerOverstappen !== undefined
  }
  return true
}, {
  message: 'Selecteer wanneer u wilt overstappen',
  path: ['wanneerOverstappen'],
}).refine(data => {
  if (data.gaatVerhuizen === true) {
    return data.ingangsdatum && data.ingangsdatum.length > 0
  }
  return true
}, {
  message: 'Vul de ingangsdatum in',
  path: ['ingangsdatum'],
}).refine(data => {
  if (data.wanneerOverstappen === 'na_contract_verlopen') {
    return data.contractEinddatum && data.contractEinddatum.length > 0
  }
  return true
}, {
  message: 'Vul de einddatum van uw contract in',
  path: ['contractEinddatum'],
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
  const { setBedrijfsgegevens, vorigeStap, verbruik, selectedContract, resultaten, setVerbruik, setAddressType, setSelectedContract } = useCalculatorStore()
  
  // Haal contract op uit query param of store
  const contractId = searchParams?.get('contract')
  
  // Alleen gebruik selectedContract als het overeenkomt met contractId uit URL
  const initialContract = contractId && selectedContract && selectedContract.id === contractId
    ? selectedContract
    : (contractId && resultaten?.find(c => c.id === contractId)) || null
  
  const [contract, setContract] = useState<ContractOptie | null>(initialContract)
  const [loadingContract, setLoadingContract] = useState(false)
  const [contractError, setContractError] = useState<string | null>(null)
  
  // Fetch contract from API als fallback (als niet in store of als contractId verschilt)
  useEffect(() => {
    const loadContract = async () => {
      // Geen contractId, niets te laden
      if (!contractId) return
      
      // Als contract al correct is (overeenkomt met contractId), skip
      if (contract && contract.id === contractId) return
      
      // Als selectedContract overeenkomt met contractId, gebruik die
      if (selectedContract && selectedContract.id === contractId) {
        setContract(selectedContract)
        return
      }
      
      // Als contract in resultaten staat, gebruik die
      if (resultaten && resultaten.length > 0) {
        const found = resultaten.find(c => c.id === contractId)
        if (found) {
          setContract(found)
          setSelectedContract(found) // Zet ook in store
          return
        }
      }
      
      // Anders: fetch van API
        setLoadingContract(true)
        setContractError(null)
        
        try {
          console.log('📡 [BedrijfsgegevensForm] Fetching contract from API:', contractId)
          
          // Fetch contract from API
          const response = await fetch(`/api/contracten/${contractId}`)
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
            throw new Error(errorData.error || 'Contract niet gevonden')
          }
          
          const data = await response.json()
          const rawContract = data.contract
          
          if (!rawContract) {
            throw new Error('Contract data ontbreekt in API response')
          }
          
          console.log('✅ [BedrijfsgegevensForm] Contract fetched:', rawContract.id, rawContract.naam)
          
          // Transform raw contract to ContractOptie format
          const transformedContract: ContractOptie = {
            id: rawContract.id,
            leverancier: {
              id: rawContract.leverancier?.id || rawContract.leverancier_id,
              naam: rawContract.leverancier?.naam || 'Onbekende leverancier',
              logo: rawContract.leverancier?.logo_url || '',
              website: rawContract.leverancier?.website || '',
            },
            type: rawContract.type === 'maatwerk' ? 'vast' : rawContract.type,
            looptijd: rawContract.details_vast?.looptijd || rawContract.details_maatwerk?.looptijd || 1,
            maandbedrag: 0, // Wordt later berekend
            jaarbedrag: 0, // Wordt later berekend
            tariefElektriciteit: rawContract.details_vast?.tarief_elektriciteit_normaal || rawContract.details_dynamisch?.opslag_elektriciteit_normaal || rawContract.details_maatwerk?.tarief_elektriciteit_normaal || 0,
            tariefElektriciteitDal: rawContract.details_vast?.tarief_elektriciteit_dal || undefined,
            tariefElektriciteitEnkel: rawContract.details_vast?.tarief_elektriciteit_enkel || rawContract.details_maatwerk?.tarief_elektriciteit_enkel || undefined,
            tariefGas: rawContract.details_vast?.tarief_gas || rawContract.details_dynamisch?.opslag_gas || rawContract.details_maatwerk?.tarief_gas || 0,
            groeneEnergie: rawContract.details_vast?.groene_energie || rawContract.details_dynamisch?.groene_energie || rawContract.details_maatwerk?.groene_energie || false,
            targetAudience: rawContract.target_audience || 'both',
            contractNaam: rawContract.naam,
            rating: rawContract.details_vast?.rating || rawContract.details_dynamisch?.rating || rawContract.details_maatwerk?.rating || 0,
            aantalReviews: rawContract.details_vast?.aantal_reviews || rawContract.details_dynamisch?.aantal_reviews || rawContract.details_maatwerk?.aantal_reviews || 0,
            voorwaarden: rawContract.details_vast?.voorwaarden || rawContract.details_dynamisch?.voorwaarden || rawContract.details_maatwerk?.voorwaarden || [],
            opzegtermijn: rawContract.details_vast?.opzegtermijn || rawContract.details_dynamisch?.opzegtermijn || rawContract.details_maatwerk?.opzegtermijn || 1,
            bijzonderheden: rawContract.details_vast?.bijzonderheden || rawContract.details_dynamisch?.bijzonderheden || rawContract.details_maatwerk?.bijzonderheden || [],
            besparing: 0, // Wordt later berekend
            aanbevolen: rawContract.aanbevolen || false,
            populair: rawContract.populair || false,
          }
          
          console.log('✅ [BedrijfsgegevensForm] Contract transformed:', transformedContract.id, transformedContract.targetAudience)
          
          setContract(transformedContract)
          setSelectedContract(transformedContract) // Zet ook in store voor volgende keer
          setLoadingContract(false)
        } catch (error: any) {
          console.error('❌ [BedrijfsgegevensForm] Error loading contract:', error)
          setContractError(error.message || 'Fout bij laden contract')
          setLoadingContract(false)
        }
    }
    
    loadContract()
  }, [contractId, contract, selectedContract, resultaten, setSelectedContract])
  
  // Debug logging
  console.log('🔍 BedrijfsgegevensForm - Contract:', contract?.id, 'targetAudience:', contract?.targetAudience)
  console.log('🔍 BedrijfsgegevensForm - Verbruik:', verbruik ? { addressType: verbruik.addressType } : 'null')
  
  // Loading state
  if (loadingContract) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-brand-teal-50 border-t-brand-teal-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Contract laden...</p>
      </div>
    )
  }
  
  // Error state
  if (contractError || (!contract && contractId)) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
        <XCircle weight="duotone" className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">Contract niet gevonden</h3>
        <p className="text-red-600 mb-4">{contractError || 'Het geselecteerde contract kon niet worden geladen.'}</p>
        <Button
          onClick={() => router.push('/calculator/resultaten')}
          variant="outline"
        >
          Terug naar resultaten
        </Button>
      </div>
    )
  }
  
  // Als geen contract en geen contractId, toon error
  if (!contract && !contractId) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
        <XCircle weight="duotone" className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">Geen contract geselecteerd</h3>
        <p className="text-red-600 mb-4">Selecteer eerst een contract op de resultaten pagina.</p>
        <Button
          onClick={() => router.push('/calculator/resultaten')}
          variant="outline"
        >
          Terug naar resultaten
        </Button>
      </div>
    )
  }
  
  // Bepaal contract type
  const contractType = bepaalContractType(contract, verbruik)
  
  console.log('🔍 BedrijfsgegevensForm - Bepaald contract type:', contractType)
  
  // Als particulier, render particulier formulier
  if (contractType === 'particulier') {
    return <ParticulierAanvraagForm contract={contract} />
  }
  
  // Anders: zakelijk formulier (bestaande logica)
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
      voorwaarden: true,
      privacy: true,
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

  const onSubmit = async (data: BedrijfsgegevensFormData) => {
    setIsSubmitting(true)
    try {
      if (!contract) {
        console.error('❌ [BedrijfsgegevensForm] No contract available on submit')
        setContractError('Geen contract geselecteerd. Probeer de pagina te verversen.')
        setIsSubmitting(false)
        return
      }
      
      if (!verbruik) {
        console.error('❌ [BedrijfsgegevensForm] No verbruik data available on submit')
        alert('Geen verbruik data beschikbaar. Ga terug naar stap 1.')
        setIsSubmitting(false)
        return
      }
      
      console.log('✅ [BedrijfsgegevensForm] Submitting with contract:', contract.id, contract.contractNaam)

      // Prepare gegevens_data (zakelijk)
      const gegevensData = {
        bedrijfsnaam: data.bedrijfsnaam,
        kvkNummer: kvkNummer || data.kvkNummer || undefined,
        typeBedrijf: data.typeBedrijf || 'overig',
        aanhef: data.aanhef,
        voornaam: data.voornaam,
        voorletters: data.voorletters,
        tussenvoegsel: data.tussenvoegsel,
        achternaam: data.achternaam,
        geboortedatum: convertToISODate(data.geboortedatum),
        telefoon: data.telefoon,
        email: data.email,
        contactpersoon: `${data.voornaam} ${data.tussenvoegsel ? data.tussenvoegsel + ' ' : ''}${data.achternaam}`.trim(),
        heeft_andere_correspondentie_adres: !zelfdeAlsLeveradres,
        correspondentie_adres: !zelfdeAlsLeveradres ? {
          straat: data.correspondentieStraat,
          huisnummer: data.correspondentieHuisnummer,
          postcode: data.correspondentiePostcode,
          plaats: data.correspondentiePlaats,
        } : null,
      }

      // Prepare aanvraag data
      const aanvraagData = {
        contract_id: contract.id,
        contract_type: contract.type, // 'vast' | 'dynamisch' (maatwerk wordt getoond als vast)
        contract_naam: contract.contractNaam || `${contract.type === 'vast' ? 'Vast' : 'Dynamisch'} contract`,
        leverancier_id: contract.leverancier.id,
        leverancier_naam: contract.leverancier.naam,
        aanvraag_type: 'zakelijk' as const,
        verbruik_data: verbruik,
        gegevens_data: gegevensData,
        iban: data.iban,
        rekening_op_andere_naam: data.rekeningOpAndereNaam || false,
        rekeninghouder_naam: data.rekeninghouderNaam,
        heeft_verblijfsfunctie: data.heeftVerblijfsfunctie,
        gaat_verhuizen: data.gaatVerhuizen,
        wanneer_overstappen: data.wanneerOverstappen,
        contract_einddatum: convertToISODate(data.contractEinddatum),
        ingangsdatum: convertToISODate(data.ingangsdatum),
        is_klant_bij_leverancier: data.isKlantBijLeverancier,
        herinnering_contract: data.herinneringContract,
        nieuwsbrief: data.nieuwsbrief,
        heeft_andere_correspondentie_adres: !zelfdeAlsLeveradres,
        correspondentie_adres: !zelfdeAlsLeveradres ? {
          straat: data.correspondentieStraat,
          huisnummer: data.correspondentieHuisnummer,
          postcode: data.correspondentiePostcode,
          plaats: data.correspondentiePlaats,
        } : undefined,
      }

      // Save to database via API
      const response = await fetch('/api/aanvragen/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aanvraagData),
      })

      const result = await response.json()

      // Log all email logs to browser console
      if (result.emailLogs && result.emailLogs.length > 0) {
        console.group('📧 Email Sending Logs')
        result.emailLogs.forEach((log: string) => {
          if (log.includes('❌')) {
            console.error(log)
          } else if (log.includes('⚠️')) {
            console.warn(log)
          } else {
            console.log(log)
          }
        })
        console.groupEnd()
        
        if (result.emailError) {
          console.error('❌ Email Error Details:', result.emailError)
        }
        
        if (result.emailSuccess) {
          console.log('✅ Email sent successfully!')
        } else {
          console.error('❌ Email sending failed!')
        }
      }

      if (!result.success) {
        throw new Error(result.error || 'Fout bij opslaan aanvraag')
      }

      // Store aanvraagnummer in Zustand store for bevestigingspagina
      setBedrijfsgegevens({
        bedrijfsnaam: data.bedrijfsnaam,
        contactpersoon: `${data.voornaam} ${data.tussenvoegsel ? data.tussenvoegsel + ' ' : ''}${data.achternaam}`.trim(),
        email: data.email,
        telefoon: data.telefoon,
        kvkNummer: kvkNummer || data.kvkNummer || undefined,
        typeBedrijf: data.typeBedrijf || 'overig',
      })

      // Store aanvraagnummer in sessionStorage for bevestigingspagina
      if (result.aanvraagnummer) {
        sessionStorage.setItem('aanvraagnummer', result.aanvraagnummer)
      }

      // Redirect to bevestigingspagina
      router.push('/contract/bevestiging')
    } catch (error: any) {
      console.error('Error submitting form:', error)
      alert(error.message || 'Er is een fout opgetreden bij het verzenden van uw aanvraag. Probeer het opnieuw.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const leverancierNaam = contract?.leverancier.naam || 'Energieleverancier'
  const contractNaam = contract?.contractNaam || `${contract?.type === 'vast' ? 'Vast' : 'Dynamisch'} contract`
  const heeftVerblijfsfunctie = watch('heeftVerblijfsfunctie')
  const gaatVerhuizen = watch('gaatVerhuizen')
  const rekeningOpAndereNaam = watch('rekeningOpAndereNaam')
  const wanneerOverstappen = watch('wanneerOverstappen')
  const leveringsadres = verbruik?.leveringsadressen?.[0] || null

  return (
    <>
      {/* Contract Details Card */}
      <ContractDetailsCard contract={contract} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        {/* Header: Meld u nu aan */}
        <div className="text-center mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-brand-navy-500 mb-1.5 md:mb-2">
          Meld u nu aan bij {leverancierNaam}
            </h2>
        <p className="text-sm md:text-base text-gray-600">
          Meld u nu aan voor {contractNaam}. {leverancierNaam} verzorgt uw volledige overstap. 
          Uw bedrijf komt geen moment zonder stroom en gas te zitten.
        </p>
          </div>

      {/* Bent u momenteel klant? */}
      <div className="md:bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm">
        <div className="p-4 md:p-6">
          <div className="space-y-3 md:space-y-4">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3">
              Bent u momenteel klant bij {leverancierNaam}?
            </label>
            <div className="flex gap-3 md:gap-4">
              <label className="flex items-center gap-1.5 md:gap-2 cursor-pointer p-2.5 md:p-3 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors flex-1">
                <input
                  type="radio"
                  value="ja"
                  checked={watch('isKlantBijLeverancier') === true}
                  onChange={() => setValue('isKlantBijLeverancier', true)}
                  className="w-4 h-4 md:w-5 md:h-5 text-brand-teal-500"
                />
                <span className="text-sm md:text-base font-medium">Ja</span>
              </label>
              <label className="flex items-center gap-1.5 md:gap-2 cursor-pointer p-2.5 md:p-3 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors flex-1">
                <input
                  type="radio"
                  value="nee"
                  checked={watch('isKlantBijLeverancier') === false}
                  onChange={() => setValue('isKlantBijLeverancier', false)}
                  className="w-4 h-4 md:w-5 md:h-5 text-brand-teal-500"
                />
                <span className="text-sm md:text-base font-medium">Nee</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Leveringsadres */}
      <div className="md:bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm">
        <div className="p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-teal-500 rounded-xl flex items-center justify-center">
              <MapPin weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-brand-navy-500">Leveringsadres</h2>
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
        <div className="p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-teal-500 rounded-xl flex items-center justify-center">
              <User weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-brand-navy-500">Uw gegevens</h2>
        </div>
        
          <div className="space-y-3 md:space-y-4">
            {/* Aanhef */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3">
                Aanhef <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3 md:gap-4">
                <label className="flex items-center gap-1.5 md:gap-2 cursor-pointer p-2.5 md:p-3 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors flex-1">
                  <input
                    type="radio"
                    value="dhr"
                    {...register('aanhef')}
                    className="w-4 h-4 md:w-5 md:h-5 text-brand-teal-500"
                  />
                  <span className="text-sm md:text-base font-medium">Dhr.</span>
                </label>
                <label className="flex items-center gap-1.5 md:gap-2 cursor-pointer p-2.5 md:p-3 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors flex-1">
                  <input
                    type="radio"
                    value="mevr"
                    {...register('aanhef')}
                    className="w-4 h-4 md:w-5 md:h-5 text-brand-teal-500"
                  />
                  <span className="text-sm md:text-base font-medium">Mevr.</span>
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
            <DatePicker
              label="Geboortedatum"
              value={watch('geboortedatum')}
              onChange={(value) => setValue('geboortedatum', value)}
              error={errors.geboortedatum?.message}
              placeholder="bijv. 18-07-1992"
              required
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
        <div className="p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-teal-500 rounded-xl flex items-center justify-center">
              <CreditCard weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-brand-navy-500">Maandelijkse betaling</h2>
          </div>

          <div className="space-y-3 md:space-y-4">
            <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
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

            {/* Checkbox: Rekening op andere naam */}
            <label className="flex items-start gap-2 md:gap-3 cursor-pointer p-2.5 md:p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                {...register('rekeningOpAndereNaam')}
                className="w-4 h-4 md:w-5 md:h-5 mt-0.5 rounded-md text-brand-teal-500 border-gray-300 focus:ring-brand-teal-500"
              />
              <span className="text-xs md:text-sm font-medium text-gray-700">
                De rekening staat op een andere naam
              </span>
            </label>

            {/* Rekeninghouder naam (als checkbox aangevinkt) */}
            {rekeningOpAndereNaam && (
              <div className="animate-slide-down">
                <Input
                  label="Naam rekeninghouder"
                  {...register('rekeninghouderNaam')}
                  error={errors.rekeninghouderNaam?.message}
                  placeholder="Bijv. Jan Jansen"
                  required
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Levering */}
      <div className="md:bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm">
        <div className="p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-teal-500 rounded-xl flex items-center justify-center">
              <House weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-brand-navy-500">Levering</h2>
          </div>

          <div className="space-y-4 md:space-y-6">
            {/* Heeft uw adres een verblijfsfunctie? */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3">
                Heeft uw adres een verblijfsfunctie (woon-/werkadres)? <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3 md:gap-4">
                <label className="flex items-center gap-1.5 md:gap-2 cursor-pointer p-2.5 md:p-3 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors flex-1">
                  <input
                    type="radio"
                    value="ja"
                    checked={heeftVerblijfsfunctie === true}
                    onChange={() => setValue('heeftVerblijfsfunctie', true)}
                    className="w-4 h-4 md:w-5 md:h-5 text-brand-teal-500"
                  />
                  <span className="text-sm md:text-base font-medium">Ja</span>
                </label>
                <label className="flex items-center gap-1.5 md:gap-2 cursor-pointer p-2.5 md:p-3 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors flex-1">
                  <input
                    type="radio"
                    value="nee"
                    checked={heeftVerblijfsfunctie === false}
                    onChange={() => setValue('heeftVerblijfsfunctie', false)}
                    className="w-4 h-4 md:w-5 md:h-5 text-brand-teal-500"
                  />
                  <span className="text-sm md:text-base font-medium">Nee</span>
                </label>
              </div>
              {!heeftVerblijfsfunctie && (
                <div className="mt-2 md:mt-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 md:p-4">
                  <div className="flex items-start gap-2">
                    <Warning weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs md:text-sm text-yellow-800">
                      <strong>Let op:</strong> U heeft geen recht op vermindering energiebelasting als uw adres geen verblijfsfunctie heeft.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Gaat u binnenkort verhuizen? */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3">
                Gaat u binnenkort verhuizen, of bent u onlangs verhuisd?
              </label>
              <div className="flex gap-3 md:gap-4">
                <label className="flex items-center gap-1.5 md:gap-2 cursor-pointer p-2.5 md:p-3 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors flex-1">
                  <input
                    type="radio"
                    value="nee"
                    checked={gaatVerhuizen === false}
                    onChange={() => setValue('gaatVerhuizen', false)}
                    className="w-4 h-4 md:w-5 md:h-5 text-brand-teal-500"
                  />
                  <span className="text-sm md:text-base font-medium">Nee</span>
                </label>
                <label className="flex items-center gap-1.5 md:gap-2 cursor-pointer p-2.5 md:p-3 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors flex-1">
                  <input
                    type="radio"
                    value="ja"
                    checked={gaatVerhuizen === true}
                    onChange={() => setValue('gaatVerhuizen', true)}
                    className="w-4 h-4 md:w-5 md:h-5 text-brand-teal-500"
                  />
                  <span className="text-sm md:text-base font-medium">Ja</span>
                </label>
              </div>
            </div>

            {/* Wanneer wilt u overstappen? (alleen als gaatVerhuizen === false) */}
            {gaatVerhuizen === false && (
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3">
                  Wanneer wilt u overstappen? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2 md:space-y-3">
                  <label className="flex items-start gap-2 md:gap-3 cursor-pointer p-3 md:p-4 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors">
                    <input
                      type="radio"
                      value="zo_snel_mogelijk"
                      {...register('wanneerOverstappen')}
                      className="w-4 h-4 md:w-5 md:h-5 mt-0.5 text-brand-teal-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm md:text-base font-semibold text-brand-navy-500 mb-0.5 md:mb-1">
                        Zo snel mogelijk overstappen
                      </div>
                      <div className="text-xs md:text-sm text-gray-600">
                        Contract is verlopen, onbepaalde tijd of voortijdig opzeggen
                      </div>
                    </div>
                  </label>
                  <label className="flex items-start gap-2 md:gap-3 cursor-pointer p-3 md:p-4 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors">
                    <input
                      type="radio"
                      value="na_contract_verlopen"
                      {...register('wanneerOverstappen')}
                      className="w-4 h-4 md:w-5 md:h-5 mt-0.5 text-brand-teal-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm md:text-base font-semibold text-brand-navy-500 mb-0.5 md:mb-1">
                        Zodra mijn vaste contract afloopt
                      </div>
                      <div className="text-xs md:text-sm text-gray-600">
                        Stap pas over nadat het vaste contract afloopt en voorkom een opzegboete
                      </div>
                      {/* Uitklapbaar veld voor contract einddatum */}
                      {wanneerOverstappen === 'na_contract_verlopen' && (
                        <div className="mt-3 animate-slide-down">
                          <DatePicker
                            label="De einddatum van mijn contract"
                            value={watch('contractEinddatum')}
                            onChange={(value) => setValue('contractEinddatum', value)}
                            error={errors.contractEinddatum?.message}
                            placeholder="bijv. 31-12-2025"
                            required
                          />
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                {/* Info blok: Hoe snel stapt u over? */}
                <div className="mt-3 md:mt-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-3 md:p-4">
                  <h4 className="text-sm md:text-base font-semibold text-brand-navy-500 mb-1.5 md:mb-2">Hoe snel stapt u over?</h4>
                  <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                    De verwerkingstijd van een overstap is gemiddeld 30 dagen.
                    <br />
                    Als uw contract eerder ingaat, is dit geen probleem en regelen de leveranciers dit onderling.
                    <br />
                    Van de energieleverancier ontvangt u een contractbevestiging. Hierin vindt u de exacte startdatum.
                  </p>
                </div>
              </div>
            )}

            {/* Ingangsdatum (alleen als gaatVerhuizen === true) */}
            {gaatVerhuizen === true && (
              <div className="animate-slide-down">
                <DatePicker
                  label="Ingangsdatum"
                  value={watch('ingangsdatum')}
                  onChange={(value) => setValue('ingangsdatum', value)}
                  error={errors.ingangsdatum?.message}
                  placeholder="bijv. 01-01-2025"
                  required
                />
              </div>
            )}

            {/* Checkboxes */}
            <div className="space-y-2 md:space-y-3 pt-3 md:pt-4 border-t border-gray-200">
              <label className="flex items-start gap-2 md:gap-3 cursor-pointer p-2.5 md:p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  {...register('herinneringContract')}
                  className="w-4 h-4 md:w-5 md:h-5 mt-0.5 rounded-md text-brand-teal-500 border-gray-300 focus:ring-brand-teal-500"
                />
                <span className="text-xs md:text-sm font-medium text-gray-700">
                  Ja, ik word graag door PakketAdvies herinnerd wanneer mijn contract bijna afloopt
                </span>
              </label>
              <label className="flex items-start gap-2 md:gap-3 cursor-pointer p-2.5 md:p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  {...register('nieuwsbrief')}
                  className="w-4 h-4 md:w-5 md:h-5 mt-0.5 rounded-md text-brand-teal-500 border-gray-300 focus:ring-brand-teal-500"
                />
                <span className="text-xs md:text-sm font-medium text-gray-700">
                  Ja, ik ontvang graag nieuws en marktontwikkelingen van PakketAdvies
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Akkoord en privacyverklaring */}
      <div className="md:bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm">
        <div className="p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-teal-500 rounded-xl flex items-center justify-center">
              <ShieldCheck weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-brand-navy-500">Akkoord en privacyverklaring</h2>
          </div>

          <div className="space-y-3 md:space-y-4">
            {/* Akkoord tekst - zonder checkboxes, zichtbaar op mobiel en desktop */}
            <div className="p-3 md:p-4 rounded-xl bg-gray-50 border border-gray-200">
              <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                Door aan te melden gaat u akkoord met de{' '}
                <button
                  type="button"
                  className="text-brand-teal-600 hover:underline font-medium"
                >
                  algemene voorwaarden
                </button>
                {' '}en sluit u een overeenkomst met betalingsverplichting met {leverancierNaam}. 
                U heeft 14 kalenderdagen bedenktijd na ontvangst contract leverancier. 
                U geeft tevens toestemming voor verwerking van uw gegevens conform het{' '}
                <button
                  type="button"
                  className="text-brand-teal-600 hover:underline font-medium"
                >
                  privacybeleid
                </button>
                .
              </p>
            </div>

            {/* Aanmelden button - boven security card op mobiel, naast terug op desktop */}
            <div className="md:hidden mb-3">
              <Button 
                type="submit" 
                size="lg" 
                disabled={isSubmitting}
                className="w-full bg-brand-teal-500 hover:bg-brand-teal-600"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Bezig...
                  </>
                ) : (
                  'Aanmelden'
                )}
              </Button>
            </div>

            {/* Security badges */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 md:p-4">
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

      {/* Buttons - Desktop: beide buttons naast elkaar, Mobile: alleen Terug onderaan */}
      <div className="hidden md:flex flex-col sm:flex-row gap-3 md:gap-4">
        <Button 
          type="button" 
          variant="ghost" 
          size="lg" 
          onClick={vorigeStap} 
          className="w-full sm:flex-1 text-sm md:text-base"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Terug
        </Button>
        <Button 
          type="submit" 
          size="lg" 
          disabled={isSubmitting}
          className="w-full sm:flex-1 bg-brand-teal-500 hover:bg-brand-teal-600"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Bezig...
            </>
          ) : (
            'Aanmelden'
          )}
        </Button>
      </div>

      {/* Terug button - alleen op mobiel onderaan */}
      <div className="md:hidden">
        <Button 
          type="button" 
          variant="ghost" 
          size="lg" 
          onClick={vorigeStap} 
          className="w-full text-sm md:text-base"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Terug
        </Button>
      </div>
      </form>
    </>
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
