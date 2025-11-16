'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useCalculatorStore } from '@/store/calculatorStore'
import { Button } from '@/components/ui/Button'
import { Leaf, ClockClockwise, Lightning } from '@phosphor-icons/react'

const voorkeurenSchema = z.object({
  type: z.enum(['vast', 'dynamisch', 'beide']),
  looptijd: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(5)]),
  groeneEnergie: z.boolean(),
  opmerkingen: z.string().optional(),
})

type VoorkeurenFormData = z.infer<typeof voorkeurenSchema>

export function VoorkeurenForm() {
  const router = useRouter()
  const { setVoorkeuren, vorigeStap } = useCalculatorStore()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VoorkeurenFormData>({
    resolver: zodResolver(voorkeurenSchema),
    defaultValues: {
      type: 'beide',
      looptijd: 3,
      groeneEnergie: false,
    },
  })

  const type = watch('type')
  const looptijd = watch('looptijd')
  const groeneEnergie = watch('groeneEnergie')

  const onSubmit = (data: VoorkeurenFormData) => {
    setVoorkeuren(data)
    router.push('/calculator/resultaten')
  }

  const contractTypes = [
    {
      value: 'vast',
      icon: ClockClockwise,
      title: 'Vast contract',
      description: 'Zekerheid met een vaste prijs',
    },
    {
      value: 'dynamisch',
      icon: Lightning,
      title: 'Dynamisch',
      description: 'Profiteer van lage prijzen',
    },
    {
      value: 'beide',
      icon: Lightning,
      title: 'Beide opties',
      description: 'Laat mij adviseren',
    },
  ]

  const looptijden = [1, 2, 3, 5]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center">
            <Leaf weight="duotone" className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-dark-900">
              Voorkeuren
            </h2>
            <p className="text-gray-600">Wat past het beste bij jouw bedrijf?</p>
          </div>
        </div>
      </div>

      {/* Contract type */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-700">
          Type contract <span className="text-red-500">*</span>
        </label>
        <div className="grid md:grid-cols-3 gap-4">
          {contractTypes.map((option) => {
            const Icon = option.icon
            const isSelected = type === option.value
            
            return (
              <label
                key={option.value}
                className={`
                  relative flex flex-col p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300
                  ${isSelected 
                    ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-500/20' 
                    : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
                  }
                `}
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register('type')}
                  className="sr-only"
                />
                <Icon 
                  weight="duotone" 
                  className={`w-8 h-8 mb-3 ${isSelected ? 'text-primary-600' : 'text-gray-400'}`}
                />
                <div className="font-bold text-gray-900 mb-1">{option.title}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
                
                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
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

      {/* Looptijd */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-700">
          Gewenste looptijd <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-4 gap-3">
          {looptijden.map((jaar) => {
            const isSelected = looptijd === jaar
            
            return (
              <label
                key={jaar}
                className={`
                  relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300
                  ${isSelected 
                    ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-500/20' 
                    : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
                  }
                `}
              >
                <input
                  type="radio"
                  value={jaar}
                  {...register('looptijd', { valueAsNumber: true })}
                  className="sr-only"
                />
                <div className={`text-2xl font-bold mb-1 ${isSelected ? 'text-primary-600' : 'text-gray-900'}`}>
                  {jaar}
                </div>
                <div className="text-xs text-gray-600">jaar</div>
                
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
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

      {/* Groene energie */}
      <div className="bg-energy-50 border border-energy-200 rounded-2xl p-6">
        <label className="flex items-start gap-4 cursor-pointer group">
          <input
            type="checkbox"
            {...register('groeneEnergie')}
            className="mt-1 w-5 h-5 rounded border-2 border-energy-300 text-energy-600 focus:ring-energy-500 focus:ring-offset-2"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Leaf weight="duotone" className="w-5 h-5 text-energy-600" />
              <span className="text-base font-semibold text-energy-900">
                Ik wil graag groene energie
              </span>
            </div>
            <span className="text-sm text-energy-700">
              Kies voor 100% duurzame energie uit wind, zon of water. 
              Goed voor het milieu én vaak voordeliger dan je denkt.
            </span>
          </div>
        </label>
      </div>

      {/* Opmerkingen */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Opmerkingen of speciale wensen
        </label>
        <textarea
          {...register('opmerkingen')}
          rows={4}
          className="w-full rounded-xl border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 px-4 py-3 transition-all duration-200"
          placeholder="Zijn er nog specifieke zaken waar we rekening mee moeten houden?"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <Button type="button" variant="ghost" size="lg" onClick={vorigeStap} className="flex-1">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Vorige
        </Button>
        <Button type="submit" variant="secondary" size="lg" className="flex-1">
          Bekijk resultaten
          <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Button>
      </div>
    </form>
  )
}
