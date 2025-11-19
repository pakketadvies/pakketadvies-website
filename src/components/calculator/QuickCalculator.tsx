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
  XCircle
} from '@phosphor-icons/react'
import type { VerbruikData } from '@/types/calculator'

const verbruikSchema = z.object({
  elektriciteitNormaal: z.number().min(1, 'Vul je verbruik in'),
  elektriciteitDal: z.number().nullable().optional(),
  heeftEnkeleMeter: z.boolean(),
  heeftZonnepanelen: z.boolean(),
  terugleveringJaar: z.number().nullable().optional(),
  gasJaar: z.number().nullable().optional(),
  geenGasaansluiting: z.boolean(),
  meterType: z.enum(['slim', 'oud', 'weet_niet']),
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
  const { setVerbruik } = useCalculatorStore()
  
  // State
  const [heeftEnkeleMeter, setHeeftEnkeleMeter] = useState(false)
  const [heeftZonnepanelen, setHeeftZonnepanelen] = useState(false)
  const [geenGasaansluiting, setGeenGasaansluiting] = useState(false)
  const [meterType, setMeterType] = useState<'slim' | 'oud' | 'weet_niet'>('weet_niet')
  
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

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (addressTimeoutRef.current) {
        clearTimeout(addressTimeoutRef.current)
      }
    }
  }, [])

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
      geschat: false, // User filled in actual data
    }
    
    // Store in Zustand (same as VerbruikForm)
    setVerbruik(verbruikData)
    
    // Navigate to results (same as VerbruikForm)
    router.push('/calculator/resultaten')
  })

  return (
    <div className="bg-white rounded-2xl p-3 md:p-5 lg:p-6 shadow-xl border border-gray-100 w-full">
      {/* Header */}
      <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-5">
        <div className="w-10 h-10 md:w-11 md:h-11 bg-brand-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Lightning weight="duotone" className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <div>
          <h3 className="text-base md:text-lg lg:text-xl font-bold text-brand-navy-500">Bereken je besparing</h3>
          <p className="text-xs text-gray-600">Gratis en vrijblijvend</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-2.5 md:space-y-4">
        {/* Leveringsadres */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-brand-teal-600" />
            <label className="text-xs md:text-sm font-semibold text-brand-navy-500">
              Leveradres <span className="text-red-500">*</span>
            </label>
          </div>
          
          {/* Mobiel: geen extra container, desktop: wel grijze container */}
          <div className="md:bg-gray-50 md:border-2 md:border-gray-200 md:rounded-xl md:p-4 space-y-2 md:space-y-3">
            <div className="grid grid-cols-6 gap-2">
              <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-700 mb-0.5">Postcode</label>
                <input
                  type="text"
                  value={leveringsadressen[0].postcode}
                  onChange={(e) => handleAddressChange('postcode', e.target.value.toUpperCase())}
                  placeholder="1234AB"
                  maxLength={6}
                  className="w-full px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm rounded-lg border-2 border-gray-300 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all bg-white"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-0.5">Huisnummer</label>
                <input
                  type="text"
                  value={leveringsadressen[0].huisnummer}
                  onChange={(e) => handleAddressChange('huisnummer', e.target.value)}
                  placeholder="12"
                  className="w-full px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm rounded-lg border-2 border-gray-300 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all bg-white"
                  required
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-medium text-gray-700 mb-0.5">Toev.</label>
                <input
                  type="text"
                  value={leveringsadressen[0].toevoeging || ''}
                  onChange={(e) => handleAddressChange('toevoeging', e.target.value.toUpperCase())}
                  placeholder="A"
                  maxLength={4}
                  className="w-full px-1 md:px-2 py-1.5 md:py-2 text-xs md:text-sm text-center rounded-lg border-2 border-gray-300 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all bg-white"
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
        <div className="md:bg-brand-teal-50/50 md:border-2 md:border-brand-teal-200 md:rounded-xl md:p-3 space-y-2 md:space-y-3">
          <div className="flex items-center gap-2">
            <Lightning weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-brand-teal-600" />
            <label className="text-xs md:text-sm font-semibold text-brand-navy-500">
              Elektriciteit
            </label>
          </div>
          
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <div>
              <label className="block text-xs font-semibold text-brand-navy-500 mb-1">
                {heeftEnkeleMeter ? 'Totaal' : 'Normaal'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  {...register('elektriciteitNormaal', { valueAsNumber: true })}
                  placeholder="3500"
                  className="w-full px-2 md:px-3 py-1.5 md:py-2 pr-11 md:pr-12 text-xs md:text-sm rounded-lg border-2 border-gray-200 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all bg-white"
                />
                <span className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">kWh</span>
              </div>
              {errors.elektriciteitNormaal && (
                <p className="mt-1 text-xs text-red-600">{errors.elektriciteitNormaal.message}</p>
              )}
            </div>

            {!heeftEnkeleMeter && (
              <div className="animate-slide-down">
                <label className="block text-xs font-semibold text-brand-navy-500 mb-1">
                  Dal <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    {...register('elektriciteitDal', { valueAsNumber: true })}
                    placeholder="2500"
                    className="w-full px-2 md:px-3 py-1.5 md:py-2 pr-11 md:pr-12 text-xs md:text-sm rounded-lg border-2 border-gray-200 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all bg-white"
                  />
                  <span className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">kWh</span>
                </div>
                {errors.elektriciteitDal && (
                  <p className="mt-1 text-xs text-red-600">{errors.elektriciteitDal.message}</p>
                )}
              </div>
            )}
          </div>

          {errors.elektriciteitDal && heeftEnkeleMeter && (
            <p className="text-xs text-red-600">{errors.elektriciteitDal.message}</p>
          )}

          <label className="flex items-start gap-2 cursor-pointer p-2 rounded-lg hover:bg-white/50 transition-colors">
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
              className="w-4 h-4 mt-0.5 rounded border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 flex-shrink-0"
            />
            <span className="text-xs font-medium text-brand-navy-500">Enkele meter (geen dag/nacht tarief)</span>
          </label>
        </div>

        {/* Zonnepanelen - mobiel: simpel, desktop: teal box */}
        <label className="flex items-center gap-2 md:gap-3 cursor-pointer p-2 md:p-3 md:bg-brand-teal-50 md:border-2 md:border-brand-teal-200 md:rounded-xl md:hover:border-brand-teal-300 transition-all">
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
            className="w-4 h-4 rounded border-2 border-brand-teal-300 text-brand-teal-600 focus:ring-brand-teal-500 flex-shrink-0"
          />
          <Sun weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-brand-teal-600 flex-shrink-0" />
          <span className="text-xs md:text-sm font-semibold text-brand-navy-500">Wij hebben zonnepanelen</span>
        </label>

        {heeftZonnepanelen && (
          <div className="md:bg-brand-teal-50 md:border-2 md:border-brand-teal-200 md:rounded-xl md:p-3 animate-slide-down">
            <label className="block text-xs font-semibold text-brand-navy-500 mb-1.5">
              Teruglevering per jaar <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                {...register('terugleveringJaar', { valueAsNumber: true })}
                placeholder="3000"
                className="w-full px-2 md:px-3 py-1.5 md:py-2 pr-11 md:pr-12 text-xs md:text-sm rounded-lg border-2 border-gray-200 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all bg-white"
              />
              <span className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">kWh</span>
            </div>
            {errors.terugleveringJaar && (
              <p className="mt-1.5 text-xs text-red-600">{errors.terugleveringJaar.message}</p>
            )}
          </div>
        )}

        {/* Gas */}
        <div className="space-y-2">
          {!geenGasaansluiting && (
            <div>
              <label className="block text-xs md:text-sm font-semibold text-brand-navy-500 mb-1.5">
                <Flame weight="duotone" className="w-4 h-4 md:w-5 md:h-5 inline mr-1.5 text-brand-teal-600" />
                Gasverbruik per jaar <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  {...register('gasJaar', { valueAsNumber: true })}
                  placeholder="1200"
                  className="w-full px-2 md:px-3 py-1.5 md:py-2 pr-11 md:pr-12 text-xs md:text-sm rounded-lg border-2 border-gray-200 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all bg-white"
                />
                <span className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">m³</span>
              </div>
              {errors.gasJaar && (
                <p className="mt-1.5 text-xs text-red-600">{errors.gasJaar.message}</p>
              )}
            </div>
          )}

          {errors.gasJaar && geenGasaansluiting && (
            <p className="text-xs text-red-600">{errors.gasJaar.message}</p>
          )}

          <label className="flex items-start gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors border-2 border-gray-200">
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
              className="w-4 h-4 mt-0.5 rounded border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 flex-shrink-0"
            />
            <span className="text-xs font-medium text-brand-navy-500">Geen gasaansluiting</span>
          </label>
        </div>

        {/* Metertype */}
        <div>
          <label className="block text-xs md:text-sm font-semibold text-brand-navy-500 mb-1.5">
            <Gauge weight="duotone" className="w-4 h-4 md:w-5 md:h-5 inline mr-1.5 text-brand-teal-600" />
            Type meter
          </label>
          <div className="grid grid-cols-3 gap-1.5 md:gap-2">
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
                  className={`p-2 md:p-2.5 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-brand-teal-500 bg-brand-teal-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <Icon weight="duotone" className={`w-5 h-5 md:w-6 md:h-6 mx-auto mb-1 ${isSelected ? 'text-brand-teal-600' : 'text-gray-400'}`} />
                  <div className={`text-xs font-semibold truncate ${isSelected ? 'text-brand-teal-700' : 'text-gray-700'}`}>
                    {option.label}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full group relative px-5 md:px-6 py-3 md:py-3.5 bg-brand-teal-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:bg-brand-teal-600 transition-all duration-300"
        >
          <span className="flex items-center justify-center gap-2">
            <MagnifyingGlass weight="bold" className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">Bekijk mijn aanbiedingen</span>
          </span>
        </button>
        <p className="text-center text-xs text-gray-500">
          100% vrijblijvend • Direct resultaat
        </p>
      </form>

      {/* Trust indicators */}
      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col items-center gap-1 md:gap-1.5 text-gray-600">
            <CheckCircle weight="fill" className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand-teal-500" />
            <span className="text-center leading-tight text-[10px] md:text-xs">100% gratis</span>
          </div>
          <div className="flex flex-col items-center gap-1 md:gap-1.5 text-gray-600">
            <CheckCircle weight="fill" className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand-teal-500" />
            <span className="text-center leading-tight text-[10px] md:text-xs">Geen verplichtingen</span>
          </div>
          <div className="flex flex-col items-center gap-1 md:gap-1.5 text-gray-600">
            <CheckCircle weight="fill" className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand-teal-500" />
            <span className="text-center leading-tight text-[10px] md:text-xs">Privacy veilig</span>
          </div>
        </div>
      </div>
    </div>
  )
}
