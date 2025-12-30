'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCalculatorStore } from '@/store/calculatorStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  User, 
  Envelope, 
  Phone, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle,
  Calendar,
  House,
  Warning,
  XCircle,
  ArrowsClockwise,
  MagnifyingGlass,
  ArrowLeft,
  Lightning,
  Flame,
  Sun,
  PencilSimple
} from '@phosphor-icons/react'
import type { ContractOptie } from '@/types/calculator'
import { ContractDetailsCard } from './ContractDetailsCard'
import { IbanCalculator } from '@/components/ui/IbanCalculator'
import { DatePicker } from '@/components/ui/DatePicker'
import { validatePhoneNumber } from '@/lib/phone-validation'
import { convertToISODate } from '@/lib/date-utils'
import EditVerbruikModal from './EditVerbruikModal'

const particulierAanvraagSchema = z.object({
  // Klant check
  isKlantBijLeverancier: z.boolean(),
  
  // Persoonlijke gegevens
  aanhef: z.enum(['dhr', 'mevr']),
  voornaam: z.string().min(2, 'Vul je voornaam in'),
  voorletters: z.string().optional(),
  tussenvoegsel: z.string().optional(),
  achternaam: z.string().min(2, 'Vul je achternaam in'),
  geboortedatum: z.string().refine((val) => {
    if (!val) return false
    // Accept various formats: dd-mm-yyyy, d-m-yyyy, etc.
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
  telefoonnummer: z.string().refine((val: string) => {
    const result = validatePhoneNumber(val)
    return result.valid
  }, {
    message: 'Vul een geldig telefoonnummer in',
  }),
  emailadres: z.string().email('Vul een geldig e-mailadres in'),
  herhaalEmailadres: z.string().email('Vul een geldig e-mailadres in'),
  
  // IBAN
  iban: z.string().min(15, 'Vul een geldig IBAN in'),
  rekeningOpAndereNaam: z.boolean(),
  rekeninghouderNaam: z.string().optional(),
  
  // Levering
  heeftVerblijfsfunctie: z.boolean(),
  gaatVerhuizen: z.boolean(),
  wanneerOverstappen: z.enum(['zo_snel_mogelijk', 'na_contract_verlopen']).optional(),
  ingangsdatum: z.string().optional(),
  contractEinddatum: z.string().optional(),
  
  // Correspondentieadres (optioneel)
  anderCorrespondentieadres: z.boolean(),
  correspondentieStraat: z.string().optional(),
  correspondentieHuisnummer: z.string().optional(),
  correspondentiePostcode: z.string().optional(),
  correspondentiePlaats: z.string().optional(),
  
  // Akkoorden (automatisch true, geen checkboxes meer nodig)
  voorwaarden: z.boolean().optional(),
  privacy: z.boolean().optional(),
  herinneringContract: z.boolean(),
  nieuwsbrief: z.boolean(),
  
  // Honeypot field (verborgen, bots vullen dit in)
  website: z.string().optional().refine((val) => !val || val === '', {
    message: 'Spam detected',
  }),
}).refine(data => data.emailadres === data.herhaalEmailadres, {
  message: 'E-mailadressen komen niet overeen',
  path: ['herhaalEmailadres'],
}).refine(data => {
  // Als rekeningOpAndereNaam true is, dan rekeninghouderNaam verplicht
  if (data.rekeningOpAndereNaam) {
    return data.rekeninghouderNaam && data.rekeninghouderNaam.length >= 2
  }
  return true
}, {
  message: 'Vul de naam van de rekeninghouder in',
  path: ['rekeninghouderNaam'],
}).refine(data => {
  // Als gaatVerhuizen false is, dan wanneerOverstappen verplicht
  if (data.gaatVerhuizen === false) {
    return data.wanneerOverstappen !== undefined
  }
  return true
}, {
  message: 'Selecteer wanneer u wilt overstappen',
  path: ['wanneerOverstappen'],
}).refine(data => {
  // Als gaatVerhuizen true is, dan ingangsdatum verplicht
  if (data.gaatVerhuizen === true) {
    return data.ingangsdatum && data.ingangsdatum.length > 0
  }
  return true
}, {
  message: 'Vul de ingangsdatum in',
  path: ['ingangsdatum'],
}).refine(data => {
  // Als wanneerOverstappen === 'na_contract_verlopen', dan contractEinddatum verplicht
  if (data.wanneerOverstappen === 'na_contract_verlopen') {
    return data.contractEinddatum && data.contractEinddatum.length > 0
  }
  return true
}, {
  message: 'Vul de einddatum van uw contract in',
  path: ['contractEinddatum'],
})

type ParticulierAanvraagFormData = z.infer<typeof particulierAanvraagSchema>

interface ParticulierAanvraagFormProps {
  contract: ContractOptie | null
}

export function ParticulierAanvraagForm({ contract }: ParticulierAanvraagFormProps) {
  const router = useRouter()
  const { verbruik, vorigeStap, setVerbruik, setAddressType } = useCalculatorStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAdresWijzigen, setShowAdresWijzigen] = useState(false)
  const [showIbanCalculator, setShowIbanCalculator] = useState(false)
  
  // Verbruik edit modal
  const [showVerbruikModal, setShowVerbruikModal] = useState(false)
  const [isUpdatingVerbruik, setIsUpdatingVerbruik] = useState(false)
  
  // Handler voor verbruik update
  const handleVerbruikUpdate = async (newVerbruik: typeof verbruik) => {
    if (!newVerbruik) return
    
    setIsUpdatingVerbruik(true)
    try {
      // Update verbruik in store
      setVerbruik(newVerbruik)
      // Sluit modal na korte delay voor UX
      setTimeout(() => {
        setShowVerbruikModal(false)
        setIsUpdatingVerbruik(false)
      }, 300)
    } catch (error) {
      console.error('Error updating verbruik:', error)
      setIsUpdatingVerbruik(false)
    }
  }
  
  // Address change states
  const [editPostcode, setEditPostcode] = useState('')
  const [editHuisnummer, setEditHuisnummer] = useState('')
  const [editToevoeging, setEditToevoeging] = useState('')
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [addressError, setAddressError] = useState('')
  const [checkingAddressType, setCheckingAddressType] = useState(false)
  const [addressTypeResult, setAddressTypeResult] = useState<{
    type: 'particulier' | 'zakelijk' | 'error';
    message: string;
    street?: string;
    city?: string;
  } | null>(null)
  const [manualAddressTypeOverride, setManualAddressTypeOverride] = useState<'particulier' | 'zakelijk' | null>(null)
  const [originalBagResult, setOriginalBagResult] = useState<'particulier' | 'zakelijk' | null>(null)
  const lastLookup = useRef<string>('')
  const addressTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const requestCounter = useRef<number>(0)
  const bagRequestCounter = useRef<number>(0)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ParticulierAanvraagFormData>({
    resolver: zodResolver(particulierAanvraagSchema),
    defaultValues: {
      isKlantBijLeverancier: false,
      aanhef: 'dhr',
      heeftVerblijfsfunctie: true,
      gaatVerhuizen: false,
      wanneerOverstappen: 'zo_snel_mogelijk',
      rekeningOpAndereNaam: false,
      anderCorrespondentieadres: false,
      voorwaarden: true,
      privacy: true,
      herinneringContract: false,
      nieuwsbrief: false,
    },
  })

  const heeftVerblijfsfunctie = watch('heeftVerblijfsfunctie')
  const anderCorrespondentieadres = watch('anderCorrespondentieadres')
  const gaatVerhuizen = watch('gaatVerhuizen')
  const rekeningOpAndereNaam = watch('rekeningOpAndereNaam')
  const wanneerOverstappen = watch('wanneerOverstappen')

  // Haal leveringsadres op uit verbruik
  const leveringsadres = verbruik?.leveringsadressen?.[0] || null
  
  // Initialize edit fields when opening address change
  const handleOpenAdresWijzigen = () => {
    if (leveringsadres) {
      setEditPostcode(leveringsadres.postcode || '')
      setEditHuisnummer(leveringsadres.huisnummer || '')
      setEditToevoeging(leveringsadres.toevoeging || '')
    }
    setShowAdresWijzigen(true)
    setAddressError('')
    setAddressTypeResult(null)
    setManualAddressTypeOverride(null)
    setOriginalBagResult(null)
  }
  
  // Valideer postcode
  const isValidPostcode = (postcode: string): boolean => {
    const clean = postcode.toUpperCase().replace(/\s/g, '')
    return /^\d{4}[A-Z]{2}$/.test(clean)
  }
  
  // BAG API check functie
  const checkAddressType = useCallback(async (postcode: string, huisnummer: string, toevoeging?: string) => {
    if (manualAddressTypeOverride) {
      const overrideResult = {
        type: manualAddressTypeOverride,
        message: manualAddressTypeOverride === 'particulier' 
          ? 'Particulier adres (handmatig gewijzigd) ⚠️ U bent zelf verantwoordelijk voor de juistheid van dit adrestype'
          : 'Zakelijk adres (handmatig gewijzigd) ⚠️ U bent zelf verantwoordelijk voor de juistheid van dit adrestype',
        street: addressTypeResult?.street,
        city: addressTypeResult?.city
      }
      setAddressTypeResult(overrideResult)
      return
    }

    const currentBagRequestId = bagRequestCounter.current + 1
    bagRequestCounter.current = currentBagRequestId
    setCheckingAddressType(true)

    try {
      const response = await fetch('/api/adres-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postcode, huisnummer, toevoeging }),
      })

      if (bagRequestCounter.current !== currentBagRequestId) {
        return
      }

      if (response.ok) {
        const result = await response.json()
        setOriginalBagResult(result.type === 'error' ? null : result.type)
        setAddressTypeResult(result)
        
        if (result.type !== 'error') {
          setAddressType(result.type)
        }
      }
    } catch (error) {
      if (bagRequestCounter.current === currentBagRequestId) {
        setAddressTypeResult({
          type: 'error',
          message: 'Kon adres type niet controleren'
        })
      }
    } finally {
      if (bagRequestCounter.current === currentBagRequestId) {
        setCheckingAddressType(false)
      }
    }
  }, [manualAddressTypeOverride, addressTypeResult, setAddressType])
  
  // Fetch address functie
  const fetchAddress = useCallback(async (postcode: string, huisnummer: string, toevoeging?: string) => {
    const lookupKey = `${postcode}-${huisnummer}-${toevoeging || ''}`
    if (lastLookup.current === lookupKey) return

    const currentRequestId = requestCounter.current + 1
    requestCounter.current = currentRequestId
    const postcodeClean = postcode.toUpperCase().replace(/\s/g, '')
    
    setLoadingAddress(true)
    setAddressError('')
    
    try {
      let url = `/api/postcode?postcode=${postcodeClean}&number=${huisnummer}`
      if (toevoeging && toevoeging.trim()) {
        url += `&addition=${encodeURIComponent(toevoeging.trim())}`
      }
      
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        
        if (requestCounter.current !== currentRequestId) return
        
        if (data.error) {
          setAddressError(data.error)
          setAddressTypeResult(null)
          setLoadingAddress(false)
          return
        }
        
        lastLookup.current = lookupKey
        
        if (requestCounter.current === currentRequestId) {
          await checkAddressType(postcode, huisnummer, toevoeging)
        }
      } else if (response.status === 404) {
        if (requestCounter.current !== currentRequestId) return
        const errorData = await response.json()
        setAddressError(errorData.error || 'Adres niet gevonden')
        setAddressTypeResult(null)
      }
    } catch (error) {
      if (requestCounter.current === currentRequestId) {
        setAddressError('Fout bij ophalen adres')
      }
    } finally {
      if (requestCounter.current === currentRequestId) {
        setLoadingAddress(false)
      }
    }
  }, [checkAddressType])
  
  // Handle address input change
  const handleAddressInputChange = (field: 'postcode' | 'huisnummer' | 'toevoeging', value: string) => {
    if (field === 'postcode') setEditPostcode(value)
    if (field === 'huisnummer') setEditHuisnummer(value)
    if (field === 'toevoeging') setEditToevoeging(value)
    
    setAddressError('')
    setAddressTypeResult(null)
    setManualAddressTypeOverride(null)
    setOriginalBagResult(null)
    
    if (addressTimeoutRef.current) {
      clearTimeout(addressTimeoutRef.current)
    }
    
    const postcodeComplete = isValidPostcode(field === 'postcode' ? value : editPostcode)
    const hasHuisnummer = (field === 'huisnummer' ? value : editHuisnummer).trim().length > 0
    
    if (postcodeComplete && hasHuisnummer) {
      addressTimeoutRef.current = setTimeout(() => {
        fetchAddress(
          field === 'postcode' ? value : editPostcode,
          field === 'huisnummer' ? value : editHuisnummer,
          field === 'toevoeging' ? value : editToevoeging
        )
      }, 800)
    }
  }
  
  // Handle manual address type switch
  const handleManualAddressTypeSwitch = () => {
    if (!addressTypeResult || addressTypeResult.type === 'error') return
    
    const newType: 'particulier' | 'zakelijk' = addressTypeResult.type === 'particulier' ? 'zakelijk' : 'particulier'
    setManualAddressTypeOverride(newType)
    
    const isManualChange = originalBagResult && originalBagResult !== newType
    const newResult = {
      type: newType,
      message: isManualChange
        ? `${newType === 'particulier' ? 'Particulier' : 'Zakelijk'} adres (handmatig gewijzigd) ⚠️ U bent zelf verantwoordelijk voor de juistheid van dit adrestype`
        : newType === 'particulier'
        ? 'Particulier adres - geschikt voor consumentencontracten'
        : 'Zakelijk adres - geschikt voor zakelijke contracten',
      street: addressTypeResult.street,
      city: addressTypeResult.city
    }
    setAddressTypeResult(newResult)
    setAddressType(newType)
  }
  
  // Save new address
  const handleSaveAddress = async () => {
    if (!isValidPostcode(editPostcode) || !editHuisnummer.trim()) {
      setAddressError('Vul een geldige postcode en huisnummer in')
      return
    }
    
    if (!addressTypeResult) {
      setAddressError('Controleer eerst het adres voordat u opslaat')
      return
    }
    
    if (addressTypeResult.type === 'error') {
      setAddressError('Het adres is niet geldig. Controleer het adres voordat u opslaat.')
      return
    }
    
    // Update verbruik in store
    if (verbruik) {
      const updatedVerbruik = {
        ...verbruik,
        leveringsadressen: [{
          postcode: editPostcode.toUpperCase().replace(/\s/g, '').replace(/^(\d{4})([A-Z]{2})$/, '$1 $2'),
          huisnummer: editHuisnummer.trim(),
          toevoeging: editToevoeging.trim() || undefined,
          straat: addressTypeResult.street || '',
          plaats: addressTypeResult.city || '',
        }],
        addressType: addressTypeResult.type,
      }
      setVerbruik(updatedVerbruik)
      setAddressType(addressTypeResult.type)
    }
    
    setShowAdresWijzigen(false)
  }

  const onSubmit = async (data: ParticulierAanvraagFormData) => {
    setIsSubmitting(true)
    try {
      if (!contract || !verbruik) {
        alert('Er is een fout opgetreden. Probeer het opnieuw.')
        return
      }

      // Prepare gegevens_data (particulier)
      const gegevensData = {
        aanhef: data.aanhef,
        voornaam: data.voornaam,
        voorletters: data.voorletters,
        tussenvoegsel: data.tussenvoegsel,
        achternaam: data.achternaam,
        geboortedatum: convertToISODate(data.geboortedatum),
        telefoonnummer: data.telefoonnummer,
        emailadres: data.emailadres,
        heeft_andere_correspondentie_adres: data.anderCorrespondentieadres,
        correspondentie_adres: data.anderCorrespondentieadres ? {
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
        aanvraag_type: 'particulier' as const,
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
        heeft_andere_correspondentie_adres: data.anderCorrespondentieadres,
        correspondentie_adres: data.anderCorrespondentieadres ? {
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
        body: JSON.stringify({
          ...aanvraagData,
          website: data.website || '', // Honeypot field - altijd leeg voor legitieme gebruikers
        }),
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

  const contractNaam = contract?.contractNaam || `${contract?.type === 'vast' ? 'Vast' : 'Dynamisch'} contract`
  const leverancierNaam = contract?.leverancier.naam || 'Energieleverancier'
  const korting = contract?.besparing ? contract.besparing * 12 : null // Jaarlijkse besparing als korting

  // Determine back URL based on where user came from
  const getBackUrl = () => {
    // Check if we have a referrer or can determine the results page
    if (typeof window !== 'undefined') {
      const referrer = document.referrer
      if (referrer.includes('/particulier/energie-vergelijken/resultaten')) {
        return '/particulier/energie-vergelijken/resultaten'
      }
    }
    // Default to results page
    return '/particulier/energie-vergelijken/resultaten'
  }

  return (
    <>
      {/* Back button */}
      <div className="mb-4 md:mb-6">
        <button
          type="button"
          onClick={() => router.push(getBackUrl())}
          className="inline-flex items-center gap-2 text-brand-teal-600 hover:text-brand-teal-700 font-medium text-sm md:text-base transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-0.5 transition-transform" weight="bold" />
          <span>Terug naar resultaten</span>
        </button>
      </div>

      {/* Contract Details Card */}
      <ContractDetailsCard contract={contract} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        {/* Honeypot field - verborgen, bots vullen dit in */}
        <input
          type="text"
          {...register('website')}
          tabIndex={-1}
          autoComplete="off"
          style={{ 
            position: 'absolute',
            left: '-9999px',
            width: '1px',
            height: '1px',
            opacity: 0,
            pointerEvents: 'none'
          }}
          aria-hidden="true"
        />
        
        {/* Header: Meld u nu aan */}
        <div className="text-center mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-brand-navy-500 mb-1.5 md:mb-2">
          Meld u nu aan bij {leverancierNaam}
        </h2>
        <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
          Meld u nu aan voor {contractNaam}. {leverancierNaam} verzorgt uw volledige overstap. 
          U komt geen moment zonder stroom en gas te zitten.
        </p>
        
        {/* Besparing per jaar badge (als van toepassing) */}
        {korting && korting > 0 && (
          <div className="inline-flex items-center gap-1.5 md:gap-2 bg-green-100 text-green-700 border-2 border-green-300 rounded-xl px-3 py-1.5 md:px-4 md:py-2 font-bold text-base md:text-lg">
            <span>Besparing per jaar</span>
            <span className="text-xl md:text-2xl">€ {korting.toLocaleString('nl-NL')},-</span>
          </div>
        )}
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
            <div className="space-y-3 md:space-y-4">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                <div className="font-semibold text-brand-navy-500 mb-1">
                  {leveringsadres.straat} {leveringsadres.huisnummer}
                  {leveringsadres.toevoeging ? ` ${leveringsadres.toevoeging}` : ''}
                </div>
                <div className="text-gray-600">
                  {leveringsadres.postcode} {leveringsadres.plaats}
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenAdresWijzigen}
                className="text-sm text-brand-teal-600 hover:text-brand-teal-700 font-semibold underline"
              >
                Adres wijzigen
              </button>

              {/* Adres wijzigen formulier */}
              {showAdresWijzigen && (
                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 md:p-6 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-brand-navy-500">Adres wijzigen</h3>
                    <button
                      type="button"
                      onClick={() => setShowAdresWijzigen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircle weight="bold" className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Postcode"
                      value={editPostcode}
                      onChange={(e) => handleAddressInputChange('postcode', e.target.value)}
                      error={addressError && !isValidPostcode(editPostcode) ? addressError : undefined}
                      placeholder="1234 AB"
                    />
                    <Input
                      label="Huisnummer"
                      value={editHuisnummer}
                      onChange={(e) => handleAddressInputChange('huisnummer', e.target.value)}
                      placeholder="12"
                    />
                    <Input
                      label="Toevoeging (optioneel)"
                      value={editToevoeging}
                      onChange={(e) => handleAddressInputChange('toevoeging', e.target.value)}
                      placeholder="A"
                    />
                  </div>
                  
                  {/* Loading state */}
                  {(loadingAddress || checkingAddressType) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MagnifyingGlass className="w-4 h-4 animate-pulse" />
                      <span>{loadingAddress ? 'Adres opzoeken...' : 'Adres controleren...'}</span>
                    </div>
                  )}
                  
                  {/* Address error */}
                  {addressError && !loadingAddress && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <XCircle weight="duotone" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-900">{addressError}</p>
                    </div>
                  )}
                  
                  {/* Address type result */}
                  {addressTypeResult && !loadingAddress && !checkingAddressType && (
                    <div className={`flex items-start gap-2 p-3 rounded-lg ${
                      addressTypeResult.type === 'error'
                        ? 'bg-red-50 border border-red-200'
                        : addressTypeResult.type === 'particulier'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-blue-50 border border-blue-200'
                    }`}>
                      {addressTypeResult.type === 'error' ? (
                        <XCircle weight="duotone" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle weight="duotone" className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          addressTypeResult.type === 'particulier' ? 'text-green-600' : 'text-blue-600'
                        }`} />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          addressTypeResult.type === 'error'
                            ? 'text-red-900'
                            : addressTypeResult.type === 'particulier'
                            ? 'text-green-900'
                            : 'text-blue-900'
                        }`}>
                          {addressTypeResult.message}
                        </p>
                        {addressTypeResult.street && addressTypeResult.city && (
                          <p className="text-xs text-gray-600 mt-1">
                            {addressTypeResult.street}, {addressTypeResult.city}
                          </p>
                        )}
                        {addressTypeResult.type !== 'error' && (
                          <button
                            type="button"
                            onClick={handleManualAddressTypeSwitch}
                            className="mt-2 text-xs text-brand-teal-600 hover:text-brand-teal-700 font-semibold flex items-center gap-1"
                          >
                            Wijzig naar {addressTypeResult.type === 'particulier' ? 'zakelijk' : 'particulier'}
                            <ArrowsClockwise weight="bold" className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Save button */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      onClick={handleSaveAddress}
                      disabled={!addressTypeResult || addressTypeResult.type === 'error' || loadingAddress || checkingAddressType}
                      className="flex-1 bg-brand-teal-500 hover:bg-brand-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Adres opslaan
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowAdresWijzigen(false)}
                      variant="outline"
                    >
                      Annuleren
                    </Button>
                  </div>
                </div>
              )}

              {/* Checkbox: Post op ander adres */}
              <label className="flex items-start gap-2 md:gap-3 cursor-pointer p-2.5 md:p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  {...register('anderCorrespondentieadres')}
                  className="w-4 h-4 md:w-5 md:h-5 mt-0.5 rounded-md text-brand-teal-500 border-gray-300 focus:ring-brand-teal-500"
                />
                <span className="text-xs md:text-sm font-medium text-gray-700">
                  Ik wil post van {leverancierNaam} op een ander adres ontvangen dan het leveringsadres
                </span>
              </label>

              {/* Correspondentieadres velden (als checkbox aangevinkt) */}
              {anderCorrespondentieadres && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 pt-3 md:pt-4 border-t border-gray-200">
                  <Input
                    label="Straatnaam"
                    {...register('correspondentieStraat')}
                    error={errors.correspondentieStraat?.message}
                    placeholder="Bijv. Weena"
                  />
                  <Input
                    label="Huisnummer"
                    {...register('correspondentieHuisnummer')}
                    error={errors.correspondentieHuisnummer?.message}
                    placeholder="12"
                  />
                  <Input
                    label="Postcode"
                    {...register('correspondentiePostcode')}
                    error={errors.correspondentiePostcode?.message}
                    placeholder="1234 AB"
                  />
                  <Input
                    label="Plaats"
                    {...register('correspondentiePlaats')}
                    error={errors.correspondentiePlaats?.message}
                    placeholder="Amsterdam"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-red-700">Geen leveringsadres gevonden. Ga terug naar stap 1 om een adres in te vullen.</p>
            </div>
          )}
        </div>
      </div>

      {/* Energieverbruik Card */}
      {verbruik && (
        <div className="md:bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm">
          <div className="p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-teal-500 rounded-xl flex items-center justify-center">
                <Lightning weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-brand-navy-500">Energieverbruik</h2>
            </div>

            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  {/* Verbruik details */}
                  <div className="space-y-2">
                    {/* Elektriciteit */}
                    <div className="flex items-center gap-2">
                      <Lightning weight="duotone" className="w-4 h-4 text-brand-teal-600 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-brand-navy-500">Elektriciteit:</span>
                        <span className="text-sm text-gray-700 ml-2">
                          {verbruik.heeftEnkeleMeter ? (
                            <>
                              {verbruik.elektriciteitNormaal?.toLocaleString('nl-NL') || 0} kWh (enkele meter)
                            </>
                          ) : (
                            <>
                              {verbruik.elektriciteitNormaal?.toLocaleString('nl-NL') || 0} kWh normaal
                              {verbruik.elektriciteitDal && verbruik.elektriciteitDal > 0 && (
                                <> • {verbruik.elektriciteitDal.toLocaleString('nl-NL')} kWh dal</>
                              )}
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Gas */}
                    {verbruik.gasJaar && verbruik.gasJaar > 0 && (
                      <div className="flex items-center gap-2">
                        <Flame weight="duotone" className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-brand-navy-500">Gas:</span>
                          <span className="text-sm text-gray-700 ml-2">
                            {verbruik.gasJaar.toLocaleString('nl-NL')} m³/jaar
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Zonnepanelen */}
                    {verbruik.heeftZonnepanelen && verbruik.terugleveringJaar && verbruik.terugleveringJaar > 0 && (
                      <div className="flex items-center gap-2">
                        <Sun weight="duotone" className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-brand-navy-500">Teruglevering:</span>
                          <span className="text-sm text-gray-700 ml-2">
                            {verbruik.terugleveringJaar.toLocaleString('nl-NL')} kWh/jaar
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Badge en knop */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-200">
                {verbruik.geschat && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-semibold">
                    <Warning weight="duotone" className="w-3.5 h-3.5" />
                    Geschat verbruik
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowVerbruikModal(true)}
                  className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-brand-teal-500 hover:bg-brand-teal-600 text-white rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md"
                >
                  <PencilSimple weight="bold" className="w-4 h-4" />
                  Verbruik wijzigen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Uw gegevens */}
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
            <div>
              <Input
                label="Voorletters"
                {...register('voorletters')}
                error={errors.voorletters?.message}
                placeholder="bijv. J.H."
                helpText="De eerste letter(s) van uw voornaam"
              />
            </div>

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
              {...register('telefoonnummer')}
              error={errors.telefoonnummer?.message}
              placeholder="bijv. 0612345678"
              required
              icon={<Phone weight="duotone" className="w-5 h-5" />}
            />

            {/* E-mailadres */}
            <Input
              label="E-mailadres"
              type="email"
              {...register('emailadres')}
              error={errors.emailadres?.message}
              placeholder="naam@voorbeeld.nl"
              required
              icon={<Envelope weight="duotone" className="w-5 h-5" />}
            />

            {/* Herhaal e-mailadres */}
            <Input
              label="Herhaal e-mailadres"
              type="email"
              {...register('herhaalEmailadres')}
              error={errors.herhaalEmailadres?.message}
              placeholder="naam@voorbeeld.nl"
              required
              icon={<Envelope weight="duotone" className="w-5 h-5" />}
            />
          </div>
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
              Bij {leverancierNaam} betaalt u via automatische incasso.
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
                <Link
                  href="/algemene-voorwaarden"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-teal-600 hover:text-brand-teal-700 underline font-medium"
                >
                  algemene voorwaarden
                </Link>
                {' '}en sluit u een overeenkomst met betalingsverplichting met {leverancierNaam}. 
                U heeft 14 kalenderdagen bedenktijd na ontvangst contract leverancier. 
                U geeft tevens toestemming voor verwerking van uw gegevens conform het{' '}
                <Link
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-teal-600 hover:text-brand-teal-700 underline font-medium"
                >
                  privacybeleid
                </Link>
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
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <ShieldCheck weight="duotone" className="w-4 h-4 text-brand-teal-600" />
                  <span>Uw gegevens worden via een beveiligde verbinding verstuurd</span>
                </div>
                <div className="text-xs text-gray-600">
                  Beveiligd met rate limiting en spam detection - <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-teal-600 hover:underline">Privacy</Link> - <Link href="/algemene-voorwaarden" target="_blank" rel="noopener noreferrer" className="text-brand-teal-600 hover:underline">Voorwaarden</Link>
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

      {/* IBAN Calculator Modal */}
      <IbanCalculator
        isOpen={showIbanCalculator}
        onClose={() => setShowIbanCalculator(false)}
        onSelect={(iban) => {
          setValue('iban', iban)
          setShowIbanCalculator(false)
        }}
      />
      </form>

      {/* Verbruik Edit Modal */}
      {verbruik && (
        <EditVerbruikModal
          isOpen={showVerbruikModal}
          onClose={() => setShowVerbruikModal(false)}
          currentData={verbruik}
          onSave={handleVerbruikUpdate}
          isUpdating={isUpdatingVerbruik}
        />
      )}
    </>
  )
}

