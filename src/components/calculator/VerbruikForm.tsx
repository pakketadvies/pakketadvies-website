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
  Gauge
} from '@phosphor-icons/react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

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
  
  // Ref om laatste lookup te tracken (voorkomt dubbele calls)
  const lastLookup = useRef<{ [key: number]: string }>({})
  // Debounce timers
  const debounceTimers = useRef<{ [key: number]: NodeJS.Timeout }>({})

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
      leveringsadressen: [{ postcode: '', huisnummer: '', toevoeging: '', straat: '', plaats: '' }],
    },
  })

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer))
    }
  }, [])

  // Valideer of postcode compleet is
  const isValidPostcode = (postcode: string): boolean => {
    const clean = postcode.toUpperCase().replace(/\s/g, '')
    return /^\d{4}[A-Z]{2}$/.test(clean)
  }

  // Fetch address - memoized met useCallback
  const fetchAddress = useCallback(async (index: number, postcode: string, huisnummer: string) => {
    // Check of dit dezelfde lookup is als de laatste (voorkom dubbele calls)
    const lookupKey = `${postcode}-${huisnummer}`
    if (lastLookup.current[index] === lookupKey) {
      return // Skip, we hebben dit al opgezocht
    }

    const postcodeClean = postcode.toUpperCase().replace(/\s/g, '')
    
    setLoadingAddresses(prev => ({ ...prev, [index]: true }))
    clearErrors(`leveringsadressen.${index}`)
    
    try {
      const response = await fetch(`/api/postcode?postcode=${postcodeClean}&number=${huisnummer}`)
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.error) {
          // API key niet geconfigureerd, maar laat gebruiker doorgaan
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
      } else if (response.status === 404) {
        setError(`leveringsadressen.${index}.postcode` as any, {
          message: 'Adres niet gevonden. Controleer postcode en huisnummer.'
        })
        
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

  const handleLeveringsadresChange = (index: number, field: string, value: string) => {
    // Update state
    setLeveringsadressen(prev => {
      const updated = [...prev]
      
      // Als postcode of huisnummer wijzigt, clear de oude adres data EN lookup key
      if (field === 'postcode' || field === 'huisnummer') {
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

    // Alleen API call als beide velden ingevuld zijn
    if (field === 'postcode' || field === 'huisnummer') {
      // Haal huidige waarden op
      const currentAdres = leveringsadressen[index]
      const postcode = field === 'postcode' ? value : currentAdres.postcode
      const huisnummer = field === 'huisnummer' ? value : currentAdres.huisnummer
      
      // Check of beide ingevuld zijn EN postcode is geldig
      if (postcode && huisnummer && postcode.length >= 6 && huisnummer.length >= 1) {
        if (isValidPostcode(postcode)) {
          // Start debounce timer (800ms om zeker te zijn dat gebruiker klaar is)
          debounceTimers.current[index] = setTimeout(() => {
            fetchAddress(index, postcode, huisnummer)
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
      leveringsadressen: data.leveringsadressen,
      geschat: false,
    })
    
    router.push('/calculator/resultaten')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
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
              <Input
                label="Huisnummer"
                type="text"
                value={adres.huisnummer}
                onChange={(e) => handleLeveringsadresChange(index, 'huisnummer', e.target.value)}
                placeholder="12"
                error={errors.leveringsadressen?.[index]?.huisnummer?.message}
                required
              />
              <Input
                label="Toevoeging"
                type="text"
                value={adres.toevoeging || ''}
                onChange={(e) => handleLeveringsadresChange(index, 'toevoeging', e.target.value)}
                placeholder="A"
              />
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
                    {adres.straat} {adres.huisnummer}{adres.toevoeging ? `-${adres.toevoeging}` : ''}
                  </div>
                  <div>{adres.postcode} {adres.plaats}</div>
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

      {/* Rest blijft hetzelfde - alleen de leveringsadres sectie is aangepast */}
      {/* Elektriciteitsverbruik */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-teal-500 rounded-xl flex items-center justify-center">
            <Lightning weight="duotone" className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-brand-navy-500">Elektriciteitsverbruik</h3>
            <p className="text-sm text-gray-600">Je vindt dit op je laatste jaarafrekening</p>
          </div>
        </div>

        <div className="bg-brand-teal-50/50 border-2 border-brand-teal-200 rounded-xl p-4 md:p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
              {heeftEnkeleMeter ? 'Totaal verbruik per jaar' : 'Normaal tarief (overdag)'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                {...register('elektriciteitNormaal', { valueAsNumber: true })}
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
                  {...register('elektriciteitDal', { valueAsNumber: true })}
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

      {/* Zonnepanelen */}
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
          <div className="animate-slide-down bg-brand-teal-50 border-2 border-brand-teal-200 rounded-xl p-4 md:p-6">
            <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
              Teruglevering per jaar <span className="text-red-500">*</span>
            </label>
            <div className="relative mb-4">
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
              <p className="mb-3 text-sm text-red-600">{errors.terugleveringJaar.message}</p>
            )}

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

      {/* Gasverbruik */}
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

        {!geenGasaansluiting && (
          <div className="bg-brand-teal-50/50 border-2 border-brand-teal-200 rounded-xl p-4 md:p-6">
            <label className="block text-sm font-semibold text-brand-navy-500 mb-2">
              Gasverbruik per jaar <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                {...register('gasJaar', { valueAsNumber: true })}
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
    </form>
  )
}
