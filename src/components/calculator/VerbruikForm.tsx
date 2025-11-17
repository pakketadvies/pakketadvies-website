'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCalculatorStore } from '@/store/calculatorStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Lightning, MapPin, CheckCircle } from '@phosphor-icons/react'
import { useState } from 'react'

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
  const { setVerbruik, volgendeStap } = useCalculatorStore()
  const [isGeschat, setIsGeschat] = useState(false)
  const [heeftGas, setHeeftGas] = useState(true)
  const [leveringsadressen, setLeveringsadressen] = useState([
    { postcode: '', huisnummer: '', toevoeging: '', straat: '', plaats: '' }
  ])
  const [loadingAddresses, setLoadingAddresses] = useState<{ [key: number]: boolean }>({})

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
    })
    volgendeStap()
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
              Energieverbruik
            </h2>
            <p className="text-sm md:text-base text-gray-600">Vul je jaarverbruik in</p>
          </div>
        </div>
      </div>

      {/* Leveringsadressen */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-base md:text-lg font-semibold text-brand-navy-500">
            Leveringsadres(sen) <span className="text-red-500">*</span>
          </label>
          {leveringsadressen.length < 5 && (
            <button
              type="button"
              onClick={addLeveringsadres}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand-teal-600 hover:text-brand-teal-700 hover:bg-brand-teal-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Adres toevoegen
            </button>
          )}
        </div>

        {leveringsadressen.map((adres, index) => (
          <div key={index} className="relative p-4 md:p-6 bg-gray-50 rounded-xl border-2 border-gray-200 space-y-4">
            {/* Remove button (only if more than 1) */}
            {leveringsadressen.length > 1 && (
              <button
                type="button"
                onClick={() => removeLeveringsadres(index)}
                className="absolute top-3 right-3 p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Verwijder adres"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {leveringsadressen.length > 1 && (
              <div className="text-sm font-semibold text-gray-700 mb-3">
                Adres {index + 1}
              </div>
            )}

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

        {leveringsadressen.length > 1 && (
          <p className="text-xs text-gray-600 mt-2">
            Je hebt {leveringsadressen.length} leveringsadressen toegevoegd
          </p>
        )}
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

      {/* Submit button */}
      <Button type="submit" size="lg" className="w-full bg-brand-teal-500 hover:bg-brand-teal-600 text-base md:text-lg">
        Volgende stap
        <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Button>
    </form>
  )
}
