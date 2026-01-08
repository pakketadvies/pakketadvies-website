'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useCalculatorStore } from '@/store/calculatorStore'
import { Input } from '@/components/ui/Input'
import { 
  Lightning, 
  MagnifyingGlass, 
  CheckCircle, 
  MapPin, 
  Sun, 
  Flame, 
  Gauge,
  DeviceMobile,
  Lightbulb,
  Info,
  XCircle,
  Plugs,
  ArrowsClockwise,
  Warning
} from '@phosphor-icons/react'
import type { VerbruikData } from '@/types/calculator'
import { schatAansluitwaarden } from '@/lib/aansluitwaarde-schatting'

const verbruikSchema = z.object({
  elektriciteitNormaal: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined
      if (typeof val === 'number') return isNaN(val) ? undefined : val
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? undefined : num
      }
      return undefined
    },
    z.number().min(1, 'Vul je verbruik in')
  ),
  elektriciteitDal: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null
      if (typeof val === 'number') return isNaN(val) ? null : val
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? null : num
      }
      return null
    },
    z.number().nullable().optional()
  ),
  heeftEnkeleMeter: z.boolean(),
  heeftZonnepanelen: z.boolean(),
  terugleveringJaar: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null
      if (typeof val === 'number') return isNaN(val) ? null : val
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? null : num
      }
      return null
    },
    z.number().nullable().optional()
  ),
  gasJaar: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null
      if (typeof val === 'number') return isNaN(val) ? null : val
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? null : num
      }
      return null
    },
    z.number().nullable().optional()
  ),
  geenGasaansluiting: z.boolean(),
  meterType: z.enum(['slim', 'oud', 'weet_niet']),
  aansluitwaardeElektriciteit: z.string().optional(),
  aansluitwaardeGas: z.string().optional(),
  addressType: z.enum(['particulier', 'zakelijk']).nullable().optional(), // NIEUW: address type van BAG API
}).refine((data) => {
  // Als enkele meter, dan dal niet verplicht
  if (data.heeftEnkeleMeter) return true
  // Anders moet dal ingevuld zijn
  return data.elektriciteitDal !== null && data.elektriciteitDal !== undefined && data.elektriciteitDal > 0
}, {
  message: 'Vul dal tarief in of vink "enkele meter" aan',
  path: ['elektriciteitDal'],
}).refine((data) => {
  // Als zonnepanelen, dan teruglevering verplicht
  if (data.heeftZonnepanelen) {
    return data.terugleveringJaar !== null && data.terugleveringJaar !== undefined && data.terugleveringJaar > 0
  }
  return true
}, {
  message: 'Vul teruglevering in',
  path: ['terugleveringJaar'],
}).refine((data) => {
  // Als geen gasaansluiting, dan gas niet verplicht
  if (data.geenGasaansluiting) return true
  // Anders moet gas ingevuld zijn
  return data.gasJaar !== null && data.gasJaar !== undefined && data.gasJaar > 0
}, {
  message: 'Vul gasverbruik in of vink "geen gasaansluiting" aan',
  path: ['gasJaar'],
})

type QuickCalculatorProps = {
  /**
   * Where to send the user after submit.
   * - Business default: `/calculator/resultaten`
   * - Consumer flow: `/particulier/energie-vergelijken/resultaten`
   */
  resultsPath?: string
}

