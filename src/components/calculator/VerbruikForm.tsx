'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCalculatorStore } from '@/store/calculatorStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { 
  Lightning, 
  MapPin, 
  CheckCircle, 
  XCircle,
  Sun, 
  Flame, 
  DeviceMobile, 
  Lightbulb, 
  Info,
  Plus,
  Trash,
  MagnifyingGlass,
  Gauge,
  Plugs,
  ArrowsClockwise,
  Warning
} from '@phosphor-icons/react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { schatAansluitwaarden } from '@/lib/aansluitwaarde-schatting'

const verbruikSchema = z.object({
  // Elektriciteit
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
    z.number({ message: 'Vul een geldig getal in' }).min(1, 'Vul een geldig verbruik in')
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
    z.number({ message: 'Vul een geldig getal in' }).min(0, 'Vul een geldig verbruik in').nullable()
  ),
  heeftEnkeleMeter: z.boolean(),
  
  // Gas
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
    z.number({ message: 'Vul een geldig getal in' }).min(0, 'Vul een geldig verbruik in').nullable()
  ),
  geenGasaansluiting: z.boolean(),
  
  // Zonnepanelen
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
    z.number({ message: 'Vul een geldig getal in' }).min(0, 'Vul een geldige teruglevering in').nullable()
  ),
  
  // Meter type
  meterType: z.enum(['slim', 'oud', 'weet_niet']),
  
  // Aansluitwaarden (NIEUW)
  aansluitwaardeElektriciteit: z.string().optional(),
  aansluitwaardeGas: z.string().optional(),
  
  // Leveringsadressen
  leveringsadressen: z.array(z.object({
    postcode: z.string()
      .min(6, 'Vul een geldige postcode in')
      .max(7, 'Vul een geldige postcode in')
      .regex(/^\d{4}\s?[A-Za-z]{2}$/, 'Vul een geldige postcode in (1234AB of 1234 AB)')
      .transform(val => val.toUpperCase().replace(/\s/g, '').replace(/^(\d{4})([A-Z]{2})$/, '$1 $2')),
    huisnummer: z.string().min(1, 'Vul een huisnummer in'),
    toevoeging: z.string().optional(),
    straat: z.string().optional(),
    plaats: z.string().optional(),
  })).min(1, 'Voeg minimaal één leveringsadres toe'),

  // NIEUW: Address type van BAG API
  addressType: z.enum(['particulier', 'zakelijk']).nullable().optional(),
})

type VerbruikFormData = z.infer<typeof verbruikSchema>

