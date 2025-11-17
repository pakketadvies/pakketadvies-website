'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { useCalculatorStore } from '@/store/calculatorStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Buildings, ShieldCheck, MagnifyingGlass, CheckCircle, XCircle } from '@phosphor-icons/react'

const bedrijfsgegevensSchema = z.object({
  kvkNummer: z.string().optional(),
  bedrijfsnaam: z.string().min(2, 'Vul een geldige bedrijfsnaam in'),
  contactpersoon: z.string().min(2, 'Vul een naam in'),
  email: z.string().email('Vul een geldig e-mailadres in'),
  telefoon: z.string().regex(/^[\d\s\-+()]+$/, 'Vul een geldig telefoonnummer in'),
  typeBedrijf: z.enum(['retail', 'horeca', 'kantoor', 'productie', 'gezondheidszorg', 'onderwijs', 'overig']),
})

type BedrijfsgegevensFormData = z.infer<typeof bedrijfsgegevensSchema>

export function BedrijfsgegevensForm() {
  const { setBedrijfsgegevens, volgendeStap, vorigeStap } = useCalculatorStore()
  const [kvkNummer, setKvkNummer] = useState('')
  const [kvkLoading, setKvkLoading] = useState(false)
  const [kvkError, setKvkError] = useState<string | null>(null)
  const [kvkSuccess, setKvkSuccess] = useState(false)

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
    },
  })

  const typeBedrijf = watch('typeBedrijf')

  // Fetch company data from KvK
  const fetchKvkData = async () => {
    if (!kvkNummer || kvkNummer.length < 8) {
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
        setValue('bedrijfsnaam', data.bedrijfsnaam)
      }
      if (data.kvkNummer) {
        setValue('kvkNummer', data.kvkNummer)
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

  const onSubmit = (data: BedrijfsgegevensFormData) => {
    setBedrijfsgegevens({
      ...data,
      kvkNummer: kvkNummer || undefined,
    })
    volgendeStap()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-navy-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Buildings weight="duotone" className="w-5 h-5 md:w-6 md:h-6 text-brand-teal-500" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-brand-navy-500 truncate">
              Bedrijfsgegevens
            </h2>
            <p className="text-sm md:text-base text-gray-600">Zodat we contact op kunnen nemen</p>
          </div>
        </div>
      </div>

      {/* KvK Lookup */}
      <div className="bg-gradient-to-br from-brand-teal-50 to-brand-navy-50 border-2 border-brand-teal-200 rounded-xl md:rounded-2xl p-4 md:p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Buildings weight="duotone" className="w-5 h-5 text-brand-teal-600" />
            <h3 className="font-semibold text-brand-navy-500">KvK-nummer (optioneel)</h3>
          </div>
          <p className="text-sm text-gray-600">
            Vul je KvK-nummer in en we vullen automatisch je bedrijfsgegevens in
          </p>
          
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={kvkNummer}
                onChange={(e) => {
                  setKvkNummer(e.target.value.replace(/\D/g, ''))
                  setKvkError(null)
                  setKvkSuccess(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    fetchKvkData()
                  }
                }}
                placeholder="12345678"
                maxLength={8}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all text-brand-navy-500 font-medium"
                disabled={kvkLoading}
              />
            </div>
            <button
              type="button"
              onClick={fetchKvkData}
              disabled={kvkLoading || kvkNummer.length !== 8}
              className="px-4 md:px-6 py-3 bg-brand-teal-500 hover:bg-brand-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              {kvkLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="hidden md:inline">Zoeken...</span>
                </>
              ) : (
                <>
                  <MagnifyingGlass weight="bold" className="w-5 h-5" />
                  <span className="hidden md:inline">Opzoeken</span>
                </>
              )}
            </button>
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

      {/* Bedrijfsnaam */}
      <div>
        <Input
          label="Bedrijfsnaam"
          placeholder="Jouw bedrijf B.V."
          error={errors.bedrijfsnaam?.message}
          {...register('bedrijfsnaam')}
          required
        />
      </div>

      {/* Contactpersoon */}
      <div>
        <Input
          label="Contactpersoon"
          placeholder="Voor- en achternaam"
          error={errors.contactpersoon?.message}
          {...register('contactpersoon')}
          required
        />
      </div>

      {/* Email */}
      <div>
        <Input
          label="E-mailadres"
          type="email"
          placeholder="naam@bedrijf.nl"
          error={errors.email?.message}
          helpText="We sturen je advies hier naartoe"
          {...register('email')}
          required
        />
      </div>

      {/* Telefoon */}
      <div>
        <Input
          label="Telefoonnummer"
          type="tel"
          inputMode="tel"
          placeholder="06 12345678"
          error={errors.telefoon?.message}
          helpText="Voor eventuele vragen"
          {...register('telefoon')}
          required
        />
      </div>

      {/* Type bedrijf */}
      <div className="space-y-4">
        <label className="block text-sm md:text-base font-semibold text-gray-700">
          Type bedrijf <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { value: 'kantoor', label: 'Kantoor' },
            { value: 'retail', label: 'Retail' },
            { value: 'horeca', label: 'Horeca' },
            { value: 'productie', label: 'Productie' },
            { value: 'gezondheidszorg', label: 'Zorg' },
            { value: 'onderwijs', label: 'Onderwijs' },
            { value: 'overig', label: 'Overig' },
          ].map((option) => {
            const isSelected = typeBedrijf === option.value
            
            return (
              <label
                key={option.value}
                className={`
                  relative flex items-center justify-center p-3 md:p-4 rounded-xl md:rounded-2xl border-2 cursor-pointer transition-all duration-300
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
                <div className={`text-sm md:text-base font-semibold ${isSelected ? 'text-brand-teal-700' : 'text-gray-700'}`}>
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

      {/* Privacy notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck weight="duotone" className="w-5 h-5 text-brand-teal-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
            Je gegevens worden veilig opgeslagen en alleen gebruikt voor het verstrekken van een 
            energieadvies. We delen je gegevens niet met derden zonder jouw toestemming.
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <Button type="button" variant="ghost" size="lg" onClick={vorigeStap} className="w-full sm:flex-1 text-sm md:text-base">
          <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Vorige
        </Button>
        <Button type="submit" size="lg" className="w-full sm:flex-1 bg-brand-teal-500 hover:bg-brand-teal-600 text-sm md:text-base">
          Volgende stap
          <svg className="w-4 h-4 md:w-5 md:h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Button>
      </div>
    </form>
  )
}
