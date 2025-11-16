'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCalculatorStore } from '@/store/calculatorStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Buildings, User, Envelope, Phone } from '@phosphor-icons/react'

const bedrijfsgegevensSchema = z.object({
  bedrijfsnaam: z.string().min(2, 'Vul een geldige bedrijfsnaam in'),
  contactpersoon: z.string().min(2, 'Vul een naam in'),
  email: z.string().email('Vul een geldig e-mailadres in'),
  telefoon: z.string().regex(/^[\d\s\-+()]+$/, 'Vul een geldig telefoonnummer in'),
  typeBedrijf: z.enum(['retail', 'horeca', 'kantoor', 'productie', 'gezondheidszorg', 'onderwijs', 'overig']),
})

type BedrijfsgegevensFormData = z.infer<typeof bedrijfsgegevensSchema>

export function BedrijfsgegevensForm() {
  const { setBedrijfsgegevens, volgendeStap, vorigeStap } = useCalculatorStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BedrijfsgegevensFormData>({
    resolver: zodResolver(bedrijfsgegevensSchema),
    defaultValues: {
      typeBedrijf: 'kantoor',
    },
  })

  const typeBedrijf = watch('typeBedrijf')

  const onSubmit = (data: BedrijfsgegevensFormData) => {
    setBedrijfsgegevens(data)
    volgendeStap()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-teal-500 to-brand-teal-600 rounded-2xl flex items-center justify-center">
            <Buildings weight="duotone" className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-dark-900">
              Bedrijfsgegevens
            </h2>
            <p className="text-gray-600">Zodat we contact met je op kunnen nemen</p>
          </div>
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
          placeholder="06 12345678"
          error={errors.telefoon?.message}
          helpText="Voor eventuele vragen"
          {...register('telefoon')}
          required
        />
      </div>

      {/* Type bedrijf */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-700">
          Type bedrijf <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { value: 'kantoor', label: 'Kantoor', icon: '🏢' },
            { value: 'retail', label: 'Retail', icon: '🛍️' },
            { value: 'horeca', label: 'Horeca', icon: '🍽️' },
            { value: 'productie', label: 'Productie', icon: '🏭' },
            { value: 'gezondheidszorg', label: 'Zorg', icon: '🏥' },
            { value: 'onderwijs', label: 'Onderwijs', icon: '🎓' },
            { value: 'overig', label: 'Overig', icon: '📦' },
          ].slice(0, 6).map((option) => {
            const isSelected = typeBedrijf === option.value
            
            return (
              <label
                key={option.value}
                className={`
                  relative flex flex-col items-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300
                  ${isSelected 
                    ? 'border-brand-navy-500 bg-brand-navy-50 shadow-lg shadow-brand-navy-500/20' 
                    : 'border-gray-200 bg-white hover:border-brand-navy-300 hover:shadow-md'
                  }
                `}
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register('typeBedrijf')}
                  className="sr-only"
                />
                <div className="text-3xl mb-2">{option.icon}</div>
                <div className={`text-sm font-semibold ${isSelected ? 'text-brand-navy-700' : 'text-gray-700'}`}>
                  {option.label}
                </div>
                
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-navy-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
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
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
        <p className="text-sm text-gray-600">
          🔒 Je gegevens worden veilig opgeslagen en alleen gebruikt voor het verstrekken van een 
          energieadvies. We delen je gegevens niet met derden zonder jouw toestemming.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <Button type="button" variant="ghost" size="lg" onClick={vorigeStap} className="flex-1">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Vorige
        </Button>
        <Button type="submit" size="lg" className="flex-1">
          Volgende stap
          <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Button>
      </div>
    </form>
  )
}
