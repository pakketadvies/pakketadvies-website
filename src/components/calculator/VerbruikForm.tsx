'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCalculatorStore } from '@/store/calculatorStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { 
  Lightning, 
  MapPin, 
  CheckCircle, 
  Sun, 
  Flame, 
  DeviceMobile, 
  Lightbulb, 
  Info,
  Plus,
  Trash,
  MagnifyingGlass,
  Gauge,
  Plugs
} from '@phosphor-icons/react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { schatAansluitwaarden } from '@/lib/aansluitwaarde-schatting'

const verbruikSchema = z.object({
  // Elektriciteit
  elektriciteitNormaal: z.number().min(1, 'Vul een geldig verbruik in'),
  elektriciteitDal: z.number().min(0, 'Vul een geldig verbruik in').nullable(),
  heeftEnkeleMeter: z.boolean(),
  
  // Gas
  gasJaar: z.number().min(0, 'Vul een geldig verbruik in').nullable(),
  geenGasaansluiting: z.boolean(),
  
  // Zonnepanelen
  heeftZonnepanelen: z.boolean(),
  terugleveringJaar: z.number().min(0, 'Vul een geldige teruglevering in').nullable(),
  
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
})

type VerbruikFormData = z.infer<typeof verbruikSchema>

export function VerbruikForm() {
  const router = useRouter()
  const { setVerbruik } = useCalculatorStore()
  
  // State
  const [heeftEnkeleMeter, setHeeftEnkeleMeter] = useState(false)
  const [geenGasaansluiting, setGeenGasaansluiting] = useState(false)
  const [heeftZonnepanelen, setHeeftZonnepanelen] = useState(false)
  const [meterType, setMeterType] = useState<'slim' | 'oud' | 'weet_niet'>('weet_niet')
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
  // Debounce timer voor aansluitwaarde schatting
  const aansluitwaardeTimer = useRef<NodeJS.Timeout | null>(null)

  // NIEUW: State voor address type check
  const [addressTypeResult, setAddressTypeResult] = useState<{
    type: 'particulier' | 'zakelijk' | 'error';
    message: string;
  } | null>(null);
  const [checkingAddressType, setCheckingAddressType] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    clearErrors,
  } = useForm<VerbruikFormData>({
    resolver: zodResolver(verbruikSchema),
    defaultValues: {
      heeftEnkeleMeter: false,
      geenGasaansluiting: false,
      heeftZonnepanelen: false,
      meterType: 'weet_niet',
      elektriciteitDal: null,
      gasJaar: null,
      terugleveringJaar: null,
      aansluitwaardeElektriciteit: '',
      aansluitwaardeGas: '',
      leveringsadressen: [{ postcode: '', huisnummer: '', toevoeging: '', straat: '', plaats: '' }],
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
        
        if (data.error) {
          // API geeft error terug (maar met 200 status)
          setError(`leveringsadressen.${index}.toevoeging` as any, {
            message: data.error
          })
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

        // NIEUW: BAG API woonfunctie check
        await checkAddressType(postcode, huisnummer, toevoeging)
      } else if (response.status === 404) {
        const errorData = await response.json()
        
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
      
      setLoadingAddresses(prev => ({ ...prev, [index]: false }))
    } catch (error) {
      console.error('Postcode API exception:', error)
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

  // NIEUW: BAG API functie voor woonfunctie check
  const checkAddressType = useCallback(async (postcode: string, huisnummer: string, toevoeging?: string) => {
    setCheckingAddressType(true);
    setAddressTypeResult(null);

    try {
      const response = await fetch('/api/adres-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postcode, huisnummer, toevoeging })
      });

      const result = await response.json();
      setAddressTypeResult(result);

      // Als het een geldig adres is, sla het type op in de form state
      if (result.type !== 'error') {
        // Update de verbruik data met address type
        setValue('addressType', result.type);
      }
    } catch (error) {
      console.error('Address type check error:', error);
      setAddressTypeResult({
        type: 'error',
        message: 'Kon adres type niet controleren'
      });
    } finally {
      setCheckingAddressType(false);
    }
  }, [setValue]);

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
      setValue('elektriciteitNormaal', Math.round(geschatElektriciteit * 0.6))
      setValue('elektriciteitDal', Math.round(geschatElektriciteit * 0.4))
    } else {
      setValue('elektriciteitNormaal', geschatElektriciteit)
      setValue('elektriciteitDal', null)
    }

    if (!geenGasaansluiting) {
      setValue('gasJaar', geschatGas)
    }

    setShowHelpSchatten(false)
  }

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
      {/* Leveringsadres */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-brand-teal-500 rounded-xl flex items-center justify-center">
            <MapPin weight="duotone" className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-brand-navy-500">Waar wordt de energie geleverd?</h3>
            <p className="text-sm text-gray-600">Vul je postcode en huisnummer in</p>
          </div>
        </div>

        {leveringsadressen.map((adres, index) => (
          <div key={index} className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 md:p-6 space-y-4">
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
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-3">
                <Input
                  label="Postcode"
                  type="text"
                  value={adres.postcode}
                  onChange={(e) => handleLeveringsadresChange(index, 'postcode', e.target.value)}
                  placeholder="1234 AB"
                  error={errors.leveringsadressen?.[index]?.postcode?.message}
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

            {loadingAddresses[index] && (
              <div className="flex items-center gap-2 text-sm text-brand-teal-600 animate-slide-down">
                <div className="w-4 h-4 border-2 border-brand-teal-300 border-t-brand-teal-600 rounded-full animate-spin" />
                <span>Adres opzoeken...</span>
              </div>
            )}

            {adres.straat && adres.plaats && !loadingAddresses[index] && (
              <div className="flex items-start gap-2 p-3 bg-brand-teal-50 border border-brand-teal-200 rounded-lg animate-slide-down">
                <CheckCircle weight="duotone" className="w-5 h-5 text-brand-teal-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-brand-teal-900">
                  <div className="font-semibold">
                    {adres.straat} {adres.huisnummer}{adres.toevoeging ? ` ${adres.toevoeging}` : ''}
                  </div>
                  <div>{adres.postcode} {adres.plaats}</div>
                </div>
              </div>
            )}

            {/* NIEUW: Address type check resultaten */}
            {checkingAddressType && (
              <div className="flex items-center gap-2 text-sm text-brand-teal-600 animate-slide-down">
                <div className="w-4 h-4 border-2 border-brand-teal-300 border-t-brand-teal-600 rounded-full animate-spin" />
                <span>Bezig met adrescontrole...</span>
              </div>
            )}

            {addressTypeResult && !checkingAddressType && (
              <div className={`flex items-start gap-2 p-3 rounded-lg animate-slide-down ${
                addressTypeResult.type === 'error'
                  ? 'bg-red-50 border border-red-200'
                  : addressTypeResult.type === 'particulier'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                {addressTypeResult.type === 'error' ? (
                  <XCircle weight="duotone" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                ) : addressTypeResult.type === 'particulier' ? (
                  <CheckCircle weight="duotone" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle weight="duotone" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                )}
                <div className={`text-sm ${
                  addressTypeResult.type === 'error'
                    ? 'text-red-900'
                    : addressTypeResult.type === 'particulier'
                    ? 'text-green-900'
                    : 'text-blue-900'
                }`}>
                  {addressTypeResult.message}
                </div>
              </div>
            )}
          </div>
        ))}

        {leveringsadressen.length < 5 && (
          <button
            type="button"
            onClick={toevoegenLeveringsadres}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-brand-teal-300 text-brand-teal-600 hover:border-brand-teal-500 hover:bg-brand-teal-50 rounded-xl font-semibold transition-all"
          >
            <Plus weight="bold" className="w-5 h-5" />
            Extra leveringsadres toevoegen
          </button>
        )}
      </div>

      {/* Elektriciteitsverbruik */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-teal-500 rounded-xl flex items-center justify-center">
              <Lightning weight="duotone" className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-brand-navy-500">Elektriciteitsverbruik</h3>
              <p className="text-sm text-gray-600">Je vindt dit op je laatste jaarafrekening</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowHelpSchatten(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-brand-teal-600 hover:text-brand-teal-700 hover:bg-brand-teal-50 rounded-lg transition-all"
          >
            <Lightbulb weight="duotone" className="w-5 h-5" />
            <span className="hidden md:inline">Help me schatten</span>
          </button>
        </div>

        <div className="bg-brand-teal-50/50 border-2 border-brand-teal-200 rounded-xl p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Desktop: grid voor normaal + dal naast elkaar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
                {heeftEnkeleMeter ? 'Totaal verbruik per jaar' : 'Normaal tarief (overdag)'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  {...register('elektriciteitNormaal', { 
                    valueAsNumber: true,
                    onChange: (e) => setVerbruikWatched(prev => ({ ...prev, elektriciteitNormaal: Number(e.target.value) || 0 }))
                  })}
                  placeholder="Bijv. 3500"
                  className="w-full px-4 py-3 pr-16 rounded-xl border-2 border-gray-300 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all text-brand-navy-500 font-medium bg-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  kWh
                </span>
              </div>
              {errors.elektriciteitNormaal && (
                <p className="mt-2 text-sm text-red-600">{errors.elektriciteitNormaal.message}</p>
              )}
            </div>

            {!heeftEnkeleMeter && (
              <div className="animate-slide-down">
                <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
                  Dal tarief (nacht/weekend) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    {...register('elektriciteitDal', { 
                      valueAsNumber: true,
                      onChange: (e) => setVerbruikWatched(prev => ({ ...prev, elektriciteitDal: Number(e.target.value) || 0 }))
                    })}
                    placeholder="Bijv. 2500"
                    className="w-full px-4 py-3 pr-16 rounded-xl border-2 border-gray-300 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all text-brand-navy-500 font-medium bg-white"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    kWh
                  </span>
                </div>
                {errors.elektriciteitDal && (
                  <p className="mt-2 text-sm text-red-600">{errors.elektriciteitDal.message}</p>
                )}
              </div>
            )}
          </div>

          <label className="flex items-start gap-3 cursor-pointer group p-4 rounded-xl hover:bg-white/50 transition-colors">
            <input
              type="checkbox"
              checked={heeftEnkeleMeter}
              onChange={(e) => {
                setHeeftEnkeleMeter(e.target.checked)
                setValue('heeftEnkeleMeter', e.target.checked)
                if (e.target.checked) {
                  setValue('elektriciteitDal', null)
                }
              }}
              className="w-5 h-5 mt-0.5 rounded-md border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-offset-2 flex-shrink-0"
            />
            <div>
              <span className="text-sm font-medium text-brand-navy-500 group-hover:text-brand-teal-600 transition-colors">
                Ik heb een enkele meter
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                Vink dit aan als je geen dag/nacht tarief hebt
              </p>
            </div>
          </label>

          <div className="flex items-start gap-2 p-3 bg-brand-navy-50 border border-brand-navy-200 rounded-lg">
            <Info weight="duotone" className="w-5 h-5 text-brand-navy-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-brand-navy-700 leading-relaxed">
              <strong>Tip:</strong> Bij een dubbele meter betaal je overdag een ander tarief dan 's nachts en in het weekend. 
              Bij een enkele meter is er maar één tarief.
            </p>
          </div>
        </div>
      </div>

      {/* Zonnepanelen - Desktop: checkbox + input naast elkaar */}
      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer group p-4 md:p-5 bg-brand-teal-50 border-2 border-brand-teal-200 rounded-xl hover:border-brand-teal-300 transition-all">
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
            className="w-5 h-5 rounded-md border-2 border-brand-teal-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-offset-2 flex-shrink-0"
          />
          <Sun weight="duotone" className="w-6 h-6 text-brand-teal-600 flex-shrink-0" />
          <span className="text-base font-semibold text-brand-navy-500 group-hover:text-brand-teal-700 transition-colors">
            Ja, wij hebben zonnepanelen
          </span>
        </label>

        {heeftZonnepanelen && (
          <div className="animate-slide-down bg-brand-teal-50 border-2 border-brand-teal-200 rounded-xl p-4 md:p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
                Teruglevering per jaar <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  {...register('terugleveringJaar', { valueAsNumber: true })}
                  placeholder="Bijv. 3000"
                  className="w-full px-4 py-3 pr-16 rounded-xl border-2 border-gray-300 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all text-brand-navy-500 font-medium bg-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  kWh
                </span>
              </div>
              {errors.terugleveringJaar && (
                <p className="mt-2 text-sm text-red-600">{errors.terugleveringJaar.message}</p>
              )}
            </div>
            
            <button
              type="button"
              onClick={() => setShowHelpSchatten(true)}
              className="text-sm text-brand-teal-600 hover:text-brand-teal-700 font-medium underline inline-flex items-center gap-1"
            >
              <Lightbulb weight="duotone" className="w-4 h-4" />
              Weet je het niet? Laat ons het schatten
            </button>

            <div className="flex items-start gap-2 p-3 bg-brand-navy-50 border border-brand-navy-200 rounded-lg">
              <Lightbulb weight="duotone" className="w-5 h-5 text-brand-navy-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-brand-navy-700 leading-relaxed">
                <strong>Waarom belangrijk?</strong> Met teruglevering kunnen we dynamische contracten aanbevelen 
                die optimaal profiteren van je energieopbrengst en de salderingsregeling.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Gasverbruik - Desktop: compacter */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-teal-500 rounded-xl flex items-center justify-center">
            <Flame weight="duotone" className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-brand-navy-500">Gasverbruik</h3>
            <p className="text-sm text-gray-600">Ook te vinden op je jaarafrekening</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!geenGasaansluiting && (
            <div className="bg-brand-teal-50/50 border-2 border-brand-teal-200 rounded-xl p-4 md:p-6">
              <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
                Gasverbruik per jaar <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  {...register('gasJaar', { 
                    valueAsNumber: true,
                    onChange: (e) => setVerbruikWatched(prev => ({ ...prev, gasJaar: Number(e.target.value) || 0 }))
                  })}
                  placeholder="Bijv. 1200"
                  className="w-full px-4 py-3 pr-16 rounded-xl border-2 border-gray-300 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all text-brand-navy-500 font-medium bg-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  m³
                </span>
              </div>
              {errors.gasJaar && (
                <p className="mt-2 text-sm text-red-600">{errors.gasJaar.message}</p>
              )}
            </div>
          )}

          <label className="flex items-start gap-3 cursor-pointer group p-4 rounded-xl hover:bg-gray-50 transition-colors border-2 border-gray-200">
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
              className="w-5 h-5 mt-0.5 rounded-md border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-offset-2 flex-shrink-0"
            />
            <div>
              <span className="text-sm font-medium text-brand-navy-500 group-hover:text-brand-teal-600 transition-colors">
                Wij hebben geen gasaansluiting
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                Bijvoorbeeld bij volledig elektrisch verwarmen
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Meter type */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-teal-500 rounded-xl flex items-center justify-center">
            <Gauge weight="duotone" className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-brand-navy-500">Type meter</h3>
            <p className="text-sm text-gray-600">Helpt ons de beste contracten te vinden</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-brand-teal-500 bg-brand-teal-50'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon weight="duotone" className={`w-8 h-8 mb-2 ${isSelected ? 'text-brand-teal-600' : 'text-gray-400'}`} />
                <div className={`text-sm font-semibold mb-1 ${isSelected ? 'text-brand-teal-700' : 'text-gray-700'}`}>
                  {option.label}
                </div>
                <div className="text-xs text-gray-500">{option.desc}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Aansluitwaarden (Automatisch geschat, aanpasbaar) */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-purple-500 rounded-xl flex items-center justify-center">
            <Plugs weight="duotone" className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-brand-navy-500">Aansluitwaarden</h3>
            <p className="text-sm text-gray-600">Automatisch geschat op basis van je verbruik</p>
          </div>
        </div>

        <div className="bg-brand-purple-50/50 border-2 border-brand-purple-200 rounded-xl p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </select>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 p-3 bg-brand-purple-100 border border-brand-purple-300 rounded-lg">
            <Info weight="duotone" className="w-5 h-5 text-brand-purple-700 flex-shrink-0 mt-0.5" />
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

      {/* Submit */}
      <div className="pt-6">
        <Button type="submit" size="lg" className="w-full bg-brand-teal-500 hover:bg-brand-teal-600">
          <MagnifyingGlass weight="bold" className="w-5 h-5 mr-2" />
          Bekijk mijn aanbiedingen
        </Button>
        <p className="text-center text-sm text-gray-500 mt-4">
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
