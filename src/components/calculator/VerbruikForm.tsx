'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCalculatorStore } from '@/store/calculatorStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Lightning, MapPin, CheckCircle, DeviceMobile, Lightning as LightningBolt, ChartBar, Question, Lightbulb, Warning, Info } from '@phosphor-icons/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const verbruikSchema = z.object({
  elektriciteitJaar: z.number().min(0, 'Vul een geldig verbruik in'),
  gasJaar: z.number().min(0, 'Vul een geldig verbruik in').nullable(),
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
  geschat: z.boolean(),
})

type VerbruikFormData = z.infer<typeof verbruikSchema>

export function VerbruikForm() {
  const router = useRouter()
  const { setVerbruik } = useCalculatorStore()
  const [isGeschat, setIsGeschat] = useState(false)
  const [heeftGas, setHeeftGas] = useState(true)
  const [leveringsadressen, setLeveringsadressen] = useState([
    { postcode: '', huisnummer: '', toevoeging: '', straat: '', plaats: '' }
  ])
  const [loadingAddresses, setLoadingAddresses] = useState<{ [key: number]: boolean }>({})
  const [heeftZonnepanelen, setHeeftZonnepanelen] = useState(false)
  const [terugleveringJaar, setTerugleveringJaar] = useState('')
  const [meterType, setMeterType] = useState<'slim' | 'enkel' | 'dubbel' | 'weet_niet'>('weet_niet')

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
      geschat: false,
      gasJaar: null,
      leveringsadressen: [{ postcode: '', huisnummer: '', toevoeging: '', straat: '', plaats: '' }],
    },
  })

  // Fetch address from postcode API
  const fetchAddress = async (index: number) => {
    const adres = leveringsadressen[index]
    if (!adres.postcode || !adres.huisnummer) return

    const postcodeClean = adres.postcode.replace(/\s/g, '')
    
    setLoadingAddresses({ ...loadingAddresses, [index]: true })
    
    try {
      // Call our own API route (which securely uses the API key)
      const response = await fetch(`/api/postcode?postcode=${postcodeClean}&number=${adres.huisnummer}`)
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.error) {
          // API key not configured or other error, but user can continue
          console.warn('Postcode lookup warning:', data.error)
          setLoadingAddresses({ ...loadingAddresses, [index]: false })
          return
        }
        
        const updated = [...leveringsadressen]
        updated[index] = {
          ...updated[index],
          straat: data.street || '',
          plaats: data.city || '',
        }
        setLeveringsadressen(updated)
        setValue(`leveringsadressen.${index}.straat`, data.street || '')
        setValue(`leveringsadressen.${index}.plaats`, data.city || '')
        clearErrors(`leveringsadressen.${index}`)
      } else if (response.status === 404) {
        setError(`leveringsadressen.${index}.postcode` as any, {
          message: 'Adres niet gevonden. Controleer postcode en huisnummer.'
        })
      } else {
        // Other error, but let user continue
        console.error('Postcode API error:', response.status)
      }
    } catch (error) {
      console.error('Postcode fetch error:', error)
      // Don't show error, just let user continue
    } finally {
      setLoadingAddresses({ ...loadingAddresses, [index]: false })
    }
  }

  const addLeveringsadres = () => {
    const newAdres = { postcode: '', huisnummer: '', toevoeging: '', straat: '', plaats: '' }
    setLeveringsadressen([...leveringsadressen, newAdres])
    setValue('leveringsadressen', [...leveringsadressen, newAdres])
  }

  const removeLeveringsadres = (index: number) => {
    if (leveringsadressen.length === 1) return // Keep at least one
    const updated = leveringsadressen.filter((_, i) => i !== index)
    setLeveringsadressen(updated)
    setValue('leveringsadressen', updated)
  }

  const onSubmit = (data: VerbruikFormData) => {
    setVerbruik({
      elektriciteitJaar: data.elektriciteitJaar,
      gasJaar: heeftGas ? data.gasJaar : null,
      leveringsadressen: data.leveringsadressen,
      geschat: isGeschat,
      heeftZonnepanelen,
      terugleveringJaar: heeftZonnepanelen && terugleveringJaar ? parseInt(terugleveringJaar) : undefined,
      meterType: meterType !== 'weet_niet' ? meterType : undefined,
    })
    // Direct naar resultaten!
    router.push('/calculator/resultaten')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-teal-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Lightning weight="duotone" className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-brand-navy-500 truncate">
              Bereken je besparing
            </h2>
            <p className="text-sm md:text-base text-gray-600">Direct persoonlijk advies</p>
          </div>
        </div>
      </div>

      {/* Leveringsadres EERST - voor postcode API */}
      <div className="space-y-4">
        <label className="block text-base md:text-lg font-semibold text-brand-navy-500">
          Leveringsadres <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-600 -mt-2">
          We vullen automatisch je adres in
        </p>

        {leveringsadressen.map((adres, index) => (
          <div key={index} className="relative p-4 md:p-6 bg-gray-50 rounded-xl border-2 border-gray-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Postcode */}
              <div className="md:col-span-1">
                <Input
                  label="Postcode"
                  placeholder="1234 AB"
                  value={adres.postcode}
                  onChange={(e) => {
                    const updated = [...leveringsadressen]
                    updated[index].postcode = e.target.value
                    setLeveringsadressen(updated)
                    setValue(`leveringsadressen.${index}.postcode`, e.target.value)
                  }}
                  onBlur={() => fetchAddress(index)}
                  error={errors.leveringsadressen?.[index]?.postcode?.message}
                  required
                  autoFocus={index === 0}
                />
              </div>

              {/* Huisnummer */}
              <div className="md:col-span-1">
                <Input
                  label="Huisnummer"
                  placeholder="123"
                  value={adres.huisnummer}
                  onChange={(e) => {
                    const updated = [...leveringsadressen]
                    updated[index].huisnummer = e.target.value
                    setLeveringsadressen(updated)
                    setValue(`leveringsadressen.${index}.huisnummer`, e.target.value)
                  }}
                  onBlur={() => fetchAddress(index)}
                  error={errors.leveringsadressen?.[index]?.huisnummer?.message}
                  required
                />
              </div>

              {/* Toevoeging */}
              <div className="md:col-span-1">
                <Input
                  label="Toevoeging (optioneel)"
                  placeholder="A, bis, etc."
                  value={adres.toevoeging || ''}
                  onChange={(e) => {
                    const updated = [...leveringsadressen]
                    updated[index].toevoeging = e.target.value
                    setLeveringsadressen(updated)
                    setValue(`leveringsadressen.${index}.toevoeging`, e.target.value)
                  }}
                />
              </div>
            </div>

            {/* Automatic address display */}
            {(adres.straat || loadingAddresses[index]) && (
              <div className="pt-3 border-t border-gray-300">
                {loadingAddresses[index] ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 border-2 border-brand-teal-300 border-t-brand-teal-600 rounded-full animate-spin"></div>
                    <span>Adres ophalen...</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <MapPin weight="duotone" className="w-5 h-5 text-brand-teal-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-700">
                      <div className="font-medium">{adres.straat} {adres.huisnummer}{adres.toevoeging}</div>
                      <div>{adres.postcode} {adres.plaats}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Elektriciteit */}
      <div>
        <Input
          label="Elektriciteitsverbruik per jaar (kWh)"
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Bijv. 5000"
          error={errors.elektriciteitJaar?.message}
          helpText="Gemiddeld MKB: 5.000-15.000 kWh per jaar"
          {...register('elektriciteitJaar', { valueAsNumber: true })}
          required
        />
      </div>

      {/* Zonnepanelen - Direct na elektriciteit! */}
      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer group p-4 md:p-0">
          <input
            type="checkbox"
            checked={heeftZonnepanelen}
            onChange={(e) => setHeeftZonnepanelen(e.target.checked)}
            className="w-5 h-5 md:w-5 md:h-5 rounded border-2 border-brand-teal-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-offset-2 flex-shrink-0"
          />
          <span className="text-base md:text-base font-medium text-brand-navy-500 group-hover:text-brand-teal-600 transition-colors">
            We hebben zonnepanelen
          </span>
        </label>

        {heeftZonnepanelen && (
          <div className="animate-slide-down bg-gray-50 border-2 border-gray-200 rounded-xl p-4 md:p-6">
            <Input
              label="Jaarlijkse teruglevering (kWh)"
              type="tel"
              inputMode="numeric"
              placeholder="Bijv. 3000"
              value={terugleveringJaar}
              onChange={(e) => setTerugleveringJaar(e.target.value)}
              helpText="Hoeveel stroom lever je gemiddeld terug per jaar?"
            />
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Lightbulb weight="duotone" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-900 leading-relaxed">
                  <strong>Waarom belangrijk?</strong> Met teruglevering kunnen we dynamische contracten aanbevelen 
                  die optimaal profiteren van je energieopbrengst en de huidige salderingsregeling. Meestal ligt dit 
                  rond de 60-80% van je totale productie.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gas toggle */}
      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer group p-4 md:p-0">
          <input
            type="checkbox"
            checked={heeftGas}
            onChange={(e) => {
              setHeeftGas(e.target.checked)
              if (!e.target.checked) {
                setValue('gasJaar', null)
              }
            }}
            className="w-5 h-5 md:w-5 md:h-5 rounded border-2 border-brand-teal-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-offset-2 flex-shrink-0"
          />
          <span className="text-base md:text-base font-medium text-brand-navy-500 group-hover:text-brand-teal-600 transition-colors">
            Ik gebruik ook gas
          </span>
        </label>

        {heeftGas && (
          <div className="animate-slide-down">
            <Input
              label="Gasverbruik per jaar (m³)"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Bijv. 2000"
              error={errors.gasJaar?.message}
              helpText="Gemiddeld MKB: 1.000-5.000 m³ per jaar"
              {...register('gasJaar', { valueAsNumber: true })}
            />
          </div>
        )}
      </div>

      {/* Geschat toggle */}
      <div className="bg-brand-teal-50 border-2 border-brand-teal-200 rounded-xl p-4 md:p-6">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={isGeschat}
            onChange={(e) => {
              setIsGeschat(e.target.checked)
              setValue('geschat', e.target.checked)
            }}
            className="mt-0.5 md:mt-1 w-5 h-5 rounded border-2 border-brand-teal-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-offset-2 flex-shrink-0"
          />
          <div className="min-w-0">
            <span className="text-sm md:text-base font-semibold text-brand-navy-500 block mb-1">
              Dit is een schatting
            </span>
            <span className="text-xs md:text-sm text-gray-700 leading-relaxed">
              Geen probleem! We helpen je later met het vinden van je exacte verbruik.
            </span>
          </div>
        </label>
      </div>

      {/* Meter type */}
      <div className="space-y-4">
        <label className="block text-base md:text-lg font-semibold text-brand-navy-500">
          Type energiemeter
        </label>
        <p className="text-sm text-gray-600 -mt-2">
          Dit helpt ons de beste contractopties voor je te bepalen
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { 
              value: 'slim' as const, 
              label: 'Slimme meter', 
              description: 'Meet automatisch per uur',
              Icon: DeviceMobile
            },
            { 
              value: 'dubbel' as const, 
              label: 'Dubbele meter', 
              description: 'Dag- en nachttarief',
              Icon: LightningBolt
            },
            { 
              value: 'enkel' as const, 
              label: 'Enkele meter', 
              description: 'Standaard oudere meter',
              Icon: ChartBar
            },
            { 
              value: 'weet_niet' as const, 
              label: 'Weet ik niet', 
              description: 'Geen probleem',
              Icon: Question
            },
          ].map((option) => {
            const isSelected = meterType === option.value
            const OptionIcon = option.Icon
            
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setMeterType(option.value)}
                className={`
                  relative flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 text-left
                  ${isSelected 
                    ? 'border-brand-teal-500 bg-brand-teal-50 shadow-lg ring-2 ring-brand-teal-500/20' 
                    : 'border-gray-200 bg-white hover:border-brand-teal-300 hover:shadow-md'
                  }
                `}
              >
                <OptionIcon 
                  weight="duotone" 
                  className={`w-6 h-6 flex-shrink-0 ${isSelected ? 'text-brand-teal-600' : 'text-gray-400'}`}
                />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm md:text-base font-semibold mb-0.5 ${isSelected ? 'text-brand-teal-700' : 'text-gray-900'}`}>
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-600">
                    {option.description}
                  </div>
                </div>
                
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-teal-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {meterType === 'slim' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle weight="duotone" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-900 leading-relaxed">
                <strong>Perfect!</strong> Met een slimme meter kun je profiteren van dynamische contracten 
                en real-time inzicht in je verbruik.
              </p>
            </div>
          </div>
        )}

        {meterType === 'dubbel' && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Lightbulb weight="duotone" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900 leading-relaxed">
                <strong>Goed om te weten:</strong> We kunnen contracten met dag- en nachttarief voor je vinden.
              </p>
            </div>
          </div>
        )}

        {meterType === 'enkel' && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info weight="duotone" className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-900 leading-relaxed">
                <strong>Tip:</strong> Overweeg een upgrade naar een slimme meter voor toegang tot dynamische 
                contracten en betere besparingen.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Submit button */}
      <Button type="submit" size="lg" className="w-full bg-brand-teal-500 hover:bg-brand-teal-600 text-base md:text-lg">
        Bekijk mijn aanbiedingen
        <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Button>
    </form>
  )
}