export function VerbruikForm() {
  const router = useRouter()
  const { setVerbruik, setAddressType } = useCalculatorStore()
  
  // State
  const [heeftEnkeleMeter, setHeeftEnkeleMeter] = useState(false)
  const [geenGasaansluiting, setGeenGasaansluiting] = useState(false)
  const [heeftZonnepanelen, setHeeftZonnepanelen] = useState(false)
  const [meterType, setMeterType] = useState<'slim' | 'oud' | 'weet_niet'>('weet_niet')
  // Ref om oorspronkelijke elektriciteitDal waarde te bewaren
  const savedElektriciteitDal = useRef<number | null>(null)
  const [leveringsadressen, setLeveringsadressen] = useState([
    { postcode: '', huisnummer: '', toevoeging: '', straat: '', plaats: '' }
  ])
  const [loadingAddresses, setLoadingAddresses] = useState<{ [key: number]: boolean }>({})
  const [showHelpSchatten, setShowHelpSchatten] = useState(false)
  const [schattingVierkanteMeter, setSchattingVierkanteMeter] = useState('')
  const [schattingType, setSchattingType] = useState<'kantoor' | 'retail' | 'horeca' | 'productie' | 'overig'>('kantoor')
  // Aansluitwaarden (automatisch geschat, door klant aanpasbaar)
  const [aansluitwaardeElektriciteit, setAansluitwaardeElektriciteit] = useState('')
  const [aansluitwaardeGas, setAansluitwaardeGas] = useState('')
  const [showAansluitwaardeInfo, setShowAansluitwaardeInfo] = useState(false)
  // Ref om laatste lookup te tracken (voorkomt dubbele calls)
  const lastLookup = useRef<{ [key: number]: string }>({})
  // Debounce timers
  const debounceTimers = useRef<{ [key: number]: NodeJS.Timeout }>({})
  // Request counter voor race condition preventie (unieke ID per API call)
  const requestCounter = useRef<{ [key: number]: number }>({})
  // Request counter voor BAG API calls (race condition preventie)
  const bagRequestCounter = useRef<{ [key: number]: number }>({})
  // Debounce timer voor aansluitwaarde schatting
  const aansluitwaardeTimer = useRef<NodeJS.Timeout | null>(null)

  // NIEUW: State voor address type check (per adres index)
  const [addressTypeResult, setAddressTypeResult] = useState<{ [key: number]: {
    type: 'particulier' | 'zakelijk' | 'error';
    message: string;
    street?: string;
    city?: string;
  } | null }>({});
  const [checkingAddressType, setCheckingAddressType] = useState<{ [key: number]: boolean }>({});
  const [manualAddressTypeOverride, setManualAddressTypeOverride] = useState<{ [key: number]: 'particulier' | 'zakelijk' | null }>({});
  const [originalBagResult, setOriginalBagResult] = useState<{ [key: number]: 'particulier' | 'zakelijk' | null }>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    clearErrors,
    watch,
  } = useForm<any>({
    resolver: zodResolver(verbruikSchema) as any,
    defaultValues: {
      elektriciteitNormaal: 0,
      heeftEnkeleMeter: false,
      geenGasaansluiting: false,
      heeftZonnepanelen: false,
      meterType: 'weet_niet' as 'slim' | 'oud' | 'weet_niet',
      elektriciteitDal: null,
      gasJaar: null,
      terugleveringJaar: null,
      aansluitwaardeElektriciteit: '',
      aansluitwaardeGas: '',
      leveringsadressen: [{ postcode: '', huisnummer: '', toevoeging: '', straat: '', plaats: '' }],
      addressType: null, // NIEUW: default value voor address type
    },
  })

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer))
      if (aansluitwaardeTimer.current) clearTimeout(aansluitwaardeTimer.current)
    }
  }, [])

  // Schat aansluitwaarden automatisch op basis van verbruik
  const [verbruikWatched, setVerbruikWatched] = useState({ elektriciteitNormaal: 0, elektriciteitDal: 0, gasJaar: 0 })

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

  // Valideer of postcode compleet is
  const isValidPostcode = (postcode: string): boolean => {
    const clean = postcode.toUpperCase().replace(/\s/g, '')
    return /^\d{4}[A-Z]{2}$/.test(clean)
  }

  // Fetch address - memoized met useCallback
  const fetchAddress = useCallback(async (index: number, postcode: string, huisnummer: string, toevoeging?: string) => {
    // Check of dit dezelfde lookup is als de laatste (voorkom dubbele calls)
    const lookupKey = `${postcode}-${huisnummer}-${toevoeging || ''}`
    if (lastLookup.current[index] === lookupKey) {
      return // Skip, we hebben dit al opgezocht
    }

    // Genereer unieke request ID voor race condition preventie
    const currentRequestId = (requestCounter.current[index] || 0) + 1
    requestCounter.current[index] = currentRequestId

    const postcodeClean = postcode.toUpperCase().replace(/\s/g, '')
    
    setLoadingAddresses(prev => ({ ...prev, [index]: true }))
    clearErrors(`leveringsadressen.${index}`)
    
    try {
      let url = `/api/postcode?postcode=${postcodeClean}&number=${huisnummer}`
      if (toevoeging && toevoeging.trim()) {
        url += `&addition=${encodeURIComponent(toevoeging.trim())}`
      }
      
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        
        // Check of dit nog steeds de laatste request is (race condition preventie)
        if (requestCounter.current[index] !== currentRequestId) {
          console.log('Ignoring stale postcode API response')
          return
        }
        
        if (data.error) {
          // API geeft error terug (maar met 200 status)
          setError(`leveringsadressen.${index}.toevoeging` as any, {
            message: data.error
          })
          // Clear BAG API result omdat adres niet geldig is
          setAddressTypeResult(prev => ({ ...prev, [index]: null }))
          setLoadingAddresses(prev => ({ ...prev, [index]: false }))
          return
        }
        
        // Update state met nieuwe data
        setLeveringsadressen(prev => {
          const updated = [...prev]
          updated[index] = {
            ...updated[index],
            straat: data.street || '',
            plaats: data.city || '',
          }
          return updated
        })
        
        setValue(`leveringsadressen.${index}.straat`, data.street || '')
        setValue(`leveringsadressen.${index}.plaats`, data.city || '')
        clearErrors(`leveringsadressen.${index}`)
        
        // Sla lookup key op
        lastLookup.current[index] = lookupKey

        // NIEUW: BAG API woonfunctie check (alleen als dit nog steeds de laatste request is)
        if (requestCounter.current[index] === currentRequestId) {
          await checkAddressType(index, postcode, huisnummer, toevoeging)
        }
      } else if (response.status === 404) {
        const errorData = await response.json()
        
        // Check of dit nog steeds de laatste request is (race condition preventie)
        if (requestCounter.current[index] !== currentRequestId) {
          console.log('Ignoring stale postcode API 404 response')
          return
        }
        
        // Check of het specifiek de toevoeging is die niet bestaat
        if (toevoeging && errorData.error && errorData.error.includes('Toevoeging')) {
          setError(`leveringsadressen.${index}.toevoeging` as any, {
            message: errorData.error
          })
        } else {
          setError(`leveringsadressen.${index}.postcode` as any, {
            message: errorData.error || 'Adres niet gevonden. Controleer postcode en huisnummer.'
          })
        }
        
        // Clear oude data EN BAG API result omdat adres niet geldig is
        setAddressTypeResult(prev => ({ ...prev, [index]: null }))
        setManualAddressTypeOverride(prev => ({ ...prev, [index]: null }))
        setLeveringsadressen(prev => {
          const updated = [...prev]
          updated[index] = {
            ...updated[index],
            straat: '',
            plaats: '',
          }
          return updated
        })
        setValue(`leveringsadressen.${index}.straat`, '')
        setValue(`leveringsadressen.${index}.plaats`, '')
      } else {
        console.error(`Postcode API error ${response.status}`)
        
        // Clear oude data
        setLeveringsadressen(prev => {
          const updated = [...prev]
          updated[index] = {
            ...updated[index],
            straat: '',
            plaats: '',
          }
          return updated
        })
      }
      
      // Alleen loading state updaten als dit nog steeds de laatste request is
      if (requestCounter.current[index] === currentRequestId) {
      setLoadingAddresses(prev => ({ ...prev, [index]: false }))
      }
    } catch (error) {
      console.error('Postcode API exception:', error)
      
      // Check of dit nog steeds de laatste request is (race condition preventie)
      if (requestCounter.current[index] !== currentRequestId) {
        console.log('Ignoring stale postcode API exception')
        return
      }
      
      setLoadingAddresses(prev => ({ ...prev, [index]: false }))
      
      // Clear oude data
      setLeveringsadressen(prev => {
        const updated = [...prev]
        updated[index] = {
          ...updated[index],
          straat: '',
          plaats: '',
        }
        return updated
      })
    }
  }, [setValue, clearErrors, setError])

  // Handler voor handmatige address type switch (per adres index)
  const handleManualAddressTypeSwitch = (index: number) => {
    const currentResult = addressTypeResult[index]
    if (!currentResult || currentResult.type === 'error') {
      return
    }

    const newType: 'particulier' | 'zakelijk' = currentResult.type === 'particulier' ? 'zakelijk' : 'particulier'
    
    // Update manual override voor dit specifieke adres
    setManualAddressTypeOverride(prev => ({ ...prev, [index]: newType }))

    // Bepaal of dit een handmatige wijziging is (verschilt van origineel)
    const originalType = originalBagResult[index]
    const isManualChange = originalType !== null && originalType !== undefined && newType !== originalType

    // Update addressTypeResult state voor dit adres met aangepaste message
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
      street: currentResult.street,
      city: currentResult.city
    }
    setAddressTypeResult(prev => ({ ...prev, [index]: newResult }))

    // Update form state (alleen voor primair adres, index 0)
    if (index === 0) {
      setValue('addressType', newType as any)
      setAddressType(newType)
    }
  }

  // NIEUW: BAG API functie voor woonfunctie check
  const checkAddressType = useCallback(async (index: number, postcode: string, huisnummer: string, toevoeging?: string) => {
    // Als er een manual override is voor dit adres, gebruik die in plaats van BAG API
    if (manualAddressTypeOverride[index]) {
      const overrideType = manualAddressTypeOverride[index]
      const currentResult = addressTypeResult[index]
      const overrideResult: {
        type: 'particulier' | 'zakelijk' | 'error';
        message: string;
        street?: string;
        city?: string;
      } = {
        type: overrideType,
        message: overrideType === 'particulier' 
          ? 'Particulier adres - geschikt voor consumentencontracten'
          : 'Zakelijk adres - geschikt voor zakelijke contracten',
        street: currentResult?.street,
        city: currentResult?.city
      }
      setAddressTypeResult(prev => ({ ...prev, [index]: overrideResult }))
      if (index === 0) {
        setValue('addressType', overrideType as any)
        setAddressType(overrideType)
      }
      return
    }

    // Genereer unieke request ID voor race condition preventie
    const currentBagRequestId = (bagRequestCounter.current[index] || 0) + 1
    bagRequestCounter.current[index] = currentBagRequestId

    setCheckingAddressType(prev => ({ ...prev, [index]: true }));
    setAddressTypeResult(prev => ({ ...prev, [index]: null }));

    try {
      const response = await fetch('/api/adres-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postcode, huisnummer, toevoeging })
      });

      const result = await response.json();
      
      // Check of dit nog steeds de laatste request is (race condition preventie)
      if (bagRequestCounter.current[index] !== currentBagRequestId) {
        console.log('Ignoring stale BAG API response')
        return
      }
      
      // Sla street en city op in result
      const resultWithDetails = {
        ...result,
        street: result.street,
        city: result.city
      }
      
      setAddressTypeResult(prev => ({ ...prev, [index]: resultWithDetails }));

      // Als het een geldig adres is, sla het type op in de form state (alleen voor primair adres)
      if (result.type !== 'error') {
        // Sla het originele BAG API resultaat op (alleen bij eerste check, niet bij manual override)
        if (!originalBagResult[index] && !manualAddressTypeOverride[index]) {
          setOriginalBagResult(prev => ({ ...prev, [index]: result.type }))
        }
        if (index === 0) {
          setValue('addressType', result.type);
          setAddressType(result.type);
        }
      }
    } catch (error) {
      console.error('Address type check error:', error);
      
      // Check of dit nog steeds de laatste request is (race condition preventie)
      if (bagRequestCounter.current[index] !== currentBagRequestId) {
        return
      }
      
      setAddressTypeResult(prev => ({
        ...prev,
        [index]: {
          type: 'error',
          message: 'Kon adres type niet controleren'
        }
      }));
    } finally {
      // Alleen loading state updaten als dit nog steeds de laatste request is
      if (bagRequestCounter.current[index] === currentBagRequestId) {
        setCheckingAddressType(prev => ({ ...prev, [index]: false }));
      }
    }
  }, [setValue, manualAddressTypeOverride, addressTypeResult, setAddressType]);

  const handleLeveringsadresChange = (index: number, field: string, value: string) => {
    // Update state
    setLeveringsadressen(prev => {
      const updated = [...prev]
      
      // Als postcode, huisnummer OF toevoeging wijzigt, clear de oude adres data EN lookup key
      if (field === 'postcode' || field === 'huisnummer' || field === 'toevoeging') {
        updated[index] = {
          ...updated[index],
          [field]: value,
          straat: '', // Clear oude straat
          plaats: '', // Clear oude plaats
        }
        setValue(`leveringsadressen.${index}.straat`, '')
        setValue(`leveringsadressen.${index}.plaats`, '')
        
        // Clear BAG API result omdat adres is gewijzigd
        setAddressTypeResult(prev => ({ ...prev, [index]: null }))
        // Reset manual override en origineel resultaat als adres wijzigt
        setManualAddressTypeOverride(prev => ({ ...prev, [index]: null }))
        setOriginalBagResult(prev => ({ ...prev, [index]: null }))
        
        // Reset lookup key zodat we opnieuw kunnen zoeken
        delete lastLookup.current[index]
      } else {
        updated[index] = { ...updated[index], [field]: value }
      }
      
      return updated
    })
    
    setValue(`leveringsadressen.${index}.${field}` as any, value)

    // Clear oude timer
    if (debounceTimers.current[index]) {
      clearTimeout(debounceTimers.current[index])
      delete debounceTimers.current[index]
    }

    // Alleen API call als beide velden ingevuld zijn (postcode + huisnummer, toevoeging is optioneel)
    if (field === 'postcode' || field === 'huisnummer' || field === 'toevoeging') {
      // Haal huidige waarden op
      const currentAdres = leveringsadressen[index]
      const postcode = field === 'postcode' ? value : currentAdres.postcode
      const huisnummer = field === 'huisnummer' ? value : currentAdres.huisnummer
      const toevoeging = field === 'toevoeging' ? value : currentAdres.toevoeging
      
      // Check of beide verplichte velden ingevuld zijn EN postcode is geldig
      if (postcode && huisnummer && postcode.length >= 6 && huisnummer.length >= 1) {
        if (isValidPostcode(postcode)) {
          // Start debounce timer (800ms om zeker te zijn dat gebruiker klaar is)
          debounceTimers.current[index] = setTimeout(() => {
            fetchAddress(index, postcode, huisnummer, toevoeging)
          }, 800)
        }
      }
    }
  }

  const toevoegenLeveringsadres = () => {
    if (leveringsadressen.length < 5) {
      const newAddress = { postcode: '', huisnummer: '', toevoeging: '', straat: '', plaats: '' }
      setLeveringsadressen([...leveringsadressen, newAddress])
      setValue('leveringsadressen', [...leveringsadressen, newAddress])
    }
  }

  const verwijderLeveringsadres = (index: number) => {
    if (leveringsadressen.length > 1) {
      // Clear timer voor dit adres
      if (debounceTimers.current[index]) {
        clearTimeout(debounceTimers.current[index])
        delete debounceTimers.current[index]
      }
      
      // Clear lookup key
      delete lastLookup.current[index]
      
      const updated = leveringsadressen.filter((_, i) => i !== index)
      setLeveringsadressen(updated)
      setValue('leveringsadressen', updated)
    }
  }

  // Bereken geschat verbruik op basis van m² en type bedrijf
  const berekenSchatting = () => {
    const m2 = parseInt(schattingVierkanteMeter)
    if (!m2 || m2 <= 0) return

    // Gemiddeld verbruik per m² per bedrijfstype (kWh per m² per jaar)
    const verbruikPerM2: Record<typeof schattingType, { elektriciteit: number; gas: number }> = {
      kantoor: { elektriciteit: 50, gas: 25 },
      retail: { elektriciteit: 80, gas: 20 },
      horeca: { elektriciteit: 150, gas: 80 },
      productie: { elektriciteit: 120, gas: 60 },
      overig: { elektriciteit: 70, gas: 30 },
    }

    const schatting = verbruikPerM2[schattingType]
    const geschatElektriciteit = Math.round(m2 * schatting.elektriciteit)
    const geschatGas = Math.round(m2 * schatting.gas)

    // Verdeel elektriciteit over normaal/dal (60/40 split voor dubbele meter)
    if (!heeftEnkeleMeter) {
      setValue('elektriciteitNormaal' as any, Math.round(geschatElektriciteit * 0.6))
      setValue('elektriciteitDal' as any, Math.round(geschatElektriciteit * 0.4))
    } else {
      setValue('elektriciteitNormaal' as any, geschatElektriciteit)
      setValue('elektriciteitDal', null)
    }

    if (!geenGasaansluiting) {
      setValue('gasJaar' as any, geschatGas)
    }

    setShowHelpSchatten(false)
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
        const hasError = fieldName.includes('.') 
          ? (errors.leveringsadressen as any)?.[0]?.[fieldName.split('.')[2] as string]
          : (errors as any)[fieldName]
        
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

  const onSubmit = (data: VerbruikFormData) => {
    setVerbruik({
      elektriciteitNormaal: data.elektriciteitNormaal,
      elektriciteitDal: heeftEnkeleMeter ? null : data.elektriciteitDal,
      heeftEnkeleMeter,
      gasJaar: geenGasaansluiting ? null : data.gasJaar,
      geenGasaansluiting,
      heeftZonnepanelen,
      terugleveringJaar: heeftZonnepanelen ? data.terugleveringJaar : null,
      meterType: data.meterType,
      aansluitwaardeElektriciteit: aansluitwaardeElektriciteit,
      aansluitwaardeGas: aansluitwaardeGas,
      leveringsadressen: data.leveringsadressen,
      addressType: data.addressType || null, // NIEUW: address type toevoegen
      geschat: false,
    })
    
    router.push('/calculator/resultaten')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, scrollToFirstError)} className="space-y-4 md:space-y-6">
      {/* Leveringsadres */}
      <div className="md:bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm md:p-6">
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-teal-500 rounded-xl flex items-center justify-center">
              <MapPin weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div>
              <h3 className="text-lg md:text-xl font-bold text-brand-navy-500">Waar wordt de energie geleverd?</h3>
              <p className="text-xs md:text-sm text-gray-600">Vul je postcode en huisnummer in</p>
          </div>
        </div>

        {leveringsadressen.map((adres, index) => (
          <div key={index} className="bg-gray-50 border-2 border-gray-200 rounded-xl p-3 md:p-6 space-y-3 md:space-y-4">
            {leveringsadressen.length > 1 && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Adres {index + 1}</span>
                <button
                  type="button"
                  onClick={() => verwijderLeveringsadres(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash weight="duotone" className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Desktop: compactere grid */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 md:gap-4">
              <div className="md:col-span-3">
                <Input
                  label="Postcode"
                  type="text"
                  value={adres.postcode}
                  onChange={(e) => handleLeveringsadresChange(index, 'postcode', e.target.value)}
                  placeholder="1234 AB"
                  error={(errors.leveringsadressen as any)?.[index]?.postcode?.message}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  label="Huisnummer"
                  type="text"
                  value={adres.huisnummer}
                  onChange={(e) => handleLeveringsadresChange(index, 'huisnummer', e.target.value)}
                  placeholder="12"
                  error={errors.leveringsadressen?.[index]?.huisnummer?.message}
                  required
                />
              </div>
              <div className="md:col-span-1">
                <Input
                  label="Toev."
                  type="text"
                  value={adres.toevoeging || ''}
                  onChange={(e) => handleLeveringsadresChange(index, 'toevoeging', e.target.value)}
                  placeholder="A"
                  error={errors.leveringsadressen?.[index]?.toevoeging?.message}
                />
              </div>
            </div>

            {/* Gecombineerde loading state: zichtbaar zolang één van beide API calls bezig is */}
            {(loadingAddresses[index] || checkingAddressType[index]) && (
              <div className="flex items-center gap-2 text-xs md:text-sm text-brand-teal-600 animate-slide-down">
                <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-brand-teal-300 border-t-brand-teal-600 rounded-full animate-spin" />
                <span>
                  {loadingAddresses[index] && !checkingAddressType 
                    ? 'Adres opzoeken...' 
                    : checkingAddressType 
                    ? 'Adres controleren...' 
                    : 'Adres controleren...'}
                </span>
              </div>
            )}

            {/* Gecombineerde status: BAG API resultaat (prioriteit) of postcode API success */}
            {!checkingAddressType[index] && !loadingAddresses[index] && (
              <>
                {/* BAG API resultaat heeft prioriteit */}
                {addressTypeResult[index] ? (
                  <div className={`flex items-start gap-2 p-2.5 md:p-3 rounded-lg animate-slide-down ${
                    addressTypeResult[index]!.type === 'error'
                      ? 'bg-red-50 border border-red-200'
                      : addressTypeResult[index]!.type === 'particulier'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-blue-50 border border-blue-200'
                  }`}>
                    {addressTypeResult[index]!.type === 'error' ? (
                      <XCircle weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    ) : addressTypeResult[index]!.type === 'particulier' ? (
                      <CheckCircle weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className={`flex-1 text-xs md:text-sm ${
                      addressTypeResult[index]!.type === 'error'
                        ? 'text-red-900'
                        : addressTypeResult[index]!.type === 'particulier'
                        ? 'text-green-900'
                        : 'text-blue-900'
                    }`}>
                      {/* Toon adres als beschikbaar */}
                      {(adres.straat && adres.plaats) && (
                        <div className="font-semibold mb-1">
                          {adres.straat} {adres.huisnummer}{adres.toevoeging ? ` ${adres.toevoeging}` : ''}, {adres.postcode} {adres.plaats}
                        </div>
                      )}
                      <div className="whitespace-pre-line">{addressTypeResult[index]!.message}</div>
                      
                      {/* NIEUW: Handmatige switch knop (alleen bij succes, niet bij error) */}
                      {addressTypeResult[index]!.type !== 'error' && (
                        <button
                          type="button"
                          onClick={() => handleManualAddressTypeSwitch(index)}
                          className="mt-2 text-xs text-gray-600 hover:text-gray-900 underline flex items-center gap-1 transition-colors"
                        >
                          Wijzig naar {addressTypeResult[index]!.type === 'particulier' ? 'zakelijk' : 'particulier'}
                          <ArrowsClockwise weight="bold" className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Fallback: alleen postcode API success (als BAG check nog niet gedaan) */
                  adres.straat && adres.plaats && (
                    <div className="flex items-start gap-2 p-2.5 md:p-3 bg-brand-teal-50 border border-brand-teal-200 rounded-lg animate-slide-down">
                      <CheckCircle weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-brand-teal-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs md:text-sm text-brand-teal-900">
                  <div className="font-semibold">
                    {adres.straat} {adres.huisnummer}{adres.toevoeging ? ` ${adres.toevoeging}` : ''}
                  </div>
                  <div>{adres.postcode} {adres.plaats}</div>
                </div>
              </div>
                  )
                )}
              </>
            )}
          </div>
        ))}

        {leveringsadressen.length < 5 && (
          <button
            type="button"
            onClick={toevoegenLeveringsadres}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-3 py-2 md:px-4 md:py-3 border-2 border-dashed border-brand-teal-300 text-brand-teal-600 hover:border-brand-teal-500 hover:bg-brand-teal-50 rounded-xl text-sm md:text-base font-semibold transition-all"
          >
            <Plus weight="bold" className="w-5 h-5" />
            Extra leveringsadres toevoegen
          </button>
        )}
        </div>
      </div>

      {/* Elektriciteitsverbruik */}
      <div className="md:bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm md:p-6">
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center justify-between gap-2 md:gap-3">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-teal-500 rounded-xl flex items-center justify-center">
                <Lightning weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
                <h3 className="text-lg md:text-xl font-bold text-brand-navy-500">Elektriciteitsverbruik</h3>
                <p className="text-xs md:text-sm text-gray-600">Je vindt dit op je laatste jaarafrekening</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowHelpSchatten(true)}
              className="flex items-center gap-1.5 md:gap-2 px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm font-medium text-brand-teal-600 hover:text-brand-teal-700 hover:bg-brand-teal-50 rounded-lg transition-all"
          >
              <Lightbulb weight="duotone" className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden md:inline">Help me schatten</span>
          </button>
        </div>

          <div className="bg-brand-teal-50/50 border-2 border-brand-teal-200 rounded-xl p-4 md:p-6 space-y-3 md:space-y-4">
          {/* Desktop: grid voor normaal + dal naast elkaar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <Input
              label={heeftEnkeleMeter ? 'Totaal verbruik per jaar' : 'Normaal tarief (overdag)'}
                  type="number"
                  {...register('elektriciteitNormaal', { 
                    valueAsNumber: true,
                    onChange: (e) => setVerbruikWatched(prev => ({ ...prev, elektriciteitNormaal: Number(e.target.value) || 0 }))
                  })}
                  placeholder="Bijv. 3500"
              error={errors.elektriciteitNormaal?.message}
              required
            />

            {!heeftEnkeleMeter && (
              <div className="animate-slide-down">
                <Input
                  label="Dal tarief (nacht/weekend)"
                    type="number"
                    {...register('elektriciteitDal', { 
                      valueAsNumber: true,
                      onChange: (e) => setVerbruikWatched(prev => ({ ...prev, elektriciteitDal: Number(e.target.value) || 0 }))
                    })}
                    placeholder="Bijv. 2500"
                  error={errors.elektriciteitDal?.message}
                  required
                />
              </div>
            )}
          </div>

          <label className="flex items-start gap-2 md:gap-3 cursor-pointer group p-3 md:p-4 rounded-xl hover:bg-white/50 transition-colors">
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
                  if (currentDal !== null && currentDal !== undefined) {
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
              className="w-4 h-4 md:w-5 md:h-5 mt-0.5 rounded-md border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-offset-2 flex-shrink-0"
            />
            <div>
              <span className="text-xs md:text-sm font-medium text-brand-navy-500 group-hover:text-brand-teal-600 transition-colors">
                Ik heb een enkele meter
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                Vink dit aan als je geen dag/nacht tarief hebt
              </p>
            </div>
          </label>

          <div className="flex items-start gap-2 p-2.5 md:p-3 bg-brand-navy-50 border border-brand-navy-200 rounded-lg">
            <Info weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-brand-navy-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-brand-navy-700 leading-relaxed">
              <strong>Tip:</strong> Bij een dubbele meter betaal je overdag een ander tarief dan 's nachts en in het weekend. 
              Bij een enkele meter is er maar één tarief.
            </p>
          </div>
          </div>
        </div>
      </div>

      {/* Zonnepanelen */}
      <div className="md:bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm md:p-6">
        <div className="space-y-3 md:space-y-4">
          <label className="flex items-center gap-2 md:gap-3 cursor-pointer group p-3 md:p-4 bg-brand-teal-50 border-2 border-brand-teal-200 rounded-xl hover:border-brand-teal-300 transition-all">
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
              className="w-4 h-4 md:w-5 md:h-5 rounded-md border-2 border-brand-teal-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-offset-2 flex-shrink-0"
          />
          <Sun weight="duotone" className="w-5 h-5 md:w-6 md:h-6 text-brand-teal-600 flex-shrink-0" />
          <span className="text-sm md:text-base font-semibold text-brand-navy-500 group-hover:text-brand-teal-700 transition-colors">
            Ja, wij hebben zonnepanelen
          </span>
        </label>

        {heeftZonnepanelen && (
          <div className="animate-slide-down bg-brand-teal-50 border-2 border-brand-teal-200 rounded-xl p-4 md:p-6 space-y-3 md:space-y-4">
            <Input
              label="Teruglevering per jaar"
                  type="number"
                  {...register('terugleveringJaar', { valueAsNumber: true })}
                  placeholder="Bijv. 3000"
              error={errors.terugleveringJaar?.message}
              required
            />
            
            <button
              type="button"
              onClick={() => setShowHelpSchatten(true)}
              className="text-sm text-brand-teal-600 hover:text-brand-teal-700 font-medium underline inline-flex items-center gap-1"
            >
              <Lightbulb weight="duotone" className="w-4 h-4" />
              Weet je het niet? Laat ons het schatten
            </button>

            <div className="flex items-start gap-2 p-2.5 md:p-3 bg-brand-navy-50 border border-brand-navy-200 rounded-lg">
              <Lightbulb weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-brand-navy-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-brand-navy-700 leading-relaxed">
                <strong>Waarom belangrijk?</strong> Met teruglevering kunnen we dynamische contracten aanbevelen 
                die optimaal profiteren van je energieopbrengst en de salderingsregeling.
              </p>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Gasverbruik */}
      <div className="md:bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm md:p-6">
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-teal-500 rounded-xl flex items-center justify-center">
              <Flame weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div>
              <h3 className="text-lg md:text-xl font-bold text-brand-navy-500">Gasverbruik</h3>
              <p className="text-xs md:text-sm text-gray-600">Ook te vinden op je jaarafrekening</p>
          </div>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {!geenGasaansluiting && (
            <div className="bg-brand-teal-50/50 border-2 border-brand-teal-200 rounded-xl p-4 md:p-6">
                <Input
                  label="Gasverbruik per jaar"
                  type="number"
                  {...register('gasJaar', { 
                    valueAsNumber: true,
                    onChange: (e) => setVerbruikWatched(prev => ({ ...prev, gasJaar: Number(e.target.value) || 0 }))
                  })}
                  placeholder="Bijv. 1200"
                  error={errors.gasJaar?.message}
                  required
                />
            </div>
          )}

          <label className="flex items-start gap-2 md:gap-3 cursor-pointer group p-3 md:p-4 rounded-xl hover:bg-gray-50 transition-colors border-2 border-gray-200">
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
              className="w-4 h-4 md:w-5 md:h-5 mt-0.5 rounded-md border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-offset-2 flex-shrink-0"
            />
            <div>
              <span className="text-xs md:text-sm font-medium text-brand-navy-500 group-hover:text-brand-teal-600 transition-colors">
                Wij hebben geen gasaansluiting
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                Bijvoorbeeld bij volledig elektrisch verwarmen
              </p>
            </div>
          </label>
        </div>
        </div>
      </div>

      {/* Meter type */}
      <div className="md:bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm md:p-6">
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-teal-500 rounded-xl flex items-center justify-center">
              <Gauge weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div>
              <h3 className="text-lg md:text-xl font-bold text-brand-navy-500">Type meter</h3>
              <p className="text-xs md:text-sm text-gray-600">Helpt ons de beste contracten te vinden</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
          {[
            { value: 'slim', label: 'Slimme meter', icon: DeviceMobile, desc: 'Digitale uitlezing' },
            { value: 'oud', label: 'Oude meter', icon: Gauge, desc: 'Draaiende schijf' },
            { value: 'weet_niet', label: 'Weet ik niet', icon: CheckCircle, desc: 'Standaard' },
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
                className={`p-3 md:p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-brand-teal-500 bg-brand-teal-50'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon weight="duotone" className={`w-6 h-6 md:w-8 md:h-8 mb-1.5 md:mb-2 ${isSelected ? 'text-brand-teal-600' : 'text-gray-400'}`} />
                <div className={`text-xs md:text-sm font-semibold mb-0.5 md:mb-1 ${isSelected ? 'text-brand-teal-700' : 'text-gray-700'}`}>
                  {option.label}
                </div>
                <div className="text-xs text-gray-500">{option.desc}</div>
              </button>
            )
          })}
        </div>
        </div>
      </div>

      {/* Aansluitwaarden (Automatisch geschat, aanpasbaar) */}
      <div className="md:bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm md:p-6">
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-purple-500 rounded-xl flex items-center justify-center">
              <Plugs weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div>
              <h3 className="text-lg md:text-xl font-bold text-brand-navy-500">Aansluitwaarden</h3>
              <p className="text-xs md:text-sm text-gray-600">Automatisch geschat op basis van je verbruik</p>
          </div>
        </div>

          <div className="bg-brand-purple-50/50 border-2 border-brand-purple-200 rounded-xl p-4 md:p-6 space-y-3 md:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {/* Elektriciteit Aansluitwaarde */}
            <div>
              <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
                Elektriciteit <span className="text-red-500">*</span>
              </label>
              <select
                value={aansluitwaardeElektriciteit}
                onChange={(e) => {
                  setAansluitwaardeElektriciteit(e.target.value)
                  setValue('aansluitwaardeElektriciteit', e.target.value)
                }}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-brand-purple-500 focus:ring-2 focus:ring-brand-purple-500/20 transition-all text-brand-navy-500 font-medium bg-white"
              >
                <option value="">Selecteer aansluitwaarde</option>
                <option value="3x25A">3x25A</option>
                <option value="3x35A">3x35A</option>
                <option value="3x50A">3x50A</option>
                <option value="3x63A">3x63A</option>
                <option value="3x80A">3x80A</option>
                <option value=">3x80A">Grootverbruik</option>
              </select>
            </div>

            {/* Gas Aansluitwaarde */}
            {!geenGasaansluiting && (
              <div>
                <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
                  Gas <span className="text-red-500">*</span>
                </label>
                <select
                  value={aansluitwaardeGas}
                  onChange={(e) => {
                    setAansluitwaardeGas(e.target.value)
                    setValue('aansluitwaardeGas', e.target.value)
                  }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-brand-purple-500 focus:ring-2 focus:ring-brand-purple-500/20 transition-all text-brand-navy-500 font-medium bg-white"
                >
                  <option value="">Selecteer aansluitwaarde</option>
                  <option value="G6">G6</option>
                  <option value="G10">G10</option>
                  <option value="G16">G16</option>
                  <option value="G25">G25</option>
                  <option value=">G25">Grootverbruik</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 p-2.5 md:p-3 bg-brand-purple-100 border border-brand-purple-300 rounded-lg">
            <Info weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-brand-purple-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-brand-purple-900 leading-relaxed">
              <strong>Automatisch geschat:</strong> We hebben de aansluitwaarden automatisch geschat op basis van je verbruik. 
              Dit is meestal correct, maar je kunt het handmatig aanpassen als je zeker bent van een andere waarde. 
              De aansluitwaarde staat op je meterkast en beïnvloedt de netbeheerkosten.
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAansluitwaardeInfo(!showAansluitwaardeInfo)}
            className="text-sm text-brand-purple-600 hover:text-brand-purple-700 font-medium underline inline-flex items-center gap-1"
          >
            <Info weight="duotone" className="w-4 h-4" />
            Waar vind ik mijn aansluitwaarde?
          </button>

          {showAansluitwaardeInfo && (
            <div className="bg-white border-2 border-brand-purple-300 rounded-lg p-4 space-y-2 animate-slide-down">
              <h4 className="font-semibold text-brand-navy-500 text-sm">Elektriciteit aansluitwaarde vinden:</h4>
              <ul className="text-xs text-gray-700 space-y-1 ml-4 list-disc">
                <li>Kijk op de hoofdzekering in je meterkast (bijv. "3x25A")</li>
                <li>Staat op je aansluitovereenkomst van de netbeheerder</li>
                <li>Neem contact op met je netbeheerder (Liander, Stedin, Enexis, etc.)</li>
              </ul>
              <h4 className="font-semibold text-brand-navy-500 text-sm mt-4">Gas aansluitwaarde vinden:</h4>
              <ul className="text-xs text-gray-700 space-y-1 ml-4 list-disc">
                <li>Kijk op de gasmeter (bijv. "G6" of "G4")</li>
                <li>Staat op je aansluitovereenkomst</li>
                <li>De meeste huishoudens hebben G4 of G6</li>
              </ul>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Submit */}
      <div className="pt-4 md:pt-6">
        <Button type="submit" size="lg" className="w-full bg-brand-teal-500 hover:bg-brand-teal-600">
          <MagnifyingGlass weight="bold" className="w-4 h-4 md:w-5 md:h-5 mr-2" />
          Bekijk mijn aanbiedingen
        </Button>
        <p className="text-center text-xs md:text-sm text-gray-500 mt-3 md:mt-4">
          100% vrijblijvend • Direct resultaat • Geen verplichtingen
        </p>
      </div>

      {/* Help Schatten Modal */}
      {showHelpSchatten && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-teal-500 rounded-xl flex items-center justify-center">
                    <Lightbulb weight="duotone" className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-navy-500">Help me schatten</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHelpSchatten(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-sm text-gray-600">
                We schatten je verbruik op basis van je bedrijfsoppervlak en type bedrijf.
              </p>

              {/* Vierkante meters */}
              <div>
                <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
                  Hoeveel vierkante meter heeft je bedrijf? <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={schattingVierkanteMeter}
                    onChange={(e) => setSchattingVierkanteMeter(e.target.value)}
                    placeholder="Bijv. 250"
                    className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-300 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all text-brand-navy-500 font-medium"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    m²
                  </span>
                </div>
              </div>

              {/* Type bedrijf */}
              <div>
                <label className="block text-sm font-semibold text-brand-navy-500 mb-3">
                  Type bedrijf <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'kantoor' as const, label: 'Kantoor', desc: '~50 kWh/m²' },
                    { value: 'retail' as const, label: 'Retail', desc: '~80 kWh/m²' },
                    { value: 'horeca' as const, label: 'Horeca', desc: '~150 kWh/m²' },
                    { value: 'productie' as const, label: 'Productie', desc: '~120 kWh/m²' },
                    { value: 'overig' as const, label: 'Overig', desc: '~70 kWh/m²' },
                  ].map((option) => {
                    const isSelected = schattingType === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSchattingType(option.value)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          isSelected
                            ? 'border-brand-teal-500 bg-brand-teal-50 shadow-md'
                            : 'border-gray-200 hover:border-brand-teal-300'
                        }`}
                      >
                        <div className={`text-sm font-semibold ${isSelected ? 'text-brand-teal-700' : 'text-gray-900'}`}>
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">{option.desc}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Voorbeeld berekening */}
              {schattingVierkanteMeter && parseInt(schattingVierkanteMeter) > 0 && (
                <div className="bg-brand-teal-50 border border-brand-teal-200 rounded-lg p-4 animate-slide-down">
                  <div className="text-sm font-semibold text-brand-teal-900 mb-2">Geschat verbruik:</div>
                  <div className="space-y-1 text-sm text-brand-teal-700">
                    <div>⚡ Elektriciteit: ~{Math.round(parseInt(schattingVierkanteMeter) * ({ kantoor: 50, retail: 80, horeca: 150, productie: 120, overig: 70 }[schattingType])).toLocaleString()} kWh/jaar</div>
                    <div>🔥 Gas: ~{Math.round(parseInt(schattingVierkanteMeter) * ({ kantoor: 25, retail: 20, horeca: 80, productie: 60, overig: 30 }[schattingType])).toLocaleString()} m³/jaar</div>
                  </div>
                  <p className="text-xs text-brand-teal-600 mt-2">
                    * Dit is een schatting. Je kunt de waarden later nog aanpassen.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                type="button"
                onClick={() => setShowHelpSchatten(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Annuleren
              </button>
              <button
                type="button"
                onClick={berekenSchatting}
                disabled={!schattingVierkanteMeter || parseInt(schattingVierkanteMeter) <= 0}
                className="flex-1 px-4 py-3 bg-brand-teal-500 text-white rounded-xl font-semibold hover:bg-brand-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              >
                Gebruik schatting
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
