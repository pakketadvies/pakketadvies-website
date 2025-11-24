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
  Plugs
} from '@phosphor-icons/react'
import type { VerbruikData } from '@/types/calculator'
import { schatAansluitwaarden } from '@/lib/aansluitwaarde-schatting'

const verbruikSchema = z.object({
  elektriciteitNormaal: z.number().min(1, 'Vul je verbruik in'),
  elektriciteitDal: z.number().nullable().optional(),
  heeftEnkeleMeter: z.boolean(),
  heeftZonnepanelen: z.boolean(),
  terugleveringJaar: z.number().nullable().optional(),
  gasJaar: z.number().nullable().optional(),
  geenGasaansluiting: z.boolean(),
  meterType: z.enum(['slim', 'oud', 'weet_niet']),
  aansluitwaardeElektriciteit: z.string().optional(),
  aansluitwaardeGas: z.string().optional(),
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

export function QuickCalculator() {
  const router = useRouter()
  const { setVerbruik, verbruik } = useCalculatorStore()
  
  // State
  const [heeftEnkeleMeter, setHeeftEnkeleMeter] = useState(false)
  const [heeftZonnepanelen, setHeeftZonnepanelen] = useState(false)
  const [geenGasaansluiting, setGeenGasaansluiting] = useState(false)
  const [meterType, setMeterType] = useState<'slim' | 'oud' | 'weet_niet'>('weet_niet')
  
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
  
  // Refs voor debouncing en duplicate prevention (exact zoals VerbruikForm)
  const lastLookup = useRef<string>('')
  const addressTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const aansluitwaardeTimer = useRef<NodeJS.Timeout | null>(null)
  
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
    },
  })

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
        setLeveringsadressen(verbruik.leveringsadressen.map(adres => ({
          postcode: adres.postcode,
          huisnummer: adres.huisnummer,
          toevoeging: adres.toevoeging || '',
          straat: adres.straat || '',
          plaats: adres.plaats || '',
        })))
      }
      
      // Set verbruikWatched for aansluitwaarde estimation
      setVerbruikWatched({
        elektriciteitNormaal: verbruik.elektriciteitNormaal || 0,
        elektriciteitDal: verbruik.elektriciteitDal || 0,
        gasJaar: verbruik.gasJaar || 0,
      })
    }
  }, []) // Only run on mount

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
        
        if (data.error) {
          // API geeft error terug (maar met 200 status)
          setAddressError(data.error)
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
      } else if (response.status === 404) {
        const errorData = await response.json()
        setAddressError(errorData.error || 'Adres niet gevonden')
        // Clear address fields - gebruik updater function
        setLeveringsadressen(prev => [{
          ...prev[0],
          straat: '',
          plaats: '',
        }])
      } else {
        console.error('Address API error:', response.status)
        setAddressError('Kon adres niet ophalen')
      }
    } catch (error) {
      console.error('Address fetch exception:', error)
      setAddressError('Fout bij ophalen adres')
    } finally {
      setLoadingAddress(false)
    }
  }, []) // LEGE dependency array - geen stale closures!

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

  const onSubmit = handleSubmit((data) => {
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
      geschat: false, // User filled in actual data
    }
    
    // Store in Zustand (same as VerbruikForm)
    setVerbruik(verbruikData)
    
    // Navigate to results (same as VerbruikForm)
    router.push('/calculator/resultaten')
  })

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

            {loadingAddress && (
              <div className="flex items-center gap-2 text-xs text-brand-teal-600 animate-slide-down">
                <div className="w-3 h-3 border-2 border-brand-teal-300 border-t-brand-teal-600 rounded-full animate-spin" />
                <span>Adres opzoeken...</span>
              </div>
            )}

            {leveringsadressen[0].straat && leveringsadressen[0].plaats && !loadingAddress && (
              <div className="flex items-start gap-2 p-2 md:p-3 bg-brand-teal-50 border border-brand-teal-200 rounded-lg animate-slide-down">
                <CheckCircle weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-brand-teal-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs md:text-sm text-brand-teal-900">
                  <div className="font-semibold">
                    {leveringsadressen[0].straat} {leveringsadressen[0].huisnummer}{leveringsadressen[0].toevoeging ? ` ${leveringsadressen[0].toevoeging}` : ''}
                  </div>
                  <div>{leveringsadressen[0].postcode} {leveringsadressen[0].plaats}</div>
                </div>
              </div>
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
                <p className="mt-1.5 text-xs text-red-600">{errors.elektriciteitNormaal.message}</p>
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
                  <p className="mt-1.5 text-xs text-red-600">{errors.elektriciteitDal.message}</p>
                )}
              </div>
            )}
          </div>

          {errors.elektriciteitDal && heeftEnkeleMeter && (
            <p className="text-xs text-red-600">{errors.elektriciteitDal.message}</p>
          )}

          <label className="flex items-start gap-3 cursor-pointer p-3.5 rounded-xl border-2 border-gray-200 bg-white hover:border-brand-teal-300 hover:bg-brand-teal-50/30 active:bg-brand-teal-50 transition-all">
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
              Teruglevering per jaar <span className="text-red-500">*</span>
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
              <p className="mt-1.5 text-xs text-red-600">{errors.terugleveringJaar.message}</p>
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
                <p className="mt-1.5 text-xs text-red-600">{errors.gasJaar.message}</p>
              )}
            </div>
          )}

          {errors.gasJaar && geenGasaansluiting && (
            <p className="text-xs text-red-600">{errors.gasJaar.message}</p>
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