export function QuickCalculator({ resultsPath = '/calculator/resultaten' }: QuickCalculatorProps) {
  const router = useRouter()
  const { setVerbruik, verbruik, setAddressType } = useCalculatorStore()
  
  // Ref voor postcode input (voor auto-focus op desktop)
  const postcodeInputRef = useRef<HTMLInputElement>(null)
  
  // State
  const [heeftEnkeleMeter, setHeeftEnkeleMeter] = useState(false)
  const [heeftZonnepanelen, setHeeftZonnepanelen] = useState(false)
  const [geenGasaansluiting, setGeenGasaansluiting] = useState(false)
  const [meterType, setMeterType] = useState<'slim' | 'oud' | 'weet_niet'>('weet_niet')
  // Ref om oorspronkelijke elektriciteitDal waarde te bewaren
  const savedElektriciteitDal = useRef<number | null>(null)
  
  // Aansluitwaarden
  const [aansluitwaardeElektriciteit, setAansluitwaardeElektriciteit] = useState('')
  const [aansluitwaardeGas, setAansluitwaardeGas] = useState('')
  const [showAansluitwaardeInfo, setShowAansluitwaardeInfo] = useState(false)
  
  // Adres state
  const [leveringsadressen, setLeveringsadressen] = useState([{
    postcode: '',
    huisnummer: '',
    toevoeging: '',
    straat: '',
    plaats: '',
  }])
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [addressError, setAddressError] = useState<string>('')

  // NIEUW: Address type check state
  const [addressTypeResult, setAddressTypeResult] = useState<{
    type: 'particulier' | 'zakelijk' | 'error';
    message: string;
    street?: string;
    city?: string;
  } | null>(null);
  const [checkingAddressType, setCheckingAddressType] = useState(false);
  const [manualAddressTypeOverride, setManualAddressTypeOverride] = useState<'particulier' | 'zakelijk' | null>(null);
  const [originalBagResult, setOriginalBagResult] = useState<'particulier' | 'zakelijk' | null>(null);
  
  // Refs voor debouncing en duplicate prevention (exact zoals VerbruikForm)
  const lastLookup = useRef<string>('')
  const addressTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const aansluitwaardeTimer = useRef<NodeJS.Timeout | null>(null)
  // Request counters voor race condition preventie
  const requestCounter = useRef<number>(0)
  const bagRequestCounter = useRef<number>(0)
  
  // Verbruik voor aansluitwaarde schatting
  const [verbruikWatched, setVerbruikWatched] = useState({ elektriciteitNormaal: 0, elektriciteitDal: 0, gasJaar: 0 })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verbruikSchema),
    defaultValues: {
      heeftEnkeleMeter: false,
      heeftZonnepanelen: false,
      geenGasaansluiting: false,
      meterType: 'weet_niet' as const,
      addressType: null, // NIEUW: default value voor address type
    },
  })

  // Auto-focus postcode veld op desktop bij mount
  useEffect(() => {
    // Check of we op desktop zijn (lg breakpoint = 1024px)
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024
    
    if (isDesktop && postcodeInputRef.current) {
      // Kleine delay om zeker te zijn dat component volledig is gerenderd
      const timer = setTimeout(() => {
        postcodeInputRef.current?.focus()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, []) // Alleen bij mount

  // Load data from localStorage on mount
  useEffect(() => {
    if (verbruik) {
      // Set form values
      setValue('elektriciteitNormaal', verbruik.elektriciteitNormaal || 0)
      setValue('elektriciteitDal', verbruik.elektriciteitDal || 0)
      setValue('gasJaar', verbruik.gasJaar || 0)
      setValue('terugleveringJaar', verbruik.terugleveringJaar || 0)
      
      // Set checkboxes
      setHeeftEnkeleMeter(verbruik.heeftEnkeleMeter || false)
      setValue('heeftEnkeleMeter', verbruik.heeftEnkeleMeter || false)
      
      setHeeftZonnepanelen(verbruik.heeftZonnepanelen || false)
      setValue('heeftZonnepanelen', verbruik.heeftZonnepanelen || false)
      
      setGeenGasaansluiting(verbruik.geenGasaansluiting || false)
      setValue('geenGasaansluiting', verbruik.geenGasaansluiting || false)
      
      // Set meter type
      if (verbruik.meterType) {
        setMeterType(verbruik.meterType)
        setValue('meterType', verbruik.meterType)
      }
      
      // Set aansluitwaarden
      if (verbruik.aansluitwaardeElektriciteit) {
        setAansluitwaardeElektriciteit(verbruik.aansluitwaardeElektriciteit)
        setValue('aansluitwaardeElektriciteit', verbruik.aansluitwaardeElektriciteit)
      }
      
      if (verbruik.aansluitwaardeGas) {
        setAansluitwaardeGas(verbruik.aansluitwaardeGas)
        setValue('aansluitwaardeGas', verbruik.aansluitwaardeGas)
      }
      
      // Set adres
      if (verbruik.leveringsadressen && verbruik.leveringsadressen.length > 0) {
        const adres = verbruik.leveringsadressen[0]
        setLeveringsadressen([{
          postcode: adres.postcode,
          huisnummer: adres.huisnummer,
          toevoeging: adres.toevoeging || '',
          straat: adres.straat || '',
          plaats: adres.plaats || '',
        }])
        
        // NIEUW: Als addressType al bekend is in verbruik, laad die ook
        if (verbruik.addressType) {
          setValue('addressType', verbruik.addressType)
          setAddressType(verbruik.addressType)
          
          // Vul addressTypeResult met bekende waarde
          const message = verbruik.addressType === 'particulier'
            ? 'Particulier adres - geschikt voor consumentencontracten'
            : 'Zakelijk adres - geschikt voor zakelijke contracten'
          
          setAddressTypeResult({
            type: verbruik.addressType,
            message,
            street: adres.straat,
            city: adres.plaats,
          })
        }
      }
      
      // Set verbruikWatched for aansluitwaarde estimation
      setVerbruikWatched({
        elektriciteitNormaal: verbruik.elektriciteitNormaal || 0,
        elektriciteitDal: verbruik.elektriciteitDal || 0,
        gasJaar: verbruik.gasJaar || 0,
      })
    }
  }, [setValue, setAddressType]) // Only run on mount

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (addressTimeoutRef.current) {
        clearTimeout(addressTimeoutRef.current)
      }
      if (aansluitwaardeTimer.current) {
        clearTimeout(aansluitwaardeTimer.current)
      }
    }
  }, [])

  // Schat aansluitwaarden automatisch op basis van verbruik
  useEffect(() => {
    const totaalElektriciteit = verbruikWatched.elektriciteitNormaal + verbruikWatched.elektriciteitDal
    const gasJaar = geenGasaansluiting ? 0 : verbruikWatched.gasJaar

    // Debounce (wacht tot gebruiker klaar is met typen)
    if (aansluitwaardeTimer.current) {
      clearTimeout(aansluitwaardeTimer.current)
    }

    if (totaalElektriciteit > 0) {
      aansluitwaardeTimer.current = setTimeout(() => {
        const schatting = schatAansluitwaarden(totaalElektriciteit, gasJaar > 0 ? gasJaar : null)
        
        // Alleen automatisch invullen als nog leeg (niet overschrijven van handmatige aanpassing)
        if (!aansluitwaardeElektriciteit) {
          setAansluitwaardeElektriciteit(schatting.elektriciteit)
          setValue('aansluitwaardeElektriciteit', schatting.elektriciteit)
        }
        if (!aansluitwaardeGas && !geenGasaansluiting) {
          setAansluitwaardeGas(schatting.gas)
          setValue('aansluitwaardeGas', schatting.gas)
        }
      }, 1000) // 1 seconde debounce
    }
  }, [verbruikWatched, geenGasaansluiting, aansluitwaardeElektriciteit, aansluitwaardeGas, setValue])

  // Valideer of postcode compleet is (exact zoals VerbruikForm)
  const isValidPostcode = (postcode: string): boolean => {
    const clean = postcode.toUpperCase().replace(/\s/g, '')
    return /^\d{4}[A-Z]{2}$/.test(clean)
  }

  // Fetch address - GEEN leveringsadressen dependency om stale closures te voorkomen!
  const fetchAddress = useCallback(async (postcode: string, huisnummer: string, toevoeging?: string) => {
    // Check of dit dezelfde lookup is als de laatste (voorkom dubbele calls)
    const lookupKey = `${postcode}-${huisnummer}-${toevoeging || ''}`
    if (lastLookup.current === lookupKey) {
      return // Skip, we hebben dit al opgezocht
    }

    // Genereer unieke request ID voor race condition preventie
    const currentRequestId = requestCounter.current + 1
    requestCounter.current = currentRequestId

    const postcodeClean = postcode.toUpperCase().replace(/\s/g, '')
    
    setLoadingAddress(true)
    setAddressError('') // Clear oude errors
    
    try {
      let url = `/api/postcode?postcode=${postcodeClean}&number=${huisnummer}`
      if (toevoeging && toevoeging.trim()) {
        url += `&addition=${encodeURIComponent(toevoeging.trim())}`
      }
      
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        
        // Check of dit nog steeds de laatste request is (race condition preventie)
        if (requestCounter.current !== currentRequestId) {
          console.log('Ignoring stale postcode API response')
          return
        }
        
        if (data.error) {
          // API geeft error terug (maar met 200 status)
          setAddressError(data.error)
          // Clear BAG API result omdat adres niet geldig is
          setAddressTypeResult(null)
          // Gebruik updater function om stale state te voorkomen
          setLeveringsadressen(prev => [{
            ...prev[0],
            straat: '',
            plaats: '',
          }])
          setLoadingAddress(false)
          return
        }
        
        // Update state met nieuwe data - gebruik updater function voor meest recente state
        setLeveringsadressen(prev => [{
          ...prev[0],
          straat: data.street || '',
          plaats: data.city || '',
        }])
        
        // Sla lookup key op
        lastLookup.current = lookupKey

        // NIEUW: BAG API woonfunctie check (alleen als dit nog steeds de laatste request is)
        if (requestCounter.current === currentRequestId) {
          await checkAddressType(postcode, huisnummer, toevoeging)
        }
      } else if (response.status === 404) {
        const errorData = await response.json()
        
        // Check of dit nog steeds de laatste request is (race condition preventie)
        if (requestCounter.current !== currentRequestId) {
          console.log('Ignoring stale postcode API 404 response')
          return
        }
        
        setAddressError(errorData.error || 'Adres niet gevonden')
        // Clear BAG API result omdat adres niet geldig is
        setAddressTypeResult(null)
        // Clear address fields - gebruik updater function
        setLeveringsadressen(prev => [{
          ...prev[0],
          straat: '',
          plaats: '',
        }])
      } else {
        console.error('Address API error:', response.status)
        
        // Check of dit nog steeds de laatste request is (race condition preventie)
        if (requestCounter.current !== currentRequestId) {
          return
        }
        
        setAddressError('Kon adres niet ophalen')
      }
    } catch (error) {
      console.error('Address fetch exception:', error)
      
      // Check of dit nog steeds de laatste request is (race condition preventie)
      if (requestCounter.current !== currentRequestId) {
        return
      }
      
      setAddressError('Fout bij ophalen adres')
    } finally {
      // Alleen loading state updaten als dit nog steeds de laatste request is
      if (requestCounter.current === currentRequestId) {
      setLoadingAddress(false)
      }
    }
  }, []) // LEGE dependency array - geen stale closures!

  // NIEUW: BAG API functie voor woonfunctie check
  const checkAddressType = useCallback(async (postcode: string, huisnummer: string, toevoeging?: string) => {
    // Als er een manual override is, gebruik die in plaats van BAG API
    if (manualAddressTypeOverride) {
      const overrideResult: {
        type: 'particulier' | 'zakelijk' | 'error';
        message: string;
        street?: string;
        city?: string;
      } = {
        type: manualAddressTypeOverride,
        message: manualAddressTypeOverride === 'particulier' 
          ? 'Particulier adres - geschikt voor consumentencontracten'
          : 'Zakelijk adres - geschikt voor zakelijke contracten',
        street: addressTypeResult?.street,
        city: addressTypeResult?.city
      }
      setAddressTypeResult(overrideResult)
      setValue('addressType', manualAddressTypeOverride)
      setAddressType(manualAddressTypeOverride)
      return
    }

    // Genereer unieke request ID voor race condition preventie
    const currentBagRequestId = bagRequestCounter.current + 1
    bagRequestCounter.current = currentBagRequestId

    setCheckingAddressType(true);
    setAddressTypeResult(null);

    try {
      const response = await fetch('/api/adres-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postcode, huisnummer, toevoeging })
      });

      const result = await response.json();
      
      // Check of dit nog steeds de laatste request is (race condition preventie)
      if (bagRequestCounter.current !== currentBagRequestId) {
        console.log('Ignoring stale BAG API response')
        return
      }
      
      // Sla street en city op in result
      const resultWithDetails = {
        ...result,
        street: result.street,
        city: result.city
      }
      
      setAddressTypeResult(resultWithDetails);

      // Als het een geldig adres is, sla het type op in de form state
      if (result.type !== 'error') {
        // Sla het originele BAG API resultaat op (alleen bij eerste check, niet bij manual override)
        if (!originalBagResult && !manualAddressTypeOverride) {
          setOriginalBagResult(result.type)
        }
        // Update de verbruik data met address type
        setValue('addressType', result.type);
        setAddressType(result.type);
      }
    } catch (error) {
      console.error('Address type check error:', error);
      
      // Check of dit nog steeds de laatste request is (race condition preventie)
      if (bagRequestCounter.current !== currentBagRequestId) {
        return
      }
      
      setAddressTypeResult({
        type: 'error',
        message: 'Kon adres type niet controleren'
      });
    } finally {
      // Alleen loading state updaten als dit nog steeds de laatste request is
      if (bagRequestCounter.current === currentBagRequestId) {
        setCheckingAddressType(false);
      }
    }
  }, [setValue, manualAddressTypeOverride, addressTypeResult, setAddressType]);
  
  // NIEUW: Voer BAG API check uit wanneer adres compleet is geladen (na definitie van checkAddressType)
  useEffect(() => {
    if (verbruik && verbruik.leveringsadressen && verbruik.leveringsadressen.length > 0) {
      const adres = verbruik.leveringsadressen[0]
      
      // Als adres compleet is (postcode, huisnummer, straat, plaats) EN addressType nog niet bekend
      if (adres.postcode && adres.huisnummer && adres.straat && adres.plaats && !verbruik.addressType) {
        // Check of postcode geldig is
        const postcodeClean = adres.postcode.toUpperCase().replace(/\s/g, '')
        if (/^\d{4}[A-Z]{2}$/.test(postcodeClean)) {
          // Voer BAG API check uit na korte delay (om race conditions te voorkomen)
          const timer = setTimeout(() => {
            checkAddressType(adres.postcode, adres.huisnummer, adres.toevoeging)
          }, 200)
          
          return () => clearTimeout(timer)
        }
      }
    }
  }, [verbruik, checkAddressType]) // Run when verbruik changes

  // Handler voor handmatige address type switch
  const handleManualAddressTypeSwitch = () => {
    if (!addressTypeResult || addressTypeResult.type === 'error') {
      return
    }

    const newType: 'particulier' | 'zakelijk' = addressTypeResult.type === 'particulier' ? 'zakelijk' : 'particulier'
    setManualAddressTypeOverride(newType)

    // Bepaal of dit een handmatige wijziging is (verschilt van origineel)
    const isManualChange = originalBagResult !== null && newType !== originalBagResult

    // Update addressTypeResult state met aangepaste message
    const newResult: {
      type: 'particulier' | 'zakelijk' | 'error';
      message: string;
      street?: string;
      city?: string;
    } = {
      type: newType,
      message: isManualChange
        ? newType === 'particulier'
          ? 'Particulier adres (handmatig gewijzigd)\n⚠️ U bent zelf verantwoordelijk voor de juistheid van dit adrestype'
          : 'Zakelijk adres (handmatig gewijzigd)\n⚠️ U bent zelf verantwoordelijk voor de juistheid van dit adrestype'
        : newType === 'particulier'
          ? 'Particulier adres - geschikt voor consumentencontracten'
          : 'Zakelijk adres - geschikt voor zakelijke contracten',
      street: addressTypeResult.street,
      city: addressTypeResult.city
    }
    setAddressTypeResult(newResult)

    // Update form state
    setValue('addressType', newType)

    // Update Zustand store
    setAddressType(newType)
  }

  // Address change handler - exact zoals VerbruikForm
  const handleAddressChange = (field: 'postcode' | 'huisnummer' | 'toevoeging', value: string) => {
    const newAdres = { ...leveringsadressen[0] }
    newAdres[field] = value
    
    // Clear address when input changes
    if (newAdres.straat || newAdres.plaats) {
      newAdres.straat = ''
      newAdres.plaats = ''
    }
    
    // Clear error when input changes
    setAddressError('')
    
    // Clear BAG API result omdat adres is gewijzigd
    setAddressTypeResult(null)
    // Reset manual override en origineel resultaat als adres wijzigt
    setManualAddressTypeOverride(null)
    setOriginalBagResult(null)
    
    setLeveringsadressen([newAdres])
    
    // Clear existing timeout
    if (addressTimeoutRef.current) {
      clearTimeout(addressTimeoutRef.current)
    }
    
    // Validatie: postcode moet compleet zijn (6 karakters, 4 cijfers + 2 letters)
    const postcodeComplete = isValidPostcode(newAdres.postcode)
    const hasHuisnummer = newAdres.huisnummer.trim().length > 0
    
    // Alleen API call als postcode compleet EN huisnummer ingevuld
    if (postcodeComplete && hasHuisnummer) {
      addressTimeoutRef.current = setTimeout(() => {
        fetchAddress(newAdres.postcode, newAdres.huisnummer, newAdres.toevoeging)
      }, 800) // 800ms debounce zoals VerbruikForm
    }
  }

  // Functie om naar eerste error veld te scrollen
  const scrollToFirstError = useCallback(() => {
    // Wacht even zodat errors gerenderd zijn
    setTimeout(() => {
      // Zoek eerste error message element (meest betrouwbaar)
      const errorMessage = document.querySelector('.text-red-600') as HTMLElement
      if (errorMessage) {
        // Zoek het dichtstbijzijnde input veld
        const formGroup = errorMessage.closest('.space-y-2, .space-y-3, .space-y-4, div') as HTMLElement
        if (formGroup) {
          const input = formGroup.querySelector('input, textarea, select') as HTMLElement
          if (input) {
            input.scrollIntoView({ behavior: 'smooth', block: 'center' })
            // Geef visuele feedback met een korte highlight
            const originalBoxShadow = input.style.boxShadow
            input.style.transition = 'box-shadow 0.3s'
            input.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.3)'
            setTimeout(() => {
              input.style.boxShadow = originalBoxShadow
            }, 2000)
            return
          }
        }
        // Fallback: scroll naar error message zelf
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return
      }

      // Fallback: zoek eerste error veld via name attributen
      const errorFields = [
        'elektriciteitNormaal',
        'elektriciteitDal',
        'gasJaar',
        'terugleveringJaar',
        'leveringsadressen.0.postcode',
        'leveringsadressen.0.huisnummer',
      ]

      for (const fieldName of errorFields) {
        // Check of er een error is voor dit veld
        let hasError: any = false
        
        if (fieldName.includes('.')) {
          // Nested field (leveringsadressen.0.postcode, etc.)
          const errorObj = (errors as any).leveringsadressen?.[0]
          const nestedField = fieldName.split('.')[2]
          hasError = errorObj?.[nestedField]
        } else {
          // Top-level field
          hasError = errors[fieldName as keyof typeof errors]
        }
        
        if (hasError) {
          const element = document.querySelector(`input[name="${fieldName}"]`) as HTMLElement
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            const originalBoxShadow = element.style.boxShadow
            element.style.transition = 'box-shadow 0.3s'
            element.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.3)'
            setTimeout(() => {
              element.style.boxShadow = originalBoxShadow
            }, 2000)
            break
          }
        }
      }
    }, 100)
  }, [errors])

  const onSubmit = handleSubmit(
    (data) => {
      // Prepare verbruik data exactly like VerbruikForm
      const verbruikData: VerbruikData = {
        leveringsadressen: leveringsadressen.filter(a => a.postcode && a.huisnummer),
        elektriciteitNormaal: data.elektriciteitNormaal,
        elektriciteitDal: data.elektriciteitDal ?? null,
        heeftEnkeleMeter: data.heeftEnkeleMeter,
        gasJaar: data.gasJaar ?? null,
        geenGasaansluiting: data.geenGasaansluiting,
        heeftZonnepanelen: data.heeftZonnepanelen,
        terugleveringJaar: data.terugleveringJaar ?? null,
        meterType: data.meterType,
        aansluitwaardeElektriciteit: aansluitwaardeElektriciteit,
        aansluitwaardeGas: aansluitwaardeGas,
        addressType: data.addressType || null, // NIEUW: address type toevoegen
        geschat: false, // User filled in actual data
      }
      
      // Store in Zustand (same as VerbruikForm)
      setVerbruik(verbruikData)
      
      // Navigate to results (business or consumer flow)
      router.push(resultsPath)
    },
    (errors) => {
      // On validation error, scroll to first error field
      scrollToFirstError()
    }
  )

  return (
    <div className="bg-white rounded-2xl p-5 md:p-5 lg:p-6 shadow-xl border border-gray-100 w-full">
      {/* Header */}
      <div className="flex items-center gap-3 md:gap-3 mb-6 md:mb-5">
        <div className="w-12 h-12 md:w-11 md:h-11 bg-brand-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Lightning weight="duotone" className="w-6 h-6 md:w-6 md:h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl md:text-lg lg:text-xl font-bold text-brand-navy-500">Bereken je besparing</h3>
          <p className="text-sm md:text-xs text-gray-600">Gratis en vrijblijvend</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 md:space-y-4">
        {/* Leveringsadres */}
        <div className="space-y-3 md:space-y-2">
          <div className="flex items-center gap-2.5">
            <MapPin weight="duotone" className="w-5 h-5 md:w-5 md:h-5 text-brand-teal-600" />
            <label className="text-sm md:text-sm font-semibold text-brand-navy-500">
              Leveradres <span className="text-red-500">*</span>
            </label>
          </div>
          
          {/* Mobiel: geen extra container, desktop: wel grijze container */}
          <div className="md:bg-gray-50 md:border-2 md:border-gray-200 md:rounded-xl md:p-4 space-y-3 md:space-y-3">
            <div className="grid grid-cols-8 gap-2 md:gap-2">
              <div className="col-span-4">
                <label className="block text-sm md:text-xs font-medium text-gray-700 mb-1.5 md:mb-0.5">Postcode</label>
                <input
                  ref={postcodeInputRef}
                  type="text"
                  value={leveringsadressen[0].postcode}
                  onChange={(e) => handleAddressChange('postcode', e.target.value.toUpperCase())}
                  placeholder="1234AB"
                  maxLength={6}
                  className="w-full px-3.5 md:px-3 py-3.5 md:py-2 text-sm md:text-sm rounded-xl border-2 border-gray-200 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all bg-white"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm md:text-xs font-medium text-gray-700 mb-1.5 md:mb-0.5">Huisnr.</label>
                <input
                  type="text"
                  value={leveringsadressen[0].huisnummer}
                  onChange={(e) => handleAddressChange('huisnummer', e.target.value)}
                  placeholder="12"
                  className="w-full px-3.5 md:px-3 py-3.5 md:py-2 text-sm md:text-sm rounded-xl border-2 border-gray-200 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all bg-white"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm md:text-xs font-medium text-gray-700 mb-1.5 md:mb-0.5">Toev.</label>
                <input
                  type="text"
                  value={leveringsadressen[0].toevoeging || ''}
                  onChange={(e) => handleAddressChange('toevoeging', e.target.value.toUpperCase())}
                  placeholder="A"
                  maxLength={4}
                  className="w-full px-3.5 md:px-3 py-3.5 md:py-2 text-sm md:text-sm rounded-xl border-2 border-gray-200 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all bg-white text-center"
                />
              </div>
            </div>

            {/* Gecombineerde loading state: zichtbaar zolang één van beide API calls bezig is */}
            {(loadingAddress || checkingAddressType) && (
              <div className="flex items-center gap-2 text-xs text-brand-teal-600 animate-slide-down">
                <div className="w-3 h-3 border-2 border-brand-teal-300 border-t-brand-teal-600 rounded-full animate-spin" />
                <span>
                  {loadingAddress && !checkingAddressType 
                    ? 'Adres opzoeken...' 
                    : 'Adres controleren...'}
                </span>
              </div>
            )}

            {/* Gecombineerde status: BAG API resultaat (prioriteit) of postcode API success */}
            {!checkingAddressType && !loadingAddress && (
              <>
                {/* BAG API resultaat heeft prioriteit */}
                {addressTypeResult ? (
                  <div className={`flex items-start gap-2 p-2 md:p-3 rounded-lg animate-slide-down ${
                    addressTypeResult.type === 'error'
                      ? 'bg-red-50 border border-red-200'
                      : addressTypeResult.type === 'particulier'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-blue-50 border border-blue-200'
                  }`}>
                    {addressTypeResult.type === 'error' ? (
                      <XCircle weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    ) : addressTypeResult.type === 'particulier' ? (
                      <CheckCircle weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className={`flex-1 text-xs md:text-sm ${
                      addressTypeResult.type === 'error'
                        ? 'text-red-900'
                        : addressTypeResult.type === 'particulier'
                        ? 'text-green-900'
                        : 'text-blue-900'
                    }`}>
                      {/* Toon adres als beschikbaar */}
                      {(leveringsadressen[0].straat && leveringsadressen[0].plaats) && (
                        <div className="font-semibold mb-1">
                          {leveringsadressen[0].straat} {leveringsadressen[0].huisnummer}{leveringsadressen[0].toevoeging ? ` ${leveringsadressen[0].toevoeging}` : ''}, {leveringsadressen[0].postcode} {leveringsadressen[0].plaats}
                        </div>
                      )}
                      <div className="whitespace-pre-line">{addressTypeResult.message}</div>
                      
                      {/* NIEUW: Handmatige switch knop (alleen bij succes, niet bij error) */}
                      {addressTypeResult.type !== 'error' && (
                        <button
                          type="button"
                          onClick={handleManualAddressTypeSwitch}
                          className="mt-2 text-xs text-gray-600 hover:text-gray-900 underline flex items-center gap-1 transition-colors"
                        >
                          Wijzig naar {addressTypeResult.type === 'particulier' ? 'zakelijk' : 'particulier'}
                          <ArrowsClockwise weight="bold" className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Fallback: alleen postcode API success (als BAG check nog niet gedaan) */
                  leveringsadressen[0].straat && leveringsadressen[0].plaats && (
              <div className="flex items-start gap-2 p-2 md:p-3 bg-brand-teal-50 border border-brand-teal-200 rounded-lg animate-slide-down">
                <CheckCircle weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-brand-teal-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs md:text-sm text-brand-teal-900">
                  <div className="font-semibold">
                    {leveringsadressen[0].straat} {leveringsadressen[0].huisnummer}{leveringsadressen[0].toevoeging ? ` ${leveringsadressen[0].toevoeging}` : ''}
                  </div>
                  <div>{leveringsadressen[0].postcode} {leveringsadressen[0].plaats}</div>
                </div>
              </div>
                  )
                )}
              </>
            )}
            
            {addressError && (
              <div className="flex items-start gap-2 p-2 md:p-3 bg-red-50 border border-red-200 rounded-lg animate-slide-down">
                <XCircle weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs md:text-sm text-red-900">
                  {addressError}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Elektriciteit - mobiel: geen container, desktop: teal container */}
        <div className="md:bg-brand-teal-50/50 md:border-2 md:border-brand-teal-200 md:rounded-xl md:p-3 space-y-3 md:space-y-3">
          <div className="flex items-center gap-2.5">
            <Lightning weight="duotone" className="w-5 h-5 md:w-5 md:h-5 text-brand-teal-600" />
            <label className="text-base md:text-sm font-semibold text-brand-navy-500">
              Elektriciteitsverbruik
            </label>
          </div>
          
          <div className="grid grid-cols-2 gap-3 md:gap-3">
            <div>
              <label className="block text-sm md:text-xs font-semibold text-brand-navy-500 mb-1.5 md:mb-1">
                {heeftEnkeleMeter ? 'Totaal verbruik' : 'Normaal tarief'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  {...register('elektriciteitNormaal', { 
                    valueAsNumber: true,
                    onChange: (e) => setVerbruikWatched(prev => ({ ...prev, elektriciteitNormaal: Number(e.target.value) || 0 }))
                  })}
                  placeholder="3500"
                  className="w-full px-3.5 md:px-3 py-3.5 md:py-2 pr-14 md:pr-12 text-base md:text-sm rounded-xl border-2 border-gray-200 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all bg-white"
                />
                <span className="absolute right-3 md:right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">kWh</span>
              </div>
              {errors.elektriciteitNormaal && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.elektriciteitNormaal.message?.includes('Invalid input') || errors.elektriciteitNormaal.message?.includes('expected number')
                    ? 'Vul je verbruik in' 
                    : errors.elektriciteitNormaal.message || 'Vul je verbruik in'}
                </p>
              )}
            </div>

            {!heeftEnkeleMeter && (
              <div className="animate-slide-down">
                <label className="block text-sm md:text-xs font-semibold text-brand-navy-500 mb-1.5 md:mb-1">
                  Daltarief <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    {...register('elektriciteitDal', { 
                      valueAsNumber: true,
                      onChange: (e) => setVerbruikWatched(prev => ({ ...prev, elektriciteitDal: Number(e.target.value) || 0 }))
                    })}
                    placeholder="2500"
                    className="w-full px-3.5 md:px-3 py-3.5 md:py-2 pr-14 md:pr-12 text-base md:text-sm rounded-xl border-2 border-gray-200 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all bg-white"
                  />
                  <span className="absolute right-3 md:right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">kWh</span>
                </div>
                {errors.elektriciteitDal && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.elektriciteitDal.message?.includes('Invalid input') || errors.elektriciteitDal.message?.includes('expected number')
                      ? 'Vul een geldig getal in' 
                      : errors.elektriciteitDal.message || 'Vul een geldig getal in'}
                  </p>
                )}
              </div>
            )}
          </div>

          {errors.elektriciteitDal && heeftEnkeleMeter && (
            <p className="text-xs text-red-600">
              {errors.elektriciteitDal.message?.includes('Invalid input') || errors.elektriciteitDal.message?.includes('expected number')
                ? 'Vul een geldig getal in' 
                : errors.elektriciteitDal.message || 'Vul een geldig getal in'}
            </p>
          )}

          <label className="flex items-start gap-3 cursor-pointer p-3.5 rounded-xl border-2 border-gray-200 bg-white hover:border-brand-teal-300 hover:bg-brand-teal-50/30 active:bg-brand-teal-50 transition-all">
            <input
              type="checkbox"
              checked={heeftEnkeleMeter}
              onChange={(e) => {
                const checked = e.target.checked
                setHeeftEnkeleMeter(checked)
                setValue('heeftEnkeleMeter', checked)
                if (checked) {
                  // Bewaar de huidige waarde voordat we het op null zetten
                  const currentDal = watch('elektriciteitDal')
                  if (typeof currentDal === 'number' && !isNaN(currentDal)) {
                    savedElektriciteitDal.current = currentDal
                  }
                  setValue('elektriciteitDal', null)
                } else {
                  // Herstel de oorspronkelijke waarde als het vinkje wordt uitgezet
                  if (savedElektriciteitDal.current !== null) {
                    setValue('elektriciteitDal', savedElektriciteitDal.current)
                    savedElektriciteitDal.current = null
                  }
                }
              }}
              className="w-5 h-5 mt-0.5 rounded border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-2 flex-shrink-0"
            />
            <div className="flex-1">
              <span className="text-sm md:text-xs font-semibold text-brand-navy-500 block">Ik heb een enkele meter</span>
              <span className="text-xs text-gray-600 block mt-0.5">Geen onderscheid tussen dag- en nachttarief</span>
            </div>
          </label>
        </div>

        {/* Zonnepanelen - Purple accent */}
        <label className={`flex items-start gap-3 cursor-pointer p-3.5 rounded-xl transition-all active:scale-[0.99] ${
          heeftZonnepanelen
            ? 'border-2 border-brand-purple-500 bg-brand-purple-50/50'
            : 'border-2 border-gray-200 bg-white hover:border-brand-purple-300 hover:bg-brand-purple-50/30'
        }`}>
          <input
            type="checkbox"
            checked={heeftZonnepanelen}
            onChange={(e) => {
              setHeeftZonnepanelen(e.target.checked)
              setValue('heeftZonnepanelen', e.target.checked)
              if (!e.target.checked) {
                setValue('terugleveringJaar', null)
              }
            }}
            className="w-5 h-5 mt-0.5 rounded border-2 border-gray-300 text-brand-purple-600 focus:ring-brand-purple-500 focus:ring-2 flex-shrink-0"
          />
          <Sun weight="duotone" className={`w-6 h-6 flex-shrink-0 ${heeftZonnepanelen ? 'text-brand-purple-600' : 'text-gray-400'}`} />
          <div className="flex-1">
            <span className="text-sm md:text-sm font-semibold text-brand-navy-500 block">Wij hebben zonnepanelen</span>
            <span className="text-xs text-gray-600 block mt-0.5">Lever je stroom terug aan het net?</span>
          </div>
        </label>

        {heeftZonnepanelen && (
          <div className="md:bg-brand-teal-50 md:border-2 md:border-brand-teal-200 md:rounded-xl md:p-3 animate-slide-down">
            <label className="block text-sm md:text-xs font-semibold text-brand-navy-500 mb-2 md:mb-1.5">
              Opwekking per jaar <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                {...register('terugleveringJaar', { valueAsNumber: true })}
                placeholder="3000"
                className="w-full px-3.5 md:px-3 py-3.5 md:py-2 pr-14 md:pr-12 text-base md:text-sm rounded-xl border-2 border-gray-200 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all bg-white"
              />
              <span className="absolute right-3 md:right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">kWh</span>
            </div>
            {errors.terugleveringJaar && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.terugleveringJaar.message?.includes('Invalid input') || errors.terugleveringJaar.message?.includes('expected number')
                  ? 'Vul een geldig getal in' 
                  : errors.terugleveringJaar.message || 'Vul een geldig getal in'}
              </p>
            )}
          </div>
        )}

        {/* Gas */}
        <div className="space-y-3 md:space-y-2">
          {!geenGasaansluiting && (
            <div>
              <label className="flex items-center gap-2 text-sm md:text-sm font-semibold text-brand-navy-500 mb-2 md:mb-1.5">
                <Flame weight="duotone" className="w-5 h-5 md:w-5 md:h-5 text-brand-teal-600" />
                Gasverbruik per jaar <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  {...register('gasJaar', { 
                    valueAsNumber: true,
                    onChange: (e) => setVerbruikWatched(prev => ({ ...prev, gasJaar: Number(e.target.value) || 0 }))
                  })}
                  placeholder="1200"
                  className="w-full px-3.5 md:px-3 py-3.5 md:py-2 pr-14 md:pr-12 text-base md:text-sm rounded-xl border-2 border-gray-200 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all bg-white"
                />
                <span className="absolute right-3 md:right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">m³</span>
              </div>
              {errors.gasJaar && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.gasJaar.message?.includes('Invalid input') || errors.gasJaar.message?.includes('expected number')
                    ? 'Vul een geldig getal in' 
                    : errors.gasJaar.message || 'Vul een geldig getal in'}
                </p>
              )}
            </div>
          )}

          {errors.gasJaar && geenGasaansluiting && (
            <p className="text-xs text-red-600">
              {errors.gasJaar.message?.includes('Invalid input') || errors.gasJaar.message?.includes('expected number')
                ? 'Vul een geldig getal in' 
                : errors.gasJaar.message || 'Vul een geldig getal in'}
            </p>
          )}

          <label className="flex items-start gap-3 cursor-pointer p-3.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors border-2 border-gray-200">
            <input
              type="checkbox"
              checked={geenGasaansluiting}
              onChange={(e) => {
                setGeenGasaansluiting(e.target.checked)
                setValue('geenGasaansluiting', e.target.checked)
                if (e.target.checked) {
                  setValue('gasJaar', null)
                }
              }}
              className="w-5 h-5 mt-0.5 rounded border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 flex-shrink-0"
            />
            <div className="flex-1">
              <span className="text-sm md:text-xs font-semibold text-brand-navy-500 block">Geen gasaansluiting</span>
              <span className="text-xs text-gray-600 block mt-0.5">Bijvoorbeeld bij volledig elektrisch verwarmen</span>
            </div>
          </label>
        </div>

        {/* Metertype */}
        <div>
          <label className="flex items-center gap-2 text-base md:text-sm font-semibold text-brand-navy-500 mb-3 md:mb-1.5">
            <Gauge weight="duotone" className="w-5 h-5 md:w-5 md:h-5 text-brand-teal-600" />
            Type meter
          </label>
          <div className="grid grid-cols-3 gap-2 md:gap-2">
            {[
              { value: 'slim', label: 'Slim', icon: DeviceMobile },
              { value: 'oud', label: 'Oud', icon: Gauge },
              { value: 'weet_niet', label: 'Weet niet', icon: CheckCircle },
            ].map((option) => {
              const Icon = option.icon
              const isSelected = meterType === option.value
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setMeterType(option.value as any)
                    setValue('meterType', option.value as any)
                  }}
                  className={`p-3.5 md:p-2.5 rounded-xl border-2 transition-all active:scale-[0.97] ${
                    isSelected
                      ? 'border-brand-teal-500 bg-brand-teal-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <Icon weight="duotone" className={`w-7 h-7 md:w-6 md:h-6 mx-auto mb-1.5 ${isSelected ? 'text-brand-teal-600' : 'text-gray-400'}`} />
                  <div className={`text-sm md:text-xs font-semibold ${isSelected ? 'text-brand-teal-700' : 'text-gray-700'}`}>
                    {option.label}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Aansluitwaarden (Automatisch geschat, compacter voor QuickCalc) */}
        <div className="bg-brand-purple-50/70 border-2 border-brand-purple-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Plugs weight="duotone" className="w-5 h-5 text-brand-purple-600 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-sm md:text-xs font-semibold text-brand-navy-500 block">Aansluitwaarden</span>
              <span className="text-xs text-gray-600 block">Automatisch geschat op basis van je verbruik</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Elektriciteit</label>
              <select
                value={aansluitwaardeElektriciteit}
                onChange={(e) => {
                  setAansluitwaardeElektriciteit(e.target.value)
                  setValue('aansluitwaardeElektriciteit', e.target.value)
                }}
                className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-gray-200 focus:border-brand-purple-500 focus:ring-2 focus:ring-brand-purple-500/20 transition-all text-brand-navy-500 font-medium bg-white"
              >
                <option value="">Selecteer</option>
                <option value="3x25A">3x25A</option>
                <option value="3x35A">3x35A</option>
                <option value="3x50A">3x50A</option>
                <option value="3x63A">3x63A</option>
                <option value="3x80A">3x80A</option>
                <option value=">3x80A">Grootverbruik</option>
              </select>
            </div>

            {!geenGasaansluiting && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Gas</label>
                <select
                  value={aansluitwaardeGas}
                  onChange={(e) => {
                    setAansluitwaardeGas(e.target.value)
                    setValue('aansluitwaardeGas', e.target.value)
                  }}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-gray-200 focus:border-brand-purple-500 focus:ring-2 focus:ring-brand-purple-500/20 transition-all text-brand-navy-500 font-medium bg-white"
                >
                  <option value="">Selecteer</option>
                  <option value="G4">G4</option>
                  <option value="G6">G6</option>
                  <option value="G10">G10</option>
                  <option value="G16">G16</option>
                  <option value="G25">G25</option>
                  <option value=">G25">Grootverbruik</option>
                </select>
              </div>
            )}
          </div>
          
          <button
            type="button"
            onClick={() => setShowAansluitwaardeInfo(!showAansluitwaardeInfo)}
            className="text-xs text-brand-purple-700 hover:text-brand-purple-800 font-medium inline-flex items-center gap-1.5 hover:underline"
          >
            <Info weight="duotone" className="w-4 h-4" />
            Waar vind ik dit?
          </button>

          {showAansluitwaardeInfo && (
            <div className="bg-white border-2 border-brand-purple-300 rounded-lg p-3 space-y-2 text-xs text-gray-700 animate-slide-down">
              <p><strong>Elektriciteit:</strong> Staat op je meterkast (bijv. 3x25A)</p>
              <p><strong>Gas:</strong> Staat op je gasmeter (bijv. G6)</p>
              <p className="text-brand-purple-700 italic">De waarden zijn al automatisch ingevuld op basis van je verbruik, maar je kunt ze aanpassen als je wilt.</p>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full group relative px-6 md:px-6 py-5 md:py-3.5 bg-gradient-to-r from-brand-teal-500 to-brand-teal-600 text-white rounded-2xl md:rounded-lg font-bold text-lg md:text-base shadow-lg hover:shadow-xl hover:from-brand-teal-600 hover:to-brand-teal-700 active:scale-[0.99] transition-all duration-300 mt-2"
        >
          <span className="flex items-center justify-center gap-2.5 md:gap-2">
            <MagnifyingGlass weight="bold" className="w-6 h-6 md:w-5 md:h-5" />
            <span>Bekijk mijn aanbiedingen</span>
          </span>
        </button>
        <p className="text-center text-sm md:text-xs text-gray-500 -mt-1">
          100% vrijblijvend • Direct resultaat
        </p>
      </form>

      {/* Trust indicators */}
      <div className="mt-4 md:mt-4 pt-4 md:pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="flex flex-col items-center gap-1.5 md:gap-1.5 text-gray-600">
            <CheckCircle weight="fill" className="w-5 h-5 md:w-4 md:h-4 text-brand-teal-500" />
            <span className="text-center leading-tight text-xs md:text-xs font-medium">100% gratis</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 md:gap-1.5 text-gray-600">
            <CheckCircle weight="fill" className="w-5 h-5 md:w-4 md:h-4 text-brand-teal-500" />
            <span className="text-center leading-tight text-xs md:text-xs font-medium">Geen verplichtingen</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 md:gap-1.5 text-gray-600">
            <CheckCircle weight="fill" className="w-5 h-5 md:w-4 md:h-4 text-brand-teal-500" />
            <span className="text-center leading-tight text-xs md:text-xs font-medium">Privacy veilig</span>
          </div>
        </div>
      </div>
    </div>
  )
}
